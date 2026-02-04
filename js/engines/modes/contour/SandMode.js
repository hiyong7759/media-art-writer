export class SandMode {
    constructor(engine) {
        this.engine = engine;
        this.elements = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.elements = [];

        if (this.style === 0) {
            // Dune: 사구 (모래 언덕)
            this.createDunes();
        } else if (this.style === 1) {
            // Ripple: 물결 무늬
            this.createRipples();
        } else {
            // Grain: 모래알 입자
            this.createGrains();
        }
    }

    createDunes() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 여러 층의 사구
        for (let layer = 0; layer < 4; layer++) {
            const baseY = h * (0.4 + layer * 0.15);
            const points = [];

            for (let x = 0; x <= w; x += 30) {
                const duneHeight = Math.sin(x * 0.015 + layer * 2) * 50 +
                                   Math.sin(x * 0.008) * 30;
                points.push({
                    x,
                    y: baseY - duneHeight
                });
            }

            this.elements.push({
                type: 'dune',
                points,
                baseY,
                layer,
                color: this.engine.colors[layer % this.engine.colors.length],
                phase: layer * 0.5
            });
        }

        // 바람에 날리는 모래
        for (let i = 0; i < 40; i++) {
            this.elements.push({
                type: 'wind_sand',
                x: Math.random() * w,
                y: Math.random() * h,
                size: 1 + Math.random() * 2,
                speed: 2 + Math.random() * 3,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    createRipples() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 물결 무늬 라인들
        for (let i = 0; i < 25; i++) {
            this.elements.push({
                type: 'ripple_line',
                y: h * 0.2 + i * (h * 0.6 / 25),
                amplitude: 5 + Math.sin(i * 0.5) * 3,
                frequency: 0.03 + Math.sin(i * 0.3) * 0.01,
                phase: i * 0.2,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }

        // 발자국 효과
        for (let i = 0; i < 5; i++) {
            this.elements.push({
                type: 'footprint',
                x: w * (0.2 + i * 0.15),
                y: h * 0.5 + (i % 2 === 0 ? -30 : 30),
                size: 15 + Math.random() * 5
            });
        }
    }

    createGrains() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 다양한 크기의 모래알
        for (let i = 0; i < 200; i++) {
            this.elements.push({
                type: 'grain',
                x: Math.random() * w,
                y: Math.random() * h,
                size: 1 + Math.random() * 4,
                color: this.engine.colors[i % this.engine.colors.length],
                vx: (Math.random() - 0.5) * 0.5,
                vy: Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2
            });
        }

        // 모래 소용돌이
        for (let i = 0; i < 3; i++) {
            this.elements.push({
                type: 'vortex',
                x: w * (0.25 + i * 0.25),
                y: h * 0.5,
                radius: 60 + Math.random() * 40,
                rotation: 0,
                speed: 0.02 + Math.random() * 0.02
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawDunes(ctx, t);
        } else if (this.style === 1) {
            this.drawRipples(ctx, t);
        } else {
            this.drawGrains(ctx, t);
        }
    }

    drawDunes(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;

        // 뒤에서 앞으로 (layer 순)
        const dunes = this.elements.filter(el => el.type === 'dune')
            .sort((a, b) => a.layer - b.layer);

        dunes.forEach(dune => {
            const wave = Math.sin(t * 0.3 + dune.phase) * 5;

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = dune.color;

            ctx.beginPath();
            ctx.moveTo(0, h);

            dune.points.forEach((p, i) => {
                const y = p.y + Math.sin(t * 0.5 + i * 0.1 + dune.phase) * 3 + wave;
                if (i === 0) ctx.lineTo(p.x, y);
                else {
                    const prev = dune.points[i - 1];
                    const cpX = (prev.x + p.x) / 2;
                    ctx.quadraticCurveTo(cpX, prev.y + wave, p.x, y);
                }
            });

            ctx.lineTo(w, h);
            ctx.closePath();

            // 그라데이션
            const gradient = ctx.createLinearGradient(0, dune.baseY - 80, 0, h);
            gradient.addColorStop(0, this.engine.hexToRgba(dune.color, 0.15));
            gradient.addColorStop(0.5, this.engine.hexToRgba(dune.color, 0.1));
            gradient.addColorStop(1, this.engine.hexToRgba(dune.color, 0.05));
            ctx.fillStyle = gradient;
            ctx.fill();

            // 윤곽선
            ctx.strokeStyle = this.engine.hexToRgba(dune.color, 0.7);
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        });

        // 바람에 날리는 모래
        this.elements.filter(el => el.type === 'wind_sand').forEach(el => {
            el.x += el.speed;
            el.y += Math.sin(t * 2 + el.phase) * 0.5;

            if (el.x > w) {
                el.x = 0;
                el.y = Math.random() * h;
            }

            ctx.beginPath();
            ctx.arc(el.x, el.y, el.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 220, 180, ${0.1 + Math.sin(t + el.phase) * 0.05})`;
            ctx.fill();
        });
    }

    drawRipples(ctx, t) {
        const w = this.engine.width;

        // 물결 라인
        this.elements.filter(el => el.type === 'ripple_line').forEach(el => {
            ctx.save();
            ctx.shadowBlur = 8;
            ctx.shadowColor = el.color;

            ctx.beginPath();
            for (let x = 0; x <= w; x += 5) {
                const y = el.y + Math.sin(x * el.frequency + t + el.phase) * el.amplitude;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.strokeStyle = this.engine.hexToRgba(el.color, 0.5);
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        });

        // 발자국
        this.elements.filter(el => el.type === 'footprint').forEach(el => {
            const pulse = Math.sin(t * 0.5) * 0.1 + 0.9;

            ctx.save();
            ctx.translate(el.x, el.y);

            // 발자국 모양 (타원)
            ctx.beginPath();
            ctx.ellipse(0, 0, el.size * pulse, el.size * 1.5 * pulse, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(100, 80, 60, 0.08)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(150, 120, 80, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        });
    }

    drawGrains(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;

        // 소용돌이 영향 계산
        const vortices = this.elements.filter(el => el.type === 'vortex');

        // 모래알
        this.elements.filter(el => el.type === 'grain').forEach(el => {
            // 소용돌이 영향
            vortices.forEach(v => {
                const dx = el.x - v.x;
                const dy = el.y - v.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < v.radius * 2) {
                    const force = (1 - dist / (v.radius * 2)) * 0.5;
                    const angle = Math.atan2(dy, dx) + Math.PI / 2;
                    el.x += Math.cos(angle) * force;
                    el.y += Math.sin(angle) * force;
                }
            });

            // 기본 움직임
            el.x += el.vx + Math.sin(t + el.phase) * 0.2;
            el.y += el.vy;

            // 경계 처리
            if (el.x < 0) el.x = w;
            if (el.x > w) el.x = 0;
            if (el.y > h) {
                el.y = 0;
                el.x = Math.random() * w;
            }

            const sparkle = Math.sin(t * 3 + el.phase) * 0.3 + 0.5;

            ctx.save();
            ctx.shadowBlur = 5;
            ctx.shadowColor = el.color;

            ctx.beginPath();
            ctx.arc(el.x, el.y, el.size, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(el.color, sparkle * 0.3);
            ctx.fill();

            ctx.restore();
        });

        // 소용돌이
        vortices.forEach(v => {
            v.rotation += v.speed;

            ctx.save();
            ctx.translate(v.x, v.y);
            ctx.rotate(v.rotation);

            // 소용돌이 라인
            for (let i = 0; i < 3; i++) {
                ctx.save();
                ctx.rotate((i / 3) * Math.PI * 2);

                ctx.beginPath();
                for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
                    const r = angle * v.radius / (Math.PI * 4);
                    const x = Math.cos(angle) * r;
                    const y = Math.sin(angle) * r;
                    if (angle === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[i], 0.3);
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.restore();
            }

            ctx.restore();
        });
    }
}
