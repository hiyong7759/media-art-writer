export class RootMode {
    constructor(engine) {
        this.engine = engine;
        this.roots = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.roots = [];
        // Re-init logic is inside draw/check usually, but let's seed once
        this.seedRoots();
    }

    seedRoots() {
        const w = this.engine.width;
        const h = this.engine.height;

        let count = 5;
        if (this.style === 1) count = 15; // Fibrous
        if (this.style === 2) count = 3;  // Rhizome

        for (let i = 0; i < count; i++) {
            let x, y, angle;
            if (this.style === 2) { // Rhizome starts from side
                x = (i % 2 === 0) ? 0 : w;
                y = h - Math.random() * 100;
                angle = (i % 2 === 0) ? 0 : Math.PI;
            } else {
                x = w / 2 + (Math.random() - 0.5) * 100;
                y = h;
                angle = -Math.PI / 2;
            }

            this.roots.push({
                x: x,
                y: y,
                angle: angle + (Math.random() - 0.5),
                points: [{ x, y }],
                life: 100 + Math.random() * 100,
                active: true,
                width: (this.style === 0) ? 5 : 2, // Taproot thicker
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;

        // Grow
        this.roots.forEach(r => {
            if (r.active) {
                // Growth logic
                r.x += Math.cos(r.angle) * 2;
                r.y += Math.sin(r.angle) * 2;

                // Wiggle
                r.angle += (Math.random() - 0.5) * 0.2;
                // Gravity bias (roots go down, but Taproot goes specific)
                if (this.style !== 2) {
                    const targetAngle = -Math.PI / 2; // Up actually (canvas 0,0 is top-left, so bottom is high Y. Wait, if growing from bottom (h), we need to go UP (-y). 
                    // Previous code logic was growing from h to 0? SeedMode does that. Engine logic usually draws from 0 to h.
                    // This RootMode seeds at h and grows UP? 
                    // If y = h, angle = -PI/2 (UP).
                }

                r.points.push({ x: r.x, y: r.y });
                r.life--;

                // Branching
                if (Math.random() < 0.02 && r.width > 1) {
                    this.roots.push({
                        x: r.x, y: r.y,
                        angle: r.angle + (Math.random() - 0.5) * 1.0,
                        points: [{ x: r.x, y: r.y }],
                        life: r.life * 0.8,
                        active: true,
                        width: r.width * 0.6,
                        color: r.color
                    });
                }

                if (r.life <= 0) r.active = false;
            }

            // Draw
            ctx.beginPath();
            ctx.strokeStyle = r.color;
            ctx.lineWidth = r.width;
            ctx.lineCap = 'round';
            ctx.moveTo(r.points[0].x, r.points[0].y);
            r.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        });

        // Auto-reseeding if empty (optional)
        if (this.roots.every(r => !r.active) && Math.random() < 0.01) {
            this.init(this.style);
        }
    }
}
