export class PolyMode {
    constructor(engine) {
        this.engine = engine;
        this.shapes = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        // Poly variants: 0: Shape, 1: Voronoi, 2: Hex
        const density = this.style === 1 ? 25 : (this.style === 2 ? 18 : 8);
        this.shapes = Array.from({ length: density }, () => ({
            x: Math.random() * this.engine.width,
            y: Math.random() * this.engine.height,
            size: Math.random() * 40 + 20,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.03,
            sides: this.style === 2 ? 6 : (Math.floor(Math.random() * 4) + 3),
            color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
        }));
    }

    draw() {
        const ctx = this.engine.ctx;
        if (this.style === 1) { // Voronoi
            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[1], 0.2);
            this.shapes.forEach(s => {
                s.x += Math.sin(this.engine.frame * 0.01) * 0.2;
                s.y += Math.cos(this.engine.frame * 0.01) * 0.2;

                ctx.beginPath();
                this.shapes.forEach(target => {
                    const d = Math.hypot(s.x - target.x, s.y - target.y);
                    if (d < 100) {
                        ctx.moveTo(s.x, s.y);
                        ctx.lineTo(target.x, target.y);
                    }
                });
                ctx.stroke();
            });
            return;
        }

        this.shapes.forEach(s => {
            s.rotation += s.rotSpeed;
            s.x += Math.sin(this.engine.frame * 0.01 + s.size) * 0.3;
            if (s.x < 0) s.x = this.engine.width;
            if (s.x > this.engine.width) s.x = 0;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            ctx.strokeStyle = this.engine.hexToRgba(s.color, 0.85);
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < s.sides; i++) {
                const angle = (i / s.sides) * Math.PI * 2;
                const x = Math.cos(angle) * s.size;
                const y = Math.sin(angle) * s.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();

            ctx.fillStyle = this.engine.hexToRgba(s.color, 0.05);
            ctx.fill();
            ctx.restore();
        });
    }
}
