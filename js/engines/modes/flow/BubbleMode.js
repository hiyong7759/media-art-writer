import { BaseMode } from '../../../core/BaseMode.js';

export class BubbleMode extends BaseMode {
    constructor(engine) {
        super(engine);
        this.bubbles = [];
    }

    init(variant = 0) {
        super.init(variant);
        // 미니 프리뷰와 동일한 설정
        this.bubbles = Array.from({ length: 15 }, () => this.createParticle({
            radius: Math.random() * 4 + 2,
            speed: Math.random() * 0.5 + 0.2,
            wobble: Math.random() * Math.PI * 2
        }));
    }

    draw() {
        this.bubbles.forEach(b => {
            // Rising logic (미니 프리뷰와 동일)
            b.y -= b.speed;
            b.x += Math.sin(this.frame * 0.05 + b.wobble) * 0.5;

            // Reset when off screen
            if (b.y < 0) {
                b.y = this.height + 20;
                b.x = Math.random() * this.width;
            }

            // Draw bubble (미니 프리뷰와 동일)
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.hexToRgba(b.color, 0.6);
            this.ctx.strokeStyle = this.hexToRgba(b.color, 0.8);
            this.ctx.fill();
            this.ctx.stroke();
        });
    }
}
