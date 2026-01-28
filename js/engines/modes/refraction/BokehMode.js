export class BokehMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        const ctx = this.engine.ctx;
        if (Math.random() > 0.6) {
            const x = Math.random() * this.engine.width;
            const y = Math.random() * this.engine.height;
            const r = Math.random() * 50 + 10;
            ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[0], 0.1);
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
