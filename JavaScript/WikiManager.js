/*===============================*/
/*       WIKI MANAGER MODULE     */
/*===============================*/
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

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
        
        this.initialized = false;
    }
    
    /**
     * Inizializza il WikiManager
     */
    async init() {
        try {
            // Carica l'HTML della Wiki
            //await this.loadWikiHTML();
            
            // Setup elementi DOM e funzionalità
            await this.setup();
            
            this.initialized = true;
            console.log('✅ WikiManager initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing WikiManager:', error);
        }
    }
    
    /**
     * Carica l'HTML della sezione Wiki
     */
    async loadWikiHTML() {
        try {
            const response = await fetch('./Views/ViewSections/Wiki.html');
            if (!response.ok) throw new Error('Failed to load Wiki HTML');
            
            const html = await response.text();
            const wikiSection = document.getElementById('sectionWiki');
            
            if (wikiSection) {
                wikiSection.innerHTML = html;
                
                // Aspetta che il DOM sia aggiornato
                await new Promise(resolve => setTimeout(resolve, 100));
            } else {
                throw new Error('Wiki section not found in DOM');
            }
        } catch (error) {
            console.error('Error loading Wiki HTML:', error);
            throw error;
        }
    }
    
    /**
     * Setup iniziale dopo il caricamento dell'HTML
     */
    async setup() {
        // Cache DOM elements
        this.sidebar = document.getElementById('wiki-sidebar');
        this.toggleBtn = document.getElementById('wiki-toggle-btn'); // bug liveservice(locale) ma funziona html non caricato
        this.menuIcon = document.getElementById('wiki-menu-icon'); // bug liveservice(locale) ma funziona html non caricato
        this.closeIcon = document.getElementById('wiki-close-icon'); // bug liveservice(locale) ma funziona html non caricato
        this.pageTitle = document.getElementById('wiki-page-title'); // bug liveservice(locale) ma funziona html non caricato
        this.content = document.getElementById('wiki-content'); // bug liveservice(locale) ma funziona html non caricato
        this.loading = document.getElementById('wiki-loading'); // bug liveservice(locale) ma funziona html non caricato
        this.navContent = document.getElementById('wiki-nav-content');
        
        // Verifica che tutti gli elementi esistano
        if (!this.validateDOMElements()) {
            throw new Error('Required DOM elements not found');
        }
        
        // Load wiki structure
        await this.loadWikiStructure();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Render navigation
        this.renderNavigation();
        
        // Load home page
        this.loadPage('home');
    }
    
    /**
     * Valida che tutti gli elementi DOM necessari esistano
     */
    validateDOMElements() {
        const requiredElements = {
            sidebar: this.sidebar,
            toggleBtn: this.toggleBtn,
            menuIcon: this.menuIcon,
            closeIcon: this.closeIcon,
            // pageTitle: this.pageTitle, // Questo va abilitato se si vuole HEADER di WIKI 
            content: this.content,
            loading: this.loading,
            navContent: this.navContent
        };
        
        for (const [name, element] of Object.entries(requiredElements)) {
            if (!element) {
                console.error(`Missing DOM element: ${name}`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Carica la struttura della wiki dal JSON
     */
    async loadWikiStructure() {
        try {
            const response = await fetch('./Json/Wiki-Structure.json');
            if (!response.ok) throw new Error('Failed to load wiki structure');
            
            this.wikiStructure = await response.json();
            console.log('✅ Wiki structure loaded');
        } catch (error) {
            console.error('Error loading wiki structure:', error);
            // Fallback a struttura vuota
            this.wikiStructure = {};
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Toggle sidebar
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Home button
        const homeBtn = document.querySelector('.wiki-nav-home');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => this.loadPage('home'));
        }
    }
    
    /**
     * Toggle sidebar visibility
     */
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
    
    /**
     * Render navigation menu
     */
    renderNavigation() {
        if (!this.wikiStructure || !this.navContent) return;
        
        this.navContent.innerHTML = '';
        
        Object.entries(this.wikiStructure).forEach(([key, value]) => {
            const element = this.renderNavItem(key, value, '');
            this.navContent.appendChild(element);
        });
    }
    
    /**
     * Render singolo item di navigazione
     */
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
    
    /**
     * Crea bottone categoria
     */
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
    
    /**
     * Crea bottone item
     */
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
    
    /**
     * Toggle sezione espansa/collassata
     */
    toggleSection(path) {
        this.expandedSections[path] = !this.expandedSections[path];
        this.renderNavigation();
    }
    
    /**
     * Carica una pagina wiki
     */
    async loadPage(path) {
        if (!this.initialized) {
            console.warn('WikiManager not initialized yet');
            return;
        }
        
        this.currentPage = path;
        
        // Update title
        const pageName = path === 'home' ? 'Wiki Home' : path.split('/').pop();

        // Questo va abilitato se si vuole HEADER di WIKI 
        // this.pageTitle.textContent = pageName;
        
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
            // this.renderContent(content);
            this.renderContentByMarkedJS(content);
            
        } catch (error) {
            console.error('Error loading page:', error);
            this.renderContent('# Errore\n\nImpossibile caricare il contenuto della pagina.');
        } finally {
            // Hide loading
            this.loading.classList.add('hidden');
            this.content.classList.remove('hidden');
        }
    }
    
    /**
     * Carica file markdown
     */
    async loadMarkdownFile(path) {
        // If it's home, load default content
        if (path === 'home') {
            return this.getHomeContent();
        }
        
        // Try to load the .md file
        try {
            const response = await fetch(`./Documents/UOCS_Wiki_md/${path}.md`);
            if (!response.ok) throw new Error('File not found');
            return await response.text();
        } catch (error) {
            // Return mock content if file doesn't exist
            console.warn(`Markdown file not found: ${path}.md, using mock content`);
            return this.getMockContent(path);
        }
    }
    
    /**
     * Contenuto home page
     */
    getHomeContent() {
        return `# Wiki di UOCS

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

La wiki viene costantemente aggiornata con nuove informazioni sul mondo di UOCS. Torna spesso per scoprire le novità!`;
    }
    
    /**
     * Mock content per pagine non trovate
     */
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

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Questo elemento è fondamentale per il tuo personaggio e offre vantaggi unici nel mondo di UOCS.

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
    
    /**
     * Render markdown content to HTML
     */
    renderContent(markdown) {
        const lines = markdown.split('\n');
        let html = '';
        let inTable = false;
        let tableHtml = '';
        let isFirstTableRow = true;
        let inList = false;
        
        lines.forEach((line, index) => {
            // Headers
            if (line.startsWith('# ')) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                html += `<h1>${this.parseInlineMarkdown(line.slice(2))}</h1>`;
            } else if (line.startsWith('## ')) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                html += `<h2>${this.parseInlineMarkdown(line.slice(3))}</h2>`;
            } else if (line.startsWith('### ')) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                html += `<h3>${this.parseInlineMarkdown(line.slice(4))}</h3>`;
            }
            // Lists
            else if (line.startsWith('- ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                const content = this.parseInlineMarkdown(line.slice(2));
                html += `<li>${content}</li>`;
            }
            // Tables
            else if (line.startsWith('|')) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                
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
                    tableHtml += `<${tag}>${this.parseInlineMarkdown(cell.trim())}</${tag}>`;
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
                
                // Close list if needed
                if (inList && line.trim() === '') {
                    html += '</ul>';
                    inList = false;
                }
                
                // Empty lines
                if (line.trim() === '') {
                    html += '<br>';
                }
                // Paragraphs
                else if (line.trim()) {
                    const content = this.parseInlineMarkdown(line);
                    html += `<p>${content}</p>`;
                }
            }
        });
        
        // Close list if still open
        if (inList) {
            html += '</ul>';
        }
        
        // Close table if still open
        if (inTable) {
            tableHtml += '</table>';
            html += tableHtml;
        }
        
        this.content.innerHTML = html;
    }
    
    /**
     * Parse inline markdown (bold, italic, code)
     */
    parseInlineMarkdown(text) {
        return text
            .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>') // Bold + Italic
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
            .replace(/`(.*?)`/g, '<code>$1</code>'); // Code
    }

    /**
     * Render markdown content to HTML
     */
    renderContentByMarkedJS(markdown) {
        // Invece di fare il parsing a mano, usa la libreria Marked
        // che hai caricato nell'index.html via CDN
        if (typeof marked !== 'undefined') {
            this.content.innerHTML = marked.parse(markdown);
        } else {
            console.error("Marked.js non è caricato!");
            // Fallback rudimentale se la libreria fallisce
            this.content.innerText = markdown;
        }
    }
    
    /**
     * Distruggi il WikiManager (cleanup)
     */
    destroy() {
        // Remove event listeners
        if (this.toggleBtn) {
            this.toggleBtn.removeEventListener('click', this.toggleSidebar);
        }
        
        // Clear references
        this.sidebar = null;
        this.toggleBtn = null;
        this.menuIcon = null;
        this.closeIcon = null;
        this.pageTitle = null;
        this.content = null;
        this.loading = null;
        this.navContent = null;
        
        this.initialized = false;
        console.log('🗑️ WikiManager destroyed');
    }
}