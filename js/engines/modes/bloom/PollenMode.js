export class PollenMode {
    constructor(engine) {
        this.engine = engine;
        this.particles = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.particles = [];

        const count = this.style === 0 ? 60 : (this.style === 1 ? 40 : 50);

        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(i));
        }
    }

    createParticle(index) {
        const particle = {
            x: Math.random() * this.engine.width,
            y: Math.random() * this.engine.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            phase: Math.random() * Math.PI * 2,
            color: this.engine.colors[index % this.engine.colors.length]
        };

        if (this.style === 0) {
            // Dust: 미세한 먼지 같은 꽃가루
            particle.type = 'dust';
            particle.size = 2 + Math.random() * 4;
            particle.opacity = 0.3 + Math.random() * 0.4;
        } else if (this.style === 1) {
            // Sparkle: 반짝이는 큰 입자
            particle.type = 'sparkle';
            particle.size = 5 + Math.random() * 10;
            particle.sparkleSpeed = 0.1 + Math.random() * 0.1;
            particle.rays = 4 + Math.floor(Math.random() * 3);
        } else {
            // Scent: 향기처럼 퍼지는 파동
            particle.type = 'scent';
            particle.size = 20 + Math.random() * 30;
            particle.maxSize = particle.size * 3;
            particle.growSpeed = 0.5 + Math.random() * 0.5;
            particle.currentSize = particle.size;
        }

        return particle;
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        this.particles.forEach((p, i) => {
            // 브라운 운동
            p.vx += (Math.random() - 0.5) * 0.2;
            p.vy += (Math.random() - 0.5) * 0.2;
            p.vx *= 0.98;
            p.vy *= 0.98;

            // 바람 효과
            p.x += p.vx + Math.sin(t + p.phase) * 0.5;
            p.y += p.vy + Math.cos(t * 0.7 + p.phase) * 0.3;

            // 경계 처리
            if (p.x < 0) p.x = this.engine.width;
            if (p.x > this.engine.width) p.x = 0;
            if (p.y < 0) p.y = this.engine.height;
            if (p.y > this.engine.height) p.y = 0;

            ctx.save();

            if (p.type === 'dust') {
                this.drawDust(ctx, p, t);
            } else if (p.type === 'sparkle') {
                this.drawSparkle(ctx, p, t);
            } else {
                this.drawScent(ctx, p, t);
            }

            ctx.restore();
        });
    }

    drawDust(ctx, p, t) {
        const flicker = Math.sin(t * 3 + p.phase) * 0.2 + 0.8;

        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;

        // 부드러운 원형 입자
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, this.engine.hexToRgba(p.color, p.opacity * flicker));
        gradient.addColorStop(0.5, this.engine.hexToRgba(p.color, p.opacity * 0.5 * flicker));
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    drawSparkle(ctx, p, t) {
        const sparkle = Math.sin(t * 5 + p.phase) * 0.5 + 0.5;
        const rotation = t * p.sparkleSpeed + p.phase;

        ctx.translate(p.x, p.y);
        ctx.rotate(rotation);

        ctx.shadowBlur = 20;
        ctx.shadowColor = p.color;

        // 별 모양 반짝임
        for (let i = 0; i < p.rays; i++) {
            ctx.save();
            ctx.rotate((i / p.rays) * Math.PI * 2);

            const rayLength = p.size * (0.8 + sparkle * 0.5);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-2, -rayLength * 0.3);
            ctx.lineTo(0, -rayLength);
            ctx.lineTo(2, -rayLength * 0.3);
            ctx.closePath();

            ctx.fillStyle = this.engine.hexToRgba(p.color, 0.7 + sparkle * 0.3);
            ctx.fill();

            ctx.restore();
        }

        // 중심 원
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = this.engine.hexToRgba('#ffffff', 0.8);
        ctx.fill();
    }

    drawScent(ctx, p, t) {
        // 크기 증가
        p.currentSize += p.growSpeed;

        // 최대 크기 도달하면 리셋
        if (p.currentSize > p.maxSize) {
            p.currentSize = p.size;
            p.x = Math.random() * this.engine.width;
            p.y = Math.random() * this.engine.height;
        }

        const progress = (p.currentSize - p.size) / (p.maxSize - p.size);
        const opacity = (1 - progress) * 0.4;

        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;

        // 퍼져나가는 원
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.currentSize, 0, Math.PI * 2);
        ctx.strokeStyle = this.engine.hexToRgba(p.color, opacity);
        ctx.lineWidth = 2 + (1 - progress) * 3;
        ctx.stroke();

        // 내부 그라데이션
        if (progress < 0.5) {
            const innerGradient = ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, p.currentSize * 0.5
            );
            innerGradient.addColorStop(0, this.engine.hexToRgba(p.color, opacity * 0.5));
            innerGradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.currentSize * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = innerGradient;
            ctx.fill();
        }
    }
}
