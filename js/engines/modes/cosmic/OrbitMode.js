export class OrbitMode {
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

        ctx.lineWidth = 1;
        // Variants: 0: Planetary, 1: Ring, 2: Satellite
        const count = (this.style === 1) ? 5 : ((this.style === 2) ? 15 : 10);

        for (let i = 1; i <= count; i++) {
            const r = i * (this.style === 2 ? 20 : 40);
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.stroke();

            const angle = this.engine.frame * (0.05 / i) * (this.style === 1 ? -1 : 1);
            const px = cx + Math.cos(angle) * r;
            const py = cy + Math.sin(angle) * r;

            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.colors[i % this.engine.colors.length];
            ctx.fill();
        }
    }
}
