/**
 * Input Validator
 * Validates and sanitizes all user inputs before processing
 */

import { SECURITY_CONFIG, UNITS } from './config.js';

export class Validator {
    /**
     * Validate recipe name
     */
    static validateRecipeName(name) {
        if (typeof name !== 'string') {
            return { valid: false, error: 'Rezeptname muss ein Text sein' };
        }
        
        const trimmed = name.trim();
        
        if (trimmed.length === 0) {
            return { valid: false, error: 'Rezeptname darf nicht leer sein' };
        }
        
        if (trimmed.length > SECURITY_CONFIG.MAX_RECIPE_NAME_LENGTH) {
            return { valid: false, error: `Rezeptname zu lang (max ${SECURITY_CONFIG.MAX_RECIPE_NAME_LENGTH} Zeichen)` };
        }
        
        if (!SECURITY_CONFIG.PATTERNS.RECIPE_NAME.test(trimmed)) {
            return { valid: false, error: 'Rezeptname enthält ungültige Zeichen' };
        }
        
        return { valid: true, value: trimmed };
    }

    /**
     * Validate servings number
     */
    static validateServings(servings) {
        const num = parseInt(servings, 10);
        
        if (isNaN(num)) {
            return { valid: false, error: 'Personenanzahl muss eine Zahl sein' };
        }
        
        if (num < SECURITY_CONFIG.MIN_SERVINGS) {
            return { valid: false, error: `Mindestens ${SECURITY_CONFIG.MIN_SERVINGS} Person` };
        }
        
        if (num > SECURITY_CONFIG.MAX_SERVINGS) {
            return { valid: false, error: `Maximal ${SECURITY_CONFIG.MAX_SERVINGS} Personen` };
        }
        
        return { valid: true, value: num };
    }

    /**
     * Validate ingredient name
     */
    static validateIngredientName(name) {
        if (typeof name !== 'string') {
            return { valid: false, error: 'Zutat muss ein Text sein' };
        }
        
        const trimmed = name.trim();
        
        if (trimmed.length === 0) {
            return { valid: false, error: 'Zutat darf nicht leer sein' };
        }
        
        if (trimmed.length > SECURITY_CONFIG.MAX_INGREDIENT_NAME_LENGTH) {
            return { valid: false, error: `Zutat zu lang (max ${SECURITY_CONFIG.MAX_INGREDIENT_NAME_LENGTH} Zeichen)` };
        }
        
        if (!SECURITY_CONFIG.PATTERNS.INGREDIENT_NAME.test(trimmed)) {
            return { valid: false, error: 'Zutat enthält ungültige Zeichen' };
        }
        
        return { valid: true, value: trimmed };
    }

    /**
     * Validate ingredient amount
     */
    static validateAmount(amount) {
        const num = parseFloat(amount);
        
        if (isNaN(num)) {
            return { valid: false, error: 'Menge muss eine Zahl sein' };
        }
        
        if (num <= 0) {
            return { valid: false, error: 'Menge muss größer als 0 sein' };
        }
        
        if (num > SECURITY_CONFIG.MAX_INGREDIENT_AMOUNT) {
            return { valid: false, error: `Menge zu groß (max ${SECURITY_CONFIG.MAX_INGREDIENT_AMOUNT})` };
        }
        
        // Round to 2 decimal places
        return { valid: true, value: Math.round(num * 100) / 100 };
    }

    /**
     * Validate unit
     */
    static validateUnit(unit) {
        if (!UNITS.includes(unit)) {
            return { valid: false, error: 'Ungültige Einheit' };
        }
        
        return { valid: true, value: unit };
    }

    /**
     * Validate instructions
     */
    static validateInstructions(instructions) {
        if (typeof instructions !== 'string') {
            return { valid: false, error: 'Anleitung muss ein Text sein' };
        }
        
        const trimmed = instructions.trim();
        
        if (trimmed.length > SECURITY_CONFIG.MAX_INSTRUCTIONS_LENGTH) {
            return { valid: false, error: `Anleitung zu lang (max ${SECURITY_CONFIG.MAX_INSTRUCTIONS_LENGTH} Zeichen)` };
        }
        
        return { valid: true, value: trimmed };
    }

