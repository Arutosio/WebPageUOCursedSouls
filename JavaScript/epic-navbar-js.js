/*===============================*/
/*   EPIC NAVBAR FUNCTIONALITY   */
/*===============================*/

export default class EpicNavbar {
    constructor() {
        this.navItems = null;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.init();
    }
    
    init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.navItems = document.querySelectorAll('.nav-rune');
        this.canvas = document.getElementById('navParticles');
        
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();
            this.setupParticles();
            this.animate();
        }
        
        this.setupNavigation();
        this.setupScrollEffect();
    }
    
    setupCanvas() {
        const header = document.getElementById('epicHeader');
        if (header) {
            this.canvas.width = header.offsetWidth;
            this.canvas.height = header.offsetHeight;
        }
        
        // Resize handler
        window.addEventListener('resize', () => {
            if (header) {
                this.canvas.width = header.offsetWidth;
                this.canvas.height = header.offsetHeight;
            }
        });
    }
    
    setupParticles() {
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(212, 176, 107, ${particle.opacity})`;
            this.ctx.fill();
            
            // Glow effect
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 3
            );
            gradient.addColorStop(0, `rgba(212, 176, 107, ${particle.opacity * 0.5})`);
            gradient.addColorStop(1, 'rgba(212, 176, 107, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                particle.x - particle.size * 3,
                particle.y - particle.size * 3,
                particle.size * 6,
                particle.size * 6
            );
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    setupNavigation() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all
                this.navItems.forEach(nav => nav.classList.remove('active'));
                
                // Add active class to clicked
                item.classList.add('active');
                
                // Navigate to section
                const href = item.getAttribute('href');
                const section = document.querySelector(href);
                
                if (section) {
                    // Hide all sections
                    document.querySelectorAll('.section').forEach(sec => {
                        sec.classList.remove('active');
                    });
                    
                    // Show target section
                    section.classList.add('active');
                    
                    // Smooth scroll to top
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    
                    // Trigger particle burst effect
                    this.particleBurst(item);
                }
            });
            
            // Hover effect - spawn particles
            item.addEventListener('mouseenter', () => {
                this.spawnHoverParticles(item);
            });
        });
    }
    
    particleBurst(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create burst particles
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            const speed = 2 + Math.random() * 2;
            
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 2,
                opacity: 0.8,
                life: 60
            });
        }
    }
    
    spawnHoverParticles(element) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        // Spawn floating particles
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.particles.push({
                    x: x + (Math.random() - 0.5) * 30,
                    y: y + (Math.random() - 0.5) * 30,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: -Math.random() * 2 - 1,
                    size: Math.random() * 2 + 1,
                    opacity: 0.6,
                    life: 30
                });
            }, i * 100);
        }
    }
    
    setupScrollEffect() {
        let lastScroll = 0;
        const header = document.getElementById('epicHeader');
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > lastScroll && currentScroll > 100) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });
        
        // Add transition
        header.style.transition = 'transform 0.3s ease';
    }
}