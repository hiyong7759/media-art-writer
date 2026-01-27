export class LifeMode {
    constructor(engine) {
        this.engine = engine;
        this.particles = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.particles = [];

        let count = 20;
        if (this.style === 2) count = 10; // Spirit
        if (this.style === 1) count = 15; // Butterfly

        for (let i = 0; i < count; i++) this.addParticle();
    }

    addParticle() {
        this.particles.push({
            x: Math.random() * this.engine.width,
            y: Math.random() * this.engine.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 5 + 5,
            color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)],
            phase: Math.random() * Math.PI * 2,
            history: [] // For trails
        });
    }

    draw() {
        const ctx = this.engine.ctx;

        this.particles.forEach(p => {
            // Move
            const noise = Math.sin(this.engine.frame * 0.05 + p.phase);
            p.x += p.vx + noise;
            p.y += p.vy;

            // Wrap
            if (p.x < -20) p.x = this.engine.width + 20;
            if (p.x > this.engine.width + 20) p.x = -20;
            if (p.y < -20) p.y = this.engine.height + 20;
            if (p.y > this.engine.height + 20) p.y = -20;

            // History
            p.history.push({ x: p.x, y: p.y });
            if (p.history.length > 20) p.history.shift();

            if (this.style === 0) { // Firefly
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ffff00';
                ctx.fillStyle = '#ffffaa';

                const blink = Math.abs(Math.sin(this.engine.frame * 0.1 + p.phase));
                ctx.globalAlpha = blink;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;

            } else if (this.style === 1) { // Butterfly
                ctx.fillStyle = p.color;
                const flap = Math.abs(Math.sin(this.engine.frame * 0.3 + p.phase)) * 10;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI / 2);

                // Wings
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-flap, -10);
                ctx.lineTo(-flap * 0.8, 10);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(flap, -10);
                ctx.lineTo(flap * 0.8, 10);
                ctx.fill();

                ctx.restore();

            } else { // Spirit
                ctx.beginPath();
                ctx.strokeStyle = this.engine.hexToRgba(p.color, 0.2);
                ctx.lineWidth = 10;
                ctx.lineCap = 'round';

                if (p.history.length > 2) {
                    ctx.moveTo(p.history[0].x, p.history[0].y);
                    p.history.forEach(pt => ctx.lineTo(pt.x, pt.y));
                    ctx.stroke();
                }

                // Head
                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 15;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
    }
}
