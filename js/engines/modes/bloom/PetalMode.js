export class PetalMode {
    constructor(engine) {
        this.engine = engine;
        this.petals = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.petals = Array.from({ length: 20 }, () => ({
            x: Math.random() * this.engine.width,
            y: Math.random() * this.engine.height,
            size: Math.random() * 15 + 5,
            angle: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.01,
            sway: Math.random() * 0.05,
            color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
        }));
    }

    draw() {
        const ctx = this.engine.ctx;

        this.petals.forEach(p => {
            // Movement matching gallery.js
            p.angle += p.speed;
            p.x += Math.sin(this.engine.frame * p.sway) * 0.5;
            p.y += Math.cos(this.engine.frame * p.sway) * 0.5;

            // Wrap
            if (p.x < -50) p.x = this.engine.width + 50;
            if (p.x > this.engine.width + 50) p.x = -50;
            if (p.y < -50) p.y = this.engine.height + 50;
            if (p.y > this.engine.height + 50) p.y = -50;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-p.size, -p.size, 0, -p.size * 3);
            ctx.quadraticCurveTo(p.size, -p.size, 0, 0);

            ctx.fillStyle = this.engine.hexToRgba(p.color, 0.9);
            ctx.fill();

            ctx.restore();
        });
    }
}
