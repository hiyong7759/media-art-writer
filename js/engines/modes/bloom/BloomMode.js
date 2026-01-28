export class BloomMode {
    constructor(engine) {
        this.engine = engine;
        this.flowers = [];
        this.particles = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.flowers = [];
        this.particles = [];

        if (this.style === 0) {
            // Full: 완전히 핀 대형 꽃들
            this.createFullBloom();
        } else if (this.style === 1) {
            // Bud: 봉오리에서 피어나는 중
            this.createBudBloom();
        } else {
            // Wild: 야생화 군락
            this.createWildBloom();
        }
    }

    createFullBloom() {
        for (let i = 0; i < 5; i++) {
            this.flowers.push({
                type: 'full',
                x: this.engine.width * (0.2 + i * 0.15),
                y: this.engine.height * (0.3 + Math.random() * 0.4),
                size: 50 + Math.random() * 30,
                petalCount: 8 + Math.floor(Math.random() * 4),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.005,
                phase: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length],
                breathScale: 1
            });
        }
    }

    createBudBloom() {
        for (let i = 0; i < 8; i++) {
            this.flowers.push({
                type: 'bud',
                x: this.engine.width * (0.1 + Math.random() * 0.8),
                y: this.engine.height * (0.2 + Math.random() * 0.6),
                size: 30 + Math.random() * 20,
                petalCount: 5 + Math.floor(Math.random() * 3),
                rotation: Math.random() * Math.PI * 2,
                phase: Math.random() * Math.PI * 2,
                bloomProgress: Math.random() * 0.3,
                bloomSpeed: 0.002 + Math.random() * 0.003,
                color: this.engine.colors[i % this.engine.colors.length],
                stemHeight: 50 + Math.random() * 80
            });
        }
    }

    createWildBloom() {
        for (let i = 0; i < 15; i++) {
            const type = Math.random() > 0.5 ? 'daisy' : 'poppy';
            this.flowers.push({
                type,
                x: this.engine.width * Math.random(),
                y: this.engine.height * (0.4 + Math.random() * 0.5),
                size: 15 + Math.random() * 25,
                petalCount: type === 'daisy' ? 12 : 4,
                rotation: Math.random() * Math.PI * 2,
                phase: Math.random() * Math.PI * 2,
                swaySpeed: 0.02 + Math.random() * 0.02,
                color: this.engine.colors[i % this.engine.colors.length],
                stemHeight: 40 + Math.random() * 60
            });
        }

        // 나비 파티클
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                type: 'butterfly',
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height * 0.6,
                size: 10 + Math.random() * 10,
                phase: Math.random() * Math.PI * 2,
                speed: 1 + Math.random(),
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawFullBloom(ctx, t);
        } else if (this.style === 1) {
            this.drawBudBloom(ctx, t);
        } else {
            this.drawWildBloom(ctx, t);
        }
    }

    drawFullBloom(ctx, t) {
        this.flowers.forEach(f => {
            f.rotation += f.rotationSpeed;
            f.breathScale = 1 + Math.sin(t + f.phase) * 0.08;

            ctx.save();
            ctx.translate(f.x, f.y);
            ctx.rotate(f.rotation);
            ctx.scale(f.breathScale, f.breathScale);

            ctx.shadowBlur = 25;
            ctx.shadowColor = f.color;

            // 외곽 꽃잎
            for (let i = 0; i < f.petalCount; i++) {
                const angle = (i / f.petalCount) * Math.PI * 2;
                const petalWave = Math.sin(t * 2 + i + f.phase) * 0.1;

                ctx.save();
                ctx.rotate(angle);

                // 꽃잎 (더 복잡한 형태)
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(
                    -f.size * 0.4, -f.size * 0.3,
                    -f.size * 0.3, -f.size * (0.8 + petalWave),
                    0, -f.size
                );
                ctx.bezierCurveTo(
                    f.size * 0.3, -f.size * (0.8 + petalWave),
                    f.size * 0.4, -f.size * 0.3,
                    0, 0
                );

                const gradient = ctx.createLinearGradient(0, 0, 0, -f.size);
                gradient.addColorStop(0, this.engine.hexToRgba(f.color, 0.9));
                gradient.addColorStop(0.6, this.engine.hexToRgba(f.color, 0.7));
                gradient.addColorStop(1, this.engine.hexToRgba('#ffffff', 0.5));
                ctx.fillStyle = gradient;
                ctx.fill();

                ctx.restore();
            }

            // 중심부 (수술)
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * f.size * 0.25;
                ctx.beginPath();
                ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 200, 50, 0.8)';
                ctx.fill();
            }

            ctx.restore();
        });
    }

    drawBudBloom(ctx, t) {
        this.flowers.forEach(f => {
            // 개화 진행
            f.bloomProgress = Math.min(1, f.bloomProgress + f.bloomSpeed);
            if (f.bloomProgress >= 1 && Math.random() < 0.002) {
                f.bloomProgress = 0; // 리셋
            }

            const sway = Math.sin(t + f.phase) * 5;

            ctx.save();
            ctx.translate(f.x + sway, f.y);

            ctx.shadowBlur = 15;
            ctx.shadowColor = f.color;

            // 줄기
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(sway * 0.5, f.stemHeight * 0.5, 0, f.stemHeight);
            ctx.strokeStyle = this.engine.hexToRgba(f.color, 0.4);
            ctx.lineWidth = 3;
            ctx.stroke();

            // 꽃 (봉오리에서 핌)
            ctx.translate(0, 0);
            ctx.rotate(f.rotation);

            const openAmount = f.bloomProgress;
            const currentSize = f.size * (0.3 + openAmount * 0.7);

            for (let i = 0; i < f.petalCount; i++) {
                const baseAngle = (i / f.petalCount) * Math.PI * 2;
                const spreadAngle = baseAngle * openAmount;

                ctx.save();
                ctx.rotate(spreadAngle);

                // 봉오리 형태에서 펼쳐지는 꽃잎
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(
                    -currentSize * 0.3 * openAmount,
                    -currentSize * 0.5,
                    0,
                    -currentSize
                );
                ctx.quadraticCurveTo(
                    currentSize * 0.3 * openAmount,
                    -currentSize * 0.5,
                    0, 0
                );

                ctx.fillStyle = this.engine.hexToRgba(f.color, 0.7 + openAmount * 0.2);
                ctx.fill();

                ctx.restore();
            }

            // 중심
            ctx.beginPath();
            ctx.arc(0, 0, currentSize * 0.15, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 200, ${openAmount})`;
            ctx.fill();

            ctx.restore();
        });
    }

    drawWildBloom(ctx, t) {
        // 줄기와 꽃
        this.flowers.forEach(f => {
            const sway = Math.sin(t * f.swaySpeed * 50 + f.phase) * 8;

            ctx.save();
            ctx.translate(f.x, f.y);

            ctx.shadowBlur = 12;
            ctx.shadowColor = f.color;

            // 줄기
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(sway, -f.stemHeight * 0.5, sway * 0.5, -f.stemHeight);
            ctx.strokeStyle = this.engine.hexToRgba('#4a7c4e', 0.6);
            ctx.lineWidth = 2;
            ctx.stroke();

            // 꽃
            ctx.translate(sway * 0.5, -f.stemHeight);
            ctx.rotate(sway * 0.02);

            if (f.type === 'daisy') {
                // 데이지 (많은 꽃잎)
                for (let i = 0; i < f.petalCount; i++) {
                    ctx.save();
                    ctx.rotate((i / f.petalCount) * Math.PI * 2);

                    ctx.beginPath();
                    ctx.ellipse(0, -f.size * 0.6, f.size * 0.15, f.size * 0.5, 0, 0, Math.PI * 2);
                    ctx.fillStyle = this.engine.hexToRgba(f.color, 0.85);
                    ctx.fill();

                    ctx.restore();
                }

                // 노란 중심
                ctx.beginPath();
                ctx.arc(0, 0, f.size * 0.25, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 220, 50, 0.9)';
                ctx.fill();
            } else {
                // 양귀비 (4장 큰 꽃잎)
                for (let i = 0; i < 4; i++) {
                    ctx.save();
                    ctx.rotate((i / 4) * Math.PI * 2 + Math.PI / 4);

                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(-f.size * 0.5, -f.size * 0.3, -f.size * 0.3, -f.size);
                    ctx.quadraticCurveTo(0, -f.size * 1.1, f.size * 0.3, -f.size);
                    ctx.quadraticCurveTo(f.size * 0.5, -f.size * 0.3, 0, 0);

                    ctx.fillStyle = this.engine.hexToRgba(f.color, 0.8);
                    ctx.fill();

                    ctx.restore();
                }

                // 검은 중심
                ctx.beginPath();
                ctx.arc(0, 0, f.size * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
                ctx.fill();
            }

            ctx.restore();
        });

        // 나비
        this.particles.forEach(p => {
            p.x += Math.sin(t + p.phase) * p.speed;
            p.y += Math.cos(t * 0.7 + p.phase) * 0.5;
            p.phase += 0.02;

            if (p.x < -50) p.x = this.engine.width + 50;
            if (p.x > this.engine.width + 50) p.x = -50;
            if (p.y < -50) p.y = this.engine.height * 0.6;
            if (p.y > this.engine.height * 0.8) p.y = 0;

            const wingFlap = Math.sin(t * 10 + p.phase) * 0.5;

            ctx.save();
            ctx.translate(p.x, p.y);

            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;

            // 날개
            ctx.save();
            ctx.scale(1, wingFlap + 0.5);
            ctx.beginPath();
            ctx.ellipse(-p.size * 0.4, 0, p.size * 0.5, p.size * 0.3, -0.3, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, 0.7);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.scale(1, -wingFlap + 0.5);
            ctx.beginPath();
            ctx.ellipse(p.size * 0.4, 0, p.size * 0.5, p.size * 0.3, 0.3, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, 0.7);
            ctx.fill();
            ctx.restore();

            // 몸통
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size * 0.1, p.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
            ctx.fill();

            ctx.restore();
        });
    }
}
