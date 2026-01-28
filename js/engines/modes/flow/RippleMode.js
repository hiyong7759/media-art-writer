export class RippleMode {
    constructor(engine) {
        this.engine = engine;
        this.ripples = [];
    }
    init() { this.ripples = []; }
    draw() {
        const ctx = this.engine.ctx;
        if (Math.random() > 0.95) {
            this.ripples.push({
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                r: 0,
                maxR: Math.random() * 100 + 50,
                color: this.engine.colors[1]
            });
        }
        this.ripples.forEach((r, i) => {
            r.r += 2;
            const alpha = 1 - (r.r / r.maxR);
            if (alpha <= 0) {
                this.ripples.splice(i, 1);
            } else {
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
                ctx.strokeStyle = this.engine.hexToRgba(r.color, alpha);
                ctx.stroke();
            }
        });
    }
}
