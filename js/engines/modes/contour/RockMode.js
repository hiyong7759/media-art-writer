export class RockMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        // Just some polygons
        if (Math.random() > 0.95) {
            const ctx = this.engine.ctx;
            const x = Math.random() * this.engine.width;
            const y = Math.random() * this.engine.height;
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 20, y - 10);
            ctx.lineTo(x + 40, y);
            ctx.lineTo(x + 20, y + 20);
            ctx.fill();
        }
    }
}
