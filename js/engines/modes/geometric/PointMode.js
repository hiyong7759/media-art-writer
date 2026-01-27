export class PointMode {
    constructor(engine) {
        this.engine = engine;
        this.points = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        // Point variants: 0: Star, 1: Dust, 2: Grid
        const count = this.style === 2 ? 100 : 200;
        this.points = Array.from({ length: count }, () => ({
            x: Math.random() * this.engine.width,
            y: Math.random() * this.engine.height,
            z: Math.random() * 200,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
        }));
    }

    draw() {
        const ctx = this.engine.ctx;
        this.points.forEach(p => {
            if (this.style === 0) { // Star
                p.x += Math.sin(this.engine.frame * 0.001 + p.z) * 0.2;
                p.y += Math.cos(this.engine.frame * 0.001 + p.z) * 0.2;
            } else if (this.style === 1) { // Dust
                p.x += (Math.random() - 0.5) * 2;
                p.y += (Math.random() - 0.5) * 2;
            } else { // Grid
                // Static movement
            }

            if (p.x < 0) p.x = this.engine.width; if (p.x > this.engine.width) p.x = 0;
            if (p.y < 0) p.y = this.engine.height; if (p.y > this.engine.height) p.y = 0;

            const alpha = 0.3 + Math.sin(this.engine.frame * 0.05 + p.z) * 0.4;
            ctx.fillStyle = this.engine.hexToRgba(p.color, alpha);

            if (this.style === 2) { // Grid override
                const gap = 40;
                const gx = Math.floor(p.x / gap) * gap;
                const gy = Math.floor(p.y / gap) * gap;
                ctx.fillRect(gx, gy, 2, 2);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
}
