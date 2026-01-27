export class QuasarMode {
    constructor(engine) {
        this.engine = engine;
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[1], 0.5);
        ctx.lineWidth = 4;

        const flicker = Math.random() * 50;
        const active = (this.style === 2);
        const len = active ? 400 : 200;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + len + flicker, cy - len - flicker);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - len - flicker, cy + len + flicker);
        ctx.stroke();
    }
}
