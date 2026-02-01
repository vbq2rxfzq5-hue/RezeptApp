/**
 * Recipe Helper Functions
 * Business logic for recipe calculations and transformations
 */

import { Sanitizer } from './sanitizer.js';

export class RecipeHelpers {
    /**
     * Scale ingredient amount based on servings
     */
    static scaleIngredient(ingredient, originalServings, newServings) {
        const scaleFactor = newServings / originalServings;
        return {
            ...Sanitizer.sanitizeIngredient(ingredient),
            amount: Math.round(ingredient.amount * scaleFactor * 100) / 100
        };
    }

    /**
     * Categorize ingredient by name
     */
    static categorizeIngredient(name) {
        const lowerName = name.toLowerCase();
        
        const categories = {
            'Fleisch & Fisch': [
                'fleisch', 'hähnchen', 'huhn', 'schwein', 'rind', 'hackfleisch',
                'fisch', 'lachs', 'thunfisch', 'wurst', 'schinken', 'speck'
            ],
            'Gemüse': [
                'tomate', 'gurke', 'paprika', 'zwiebel', 'knoblauch', 'karotte',
                'salat', 'spinat', 'brokkoli', 'zucchini', 'aubergine', 'pilz',
                'champignon', 'möhre', 'kartoffel'
            ],
            'Obst': [
                'apfel', 'banane', 'orange', 'zitrone', 'beere', 'kirsch',
                'traube', 'melone', 'erdbeere'
            ],
            'Milchprodukte': [
                'milch', 'sahne', 'joghurt', 'käse', 'butter', 'quark',
                'schmand', 'creme fraiche'
            ],
            'Getreide & Nudeln': [
                'mehl', 'brot', 'nudel', 'reis', 'pasta', 'spaghetti'
            ],
            'Gewürze & Saucen': [
                'salz', 'pfeffer', 'gewürz', 'paprikapulver', 'curry',
                'sauce', 'soße', 'öl', 'essig'
            ]
        };
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerName.includes(keyword))) {
                return category;
            }
        }
        
        return 'Sonstiges';
    }

    /**
     * Merge ingredients with same name and compatible units
     */
    static mergeIngredients(ingredients) {
        const merged = new Map();
        
        ingredients.forEach(ing => {
            const key = ing.name.toLowerCase();
            
            if (!merged.has(key)) {
                merged.set(key, Sanitizer.sanitizeIngredient(ing));
            } else {
                const existing = merged.get(key);
                
                // Only merge if units are the same
                if (existing.unit === ing.unit) {
                    existing.amount = Math.round((existing.amount + ing.amount) * 100) / 100;
                } else {
                    // Keep separate if units differ
                    existing.amount = `${existing.amount} ${existing.unit} + ${ing.amount} ${ing.unit}`;
                    existing.unit = '';
                }
            }
        });
        
        return Array.from(merged.values());
    }

    /**
     * Subtract fridge items from shopping list
     */
    static subtractFridgeItems(shoppingItems, fridgeItems) {
        return shoppingItems.filter(item => {
            const fridgeItem = fridgeItems.find(f => 
                f.name.toLowerCase() === item.name.toLowerCase() && 
                f.unit === item.unit
            );
            
            if (!fridgeItem) {
                return true; // Keep item
            }
            
            if (typeof item.amount !== 'number') {
                return true; // Keep if amount is not a simple number
            }
            
            const remaining = item.amount - fridgeItem.amount;
            
            if (remaining <= 0) {
                return false; // Remove item
            }
            
            // Update amount
            item.amount = Math.round(remaining * 100) / 100;
            return true;
        });
    }

    /**
     * Sort shopping list items
     */
    static sortShoppingList(items, sortType) {
        const itemsCopy = [...items];
        
        switch (sortType) {
            case 'alphabetical':
                return itemsCopy.sort((a, b) => 
                    a.name.localeCompare(b.name, 'de')
                );
            
            case 'category':
                return itemsCopy.sort((a, b) => {
                    const catA = this.categorizeIngredient(a.name);
                    const catB = this.categorizeIngredient(b.name);
                    
                    if (catA !== catB) {
                        return catA.localeCompare(catB, 'de');
                    }
                    
                    return a.name.localeCompare(b.name, 'de');
                });
            
            default:
                return itemsCopy;
        }
    }

    /**
     * Group items by category
     */
    static groupByCategory(items) {
        const groups = new Map();
        
        items.forEach(item => {
            const category = this.categorizeIngredient(item.name);
            
            if (!groups.has(category)) {
                groups.set(category, []);
            }
            
            groups.get(category).push(item);
        });
        
        // Sort items within each category
        groups.forEach((items, category) => {
            groups.set(category, items.sort((a, b) => 
                a.name.localeCompare(b.name, 'de')
            ));
        });
        
        return groups;
    }

    /**
     * Generate unique ID based on timestamp
     */
    static generateId() {
        return Date.now().toString();
    }

    /**
     * Format date for display
     */
    static formatDate(isoString) {
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return '';
        }
    }

    /**
     * Calculate shopping list progress
     */
    static calculateProgress(items) {
        if (!items || items.length === 0) {
            return { checked: 0, total: 0, percentage: 0 };
        }
        
        const checked = items.filter(item => item.checked).length;
        const total = items.length;
        const percentage = Math.round((checked / total) * 100);
        
        return { checked, total, percentage };
    }
}
