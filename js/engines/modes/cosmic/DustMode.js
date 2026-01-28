export class DustMode {
    constructor(engine) {
        this.engine = engine;
        this.stars = [];
        this.particles = [];
        this.clouds = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.stars = [];
        this.particles = [];
        this.clouds = [];

        if (this.style === 0) {
            // Nebula: 우주 여행 (기존 유지)
            this.createNebula();
        } else if (this.style === 1) {
            // Stardust: 반짝이는 별 먼지 구름
            this.createStardust();
        } else {
            // DarkMatter: 보이지 않는 중력 효과
            this.createDarkMatter();
        }
    }

    createNebula() {
        this.stars = Array.from({ length: 100 }, () => ({
            x: Math.random() * this.engine.width - this.engine.width / 2,
            y: Math.random() * this.engine.height - this.engine.height / 2,
            z: Math.random() * 200 + 50,
            color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
        }));
    }

    createStardust() {
        // 떠다니는 빛나는 먼지 입자들
        for (let i = 0; i < 150; i++) {
            this.particles.push({
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                size: Math.random() * 3 + 1,
                twinkleSpeed: 0.02 + Math.random() * 0.03,
                twinklePhase: Math.random() * Math.PI * 2,
                driftX: (Math.random() - 0.5) * 0.3,
                driftY: (Math.random() - 0.5) * 0.3,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
            });
        }

        // 성운 구름 레이어
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                radius: 100 + Math.random() * 150,
                color: this.engine.colors[i % this.engine.colors.length],
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    createDarkMatter() {
        // 중력 렌즈 효과를 위한 그리드 포인트
        const gridSize = 30;
        for (let x = 0; x < this.engine.width; x += gridSize) {
            for (let y = 0; y < this.engine.height; y += gridSize) {
                this.particles.push({
                    baseX: x,
                    baseY: y,
                    x: x,
                    y: y,
                    size: 1.5
                });
            }
        }

        // 다크매터 중심점들
        this.clouds = [
            { x: this.engine.width * 0.3, y: this.engine.height * 0.4, mass: 150, phase: 0 },
            { x: this.engine.width * 0.7, y: this.engine.height * 0.6, mass: 120, phase: Math.PI }
        ];
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawNebula(ctx);
        } else if (this.style === 1) {
            this.drawStardust(ctx, t);
        } else {
            this.drawDarkMatter(ctx, t);
        }
    }

    drawNebula(ctx) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        this.stars.forEach(s => {
            s.z -= 1;
            if (s.z <= 0) {
                s.z = 200;
                s.x = Math.random() * this.engine.width - this.engine.width / 2;
                s.y = Math.random() * this.engine.height - this.engine.height / 2;
            }

            const scale = 100 / s.z;
            const x = cx + s.x * scale;
            const y = cy + s.y * scale;
            const r = Math.max(0.5, scale * 3.0);
            const alpha = 0.8 * (1 - s.z / 200);

            if (x >= 0 && x <= this.engine.width && y >= 0 && y <= this.engine.height) {
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(s.color, alpha);
                ctx.fill();
            }
        });
    }

    drawStardust(ctx, t) {
        // 성운 구름 배경
        this.clouds.forEach(cloud => {
            cloud.phase += 0.005;
            const breathe = Math.sin(cloud.phase) * 20;

            const gradient = ctx.createRadialGradient(
                cloud.x, cloud.y, 0,
                cloud.x, cloud.y, cloud.radius + breathe
            );
            gradient.addColorStop(0, this.engine.hexToRgba(cloud.color, 0.15));
            gradient.addColorStop(0.5, this.engine.hexToRgba(cloud.color, 0.05));
            gradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.radius + breathe, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        });

        // 반짝이는 먼지 입자
        this.particles.forEach(p => {
            p.x += p.driftX;
            p.y += p.driftY;
            p.twinklePhase += p.twinkleSpeed;

            // 화면 래핑
            if (p.x < 0) p.x = this.engine.width;
            if (p.x > this.engine.width) p.x = 0;
            if (p.y < 0) p.y = this.engine.height;
            if (p.y > this.engine.height) p.y = 0;

            const twinkle = Math.sin(p.twinklePhase) * 0.4 + 0.6;
            const size = p.size * twinkle;

            ctx.save();
            ctx.shadowBlur = 10 * twinkle;
            ctx.shadowColor = p.color;

            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, 0.5 * twinkle);
            ctx.fill();

            // 십자 광채
            if (twinkle > 0.8) {
                ctx.strokeStyle = this.engine.hexToRgba(p.color, 0.3 * twinkle);
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(p.x - size * 3, p.y);
                ctx.lineTo(p.x + size * 3, p.y);
                ctx.moveTo(p.x, p.y - size * 3);
                ctx.lineTo(p.x, p.y + size * 3);
                ctx.stroke();
            }

            ctx.restore();
        });
    }

    drawDarkMatter(ctx, t) {
        const mainColor = this.engine.colors[2];

        // 다크매터 중심점 움직임
        this.clouds.forEach(dm => {
            dm.phase += 0.01;
            dm.x += Math.sin(dm.phase) * 0.5;
            dm.y += Math.cos(dm.phase * 0.7) * 0.5;
        });

        // 그리드 왜곡 (중력 렌즈)
        this.particles.forEach(p => {
            let totalDx = 0;
            let totalDy = 0;

            this.clouds.forEach(dm => {
                const dx = dm.x - p.baseX;
                const dy = dm.y - p.baseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < dm.mass * 2 && dist > 10) {
                    const force = dm.mass / (dist * dist) * 50;
                    totalDx += (dx / dist) * force;
                    totalDy += (dy / dist) * force;
                }
            });

            p.x = p.baseX + totalDx;
            p.y = p.baseY + totalDy;

            // 왜곡된 점 그리기
            const distortion = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
            const alpha = Math.min(0.8, 0.2 + distortion * 0.02);

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size + distortion * 0.05, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(mainColor, alpha);
            ctx.fill();
        });

        // 다크매터 중심 (보이지 않는 존재의 암시)
        this.clouds.forEach(dm => {
            ctx.save();

            // 주변 왜곡 링
            for (let i = 3; i > 0; i--) {
                const radius = dm.mass * 0.3 * i;
                const gradient = ctx.createRadialGradient(dm.x, dm.y, 0, dm.x, dm.y, radius);
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(0.7, this.engine.hexToRgba(this.engine.colors[0], 0.03 * i));
                gradient.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.arc(dm.x, dm.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            ctx.restore();
        });
    }
}
