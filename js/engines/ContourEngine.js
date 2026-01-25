import { ArtEngine } from './ArtEngine.js';

/**
 * Contour Engine (TERRA-1)
 * 등고선
 */
export class ContourEngine extends ArtEngine {
    constructor(canvas, ctx, colors) {
        super(canvas, ctx, colors);
        this.contours = [];
        this.initContours();
    }

    initContours() {
        const count = 10;
        this.contours = Array.from({ length: count }, (_, i) => ({
            y: (this.height / count) * i,
            points: Array.from({ length: 20 }, () => Math.random() * 20 - 10),
            speed: Math.random() * 0.02 + 0.01,
            color: this.colors[i % this.colors.length]
        }));
    }

    resize(width, height) {
        super.resize(width, height);
        this.initContours();
    }

    draw() {
        this.ctx.fillStyle = 'rgba(20, 15, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.contours.forEach((c, i) => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.hexToRgba(c.color, 0.7);
            this.ctx.lineWidth = 2;

            for (let x = 0; x <= this.width; x += 20) {
                const idx = Math.floor(x / (this.width / 20));
                const offset = c.points[idx % c.points.length] || 0;
                const nextOffset = c.points[(idx + 1) % c.points.length] || 0;
                const t = (x % (this.width / 20)) / (this.width / 20);
                const smoothOffset = offset * (1 - t) + nextOffset * t;

                const y = c.y + smoothOffset * 10 + Math.sin(this.frame * c.speed + i) * 15;
                if (x === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        });
    }
}
