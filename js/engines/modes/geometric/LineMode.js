export class LineMode {
    constructor(engine) {
        this.engine = engine;
        this.points = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        // Re-implement basic point generation for LineMode independence
        const count = 200;
        this.points = Array.from({ length: count }, () => ({
            x: Math.random() * this.engine.width,
            y: Math.random() * this.engine.height,
            z: Math.random() * 200,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
        }));
    }

    draw() {
        const ctx = this.engine.ctx;
        ctx.lineWidth = 1;

        if (this.style === 0) { // String
            for (let i = 0; i < 20; i++) {
                const y = (this.engine.height / 20) * i;
                ctx.beginPath();
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[i % this.engine.colors.length], 0.3);
                ctx.moveTo(0, y);
                for (let x = 0; x < this.engine.width; x += 10) {
                    const wave = Math.sin(x * 0.01 + this.engine.frame * 0.1 + i) * 10;
                    ctx.lineTo(x, y + wave);
                }
                ctx.stroke();
            }
        } else if (this.style === 1) { // Connect
            // Draw points logic embedded or simplified
            this.points.forEach(p => {
                p.x += Math.sin(this.engine.frame * 0.001 + p.z) * 0.2;
                p.y += Math.cos(this.engine.frame * 0.001 + p.z) * 0.2;
                if (p.x < 0) p.x = this.engine.width; if (p.x > this.engine.width) p.x = 0;
                if (p.y < 0) p.y = this.engine.height; if (p.y > this.engine.height) p.y = 0;

                const alpha = 0.3 + Math.sin(this.engine.frame * 0.05 + p.z) * 0.4;
                ctx.fillStyle = this.engine.hexToRgba(p.color, alpha);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[0], 0.2);
            for (let i = 0; i < this.points.length; i++) {
                for (let j = i + 1; j < this.points.length; j++) {
                    const d = Math.hypot(this.points[i].x - this.points[j].x, this.points[i].y - this.points[j].y);
                    if (d < 100) {
                        ctx.beginPath();
                        ctx.moveTo(this.points[i].x, this.points[i].y);
                        ctx.lineTo(this.points[j].x, this.points[j].y);
                        ctx.stroke();
                    }
                }
            }
        } else { // Ray
            const cx = this.engine.width / 2;
            const cy = this.engine.height / 2;
            for (let i = 0; i < 36; i++) {
                const angle = (i * 10) * Math.PI / 180 + this.engine.frame * 0.01;
                const len = 200 + Math.sin(this.engine.frame * 0.05 + i) * 100;
                ctx.beginPath();
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[i % this.engine.colors.length], 0.4);
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
                ctx.stroke();
            }
        }
    }
}
