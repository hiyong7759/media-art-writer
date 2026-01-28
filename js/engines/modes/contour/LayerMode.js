export class LayerMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        // Horizontal stripes
        const ctx = this.engine.ctx;
        const h = this.engine.height / 10;
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[i % 3], 0.1);
            ctx.fillRect(0, i * h, this.engine.width, h - 2);
        }
    }
}
