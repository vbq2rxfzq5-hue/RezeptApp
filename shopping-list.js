/**
 * Shopping List View - Compact secure version
 */
import { DOMBuilder } from '../dom-builder.js';
import { SecureStorage } from '../storage.js';
import { RecipeHelpers } from '../recipe-helpers.js';

export class ShoppingListView {
    constructor(router) {
        this.router = router;
        this.sortType = 'none';
    }

    render() {
        const list = SecureStorage.loadShoppingList();
        const container = DOMBuilder.createElement('div', { id: 'shopping-view', className: 'view active' });
        
        const header = DOMBuilder.createElement('header', { className: 'app-header' });
        header.appendChild(DOMBuilder.createElement('h1', { textContent: 'Einkaufsliste' }));
        container.appendChild(header);
        
        const content = DOMBuilder.createElement('div', { id: 'shopping-content' });
        
        if (!list || list.items.length === 0) {
            const empty = DOMBuilder.createEmptyState('🛒', 'Keine Einkaufsliste', 'Wähle Rezepte aus');
            const btn = DOMBuilder.createButton('Rezepte auswählen', 'btn-primary');
            btn.addEventListener('click', () => this.router.navigateTo('recipe-select'));
            empty.appendChild(btn);
            content.appendChild(empty);
        } else {
            content.appendChild(this.createControls(list));
            content.appendChild(this.createProgress(list));
            content.appendChild(this.createItemsList(list));
        }
        
        container.appendChild(content);
        return container;
    }

    createControls(list) {
        const controls = DOMBuilder.createElement('div', { className: 'shopping-controls' });
        
        const sortBtn = DOMBuilder.createButton('Sortieren', 'sort-btn');
        sortBtn.addEventListener('click', () => this.showSortModal());
        
        const fridgeBtn = DOMBuilder.createButton('🧊', 'fridge-btn');
        fridgeBtn.addEventListener('click', () => this.router.navigateTo('fridge-check'));
        
        const archiveBtn = DOMBuilder.createButton('📊', 'archive-btn');
        archiveBtn.addEventListener('click', () => this.router.navigateTo('archive-create'));
        
        const deleteBtn = DOMBuilder.createButton('🗑️', 'delete-list-btn');
        deleteBtn.addEventListener('click', () => this.deleteList());
        
        controls.appendChild(sortBtn);
        controls.appendChild(fridgeBtn);
        controls.appendChild(archiveBtn);
        controls.appendChild(deleteBtn);
        
        return controls;
    }

    createProgress(list) {
        const progress = RecipeHelpers.calculateProgress(list.items);
        const container = DOMBuilder.createElement('div');
        
        const bar = DOMBuilder.createElement('div', { className: 'progress-bar' });
        const fill = DOMBuilder.createElement('div', { className: 'progress-fill' });
        fill.style.width = progress.percentage + '%';
        bar.appendChild(fill);
        
        const text = DOMBuilder.createElement('div', {
            className: 'progress-text',
            textContent: `${progress.checked} von ${progress.total} erledigt`
        });
        
        container.appendChild(bar);
        container.appendChild(text);
        return container;
    }

    createItemsList(list) {
        const container = DOMBuilder.createElement('div');
        const sorted = RecipeHelpers.sortShoppingList(list.items, this.sortType);
        
        if (this.sortType === 'category') {
            const grouped = RecipeHelpers.groupByCategory(sorted);
            grouped.forEach((items, category) => {
                const header = DOMBuilder.createElement('div', { className: 'section-header' });
                header.appendChild(DOMBuilder.createElement('div', {
                    className: 'section-header-title',
                    textContent: category
                }));
                container.appendChild(header);
                items.forEach(item => container.appendChild(this.createItem(item, list)));
            });
        } else {
            sorted.forEach(item => container.appendChild(this.createItem(item, list)));
        }
        
        return container;
    }

    createItem(item, list) {
        const el = DOMBuilder.createElement('div', {
            className: `shopping-item ${item.checked ? 'checked' : ''}`
        });
        
        const checkbox = DOMBuilder.createElement('div', {
            className: 'checkbox',
            textContent: item.checked ? '✓' : ''
        });
        
        const content = DOMBuilder.createElement('div', { className: 'shopping-item-content' });
        content.appendChild(DOMBuilder.createElement('div', {
            className: 'shopping-item-name',
            textContent: item.name
        }));
        const amount = typeof item.amount === 'number' ? `${item.amount} ${item.unit}` : item.amount;
        content.appendChild(DOMBuilder.createElement('div', {
            className: 'shopping-item-amount',
            textContent: amount
        }));
        
        el.appendChild(checkbox);
        el.appendChild(content);
        
        el.addEventListener('click', () => {
            item.checked = !item.checked;
            SecureStorage.saveShoppingList(list);
            this.refresh();
        });
        
        return el;
    }

    showSortModal() {
        // Simplified - could be modal
        const types = ['none', 'alphabetical', 'category'];
        const idx = types.indexOf(this.sortType);
        this.sortType = types[(idx + 1) % types.length];
        this.refresh();
    }

    deleteList() {
        if (DOMBuilder.showConfirm('Einkaufsliste löschen?')) {
            SecureStorage.clearShoppingList();
            this.router.navigateTo('shopping');
        }
    }

    refresh() {
        const container = document.getElementById('shopping-view');
        if (container) {
            const newContent = this.render();
            container.parentNode.replaceChild(newContent, container);
        }
    }
}
