export class ContourMode {
    constructor(engine) {
        this.engine = engine;
        this.contours = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.contours = Array.from({ length: 8 }, (_, i) => ({
            y: (this.engine.height / 8) * i + 100,
            points: Array.from({ length: 20 }, () => Math.random() * 50 - 25),
            speed: Math.random() * 0.02 + 0.01,
            color: this.engine.colors[i % this.engine.colors.length]
        }));
    }

    draw() {
        const ctx = this.engine.ctx;

        this.contours.forEach((c, i) => {
            ctx.beginPath();
            ctx.strokeStyle = this.engine.hexToRgba(c.color, 0.7);
            ctx.lineWidth = 2;

            const segWidth = this.engine.width / (c.points.length - 1);

            for (let x = 0; x <= this.engine.width; x += 10) {
                const idx = Math.floor(x / segWidth);
                const offset = c.points[idx] || 0;
                const nextOffset = c.points[idx + 1] || 0;
                const t = (x % segWidth) / segWidth;
                const smoothOffset = offset * (1 - t) + nextOffset * t;

                const y = c.y + smoothOffset * 5 + Math.sin(this.engine.frame * c.speed + i) * 10;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });
    }
}
