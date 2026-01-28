export class DustMode {
    constructor(engine) {
        this.engine = engine;
        this.stars = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        // Init Star Field (Space Travel) to match index card visual (initStars)
        this.stars = Array.from({ length: 100 }, () => ({
            x: Math.random() * this.engine.width - this.engine.width / 2,
            y: Math.random() * this.engine.height - this.engine.height / 2,
            z: Math.random() * 200 + 50,
            color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
        }));
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        this.stars.forEach(s => {
            // Move towards viewer (Z decreases)
            s.z -= 1;
            if (s.z <= 0) {
                s.z = 200;
                s.x = Math.random() * this.engine.width - this.engine.width / 2;
                s.y = Math.random() * this.engine.height - this.engine.height / 2;
            }

            const scale = 100 / s.z;
            const x = cx + s.x * scale;
            const y = cy + s.y * scale;
            const r = Math.max(0.5, scale * 3.0); // Slightly larger
            const alpha = 0.8 * (1 - s.z / 200);

            if (x >= 0 && x <= this.engine.width && y >= 0 && y <= this.engine.height) {
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(s.color, alpha);
                ctx.fill();
            }
        });
    }
}
