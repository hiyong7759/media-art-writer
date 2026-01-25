import { ArtEngine } from './ArtEngine.js';

/**
 * Wave Engine (ECHO-0)
 * 부드러운 사인파, 흐름
 */
export class WaveEngine extends ArtEngine {
    constructor(canvas, ctx, colors) {
        super(canvas, ctx, colors);
        this.lines = [];
        this.initLines();
    }

    initLines() {
        this.lines = [];
        const count = 50;
        for (let i = 0; i < count; i++) {
            this.lines.push({
                y: (this.height / count) * i,
                amplitude: Math.random() * 50 + 20,
                frequency: Math.random() * 0.02 + 0.01,
                speed: Math.random() * 0.05 + 0.02,
                offset: Math.random() * Math.PI * 2,
                color: this.colors[i % this.colors.length]
            });
        }
    }

    resize(width, height) {
        super.resize(width, height);
        this.initLines();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.lines.forEach((line, index) => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.hexToRgba(line.color, 0.5);
            this.ctx.lineWidth = 2;

            for (let x = 0; x < this.width; x += 10) {
                const y = line.y +
                    Math.sin(x * line.frequency + this.frame * line.speed + line.offset) * line.amplitude +
                    Math.sin(x * line.frequency * 0.5 + this.frame * line.speed * 1.5) * (line.amplitude * 0.5);

                if (x === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        });
    }
}
