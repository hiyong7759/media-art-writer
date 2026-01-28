import { BaseMode } from '../../../core/BaseMode.js';

export class WaveMode extends BaseMode {
    constructor(engine) {
        super(engine);
        this.waves = [];
    }

    init(variant = 0) {
        super.init(variant);
        this.waves = Array.from({ length: 12 }, (_, i) => ({
            y: this.height / 2 + (Math.random() - 0.5) * 200,
            amplitude: Math.random() * 20 + 10,
            frequency: Math.random() * 0.01 + 0.005,
            speed: Math.random() * 0.05 + 0.02,
            offset: Math.random() * Math.PI * 2,
            color: this.colors[i % this.colors.length]
        }));
    }

    draw() {
        this.waves.forEach(w => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.hexToRgba(w.color, 0.6);
            this.ctx.lineWidth = 2;

            if (this.style === 0) { // Sine
                for (let x = 0; x < this.width; x += 5) {
                    const y = w.y + Math.sin(x * w.frequency + this.frame * w.speed + w.offset) * w.amplitude;
                    if (x === 0) this.ctx.moveTo(x, y);
                    else this.ctx.lineTo(x, y);
                }
            } else if (this.style === 1) { // Square
                for (let x = 0; x < this.width; x += 5) {
                    const phase = Math.sin(x * w.frequency + this.frame * w.speed + w.offset);
                    const y = w.y + (phase > 0 ? w.amplitude : -w.amplitude);
                    if (x === 0) this.ctx.moveTo(x, y);
                    else this.ctx.lineTo(x, y);
                }
            } else { // Sawtooth
                for (let x = 0; x < this.width; x += 5) {
                    const t = (x * w.frequency + this.frame * w.speed + w.offset) % (Math.PI * 2);
                    const y = w.y + ((t / (Math.PI * 2)) * 2 - 1) * w.amplitude;
                    if (x === 0) this.ctx.moveTo(x, y);
                    else this.ctx.lineTo(x, y);
                }
            }

            this.ctx.stroke();
        });
    }
}
