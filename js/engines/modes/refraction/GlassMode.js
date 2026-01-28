export class GlassMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        const ctx = this.engine.ctx;
        // Shards
        if (Math.random() > 0.9) {
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.beginPath();
            const x = Math.random() * this.engine.width;
            const y = Math.random() * this.engine.height;
            ctx.moveTo(x, y);
            ctx.lineTo(x + 50, y + 20);
            ctx.lineTo(x + 10, y + 60);
            ctx.fill();
        }
    }
}
