import UtilityClass from "./UtilityClass.js";
import HtmlBuilder from "./HtmlBuilder.js";
import IndexManager from "./IndexManager.js";
import WikiManager from "./WikiManager.js";

// ==============================================
// 1. DICHIARAZIONE DI VARIABILI E COSTANTI GLOBALI
// ==============================================

// Riferimenti al Canvas e contesto (Necessari per l'effetto particelle)
const canvas = document.getElementById("fx");
// Costanti per l'Effetto Particelle
const NUM_PARTICLES = 120; 
const PARTICLE_COLOR = "rgba(100, 100, 255, 0.8)"; // Blu/Azzurro per la pioggia
// Variabili per l'Effetto Particelle (inizializzate in drawParticles)
let ctx;
let particles = [];

// Variabili di Istanze
var htmlBuilder;
var wikiManager;
var tabs = [];
var current = null;
var jsonDataInfo;

// Var Notifications
var toastLiveNotificationContainer;
var toastLiveNotification;
var toastLiveNotificationTitle;
var toastLiveNotificationMSG;

var partPath = window.location.hash
console.log(partPath);

// ==============================================
// 2. EVENTI AL CARICAMENTO DELLA PAGINA (DOMContentLoaded)
// ==============================================
document.addEventListener('DOMContentLoaded', async function() {

    htmlBuilder = new HtmlBuilder("../Views");
    jsonDataInfo = await UtilityClass.GetJsonFromRootPage("DataInfo");
    await BuildPage();
    InitTabs();
    
    // --- Inizializzazione Effetto Particelle ---
    if (canvas && canvas.getContext) {
        ctx = canvas.getContext("2d"); // Assegna il contesto
        setupParticleEffect();
    }

    AggiugiEventi();
});

// ==============================================
// 3. FUNZIONI DI INIZIALIZZAZIONE DEGLI EVENTI
// ==============================================
function AggiugiEventi() {
    document.addEventListener("click", HandleTabClick);
}

// ==============================================
// 4. FUNZIONI PRINCIPALI DI LOGICA
// ==============================================

// --- Logica Sezioni ---
function showSection(sectionId) {
    // Nascondi TUTTE le sezioni
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Trova e mostra la sezione desiderata
    const targetSection = document.querySelector(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Opzionale: scrolla in cima alla pagina dopo il cambio sezione
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Logica Particelle ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createParticle() {
    return { 
        x: Math.random() * canvas.width, 
        y: Math.random() * -canvas.height, // Inizia sopra lo schermo
        r: Math.random() * 1.5 + 0.5, 
        vy: Math.random() * 1 + 3, // Velocità Verticale
        vx: Math.random() * -2.5 + 0.5 // Velocità Orizzontale (per la diagonale)
    };
}


async function BuildPage() {

    jsonDataInfo = await UtilityClass.GetJsonFromRootPage("DataInfo");
    // Add Navbar
    let htmlNavbar = await htmlBuilder.GetStringView('Navbar.html');
    htmlNavbar = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlNavbar, jsonDataInfo);
    IndexManager.ReplaceHtmlContent("navbar", htmlNavbar);
    // Add Footer
    let htmlFooter = await htmlBuilder.GetStringView('Footer.html');
    htmlFooter = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlFooter, jsonDataInfo);
    IndexManager.ReplaceHtmlContent("footer", htmlFooter);
    // Add HomeSection
    let htmlSectionsHome = await htmlBuilder.GetStringView('ViewSections/Home.html');
    htmlSectionsHome = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsHome, jsonDataInfo);
    IndexManager.ReplaceHtmlContent("sectionHome", htmlSectionsHome);

    let htmlSectionsMedia = await htmlBuilder.GetStringView('ViewSections/Media.html');
    htmlSectionsMedia = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsMedia, jsonDataInfo);
    IndexManager.ReplaceHtmlContent("sectionMedia", htmlSectionsMedia);

    let htmlSectionsDownload = await htmlBuilder.GetStringView('ViewSections/Download.html');
    htmlSectionsDownload = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsDownload, jsonDataInfo);
    IndexManager.ReplaceHtmlContent("sectionDownload", htmlSectionsDownload);

    // Initialize Wiki Manager when script loads
    wikiManager = new WikiManager();

    // Add bachecaMessages
    // let htmlBachecaMessage = await htmlBuilder.GetStringView('ViewElements/BachecaMessage.html');
    // for (let jsonBachecaMsg of jsonDataInfo.bachecaMessages) {
    //     let htmlBachecaMessageTmp = await HtmlBuilder.RepalceKeysDataInfoOfBachecaMessage(htmlBachecaMessage, jsonBachecaMsg);
    //     IndexManager.InjecHtmlContentToTheEnd("bachecaMessages", htmlBachecaMessageTmp)
    // }
}

