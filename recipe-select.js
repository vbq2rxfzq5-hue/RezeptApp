import { DOMBuilder } from '../dom-builder.js';
import { SecureStorage } from '../storage.js';
import { RecipeHelpers } from '../recipe-helpers.js';
import { Validator } from '../validator.js';

export class RecipeSelectView {
    constructor(router) {
        this.router = router;
        this.selected = new Map();
    }

    render() {
        const recipes = SecureStorage.loadRecipes();
        const container = DOMBuilder.createElement('div', { className: 'view active' });
        
        const header = DOMBuilder.createElement('header', { className: 'app-header' });
        const backBtn = DOMBuilder.createButton('← Zurück', 'back-btn');
        backBtn.addEventListener('click', () => this.router.navigateTo('shopping'));
        header.appendChild(backBtn);
        header.appendChild(DOMBuilder.createElement('h1', { textContent: 'Rezepte auswählen' }));
        container.appendChild(header);
        
        if (recipes.length === 0) {
            container.appendChild(DOMBuilder.createEmptyState('📖', 'Keine Rezepte', 'Füge zuerst Rezepte hinzu'));
        } else {
            const content = DOMBuilder.createElement('div');
            recipes.forEach(r => content.appendChild(this.createRecipeCard(r)));
            container.appendChild(content);
            
            const footer = DOMBuilder.createElement('div', { className: 'footer-actions' });
            const countText = DOMBuilder.createElement('p', {
                id: 'selected-count',
                textContent: `${this.selected.size} Rezepte ausgewählt`
            });
            const createBtn = DOMBuilder.createButton('Einkaufsliste erstellen', 'btn-primary');
            createBtn.addEventListener('click', () => this.createList());
            footer.appendChild(countText);
            footer.appendChild(createBtn);
            container.appendChild(footer);
        }
        
        return container;
    }

    createRecipeCard(recipe) {
        const isSelected = this.selected.has(recipe.id);
        const card = DOMBuilder.createElement('div', {
            className: `select-recipe-card ${isSelected ? 'selected' : ''}`
        });
        
        const header = DOMBuilder.createElement('div', { className: 'select-recipe-header' });
        header.appendChild(DOMBuilder.createElement('div', {
            className: 'checkbox',
            textContent: isSelected ? '✓' : ''
        }));
        header.appendChild(DOMBuilder.createElement('div', {
            className: 'select-recipe-name',
            textContent: recipe.name
        }));
        
        card.appendChild(header);
        
        if (isSelected) {
            const servings = this.selected.get(recipe.id);
            const control = DOMBuilder.createElement('div', { className: 'servings-control' });
            control.appendChild(DOMBuilder.createElement('div', {
                className: 'servings-label',
                textContent: 'Anzahl Personen:'
            }));
            
            const buttons = DOMBuilder.createElement('div', { className: 'servings-buttons' });
            const decreaseBtn = DOMBuilder.createButton('−', 'servings-btn');
            decreaseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (servings > 1) {
                    this.selected.set(recipe.id, servings - 1);
                    this.refresh();
                }
            });
            
            const input = DOMBuilder.createInput('number', {
                className: 'servings-input',
                value: String(servings),
                attributes: { min: '1', max: '100' }
            });
            input.addEventListener('change', (e) => {
                const val = Validator.validateServings(e.target.value);
                if (val.valid) {
                    this.selected.set(recipe.id, val.value);
                }
            });
            
            const increaseBtn = DOMBuilder.createButton('+', 'servings-btn');
            increaseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selected.set(recipe.id, servings + 1);
                this.refresh();
            });
            
            buttons.appendChild(decreaseBtn);
            buttons.appendChild(input);
            buttons.appendChild(increaseBtn);
            control.appendChild(buttons);
            card.appendChild(control);
        }
        
        header.addEventListener('click', () => {
            if (this.selected.has(recipe.id)) {
                this.selected.delete(recipe.id);
            } else {
                this.selected.set(recipe.id, recipe.servings);
            }
            this.refresh();
        });
        
        return card;
    }

    createList() {
        if (this.selected.size === 0) {
            DOMBuilder.showAlert('Bitte wähle mindestens ein Rezept aus');
            return;
        }
        
        const recipes = SecureStorage.loadRecipes();
        const ingredients = [];
        
        this.selected.forEach((servings, recipeId) => {
            const recipe = recipes.find(r => r.id === recipeId);
            if (recipe) {
                recipe.ingredients.forEach(ing => {
                    ingredients.push(RecipeHelpers.scaleIngredient(ing, recipe.servings, servings));
                });
            }
        });
        
        const merged = RecipeHelpers.mergeIngredients(ingredients);
        const list = {
            items: merged.map(i => ({ ...i, checked: false })),
            createdAt: new Date().toISOString()
        };
        
        SecureStorage.saveShoppingList(list);
        DOMBuilder.showAlert(`Einkaufsliste erstellt!\n${merged.length} Artikel hinzugefügt.`);
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
