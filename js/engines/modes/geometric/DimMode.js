export class DimMode {
    constructor(engine) {
        this.engine = engine;
        this.style = 0;
        this.rx = 0;
        this.ry = 0;
        this.rz = 0;
        this.rw = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.rx = 0;
        this.ry = 0;
        this.rz = 0;
        this.rw = 0;
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        if (this.style === 0) {
            this.drawHypercube(ctx, cx, cy);
        } else if (this.style === 1) {
            this.drawProjection(ctx, cx, cy);
        } else {
            this.drawFold(ctx, cx, cy);
        }
    }

    drawHypercube(ctx, cx, cy) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        // 4D 테서랙트 (하이퍼큐브)
        this.rx += 0.008;
        this.ry += 0.012;
        this.rw += 0.006;

        const size = 80;

        // 4D 정점 (16개)
        const vertices4D = [];
        for (let i = 0; i < 16; i++) {
            vertices4D.push([
                (i & 1) ? 1 : -1,
                (i & 2) ? 1 : -1,
                (i & 4) ? 1 : -1,
                (i & 8) ? 1 : -1
            ]);
        }

        // 4D → 3D → 2D 투영
        const pts = vertices4D.map(v => {
            // W축 회전
            let [x, y, z, w] = v;
            let x1 = x * Math.cos(this.rw) - w * Math.sin(this.rw);
            let w1 = w * Math.cos(this.rw) + x * Math.sin(this.rw);

            // 3D 회전
            let x2 = x1 * Math.cos(this.ry) - z * Math.sin(this.ry);
            let z1 = z * Math.cos(this.ry) + x1 * Math.sin(this.ry);
            let y2 = y * Math.cos(this.rx) - z1 * Math.sin(this.rx);
            let z2 = z1 * Math.cos(this.rx) + y * Math.sin(this.rx);

            // 투영
            const dist = 4;
            const scale = dist / (dist + w1 * 0.5);
            return {
                x: cx + x2 * size * scale,
                y: cy + y2 * size * scale,
                depth: w1
            };
        });

        // 엣지 (같은 큐브 내 + 큐브 간 연결)
        ctx.shadowBlur = 15;

        // 내부 큐브 (w = -1)
        ctx.shadowColor = this.engine.colors[0];
        ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[0], 0.9);
        ctx.lineWidth = 2;
        this.drawCubeEdges(ctx, pts, 0);

        // 외부 큐브 (w = 1)
        ctx.shadowColor = this.engine.colors[1] || this.engine.colors[0];
        ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[1] || this.engine.colors[0], 0.9);
        this.drawCubeEdges(ctx, pts, 8);

        // 연결선 (두 큐브 사이)
        ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[2] || this.engine.colors[0], 0.5);
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[i + 8].x, pts[i + 8].y);
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawCubeEdges(ctx, pts, offset) {
        const edges = [
            [0, 1], [1, 3], [3, 2], [2, 0],
            [4, 5], [5, 7], [7, 6], [6, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];
        edges.forEach(e => {
            ctx.beginPath();
            ctx.moveTo(pts[e[0] + offset].x, pts[e[0] + offset].y);
            ctx.lineTo(pts[e[1] + offset].x, pts[e[1] + offset].y);
            ctx.stroke();
        });
    }

    drawProjection(ctx, cx, cy) {
        // 3D→2D 투영 시각화 (단순화)
        const angle = this.engine.frame * 0.01;
        const t = this.engine.frame * 0.02;

        const gridSize = 4;
        const spacing = 50;

        for (let gx = -gridSize; gx <= gridSize; gx++) {
            for (let gz = -gridSize; gz <= gridSize; gz++) {
                const waveY = Math.sin(gx * 0.5 + gz * 0.5 + t) * 40;

                // 3D 회전
                const rx = gx * spacing;
                const rz = gz * spacing;
                const x2d = rx * Math.cos(angle) - rz * Math.sin(angle);
                const z2d = rz * Math.cos(angle) + rx * Math.sin(angle);

                // 원근 투영
                const perspective = 400 / (400 + z2d);
                const px = cx + x2d * perspective;
                const py = cy + waveY * perspective;

                const color = this.engine.colors[Math.abs(gx + gz) % this.engine.colors.length];
                const size = 4 + perspective * 5;

                // 글로우
                ctx.shadowBlur = 15;
                ctx.shadowColor = color;

                // 점
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();

                // 중심
                ctx.beginPath();
                ctx.arc(px, py, size * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();

                ctx.shadowBlur = 0;
            }
        }
    }

    drawFold(ctx, cx, cy) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        // 공간 접힘 효과
        const t = this.engine.frame * 0.01;
        const layers = 8;

        ctx.shadowBlur = 20;
        ctx.shadowColor = this.engine.colors[0];

        for (let i = 0; i < layers; i++) {
            const phase = t + i * 0.5;
            const fold = Math.sin(phase) * 0.5 + 0.5; // 0~1

            const size = 50 + i * 30;
            const offset = Math.sin(phase * 2) * 20;

            ctx.save();
            ctx.translate(cx + offset, cy);

            // 접히는 효과 (scaleX 변화)
            ctx.scale(fold * 0.8 + 0.2, 1);

            // 사각형
            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[i % this.engine.colors.length], 0.7);
            ctx.lineWidth = 3;
            ctx.strokeRect(-size / 2, -size / 2, size, size);

            // 내부 채우기
            ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[i % this.engine.colors.length], 0.1);
            ctx.fillRect(-size / 2, -size / 2, size, size);

            ctx.restore();
        }

        // 중심 포인트
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    }
}
