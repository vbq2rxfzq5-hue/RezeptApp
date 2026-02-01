/**
 * Secure Storage Manager
 * Handles all localStorage operations with validation and error handling
 */

import { STORAGE_KEYS, APP_VERSION, SECURITY_CONFIG } from './config.js';
import { Validator } from './validator.js';
import { Sanitizer } from './sanitizer.js';

export class SecureStorage {
    /**
     * Initialize storage and check version
     */
    static initialize() {
        try {
            // Check if localStorage is available
            if (!this.isAvailable()) {
                throw new Error('LocalStorage nicht verfügbar');
            }
            
            // Check and migrate version if needed
            const storedVersion = localStorage.getItem(STORAGE_KEYS.APP_VERSION);
            if (!storedVersion) {
                localStorage.setItem(STORAGE_KEYS.APP_VERSION, APP_VERSION);
            }
            
            return true;
        } catch (error) {
            console.error('Storage initialization failed:', error);
            return false;
        }
    }

    /**
     * Check if localStorage is available and working
     */
    static isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get current storage size in bytes
     */
    static getStorageSize() {
        let total = 0;
        try {
            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
        } catch (error) {
            console.error('Failed to calculate storage size:', error);
        }
        return total;
    }

    /**
     * Check if storage limit would be exceeded
     */
    static wouldExceedLimit(additionalData) {
        const currentSize = this.getStorageSize();
        const dataSize = JSON.stringify(additionalData).length;
        return (currentSize + dataSize) > SECURITY_CONFIG.MAX_STORAGE_SIZE;
    }

    /**
     * Save recipes to storage with validation
     */
    static saveRecipes(recipes) {
        try {
            // Validate input
            if (!Array.isArray(recipes)) {
                throw new Error('Recipes must be an array');
            }
            
            if (recipes.length > SECURITY_CONFIG.MAX_RECIPES_COUNT) {
                throw new Error(`Too many recipes (max ${SECURITY_CONFIG.MAX_RECIPES_COUNT})`);
            }
            
            // Validate each recipe
            const validatedRecipes = [];
            for (const recipe of recipes) {
                const validation = Validator.validateRecipe(recipe);
                if (!validation.valid) {
                    console.warn('Invalid recipe skipped:', validation.errors);
                    continue;
                }
                validatedRecipes.push(Sanitizer.sanitizeRecipe(recipe));
            }
            
            // Check storage size
            if (this.wouldExceedLimit(validatedRecipes)) {
                throw new Error('Storage limit exceeded');
            }
            
            // Save to localStorage
            const data = JSON.stringify(validatedRecipes);
            localStorage.setItem(STORAGE_KEYS.RECIPES, data);
            
            return { success: true, count: validatedRecipes.length };
        } catch (error) {
            console.error('Failed to save recipes:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load recipes from storage with validation
     */
    static loadRecipes() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.RECIPES);
            
            if (!data) {
                return [];
            }
            
            // Parse JSON
            let recipes;
            try {
                recipes = JSON.parse(data);
            } catch (parseError) {
                console.error('Failed to parse recipes:', parseError);
                return [];
            }
            
            // Validate structure
            if (!Array.isArray(recipes)) {
                console.error('Recipes data is not an array');
                return [];
            }
            
            // Validate and sanitize each recipe
            const validRecipes = [];
            for (const recipe of recipes) {
                const validation = Validator.validateRecipe(recipe);
                if (validation.valid) {
                    validRecipes.push(Sanitizer.sanitizeRecipe(recipe));
                } else {
                    console.warn('Invalid recipe in storage:', validation.errors);
                }
            }
            
            return validRecipes;
        } catch (error) {
            console.error('Failed to load recipes:', error);
            return [];
        }
    }

    /**
     * Save shopping list to storage
     */
    static saveShoppingList(shoppingList) {
        try {
            if (!shoppingList) {
                localStorage.removeItem(STORAGE_KEYS.SHOPPING_LIST);
                return { success: true };
            }
            
            // Validate structure
            if (!shoppingList.items || !Array.isArray(shoppingList.items)) {
                throw new Error('Invalid shopping list structure');
            }
            
            // Sanitize items
            const sanitized = {
                items: shoppingList.items.map(item => Sanitizer.sanitizeShoppingItem(item)),
                createdAt: new Date().toISOString()
            };
            
            // Check storage size
            if (this.wouldExceedLimit(sanitized)) {
                throw new Error('Storage limit exceeded');
            }
            
            const data = JSON.stringify(sanitized);
            localStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, data);
            
            return { success: true };
        } catch (error) {
            console.error('Failed to save shopping list:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load shopping list from storage
     */
    static loadShoppingList() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
            
            if (!data) {
                return null;
            }
            
            let shoppingList;
            try {
                shoppingList = JSON.parse(data);
            } catch (parseError) {
                console.error('Failed to parse shopping list:', parseError);
                return null;
            }
            
            // Validate structure
            if (!shoppingList.items || !Array.isArray(shoppingList.items)) {
                console.error('Invalid shopping list structure');
                return null;
            }
            
            // Sanitize items
            return {
                items: shoppingList.items.map(item => Sanitizer.sanitizeShoppingItem(item)),
                createdAt: shoppingList.createdAt || new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to load shopping list:', error);
            return null;
        }
    }

    /**
     * Clear shopping list
     */
    static clearShoppingList() {
        try {
            localStorage.removeItem(STORAGE_KEYS.SHOPPING_LIST);
            return { success: true };
        } catch (error) {
            console.error('Failed to clear shopping list:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Clear all app data
     */
    static clearAll() {
        try {
            localStorage.removeItem(STORAGE_KEYS.RECIPES);
            localStorage.removeItem(STORAGE_KEYS.SHOPPING_LIST);
            localStorage.removeItem(STORAGE_KEYS.ARCHIVE);
            return { success: true };
        } catch (error) {
            console.error('Failed to clear all data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Save shopping archive
     */
    static saveArchive(archive) {
        try {
            if (!Array.isArray(archive)) {
                throw new Error('Archive must be an array');
            }
            
            // Check storage size
            if (this.wouldExceedLimit(archive)) {
                throw new Error('Storage limit exceeded');
            }
            
            const data = JSON.stringify(archive);
            localStorage.setItem(STORAGE_KEYS.ARCHIVE, data);
            
            return { success: true };
        } catch (error) {
            console.error('Failed to save archive:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load shopping archive
     */
    static loadArchive() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.ARCHIVE);
            
            if (!data) {
                return [];
            }
            
            let archive;
            try {
                archive = JSON.parse(data);
            } catch (parseError) {
                console.error('Failed to parse archive:', parseError);
                return [];
            }
            
            if (!Array.isArray(archive)) {
                console.error('Archive data is not an array');
                return [];
            }
            
            return archive;
        } catch (error) {
            console.error('Failed to load archive:', error);
            return [];
        }
    }
}
