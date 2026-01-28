export class SolidMode {
    constructor(engine) {
        this.engine = engine;
        this.style = 0;
        this.rx = 0;
        this.ry = 0;
        this.rz = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.rx = 0;
        this.ry = 0;
        this.rz = 0;
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        if (this.style === 0) {
            this.drawCube(ctx, cx, cy);
        } else if (this.style === 1) {
            this.drawPyramid(ctx, cx, cy);
        } else {
            this.drawSphere(ctx, cx, cy);
        }
    }

    drawCube(ctx, cx, cy) {
        this.rx += 0.012;
        this.ry += 0.018;

        const size = 100;
        const nodes = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        const pts = nodes.map(n => this.project(n, cx, cy, size));

        // 글로우
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.engine.colors[0];

        // 면 채우기 (반투명)
        const faces = [[0,1,2,3], [4,5,6,7], [0,1,5,4], [2,3,7,6], [1,2,6,5], [0,3,7,4]];
        faces.forEach((face, i) => {
            ctx.beginPath();
            ctx.moveTo(pts[face[0]].x, pts[face[0]].y);
            face.forEach(idx => ctx.lineTo(pts[idx].x, pts[idx].y));
            ctx.closePath();
            ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[i % this.engine.colors.length], 0.15);
            ctx.fill();
        });

        // 엣지
        ctx.strokeStyle = this.engine.colors[0];
        ctx.lineWidth = 3;
        edges.forEach(e => {
            ctx.beginPath();
            ctx.moveTo(pts[e[0]].x, pts[e[0]].y);
            ctx.lineTo(pts[e[1]].x, pts[e[1]].y);
            ctx.stroke();
        });

        // 꼭짓점 밝게
        pts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        });

        ctx.shadowBlur = 0;
    }

    drawPyramid(ctx, cx, cy) {
        this.rx += 0.01;
        this.ry += 0.02;

        const size = 120;
        // 피라미드: 꼭대기 + 사각 바닥
        const nodes = [
            [0, -1.2, 0],  // 꼭대기
            [-1, 0.6, -1], [1, 0.6, -1], [1, 0.6, 1], [-1, 0.6, 1]  // 바닥
        ];
        const edges = [[0,1], [0,2], [0,3], [0,4], [1,2], [2,3], [3,4], [4,1]];

        const pts = nodes.map(n => this.project(n, cx, cy, size));

        ctx.shadowBlur = 25;
        ctx.shadowColor = this.engine.colors[1] || this.engine.colors[0];

        // 면 채우기
        const faces = [[0,1,2], [0,2,3], [0,3,4], [0,4,1], [1,2,3,4]];
        faces.forEach((face, i) => {
            ctx.beginPath();
            ctx.moveTo(pts[face[0]].x, pts[face[0]].y);
            face.forEach(idx => ctx.lineTo(pts[idx].x, pts[idx].y));
            ctx.closePath();
            ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[i % this.engine.colors.length], 0.2);
            ctx.fill();
        });

        // 엣지
        ctx.strokeStyle = this.engine.colors[1] || this.engine.colors[0];
        ctx.lineWidth = 3;
        edges.forEach(e => {
            ctx.beginPath();
            ctx.moveTo(pts[e[0]].x, pts[e[0]].y);
            ctx.lineTo(pts[e[1]].x, pts[e[1]].y);
            ctx.stroke();
        });

        // 꼭대기 강조
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    drawSphere(ctx, cx, cy) {
        this.rz += 0.015;
        const radius = 120;
        const color = this.engine.colors[2] || this.engine.colors[0];

        ctx.shadowBlur = 30;
        ctx.shadowColor = color;

        // 위도선
        for (let lat = -3; lat <= 3; lat++) {
            const y = cy + lat * 30;
            const r = Math.sqrt(radius * radius - (lat * 30) * (lat * 30));
            if (r > 0) {
                ctx.beginPath();
                ctx.ellipse(cx, y, r, r * 0.3, 0, 0, Math.PI * 2);
                ctx.strokeStyle = this.engine.hexToRgba(color, 0.6);
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        // 경도선 (회전)
        for (let i = 0; i < 6; i++) {
            const angle = this.rz + (i / 6) * Math.PI;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.ellipse(0, 0, radius * 0.15, radius, 0, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(color, 0.5);
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }

        // 중심 글로우
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, this.engine.hexToRgba(color, 0.3));
        grad.addColorStop(0.7, this.engine.hexToRgba(color, 0.1));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    project(node, cx, cy, size) {
        let [x, y, z] = node;

        // Y축 회전
        let x1 = x * Math.cos(this.ry) - z * Math.sin(this.ry);
        let z1 = z * Math.cos(this.ry) + x * Math.sin(this.ry);

        // X축 회전
        let y2 = y * Math.cos(this.rx) - z1 * Math.sin(this.rx);
        let z2 = z1 * Math.cos(this.rx) + y * Math.sin(this.rx);

        const scale = 300 / (300 + z2 * size);
        return {
            x: cx + x1 * size * scale,
            y: cy + y2 * size * scale
        };
    }
}
