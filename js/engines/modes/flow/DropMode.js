export class DropMode {
    constructor(engine) {
        this.engine = engine;
        this.drops = [];
    }
    init() {
        this.drops = [];
    }
    draw() {
        const ctx = this.engine.ctx;
        if (Math.random() > 0.9) {
            this.drops.push({
                x: Math.random() * this.engine.width,
                y: 0,
                vy: Math.random() * 5 + 5,
                len: Math.random() * 20 + 10,
                color: this.engine.colors[0]
            });
        }
        this.drops.forEach((d, i) => {
            d.y += d.vy;
            if (d.y > this.engine.height) {
                // Splash effect could be added here
                this.drops.splice(i, 1);
            } else {
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = this.engine.hexToRgba(d.color, 0.6);
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x, d.y - d.len);
                ctx.stroke();
            }
        });
    }
}
