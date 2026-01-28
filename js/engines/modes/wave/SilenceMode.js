export class SilenceMode {
    constructor(engine) { this.engine = engine; }
    init(v) { }
    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // Minimalist
        ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[0], 0.1);
        ctx.beginPath();
        ctx.arc(cx, cy, 100 + Math.sin(this.engine.frame * 0.05) * 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(this.engine.width, cy);
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
}
