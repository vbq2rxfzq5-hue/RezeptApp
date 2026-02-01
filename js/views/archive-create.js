import { DOMBuilder } from '../dom-builder.js';
import { Validator } from '../validator.js';
import { Sanitizer } from '../sanitizer.js';
import { SecureStorage } from '../storage.js';
import { RecipeHelpers } from '../recipe-helpers.js';

export class ArchiveCreateView {
    constructor(router) {
        this.router = router;
        this.receiptImage = null;
    }

    render() {
        const list = SecureStorage.loadShoppingList();
        
        if (!list) {
            const container = DOMBuilder.createElement('div', { className: 'view active' });
            container.appendChild(DOMBuilder.createEmptyState(
                '🛒',
                'Keine Einkaufsliste',
                'Erstelle erst eine Einkaufsliste'
            ));
            return container;
        }
        
        const container = DOMBuilder.createElement('div', { className: 'view active' });
        
        const header = DOMBuilder.createElement('header', { className: 'app-header' });
        const backBtn = DOMBuilder.createButton('← Zurück', 'back-btn');
        backBtn.addEventListener('click', () => this.router.navigateTo('shopping'));
        header.appendChild(backBtn);
        header.appendChild(DOMBuilder.createElement('h1', { textContent: 'Einkauf archivieren' }));
        container.appendChild(header);
        
        const formContainer = DOMBuilder.createElement('div', { className: 'form-container' });
        const form = this.createForm(list);
        formContainer.appendChild(form);
        container.appendChild(formContainer);
        
        return container;
    }

    createForm(list) {
        const form = DOMBuilder.createElement('form', { id: 'archive-form' });
        
        // Store name
        const storeInput = DOMBuilder.createInput('text', {
            id: 'store-name',
            placeholder: 'z.B. Rewe, Aldi, Edeka',
            attributes: { required: true }
        });
        form.appendChild(DOMBuilder.createFormGroup('Geschäft *', storeInput));
        
        // Amount
        const amountInput = DOMBuilder.createInput('number', {
            id: 'archive-amount',
            placeholder: '42.50',
            attributes: { required: true, step: '0.01', min: '0' }
        });
        form.appendChild(DOMBuilder.createFormGroup('Betrag (€) *', amountInput));
        
        // Date
        const today = new Date().toISOString().split('T')[0];
        const dateInput = DOMBuilder.createInput('date', {
            id: 'archive-date',
            value: today,
            attributes: { required: true }
        });
        form.appendChild(DOMBuilder.createFormGroup('Datum *', dateInput));
        
        // Receipt image
        const imageInput = DOMBuilder.createInput('file', {
            id: 'receipt-image',
            attributes: { accept: 'image/jpeg,image/jpg,image/png,image/webp' }
        });
        const imagePreview = DOMBuilder.createElement('div', { id: 'receipt-preview', className: 'image-preview' });
        const imageGroup = DOMBuilder.createFormGroup('Kassenbeleg-Foto', imageInput);
        imageGroup.appendChild(imagePreview);
        form.appendChild(imageGroup);
        
        imageInput.addEventListener('change', (e) => this.handleImageSelect(e, imagePreview));
        
        // Submit
        const submitBtn = DOMBuilder.createButton('Einkauf archivieren', 'btn-primary');
        submitBtn.type = 'submit';
        form.appendChild(submitBtn);
        
        form.addEventListener('submit', (e) => this.handleSubmit(e, list));
        
        return form;
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
            
            this.receiptImage = validatedURL;
            DOMBuilder.clearElement(previewContainer);
            const img = DOMBuilder.createImage(validatedURL, 'Kassenbeleg', '');
            previewContainer.appendChild(img);
            previewContainer.classList.add('active');
        };
        reader.readAsDataURL(file);
    }

    handleSubmit(e, list) {
        e.preventDefault();
        
        const storeName = document.getElementById('store-name').value;
        const amount = document.getElementById('archive-amount').value;
        const date = document.getElementById('archive-date').value;
        
        // Validate
        const storeVal = Validator.validateStoreName(storeName);
        if (!storeVal.valid) {
            DOMBuilder.showAlert(storeVal.error);
            return;
        }
        
        const amountVal = Validator.validateAmount(amount);
        if (!amountVal.valid) {
            DOMBuilder.showAlert(amountVal.error);
            return;
        }
        
        const archiveEntry = {
            id: RecipeHelpers.generateId(),
            storeName: storeVal.value,
            amount: amountVal.value,
            date: date,
            receiptImage: this.receiptImage,
            shoppingList: list.items.map(item => ({
                name: item.name,
                amount: item.amount,
                unit: item.unit,
                checked: item.checked
            }))
        };
        
        const archive = SecureStorage.loadArchive();
        archive.push(archiveEntry);
        const result = SecureStorage.saveArchive(archive);
        
        if (!result.success) {
            DOMBuilder.showAlert('Fehler beim Archivieren: ' + result.error);
            return;
        }
        
        // Clear shopping list
        SecureStorage.clearShoppingList();
        
        DOMBuilder.showAlert('Einkauf archiviert!');
        this.router.navigateTo('archive');
    }
}
