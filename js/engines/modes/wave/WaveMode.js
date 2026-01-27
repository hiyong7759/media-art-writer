export class WaveMode {
    constructor(engine) {
        this.engine = engine;
        this.lines = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.lines = [];
        const count = 50;
        let freqMult = 1.0;
        let speedMult = 1.0;

        if (this.style === 1) { // Variant 1
            freqMult = 0.5;
            speedMult = 0.5;
        } else if (this.style === 2) { // Variant 2
            freqMult = 2.0;
            speedMult = 2.0;
        }

        for (let i = 0; i < count; i++) {
            this.lines.push({
                y: (this.engine.height / count) * i,
                amplitude: Math.random() * 50 + 20,
                frequency: (Math.random() * 0.02 + 0.01) * freqMult,
                speed: (Math.random() * 0.05 + 0.02) * speedMult,
                offset: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        this.lines.forEach((line) => {
            ctx.beginPath();
            ctx.strokeStyle = this.engine.hexToRgba(line.color, 0.5);
            ctx.lineWidth = 2;

            for (let x = 0; x < this.engine.width; x += 10) {
                let y = line.y;
                // Variant logic
                if (this.style === 1) {
                    // Square-like
                    if (Math.sin(x * line.frequency) > 0) y += line.amplitude;
                    else y -= line.amplitude;
                } else {
                    y += Math.sin(x * line.frequency + this.engine.frame * line.speed + line.offset) * line.amplitude +
                        Math.sin(x * line.frequency * 0.5 + this.engine.frame * line.speed * 1.5) * (line.amplitude * 0.5);
                }

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });
    }
}
