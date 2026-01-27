export class NovaMode {
    constructor(engine) {
        this.engine = engine;
        this.novaR = 0;
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.novaR = 0;
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        const speed = (this.style === 0) ? 2 : ((this.style === 1) ? 5 : 1);
        this.novaR += speed;
        if (this.novaR > this.engine.width) this.novaR = 0;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.novaR);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.8, this.engine.hexToRgba(this.engine.colors[1], 0.5));
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.beginPath();
        ctx.arc(cx, cy, this.novaR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        if (this.style !== 2) { // Not Remnant
            ctx.strokeStyle = this.engine.colors[0];
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - 50, cy); ctx.lineTo(cx + 50, cy);
            ctx.moveTo(cx, cy - 50); ctx.lineTo(cx, cy + 50);
            ctx.stroke();
        }
    }
}
