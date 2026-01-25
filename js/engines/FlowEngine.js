import { ArtEngine } from './ArtEngine.js';

/**
 * Flow Engine (AQUA-5)
 * 떠오르는 물방울
 */
export class FlowEngine extends ArtEngine {
    constructor(canvas, ctx, colors) {
        super(canvas, ctx, colors);
        this.bubbles = [];
        this.initBubbles();
    }

    initBubbles() {
        const count = 40;
        this.bubbles = Array.from({ length: count }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: Math.random() * 10 + 5,
            speed: Math.random() * 1.5 + 0.5,
            wobble: Math.random() * Math.PI * 2,
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }));
    }

    resize(width, height) {
        super.resize(width, height);
        this.initBubbles();
    }

    draw() {
        this.ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.bubbles.forEach(b => {
            b.y -= b.speed;
            b.x += Math.sin(this.frame * 0.05 + b.wobble) * 0.5;

            if (b.y < -50) b.y = this.height + 50;

            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.hexToRgba(b.color, 0.6);
            this.ctx.strokeStyle = this.hexToRgba(b.color, 0.8);
            this.ctx.lineWidth = 1;
            this.ctx.fill();
            this.ctx.stroke();
        });
    }
}
