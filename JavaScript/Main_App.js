/*===============================*/
/*         MAIN APP JS           */
/*===============================*/

// Import modules
import UtilityClass from "./UtilityClass.js";
import HtmlBuilder from "./HtmlBuilder.js";
import IndexManager from "./IndexManager.js";
import WikiManager from "./WikiManager.js";

class App {
    constructor() {
        this.jsonDataInfo = null;
        this.htmlBuilder = null;
        this.wikiManager = null;
        this.currentSection = 'home';
        this.initialized = false;
        this.partPath = null;
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing UOCS App...');
        
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            await this.setup();
        }
    }
    
    async setup() {
        try {
            // Initialize components
            await this.initializeComponents();
            
            await this.BuildPage();

            // Setup navigation
            this.setupNavigation();
            
            // Setup effects
            this.setupEffects();
            this.setupParticleEffect();
            
            this.initialized = true;
            console.log('✅ UOCS App initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
        }
    }
    
    /**
     * Inizializza tutti i componenti dell'app
     */
    async initializeComponents() {
        this.partPath = window.location.hash;

        this.jsonDataInfo = await UtilityClass.GetJsonFromRootPage("DataInfo");

        this.htmlBuilder = new HtmlBuilder("../Views");
        // Initialize Wiki Manager
        this.wikiManager = new WikiManager();
        
        // Non inizializzare subito la wiki, aspetta che l'utente clicchi
        console.log('📚 WikiManager ready (lazy load)');
    }
    
    async BuildPage() {
        // Add Navbar
        let htmlNavbar = await this.htmlBuilder.GetStringView('Navbar.html');
        htmlNavbar = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlNavbar, this.jsonDataInfo);
        IndexManager.ReplaceHtmlContent("navbar", htmlNavbar);
        // Add Footer
        let htmlFooter = await this.htmlBuilder.GetStringView('Footer.html');
        htmlFooter = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlFooter, this.jsonDataInfo);
        IndexManager.ReplaceHtmlContent("footer", htmlFooter);
        // Add HomeSection
        let htmlSectionsHome = await this.htmlBuilder.GetStringView('ViewSections/Home.html');
        htmlSectionsHome = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsHome, this.jsonDataInfo);
        IndexManager.ReplaceHtmlContent("sectionHome", htmlSectionsHome);

        let htmlSectionsMedia = await this.htmlBuilder.GetStringView('ViewSections/Media.html');
        htmlSectionsMedia = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsMedia, this.jsonDataInfo);
        IndexManager.ReplaceHtmlContent("sectionMedia", htmlSectionsMedia);

        let htmlSectionsDownload = await this.htmlBuilder.GetStringView('ViewSections/Download.html');
        htmlSectionsDownload = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsDownload, this.jsonDataInfo);
        IndexManager.ReplaceHtmlContent("sectionDownload", htmlSectionsDownload);

        let htmlSectionsWiki = await this.htmlBuilder.GetStringView('ViewSections/Wiki.html');
        // console.log(htmlSectionsWiki); locale non carica intero a casua di LiveService ma da browser e ok
        htmlSectionsWiki = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsWiki, this.jsonDataInfo);
        IndexManager.ReplaceHtmlContent("sectionWiki", htmlSectionsWiki);

        // Initialize Wiki Manager when script loads
        this.wikiManager.init();
    }

    /**
     * Setup navigation system
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-rune, nav a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                
                const href = link.getAttribute('href');
                const sectionId = href.replace('#', '');
                console.log(sectionId);

                await this.navigateToSection(sectionId);
            });
        });
        
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.navigateToSection(e.state.section, false);
            }
        });
        
        // Set initial state
        const initialSection = window.location.hash.replace('#', '') || 'home';
        this.navigateToSection(initialSection, true);
    }
    
    /**
     * Naviga ad una sezione
     */
    async navigateToSection(sectionId, addToHistory = true) {
        // const targetSection = document.getElementById(`section${this.capitalize(sectionId)}`);
        // console.log(`section${this.capitalize(sectionId)}`);

        const targetSection = document.getElementById(sectionId);
        if (!targetSection) {
            console.warn(`Section not found: ${sectionId}`);
            return;
        }
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        targetSection.classList.add('active');
        
        // Update navigation active state
        document.querySelectorAll('.nav-rune').forEach(link => {
            link.classList.remove('active');
            const linkSection = link.getAttribute('href').replace('#section', '').toLowerCase();
            if (linkSection === sectionId.toLowerCase()) {
                link.classList.add('active');
            }
        });
        
        // Initialize Wiki if needed
        if (sectionId.toLowerCase() === 'wiki' && this.wikiManager && !this.wikiManager.initialized) {
            console.log('📚 Initializing WikiManager...');
            await this.wikiManager.init();
        }
        
        // Update history
        if (addToHistory) {
            const stateObj = { section: sectionId };
            const url = `#${sectionId}`;
            history.pushState(stateObj, '', url);
        }
        
        // Scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        this.currentSection = sectionId;
        console.log(`📍 Navigated to: ${sectionId}`);
    }
    
    /**
     * Setup visual effects
     */
    setupEffects() {
        // Canvas particles effect (se presente)
        const canvas = document.getElementById('fx');
        if (canvas) {
            this.initParticleEffect(canvas);
        }
    }
    
    /**
     * Inizializza effetto particelle Normali
     */
    initParticleEffect(canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = 50;
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
        
        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(212, 176, 107, ${particle.opacity})`;
                ctx.fill();
                
                // Glow effect
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 3
                );
                gradient.addColorStop(0, `rgba(212, 176, 107, ${particle.opacity * 0.5})`);
                gradient.addColorStop(1, 'rgba(212, 176, 107, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(
                    particle.x - particle.size * 3,
                    particle.y - particle.size * 3,
                    particle.size * 6,
                    particle.size * 6
                );
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
        
        // Resize handler
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
    
    /**
     * Capitalize first letter
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    /**
     * Distruggi l'app (cleanup)
     */
    destroy() {
        if (this.wikiManager) {
            this.wikiManager.destroy();
        }
        this.initialized = false;
        console.log('🗑️ App destroyed');
    }
}

// Initialize App
const app = new App();

// Expose to window for debugging
window.UOCS = {
    app,
    version: '1.0.0'
};

console.log('🎮 UOCS App loaded');