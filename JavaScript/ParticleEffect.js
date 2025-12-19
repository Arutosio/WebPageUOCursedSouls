export default class ParticleEffect {
    constructor(canvasId, type = 'snow', numParticles = 100) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas || !this.canvas.getContext) return;

        this.ctx = this.canvas.getContext("2d");
        this.type = type;
        this.numParticles = numParticles;
        this.particles = [];
        this.animationId = null; // Aggiungi questa proprietà per tracciare l'animazione

        this.init();
    }

    init() {
        this.resizeCanvas();
        
        // Rimuovi eventuali listener precedenti prima di aggiungerne uno nuovo
        window.removeEventListener("resize", this.resizeBound);
        this.resizeBound = () => this.resizeCanvas();
        window.addEventListener("resize", this.resizeBound);

        // Ferma qualsiasi animazione esistente
        this.stop();

        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            const p = { 
                x: Math.random() * this.canvas.width, 
                y: Math.random() * this.canvas.height 
            };
            this.particles.push(this.setupParticle(p));
        }

        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Metodo per cambiare il tipo di effetto
    setType(type) {
        if (this.type === type) return;
        
        this.type = type;
        this.reinitializeParticles();
    }

    // Reinizializza le particelle con il nuovo tipo
    reinitializeParticles() {
        this.particles = this.particles.map(p => {
            // Mantieni la posizione corrente o resetta se necessario
            const newParticle = { x: p.x, y: p.y };
            return this.setupParticle(newParticle);
        });
        
        // Se hai bisogno di più particelle, aggiungile
        if (this.particles.length < this.numParticles) {
            for (let i = this.particles.length; i < this.numParticles; i++) {
                const p = { 
                    x: Math.random() * this.canvas.width, 
                    y: Math.random() * this.canvas.height 
                };
                this.particles.push(this.setupParticle(p));
            }
        }
    }

    setupParticle(p) {
        // Reset completo di tutte le proprietà
        p.vx = 0;
        p.vy = 0;
        p.r = 0;
        p.length = 0;
        p.size = 0;
        p.opacity = 1;
        p.color = null;

        switch (this.type) {
            case 'rain':
                p.vy = Math.random() * 1 + 3;
                p.vx = (Math.random() * 1 + 0) * -1;
                p.length = Math.random() * 10 + 1;
                p.opacity = Math.random() * 0.4 + 0.1;
                p.color = 'rgba(174, 194, 224)';
                break;

            case 'ambient':
                p.vx = (Math.random() - 0.5) * 0.5;
                p.vy = (Math.random() - 0.5) * 0.5;
                p.size = Math.random() * 2 + 0.5;
                p.opacity = Math.random() * 0.3 + 0.1;
                p.color = 'rgba(212, 176, 107)';
                break;

            case 'snow':
            default:
                p.r = Math.random() * 1.5 + 0.5;
                p.vy = Math.random() * 2 + 1;
                p.vx = Math.random() * 1 - 0.5;
                p.opacity = 0.7;
                p.color = 'rgba(255, 255, 255)';
                break;
        }
        return p;
    }

    updateParticle(p) {
        p.x += p.vx;
        p.y += p.vy;

        if (this.type === 'ambient') {
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
        } else {
            // Reset per neve e pioggia quando escono
            if (p.y > this.canvas.height || (this.type === 'rain' && p.x < -20)) {
                p.y = -20;
                p.x = Math.random() * (this.canvas.width + (this.type === 'rain' ? 200 : 0));
                
                // Rigioca la particella con le proprietà corrette
                this.setupParticle(p);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            this.ctx.save();
            
            if (this.type === 'ambient') {
                // Effetto ambient (polvere con glow)
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(212, 176, 107, ${p.opacity})`;
                this.ctx.fill();

                const glowSize = p.size * 3;
                const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
                gradient.addColorStop(0, `rgba(212, 176, 107, ${p.opacity * 0.5})`);
                gradient.addColorStop(1, 'rgba(212, 176, 107, 0)');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);

            } else if (this.type === 'rain') {
                // Effetto pioggia
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(174, 194, 224, ${p.opacity})`;
                this.ctx.lineWidth = 1;
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x + p.vx, p.y + p.length);
                this.ctx.stroke();

            } else {
                // Effetto neve (default)
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                this.ctx.fill();
            }

            this.ctx.restore();
            this.updateParticle(p);
        });
    }

    animate() {
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    // Metodo per fermare l'animazione
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // Metodo per pulire tutto
    destroy() {
        this.stop();
        window.removeEventListener("resize", this.resizeBound);
        this.particles = [];
    }
}