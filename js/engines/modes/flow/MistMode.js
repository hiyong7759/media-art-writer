export class MistMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        const ctx = this.engine.ctx;
        // Perlin noise-like clouds ideally, simple circles for now
        const t = this.engine.frame * 0.01;
        for (let i = 0; i < 10; i++) {
            const x = (Math.sin(t + i) * 0.5 + 0.5) * this.engine.width;
            const y = (Math.cos(t * 0.5 + i) * 0.5 + 0.5) * this.engine.height;
            const r = 100 + Math.sin(t * 2 + i) * 50;

            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, this.engine.hexToRgba(this.engine.colors[2], 0.1));
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        }
    }
}
