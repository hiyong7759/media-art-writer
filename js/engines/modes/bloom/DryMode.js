export class DryMode {
    constructor(engine) {
        this.engine = engine;
        this.elements = [];
        this.particles = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.elements = [];
        this.particles = [];

        if (this.style === 0) {
            // Pressed: 압화 (납작하게 누른 꽃)
            this.createPressedFlowers();
        } else if (this.style === 1) {
            // Withered: 시든 꽃
            this.createWitheredFlowers();
        } else {
            // Vintage: 빈티지 드라이플라워
            this.createVintageFlowers();
        }
    }

    createPressedFlowers() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 압화된 꽃들 (책 사이에 누른 느낌)
        for (let i = 0; i < 10; i++) {
            this.elements.push({
                type: 'pressed_flower',
                x: w * (0.15 + Math.random() * 0.7),
                y: h * (0.15 + Math.random() * 0.7),
                size: 35 + Math.random() * 45,
                rotation: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length],
                petalCount: 5 + Math.floor(Math.random() * 4),
                phase: Math.random() * Math.PI * 2
            });
        }

        // 잎사귀
        for (let i = 0; i < 8; i++) {
            this.elements.push({
                type: 'pressed_leaf',
                x: w * (0.1 + Math.random() * 0.8),
                y: h * (0.1 + Math.random() * 0.8),
                size: 25 + Math.random() * 35,
                rotation: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }

        // 빛 입자 (마른 꽃에 비치는 햇살 느낌)
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 3 + Math.random() * 5,
                phase: Math.random() * Math.PI * 2,
                driftX: (Math.random() - 0.5) * 0.2,
                driftY: (Math.random() - 0.5) * 0.2
            });
        }
    }

    createWitheredFlowers() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 시든 꽃들 (처진 형태)
        for (let i = 0; i < 8; i++) {
            this.elements.push({
                type: 'withered_flower',
                x: w * (0.1 + i * 0.11),
                y: h * 0.65,
                size: 25 + Math.random() * 20,
                droop: 0.4 + Math.random() * 0.4,
                color: this.engine.colors[i % this.engine.colors.length],
                phase: Math.random() * Math.PI * 2,
                stemHeight: 80 + Math.random() * 60
            });
        }

        // 떨어진 꽃잎
        for (let i = 0; i < 25; i++) {
            this.elements.push({
                type: 'fallen_petal',
                x: Math.random() * w,
                y: h * 0.7 + Math.random() * h * 0.25,
                size: 8 + Math.random() * 15,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                color: this.engine.colors[i % this.engine.colors.length],
                driftX: (Math.random() - 0.5) * 0.3,
                driftY: 0.1 + Math.random() * 0.2
            });
        }

        // 먼지 입자 (시들어가는 분위기)
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: Math.random() * w,
                y: h * 0.3 + Math.random() * h * 0.5,
                size: 1 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2,
                speed: 0.2 + Math.random() * 0.3
            });
        }
    }

    createVintageFlowers() {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 꽃병
        this.elements.push({
            type: 'vase',
            x: cx,
            y: cy + 80
        });

        // 드라이플라워 줄기들
        for (let i = 0; i < 9; i++) {
            const angle = (i / 9 - 0.5) * Math.PI * 0.7 - Math.PI / 2;
            const len = 120 + Math.random() * 80;

            this.elements.push({
                type: 'vintage_stem',
                x: cx + (Math.random() - 0.5) * 40,
                y: cy + 30,
                angle,
                length: len,
                color: this.engine.colors[i % this.engine.colors.length],
                flowerType: Math.floor(Math.random() * 3), // 0: round, 1: spike, 2: berry
                phase: i * 0.3
            });
        }

        // 리본
        this.elements.push({
            type: 'ribbon',
            x: cx,
            y: cy + 40,
            color: this.engine.colors[0]
        });

        // 빈티지 분위기 빛 (창문에서 들어오는 빛 느낌)
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.engine.width * (0.3 + Math.random() * 0.4),
                y: this.engine.height * Math.random(),
                size: 4 + Math.random() * 6,
                phase: Math.random() * Math.PI * 2,
                speed: 0.1 + Math.random() * 0.2
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.015;

        if (this.style === 0) {
            this.drawPressedFlowers(ctx, t);
        } else if (this.style === 1) {
            this.drawWitheredFlowers(ctx, t);
        } else {
            this.drawVintageFlowers(ctx, t);
        }
    }

    drawPressedFlowers(ctx, t) {
        // 잎사귀 먼저
        this.elements.filter(el => el.type === 'pressed_leaf').forEach(el => {
            ctx.save();
            ctx.translate(el.x, el.y);
            ctx.rotate(el.rotation);

            ctx.globalAlpha = 0.5;
            ctx.shadowBlur = 8;
            ctx.shadowColor = el.color;

            // 잎 모양
            ctx.beginPath();
            ctx.moveTo(0, el.size);
            ctx.quadraticCurveTo(-el.size * 0.5, el.size * 0.3, -el.size * 0.3, 0);
            ctx.quadraticCurveTo(-el.size * 0.2, -el.size * 0.3, 0, -el.size * 0.5);
            ctx.quadraticCurveTo(el.size * 0.2, -el.size * 0.3, el.size * 0.3, 0);
            ctx.quadraticCurveTo(el.size * 0.5, el.size * 0.3, 0, el.size);

            ctx.fillStyle = this.engine.hexToRgba(el.color, 0.4);
            ctx.fill();

            // 잎맥
            ctx.strokeStyle = this.engine.hexToRgba(el.color, 0.3);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, el.size);
            ctx.lineTo(0, -el.size * 0.4);
            ctx.stroke();

            for (let i = -2; i <= 2; i++) {
                if (i !== 0) {
                    ctx.beginPath();
                    ctx.moveTo(0, el.size * 0.3 * i);
                    ctx.lineTo(el.size * 0.2 * Math.sign(i), el.size * 0.2 * i);
                    ctx.stroke();
                }
            }

            ctx.globalAlpha = 1;
            ctx.restore();
        });

        // 압화 꽃
        this.elements.filter(el => el.type === 'pressed_flower').forEach(el => {
            const shimmer = Math.sin(t * 2 + el.phase) * 0.1 + 0.9;

            ctx.save();
            ctx.translate(el.x, el.y);
            ctx.rotate(el.rotation);

            ctx.globalAlpha = 0.7 * shimmer;
            ctx.shadowBlur = 12;
            ctx.shadowColor = el.color;

            // 납작한 꽃잎 (타원형)
            for (let i = 0; i < el.petalCount; i++) {
                ctx.save();
                ctx.rotate((i / el.petalCount) * Math.PI * 2);

                ctx.beginPath();
                ctx.ellipse(0, -el.size * 0.5, el.size * 0.2, el.size * 0.45, 0, 0, Math.PI * 2);

                const gradient = ctx.createRadialGradient(0, -el.size * 0.5, 0, 0, -el.size * 0.5, el.size * 0.4);
                gradient.addColorStop(0, this.engine.hexToRgba(el.color, 0.7));
                gradient.addColorStop(1, this.engine.hexToRgba(el.color, 0.3));
                ctx.fillStyle = gradient;
                ctx.fill();

                // 꽃잎 맥
                ctx.strokeStyle = this.engine.hexToRgba(el.color, 0.4);
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -el.size * 0.1);
                ctx.lineTo(0, -el.size * 0.8);
                ctx.stroke();

                ctx.restore();
            }

            // 중심
            ctx.beginPath();
            ctx.arc(0, 0, el.size * 0.12, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(139, 115, 85, 0.8)';
            ctx.fill();

            ctx.globalAlpha = 1;
            ctx.restore();
        });

        // 빛 입자
        this.particles.forEach(p => {
            p.x += p.driftX + Math.sin(t + p.phase) * 0.3;
            p.y += p.driftY + Math.cos(t * 0.7 + p.phase) * 0.2;

            // 경계 체크
            if (p.x < 0) p.x = this.engine.width;
            if (p.x > this.engine.width) p.x = 0;
            if (p.y < 0) p.y = this.engine.height;
            if (p.y > this.engine.height) p.y = 0;

            const glow = Math.sin(t * 2 + p.phase) * 0.3 + 0.7;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * glow, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 250, 230, ${0.3 * glow})`;
            ctx.fill();
        });
    }

    drawWitheredFlowers(ctx, t) {
        // 떨어진 꽃잎 먼저
        this.elements.filter(el => el.type === 'fallen_petal').forEach(el => {
            el.x += el.driftX;
            el.y += el.driftY;
            el.rotation += el.rotationSpeed;

            // 경계 처리
            if (el.y > this.engine.height + 20) {
                el.y = this.engine.height * 0.5;
                el.x = Math.random() * this.engine.width;
            }
            if (el.x < -20) el.x = this.engine.width + 20;
            if (el.x > this.engine.width + 20) el.x = -20;

            ctx.save();
            ctx.translate(el.x, el.y);
            ctx.rotate(el.rotation);

            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, el.size * 0.3, el.size * 0.8, 0, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(el.color, 0.6);
            ctx.fill();
            ctx.globalAlpha = 1;

            ctx.restore();
        });

        // 시든 꽃들
        this.elements.filter(el => el.type === 'withered_flower').forEach(el => {
            const sway = Math.sin(t + el.phase) * 3;

            ctx.save();
            ctx.translate(el.x + sway, el.y);

            ctx.shadowBlur = 12;
            ctx.shadowColor = el.color;

            // 처진 줄기
            ctx.strokeStyle = this.engine.hexToRgba(el.color, 0.4);
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);

            // 곡선 줄기
            const droopX = el.droop * 40;
            const droopY = -el.stemHeight;
            ctx.bezierCurveTo(
                droopX * 0.3, droopY * 0.3,
                droopX * 0.8, droopY * 0.6,
                droopX, droopY * 0.8
            );
            ctx.stroke();

            // 시든 꽃 (아래로 처짐)
            ctx.save();
            ctx.translate(droopX, droopY * 0.8);
            ctx.rotate(el.droop * 0.8);

            // 오므라든 꽃잎
            for (let i = 0; i < 5; i++) {
                ctx.save();
                ctx.rotate((i / 5) * Math.PI * 2);

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(el.size * 0.15, -el.size * 0.25, 0, -el.size * 0.5);
                ctx.quadraticCurveTo(-el.size * 0.15, -el.size * 0.25, 0, 0);
                ctx.fillStyle = this.engine.hexToRgba(el.color, 0.5);
                ctx.fill();

                ctx.restore();
            }

            // 시든 중심
            ctx.beginPath();
            ctx.arc(0, 0, el.size * 0.1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(80, 60, 40, 0.7)';
            ctx.fill();

            ctx.restore();
            ctx.restore();
        });

        // 떠다니는 먼지 입자
        this.particles.forEach(p => {
            p.x += Math.sin(t * 0.5 + p.phase) * p.speed;
            p.y += Math.cos(t * 0.3 + p.phase) * p.speed * 0.5;

            const glow = Math.sin(t * 3 + p.phase) * 0.4 + 0.6;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * glow, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 180, 160, ${0.25 * glow})`;
            ctx.fill();
        });
    }

    drawVintageFlowers(ctx, t) {
        // 빈티지 빛 먼지 (배경에)
        this.particles.forEach(p => {
            p.x += Math.sin(t * 0.3 + p.phase) * p.speed;
            p.y += Math.cos(t * 0.2 + p.phase) * p.speed;

            const glow = Math.sin(t * 2 + p.phase) * 0.3 + 0.7;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * glow, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 245, 220, ${0.2 * glow})`;
            ctx.fill();
        });

        // 꽃병
        this.elements.filter(el => el.type === 'vase').forEach(el => {
            ctx.save();
            ctx.translate(el.x, el.y);

            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(100, 80, 60, 0.5)';

            // 심플한 꽃병
            ctx.beginPath();
            ctx.moveTo(-35, -20);
            ctx.quadraticCurveTo(-45, 30, -30, 70);
            ctx.lineTo(30, 70);
            ctx.quadraticCurveTo(45, 30, 35, -20);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(-40, 0, 40, 0);
            gradient.addColorStop(0, 'rgba(140, 120, 100, 0.4)');
            gradient.addColorStop(0.5, 'rgba(180, 160, 140, 0.5)');
            gradient.addColorStop(1, 'rgba(120, 100, 80, 0.4)');
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.strokeStyle = 'rgba(100, 80, 60, 0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        });

        // 리본
        this.elements.filter(el => el.type === 'ribbon').forEach(el => {
            const ribbonWave = Math.sin(t * 2) * 3;

            ctx.save();
            ctx.translate(el.x, el.y);

            ctx.shadowBlur = 8;
            ctx.shadowColor = el.color;

            // 리본 매듭
            ctx.beginPath();
            ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(el.color, 0.7);
            ctx.fill();

            // 리본 끝
            ctx.beginPath();
            ctx.moveTo(-15, 5);
            ctx.quadraticCurveTo(-25 + ribbonWave, 25, -20 + ribbonWave, 45);
            ctx.quadraticCurveTo(-15 + ribbonWave, 35, -10, 10);
            ctx.fillStyle = this.engine.hexToRgba(el.color, 0.6);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(15, 5);
            ctx.quadraticCurveTo(25 - ribbonWave, 25, 20 - ribbonWave, 45);
            ctx.quadraticCurveTo(15 - ribbonWave, 35, 10, 10);
            ctx.fill();

            ctx.restore();
        });

        // 드라이플라워 줄기
        this.elements.filter(el => el.type === 'vintage_stem').forEach(el => {
            const sway = Math.sin(t + el.phase) * 0.03;

            ctx.save();
            ctx.translate(el.x, el.y);
            ctx.rotate(el.angle + sway);

            ctx.shadowBlur = 12;
            ctx.shadowColor = el.color;

            // 줄기
            ctx.strokeStyle = this.engine.hexToRgba(el.color, 0.5);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -el.length);
            ctx.stroke();

            // 끝에 마른 꽃
            ctx.translate(0, -el.length);

            if (el.flowerType === 0) {
                // 둥근 드라이플라워
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const r = 15 + Math.sin(i * 3) * 5;
                    ctx.beginPath();
                    ctx.arc(Math.cos(angle) * r * 0.4, Math.sin(angle) * r * 0.3 - 8, 5, 0, Math.PI * 2);
                    ctx.fillStyle = this.engine.hexToRgba(el.color, 0.6);
                    ctx.fill();
                }
            } else if (el.flowerType === 1) {
                // 이삭 형태
                for (let i = 0; i < 8; i++) {
                    const y = -i * 8;
                    const side = i % 2 === 0 ? -1 : 1;
                    ctx.beginPath();
                    ctx.ellipse(side * 6, y, 4, 8, side * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = this.engine.hexToRgba(el.color, 0.6);
                    ctx.fill();
                }
            } else {
                // 열매 형태
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    const r = 12;
                    ctx.beginPath();
                    ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r - 5, 6, 0, Math.PI * 2);
                    ctx.fillStyle = this.engine.hexToRgba(el.color, 0.7);
                    ctx.fill();
                }
            }

            ctx.restore();
        });
    }
}
