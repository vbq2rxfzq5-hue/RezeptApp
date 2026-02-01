import { DOMBuilder } from '../dom-builder.js';
import { SecureStorage } from '../storage.js';

export class ArchiveListView {
    constructor(router) {
        this.router = router;
    }

    render() {
        const archive = SecureStorage.loadArchive();
        const container = DOMBuilder.createElement('div', { className: 'view active' });
        
        const header = DOMBuilder.createElement('header', { className: 'app-header' });
        header.appendChild(DOMBuilder.createElement('h1', { textContent: 'Archiv' }));
        container.appendChild(header);
        
        if (archive.length === 0) {
            container.appendChild(DOMBuilder.createEmptyState(
                '📊',
                'Kein Archiv',
                'Archiviere deinen ersten Einkauf!'
            ));
            return container;
        }
        
        const content = DOMBuilder.createElement('div', { className: 'archive-content' });
        
        // Group by month
        const byMonth = this.groupByMonth(archive);
        
        byMonth.forEach(({ month, entries, total }) => {
            const monthCard = DOMBuilder.createElement('div', { className: 'month-card' });
            
            const monthHeader = DOMBuilder.createElement('div', { className: 'month-header' });
            monthHeader.appendChild(DOMBuilder.createElement('h2', { textContent: month }));
            monthHeader.appendChild(DOMBuilder.createElement('span', {
                className: 'month-total',
                textContent: `${total.toFixed(2)} €`
            }));
            monthCard.appendChild(monthHeader);
            
            const entriesList = DOMBuilder.createElement('div', { className: 'entries-list' });
            
            entries.forEach(entry => {
                const entryCard = DOMBuilder.createElement('div', { className: 'entry-card' });
                
                const date = new Date(entry.date).toLocaleDateString('de-DE');
                entryCard.appendChild(DOMBuilder.createElement('div', {
                    className: 'entry-date',
                    textContent: date
                }));
                
                entryCard.appendChild(DOMBuilder.createElement('div', {
                    className: 'entry-store',
                    textContent: entry.storeName
                }));
                
                entryCard.appendChild(DOMBuilder.createElement('div', {
                    className: 'entry-amount',
                    textContent: `${entry.amount.toFixed(2)} €`
                }));
                
                entryCard.addEventListener('click', () => {
                    this.router.navigateTo('archive-detail', { entryId: entry.id });
                });
                
                entriesList.appendChild(entryCard);
            });
            
            monthCard.appendChild(entriesList);
            content.appendChild(monthCard);
        });
        
        container.appendChild(content);
        return container;
    }

    groupByMonth(archive) {
        const groups = new Map();
        
        archive.forEach(entry => {
            const date = new Date(entry.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long' });
            
            if (!groups.has(key)) {
                groups.set(key, { month: monthName, entries: [], total: 0 });
            }
            
            const group = groups.get(key);
            group.entries.push(entry);
            group.total += entry.amount;
        });
        
        return Array.from(groups.values()).reverse();
    }
}
