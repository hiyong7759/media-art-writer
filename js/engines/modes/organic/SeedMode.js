export class SeedMode {
    constructor(engine) {
        this.engine = engine;
        this.particles = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.particles = [];

        let count = 30; // Default
        if (this.style === 0) count = 20; // Cell - fewer, larger
        if (this.style === 1) count = 40; // Sprout - more

        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        const w = this.engine.width;
        const h = this.engine.height;
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 5 + 5,
            angle: Math.random() * Math.PI * 2,
            growth: 0,
            maxSize: Math.random() * 10 + 10,
            color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)],
            phase: Math.random() * Math.PI * 2
        };
    }

    draw() {
        const ctx = this.engine.ctx;

        this.particles.forEach(p => {
            // Physics
            p.x += p.vx;
            p.y += p.vy;
            p.phase += 0.05;

            // Boundary wrap
            if (p.x < -50) p.x = this.engine.width + 50;
            if (p.x > this.engine.width + 50) p.x = -50;
            if (p.y < -50) p.y = this.engine.height + 50;
            if (p.y > this.engine.height + 50) p.y = -50;

            ctx.fillStyle = this.engine.hexToRgba(p.color, 0.7);

            if (this.style === 0) { // Cell (Metaball-ish / Dividing)
                const wobble = Math.sin(p.phase) * 2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size + wobble, 0, Math.PI * 2);
                ctx.fill();

                // Nucleus
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.beginPath();
                ctx.arc(p.x + wobble, p.y - wobble, p.size * 0.3, 0, Math.PI * 2);
                ctx.fill();

                // Membrane effect
                ctx.strokeStyle = this.engine.hexToRgba(p.color, 0.3);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size + 4 + wobble, 0, Math.PI * 2);
                ctx.stroke();

            } else if (this.style === 1) { // Sprout (Rising)
                p.y -= Math.abs(p.vy) + 0.5; // Always go up
                const sway = Math.sin(p.phase * 0.5) * 5;

                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y + 20);
                ctx.quadraticCurveTo(p.x + sway, p.y + 10, p.x, p.y);
                ctx.stroke();

                // Leaf
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, 6, 3, Math.PI / 4 + sway * 0.1, 0, Math.PI * 2);
                ctx.fill();

            } else { // Egg (Floating & Glowing)
                const pulse = Math.sin(p.phase) * 0.1 + 1;
                ctx.shadowBlur = 15;
                ctx.shadowColor = p.color;

                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * pulse);
                grad.addColorStop(0, 'rgba(255,255,255,0.9)');
                grad.addColorStop(0.4, p.color);
                grad.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
    }
}
