/**
 * Router Module
 * Handles view switching and navigation state
 */

import { DOMBuilder } from './dom-builder.js';

export class Router {
    constructor() {
        this.currentView = 'recipes';
        this.views = new Map();
        this.container = null;
    }

    /**
     * Initialize router
     */
    init(containerId) {
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            throw new Error('Container element not found');
        }
        
        // Set up navigation
        this.setupNavigation();
    }

    /**
     * Register a view
     */
    registerView(name, viewInstance) {
        this.views.set(name, viewInstance);
    }

    /**
     * Navigate to a view
     */
    navigateTo(viewName, data = null) {
        const view = this.views.get(viewName);
        
        if (!view) {
            console.error(`View not found: ${viewName}`);
            return;
        }
        
        // Clear container
        DOMBuilder.clearElement(this.container);
        
        // Render view
        const viewElement = view.render(data);
        this.container.appendChild(viewElement);
        
        // Update current view
        this.currentView = viewName;
        
        // Update navigation state
        this.updateNavigationState(viewName);
    }

    /**
     * Setup navigation buttons
     */
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const viewName = btn.dataset.view;
                if (viewName) {
                    this.navigateTo(viewName);
                }
            });
        });
    }

    /**
     * Update navigation button states
     */
    updateNavigationState(activeView) {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            const viewName = btn.dataset.view;
            
            if (viewName === activeView) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Get current view name
     */
    getCurrentView() {
        return this.currentView;
    }

    /**
     * Go back to previous view (simple implementation)
     */
    goBack(defaultView = 'recipes') {
        this.navigateTo(defaultView);
    }
}
