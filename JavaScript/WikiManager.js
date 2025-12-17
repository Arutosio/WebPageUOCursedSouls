/*===============================*/
/*       WIKI FUNCTIONALITY      */
/*===============================*/

export default class WikiManager {
    constructor() {
        this.wikiStructure = null;
        this.currentPage = 'home';
        this.sidebarOpen = true;
        this.expandedSections = {};
        
        // DOM Elements
        this.sidebar = null;
        this.toggleBtn = null;
        this.menuIcon = null;
        this.closeIcon = null;
        this.pageTitle = null;
        this.content = null;
        this.loading = null;
        this.navContent = null;
        
        this.init();
    }
    
    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    async setup() {
        // Cache DOM elements
        this.sidebar = document.getElementById('wiki-sidebar');
        this.toggleBtn = document.getElementById('wiki-toggle-btn');
        this.menuIcon = document.getElementById('wiki-menu-icon');
        this.closeIcon = document.getElementById('wiki-close-icon');
        this.pageTitle = document.getElementById('wiki-page-title');
        this.content = document.getElementById('wiki-content');
        this.loading = document.getElementById('wiki-loading');
        this.navContent = document.getElementById('wiki-nav-content');
        
        // Load wiki structure
        await this.loadWikiStructure();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Render navigation
        this.renderNavigation();
        
        // Load home page
        this.loadPage('home');
    }
    
    async loadWikiStructure() {
        try {
            const response = await fetch('../Json/Wiki-Structure.json');
            this.wikiStructure = await response.json();
        } catch (error) {
            console.error('Error loading wiki structure:', error);
            this.wikiStructure = {};
        }
    }
    
