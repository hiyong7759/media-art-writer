export class GalaxyMode {
    constructor(engine) {
        this.engine = engine;
        this.stars = [];
        this.arms = [];
        this.elements = [];
        this.style = 0;
        this.rotation = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.stars = [];
        this.arms = [];
        this.elements = [];
        this.rotation = 0;

        if (this.style === 0) {
            // Spiral: 나선 은하 (기존 개선)
            this.createSpiral();
        } else if (this.style === 1) {
            // Elliptical: 타원 은하
            this.createElliptical();
        } else {
            // Collision: 은하 충돌
            this.createCollision();
        }
    }

    createSpiral() {
        // 나선팔 별들
        for (let arm = 0; arm < 2; arm++) {
            const armOffset = arm * Math.PI;
            for (let i = 0; i < 150; i++) {
                const angle = i * 0.08 + armOffset;
                const radius = i * 1.5 + 20;
                const spread = (Math.random() - 0.5) * 30;

                this.stars.push({
                    baseAngle: angle,
                    baseRadius: radius,
                    spread,
                    size: Math.random() * 2 + 0.5,
                    brightness: Math.random(),
                    color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
                });
            }
        }

        // 중심 벌지
        for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 40;
            this.elements.push({
                type: 'bulge',
                angle,
                radius,
                size: Math.random() * 2 + 1,
                color: this.engine.colors[3]
            });
        }
    }

    createElliptical() {
        // 타원형 분포의 별들
        for (let i = 0; i < 300; i++) {
            const angle = Math.random() * Math.PI * 2;
            // 가우시안 분포 근사
            const u1 = Math.random();
            const u2 = Math.random();
            const radius = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * 80 + 100;

            this.stars.push({
                angle,
                radius: Math.abs(radius),
                size: Math.random() * 2 + 0.5,
                brightness: Math.random(),
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.02 + Math.random() * 0.02,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
            });
        }

        // 중심 코어
        this.elements.push({
            type: 'core',
            size: 50,
            phase: 0
        });
    }

    createCollision() {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 첫 번째 은하
        this.elements.push({
            type: 'galaxy1',
            x: cx - 80,
            y: cy,
            rotation: 0,
            stars: this.generateMiniGalaxy(80, 0),
            color: this.engine.colors[1]
        });

        // 두 번째 은하
        this.elements.push({
            type: 'galaxy2',
            x: cx + 80,
            y: cy,
            rotation: Math.PI,
            stars: this.generateMiniGalaxy(60, 1),
            color: this.engine.colors[2]
        });

        // 상호작용 브릿지 (조석 꼬리)
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                t: i / 50,
                offset: (Math.random() - 0.5) * 30,
                size: Math.random() * 2 + 0.5,
                phase: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % 2 === 0 ? 1 : 2]
            });
        }
    }

    generateMiniGalaxy(maxRadius, colorOffset) {
        const stars = [];
        for (let arm = 0; arm < 2; arm++) {
            for (let i = 0; i < 40; i++) {
                const angle = i * 0.15 + arm * Math.PI;
                const radius = i * 1.2 + 10;
                stars.push({
                    baseAngle: angle,
                    baseRadius: Math.min(radius, maxRadius),
                    spread: (Math.random() - 0.5) * 15,
                    size: Math.random() * 1.5 + 0.5,
                    color: this.engine.colors[(colorOffset + Math.floor(Math.random() * 2)) % this.engine.colors.length]
                });
            }
        }
        return stars;
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;
        this.rotation += 0.002;

        if (this.style === 0) {
            this.drawSpiral(ctx, t);
        } else if (this.style === 1) {
            this.drawElliptical(ctx, t);
        } else {
            this.drawCollision(ctx, t);
        }
    }

    drawSpiral(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.rotation);

        // 나선팔 별들
        this.stars.forEach(star => {
            const angle = star.baseAngle + this.rotation * 0.5;
            const x = Math.cos(angle) * star.baseRadius + star.spread;
            const y = Math.sin(angle) * star.baseRadius * 0.4 + star.spread * 0.4;

            const twinkle = Math.sin(t * 2 + star.brightness * 10) * 0.3 + 0.7;

            ctx.save();
            ctx.shadowBlur = 5 * twinkle;
            ctx.shadowColor = star.color;

            ctx.beginPath();
            ctx.arc(x, y, star.size * twinkle, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(star.color, 0.5 * twinkle);
            ctx.fill();

            ctx.restore();
        });

        // 중심 벌지
        this.elements.filter(e => e.type === 'bulge').forEach(star => {
            const x = Math.cos(star.angle) * star.radius;
            const y = Math.sin(star.angle) * star.radius * 0.4;

            ctx.beginPath();
            ctx.arc(x, y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(star.color, 0.6);
            ctx.fill();
        });

        ctx.restore();

        // 중심 글로우
        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.engine.colors[3];

        const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
        coreGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[3], 0.6));
        coreGradient.addColorStop(0.5, this.engine.hexToRgba(this.engine.colors[2], 0.2));
        coreGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();

        ctx.restore();
    }

    drawElliptical(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 타원 은하 글로우 배경
        const bgGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
        bgGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[3], 0.15));
        bgGradient.addColorStop(0.5, this.engine.hexToRgba(this.engine.colors[1], 0.05));
        bgGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, 0.6);
        ctx.arc(0, 0, 180, 0, Math.PI * 2);
        ctx.restore();
        ctx.fillStyle = bgGradient;
        ctx.fill();

        // 별들
        this.stars.forEach(star => {
            star.twinkle += star.twinkleSpeed;
            const twinkle = Math.sin(star.twinkle) * 0.3 + 0.7;

            const x = cx + Math.cos(star.angle) * star.radius;
            const y = cy + Math.sin(star.angle) * star.radius * 0.6;

            ctx.save();
            ctx.shadowBlur = 4 * twinkle;
            ctx.shadowColor = star.color;

            ctx.beginPath();
            ctx.arc(x, y, star.size * twinkle, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(star.color, 0.4 + star.brightness * 0.3);
            ctx.fill();

            ctx.restore();
        });

        // 중심 코어
        const core = this.elements.find(e => e.type === 'core');
        if (core) {
            core.phase += 0.02;
            const breathe = Math.sin(core.phase) * 5;

            ctx.save();
            ctx.shadowBlur = 40;
            ctx.shadowColor = this.engine.colors[3];

            const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, core.size + breathe);
            coreGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[3], 0.7));
            coreGradient.addColorStop(0.5, this.engine.hexToRgba(this.engine.colors[2], 0.3));
            coreGradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(cx, cy, core.size + breathe, 0, Math.PI * 2);
            ctx.fillStyle = coreGradient;
            ctx.fill();

            ctx.restore();
        }
    }

    drawCollision(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 두 은하
        this.elements.forEach(el => {
            if (el.type === 'galaxy1' || el.type === 'galaxy2') {
                el.rotation += el.type === 'galaxy1' ? 0.01 : -0.008;

                // 은하 간 인력으로 서서히 접근
                const targetX = el.type === 'galaxy1' ? cx - 60 + Math.sin(t * 0.5) * 20 : cx + 60 - Math.sin(t * 0.5) * 20;
                el.x += (targetX - el.x) * 0.01;

                ctx.save();
                ctx.translate(el.x, el.y);
                ctx.rotate(el.rotation);

                // 미니 은하의 별들
                el.stars.forEach(star => {
                    const angle = star.baseAngle;
                    const x = Math.cos(angle) * star.baseRadius + star.spread;
                    const y = Math.sin(angle) * star.baseRadius * 0.4 + star.spread * 0.3;

                    ctx.beginPath();
                    ctx.arc(x, y, star.size, 0, Math.PI * 2);
                    ctx.fillStyle = this.engine.hexToRgba(star.color, 0.5);
                    ctx.fill();
                });

                // 은하 코어
                ctx.shadowBlur = 20;
                ctx.shadowColor = el.color;

                const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
                coreGradient.addColorStop(0, this.engine.hexToRgba(el.color, 0.7));
                coreGradient.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.arc(0, 0, 20, 0, Math.PI * 2);
                ctx.fillStyle = coreGradient;
                ctx.fill();

                ctx.restore();
            }
        });

        // 조석 브릿지 (두 은하 사이 연결)
        const g1 = this.elements.find(e => e.type === 'galaxy1');
        const g2 = this.elements.find(e => e.type === 'galaxy2');

        if (g1 && g2) {
            this.stars.forEach(star => {
                star.phase += 0.02;

                // 베지어 곡선 상의 위치
                const t_pos = star.t;
                const bend = Math.sin(t * 0.5 + star.phase) * 30;

                // 곡선 보간
                const x = g1.x + (g2.x - g1.x) * t_pos + star.offset * Math.sin(t_pos * Math.PI);
                const y = g1.y + (g2.y - g1.y) * t_pos + bend * Math.sin(t_pos * Math.PI);

                const pulse = Math.sin(star.phase) * 0.3 + 0.7;

                ctx.save();
                ctx.shadowBlur = 5 * pulse;
                ctx.shadowColor = star.color;

                ctx.beginPath();
                ctx.arc(x, y, star.size * pulse, 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(star.color, 0.4 * pulse);
                ctx.fill();

                ctx.restore();
            });

            // 상호작용 글로우
            const interactionGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
            interactionGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[3], 0.1));
            interactionGradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(cx, cy, 100, 0, Math.PI * 2);
            ctx.fillStyle = interactionGradient;
            ctx.fill();
        }
    }
}
