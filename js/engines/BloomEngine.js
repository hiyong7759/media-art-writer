import { ArtEngine } from './ArtEngine.js';

/**
 * Bloom Engine (FLORA-9)
 * 꽃잎
 */
export class BloomEngine extends ArtEngine {
    constructor(canvas, ctx, colors) {
        super(canvas, ctx, colors);
        this.petals = [];
        this.initPetals();
    }

    initPetals() {
        const count = 30;
        this.petals = Array.from({ length: count }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 15 + 5,
            angle: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.01,
            sway: Math.random() * 0.05,
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }));
    }

    resize(width, height) {
        super.resize(width, height);
        this.initPetals();
    }

    draw() {
        this.ctx.fillStyle = 'rgba(10, 5, 20, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.petals.forEach(p => {
            p.angle += p.speed;
            p.x += Math.sin(this.frame * p.sway) * 0.5;
            p.y += Math.cos(this.frame * p.sway) * 0.5;

            if (p.x < -50) p.x = this.width + 50;
            if (p.x > this.width + 50) p.x = -50;
            if (p.y < -50) p.y = this.height + 50;
            if (p.y > this.height + 50) p.y = -50;

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.angle);

            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.quadraticCurveTo(-p.size, -p.size, 0, -p.size * 3);
            this.ctx.quadraticCurveTo(p.size, -p.size, 0, 0);

            this.ctx.fillStyle = this.hexToRgba(p.color, 0.6);
            this.ctx.fill();

            this.ctx.restore();
        });
    }
}
