export class NoiseMode {
    constructor(engine) {
        this.engine = engine;
        this.style = 0;
    }

    init(variant) { this.style = variant; }

    draw() {
        const ctx = this.engine.ctx;
        const w = this.engine.width;
        const h = this.engine.height;
        const idata = ctx.getImageData(0, 0, w, h);
        const buffer = new Uint32Array(idata.data.buffer);

        // Too heavy to do full pixel noise every frame in JS?
        // Let's do partial or different visual.

        const count = 500;
        for (let i = 0; i < count; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const size = Math.random() * 3 + 1;

            ctx.fillStyle = this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)];

            if (this.style === 0) { // White
                if (Math.random() > 0.5) ctx.fillRect(x, y, size, size);
            } else if (this.style === 1) { // Pink (Soft)
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(x, y, size * 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            } else { // Static (Lines)
                ctx.fillRect(x, 0, 1, h); // Glitch lines
            }
        }
    }
}
