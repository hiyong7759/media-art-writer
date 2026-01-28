export class StringMode {
    constructor(engine) {
        this.engine = engine;
        this.strings = [];
        this.particles = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.strings = [];
        this.particles = [];

        if (this.style === 0) {
            // Vibration: 진동하는 현들
            this.createVibration();
        } else if (this.style === 1) {
            // Pluck: 튕기는 현
            this.createPluck();
        } else {
            // Resonance: 공명하는 현들
            this.createResonance();
        }
    }

    createVibration() {
        const h = this.engine.height;

        // 6개의 현 (기타처럼)
        for (let i = 0; i < 6; i++) {
            this.strings.push({
                y: h * (0.2 + i * 0.1),
                frequency: 0.1 + i * 0.02,
                amplitude: 15 - i * 2,
                phase: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length],
                tension: 0.5 + i * 0.08
            });
        }
    }

    createPluck() {
        const h = this.engine.height;
        const w = this.engine.width;

        // 하프 형태의 현들
        for (let i = 0; i < 12; i++) {
            const progress = i / 11;
            this.strings.push({
                x1: w * 0.1,
                y1: h * (0.15 + progress * 0.7),
                x2: w * (0.5 + progress * 0.4),
                y2: h * 0.9,
                pluckPoint: 0.3 + Math.random() * 0.4,
                pluckAmount: 0,
                pluckDecay: 0.95,
                frequency: 0.15 - progress * 0.08,
                phase: 0,
                color: this.engine.colors[i % this.engine.colors.length],
                lastPluck: 0
            });
        }
    }

    createResonance() {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 방사형 현들
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            this.strings.push({
                angle,
                innerRadius: 50,
                outerRadius: 200,
                frequency: 0.05 + (i % 4) * 0.02,
                amplitude: 10 + (i % 3) * 5,
                phase: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length],
                resonating: false,
                resonancePhase: 0
            });
        }

        // 중심 공명체
        this.strings.push({
            type: 'resonator',
            x: cx,
            y: cy,
            size: 40,
            phase: 0
        });
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawVibration(ctx, t);
        } else if (this.style === 1) {
            this.drawPluck(ctx, t);
        } else {
            this.drawResonance(ctx, t);
        }
    }

    drawVibration(ctx, t) {
        const w = this.engine.width;

        this.strings.forEach((string, si) => {
            string.phase += string.frequency;

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = string.color;

            ctx.beginPath();

            // 현 진동 시뮬레이션
            for (let x = 0; x <= w; x += 5) {
                const normalizedX = x / w;

                // 양 끝은 고정, 중앙이 가장 많이 진동
                const envelope = Math.sin(normalizedX * Math.PI);

                // 여러 하모닉스 결합
                const vibration =
                    Math.sin(normalizedX * Math.PI + string.phase) * string.amplitude * envelope +
                    Math.sin(normalizedX * Math.PI * 2 + string.phase * 1.5) * (string.amplitude * 0.3) * envelope +
                    Math.sin(normalizedX * Math.PI * 3 + string.phase * 2) * (string.amplitude * 0.1) * envelope;

                const y = string.y + vibration;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.strokeStyle = this.engine.hexToRgba(string.color, 0.7);
            ctx.lineWidth = 2;
            ctx.stroke();

            // 글로우 효과
            ctx.strokeStyle = this.engine.hexToRgba(string.color, 0.2);
            ctx.lineWidth = 6;
            ctx.stroke();

            ctx.restore();

            // 진동 입자
            if (Math.random() < 0.02) {
                const px = Math.random() * w;
                const normalizedPx = px / w;
                const envelope = Math.sin(normalizedPx * Math.PI);

                this.particles.push({
                    x: px,
                    y: string.y,
                    vy: -1 - Math.random() * 2,
                    size: 2 + Math.random() * 2,
                    life: 1,
                    color: string.color
                });
            }
        });

        // 입자 업데이트
        this.particles = this.particles.filter(p => {
            p.y += p.vy;
            p.life -= 0.02;

            if (p.life <= 0) return false;

            ctx.save();
            ctx.shadowBlur = 5;
            ctx.shadowColor = p.color;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, p.life * 0.5);
            ctx.fill();

            ctx.restore();

            return true;
        });

        // 양쪽 끝 브릿지
        ctx.save();
        ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[0], 0.3);
        ctx.fillRect(0, this.engine.height * 0.15, 8, this.engine.height * 0.7);
        ctx.fillRect(w - 8, this.engine.height * 0.15, 8, this.engine.height * 0.7);
        ctx.restore();
    }

    drawPluck(ctx, t) {
        const frame = this.engine.frame;

        this.strings.forEach((string, si) => {
            // 자동 플럭
            if (frame - string.lastPluck > 60 + si * 20 && Math.random() < 0.02) {
                string.pluckAmount = 30 + Math.random() * 20;
                string.lastPluck = frame;
                string.phase = 0;
            }

            // 플럭 감쇠
            string.pluckAmount *= string.pluckDecay;
            string.phase += string.frequency;

            ctx.save();
            ctx.shadowBlur = 12;
            ctx.shadowColor = string.color;

            ctx.beginPath();

            // 현의 시작점에서 끝점까지
            const steps = 30;
            for (let i = 0; i <= steps; i++) {
                const progress = i / steps;

                // 선형 보간으로 기본 위치
                const baseX = string.x1 + (string.x2 - string.x1) * progress;
                const baseY = string.y1 + (string.y2 - string.y1) * progress;

                // 플럭 효과 (양 끝 고정)
                const envelope = Math.sin(progress * Math.PI);
                const pluckEffect = Math.sin(progress * Math.PI * 2 + string.phase) * string.pluckAmount * envelope;

                // 현에 수직 방향으로 변위
                const angle = Math.atan2(string.y2 - string.y1, string.x2 - string.x1);
                const perpAngle = angle + Math.PI / 2;

                const x = baseX + Math.cos(perpAngle) * pluckEffect;
                const y = baseY + Math.sin(perpAngle) * pluckEffect;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            const alpha = 0.4 + (string.pluckAmount / 50) * 0.4;
            ctx.strokeStyle = this.engine.hexToRgba(string.color, alpha);
            ctx.lineWidth = 2;
            ctx.stroke();

            // 글로우
            ctx.strokeStyle = this.engine.hexToRgba(string.color, alpha * 0.3);
            ctx.lineWidth = 6;
            ctx.stroke();

            ctx.restore();

            // 플럭 시 입자 생성
            if (string.pluckAmount > 5) {
                const progress = string.pluckPoint;
                const baseX = string.x1 + (string.x2 - string.x1) * progress;
                const baseY = string.y1 + (string.y2 - string.y1) * progress;

                if (Math.random() < 0.1) {
                    this.particles.push({
                        x: baseX,
                        y: baseY,
                        vx: (Math.random() - 0.5) * 3,
                        vy: (Math.random() - 0.5) * 3,
                        size: 2 + Math.random() * 3,
                        life: 1,
                        color: string.color
                    });
                }
            }
        });

        // 입자 업데이트
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life -= 0.02;

            if (p.life <= 0) return false;

            ctx.save();
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, p.life * 0.6);
            ctx.fill();

            ctx.restore();

            return true;
        });
    }

    drawResonance(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 중심 공명체
        const resonator = this.strings.find(s => s.type === 'resonator');
        if (resonator) {
            resonator.phase += 0.05;
            const pulse = Math.sin(resonator.phase) * 0.2 + 1;

            ctx.save();
            ctx.shadowBlur = 30;
            ctx.shadowColor = this.engine.colors[0];

            // 공명체 원
            ctx.beginPath();
            ctx.arc(resonator.x, resonator.y, resonator.size * pulse, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[0], 0.3);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(resonator.x, resonator.y, resonator.size * pulse + 10, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[0], 0.4);
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        }

        // 방사형 현들
        const radialStrings = this.strings.filter(s => !s.type);

        radialStrings.forEach((string, si) => {
            string.phase += string.frequency;

            // 공명 체크 (중심에서 파동이 올 때)
            if (resonator) {
                const resonancePulse = Math.sin(resonator.phase - si * 0.2);
                if (resonancePulse > 0.9) {
                    string.resonating = true;
                    string.resonancePhase = 0;
                }
            }

            if (string.resonating) {
                string.resonancePhase += 0.1;
                if (string.resonancePhase > Math.PI * 4) {
                    string.resonating = false;
                }
            }

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(string.angle);

            ctx.shadowBlur = 12;
            ctx.shadowColor = string.color;

            ctx.beginPath();

            // 현 그리기
            const steps = 20;
            for (let i = 0; i <= steps; i++) {
                const progress = i / steps;
                const r = string.innerRadius + (string.outerRadius - string.innerRadius) * progress;

                // 진동 (양 끝 고정)
                const envelope = Math.sin(progress * Math.PI);
                let vibration = Math.sin(progress * Math.PI * 2 + string.phase) * string.amplitude * envelope;

                // 공명 시 추가 진동
                if (string.resonating) {
                    const resonanceDecay = Math.exp(-string.resonancePhase * 0.2);
                    vibration += Math.sin(progress * Math.PI * 3 + string.resonancePhase) * string.amplitude * 1.5 * envelope * resonanceDecay;
                }

                const x = r;
                const y = vibration;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            const alpha = string.resonating ? 0.8 : 0.5;
            ctx.strokeStyle = this.engine.hexToRgba(string.color, alpha);
            ctx.lineWidth = 2;
            ctx.stroke();

            // 글로우
            ctx.strokeStyle = this.engine.hexToRgba(string.color, alpha * 0.3);
            ctx.lineWidth = 5;
            ctx.stroke();

            ctx.restore();
        });

        // 공명 파동
        if (resonator && Math.sin(resonator.phase) > 0.95) {
            this.particles.push({
                x: cx,
                y: cy,
                radius: resonator.size,
                opacity: 0.5
            });
        }

        // 파동 업데이트
        this.particles = this.particles.filter(p => {
            if (p.radius !== undefined) {
                p.radius += 3;
                p.opacity -= 0.01;

                if (p.opacity <= 0) return false;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[0], p.opacity * 0.4);
                ctx.lineWidth = 2;
                ctx.stroke();

                return true;
            }
            return false;
        });
    }
}
