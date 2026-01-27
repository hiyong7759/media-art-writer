export class NetMode {
    constructor(engine) {
        this.engine = engine;
        this.offset = 0;
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        console.log(`[NetMode] Style: ${['Grid', 'Terrain', 'Warp'][this.style]}`);
        this.offset = 0;
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;
        const horizon = cy;

        this.offset += 2;
        if (this.offset > 40) this.offset = 0;

        ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[1], 0.6);
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.engine.colors[1];

        if (this.style === 0) {
            for (let i = -1000; i <= 1000; i += 100) {
                ctx.beginPath();
                ctx.moveTo(cx + i, horizon);
                const xBottom = cx + i * 4;
                ctx.lineTo(xBottom, this.engine.height);
                ctx.stroke();
            }

            for (let y = 0; y < this.engine.height / 2; y += 20) {
                const depthY = horizon + Math.pow(y / 20, 2.5) + (this.offset * (y / 300));
                if (depthY > this.engine.height) continue;

                ctx.beginPath();
                ctx.moveTo(0, depthY);
                ctx.lineTo(this.engine.width, depthY);
                ctx.stroke();
            }

            ctx.fillStyle = this.engine.colors[0];
            ctx.beginPath();
            ctx.arc(cx, horizon - 100, 60, 0, Math.PI * 2);
            ctx.fill();
        }

        else if (this.style === 1) {
            const rows = 35;
            const cols = 40;
            const gridW = this.engine.width * 2.5;
            const horizonY = this.engine.height * 0.35;
            const speedZ = this.engine.frame * 0.05;

            const vertices = [];
            for (let r = 0; r <= rows; r++) {
                const rowArr = [];
                const t = r / rows;
                const z = 0.01 + Math.pow(t, 1.8) * 0.99;
                const yBase = horizonY + (this.engine.height - horizonY) * z;
                const scaleAtRow = 0.1 + z * 1.5;

                for (let c = 0; c <= cols; c++) {
                    const u = c / cols;
                    const xBase = this.engine.width / 2 + (u - 0.5) * gridW * scaleAtRow;

                    const noiseX = c * 0.4;
                    const noiseY = r * 0.4 - speedZ * 2;
                    const amp = 80 * z;
                    const h = (Math.sin(noiseX) + Math.sin(noiseY) + Math.sin(noiseX * 0.5 + noiseY * 0.5)) * amp;

                    rowArr.push({ x: xBase, y: yBase - h });
                }
                vertices.push(rowArr);
            }

            ctx.lineWidth = 1.5;

            for (let r = 0; r <= rows; r++) {
                ctx.beginPath();
                let alpha = (r / rows);
                alpha = Math.pow(alpha, 0.5);

                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[1], alpha);

                for (let c = 0; c <= cols; c++) {
                    const v = vertices[r][c];
                    if (c === 0) ctx.moveTo(v.x, v.y);
                    else ctx.lineTo(v.x, v.y);
                }
                ctx.stroke();
            }

            for (let c = 0; c <= cols; c += 2) {
                ctx.beginPath();
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[1], 0.3);

                for (let r = 0; r <= rows; r++) {
                    const v = vertices[r][c];
                    if (r === 0) ctx.moveTo(v.x, v.y);
                    else ctx.lineTo(v.x, v.y);
                }
                ctx.stroke();
            }
        }

        else {
            const rings = 10;
            const maxRadius = Math.max(this.engine.width, this.engine.height);
            const cx = this.engine.width / 2;
            const cy = this.engine.height / 2;

            for (let i = 0; i < rings; i++) {
                let r = ((this.engine.frame * 2 + i * 100) % 1000);
                const radius = Math.pow(r / 1000, 3) * maxRadius;

                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.stroke();
            }

            const spokes = 12;
            for (let i = 0; i < spokes; i++) {
                const ang = (i / spokes) * Math.PI * 2 + this.engine.frame * 0.01;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(ang) * maxRadius, cy + Math.sin(ang) * maxRadius);
                ctx.stroke();
            }
        }

        ctx.shadowBlur = 0;
    }
}
