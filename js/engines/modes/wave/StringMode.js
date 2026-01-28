export class StringMode {
    constructor(engine) {
        this.engine = engine;
        this.strings = [];
    }

    init(v) {
        this.strings = Array.from({ length: 6 }, (_, i) => ({
            y: (this.engine.height / 7) * (i + 1),
            tension: Math.random() * 0.5 + 0.1
        }));
    }

    draw() {
        const ctx = this.engine.ctx;

        this.strings.forEach((s, i) => {
            ctx.beginPath();
            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[i % this.engine.colors.length], 0.8);
            ctx.lineWidth = 2;

            for (let x = 0; x <= this.engine.width; x += 10) {
                // Pluck effect
                const vibration = Math.sin(x * 0.1 + this.engine.frame * s.tension * 2) * Math.exp(-Math.abs(x - this.engine.width / 2) / 200) * 20;

                const y = s.y + vibration;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });
    }
}
