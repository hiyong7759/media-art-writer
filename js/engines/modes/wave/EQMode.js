export class EQMode {
    constructor(engine) {
        this.engine = engine;
        this.bars = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        const count = 30;
        this.bars = Array.from({ length: count }, () => Math.random());
    }

    draw() {
        const ctx = this.engine.ctx;
        const w = this.engine.width;
        const h = this.engine.height;
        const barW = w / this.bars.length;

        this.bars.forEach((val, i) => {
            // Simulate audio data
            const noise = Math.sin(this.engine.frame * 0.1 + i) * 0.5 + 0.5;
            const height = noise * h * 0.8;

            const x = i * barW;
            const y = h - height;

            ctx.fillStyle = this.engine.colors[i % this.engine.colors.length];

            if (this.style === 0) { // Digital: Blocks
                const blockH = 20;
                for (let by = h; by > y; by -= blockH + 2) {
                    ctx.globalAlpha = 1 - (h - by) / h;
                    ctx.fillRect(x + 2, by - blockH, barW - 4, blockH);
                }
                ctx.globalAlpha = 1;
            } else if (this.style === 1) { // Analog: Round bars
                ctx.beginPath();
                ctx.roundRect(x + 5, y, barW - 10, height, 5);
                ctx.fill();
            } else { // Spectrum: Line graph
                // Handled differently usually, but let's stick to bars for now to be safe
                const centerY = h / 2;
                ctx.fillRect(x + 2, centerY - height / 2, barW - 4, height);
            }
        });
    }
}