    /**
     * Validate image file
     */
    static validateImageFile(file) {
        if (!(file instanceof File)) {
            return { valid: false, error: 'Ungültige Datei' };
        }
        
        // Check file type
        if (SECURITY_CONFIG.BLOCKED_IMAGE_TYPES.includes(file.type)) {
            return { valid: false, error: 'SVG-Dateien sind aus Sicherheitsgründen nicht erlaubt' };
        }
        
        if (!SECURITY_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return { valid: false, error: 'Nur JPG, PNG und WebP Bilder sind erlaubt' };
        }
        
        // Check file size
        if (file.size > SECURITY_CONFIG.MAX_IMAGE_SIZE) {
            const maxMB = SECURITY_CONFIG.MAX_IMAGE_SIZE / (1024 * 1024);
            return { valid: false, error: `Bild zu groß (max ${maxMB}MB)` };
        }
        
        return { valid: true, value: file };
    }

    /**
     * Validate entire recipe object
     */
    static validateRecipe(recipe) {
        const errors = [];
        
        // Validate name
        const nameValidation = this.validateRecipeName(recipe.name);
        if (!nameValidation.valid) {
            errors.push(nameValidation.error);
        }
        
        // Validate servings
        const servingsValidation = this.validateServings(recipe.servings);
        if (!servingsValidation.valid) {
            errors.push(servingsValidation.error);
        }
        
        // Validate instructions if present
        if (recipe.instructions) {
            const instructionsValidation = this.validateInstructions(recipe.instructions);
            if (!instructionsValidation.valid) {
                errors.push(instructionsValidation.error);
            }
        }
        
        // Validate ingredients
        if (!Array.isArray(recipe.ingredients)) {
            errors.push('Zutaten müssen ein Array sein');
        } else if (recipe.ingredients.length === 0) {
            errors.push('Mindestens eine Zutat erforderlich');
        } else if (recipe.ingredients.length > SECURITY_CONFIG.MAX_INGREDIENTS_COUNT) {
            errors.push(`Zu viele Zutaten (max ${SECURITY_CONFIG.MAX_INGREDIENTS_COUNT})`);
        } else {
            recipe.ingredients.forEach((ing, index) => {
                const nameVal = this.validateIngredientName(ing.name);
                if (!nameVal.valid) {
                    errors.push(`Zutat ${index + 1}: ${nameVal.error}`);
                }
                
                const amountVal = this.validateAmount(ing.amount);
                if (!amountVal.valid) {
                    errors.push(`Zutat ${index + 1}: ${amountVal.error}`);
                }
                
                const unitVal = this.validateUnit(ing.unit);
                if (!unitVal.valid) {
                    errors.push(`Zutat ${index + 1}: ${unitVal.error}`);
                }
            });
        }
        
        if (errors.length > 0) {
            return { valid: false, errors };
        }
        
        return { valid: true };
    }

    /**
     * Validate recipe ID format
     */
    static validateRecipeId(id) {
        if (typeof id !== 'string') {
            return { valid: false, error: 'ID muss ein String sein' };
        }
        
        // ID should be timestamp-based
        if (!/^\d{13}$/.test(id)) {
            return { valid: false, error: 'Ungültiges ID-Format' };
        }
        
        return { valid: true, value: id };
    }

    /**
     * Validate amount/price for archive
     */
    static validateAmount(amount) {
        const num = parseFloat(amount);
        
        if (isNaN(num)) {
            return { valid: false, error: 'Betrag muss eine Zahl sein' };
        }
        
        if (num < 0) {
            return { valid: false, error: 'Betrag kann nicht negativ sein' };
        }
        
        if (num > 999999.99) {
            return { valid: false, error: 'Betrag zu groß' };
        }
        
        return { valid: true, value: Math.round(num * 100) / 100 };
    }

    /**
     * Validate store name
     */
    static validateStoreName(name) {
        if (typeof name !== 'string') {
            return { valid: false, error: 'Geschäft muss ein Text sein' };
        }
        
        const trimmed = name.trim();
        
        if (trimmed.length === 0) {
            return { valid: false, error: 'Geschäft darf nicht leer sein' };
        }
        
        if (trimmed.length > 100) {
            return { valid: false, error: 'Geschäft zu lang (max 100 Zeichen)' };
        }
        
        return { valid: true, value: trimmed };
    }
}
