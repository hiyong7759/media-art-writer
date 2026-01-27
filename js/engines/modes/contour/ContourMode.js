export class ContourMode {
    constructor(engine) {
        this.engine = engine;
        this.contours = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        let count = 10;
        let speedMult = 1.0;

        if (this.style === 1) { // Variant 1: Grid
            count = 20;
            speedMult = 0.5;
        } else if (this.style === 2) { // Variant 2: Valley
            count = 5;
            speedMult = 2.0;
        }

        this.contours = Array.from({ length: count }, (_, i) => ({
            y: (this.engine.height / count) * i,
            points: Array.from({ length: 20 }, () => Math.random() * 20 - 10),
            speed: (Math.random() * 0.02 + 0.01) * speedMult,
            color: this.engine.colors[i % this.engine.colors.length]
        }));
    }

    draw() {
        const ctx = this.engine.ctx;
        this.contours.forEach((c, i) => {
            ctx.beginPath();
            ctx.strokeStyle = this.engine.hexToRgba(c.color, 0.7);

            if (this.style === 1) {
                ctx.setLineDash([5, 5]);
            } else {
                ctx.setLineDash([]);
            }

            ctx.lineWidth = 2;

            for (let x = 0; x <= this.engine.width; x += 20) {
                const idx = Math.floor(x / (this.engine.width / 20));
                const offset = c.points[idx % c.points.length] || 0;
                const nextOffset = c.points[(idx + 1) % c.points.length] || 0;
                const t = (x % (this.engine.width / 20)) / (this.engine.width / 20);
                const smoothOffset = offset * (1 - t) + nextOffset * t;

                const y = c.y + smoothOffset * 10 + Math.sin(this.engine.frame * c.speed + i) * 15;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        });
    }
}