    setupEventListeners() {
        // Toggle sidebar
        this.toggleBtn.addEventListener('click', () => this.toggleSidebar());
        
        // Home button
        const homeBtn = document.querySelector('.wiki-nav-home');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => this.loadPage('home'));
        }
    }
    
    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        
        if (this.sidebarOpen) {
            this.sidebar.classList.remove('collapsed');
            this.menuIcon.classList.remove('hidden');
            this.closeIcon.classList.add('hidden');
        } else {
            this.sidebar.classList.add('collapsed');
            this.menuIcon.classList.add('hidden');
            this.closeIcon.classList.remove('hidden');
        }
    }
    
    renderNavigation() {
        if (!this.wikiStructure) return;
        
        this.navContent.innerHTML = '';
        
        Object.entries(this.wikiStructure).forEach(([key, value]) => {
            const element = this.renderNavItem(key, value, '');
            this.navContent.appendChild(element);
        });
    }
    
    renderNavItem(name, data, path) {
        const currentPath = path ? `${path}/${name}` : name;
        const container = document.createElement('div');
        
        if (data.items) {
            // Category with items
            const button = this.createCategoryButton(name, currentPath);
            container.appendChild(button);
            
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'wiki-nav-items';
            itemsContainer.style.display = this.expandedSections[currentPath] ? 'block' : 'none';
            
            data.items.forEach(item => {
                const itemButton = this.createItemButton(item, `${currentPath}/${item}`);
                itemsContainer.appendChild(itemButton);
            });
            
            container.appendChild(itemsContainer);
            
        } else if (data.subcategories) {
            // Category with subcategories
            const button = this.createCategoryButton(name, currentPath);
            container.appendChild(button);
            
            const subContainer = document.createElement('div');
            subContainer.className = 'wiki-nav-subcategory';
            subContainer.style.display = this.expandedSections[currentPath] ? 'block' : 'none';
            
            Object.entries(data.subcategories).forEach(([subName, subData]) => {
                const subElement = this.renderNavItem(subName, subData, currentPath);
                subContainer.appendChild(subElement);
            });
            
            container.appendChild(subContainer);
        }
        
        return container;
    }
    
    createCategoryButton(name, path) {
        const button = document.createElement('button');
        button.className = 'wiki-nav-item wiki-nav-category';
        button.innerHTML = `
            <svg class="wiki-nav-category-icon ${this.expandedSections[path] ? 'expanded' : ''}" 
                 xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            ${name}
        `;
        
        button.addEventListener('click', () => this.toggleSection(path));
        
        return button;
    }
    
    createItemButton(name, path) {
        const button = document.createElement('button');
        button.className = 'wiki-nav-item';
        button.textContent = name;
        
        if (this.currentPage === path) {
            button.classList.add('active');
        }
        
        button.addEventListener('click', () => this.loadPage(path));
        
        return button;
    }
    
    toggleSection(path) {
        this.expandedSections[path] = !this.expandedSections[path];
        this.renderNavigation();
    }
    
    async loadPage(path) {
        this.currentPage = path;
        
        // Update title
        const pageName = path === 'home' ? 'Wiki Home' : path.split('/').pop();
        this.pageTitle.textContent = pageName;
        
        // Update active state in navigation
        document.querySelectorAll('.wiki-nav-item').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === path || btn.textContent.trim() === pageName) {
                btn.classList.add('active');
            }
        });
        
        // Show loading
        this.loading.classList.remove('hidden');
        this.content.classList.add('hidden');
        
        try {
            // Load content from .md file
            const content = await this.loadMarkdownFile(path);
            
            // Render content
            this.renderContent(content);
            
        } catch (error) {
            console.error('Error loading page:', error);
            this.renderContent('# Errore\n\nImpossibile caricare il contenuto della pagina.');
        } finally {
            // Hide loading
            this.loading.classList.add('hidden');
            this.content.classList.remove('hidden');
        }
    }
    
    async loadMarkdownFile(path) {
        // If it's home, load default content
        if (path === 'home') {
            return this.getHomeContent();
        }
        
        // Try to load the .md file
        try {
            const response = await fetch(`./sections/Wiki/${path}.md`);
            if (!response.ok) throw new Error('File not found');
            return await response.text();
        } catch (error) {
            // Return mock content if file doesn't exist
            return this.getMockContent(path);
        }
    }
    
    getHomeContent() {
        return `# Wiki di UOStrike

Benvenuto nella Wiki ufficiale del nostro shard Ultima Online!

## Cosa troverai qui

Questa wiki contiene tutte le informazioni dettagliate su:

- **Skills**: Tutte le abilità disponibili nel gioco
- **Classi**: Le classi giocabili con le loro specializzazioni
- **Razze**: Le razze uniche del nostro mondo
- **Items**: Oggetti, armi, strumenti e risorse

## Come navigare

Usa il menu laterale per esplorare le diverse sezioni. Clicca su una categoria per espanderla e vedere tutti gli elementi disponibili.

## Aggiornamenti recenti

La wiki viene costantemente aggiornata con nuove informazioni sul mondo di UOStrike. Torna spesso per scoprire le novità!`;
    }
    
    getMockContent(path) {
        const pageName = path.split('/').pop();
        const category = path.split('/')[0];
        
        return `# ${pageName}

## Descrizione

Questa è la pagina wiki per **${pageName}**. Qui troverai tutte le informazioni dettagliate su questo elemento del gioco.

## Caratteristiche principali

- **Requisito Livello**: 25
- **Categoria**: ${category}
- **Rarità**: Comune/Raro/Epico
- **Utilizzo**: Descrizione dell'utilizzo principale

## Statistiche

| Attributo | Valore |
|-----------|--------|
| Difficoltà | Media |
| Costo | 1000 GP |
| Peso | 5 Stone |

## Dettagli

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Questo elemento è fondamentale per il tuo personaggio e offre vantaggi unici nel mondo di UOStrike.

### Come ottenerlo

Puoi ottenere questo elemento attraverso:
- Crafting con le skill appropriate
- Drop da creature specifiche
- Acquisto dai mercanti NPC
- Scambio con altri giocatori

## Note aggiuntive

Informazioni extra e consigli utili per sfruttare al meglio questo elemento nel tuo gameplay.

## Vedi anche

- Altri elementi correlati
- Guide correlate`;
    }
    
    renderContent(markdown) {
        const lines = markdown.split('\n');
        let html = '';
        let inTable = false;
        let tableHtml = '';
        let isFirstTableRow = true;
        
        lines.forEach((line, index) => {
            // Headers
            if (line.startsWith('# ')) {
                html += `<h1>${line.slice(2)}</h1>`;
            } else if (line.startsWith('## ')) {
                html += `<h2>${line.slice(3)}</h2>`;
            } else if (line.startsWith('### ')) {
                html += `<h3>${line.slice(4)}</h3>`;
            }
            // Lists
            else if (line.startsWith('- ')) {
                const content = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<li>${content}</li>`;
            }
            // Tables
            else if (line.startsWith('|')) {
                if (!inTable) {
                    inTable = true;
                    tableHtml = '<table>';
                    isFirstTableRow = true;
                }
                
                if (line.includes('---')) {
                    // Skip separator line
                    return;
                }
                
                const cells = line.split('|').filter(cell => cell.trim());
                const tag = isFirstTableRow ? 'th' : 'td';
                tableHtml += '<tr>';
                cells.forEach(cell => {
                    tableHtml += `<${tag}>${cell.trim()}</${tag}>`;
                });
                tableHtml += '</tr>';
                isFirstTableRow = false;
            } else {
                // Close table if needed
                if (inTable) {
                    tableHtml += '</table>';
                    html += tableHtml;
                    inTable = false;
                    tableHtml = '';
                    isFirstTableRow = true;
                }
                
                // Empty lines
                if (line.trim() === '') {
                    html += '<br>';
                }
                // Paragraphs
                else if (line.trim()) {
                    const content = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    html += `<p>${content}</p>`;
                }
            }
        });
        
        // Close table if still open
        if (inTable) {
            tableHtml += '</table>';
            html += tableHtml;
        }
        
        this.content.innerHTML = html;
    }
}