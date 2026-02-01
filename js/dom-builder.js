/**
 * Secure DOM Builder
 * All DOM manipulation using createElement and textContent
 * NEVER uses innerHTML, outerHTML, or insertAdjacentHTML
 */

export class DOMBuilder {
    /**
     * Create element with optional attributes and children
     */
    static createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        // Set attributes
        if (options.className) {
            element.className = options.className;
        }
        
        if (options.id) {
            element.id = options.id;
        }
        
        if (options.type) {
            element.type = options.type;
        }
        
        if (options.value !== undefined) {
            element.value = options.value;
        }
        
        if (options.placeholder) {
            element.placeholder = options.placeholder;
        }
        
        if (options.textContent) {
            element.textContent = options.textContent;
        }
        
        if (options.ariaLabel) {
            element.setAttribute('aria-label', options.ariaLabel);
        }
        
        if (options.role) {
            element.setAttribute('role', options.role);
        }
        
        if (options.dataset) {
            Object.keys(options.dataset).forEach(key => {
                element.dataset[key] = options.dataset[key];
            });
        }
        
        if (options.attributes) {
            Object.keys(options.attributes).forEach(key => {
                element.setAttribute(key, options.attributes[key]);
            });
        }
        
        // Append children
        if (options.children) {
            options.children.forEach(child => {
                if (child instanceof Node) {
                    element.appendChild(child);
                } else if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                }
            });
        }
        
        return element;
    }

    /**
     * Create button element
     */
    static createButton(text, className = '', options = {}) {
        return this.createElement('button', {
            type: 'button',
            className,
            textContent: text,
            ...options
        });
    }

    /**
     * Create input element
     */
    static createInput(type, options = {}) {
        return this.createElement('input', {
            type,
            ...options
        });
    }

    /**
     * Create select element with options
     */
    static createSelect(optionsArray, selectedValue = null, className = '') {
        const select = this.createElement('select', { className });
        
        optionsArray.forEach(opt => {
            const option = this.createElement('option', {
                value: opt,
                textContent: opt
            });
            
            if (opt === selectedValue) {
                option.selected = true;
            }
            
            select.appendChild(option);
        });
        
        return select;
    }

    /**
     * Create image element with error handling
     */
    static createImage(src, alt, className = '') {
        const img = this.createElement('img', {
            className,
            attributes: {
                alt: alt,
                loading: 'lazy'
            }
        });
        
        // Set src after element creation for better control
        if (src) {
            img.src = src;
        }
        
        return img;
    }

    /**
     * Create label with associated input
     */
    static createLabel(text, inputId = null) {
        const label = this.createElement('label', {
            textContent: text
        });
        
        if (inputId) {
            label.setAttribute('for', inputId);
        }
        
        return label;
    }

    /**
     * Clear all children from an element
     */
    static clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    /**
     * Replace element content with new content
     */
    static replaceContent(element, newContent) {
        this.clearElement(element);
        if (newContent instanceof Node) {
            element.appendChild(newContent);
        } else if (Array.isArray(newContent)) {
            newContent.forEach(child => {
                if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
        }
    }

    /**
     * Create empty state message
     */
    static createEmptyState(icon, title, subtitle) {
        const container = this.createElement('div', {
            className: 'empty-state'
        });
        
        const iconEl = this.createElement('div', {
            className: 'empty-icon',
            textContent: icon
        });
        
        const titleEl = this.createElement('h2', {
            textContent: title
        });
        
        const subtitleEl = this.createElement('p', {
            textContent: subtitle
        });
        
        container.appendChild(iconEl);
        container.appendChild(titleEl);
        container.appendChild(subtitleEl);
        
        return container;
    }

    /**
     * Create form group
     */
    static createFormGroup(labelText, inputElement) {
        const group = this.createElement('div', {
            className: 'form-group'
        });
        
        const label = this.createElement('label', {
            textContent: labelText
        });
        
        group.appendChild(label);
        group.appendChild(inputElement);
        
        return group;
    }

    /**
     * Show alert/notification
     */
    static showAlert(message, type = 'info') {
        // Use native alert for now - can be enhanced later
        alert(message);
    }

    /**
     * Show confirmation dialog
     */
    static showConfirm(message) {
        return confirm(message);
    }
}
