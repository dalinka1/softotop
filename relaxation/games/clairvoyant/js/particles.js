// Система частиц для мистического фонового эффекта
class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.createParticles();
        this.animate();
    }

    createCanvas() {
        const container = document.getElementById('particles-canvas');
        if (!container) return;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        
        container.appendChild(this.canvas);
        
        this.resize();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }

    resize() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const particleCount = Math.min(50, Math.floor(window.innerWidth / 20));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight
            ));
        }
    }

    animate() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Обновить и нарисовать частицы
        this.particles.forEach(particle => {
            particle.update(this.mouseX, this.mouseY);
            particle.draw(this.ctx);
        });
        
        // Нарисовать связи между близкими частицами
        this.drawConnections();
        
        requestAnimationFrame(() => this.animate());
    }

    drawConnections() {
        const maxDistance = 120;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const distance = Math.sqrt(
                    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
                );
                
                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.3;
                    
                    this.ctx.strokeStyle = `rgba(108, 92, 231, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 3 + 1;
        this.color = this.getRandomColor();
        this.opacity = Math.random() * 0.8 + 0.2;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.02 + 0.01;
    }

    getRandomColor() {
        const colors = [
            '108, 92, 231',   // primary
            '162, 155, 254',  // secondary  
            '253, 121, 168',  // accent
            '0, 184, 148',    // success
            '253, 203, 110'   // warning
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(mouseX, mouseY) {
        // Обычное движение
        this.x += this.vx;
        this.y += this.vy;
        
        // Притяжение к исходной позиции
        const dx = this.originalX - this.x;
        const dy = this.originalY - this.y;
        this.x += dx * 0.01;
        this.y += dy * 0.01;
        
        // Реакция на мышь
        const mouseDistance = Math.sqrt(
            Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2)
        );
        
        if (mouseDistance < 100) {
            const force = (100 - mouseDistance) / 100;
            const angle = Math.atan2(this.y - mouseY, this.x - mouseX);
            this.x += Math.cos(angle) * force * 2;
            this.y += Math.sin(angle) * force * 2;
        }
        
        // Границы экрана
        if (this.x < 0) this.x = window.innerWidth;
        if (this.x > window.innerWidth) this.x = 0;
        if (this.y < 0) this.y = window.innerHeight;
        if (this.y > window.innerHeight) this.y = 0;
        
        // Обновить фазу пульсации
        this.pulsePhase += this.speed;
    }

    draw(ctx) {
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
        const currentSize = this.size * pulse;
        const currentOpacity = this.opacity * pulse;
        
        // Основная частица
        ctx.fillStyle = `rgba(${this.color}, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Свечение
        if (currentOpacity > 0.5) {
            const glowGradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, currentSize * 3
            );
            glowGradient.addColorStop(0, `rgba(${this.color}, ${currentOpacity * 0.3})`);
            glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentSize * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Создать эффект звёздного неба
class StarField {
    constructor() {
        this.stars = [];
        this.init();
    }

    init() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * 0.8 + 0.2,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    update() {
        this.stars.forEach(star => {
            star.twinklePhase += 0.02;
            star.opacity = (Math.sin(star.twinklePhase) + 1) * 0.4 + 0.2;
        });
    }

    draw(ctx) {
        this.stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// Экспорт для использования в других модулях
window.ParticleSystem = ParticleSystem;
window.StarField = StarField;