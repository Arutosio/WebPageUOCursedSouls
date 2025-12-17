// ==============================================
// 2. EVENTI AL CARICAMENTO DELLA PAGINA (DOMContentLoaded)
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Inizializzazione Logica Navigazione ---
    setupNavigationListeners();
    
    // --- Inizializzazione Effetto Particelle ---
    if (canvas && canvas.getContext) {
        ctx = canvas.getContext("2d"); // Assegna il contesto
        setupParticleEffect();
    }
});

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
        vy: Math.random() * 2 + 3, // Velocità Verticale
        vx: Math.random() * 1.5 + 0.5 // Velocità Orizzontale (per la diagonale)
    };
}