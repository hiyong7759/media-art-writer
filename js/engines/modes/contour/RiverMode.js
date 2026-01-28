export class RiverMode {
    constructor(engine) {
        this.engine = engine;
    }
    init() { }
    draw() {
        const ctx = this.engine.ctx;
        // Curve across screen
        const t = this.engine.frame * 0.01;
        ctx.beginPath();
        for (let x = 0; x < this.engine.width; x += 10) {
            const y = this.engine.height / 2 + Math.sin(x * 0.01 + t) * 100;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = this.engine.colors[1];
        ctx.lineWidth = 20;
        ctx.stroke();
    }
}
