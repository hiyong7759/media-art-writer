export class GalaxyMode {
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

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.engine.frame * 0.005);

        const arms = (this.style === 0) ? 2 : ((this.style === 1) ? 1 : 4);

        for (let j = 0; j < arms; j++) {
            const armOffset = j * (Math.PI * 2 / arms);
            for (let i = 0; i < 200; i += 2) {
                const angle = i * 0.1 + armOffset;
                const r = i * 2;
                const spread = (Math.random() - 0.5) * (this.style === 2 ? 50 : 20);
                const x = Math.cos(angle) * r + spread;
                const y = Math.sin(angle) * r + spread;

                ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[j % this.engine.colors.length], 0.6);
                ctx.beginPath();
                ctx.arc(x, y, Math.random() * 2 + 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }
}
