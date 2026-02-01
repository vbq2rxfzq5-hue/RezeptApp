/**
 * Recipe Edit View - Edit existing recipes
 */

import { DOMBuilder } from '../dom-builder.js';
import { Validator } from '../validator.js';
import { Sanitizer } from '../sanitizer.js';
import { SecureStorage } from '../storage.js';
import { UNITS } from '../config.js';

export class RecipeEditView {
    constructor(router) {
        this.router = router;
        this.recipe = null;
        this.imageData = null;
        this.ingredientRows = [];
    }

    render(data) {
        const recipes = SecureStorage.loadRecipes();
        this.recipe = recipes.find(r => r.id === data.recipeId);
        
        if (!this.recipe) {
            return DOMBuilder.createEmptyState('❌', 'Rezept nicht gefunden', '');
        }
        
        this.imageData = this.recipe.image;
        
        const container = DOMBuilder.createElement('div', {
            id: 'recipe-edit-view',
            className: 'view active'
        });
        
        const header = DOMBuilder.createElement('header', { className: 'app-header' });
        const backBtn = DOMBuilder.createButton('← Zurück', 'back-btn');
        backBtn.addEventListener('click', () => this.router.navigateTo('recipe-detail', { recipeId: this.recipe.id }));
        header.appendChild(backBtn);
        header.appendChild(DOMBuilder.createElement('h1', { textContent: 'Rezept bearbeiten' }));
        container.appendChild(header);
        
        const formContainer = DOMBuilder.createElement('div', { className: 'form-container' });
        const form = this.createForm();
        formContainer.appendChild(form);
        container.appendChild(formContainer);
        
        return container;
    }

    createForm() {
        const form = DOMBuilder.createElement('form', { id: 'recipe-edit-form' });
        
        // Name
        const nameInput = DOMBuilder.createInput('text', {
            id: 'recipe-name',
            value: this.recipe.name,
            attributes: { required: true }
        });
        form.appendChild(DOMBuilder.createFormGroup('Rezeptname *', nameInput));
        
        // Servings
        const servingsInput = DOMBuilder.createInput('number', {
            id: 'recipe-servings',
            value: String(this.recipe.servings),
            attributes: { required: true, min: '1', max: '100' }
        });
        form.appendChild(DOMBuilder.createFormGroup('Anzahl Personen *', servingsInput));
        
        // Image
        const imageInput = DOMBuilder.createInput('file', {
            id: 'recipe-image',
            attributes: { accept: 'image/jpeg,image/jpg,image/png,image/webp' }
        });
        const imagePreview = DOMBuilder.createElement('div', { id: 'image-preview', className: 'image-preview' });
        
        if (this.recipe.image) {
            const img = DOMBuilder.createImage(this.recipe.image, this.recipe.name, '');
            imagePreview.appendChild(img);
            imagePreview.classList.add('active');
        }
        
        const imageGroup = DOMBuilder.createFormGroup('Rezeptbild', imageInput);
        imageGroup.appendChild(imagePreview);
        form.appendChild(imageGroup);
        
        imageInput.addEventListener('change', (e) => this.handleImageSelect(e, imagePreview));
        
        // Ingredients
        const ingredientsLabel = DOMBuilder.createElement('label', { textContent: 'Zutaten *' });
        const ingredientsContainer = DOMBuilder.createElement('div', { id: 'ingredients-container' });
        
        // Add existing ingredients
        this.recipe.ingredients.forEach(ing => {
            this.addIngredientRow(ingredientsContainer, ing);
        });
        
        const addIngredientBtn = DOMBuilder.createButton('+ Zutat hinzufügen', 'btn-secondary');
        addIngredientBtn.type = 'button';
        addIngredientBtn.addEventListener('click', () => this.addIngredientRow(ingredientsContainer));
        
        form.appendChild(ingredientsLabel);
        form.appendChild(ingredientsContainer);
        form.appendChild(addIngredientBtn);
        
        // Instructions
        const instructionsTextarea = DOMBuilder.createElement('textarea', {
            id: 'recipe-instructions',
            value: this.recipe.instructions || '',
            attributes: { rows: '6' }
        });
        instructionsTextarea.value = this.recipe.instructions || '';
        form.appendChild(DOMBuilder.createFormGroup('Zubereitung', instructionsTextarea));
        
        // Submit
        const submitBtn = DOMBuilder.createButton('Änderungen speichern', 'btn-primary');
        submitBtn.type = 'submit';
        form.appendChild(submitBtn);
        
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        return form;
    }