function HandleTabClick(event) {
    event.preventDefault();

    // Assicura che il target sia sempre l'<a>
    const target = event.target.closest("a");
    if (!target) return;

    // Se è già attivo, non fare nulla
    if (target.classList.contains("active")) return;

    const clickedTab = FindTabByElement(target);

    if (!clickedTab) {
        console.warn("Tab NON RICONOSCIUTO!", target);
        return;
    }

    if (current) {
        DeActivateTab(current);
    }

    ActivateTab(clickedTab);
    current = clickedTab;
}

function InitTabs() {
    tabs = [
        { tabI: document.querySelector("#iHome"),     tabS: document.querySelector("#sectionHome") },
        { tabI: document.querySelector("#iWiki"),     tabS: document.querySelector("#sectionWiki") },
        { tabI: document.querySelector("#iMedia"),    tabS: document.querySelector("#sectionMedia") },
        { tabI: document.querySelector("#iDownload"), tabS: document.querySelector("#sectionDownload") },
    ];

    // Disattiva tutto
    tabs.forEach(tab => DeActivateTab(tab));

    // Attiva il primo
    current = tabs[0];
    ActivateTab(current);
}

function ActivateTab(tab) {
    tab.tabI.classList.add("active");
    tab.tabS.classList.add("active");
    console.log(tab.tabS);
}

function DeActivateTab(tab) {
    tab.tabI.classList.remove("active");
    tab.tabS.classList.remove("active");
}

function FindTabByElement(el) {
    return tabs.find(tab => tab.tabI === el) || null;
}

// function FindTabByElement(el) {
//     for (let i = 0; i < tabs.length; i++) {
//         if (tabs[i].tabI === el) {
//             return tabs[i];
//         }
//     }
//     return null;
// }

// Imposta Google Maps
// const address = encodeURIComponent(contattiData.indirizzo);
// const mapIframe = document.getElementById('google-map');
// mapIframe.src = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${address}`;

//Funzione per mostrare il toast automaticamente
function ShowToast(title, msg) {
    if(title) {
        toastLiveNotificationTitle.textContent = title;
    }
    if(msg) {
        toastLiveNotificationMSG.textContent = msg;
    }
    toastLiveNotification.classList.add('show'); // Apri il toast
    const toast = new bootstrap.Toast(toastLiveNotification);
    toast.show();
}

function setupParticleEffect() {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Crea le particelle
    for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push(createParticle());
    }
    
    // Avvia il loop di disegno
    drawParticles();
}

function drawParticles() {
    // Pulisce il canvas ad ogni frame
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.fillStyle = PARTICLE_COLOR;

    particles.forEach(p => {
        // Disegna la particella
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        
        // Aggiornamento posizione (movimento diagonale)
        p.y += p.vy; 
        p.x += p.vx; 
        
        // Controlla il reset se esce dallo schermo
        if (p.y > canvas.height || p.x > canvas.width) {
            p.y = -5; // Riporta in cima
            p.x = Math.random() * canvas.width; // Posizione X casuale
        }
    });

    // Loop di animazione
    requestAnimationFrame(drawParticles);
}
