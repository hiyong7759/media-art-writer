export class ScannerMode {
    constructor(engine) {
        this.engine = engine;
        this.scanY = 0;
        this.scanX = 0;
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        console.log(`[ScannerMode] Style: ${['Horizontal', 'Vertical', 'Quantum'][this.style]}`);
        this.scanY = 0;
        this.scanX = 0;
    }

    draw() {
        const ctx = this.engine.ctx;
        const w = this.engine.width;
        const h = this.engine.height;
        const colors = this.engine.colors;

        if (this.style === 0) {
            this.scanY += 2;
            if (this.scanY > h) this.scanY = -100;

            ctx.shadowBlur = 20;
            ctx.shadowColor = colors[0];
            ctx.fillStyle = this.engine.hexToRgba(colors[0], 0.8);
            ctx.fillRect(0, this.scanY, w, 4);
            ctx.fillStyle = this.engine.hexToRgba(colors[0], 0.1);
            ctx.fillRect(0, this.scanY - 20, w, 20);
            ctx.shadowBlur = 0;
        }
        else if (this.style === 1) {
            this.scanX += 4;
            if (this.scanX > w) this.scanX = -100;

            ctx.shadowBlur = 20;
            ctx.shadowColor = colors[1];
            ctx.fillStyle = this.engine.hexToRgba(colors[1], 0.8);
            ctx.fillRect(this.scanX, 0, 4, h);
            ctx.shadowBlur = 0;
        }
        else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
            if (Math.random() > 0.5) ctx.fillRect(Math.random() * w, Math.random() * h, 50, 2);

            if (Math.random() > 0.9) {
                const y = Math.random() * h;
                const height = Math.random() * 50;
                ctx.fillStyle = this.engine.hexToRgba(colors[0], 0.1);
                ctx.fillRect(0, y, w, height);
            }

            if (Math.random() > 0.98) {
                ctx.fillStyle = this.engine.hexToRgba(colors[1], 0.15);
                ctx.fillRect(0, 0, w, h);
            }
        }

        let glitchChance = this.style === 2 ? 0.7 : 0.85;

        if (Math.random() > glitchChance) {
            const gw = Math.random() * 200 + 50;
            const gh = Math.random() * 20 + 2;
            const gx = Math.random() * w;

            let gy;
            if (this.style === 0) gy = this.scanY + (Math.random() - 0.5) * 100;
            else if (this.style === 1) gy = Math.random() * h;
            else gy = Math.random() * h;

            ctx.fillStyle = this.engine.hexToRgba(this.style === 1 ? colors[0] : colors[1], 0.6);
            ctx.fillRect(gx, gy, gw, gh);
        }
    }
}
