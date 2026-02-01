/**
 * Recipe Detail View
 */

import { DOMBuilder } from '../dom-builder.js';
import { SecureStorage } from '../storage.js';

export class RecipeDetailView {
    constructor(router) {
        this.router = router;
    }

    render(data) {
        const recipes = SecureStorage.loadRecipes();
        const recipe = recipes.find(r => r.id === data.recipeId);
        
        if (!recipe) {
            return DOMBuilder.createEmptyState('❌', 'Rezept nicht gefunden', '');
        }
        
        const container = DOMBuilder.createElement('div', {
            id: 'recipe-detail-view',
            className: 'view active'
        });
        
        // Header with back button
        const header = DOMBuilder.createElement('header', { className: 'app-header' });
        
        const backBtn = DOMBuilder.createButton('← Zurück', 'back-btn');
        backBtn.addEventListener('click', () => this.router.navigateTo('recipes'));
        
        const title = DOMBuilder.createElement('h1', { textContent: 'Rezept' });
        
        const editBtn = DOMBuilder.createButton('✏️', 'edit-btn');
        editBtn.addEventListener('click', () => this.router.navigateTo('recipe-edit', { recipeId: recipe.id }));
        
        const deleteBtn = DOMBuilder.createButton('🗑️', 'delete-btn');
        deleteBtn.addEventListener('click', () => this.handleDelete(recipe.id));
        
        header.appendChild(backBtn);
        header.appendChild(title);
        header.appendChild(editBtn);
        header.appendChild(deleteBtn);
        
        container.appendChild(header);
        
        // Content
        const content = DOMBuilder.createElement('div', { className: 'recipe-detail' });
        
        if (recipe.image) {
            const img = DOMBuilder.createImage(recipe.image, recipe.name, 'recipe-detail-image');
            content.appendChild(img);
        }
        
        const detailContent = DOMBuilder.createElement('div', { className: 'recipe-detail-content' });
        
        detailContent.appendChild(DOMBuilder.createElement('h2', {
            className: 'recipe-detail-title',
            textContent: recipe.name
        }));
        
        detailContent.appendChild(DOMBuilder.createElement('p', {
            className: 'recipe-detail-servings',
            textContent: `👥 Für ${recipe.servings} Personen`
        }));
        
        // Ingredients section
        const ingredientsSection = DOMBuilder.createElement('div', { className: 'section' });
        ingredientsSection.appendChild(DOMBuilder.createElement('h3', {
            className: 'section-title',
            textContent: 'Zutaten'
        }));
        
        recipe.ingredients.forEach(ing => {
            const item = DOMBuilder.createElement('div', { className: 'ingredient-item' });
            item.appendChild(DOMBuilder.createElement('span', {
                className: 'ingredient-amount-detail',
                textContent: `${ing.amount} ${ing.unit}`
            }));
            item.appendChild(DOMBuilder.createElement('span', {
                className: 'ingredient-name-detail',
                textContent: ing.name
            }));
            ingredientsSection.appendChild(item);
        });
        
        detailContent.appendChild(ingredientsSection);
        
        // Instructions
        if (recipe.instructions) {
            const instructionsSection = DOMBuilder.createElement('div', { className: 'section' });
            instructionsSection.appendChild(DOMBuilder.createElement('h3', {
                className: 'section-title',
                textContent: 'Zubereitung'
            }));
            instructionsSection.appendChild(DOMBuilder.createElement('p', {
                className: 'instructions-text',
                textContent: recipe.instructions
            }));
            detailContent.appendChild(instructionsSection);
        }
        
        content.appendChild(detailContent);
        container.appendChild(content);
        
        return container;
    }

    handleDelete(recipeId) {
        if (!DOMBuilder.showConfirm('Möchtest du dieses Rezept wirklich löschen?')) {
            return;
        }
        
        const recipes = SecureStorage.loadRecipes();
        const filtered = recipes.filter(r => r.id !== recipeId);
        SecureStorage.saveRecipes(filtered);
        
        this.router.navigateTo('recipes');
    }
}
