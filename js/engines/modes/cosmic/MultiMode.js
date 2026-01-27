export class MultiMode {
    constructor(engine) {
        this.engine = engine;
        this.bubbles = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.bubbles = Array.from({ length: 20 }, () => ({
            x: Math.random() * this.engine.width,
            y: Math.random() * this.engine.height,
            r: Math.random() * 50 + 20
        }));
    }

    draw() {
        const ctx = this.engine.ctx;
        this.bubbles.forEach(b => {
            if (this.style === 2) b.y -= 2;
            else b.y -= 0.5;

            if (b.y < -100) b.y = this.engine.height + 100;

            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[3] || '#fff', 0.3);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.stroke();

            if (this.style === 1) { // Foam
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(b.x + b.r * 0.3, b.y - b.r * 0.3, b.r * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fill();
            }
        });
    }
}
