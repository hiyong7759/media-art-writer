import { ArtEngine } from './ArtEngine.js';

/**
 * Refraction Engine (PRISM-2)
 * 빛 굴절
 */
export class RefractionEngine extends ArtEngine {
    constructor(canvas, ctx, colors) {
        super(canvas, ctx, colors);
        this.beams = [];
        this.initBeams();
    }

    initBeams() {
        const count = 20;
        this.beams = Array.from({ length: count }, () => ({
            x: Math.random() * this.width,
            angle: Math.random() * Math.PI - Math.PI / 2,
            width: Math.random() * 20 + 10,
            length: Math.random() * this.height * 0.6 + this.height * 0.4,
            speed: Math.random() * 0.01 + 0.005,
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }));
    }

    resize(width, height) {
        super.resize(width, height);
        this.initBeams();
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.beams.forEach(b => {
            b.angle += Math.sin(this.frame * 0.01) * 0.002;

            this.ctx.save();
            this.ctx.translate(b.x, this.height);
            this.ctx.rotate(b.angle);

            const grad = this.ctx.createLinearGradient(0, 0, 0, -b.length);
            grad.addColorStop(0, this.hexToRgba(b.color, 0));
            grad.addColorStop(0.5, this.hexToRgba(b.color, 0.8));
            grad.addColorStop(1, this.hexToRgba(b.color, 0));

            this.ctx.fillStyle = grad;
            this.ctx.fillRect(-b.width / 2, -b.length, b.width, b.length);

            this.ctx.restore();
        });
    }
}
