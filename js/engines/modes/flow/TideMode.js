export class TideMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        // Sine waves fill from bottom
        const ctx = this.engine.ctx;
        const w = this.engine.width;
        const h = this.engine.height;
        const t = this.engine.frame * 0.02;

        ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[2], 0.2);
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 10) {
            const y = h - 200 + Math.sin(x * 0.01 + t) * 50 + Math.sin(x * 0.03 - t) * 20;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.fill();
    }
}
