/**
 * Improved Fridge Check View
 * Shows shopping list items, select what you have, enter amounts
 */

import { DOMBuilder } from '../dom-builder.js';
import { SecureStorage } from '../storage.js';
import { RecipeHelpers } from '../recipe-helpers.js';
import { Validator } from '../validator.js';

export class FridgeCheckView {
    constructor(router) {
        this.router = router;
        this.selectedItems = new Map();
    }

    render() {
        const list = SecureStorage.loadShoppingList();
        
        if (!list || list.items.length === 0) {
            const container = DOMBuilder.createElement('div', { className: 'view active' });
            container.appendChild(DOMBuilder.createEmptyState(
                '🛒',
                'Keine Einkaufsliste',
                'Erstelle erst eine Einkaufsliste'
            ));
            return container;
        }
        
        const container = DOMBuilder.createElement('div', { className: 'view active' });
        
        const header = DOMBuilder.createElement('header', { className: 'app-header' });
        const backBtn = DOMBuilder.createButton('← Zurück', 'back-btn');
        backBtn.addEventListener('click', () => this.router.navigateTo('shopping'));
        header.appendChild(backBtn);
        header.appendChild(DOMBuilder.createElement('h1', { textContent: 'Kühlschrank Check' }));
        container.appendChild(header);
        
        const content = DOMBuilder.createElement('div', { className: 'form-container' });
        
        const infoBox = DOMBuilder.createElement('div', { className: 'info-box' });
        infoBox.appendChild(DOMBuilder.createElement('h3', { textContent: 'Was hast du bereits?' }));
        infoBox.appendChild(DOMBuilder.createElement('p', {
            textContent: 'Wähle die Artikel aus, die du schon hast, und gib die Menge ein.'
        }));
        content.appendChild(infoBox);
        
        // Show all shopping list items
        const itemsContainer = DOMBuilder.createElement('div', { id: 'fridge-items-container' });
        
        list.items.forEach((item, index) => {
            const itemCard = this.createItemCard(item, index);
            itemsContainer.appendChild(itemCard);
        });
        
        content.appendChild(itemsContainer);
        
        const applyBtn = DOMBuilder.createButton('Kühlschrank-Check anwenden', 'btn-primary');
        applyBtn.addEventListener('click', () => this.applyCheck());
        content.appendChild(applyBtn);
        
        container.appendChild(content);
        
        return container;
    }

    createItemCard(item, index) {
        const isSelected = this.selectedItems.has(index);
        
        const card = DOMBuilder.createElement('div', {
            className: `fridge-item-card ${isSelected ? 'selected' : ''}`
        });
        
        const header = DOMBuilder.createElement('div', { className: 'fridge-item-header' });
        
        const checkbox = DOMBuilder.createElement('div', {
            className: 'checkbox',
            textContent: isSelected ? '✓' : ''
        });
        
        const info = DOMBuilder.createElement('div', { className: 'fridge-item-info' });
        info.appendChild(DOMBuilder.createElement('div', {
            className: 'fridge-item-name',
            textContent: item.name
        }));
        
        const neededAmount = typeof item.amount === 'number' 
            ? `Benötigt: ${item.amount} ${item.unit}`
            : `Benötigt: ${item.amount}`;
        
        info.appendChild(DOMBuilder.createElement('div', {
            className: 'fridge-item-needed',
            textContent: neededAmount
        }));
        
        header.appendChild(checkbox);
        header.appendChild(info);
        card.appendChild(header);
        
        // Click to select/deselect
        header.addEventListener('click', () => {
            if (this.selectedItems.has(index)) {
                this.selectedItems.delete(index);
            } else {
                this.selectedItems.set(index, item.amount);
            }
            this.refresh();
        });
        
        // If selected, show amount input
        if (isSelected && typeof item.amount === 'number') {
            const amountControl = DOMBuilder.createElement('div', {
                className: 'fridge-amount-control'
            });
            
            amountControl.appendChild(DOMBuilder.createElement('label', {
                textContent: `Menge die du hast (${item.unit}):`
            }));
            
            const currentAmount = this.selectedItems.get(index);
            
            const amountInput = DOMBuilder.createInput('number', {
                className: 'fridge-amount-input',
                value: String(currentAmount),
                attributes: {
                    step: '0.1',
                    min: '0',
                    max: String(item.amount * 2)
                }
            });
            
            amountInput.addEventListener('change', (e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0) {
                    this.selectedItems.set(index, val);
                }
            });
            
            amountInput.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            amountControl.appendChild(amountInput);
            card.appendChild(amountControl);
        }
        
        return card;
    }

    applyCheck() {
        const list = SecureStorage.loadShoppingList();
        if (!list) return;
        
        if (this.selectedItems.size === 0) {
            if (DOMBuilder.showConfirm('Keine Artikel ausgewählt. Fortfahren ohne Kühlschrank-Check?')) {
                this.router.navigateTo('shopping');
            }
            return;
        }
        
        let removedCount = 0;
        let reducedCount = 0;
        
        const updatedItems = [];
        
        list.items.forEach((item, index) => {
            if (this.selectedItems.has(index)) {
                const fridgeAmount = this.selectedItems.get(index);
                
                if (typeof item.amount === 'number' && typeof fridgeAmount === 'number') {
                    const remaining = item.amount - fridgeAmount;
                    
                    if (remaining <= 0) {
                        removedCount++;
                        // Don't add to list
                    } else {
                        item.amount = Math.round(remaining * 100) / 100;
                        updatedItems.push(item);
                        reducedCount++;
                    }
                } else {
                    // Can't subtract, remove completely
                    removedCount++;
                }
            } else {
                updatedItems.push(item);
            }
        });
        
        list.items = updatedItems;
        SecureStorage.saveShoppingList(list);
        
        let message = 'Kühlschrank-Check abgeschlossen!';
        if (removedCount > 0) message += `\n${removedCount} Artikel entfernt.`;
        if (reducedCount > 0) message += `\n${reducedCount} Artikel reduziert.`;
        
        DOMBuilder.showAlert(message);
        this.router.navigateTo('shopping');
    }

    refresh() {
        const container = document.querySelector('.view.active');
        if (container) {
            const newContent = this.render();
            container.parentNode.replaceChild(newContent, container);
        }
    }
}
