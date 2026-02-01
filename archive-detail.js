import { DOMBuilder } from '../dom-builder.js';
import { SecureStorage } from '../storage.js';

export class ArchiveDetailView {
    constructor(router) {
        this.router = router;
    }

    render(data) {
        const archive = SecureStorage.loadArchive();
        const entry = archive.find(e => e.id === data.entryId);
        
        if (!entry) {
            return DOMBuilder.createEmptyState('❌', 'Eintrag nicht gefunden', '');
        }
        
        const container = DOMBuilder.createElement('div', { className: 'view active' });
        
        const header = DOMBuilder.createElement('header', { className: 'app-header' });
        const backBtn = DOMBuilder.createButton('← Zurück', 'back-btn');
        backBtn.addEventListener('click', () => this.router.navigateTo('archive'));
        header.appendChild(backBtn);
        header.appendChild(DOMBuilder.createElement('h1', { textContent: 'Einkauf Details' }));
        container.appendChild(header);
        
        const content = DOMBuilder.createElement('div', { className: 'archive-detail-content' });
        
        // Receipt image
        if (entry.receiptImage) {
            const img = DOMBuilder.createImage(entry.receiptImage, 'Kassenbeleg', 'receipt-image-full');
            content.appendChild(img);
        }
        
        // Info
        const infoCard = DOMBuilder.createElement('div', { className: 'info-card' });
        
        const date = new Date(entry.date).toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        infoCard.appendChild(this.createInfoRow('📅 Datum:', date));
        infoCard.appendChild(this.createInfoRow('🏪 Geschäft:', entry.storeName));
        infoCard.appendChild(this.createInfoRow('💰 Betrag:', `${entry.amount.toFixed(2)} €`));
        
        content.appendChild(infoCard);
        
        // Shopping list
        const listSection = DOMBuilder.createElement('div', { className: 'section' });
        listSection.appendChild(DOMBuilder.createElement('h2', {
            className: 'section-title',
            textContent: 'Einkaufsliste'
        }));
        
        entry.shoppingList.forEach(item => {
            const itemRow = DOMBuilder.createElement('div', { className: 'archive-item-row' });
            
            const checkbox = DOMBuilder.createElement('span', {
                className: 'archive-checkbox',
                textContent: item.checked ? '✓' : '○'
            });
            
            const name = DOMBuilder.createElement('span', {
                className: item.checked ? 'archive-item-checked' : 'archive-item-name',
                textContent: item.name
            });
            
            const amount = typeof item.amount === 'number'
                ? `${item.amount} ${item.unit}`
                : item.amount;
            
            const amountSpan = DOMBuilder.createElement('span', {
                className: 'archive-item-amount',
                textContent: amount
            });
            
            itemRow.appendChild(checkbox);
            itemRow.appendChild(name);
            itemRow.appendChild(amountSpan);
            
            listSection.appendChild(itemRow);
        });
        
        content.appendChild(listSection);
        container.appendChild(content);
        
        return container;
    }

    createInfoRow(label, value) {
        const row = DOMBuilder.createElement('div', { className: 'info-row' });
        row.appendChild(DOMBuilder.createElement('span', {
            className: 'info-label',
            textContent: label
        }));
        row.appendChild(DOMBuilder.createElement('span', {
            className: 'info-value',
            textContent: value
        }));
        return row;
    }
}
