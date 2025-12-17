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
    
    // --- Inizializzazione Effetto Particelle ---
    if (canvas && canvas.getContext) {
        ctx = canvas.getContext("2d"); // Assegna il contesto
        setupParticleEffect();
    }

    AggiugiEventi();
});

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
