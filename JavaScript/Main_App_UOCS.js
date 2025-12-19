/*===============================*/
/*         MAIN APP JS           */
/*===============================*/

// Import modules
import UtilityClass from "./UtilityClass.js";
import HtmlBuilder from "./HtmlBuilder.js";
import IndexManager from "./IndexManager.js";
import WikiManager from "./WikiManager.js";
import ParticleEffect from "./ParticleEffect.js";
import UOServerApi from "./UOServerApi.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

class Main_App_UOCS {
    constructor() {
        this.jsonDataInfo = null;
        this.htmlBuilder = null;
        this.wikiManager = null;
        this.currentSection = 'sectionHome';
        this.navbarScroll = null;

        //variable UO Shard API
        this.uoShardApi = null;
        this.statusData = null;
        this.playersData = null;
        this.elStatusServerChecking = null;
        this.elStatusServerOnline = null;
        this.elStatusServerOffline = null;
        this.elPlayerLabelPlayersChecking = null;
        this.elPlayerLabelPlayers = null;
        this.elPlayerLabelCountNumber = null;
        this.elPlayerLabelRealUnreachable = null;

        // Var Notifications
        this.toast_container = null;
        this.toastLiveNotification = null;
        this.toastLiveNotificationTimer = null;
        this.toastLiveNotificationTitle = null;
        this.toastLiveNotificationMSG = null;

        this.particleEffect = null;
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
            this.ShowToast('Welcome to UOCS!', 'The UOCS App has been successfully loaded.', 'success');
        }
    }
    
    async setup() {
        try {
            // Initialize components
            await this.initializeComponents();
            
            // Build initial page
            await this.BuildPage();

            // Sing element on variables
            this.SetVariables();

            // Setup navigation
            this.setupNavigation();
            
            this.Tick(); // Primo avvio immediato
            setInterval(() => this.Tick(), 60000); // Aggiorna ogni 60 secondi

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

        // Visual effects (Stile Ultima Online):
        this.particleEffect = new ParticleEffect('fx', 'ambient', 60);

        // Istanza della classe (IP, Porta, [User], [Pass])
        this.uoShardApi = new UOServerApi('127.0.0.1', '2593');

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

        let htmlSectionsContact = await this.htmlBuilder.GetStringView('ViewSections/Contact.html');
        htmlSectionsContact = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsContact, this.jsonDataInfo);
        IndexManager.ReplaceHtmlContent("sectionContact", htmlSectionsContact);

        let htmlSectionsDownload = await this.htmlBuilder.GetStringView('ViewSections/Download.html');
        htmlSectionsDownload = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsDownload, this.jsonDataInfo);
        IndexManager.ReplaceHtmlContent("sectionDownload", htmlSectionsDownload);

        let htmlSectionsStatus = await this.htmlBuilder.GetStringView('ViewSections/Status.html');
        htmlSectionsStatus = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsStatus, this.jsonDataInfo);
        let htmlElementRoadmap_item = await this.htmlBuilder.GetStringView("ViewElements/Roadmap_Item.html");
        htmlSectionsStatus = await HtmlBuilder.ProcessRoadmapSection(htmlSectionsStatus, this.jsonDataInfo, htmlElementRoadmap_item);
        IndexManager.ReplaceHtmlContent("sectionStatus", htmlSectionsStatus);

        let htmlSectionsWiki = await this.htmlBuilder.GetStringView('ViewSections/Wiki.html');
        // console.log(htmlSectionsWiki); locale non carica intero a casua di LiveService ma da browser e ok
        htmlSectionsWiki = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsWiki, this.jsonDataInfo);
        IndexManager.ReplaceHtmlContent("sectionWiki", htmlSectionsWiki);


        // Initialize Wiki Manager when script loads
        this.wikiManager.init();
    }

    SetVariables() {
        // Get elements for Toast Notifications
        this.toast_container = document.getElementById('toastContainer');
        this.toastLiveNotification = document.getElementById("toastLiveNotification");
        this.toastLiveNotificationTimer = document.getElementById("toastTime");
        this.toastLiveNotificationTitle = document.getElementById("toastTitle");
        this.toastLiveNotificationMSG = document.getElementById("toastMessage");

        // get elements for UO Shard API
        this.elStatusServerChecking = document.getElementById("server-status-text-checking");
        this.elStatusServerOnline = document.getElementById("server-status-text-online");
        this.elStatusServerOffline = document.getElementById("server-status-text-offline");

        this.elPlayerLabelPlayersChecking = document.getElementById("player-count-label-checking");
        this.elPlayerLabelCountNumber = document.getElementById("player-count-number");
        this.elPlayerLabelPlayers = document.getElementById("player-count-label-players");
        this.elPlayerLabelRealUnreachable = document.getElementById("player-count-label-unreachable");
    }

    /**
     * Setup navigation system
     */
    setupNavigation() {
        // const navLinks = document.querySelectorAll('.nav-rune, nav a[href^="#"]');
        const navLinks = document.querySelectorAll('#navbar .nav-link');
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

    onScroll() {
        let scrollPos = window.scrollY + 100; // Offset per la navbar fixed
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                const sectionId = section.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    //Funzione per mostrare il toast automaticamente
    ShowToast(title, message, type = "") {
        this.toastLiveNotification.classList.remove("toast-success", "toast-error", "toast-warning");
        if (type) this.toastLiveNotification.classList.add(`toast-${type}`);

        this.toastLiveNotificationTitle.innerText = title;
        this.toastLiveNotificationMSG.innerText = message;
        this.toastLiveNotificationTimer.innerText = "now";

        const toast = new bootstrap.Toast(this.toastLiveNotification, {delay: 4000});

        toast.show();
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

    async updateDashboard() {
        try {

            this.setServerCheckingUI();
            // Recupero dati
            this.statusData = await this.uoShardApi.getServerStatus();
            this.playersData = await this.uoShardApi.getPlayerList();

            // Se statusData è null, significa che il fetch è fallito (CORS o Server Spento)
            const isOnline = this.statusData && this.statusData.online === true;

            if (isOnline) {
                this.elStatusServerOffline.classList.add("hidden");
                this.elStatusServerOnline.classList.remove("hidden");

                const count = Array.isArray(this.playersData) ? this.playersData.length : 0;
                this.elPlayerLabelCountNumber.innerText = count;
                
                this.elPlayerLabelRealUnreachable.classList.add("hidden");
                this.elPlayerLabelCountNumber.classList.remove("hidden");
                this.elPlayerLabelPlayers.classList.remove("hidden");
            } else {
                // Entra qui se l'API risponde null o se online è false
                this.setServerOfflineUI();
            }
        } catch (e) {
            this.setServerOfflineUI();
        }
    }

    // Funzione di supporto per pulire il codice
    setServerOfflineUI() {

        this.elStatusServerChecking.classList.add("hidden");
        this.elStatusServerOnline.classList.add("hidden");
        this.elStatusServerOffline.classList.remove("hidden");
        
        this.elPlayerLabelPlayersChecking.classList.add("hidden");
        this.elPlayerLabelCountNumber.classList.add("hidden");
        this.elPlayerLabelPlayers.classList.add("hidden");
        this.elPlayerLabelRealUnreachable.classList.remove("hidden");
    }

    setServerCheckingUI() {
        this.elStatusServerOnline.classList.add("hidden");
        this.elStatusServerOffline.classList.add("hidden");
        this.elPlayerLabelCountNumber.classList.add("hidden");
        this.elPlayerLabelPlayers.classList.add("hidden");
        this.elPlayerLabelRealUnreachable.classList.add("hidden");

        this.elStatusServerChecking.classList.remove("hidden");
        this.elPlayerLabelPlayersChecking.classList.remove("hidden");
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

    // Il metodo che raggruppa tutto
    Tick() {
        console.log("Aggiornamento globale in corso...");
        this.updateDashboard();
        // this.updateEvents();
        // this.checkDiscordStatus();
        console.log("Aggiornamento globale completato.");
    }
}

// Initialize App
const app = new Main_App_UOCS();

// Expose to window for debugging
window.UOCS = {
    app,
    version: '1.0.0'
};

console.log('🎮 UOCS App loaded');