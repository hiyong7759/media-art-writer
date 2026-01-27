export class BloomMode {
    constructor(engine) {
        this.engine = engine;
        this.style = 0;
        this.frameBase = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.frameBase = Math.random() * 1000;
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;
        const t = (this.engine.frame + this.frameBase) * 0.02;

        ctx.translate(cx, cy);

        if (this.style === 0) { // Heart: Organic pulsing heart
            const scale = 8 + Math.sin(t * 3) * 1 + Math.sin(t * 10) * 0.2; // Double beat
            ctx.beginPath();
            for (let i = 0; i < Math.PI * 2; i += 0.05) {
                const x = 16 * Math.pow(Math.sin(i), 3);
                const y = -(13 * Math.cos(i) - 5 * Math.cos(2 * i) - 2 * Math.cos(3 * i) - Math.cos(4 * i));
                ctx.lineTo(x * scale, y * scale);
            }
            ctx.closePath();

            // Glow
            ctx.shadowBlur = 20 + Math.sin(t * 5) * 10;
            ctx.shadowColor = this.engine.colors[2] || '#ff0055';

            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 300);
            grad.addColorStop(0, this.engine.hexToRgba(this.engine.colors[2] || '#ff0055', 0.8));
            grad.addColorStop(0.6, this.engine.hexToRgba(this.engine.colors[1], 0.4));
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.fill();

            // Veins
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();

        } else if (this.style === 1) { // Lotus: Rotating petals layers
            // Rotating layers
            for (let layer = 0; layer < 3; layer++) {
                const petalCount = 8 + layer * 4;
                const radius = 50 + layer * 40;
                const rot = t * (0.2 / (layer + 1));

                ctx.save();
                ctx.rotate(rot);
                for (let i = 0; i < petalCount; i++) {
                    ctx.rotate((Math.PI * 2) / petalCount);
                    ctx.beginPath();
                    // Petal shape
                    ctx.moveTo(0, -radius * 0.5);
                    ctx.bezierCurveTo(20, -radius, 0, -radius * 1.5, 0, -radius * 1.5);
                    ctx.bezierCurveTo(0, -radius * 1.5, -20, -radius, 0, -radius * 0.5);

                    ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[layer % this.engine.colors.length], 0.6);
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                    ctx.stroke();
                }
                ctx.restore();
            }
            // Center
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffff00';
            ctx.fill();

        } else { // Orbital: Swirling particles around nucleus
            // Draw nucleus
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.engine.colors[0];
            ctx.fillStyle = this.engine.colors[0];
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            // Orbitals
            const count = 10;
            for (let i = 0; i < count; i++) {
                const offset = (Math.PI * 2 / count) * i;
                const dist = 60 + Math.sin(t * 2 + offset) * 20;
                const angle = t + offset;

                const px = Math.cos(angle) * dist;
                const py = Math.sin(angle) * dist;

                // Trail
                ctx.beginPath();
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[i % this.engine.colors.length], 0.4);
                ctx.lineWidth = 2;
                ctx.arc(0, 0, dist, angle - 0.5, angle);
                ctx.stroke();

                // Particle
                ctx.beginPath();
                ctx.arc(px, py, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
            }
        }

        ctx.shadowBlur = 0;
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
    }
}
