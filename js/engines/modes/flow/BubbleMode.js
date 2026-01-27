export class BubbleMode {
    constructor(engine) {
        this.engine = engine;
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
    }

    draw(bubbles) {
        const ctx = this.engine.ctx;
        bubbles.forEach(b => {
            b.y -= b.speed;
            b.x += Math.sin(this.engine.frame * 0.05 + b.wobble) * 0.5;

            if (b.y < -50) b.y = this.engine.height + 50;

            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);

            let color = b.color;
            if (this.style === 2) { // Storm/Impact (Fast/Dynamic)
                ctx.globalCompositeOperation = 'screen';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }

            ctx.fillStyle = this.engine.hexToRgba(color, 0.6);
            ctx.fill();

            // Highlight
            ctx.beginPath();
            ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';
    }
}
