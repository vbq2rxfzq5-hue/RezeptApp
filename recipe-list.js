/**
 * Recipe List View
 * Displays all recipes with secure DOM manipulation
 */

import { DOMBuilder } from '../dom-builder.js';
import { SecureStorage } from '../storage.js';

export class RecipeListView {
    constructor(router) {
        this.router = router;
        this.recipes = [];
    }

    /**
     * Render the recipe list view
     */
    render() {
        // Load recipes from storage
        this.recipes = SecureStorage.loadRecipes();
        
        // Create main container
        const container = DOMBuilder.createElement('div', {
            id: 'recipes-view',
            className: 'view active'
        });
        
        // Create header
        const header = this.createHeader();
        container.appendChild(header);
        
        // Create recipes container
        const recipesContainer = DOMBuilder.createElement('div', {
            className: 'recipes-list'
        });
        
        if (this.recipes.length === 0) {
            const emptyState = DOMBuilder.createEmptyState(
                '🍳',
                'Keine Rezepte vorhanden',
                'Füge dein erstes Rezept hinzu!'
            );
            recipesContainer.appendChild(emptyState);
        } else {
            this.recipes.forEach(recipe => {
                const recipeCard = this.createRecipeCard(recipe);
                recipesContainer.appendChild(recipeCard);
            });
        }
        
        container.appendChild(recipesContainer);
        
        // Create FAB button
        const fab = this.createFAB();
        container.appendChild(fab);
        
        return container;
    }

    /**
     * Create header
     */
    createHeader() {
        return DOMBuilder.createElement('header', {
            className: 'app-header',
            children: [
                DOMBuilder.createElement('h1', {
                    textContent: 'Meine Rezepte'
                })
            ]
        });
    }

    /**
     * Create recipe card
     */
    createRecipeCard(recipe) {
        const card = DOMBuilder.createElement('div', {
            className: 'recipe-card',
            dataset: { id: recipe.id }
        });
        
        // Add image or placeholder
        if (recipe.image) {
            const img = DOMBuilder.createImage(
                recipe.image,
                recipe.name,
                'recipe-image'
            );
            card.appendChild(img);
        } else {
            const placeholder = DOMBuilder.createElement('div', {
                className: 'recipe-placeholder',
                textContent: '🍳'
            });
            card.appendChild(placeholder);
        }
        
        // Create info section
        const info = DOMBuilder.createElement('div', {
            className: 'recipe-info'
        });
        
        const name = DOMBuilder.createElement('div', {
            className: 'recipe-name',
            textContent: recipe.name
        });
        
        const servings = DOMBuilder.createElement('div', {
            className: 'recipe-meta',
            textContent: `👥 ${recipe.servings} Personen`
        });
        
        const ingredientsCount = DOMBuilder.createElement('div', {
            className: 'recipe-meta',
            textContent: `📝 ${recipe.ingredients.length} Zutaten`
        });
        
        info.appendChild(name);
        info.appendChild(servings);
        info.appendChild(ingredientsCount);
        
        card.appendChild(info);
        
        // Add click handler
        card.addEventListener('click', () => {
            this.router.navigateTo('recipe-detail', { recipeId: recipe.id });
        });
        
        return card;
    }

    /**
     * Create FAB button
     */
    createFAB() {
        const fab = DOMBuilder.createButton('+', 'fab', {
            ariaLabel: 'Rezept hinzufügen'
        });
        
        fab.addEventListener('click', () => {
            this.router.navigateTo('recipe-form');
        });
        
        return fab;
    }

    /**
     * Refresh view
     */
    refresh() {
        const container = document.getElementById('recipes-view');
        if (container) {
            const newContent = this.render();
            container.parentNode.replaceChild(newContent, container);
        }
    }
}
