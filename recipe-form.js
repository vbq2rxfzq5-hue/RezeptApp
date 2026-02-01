/**
 * Recipe Form View - Secure image upload and validation
 */

import { DOMBuilder } from '../dom-builder.js';
import { Validator } from '../validator.js';
import { Sanitizer } from '../sanitizer.js';
import { SecureStorage } from '../storage.js';
import { RecipeHelpers } from '../recipe-helpers.js';
import { UNITS } from '../config.js';

export class RecipeFormView {
    constructor(router) {
        this.router = router;
        this.imageData = null;
        this.ingredientRows = [];
    }

    render() {
        const container = DOMBuilder.createElement('div', {
            id: 'recipe-form-view',
            className: 'view active'
        });
        
        const header = DOMBuilder.createElement('header', { className: 'app-header' });
        const backBtn = DOMBuilder.createButton('← Zurück', 'back-btn');
        backBtn.addEventListener('click', () => this.router.navigateTo('recipes'));
        header.appendChild(backBtn);
        header.appendChild(DOMBuilder.createElement('h1', { textContent: 'Rezept hinzufügen' }));
        container.appendChild(header);
        
        const formContainer = DOMBuilder.createElement('div', { className: 'form-container' });
        const form = this.createForm();
        formContainer.appendChild(form);
        container.appendChild(formContainer);
        
        return container;
    }

    createForm() {
        const form = DOMBuilder.createElement('form', { id: 'recipe-form' });
        
        // Name
        const nameInput = DOMBuilder.createInput('text', {
            id: 'recipe-name',
            placeholder: 'z.B. Spaghetti Carbonara',
            attributes: { required: true }
        });
        form.appendChild(DOMBuilder.createFormGroup('Rezeptname *', nameInput));
        
        // Servings
        const servingsInput = DOMBuilder.createInput('number', {
            id: 'recipe-servings',
            value: '4',
            attributes: { required: true, min: '1', max: '100' }
        });
        form.appendChild(DOMBuilder.createFormGroup('Anzahl Personen *', servingsInput));
        
        // Image
        const imageInput = DOMBuilder.createInput('file', {
            id: 'recipe-image',
            attributes: { accept: 'image/jpeg,image/jpg,image/png,image/webp' }
        });
        const imagePreview = DOMBuilder.createElement('div', { id: 'image-preview', className: 'image-preview' });
        const imageGroup = DOMBuilder.createFormGroup('Rezeptbild', imageInput);
        imageGroup.appendChild(imagePreview);
        form.appendChild(imageGroup);
        
        imageInput.addEventListener('change', (e) => this.handleImageSelect(e, imagePreview));
        
        // Ingredients
        const ingredientsLabel = DOMBuilder.createElement('label', { textContent: 'Zutaten *' });
        const ingredientsContainer = DOMBuilder.createElement('div', { id: 'ingredients-container' });
        const addIngredientBtn = DOMBuilder.createButton('+ Zutat hinzufügen', 'btn-secondary');
        addIngredientBtn.type = 'button';
        addIngredientBtn.addEventListener('click', () => this.addIngredientRow(ingredientsContainer));
        
        form.appendChild(ingredientsLabel);
        form.appendChild(ingredientsContainer);
        form.appendChild(addIngredientBtn);
        
        // Add first ingredient row
        this.addIngredientRow(ingredientsContainer);
        
        // Instructions
        const instructionsTextarea = DOMBuilder.createElement('textarea', {
            id: 'recipe-instructions',
            placeholder: 'Beschreibe die Zubereitungsschritte...',
            attributes: { rows: '6' }
        });
        form.appendChild(DOMBuilder.createFormGroup('Zubereitung', instructionsTextarea));
        
        // Submit
        const submitBtn = DOMBuilder.createButton('Rezept speichern', 'btn-primary');
        submitBtn.type = 'submit';
        form.appendChild(submitBtn);
        
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        return form;
    }

    addIngredientRow(container) {
        const row = DOMBuilder.createElement('div', { className: 'ingredient-row' });
        
        const amountInput = DOMBuilder.createInput('number', {
            className: 'ingredient-amount',
            placeholder: 'Menge',
            attributes: { step: '0.1', min: '0', required: true }
        });
        
        const unitSelect = DOMBuilder.createSelect(UNITS, 'g', 'ingredient-unit');
        
        const nameInput = DOMBuilder.createInput('text', {
            className: 'ingredient-name',
            placeholder: 'Zutat',
            attributes: { required: true }
        });
        
        row.appendChild(amountInput);
        row.appendChild(unitSelect);
        row.appendChild(nameInput);
        
        if (this.ingredientRows.length > 0) {
            const removeBtn = DOMBuilder.createButton('✕', 'remove-ingredient');
            removeBtn.type = 'button';
            removeBtn.addEventListener('click', () => container.removeChild(row));
            row.appendChild(removeBtn);
        }
        
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
        
        const recipe = {
            id: RecipeHelpers.generateId(),
            name: nameVal.value,
            servings: servingsVal.value,
            image: this.imageData,
            ingredients,
            instructions: instructions.trim()
        };
        
        const validation = Validator.validateRecipe(recipe);
        if (!validation.valid) {
            DOMBuilder.showAlert(validation.errors.join('\n'));
            return;
        }
        
        const recipes = SecureStorage.loadRecipes();
        recipes.push(Sanitizer.sanitizeRecipe(recipe));
        const result = SecureStorage.saveRecipes(recipes);
        
        if (!result.success) {
            DOMBuilder.showAlert('Fehler beim Speichern: ' + result.error);
            return;
        }
        
        DOMBuilder.showAlert('Rezept wurde gespeichert!');
        this.router.navigateTo('recipes');
    }
}
