/**
 * Data Sanitizer
 * Sanitizes data before storage and ensures safe output
 */

export class Sanitizer {
    /**
     * Sanitize text for safe display
     * Escapes HTML special characters
     */
    static sanitizeText(text) {
        if (typeof text !== 'string') {
            return '';
        }
        
        // We use textContent for output, but double-check here
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Sanitize recipe object for storage
     */
    static sanitizeRecipe(recipe) {
        return {
            id: String(recipe.id),
            name: String(recipe.name).trim(),
            servings: parseInt(recipe.servings, 10),
            image: recipe.image && typeof recipe.image === 'string' ? recipe.image : null,
            ingredients: Array.isArray(recipe.ingredients) 
                ? recipe.ingredients.map(ing => this.sanitizeIngredient(ing))
                : [],
            instructions: recipe.instructions ? String(recipe.instructions).trim() : ''
        };
    }

    /**
     * Sanitize ingredient object
     */
    static sanitizeIngredient(ingredient) {
        return {
            name: String(ingredient.name).trim(),
            amount: parseFloat(ingredient.amount),
            unit: String(ingredient.unit)
        };
    }

    /**
     * Sanitize shopping list item
     */
    static sanitizeShoppingItem(item) {
        return {
            name: String(item.name).trim(),
            amount: typeof item.amount === 'number' ? item.amount : String(item.amount),
            unit: String(item.unit),
            checked: Boolean(item.checked)
        };
    }

    /**
     * Deep clone object safely
     */
    static deepClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.error('Deep clone failed:', error);
            return null;
        }
    }

    /**
     * Validate and sanitize image data URL
     */
    static validateImageDataURL(dataURL) {
        if (typeof dataURL !== 'string') {
            return null;
        }
        
        // Must be a valid data URL
        if (!dataURL.startsWith('data:image/')) {
            return null;
        }
        
        // Must not be SVG
        if (dataURL.startsWith('data:image/svg')) {
            return null;
        }
        
        // Check if it's a valid base64 string
        const parts = dataURL.split(',');
        if (parts.length !== 2) {
            return null;
        }
        
        const [header, data] = parts;
        
        // Validate header
        if (!/^data:image\/(jpeg|jpg|png|webp);base64$/.test(header)) {
            return null;
        }
        
        // Validate base64 data (basic check)
        if (!/^[A-Za-z0-9+/]+=*$/.test(data)) {
            return null;
        }
        
        return dataURL;
    }
}
