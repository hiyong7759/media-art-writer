export class PointMode {
    constructor(engine) {
        this.engine = engine;
        this.points = [];
        this.style = 0;
        this.gridPoints = [];
    }

    init(variant = 0) {
        this.style = variant;
        // Point variants: 0: Scatter, 1: Grid, 2: Orbit

        if (this.style === 0) {
            // Scatter: 흩어진 빛나는 점들
            this.points = Array.from({ length: 80 }, () => ({
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: Math.random() * 4 + 3,
                phase: Math.random() * Math.PI * 2,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
            }));
        } else if (this.style === 1) {
            // Grid: 격자 점들
            this.initGrid();
        } else {
            // Orbit: 궤도를 도는 점들
            this.initOrbit();
        }
    }

    initGrid() {
        this.gridPoints = [];
        const gap = 50;
        for (let x = gap; x < this.engine.width; x += gap) {
            for (let y = gap; y < this.engine.height; y += gap) {
                this.gridPoints.push({
                    baseX: x,
                    baseY: y,
                    phase: Math.random() * Math.PI * 2,
                    color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
                });
            }
        }
    }

    initOrbit() {
        this.points = [];
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 여러 궤도 생성
        for (let orbit = 0; orbit < 5; orbit++) {
            const radius = 80 + orbit * 60;
            const count = 8 + orbit * 4;
            for (let i = 0; i < count; i++) {
                this.points.push({
                    cx, cy,
                    radius,
                    angle: (i / count) * Math.PI * 2,
                    speed: 0.01 - orbit * 0.001,
                    size: 5 - orbit * 0.5,
                    color: this.engine.colors[orbit % this.engine.colors.length]
                });
            }
        }
    }

    draw() {
        const ctx = this.engine.ctx;

        if (this.style === 0) {
            this.drawScatter(ctx);
        } else if (this.style === 1) {
            this.drawGrid(ctx);
        } else {
            this.drawOrbit(ctx);
        }
    }

    drawScatter(ctx) {
        this.points.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.phase += 0.05;

            // 경계 처리
            if (p.x < 0) p.x = this.engine.width;
            if (p.x > this.engine.width) p.x = 0;
            if (p.y < 0) p.y = this.engine.height;
            if (p.y > this.engine.height) p.y = 0;

            const pulse = Math.sin(p.phase) * 0.3 + 0.7;
            const size = p.size * pulse;

            // 글로우 효과
            ctx.shadowBlur = 15;
            ctx.shadowColor = p.color;

            // 외곽 글로우
            ctx.beginPath();
            ctx.arc(p.x, p.y, size + 2, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, 0.3);
            ctx.fill();

            // 메인 점
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, 0.9);
            ctx.fill();

            // 중심 밝은 점
            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();

            ctx.shadowBlur = 0;
        });
    }

    drawGrid(ctx) {
        const t = this.engine.frame * 0.02;

        // 단순한 격자 점 (과하지 않게)
        this.gridPoints.forEach(p => {
            const pulse = Math.sin(t + p.phase) * 0.4 + 0.6;
            const x = p.baseX;
            const y = p.baseY;

            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;

            ctx.beginPath();
            ctx.arc(x, y, 3 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, pulse * 0.9);
            ctx.fill();

            ctx.shadowBlur = 0;
        });
    }

    drawOrbit(ctx) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;
        const t = this.engine.frame * 0.01;

        // 중심 코어 (빛나는 핵)
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.engine.colors[0];
        ctx.beginPath();
        ctx.arc(cx, cy, 15 + Math.sin(t * 2) * 5, 0, Math.PI * 2);
        ctx.fillStyle = this.engine.colors[0];
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // 궤도 링 (빛나는 타원)
        ctx.shadowBlur = 0;
        [100, 180, 280].forEach((r, idx) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(t * (idx % 2 ? 1 : -1) * 0.3);
            ctx.scale(1, 0.4); // 타원으로

            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[idx % this.engine.colors.length], 0.4);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });

        // 궤도 점들 (행성처럼)
        this.points.forEach(p => {
            p.angle += p.speed;

            // 타원 궤도
            const orbitIdx = Math.floor((p.radius - 80) / 60);
            const tiltAngle = t * (orbitIdx % 2 ? 1 : -1) * 0.3;

            const ox = Math.cos(p.angle) * p.radius;
            const oy = Math.sin(p.angle) * p.radius * 0.4;

            // 회전 적용
            const x = cx + ox * Math.cos(tiltAngle) - oy * Math.sin(tiltAngle);
            const y = cy + ox * Math.sin(tiltAngle) + oy * Math.cos(tiltAngle);

            // 긴 꼬리
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            for (let i = 1; i <= 8; i++) {
                const tailAngle = p.angle - p.speed * i * 5;
                const tox = Math.cos(tailAngle) * p.radius;
                const toy = Math.sin(tailAngle) * p.radius * 0.4;
                const tx = cx + tox * Math.cos(tiltAngle) - toy * Math.sin(tiltAngle);
                const ty = cy + tox * Math.sin(tiltAngle) + toy * Math.cos(tiltAngle);

                ctx.beginPath();
                ctx.arc(tx, ty, p.size * (1 - i * 0.1), 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(p.color, 0.6 - i * 0.07);
                ctx.fill();
            }

            // 메인 점
            ctx.beginPath();
            ctx.arc(x, y, p.size + 2, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.shadowBlur = 0;
        });
    }
}
