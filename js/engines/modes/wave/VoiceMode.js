export class VoiceMode {
    constructor(engine) {
        this.engine = engine;
        this.rings = [];
    }

    init(v) { this.rings = []; }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        if (this.engine.frame % 10 === 0) {
            this.rings.push({ r: 0, opacity: 1, speed: 2 });
        }

        this.rings.forEach((ring, i) => {
            ring.r += ring.speed;
            ring.opacity -= 0.01;

            if (ring.opacity <= 0) {
                this.rings.splice(i, 1);
                return;
            }

            ctx.beginPath();
            // Distortion for voice
            const points = 20;
            for (let j = 0; j <= points; j++) {
                const angle = (j / points) * Math.PI * 2;
                const dist = ring.r + Math.sin(angle * 5 + this.engine.frame * 0.1) * 10;
                const x = cx + Math.cos(angle) * dist;
                const y = cy + Math.sin(angle) * dist;
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[0], ring.opacity);
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }
}
