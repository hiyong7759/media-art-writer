export class WindMode {
    constructor(engine) {
        this.engine = engine;
        this.particles = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.particles = [];

        let count = 50;
        if (this.style === 1) count = 100; // Gust needs more lines
        if (this.style === 2) count = 200; // Pollen needs many particles

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                len: Math.random() * 50 + 20,
                speed: Math.random() * 2 + 1,
                size: Math.random() * 2 + 1,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)],
                offset: Math.random() * Math.PI * 2
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;

        if (this.style === 0) { // Breeze: Gentle curves
            ctx.lineWidth = 1;
            this.particles.forEach(p => {
                p.x += p.speed;
                p.y += Math.sin(p.x * 0.01 + p.offset) * 0.5;

                if (p.x > this.engine.width) {
                    p.x = -p.len;
                    p.y = Math.random() * this.engine.height;
                }

                ctx.strokeStyle = this.engine.hexToRgba(p.color, 0.4);
                ctx.beginPath();
                // Draw a wave segment
                for (let i = 0; i < p.len; i += 5) {
                    const y = p.y + Math.sin((p.x - i) * 0.02 + p.offset) * 10;
                    if (i === 0) ctx.moveTo(p.x - i, y);
                    else ctx.lineTo(p.x - i, y);
                }
                ctx.stroke();
            });

        } else if (this.style === 1) { // Gale: Fast straight lines
            ctx.lineWidth = 2;
            this.particles.forEach(p => {
                p.x += p.speed * 5; // Fast
                if (p.x > this.engine.width) {
                    p.x = -p.len * 2;
                    p.y = Math.random() * this.engine.height;
                }

                const grad = ctx.createLinearGradient(p.x - p.len * 2, p.y, p.x, p.y);
                grad.addColorStop(0, 'rgba(255,255,255,0)');
                grad.addColorStop(0.5, this.engine.hexToRgba(p.color, 0.5));
                grad.addColorStop(1, 'rgba(255,255,255,0)');

                ctx.strokeStyle = grad;
                ctx.beginPath();
                ctx.moveTo(p.x - p.len * 2, p.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            });

        } else { // Pollen: Swirling particles
            this.particles.forEach(p => {
                const noise = Math.sin(p.y * 0.01 + this.engine.frame * 0.01);
                p.x += p.speed + noise * 2;
                p.y += Math.cos(p.x * 0.01) * 0.5;
                p.offset += 0.1;

                if (p.x > this.engine.width) p.x = -10;
                if (p.y > this.engine.height) p.y = 0;
                if (p.y < 0) p.y = this.engine.height;

                ctx.fillStyle = this.engine.hexToRgba(p.color, 0.6);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Sparkle
                if (Math.random() > 0.95) {
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(p.x, p.y, 2, 2);
                }
            });
        }
    }
}