    addIngredientRow(container, ingredient = null) {
        const row = DOMBuilder.createElement('div', { className: 'ingredient-row' });
        
        const amountInput = DOMBuilder.createInput('number', {
            className: 'ingredient-amount',
            value: ingredient ? String(ingredient.amount) : '',
            attributes: { step: '0.1', min: '0', required: true }
        });
        
        const unitSelect = DOMBuilder.createSelect(
            UNITS, 
            ingredient ? ingredient.unit : 'g', 
            'ingredient-unit'
        );
        
        const nameInput = DOMBuilder.createInput('text', {
            className: 'ingredient-name',
            value: ingredient ? ingredient.name : '',
            attributes: { required: true }
        });
        
        row.appendChild(amountInput);
        row.appendChild(unitSelect);
        row.appendChild(nameInput);
        
        const removeBtn = DOMBuilder.createButton('✕', 'remove-ingredient');
        removeBtn.type = 'button';
        removeBtn.addEventListener('click', () => {
            container.removeChild(row);
            const index = this.ingredientRows.indexOf(row);
            if (index > -1) {
                this.ingredientRows.splice(index, 1);
            }
        });
        row.appendChild(removeBtn);
        
        container.appendChild(row);
        this.ingredientRows.push(row);
    }

    handleImageSelect(e, previewContainer) {
        const file = e.target.files[0];
        if (!file) return;
        
        const validation = Validator.validateImageFile(file);
        if (!validation.valid) {
            DOMBuilder.showAlert(validation.error);
            e.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataURL = event.target.result;
            const validatedURL = Sanitizer.validateImageDataURL(dataURL);
            
            if (!validatedURL) {
                DOMBuilder.showAlert('Ungültiges Bildformat');
                return;
            }
            
            this.imageData = validatedURL;
            DOMBuilder.clearElement(previewContainer);
            const img = DOMBuilder.createImage(validatedURL, 'Rezeptbild', '');
            previewContainer.appendChild(img);
            previewContainer.classList.add('active');
        };
        reader.readAsDataURL(file);
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('recipe-name').value;
        const servings = document.getElementById('recipe-servings').value;
        const instructions = document.getElementById('recipe-instructions').value;
        
        // Validate
        const nameVal = Validator.validateRecipeName(name);
        if (!nameVal.valid) {
            DOMBuilder.showAlert(nameVal.error);
            return;
        }
        
        const servingsVal = Validator.validateServings(servings);
        if (!servingsVal.valid) {
            DOMBuilder.showAlert(servingsVal.error);
            return;
        }
        
        // Get ingredients
        const ingredients = [];
        const rows = document.querySelectorAll('.ingredient-row');
        
        for (const row of rows) {
            const amount = row.querySelector('.ingredient-amount').value;
            const unit = row.querySelector('.ingredient-unit').value;
            const ingName = row.querySelector('.ingredient-name').value;
            
            const amountVal = Validator.validateAmount(amount);
            const unitVal = Validator.validateUnit(unit);
            const nameIngVal = Validator.validateIngredientName(ingName);
            
            if (!amountVal.valid || !unitVal.valid || !nameIngVal.valid) {
                DOMBuilder.showAlert('Bitte überprüfe die Zutaten');
                return;
            }
            
            ingredients.push({
                amount: amountVal.value,
                unit: unitVal.value,
                name: nameIngVal.value
            });
        }
        
        if (ingredients.length === 0) {
            DOMBuilder.showAlert('Bitte füge mindestens eine Zutat hinzu');
            return;
        }
        
        const updatedRecipe = {
            id: this.recipe.id,
            name: nameVal.value,
            servings: servingsVal.value,
            image: this.imageData,
            ingredients,
            instructions: instructions.trim()
        };
        
        const validation = Validator.validateRecipe(updatedRecipe);
        if (!validation.valid) {
            DOMBuilder.showAlert(validation.errors.join('\n'));
            return;
        }
        
        const recipes = SecureStorage.loadRecipes();
        const index = recipes.findIndex(r => r.id === this.recipe.id);
        
        if (index === -1) {
            DOMBuilder.showAlert('Rezept nicht gefunden');
            return;
        }
        
        recipes[index] = Sanitizer.sanitizeRecipe(updatedRecipe);
        const result = SecureStorage.saveRecipes(recipes);
        
        if (!result.success) {
            DOMBuilder.showAlert('Fehler beim Speichern: ' + result.error);
            return;
        }
        
        DOMBuilder.showAlert('Änderungen gespeichert!');
        this.router.navigateTo('recipe-detail', { recipeId: this.recipe.id });
    }
}
