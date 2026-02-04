export class RiverMode {
    constructor(engine) {
        this.engine = engine;
        this.elements = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.elements = [];

        if (this.style === 0) {
            // Flow: 흐르는 강
            this.createFlow();
        } else if (this.style === 1) {
            // Delta: 삼각주
            this.createDelta();
        } else {
            // Meander: 구불구불한 곡류
            this.createMeander();
        }
    }

    createFlow() {
        // 메인 강줄기
        this.elements.push({
            type: 'main_river',
            width: 40,
            phase: 0
        });

        // 물결 파티클
        for (let i = 0; i < 30; i++) {
            this.elements.push({
                type: 'wave_particle',
                x: Math.random() * this.engine.width,
                y: this.engine.height * 0.3 + Math.random() * this.engine.height * 0.4,
                speed: 1 + Math.random() * 2,
                size: 3 + Math.random() * 5,
                phase: Math.random() * Math.PI * 2
            });
        }

        // 물보라
        for (let i = 0; i < 10; i++) {
            this.elements.push({
                type: 'splash',
                x: Math.random() * this.engine.width,
                baseY: this.engine.height * 0.5,
                size: 20 + Math.random() * 20,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    createDelta() {
        const cx = this.engine.width / 2;
        const startY = this.engine.height * 0.2;

        // 삼각주 분기점
        const branches = 5;
        for (let i = 0; i < branches; i++) {
            const angle = (i / (branches - 1) - 0.5) * Math.PI * 0.6;
            this.elements.push({
                type: 'delta_branch',
                startX: cx,
                startY,
                angle,
                length: 200 + Math.random() * 100,
                width: 15 - i * 2,
                color: this.engine.colors[i % this.engine.colors.length],
                phase: i * 0.3
            });
        }

        // 퇴적물 입자
        for (let i = 0; i < 50; i++) {
            this.elements.push({
                type: 'sediment',
                x: cx + (Math.random() - 0.5) * 300,
                y: this.engine.height * 0.6 + Math.random() * this.engine.height * 0.3,
                size: 2 + Math.random() * 4,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }
    }

    createMeander() {
        // 곡류 포인트 생성
        const points = [];
        const segments = 8;

        for (let i = 0; i <= segments; i++) {
            const x = (this.engine.width / segments) * i;
            const baseY = this.engine.height * 0.5;
            const curve = Math.sin(i * 0.8) * 150;
            points.push({ x, y: baseY + curve });
        }

        this.elements.push({
            type: 'meander_river',
            points,
            width: 50
        });

        // 우각호 (ox-bow lake)
        this.elements.push({
            type: 'oxbow',
            x: this.engine.width * 0.3,
            y: this.engine.height * 0.35,
            rx: 60,
            ry: 30
        });

        this.elements.push({
            type: 'oxbow',
            x: this.engine.width * 0.7,
            y: this.engine.height * 0.65,
            rx: 50,
            ry: 25
        });

        // 범람원 표시
        for (let i = 0; i < 20; i++) {
            this.elements.push({
                type: 'floodplain',
                x: Math.random() * this.engine.width,
                y: this.engine.height * 0.3 + Math.random() * this.engine.height * 0.4,
                size: 30 + Math.random() * 40
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawFlow(ctx, t);
        } else if (this.style === 1) {
            this.drawDelta(ctx, t);
        } else {
            this.drawMeander(ctx, t);
        }
    }

    drawFlow(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;
        const color = this.engine.colors[0];

        this.elements.forEach(el => {
            if (el.type === 'main_river') {
                ctx.save();
                ctx.shadowBlur = 25;
                ctx.shadowColor = color;

                ctx.beginPath();
                for (let x = 0; x <= w; x += 5) {
                    const baseY = h * 0.5;
                    const wave = Math.sin(x * 0.02 + t * 2) * 30 + Math.sin(x * 0.01 + t) * 20;
                    const y = baseY + wave;

                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.strokeStyle = this.engine.hexToRgba(color, 0.7);
                ctx.lineWidth = el.width;
                ctx.lineCap = 'round';
                ctx.stroke();

                // 밝은 하이라이트
                ctx.beginPath();
                for (let x = 0; x <= w; x += 5) {
                    const baseY = h * 0.5 - 5;
                    const wave = Math.sin(x * 0.02 + t * 2) * 30 + Math.sin(x * 0.01 + t) * 20;
                    const y = baseY + wave;

                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = this.engine.hexToRgba('#ffffff', 0.3);
                ctx.lineWidth = 5;
                ctx.stroke();

                ctx.restore();

            } else if (el.type === 'wave_particle') {
                el.x += el.speed;
                if (el.x > w) el.x = 0;

                const yOffset = Math.sin(t * 3 + el.phase) * 10;
                const baseY = h * 0.5 + Math.sin(el.x * 0.02 + t * 2) * 30;

                ctx.save();
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ffffff';
                ctx.beginPath();
                ctx.arc(el.x, baseY + yOffset, el.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(t + el.phase) * 0.05})`;
                ctx.fill();
                ctx.restore();

            } else if (el.type === 'splash') {
                const baseY = h * 0.5 + Math.sin(el.x * 0.02 + t * 2) * 30;
                const splashY = baseY + Math.sin(t * 4 + el.phase) * 15 - el.size;

                ctx.save();
                ctx.shadowBlur = 15;
                ctx.shadowColor = color;
                ctx.beginPath();
                ctx.arc(el.x, splashY, el.size * (0.5 + Math.sin(t * 3 + el.phase) * 0.3), 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(color, 0.05);
                ctx.fill();
                ctx.restore();
            }
        });
    }

    drawDelta(ctx, t) {
        const cx = this.engine.width / 2;

        // 메인 줄기
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.engine.colors[0];
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, this.engine.height * 0.2);
        ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[0], 0.8);
        ctx.lineWidth = 25;
        ctx.stroke();
        ctx.restore();

        this.elements.forEach(el => {
            if (el.type === 'delta_branch') {
                const wave = Math.sin(t + el.phase) * 0.05;
                const endX = el.startX + Math.sin(el.angle + wave) * el.length;
                const endY = el.startY + Math.cos(el.angle + wave) * el.length;

                ctx.save();
                ctx.shadowBlur = 15;
                ctx.shadowColor = el.color;

                // 곡선 분기
                ctx.beginPath();
                ctx.moveTo(el.startX, el.startY);
                const cpX = el.startX + Math.sin(el.angle) * el.length * 0.5;
                const cpY = el.startY + Math.cos(el.angle) * el.length * 0.3;
                ctx.quadraticCurveTo(cpX, cpY, endX, endY);

                ctx.strokeStyle = this.engine.hexToRgba(el.color, 0.6);
                ctx.lineWidth = el.width;
                ctx.lineCap = 'round';
                ctx.stroke();

                ctx.restore();

            } else if (el.type === 'sediment') {
                const drift = Math.sin(t * 0.5 + el.x * 0.01) * 2;
                ctx.beginPath();
                ctx.arc(el.x + drift, el.y, el.size, 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(el.color, 0.1);
                ctx.fill();
            }
        });

        // 삼각주 베이스 (퇴적 지역)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - 200, this.engine.height);
        ctx.quadraticCurveTo(cx, this.engine.height * 0.7, cx + 200, this.engine.height);
        ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[2], 0.05);
        ctx.fill();
        ctx.restore();
    }

    drawMeander(ctx, t) {
        this.elements.forEach(el => {
            if (el.type === 'floodplain') {
                // 범람원 (연한 배경)
                const alpha = Math.sin(t * 0.3 + el.x * 0.01) * 0.01 + 0.02;
                ctx.beginPath();
                ctx.arc(el.x, el.y, el.size, 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[2], alpha);
                ctx.fill();
            }
        });

        this.elements.forEach(el => {
            if (el.type === 'meander_river') {
                ctx.save();
                ctx.shadowBlur = 20;
                ctx.shadowColor = this.engine.colors[0];

                ctx.beginPath();
                el.points.forEach((p, i) => {
                    const wave = Math.sin(t + i * 0.5) * 5;
                    if (i === 0) {
                        ctx.moveTo(p.x, p.y + wave);
                    } else {
                        const prev = el.points[i - 1];
                        const cpX = (prev.x + p.x) / 2;
                        const cpY = (prev.y + p.y) / 2 + Math.sin(t + i) * 10;
                        ctx.quadraticCurveTo(prev.x + 30, prev.y + wave, p.x, p.y + wave);
                    }
                });

                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[0], 0.7);
                ctx.lineWidth = el.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();

                // 하이라이트
                ctx.strokeStyle = this.engine.hexToRgba('#ffffff', 0.2);
                ctx.lineWidth = 10;
                ctx.stroke();

                ctx.restore();

            } else if (el.type === 'oxbow') {
                // 우각호
                const pulse = Math.sin(t * 0.5) * 0.1 + 0.9;

                ctx.save();
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.engine.colors[1];

                ctx.beginPath();
                ctx.ellipse(el.x, el.y, el.rx * pulse, el.ry * pulse, 0, 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[1], 0.1);
                ctx.fill();
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[1], 0.7);
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.restore();
            }
        });
    }
}
