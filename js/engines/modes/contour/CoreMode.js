export class CoreMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;
        ctx.fillStyle = this.engine.colors[2];
        ctx.beginPath();
        ctx.arc(cx, cy, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = this.engine.colors[1];
        ctx.beginPath();
        ctx.arc(cx, cy, 80, 0, Math.PI * 2);
        ctx.stroke();
    }
}
