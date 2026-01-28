export class NovaMode {
    constructor(engine) {
        this.engine = engine;
        this.particles = [];
        this.rings = [];
        this.rays = [];
        this.style = 0;
        this.phase = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.particles = [];
        this.rings = [];
        this.rays = [];
        this.phase = 0;

        if (this.style === 0) {
            // Explosion: 초신성 폭발
            this.createExplosion();
        } else if (this.style === 1) {
            // Remnant: 초신성 잔해 (성운)
            this.createRemnant();
        } else {
            // Pulsar: 주기적 펄스 방출
            this.createPulsar();
        }
    }

    createExplosion() {
        // 폭발 중심
        this.rings.push({
            radius: 0,
            maxRadius: 300,
            speed: 2,
            opacity: 1
        });

        // 방출 입자
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            this.particles.push({
                x: this.engine.width / 2,
                y: this.engine.height / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 4,
                life: 1,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
            });
        }
    }

    createRemnant() {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 잔해 필라멘트
        for (let i = 0; i < 8; i++) {
            const baseAngle = (i / 8) * Math.PI * 2;
            this.rays.push({
                angle: baseAngle,
                length: 100 + Math.random() * 100,
                width: 20 + Math.random() * 30,
                twist: Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }

        // 중심 잔해
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 20 + Math.random() * 60;
            this.particles.push({
                x: cx + Math.cos(angle) * dist,
                y: cy + Math.sin(angle) * dist,
                baseX: cx + Math.cos(angle) * dist,
                baseY: cy + Math.sin(angle) * dist,
                size: 1 + Math.random() * 3,
                phase: Math.random() * Math.PI * 2,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
            });
        }
    }

    createPulsar() {
        // 펄사 빔
        this.rays.push({
            angle: 0,
            rotationSpeed: 0.03,
            beamWidth: 15,
            beamLength: 250
        });

        // 자기장 라인
        for (let i = 0; i < 6; i++) {
            this.rings.push({
                angle: (i / 6) * Math.PI,
                radius: 60 + i * 20,
                phase: i * Math.PI / 3
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;
        this.phase += 0.05;

        if (this.style === 0) {
            this.drawExplosion(ctx, t);
        } else if (this.style === 1) {
            this.drawRemnant(ctx, t);
        } else {
            this.drawPulsar(ctx, t);
        }
    }

    drawExplosion(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 중심 코어
        ctx.save();
        const coreSize = 20 + Math.sin(this.phase * 2) * 5;
        ctx.shadowBlur = 40;
        ctx.shadowColor = this.engine.colors[3];

        const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
        coreGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[3], 0.9));
        coreGradient.addColorStop(0.5, this.engine.hexToRgba(this.engine.colors[2], 0.5));
        coreGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();
        ctx.restore();

        // 폭발 링
        this.rings.forEach(ring => {
            ring.radius += ring.speed;
            ring.opacity -= 0.005;

            if (ring.radius > ring.maxRadius) {
                ring.radius = 0;
                ring.opacity = 1;
            }

            if (ring.opacity > 0) {
                ctx.save();
                ctx.shadowBlur = 20 * ring.opacity;
                ctx.shadowColor = this.engine.colors[1];

                ctx.beginPath();
                ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[1], ring.opacity * 0.6);
                ctx.lineWidth = 3 * ring.opacity;
                ctx.stroke();

                // 외부 글로우
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[2], ring.opacity * 0.2);
                ctx.lineWidth = 10 * ring.opacity;
                ctx.stroke();

                ctx.restore();
            }
        });

        // 새 링 생성
        if (Math.random() < 0.03) {
            this.rings.push({
                radius: 20,
                maxRadius: 300,
                speed: 1.5 + Math.random(),
                opacity: 0.8
            });
        }

        // 방출 입자
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.99;
            p.vy *= 0.99;
            p.life -= 0.008;

            if (p.life <= 0) {
                // 재생성
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 3;
                p.x = cx;
                p.y = cy;
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
                p.life = 1;
            }

            ctx.save();
            ctx.shadowBlur = 8 * p.life;
            ctx.shadowColor = p.color;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, p.life * 0.7);
            ctx.fill();

            ctx.restore();

            return true;
        });
    }

    drawRemnant(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 필라멘트 (잔해 가닥)
        this.rays.forEach(ray => {
            ray.phase += 0.01;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(ray.angle);

            // 뒤틀린 필라멘트
            ctx.beginPath();
            for (let i = 0; i <= 20; i++) {
                const progress = i / 20;
                const dist = progress * ray.length;
                const twist = Math.sin(progress * Math.PI * 2 + ray.phase) * ray.width * 0.5;
                const x = dist;
                const y = twist * (1 - progress * 0.5);

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.strokeStyle = this.engine.hexToRgba(ray.color, 0.4);
            ctx.lineWidth = ray.width * 0.3;
            ctx.lineCap = 'round';
            ctx.stroke();

            // 내부 밝은 선
            ctx.strokeStyle = this.engine.hexToRgba(ray.color, 0.2);
            ctx.lineWidth = ray.width * 0.1;
            ctx.stroke();

            ctx.restore();
        });

        // 중심 잔해 입자들
        this.particles.forEach(p => {
            p.phase += 0.02;
            const wobble = Math.sin(p.phase) * 3;
            p.x = p.baseX + wobble;
            p.y = p.baseY + Math.cos(p.phase * 0.7) * 2;

            ctx.save();
            ctx.shadowBlur = 5;
            ctx.shadowColor = p.color;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, 0.5);
            ctx.fill();

            ctx.restore();
        });

        // 중심 (중성자별 또는 블랙홀)
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.engine.colors[3];

        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[3], 0.7);
        ctx.fill();

        ctx.restore();

        // 배경 성운 글로우
        const nebulaGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
        nebulaGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[1], 0.1));
        nebulaGradient.addColorStop(0.5, this.engine.hexToRgba(this.engine.colors[0], 0.05));
        nebulaGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, 200, 0, Math.PI * 2);
        ctx.fillStyle = nebulaGradient;
        ctx.fill();
    }

    drawPulsar(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;
        const mainColor = this.engine.colors[2];

        // 펄사 빔
        const beam = this.rays[0];
        beam.angle += beam.rotationSpeed;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(beam.angle);

        // 상단 빔
        const beamGradient = ctx.createLinearGradient(0, 0, beam.beamLength, 0);
        beamGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[3], 0.8));
        beamGradient.addColorStop(0.3, this.engine.hexToRgba(mainColor, 0.5));
        beamGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(0, -beam.beamWidth / 2);
        ctx.lineTo(beam.beamLength, -beam.beamWidth * 0.1);
        ctx.lineTo(beam.beamLength, beam.beamWidth * 0.1);
        ctx.lineTo(0, beam.beamWidth / 2);
        ctx.closePath();
        ctx.fillStyle = beamGradient;
        ctx.fill();

        // 반대쪽 빔
        ctx.rotate(Math.PI);
        ctx.beginPath();
        ctx.moveTo(0, -beam.beamWidth / 2);
        ctx.lineTo(beam.beamLength, -beam.beamWidth * 0.1);
        ctx.lineTo(beam.beamLength, beam.beamWidth * 0.1);
        ctx.lineTo(0, beam.beamWidth / 2);
        ctx.closePath();
        ctx.fillStyle = beamGradient;
        ctx.fill();

        ctx.restore();

        // 자기장 라인
        this.rings.forEach((ring, i) => {
            ring.phase += 0.02;

            ctx.save();
            ctx.translate(cx, cy);

            // 타원형 자기장
            ctx.beginPath();
            for (let a = 0; a <= Math.PI * 2; a += 0.1) {
                const r = ring.radius * (1 + Math.sin(a * 2 + ring.phase) * 0.2);
                const x = Math.cos(a) * r;
                const y = Math.sin(a) * r * 0.4;

                if (a === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[i % this.engine.colors.length], 0.2);
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        });

        // 펄사 코어
        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.engine.colors[3];

        const pulse = Math.sin(this.phase * 3) * 0.3 + 0.7;

        ctx.beginPath();
        ctx.arc(cx, cy, 15 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[3], 0.9);
        ctx.fill();

        // 코어 글로우
        const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
        coreGlow.addColorStop(0, this.engine.hexToRgba(mainColor, 0.5 * pulse));
        coreGlow.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fillStyle = coreGlow;
        ctx.fill();

        ctx.restore();
    }
}
