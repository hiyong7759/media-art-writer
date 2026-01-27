export class RainMode {
    constructor(engine) {
        this.engine = engine;
        this.drops = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        console.log(`[RainMode] Style: ${['Modern', 'Binary', 'Storm'][this.style]}`);

        const columns = Math.floor(this.engine.width / 15);
        this.drops = Array(columns).fill(0).map(() => Math.random() * this.engine.height);
    }

    draw() {
        const ctx = this.engine.ctx;
        const chars = '가나다라마바사아자차카타파하디지털코드데이터미래네온시티전력신호접속흐름빛';
        ctx.font = '15px monospace';

        for (let i = 0; i < this.drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * 15;
            const y = this.drops[i];

            if (Math.random() > 0.98) {
                ctx.fillStyle = '#ffffff';
            } else {
                ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[0], 0.9);
            }

            ctx.fillText(char, x, y);

            if (this.style === 1) this.drops[i] += 2;      // Binary
            else if (this.style === 2) this.drops[i] += 8; // Storm
            else this.drops[i] += 5;                       // Modern

            if (this.drops[i] > this.engine.height && Math.random() > 0.975) {
                this.drops[i] = -20;
            }
        }
    }
}
