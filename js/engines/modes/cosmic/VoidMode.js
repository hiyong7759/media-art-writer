export class VoidMode {
    constructor(engine) {
        this.engine = engine;
        this.particles = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        const count = (this.style === 0) ? 100 : 200;
        this.particles = Array.from({ length: count }, () => ({
            angle: Math.random() * Math.PI * 2,
            dist: Math.random() * 300 + 50,
            speed: Math.random() * 0.05 + 0.01
        }));
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        const coreSize = (this.style === 2) ? 10 : 40; // Singularity is small

        ctx.beginPath();
        ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        this.particles.forEach(p => {
            p.angle += p.speed * (100 / p.dist);
            p.dist -= 0.5;
            if (p.dist < coreSize) p.dist = 350;

            const x = cx + Math.cos(p.angle) * p.dist;
            const y = cy + Math.sin(p.angle) * p.dist * ((this.style === 1) ? 0.8 : 0.3); // Horizon

            ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[2], 0.8);
            ctx.fillRect(x, y, 2, 2);
        });
    }
}
