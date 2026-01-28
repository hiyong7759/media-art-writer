export class MultiMode {
    constructor(engine) {
        this.engine = engine;
        this.elements = [];
        this.particles = [];
        this.style = 0;
        this.phase = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.elements = [];
        this.particles = [];
        this.phase = 0;

        if (this.style === 0) {
            // Bubble: 우주 거품 (기존 개선)
            this.createBubble();
        } else if (this.style === 1) {
            // String: 끈 이론 시각화
            this.createString();
        } else {
            // Quantum: 양자 요동
            this.createQuantum();
        }
    }

    createBubble() {
        // 다양한 크기의 우주 거품
        for (let i = 0; i < 15; i++) {
            this.elements.push({
                type: 'bubble',
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                radius: 30 + Math.random() * 60,
                phase: Math.random() * Math.PI * 2,
                driftSpeed: 0.2 + Math.random() * 0.3,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }

        // 거품 간 연결
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                bubbleA: Math.floor(Math.random() * 15),
                bubbleB: Math.floor(Math.random() * 15),
                t: Math.random(),
                speed: 0.005 + Math.random() * 0.01,
                size: 1 + Math.random() * 2
            });
        }
    }

    createString() {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 진동하는 끈들
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.elements.push({
                type: 'string',
                angle,
                length: 150,
                frequency: 0.1 + (i % 3) * 0.05,
                amplitude: 20 + (i % 2) * 15,
                phase: i * Math.PI / 4,
                harmonics: 2 + (i % 3),
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }

        // 차원 간 연결점
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                angle: (i / 6) * Math.PI * 2,
                radius: 80,
                size: 4,
                phase: i * Math.PI / 3,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }
    }

    createQuantum() {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 양자 입자 (불확정성 원리 시각화)
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: cx + (Math.random() - 0.5) * 200,
                y: cy + (Math.random() - 0.5) * 200,
                baseX: cx,
                baseY: cy,
                probability: Math.random(),
                phase: Math.random() * Math.PI * 2,
                phaseSpeed: 0.05 + Math.random() * 0.1,
                size: 2 + Math.random() * 3,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
            });
        }

        // 파동 함수 영역
        this.elements.push({
            type: 'wavefunction',
            radius: 120,
            phase: 0
        });

        // 측정 이벤트
        this.elements.push({
            type: 'measurement',
            active: false,
            x: cx,
            y: cy,
            timer: 0
        });
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;
        this.phase += 0.02;

        if (this.style === 0) {
            this.drawBubble(ctx, t);
        } else if (this.style === 1) {
            this.drawString(ctx, t);
        } else {
            this.drawQuantum(ctx, t);
        }
    }

    drawBubble(ctx, t) {
        // 거품들
        this.elements.filter(e => e.type === 'bubble').forEach((bubble, i) => {
            bubble.phase += 0.01;
            bubble.y -= bubble.driftSpeed;

            // 화면 위로 나가면 아래에서 재생성
            if (bubble.y < -bubble.radius * 2) {
                bubble.y = this.engine.height + bubble.radius;
                bubble.x = Math.random() * this.engine.width;
            }

            const breathe = Math.sin(bubble.phase) * 5;
            const currentRadius = bubble.radius + breathe;

            ctx.save();

            // 거품 외곽
            ctx.shadowBlur = 15;
            ctx.shadowColor = bubble.color;

            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, currentRadius, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(bubble.color, 0.4);
            ctx.lineWidth = 2;
            ctx.stroke();

            // 거품 내부 글로우
            const innerGradient = ctx.createRadialGradient(
                bubble.x, bubble.y, 0,
                bubble.x, bubble.y, currentRadius
            );
            innerGradient.addColorStop(0, this.engine.hexToRgba(bubble.color, 0.1));
            innerGradient.addColorStop(0.7, this.engine.hexToRgba(bubble.color, 0.05));
            innerGradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = innerGradient;
            ctx.fill();

            // 하이라이트
            ctx.beginPath();
            ctx.arc(
                bubble.x - currentRadius * 0.3,
                bubble.y - currentRadius * 0.3,
                currentRadius * 0.2,
                0, Math.PI * 2
            );
            ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[3], 0.2);
            ctx.fill();

            ctx.restore();
        });

        // 거품 간 연결 입자
        const bubbles = this.elements.filter(e => e.type === 'bubble');
        this.particles.forEach(p => {
            const a = bubbles[p.bubbleA];
            const b = bubbles[p.bubbleB];

            if (!a || !b || p.bubbleA === p.bubbleB) return;

            p.t += p.speed;
            if (p.t > 1) p.t = 0;

            const x = a.x + (b.x - a.x) * p.t;
            const y = a.y + (b.y - a.y) * p.t;

            ctx.save();
            ctx.shadowBlur = 5;
            ctx.shadowColor = this.engine.colors[2];

            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[2], 0.4);
            ctx.fill();

            ctx.restore();
        });
    }

    drawString(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 중심 원
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.engine.colors[3];

        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[3], 0.3);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[3], 0.5);
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        // 진동하는 끈들
        this.elements.filter(e => e.type === 'string').forEach(string => {
            string.phase += string.frequency;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(string.angle);

            ctx.shadowBlur = 10;
            ctx.shadowColor = string.color;

            ctx.beginPath();

            // 끈 진동 (다중 하모닉스)
            for (let i = 0; i <= 30; i++) {
                const progress = i / 30;
                const x = 30 + progress * (string.length - 30);

                // 양 끝 고정
                const envelope = Math.sin(progress * Math.PI);

                let y = 0;
                for (let h = 1; h <= string.harmonics; h++) {
                    y += Math.sin(progress * Math.PI * h + string.phase * h) *
                         (string.amplitude / h) * envelope;
                }

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.strokeStyle = this.engine.hexToRgba(string.color, 0.6);
            ctx.lineWidth = 2;
            ctx.stroke();

            // 글로우
            ctx.strokeStyle = this.engine.hexToRgba(string.color, 0.2);
            ctx.lineWidth = 6;
            ctx.stroke();

            ctx.restore();
        });

        // 차원 연결점
        this.particles.forEach(p => {
            p.phase += 0.03;

            const wobble = Math.sin(p.phase) * 10;
            const x = cx + Math.cos(p.angle + t * 0.2) * (p.radius + wobble);
            const y = cy + Math.sin(p.angle + t * 0.2) * (p.radius + wobble);

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = p.color;

            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, 0.7);
            ctx.fill();

            // 연결선 (중심으로)
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(x, y);
            ctx.strokeStyle = this.engine.hexToRgba(p.color, 0.15);
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        });
    }

    drawQuantum(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 파동 함수 영역
        const wavefunction = this.elements.find(e => e.type === 'wavefunction');
        if (wavefunction) {
            wavefunction.phase += 0.02;

            // 확률 분포 시각화
            ctx.save();

            for (let i = 5; i > 0; i--) {
                const radius = wavefunction.radius * (i / 5);
                const wobble = Math.sin(wavefunction.phase + i) * 10;

                const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius + wobble);
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(0.7, this.engine.hexToRgba(this.engine.colors[1], 0.05 * i));
                gradient.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.arc(cx, cy, radius + wobble, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            ctx.restore();
        }

        // 측정 이벤트
        const measurement = this.elements.find(e => e.type === 'measurement');
        if (measurement) {
            measurement.timer += 0.016;

            // 주기적으로 측정 발생
            if (measurement.timer > 3 && !measurement.active) {
                measurement.active = true;
                measurement.x = cx + (Math.random() - 0.5) * 150;
                measurement.y = cy + (Math.random() - 0.5) * 150;
                measurement.timer = 0;
            }

            if (measurement.active) {
                measurement.timer += 0.016;

                // 측정 순간 플래시
                const flash = Math.max(0, 1 - measurement.timer * 2);

                ctx.save();
                ctx.shadowBlur = 30 * flash;
                ctx.shadowColor = this.engine.colors[3];

                ctx.beginPath();
                ctx.arc(measurement.x, measurement.y, 10 + flash * 20, 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[3], flash * 0.8);
                ctx.fill();

                ctx.restore();

                if (measurement.timer > 0.5) {
                    measurement.active = false;
                    measurement.timer = 0;
                }
            }
        }

        // 양자 입자들 (불확정성)
        this.particles.forEach(p => {
            p.phase += p.phaseSpeed;

            // 확률적 위치 변동 (불확정성 원리)
            const uncertainty = 30 * (1 - p.probability);
            p.x = p.baseX + Math.sin(p.phase) * uncertainty + (Math.random() - 0.5) * 5;
            p.y = p.baseY + Math.cos(p.phase * 0.7) * uncertainty + (Math.random() - 0.5) * 5;

            // 거리에 따른 확률 밀도
            const dist = Math.sqrt(Math.pow(p.x - cx, 2) + Math.pow(p.y - cy, 2));
            const density = Math.exp(-dist * dist / (120 * 120));

            // 측정 시 붕괴 효과
            if (measurement && measurement.active) {
                const distToMeasure = Math.sqrt(
                    Math.pow(p.x - measurement.x, 2) +
                    Math.pow(p.y - measurement.y, 2)
                );
                if (distToMeasure < 50) {
                    p.x += (measurement.x - p.x) * 0.1;
                    p.y += (measurement.y - p.y) * 0.1;
                }
            }

            const alpha = density * 0.6 + 0.1;
            const size = p.size * (0.5 + density * 0.5);

            ctx.save();
            ctx.shadowBlur = 8 * density;
            ctx.shadowColor = p.color;

            // 입자 (흐릿한 가장자리 - 위치 불확정성)
            const particleGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
            particleGradient.addColorStop(0, this.engine.hexToRgba(p.color, alpha));
            particleGradient.addColorStop(0.5, this.engine.hexToRgba(p.color, alpha * 0.5));
            particleGradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
            ctx.fillStyle = particleGradient;
            ctx.fill();

            ctx.restore();
        });

        // 중심 관측점
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.engine.colors[2];

        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[2], 0.6);
        ctx.fill();

        ctx.restore();
    }
}
