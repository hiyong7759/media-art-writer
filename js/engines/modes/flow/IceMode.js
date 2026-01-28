export class IceMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        const ctx = this.engine.ctx;
        // Angular shapes
        if (Math.random() > 0.8) {
            const x = Math.random() * this.engine.width;
            const y = Math.random() * this.engine.height;
            const size = Math.random() * 50 + 20;
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.random() * size - size / 2, y + Math.random() * size - size / 2);
            ctx.stroke();
        }
    }
}
