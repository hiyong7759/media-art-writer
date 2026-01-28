export class PulseMode {
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
            // Rhythm: 부드러운 동심원 파동
            this.createRhythm();
        } else if (this.style === 1) {
            // Heartbeat: 심장 박동 시각화
            this.createHeartbeat();
        } else {
            // Tempo: 메트로놈 + 파동
            this.createTempo();
        }
    }

    createRhythm() {
        // 중심에서 퍼져나가는 다중 파동
        for (let i = 0; i < 6; i++) {
            this.elements.push({
                type: 'ring',
                radius: 30 + i * 50,
                baseRadius: 30 + i * 50,
                phase: i * Math.PI / 3,
                color: this.engine.colors[i % this.engine.colors.length],
                pulseSpeed: 0.03 + i * 0.005
            });
        }

        // 부유 입자
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                distance: 50 + Math.random() * 200,
                size: 2 + Math.random() * 3,
                phase: Math.random() * Math.PI * 2,
                speed: 0.01 + Math.random() * 0.02
            });
        }
    }

    createHeartbeat() {
        // 심전도 파형 데이터
        this.elements.push({
            type: 'ecg',
            points: [],
            phase: 0
        });

        // 심장 펄스
        this.elements.push({
            type: 'heart_pulse',
            scale: 1,
            phase: 0
        });
    }

    createTempo() {
        // 좌우로 흔들리는 메트로놈
        this.elements.push({
            type: 'pendulum',
            angle: 0,
            direction: 1
        });

        // 박자 표시 원들
        for (let i = 0; i < 4; i++) {
            this.elements.push({
                type: 'beat_dot',
                x: this.engine.width * (0.2 + i * 0.2),
                y: this.engine.height * 0.85,
                active: false,
                phase: i * Math.PI / 2
            });
        }

        // 파동 링
        this.elements.push({
            type: 'tempo_waves',
            rings: []
        });
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawRhythm(ctx, t);
        } else if (this.style === 1) {
            this.drawHeartbeat(ctx, t);
        } else {
            this.drawTempo(ctx, t);
        }
    }

    drawRhythm(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 동심원 파동
        this.elements.filter(el => el.type === 'ring').forEach((ring, i) => {
            const pulse = Math.sin(t * 3 + ring.phase) * 0.3 + 0.7;
            const currentRadius = ring.baseRadius + Math.sin(t * 2 + ring.phase) * 20;

            ctx.save();
            ctx.shadowBlur = 20 * pulse;
            ctx.shadowColor = ring.color;

            // 메인 링
            ctx.beginPath();
            ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(ring.color, 0.4 * pulse);
            ctx.lineWidth = 2 + pulse * 2;
            ctx.stroke();

            // 내부 글로우
            const gradient = ctx.createRadialGradient(cx, cy, currentRadius - 10, cx, cy, currentRadius + 10);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, this.engine.hexToRgba(ring.color, 0.15 * pulse));
            gradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 20;
            ctx.stroke();

            ctx.restore();
        });

        // 부유 입자
        this.particles.forEach((p, i) => {
            p.angle += p.speed;
            const pulse = Math.sin(t * 3 + p.phase) * 0.4 + 0.6;
            const wobble = Math.sin(t * 2 + p.phase) * 10;

            const x = cx + Math.cos(p.angle) * (p.distance + wobble);
            const y = cy + Math.sin(p.angle) * (p.distance + wobble);

            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.engine.colors[i % this.engine.colors.length];

            ctx.beginPath();
            ctx.arc(x, y, p.size * pulse, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[i % this.engine.colors.length], 0.6 * pulse);
            ctx.fill();

            ctx.restore();
        });

        // 중심 코어
        const coreSize = 15 + Math.sin(t * 4) * 5;
        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.engine.colors[0];

        const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
        coreGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[0], 0.8));
        coreGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();

        ctx.restore();
    }

    drawHeartbeat(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;
        const cx = w / 2;
        const cy = h / 2;
        const mainColor = this.engine.colors[0];

        // 심전도 파형
        const ecg = this.elements.find(el => el.type === 'ecg');
        if (ecg) {
            ecg.phase += 0.025; // 더 천천히

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = mainColor;

            ctx.beginPath();
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.6);
            ctx.lineWidth = 2;

            for (let x = 0; x < w; x += 3) {
                const progress = ((x / w) * 2 + ecg.phase) % 1; // 주기 길게
                let y = cy;

                // 심전도 파형 (더 부드럽게)
                if (progress > 0.15 && progress < 0.2) {
                    const p = (progress - 0.15) / 0.05;
                    y -= Math.sin(p * Math.PI) * 15;
                } else if (progress > 0.25 && progress < 0.27) {
                    const p = (progress - 0.25) / 0.02;
                    y += Math.sin(p * Math.PI) * 10;
                } else if (progress > 0.27 && progress < 0.35) {
                    const p = (progress - 0.27) / 0.08;
                    y -= Math.sin(p * Math.PI) * 60;
                } else if (progress > 0.35 && progress < 0.4) {
                    const p = (progress - 0.35) / 0.05;
                    y += Math.sin(p * Math.PI) * 15;
                } else if (progress > 0.5 && progress < 0.6) {
                    const p = (progress - 0.5) / 0.1;
                    y -= Math.sin(p * Math.PI) * 20;
                }

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.15);
            ctx.lineWidth = 6;
            ctx.stroke();

            ctx.restore();
        }

        // 중앙 하트
        const heart = this.elements.find(el => el.type === 'heart_pulse');
        if (heart) {
            heart.phase += 0.04; // 더 천천히
            const beat = Math.pow(Math.max(0, Math.sin(heart.phase)), 8);

            ctx.save();
            ctx.translate(cx, cy);

            const scale = 1 + beat * 0.3;
            ctx.scale(scale, scale);

            ctx.shadowBlur = 20 + beat * 15;
            ctx.shadowColor = mainColor;

            // 하트 모양 그리기
            const size = 35;
            ctx.beginPath();
            ctx.moveTo(0, size * 0.3);
            // 왼쪽 곡선
            ctx.bezierCurveTo(
                -size * 0.1, -size * 0.2,
                -size * 0.8, -size * 0.2,
                -size * 0.8, size * 0.3
            );
            ctx.bezierCurveTo(
                -size * 0.8, size * 0.7,
                0, size * 1.1,
                0, size * 1.3
            );
            // 오른쪽 곡선
            ctx.bezierCurveTo(
                0, size * 1.1,
                size * 0.8, size * 0.7,
                size * 0.8, size * 0.3
            );
            ctx.bezierCurveTo(
                size * 0.8, -size * 0.2,
                size * 0.1, -size * 0.2,
                0, size * 0.3
            );

            ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.3 + beat * 0.4);
            ctx.fill();

            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.5 + beat * 0.3);
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();

            // 비트에 맞춰 퍼져나가는 링 (더 느리게)
            if (beat > 0.7 && Math.random() < 0.15) {
                this.particles.push({
                    x: cx,
                    y: cy,
                    radius: 50,
                    opacity: 0.4,
                    speed: 2
                });
            }
        }

        // 퍼져나가는 링
        this.particles = this.particles.filter(p => {
            p.radius += p.speed;
            p.opacity -= 0.008;

            if (p.opacity <= 0) return false;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, p.opacity * 0.4);
            ctx.lineWidth = 2;
            ctx.stroke();

            return true;
        });
    }

    drawTempo(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;
        const cx = w / 2;
        const mainColor = this.engine.colors[0];

        // 메트로놈 펜듈럼
        const pendulum = this.elements.find(el => el.type === 'pendulum');
        if (pendulum) {
            pendulum.angle = Math.sin(t * 2) * 0.4;

            const pivotY = h * 0.3;
            const rodLength = h * 0.4;

            ctx.save();
            ctx.translate(cx, pivotY);
            ctx.rotate(pendulum.angle);

            ctx.shadowBlur = 15;
            ctx.shadowColor = mainColor;

            // 막대
            const rodGradient = ctx.createLinearGradient(0, 0, 0, rodLength);
            rodGradient.addColorStop(0, this.engine.hexToRgba(mainColor, 0.6));
            rodGradient.addColorStop(1, this.engine.hexToRgba(mainColor, 0.3));

            ctx.fillStyle = rodGradient;
            ctx.fillRect(-3, 0, 6, rodLength);

            // 추
            ctx.beginPath();
            ctx.arc(0, rodLength * 0.7, 15, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.7);
            ctx.fill();

            // 추 글로우
            ctx.beginPath();
            ctx.arc(0, rodLength * 0.7, 20, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.3);
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.restore();

            // 피벗 포인트
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = mainColor;
            ctx.beginPath();
            ctx.arc(cx, pivotY, 8, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.8);
            ctx.fill();
            ctx.restore();

            // 펜듈럼이 극점에 도달할 때 파동 생성
            const tempoWaves = this.elements.find(el => el.type === 'tempo_waves');
            if (tempoWaves && Math.abs(Math.cos(t * 2)) > 0.99) {
                tempoWaves.rings.push({
                    radius: 20,
                    opacity: 0.6
                });
            }

            // 파동 그리기
            if (tempoWaves) {
                tempoWaves.rings = tempoWaves.rings.filter(ring => {
                    ring.radius += 2;
                    ring.opacity -= 0.01;

                    if (ring.opacity <= 0) return false;

                    ctx.beginPath();
                    ctx.arc(cx, pivotY, ring.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = this.engine.hexToRgba(mainColor, ring.opacity * 0.4);
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    return true;
                });
            }
        }

        // 박자 표시 점들
        const beatPhase = (t * 2) % (Math.PI * 2);
        const currentBeat = Math.floor((beatPhase / (Math.PI * 2)) * 4);

        this.elements.filter(el => el.type === 'beat_dot').forEach((dot, i) => {
            const isActive = i === currentBeat;
            const size = isActive ? 12 : 8;
            const opacity = isActive ? 0.8 : 0.3;

            ctx.save();
            ctx.shadowBlur = isActive ? 20 : 5;
            ctx.shadowColor = this.engine.colors[i % this.engine.colors.length];

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[i % this.engine.colors.length], opacity);
            ctx.fill();

            ctx.restore();
        });
    }
}
