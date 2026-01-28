export class OrbitMode {
    constructor(engine) {
        this.engine = engine;
        this.planets = [];
        this.comets = [];
        this.asteroids = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.planets = [];
        this.comets = [];
        this.asteroids = [];

        if (this.style === 0) {
            // Planet: 행성 궤도 시스템
            this.createPlanets();
        } else if (this.style === 1) {
            // Comet: 혜성 궤적
            this.createComets();
        } else {
            // Asteroid: 소행성대
            this.createAsteroids();
        }
    }

    createPlanets() {
        for (let i = 0; i < 6; i++) {
            this.planets.push({
                orbitRadius: 60 + i * 45,
                size: 8 - i * 0.8,
                speed: 0.02 - i * 0.002,
                angle: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length],
                hasRing: i === 2
            });
        }
    }

    createComets() {
        for (let i = 0; i < 3; i++) {
            this.comets.push({
                x: Math.random() * this.engine.width,
                y: -50 - Math.random() * 100,
                vx: -2 - Math.random() * 2,
                vy: 3 + Math.random() * 2,
                size: 4 + Math.random() * 4,
                tailLength: 80 + Math.random() * 60,
                color: this.engine.colors[i % this.engine.colors.length],
                trail: []
            });
        }
    }

    createAsteroids() {
        // 소행성대 (원형 분포)
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;
        const innerRadius = 80;
        const outerRadius = 200;

        for (let i = 0; i < 200; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
            const irregularity = (Math.random() - 0.5) * 30;

            this.asteroids.push({
                angle,
                radius: radius + irregularity,
                baseRadius: radius,
                size: 1 + Math.random() * 3,
                speed: 0.001 + Math.random() * 0.002,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.02 + Math.random() * 0.02,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawPlanets(ctx, t);
        } else if (this.style === 1) {
            this.drawComets(ctx, t);
        } else {
            this.drawAsteroids(ctx, t);
        }
    }

    drawPlanets(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 중심 항성
        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.engine.colors[3];

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
        gradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[3], 0.9));
        gradient.addColorStop(0.7, this.engine.hexToRgba(this.engine.colors[2], 0.5));
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, 25, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();

        // 궤도와 행성
        this.planets.forEach(planet => {
            planet.angle += planet.speed;

            // 궤도선
            ctx.beginPath();
            ctx.arc(cx, cy, planet.orbitRadius, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(planet.color, 0.15);
            ctx.lineWidth = 1;
            ctx.stroke();

            // 행성 위치
            const px = cx + Math.cos(planet.angle) * planet.orbitRadius;
            const py = cy + Math.sin(planet.angle) * planet.orbitRadius;

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = planet.color;

            // 고리가 있는 행성
            if (planet.hasRing) {
                ctx.save();
                ctx.translate(px, py);
                ctx.scale(1, 0.3);
                ctx.beginPath();
                ctx.arc(0, 0, planet.size * 2, 0, Math.PI * 2);
                ctx.strokeStyle = this.engine.hexToRgba(planet.color, 0.4);
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            }

            // 행성 본체
            ctx.beginPath();
            ctx.arc(px, py, planet.size, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(planet.color, 0.8);
            ctx.fill();

            ctx.restore();
        });
    }

    drawComets(ctx, t) {
        this.comets.forEach(comet => {
            // 위치 업데이트
            comet.x += comet.vx;
            comet.y += comet.vy;

            // 꼬리 기록
            comet.trail.unshift({ x: comet.x, y: comet.y });
            if (comet.trail.length > 50) comet.trail.pop();

            // 화면 밖으로 나가면 재생성
            if (comet.y > this.engine.height + 100 || comet.x < -100) {
                comet.x = this.engine.width * 0.3 + Math.random() * this.engine.width * 0.7;
                comet.y = -50 - Math.random() * 100;
                comet.trail = [];
            }

            ctx.save();

            // 혜성 꼬리 (그라데이션)
            if (comet.trail.length > 2) {
                ctx.beginPath();
                ctx.moveTo(comet.trail[0].x, comet.trail[0].y);

                for (let i = 1; i < comet.trail.length; i++) {
                    ctx.lineTo(comet.trail[i].x, comet.trail[i].y);
                }

                const tailGradient = ctx.createLinearGradient(
                    comet.x, comet.y,
                    comet.x - comet.vx * 30, comet.y - comet.vy * 30
                );
                tailGradient.addColorStop(0, this.engine.hexToRgba(comet.color, 0.6));
                tailGradient.addColorStop(1, 'transparent');

                ctx.strokeStyle = tailGradient;
                ctx.lineWidth = comet.size;
                ctx.lineCap = 'round';
                ctx.stroke();

                // 내부 밝은 꼬리
                ctx.beginPath();
                ctx.moveTo(comet.trail[0].x, comet.trail[0].y);
                for (let i = 1; i < Math.min(20, comet.trail.length); i++) {
                    ctx.lineTo(comet.trail[i].x, comet.trail[i].y);
                }
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[3], 0.3);
                ctx.lineWidth = comet.size * 0.4;
                ctx.stroke();
            }

            // 혜성 핵
            ctx.shadowBlur = 20;
            ctx.shadowColor = comet.color;

            ctx.beginPath();
            ctx.arc(comet.x, comet.y, comet.size, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(comet.color, 0.9);
            ctx.fill();

            // 코마 (혜성 머리)
            const comaGradient = ctx.createRadialGradient(
                comet.x, comet.y, 0,
                comet.x, comet.y, comet.size * 3
            );
            comaGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[3], 0.4));
            comaGradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(comet.x, comet.y, comet.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = comaGradient;
            ctx.fill();

            ctx.restore();
        });
    }

    drawAsteroids(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 소행성대 배경 글로우
        ctx.save();
        const beltGradient = ctx.createRadialGradient(cx, cy, 60, cx, cy, 220);
        beltGradient.addColorStop(0, 'transparent');
        beltGradient.addColorStop(0.3, this.engine.hexToRgba(this.engine.colors[0], 0.03));
        beltGradient.addColorStop(0.7, this.engine.hexToRgba(this.engine.colors[1], 0.02));
        beltGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, 220, 0, Math.PI * 2);
        ctx.fillStyle = beltGradient;
        ctx.fill();
        ctx.restore();

        // 소행성들
        this.asteroids.forEach(asteroid => {
            asteroid.angle += asteroid.speed;
            asteroid.wobble += asteroid.wobbleSpeed;

            const wobbleOffset = Math.sin(asteroid.wobble) * 5;
            const currentRadius = asteroid.baseRadius + wobbleOffset;

            const x = cx + Math.cos(asteroid.angle) * currentRadius;
            const y = cy + Math.sin(asteroid.angle) * currentRadius;

            ctx.save();
            ctx.shadowBlur = 3;
            ctx.shadowColor = asteroid.color;

            // 불규칙한 소행성 모양
            ctx.beginPath();
            const points = 5;
            for (let i = 0; i <= points; i++) {
                const a = (i / points) * Math.PI * 2;
                const r = asteroid.size * (0.7 + Math.sin(a * 3 + asteroid.wobble) * 0.3);
                const px = x + Math.cos(a) * r;
                const py = y + Math.sin(a) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();

            ctx.fillStyle = this.engine.hexToRgba(asteroid.color, 0.6);
            ctx.fill();

            ctx.restore();
        });

        // 중심점 (태양 암시)
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.engine.colors[3];

        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[3], 0.5);
        ctx.fill();
        ctx.restore();
    }
}
