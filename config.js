/**
 * Security Configuration
 * Defines all security-critical constants and limits
 */

export const SECURITY_CONFIG = {
    // Image Upload Restrictions
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    BLOCKED_IMAGE_TYPES: ['image/svg+xml', 'image/svg'],
    
    // Input Validation Limits
    MAX_RECIPE_NAME_LENGTH: 200,
    MAX_INGREDIENT_NAME_LENGTH: 100,
    MAX_INSTRUCTIONS_LENGTH: 10000,
    MAX_INGREDIENTS_COUNT: 50,
    MIN_SERVINGS: 1,
    MAX_SERVINGS: 100,
    MAX_INGREDIENT_AMOUNT: 10000,
    
    // Storage Limits
    MAX_RECIPES_COUNT: 500,
    MAX_STORAGE_SIZE: 10 * 1024 * 1024, // 10MB total
    
    // Patterns for validation
    PATTERNS: {
        RECIPE_NAME: /^[a-zA-ZäöüßÄÖÜ0-9\s\-.,!?()]+$/,
        INGREDIENT_NAME: /^[a-zA-ZäöüßÄÖÜ0-9\s\-.,()]+$/,
        NUMBER: /^\d+(\.\d{1,2})?$/,
    }
};

export const UNITS = Object.freeze(['g', 'kg', 'ml', 'l', 'EL', 'TL', 'Stück', 'Prise']);

export const CATEGORIES = Object.freeze([
    'Fleisch & Fisch',
    'Gemüse',
    'Obst',
    'Milchprodukte',
    'Getreide & Nudeln',
    'Gewürze & Saucen',
    'Sonstiges'
]);

export const SORT_TYPES = Object.freeze(['none', 'alphabetical', 'category']);

// Storage keys
export const STORAGE_KEYS = Object.freeze({
    RECIPES: 'recipes_v1',
    SHOPPING_LIST: 'shopping_list_v1',
    ARCHIVE: 'shopping_archive_v1',
    APP_VERSION: 'app_version'
});

export const APP_VERSION = '2.0.0';

// Archive Configuration
export const ARCHIVE_CONFIG = {
    MAX_RECEIPT_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_STORE_NAME_LENGTH: 100,
    MAX_AMOUNT_VALUE: 999999.99
};
