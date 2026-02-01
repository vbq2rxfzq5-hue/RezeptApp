/**
 * Main Application Entry Point
 * Security-hardened recipe app with strict CSP compliance
 */

import { SecureStorage } from './storage.js';
import { Router } from './router.js';
import { RecipeListView } from './views/recipe-list.js';
import { RecipeDetailView } from './views/recipe-detail.js';
import { RecipeFormView } from './views/recipe-form.js';
import { RecipeEditView } from './views/recipe-edit.js';
import { ShoppingListView } from './views/shopping-list.js';
import { RecipeSelectView } from './views/recipe-select.js';
import { FridgeCheckView } from './views/fridge-check.js';
import { ArchiveListView } from './views/archive-list.js';
import { ArchiveCreateView } from './views/archive-create.js';
import { ArchiveDetailView } from './views/archive-detail.js';

class App {
    constructor() {
        this.router = null;
    }

    /**
     * Initialize application
     */
    init() {
        // Initialize secure storage
        const storageReady = SecureStorage.initialize();
        
        if (!storageReady) {
            this.showFatalError('Storage nicht verfügbar. Bitte Browser-Einstellungen prüfen.');
            return;
        }

        // Create router
        this.router = new Router();
        this.router.init('app-container');

        // Register all views
        this.registerViews();

        // Navigate to initial view
        this.router.navigateTo('recipes');

        // Register service worker for PWA
        this.registerServiceWorker();

        console.log('App initialized successfully - Security hardened mode');
    }

    /**
     * Register all application views
     */
    registerViews() {
        this.router.registerView('recipes', new RecipeListView(this.router));
        this.router.registerView('recipe-detail', new RecipeDetailView(this.router));
        this.router.registerView('recipe-form', new RecipeFormView(this.router));
        this.router.registerView('recipe-edit', new RecipeEditView(this.router));
        this.router.registerView('shopping', new ShoppingListView(this.router));
        this.router.registerView('recipe-select', new RecipeSelectView(this.router));
        this.router.registerView('fridge-check', new FridgeCheckView(this.router));
        this.router.registerView('archive', new ArchiveListView(this.router));
        this.router.registerView('archive-create', new ArchiveCreateView(this.router));
        this.router.registerView('archive-detail', new ArchiveDetailView(this.router));
    }

    /**
     * Register service worker for PWA functionality
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('Service Worker registered:', registration.scope);
                    })
                    .catch(error => {
                        console.error('Service Worker registration failed:', error);
                    });
            });
        }
    }

    /**
     * Show fatal error message
     */
    showFatalError(message) {
        const container = document.getElementById('app-container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.style.padding = '20px';
            errorDiv.style.textAlign = 'center';
            
            const errorTitle = document.createElement('h2');
            errorTitle.textContent = 'Fehler';
            errorTitle.style.color = '#ff5252';
            
            const errorText = document.createElement('p');
            errorText.textContent = message;
            
            errorDiv.appendChild(errorTitle);
            errorDiv.appendChild(errorText);
            container.appendChild(errorDiv);
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new App();
        app.init();
    });
} else {
    const app = new App();
    app.init();
}
