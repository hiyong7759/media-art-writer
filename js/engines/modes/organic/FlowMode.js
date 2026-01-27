export class FlowMode {
    constructor(engine) {
        this.engine = engine;
        this.style = 0;
        this.particles = [];
    }

    init(variant = 0) {
        this.style = variant;
        this.particles = [];

        // Network needs init
        if (this.style === 2) {
            for (let i = 0; i < 60; i++) {
                this.particles.push({
                    x: Math.random() * this.engine.width,
                    y: Math.random() * this.engine.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
                });
            }
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) { // DNA: Double Helix
            const cx = this.engine.width / 2;
            const strands = 2;
            const points = 40;
            const height = this.engine.height;
            const step = height / points;

            for (let s = 0; s < strands; s++) {
                const offset = s * Math.PI;
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[s % this.engine.colors.length], 0.8);
                ctx.lineWidth = 3;

                // Draw backbone
                ctx.beginPath();
                for (let i = 0; i <= points; i++) {
                    const y = i * step;
                    const angle = y * 0.02 + t + offset;
                    const x = cx + Math.sin(angle) * 80;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);

                    // Draw connection bars occasionally
                    if (s === 0 && i % 2 === 0) {
                        const x2 = cx + Math.sin(angle + Math.PI) * 80;
                        ctx.save();
                        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(x2, y);
                        ctx.stroke();
                        ctx.restore();
                    }
                }
                ctx.stroke();
            }

        } else if (this.style === 1) { // Stream: Fluid lines
            const lines = 20;
            for (let i = 0; i < lines; i++) {
                const yBase = (this.engine.height / lines) * i;
                ctx.beginPath();
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[i % this.engine.colors.length], 0.5);
                ctx.lineWidth = 2;

                for (let x = 0; x < this.engine.width; x += 10) {
                    // Perlin-ish logic using Sine sums
                    const noise = Math.sin(x * 0.01 + t) * Math.sin(x * 0.005 + t * 0.5) * 50;
                    const y = yBase + noise;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

        } else { // Network: Connected nodes
            const maxDist = 120;

            // Update & Draw nodes
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > this.engine.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.engine.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });

            // Draw connections
            ctx.lineWidth = 0.5;
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p1 = this.particles[i];
                    const p2 = this.particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const d = Math.sqrt(dx * dx + dy * dy);

                    if (d < maxDist) {
                        const alpha = 1 - (d / maxDist);
                        ctx.strokeStyle = `rgba(200,200,200,${alpha * 0.5})`;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();

                        // Signal packet
                        if (Math.random() < 0.01) {
                            ctx.fillStyle = '#fff';
                            ctx.beginPath();
                            const lerp = Math.random();
                            ctx.arc(p1.x + dx * lerp, p1.y + dy * lerp, 2, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
            }
        }
    }
}
