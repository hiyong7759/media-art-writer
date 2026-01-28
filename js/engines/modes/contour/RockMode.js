export class RockMode {
    constructor(engine) {
        this.engine = engine;
        this.elements = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.elements = [];

        if (this.style === 0) {
            // Sediment: 퇴적암 층
            this.createSediment();
        } else if (this.style === 1) {
            // Igneous: 화성암 (마그마)
            this.createIgneous();
        } else {
            // Crystal: 결정체
            this.createCrystal();
        }
    }

    createSediment() {
        const h = this.engine.height;
        const layers = 8;

        for (let i = 0; i < layers; i++) {
            const y = (h / layers) * i;
            const thickness = h / layers;

            this.elements.push({
                type: 'sediment_layer',
                y,
                thickness,
                color: this.engine.colors[i % this.engine.colors.length],
                offset: Math.random() * 20,
                phase: i * 0.3
            });

            // 층 내부 입자
            for (let j = 0; j < 15; j++) {
                this.elements.push({
                    type: 'sediment_grain',
                    x: Math.random() * this.engine.width,
                    y: y + Math.random() * thickness,
                    size: 2 + Math.random() * 5,
                    color: this.engine.colors[i % this.engine.colors.length]
                });
            }
        }
    }

    createIgneous() {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 마그마 중심
        this.elements.push({
            type: 'magma_core',
            x: cx,
            y: cy,
            radius: 80
        });

        // 마그마 버블
        for (let i = 0; i < 15; i++) {
            this.elements.push({
                type: 'magma_bubble',
                x: cx + (Math.random() - 0.5) * 200,
                y: cy + (Math.random() - 0.5) * 200,
                size: 10 + Math.random() * 30,
                speed: 0.5 + Math.random() * 1,
                phase: Math.random() * Math.PI * 2
            });
        }

        // 방사형 크랙
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.elements.push({
                type: 'crack',
                x: cx,
                y: cy,
                angle,
                length: 100 + Math.random() * 150,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }

        // 화산재 입자
        for (let i = 0; i < 30; i++) {
            this.elements.push({
                type: 'ash',
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                size: 2 + Math.random() * 4,
                speedX: (Math.random() - 0.5) * 2,
                speedY: -0.5 - Math.random() * 1
            });
        }
    }

    createCrystal() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 큰 결정들
        for (let i = 0; i < 8; i++) {
            this.elements.push({
                type: 'crystal',
                x: w * (0.1 + Math.random() * 0.8),
                y: h * (0.2 + Math.random() * 0.6),
                size: 40 + Math.random() * 60,
                sides: 5 + Math.floor(Math.random() * 3),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.01,
                color: this.engine.colors[i % this.engine.colors.length],
                phase: Math.random() * Math.PI * 2
            });
        }

        // 작은 결정 파티클
        for (let i = 0; i < 30; i++) {
            this.elements.push({
                type: 'crystal_shard',
                x: Math.random() * w,
                y: Math.random() * h,
                size: 5 + Math.random() * 15,
                rotation: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawSediment(ctx, t);
        } else if (this.style === 1) {
            this.drawIgneous(ctx, t);
        } else {
            this.drawCrystal(ctx, t);
        }
    }

    drawSediment(ctx, t) {
        const w = this.engine.width;

        // 먼저 층 그리기
        this.elements.filter(el => el.type === 'sediment_layer').forEach(el => {
            const wave = Math.sin(t * 0.5 + el.phase) * 3;

            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = el.color;

            ctx.beginPath();
            ctx.moveTo(0, el.y + wave);

            // 울퉁불퉁한 경계
            for (let x = 0; x <= w; x += 20) {
                const noise = Math.sin(x * 0.05 + el.offset + t * 0.3) * 8;
                ctx.lineTo(x, el.y + noise + wave);
            }

            ctx.lineTo(w, el.y + el.thickness + wave);
            ctx.lineTo(0, el.y + el.thickness + wave);
            ctx.closePath();

            ctx.fillStyle = this.engine.hexToRgba(el.color, 0.3);
            ctx.fill();

            ctx.strokeStyle = this.engine.hexToRgba(el.color, 0.6);
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        });

        // 입자 그리기
        this.elements.filter(el => el.type === 'sediment_grain').forEach(el => {
            ctx.beginPath();
            ctx.arc(el.x, el.y, el.size, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(el.color, 0.5);
            ctx.fill();
        });
    }

    drawIgneous(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 크랙 먼저
        this.elements.filter(el => el.type === 'crack').forEach(el => {
            const pulse = Math.sin(t + el.angle) * 0.2 + 1;

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = el.color;

            ctx.beginPath();
            ctx.moveTo(el.x, el.y);

            // 지그재그 크랙
            let x = el.x;
            let y = el.y;
            const segments = 5;
            for (let i = 0; i < segments; i++) {
                const segLen = (el.length / segments) * pulse;
                const zigzag = (Math.random() - 0.5) * 20;
                x += Math.cos(el.angle + zigzag * 0.05) * segLen;
                y += Math.sin(el.angle + zigzag * 0.05) * segLen;
                ctx.lineTo(x, y);
            }

            ctx.strokeStyle = this.engine.hexToRgba(el.color, 0.7);
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.restore();
        });

        // 마그마 코어
        this.elements.filter(el => el.type === 'magma_core').forEach(el => {
            const pulse = Math.sin(t * 2) * 10 + el.radius;

            ctx.save();
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#ff4400';

            const gradient = ctx.createRadialGradient(el.x, el.y, 0, el.x, el.y, pulse);
            gradient.addColorStop(0, 'rgba(255, 200, 50, 0.9)');
            gradient.addColorStop(0.4, 'rgba(255, 100, 0, 0.7)');
            gradient.addColorStop(0.7, 'rgba(200, 50, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(100, 20, 0, 0.2)');

            ctx.beginPath();
            ctx.arc(el.x, el.y, pulse, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.restore();
        });

        // 버블
        this.elements.filter(el => el.type === 'magma_bubble').forEach(el => {
            el.y -= el.speed;
            if (el.y < cy - 150) {
                el.y = cy + 100;
                el.x = cx + (Math.random() - 0.5) * 150;
            }

            const pulse = Math.sin(t * 3 + el.phase) * 0.3 + 1;

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff6600';

            ctx.beginPath();
            ctx.arc(el.x, el.y, el.size * pulse, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 150, 50, 0.4)';
            ctx.fill();

            ctx.restore();
        });

        // 화산재
        this.elements.filter(el => el.type === 'ash').forEach(el => {
            el.x += el.speedX;
            el.y += el.speedY;

            if (el.y < 0) {
                el.y = this.engine.height;
                el.x = Math.random() * this.engine.width;
            }
            if (el.x < 0) el.x = this.engine.width;
            if (el.x > this.engine.width) el.x = 0;

            ctx.beginPath();
            ctx.arc(el.x, el.y, el.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
            ctx.fill();
        });
    }

    drawCrystal(ctx, t) {
        // 작은 파편 먼저
        this.elements.filter(el => el.type === 'crystal_shard').forEach(el => {
            const sparkle = Math.sin(t * 4 + el.x * 0.1) * 0.3 + 0.5;

            ctx.save();
            ctx.translate(el.x, el.y);
            ctx.rotate(el.rotation + t * 0.5);

            ctx.beginPath();
            ctx.moveTo(0, -el.size);
            ctx.lineTo(el.size * 0.5, 0);
            ctx.lineTo(0, el.size);
            ctx.lineTo(-el.size * 0.5, 0);
            ctx.closePath();

            ctx.fillStyle = this.engine.hexToRgba(el.color, sparkle * 0.5);
            ctx.fill();

            ctx.restore();
        });

        // 큰 결정
        this.elements.filter(el => el.type === 'crystal').forEach(el => {
            el.rotation += el.rotationSpeed;
            const pulse = Math.sin(t + el.phase) * 0.1 + 1;
            const sparkle = Math.sin(t * 3 + el.phase) * 0.3 + 0.7;

            ctx.save();
            ctx.translate(el.x, el.y);
            ctx.rotate(el.rotation);

            ctx.shadowBlur = 25;
            ctx.shadowColor = el.color;

            // 다각형 결정
            ctx.beginPath();
            for (let i = 0; i < el.sides; i++) {
                const angle = (i / el.sides) * Math.PI * 2 - Math.PI / 2;
                const r = el.size * pulse;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            // 그라데이션 채우기
            const gradient = ctx.createLinearGradient(-el.size, -el.size, el.size, el.size);
            gradient.addColorStop(0, this.engine.hexToRgba(el.color, sparkle * 0.6));
            gradient.addColorStop(0.5, this.engine.hexToRgba('#ffffff', sparkle * 0.3));
            gradient.addColorStop(1, this.engine.hexToRgba(el.color, sparkle * 0.4));
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.strokeStyle = this.engine.hexToRgba(el.color, 0.9);
            ctx.lineWidth = 2;
            ctx.stroke();

            // 내부 라인
            ctx.strokeStyle = this.engine.hexToRgba('#ffffff', 0.2);
            ctx.lineWidth = 1;
            for (let i = 0; i < el.sides; i++) {
                const angle = (i / el.sides) * Math.PI * 2 - Math.PI / 2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * el.size * 0.8, Math.sin(angle) * el.size * 0.8);
                ctx.stroke();
            }

            ctx.restore();
        });
    }
}
