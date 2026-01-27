export class PulseMode {
    constructor(engine) {
        this.engine = engine;
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;
        const t = this.engine.frame * 0.05;

        if (this.style === 0) { // Breath: Full screen soft pulse
            const breath = (Math.sin(t) + 1) * 0.5; // 0~1
            const r = 100 + breath * 50;

            const grad = ctx.createRadialGradient(cx, cy, 50, cx, cy, r + 100);
            grad.addColorStop(0, this.engine.hexToRgba(this.engine.colors[0], 0.5));
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.engine.width, this.engine.height); // Atmosphere

            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.colors[0];
            ctx.lineWidth = 2;
            ctx.stroke();

        } else if (this.style === 1) { // Shockwave: Rings expanding
            const count = 5;
            const maxR = Math.max(this.engine.width, this.engine.height) * 0.6;

            for (let i = 0; i < count; i++) {
                const phase = (t + i * (Math.PI * 2 / count)) % (Math.PI * 2);
                const progress = phase / (Math.PI * 2); // 0~1

                const r = progress * maxR;
                const alpha = 1 - progress;

                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.lineWidth = 10 * alpha;
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[2], alpha);
                ctx.stroke();
            }

        } else { // Magnetic: Field lines
            ctx.lineWidth = 1;
            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[1], 0.3);

            const lines = 30;
            for (let i = 0; i < lines; i++) {
                const angle = (i / lines) * Math.PI * 2;
                const r = 50;

                ctx.beginPath();
                const startX = cx + Math.cos(angle) * r;
                const startY = cy + Math.sin(angle) * r;
                ctx.moveTo(startX, startY);

                // Curve out and back
                const dist = 200 + Math.sin(t + i * 0.5) * 50;
                const cpX = cx + Math.cos(angle) * dist * 2;
                const cpY = cy + Math.sin(angle) * dist * 2;

                // End at opposite
                const endX = cx + Math.cos(angle + Math.PI) * r;
                const endY = cy + Math.sin(angle + Math.PI) * r;

                ctx.quadraticCurveTo(cpX, cpY, endX, endY);
                ctx.stroke();

                // Moving electrons
                const p = (t * 2 + i) % 10 / 10; // 0~1
                // Simple lerp on quad curve is hard without math, ignore for now to keep simple
                // Just draw dots at ends
                ctx.fillStyle = '#fff';
                ctx.fillRect(startX - 1, startY - 1, 2, 2);
            }
        }
    }
}
