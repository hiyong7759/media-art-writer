import { BaseMode } from '../../../core/BaseMode.js';

export class BubbleMode extends BaseMode {
    constructor(engine) {
        super(engine);
        this.bubbles = [];
    }

    init(variant = 0) {
        super.init(variant);
        this.bubbles = Array.from({ length: 30 }, () => this.createParticle({
            radius: Math.random() * 10 + 2,
            speed: Math.random() * 1 + 0.5,
            wobble: Math.random() * Math.PI * 2
        }));
    }

    draw() {
        this.bubbles.forEach(b => {
            // Rising logic
            b.y -= b.speed;
            b.x += Math.sin(this.frame * 0.05 + b.wobble) * 1.0;

            // Reset when off screen
            if (b.y < 0) {
                b.y = this.height + 20;
                b.x = Math.random() * this.width;
            }

            // Draw bubble
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.hexToRgba(b.color, 0.6);
            this.ctx.strokeStyle = this.hexToRgba(b.color, 0.8);
            this.ctx.fill();
            this.ctx.stroke();

            // Highlight
            this.ctx.beginPath();
            this.ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
            this.ctx.fill();
        });
    }
}
