export class ChaosMode {
    constructor(engine) {
        this.engine = engine;
        this.chaosP = { x: 0.1, y: 0.1, z: 0.1 };
        this.style = 0;
        this.trails = [];
        this.noiseGrid = [];
        this.glitchBlocks = [];
    }

    init(variant = 0) {
        this.style = variant;
        this.chaosP = { x: 0.1, y: 0.1, z: 0.1 };
        this.trails = [];

        if (this.style === 1) {
            // Noise: 펄린 노이즈 그리드
            this.initNoiseGrid();
        } else if (this.style === 2) {
            // Glitch: 글리치 블록들
            this.glitchBlocks = [];
        }
    }

    initNoiseGrid() {
        this.noiseGrid = [];
        const step = 20;
        for (let x = 0; x < this.engine.width; x += step) {
            for (let y = 0; y < this.engine.height; y += step) {
                this.noiseGrid.push({
                    x, y,
                    phase: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.02 + 0.01
                });
            }
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        if (this.style === 0) {
            this.drawAttractor(ctx, cx, cy);
        } else if (this.style === 1) {
            this.drawNoise(ctx);
        } else {
            this.drawGlitch(ctx);
        }
    }

    drawAttractor(ctx, cx, cy) {
        // 로렌츠 어트랙터 - 더 밝고 글로우 효과
        const dt = 0.01;
        const sigma = 10, rho = 28, beta = 8 / 3;
        let { x, y, z } = this.chaosP;

        ctx.shadowBlur = 15;
        ctx.shadowColor = this.engine.colors[0];

        // 새 점들 계산
        const newPoints = [];
        for (let i = 0; i < 50; i++) {
            let dx = sigma * (y - x);
            let dy = x * (rho - z) - y;
            let dz = x * y - beta * z;
            x += dx * dt;
            y += dy * dt;
            z += dz * dt;
            newPoints.push({ x: cx + x * 8, y: cy + y * 8, z });
        }
        this.chaosP = { x, y, z };

        // 트레일에 추가
        this.trails.push(...newPoints);
        if (this.trails.length > 500) {
            this.trails = this.trails.slice(-500);
        }

        // 트레일 그리기
        ctx.lineWidth = 2;
        for (let i = 1; i < this.trails.length; i++) {
            const alpha = i / this.trails.length;
            const p1 = this.trails[i - 1];
            const p2 = this.trails[i];

            // z값에 따라 색상 변화
            const colorIdx = Math.floor((p2.z + 30) / 20) % this.engine.colors.length;
            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[colorIdx], alpha * 0.8);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }

        // 현재 위치 강조
        const last = this.trails[this.trails.length - 1];
        if (last) {
            ctx.beginPath();
            ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        ctx.shadowBlur = 0;
    }

    drawNoise(ctx) {
        // 펄린 노이즈 시각화 - 부드러운 흐름
        const t = this.engine.frame * 0.008;

        // 더 적은 점, 더 약한 효과
        const step = 40; // 더 넓은 간격

        ctx.shadowBlur = 5;

        for (let x = step; x < this.engine.width; x += step) {
            for (let y = step; y < this.engine.height; y += step) {
                // 노이즈 값 계산
                const noise = Math.sin(x * 0.008 + t) * Math.cos(y * 0.008 + t * 0.5);

                const angle = noise * Math.PI;
                const len = 12;

                const ex = x + Math.cos(angle) * len;
                const ey = y + Math.sin(angle) * len;

                const alpha = 0.3 + Math.abs(noise) * 0.3;
                const colorIdx = Math.floor((noise + 1) * 1.5) % this.engine.colors.length;
                const color = this.engine.colors[colorIdx];

                ctx.shadowColor = color;
                ctx.strokeStyle = this.engine.hexToRgba(color, alpha);
                ctx.lineWidth = 1.5;

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(ex, ey);
                ctx.stroke();
            }
        }

        ctx.shadowBlur = 0;
    }

    drawGlitch(ctx) {
        // 디지털 글리치 효과
        const t = this.engine.frame;

        // 주기적으로 글리치 블록 생성
        if (t % 3 === 0 && Math.random() > 0.5) {
            this.glitchBlocks.push({
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                w: Math.random() * 200 + 50,
                h: Math.random() * 30 + 5,
                life: 20,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)],
                offsetX: (Math.random() - 0.5) * 50
            });
        }

        // 글리치 블록 그리기
        this.glitchBlocks = this.glitchBlocks.filter(b => {
            b.life--;
            if (b.life <= 0) return false;

            const alpha = b.life / 20;

            // 메인 블록
            ctx.fillStyle = this.engine.hexToRgba(b.color, alpha * 0.7);
            ctx.fillRect(b.x, b.y, b.w, b.h);

            // RGB 분리 효과
            ctx.fillStyle = this.engine.hexToRgba('#ff0000', alpha * 0.3);
            ctx.fillRect(b.x + b.offsetX, b.y, b.w, b.h);

            ctx.fillStyle = this.engine.hexToRgba('#00ffff', alpha * 0.3);
            ctx.fillRect(b.x - b.offsetX, b.y, b.w, b.h);

            return true;
        });

        // 스캔라인 효과
        if (Math.random() > 0.95) {
            const y = Math.random() * this.engine.height;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, y, this.engine.width, 2);
        }

        // 노이즈 점들
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.engine.width;
            const y = Math.random() * this.engine.height;
            ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[0], Math.random() * 0.5);
            ctx.fillRect(x, y, 3, 3);
        }
    }
}
