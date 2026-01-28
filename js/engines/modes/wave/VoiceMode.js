export class VoiceMode {
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
            // Echo: 메아리처럼 퍼져나가는 파동
            this.createEcho();
        } else if (this.style === 1) {
            // Chorus: 여러 목소리의 하모니
            this.createChorus();
        } else {
            // Reverb: 공간감 있는 잔향
            this.createReverb();
        }
    }

    createEcho() {
        // 중심에서 퍼져나가는 음파
        this.elements.push({
            type: 'source',
            x: this.engine.width / 2,
            y: this.engine.height / 2,
            phase: 0
        });

        // 메아리 링들
        this.elements.push({
            type: 'echo_rings',
            rings: []
        });
    }

    createChorus() {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 여러 음원 (코러스 멤버)
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const radius = 120;

            this.elements.push({
                type: 'voice',
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius,
                phase: i * Math.PI / 2.5,
                frequency: 0.8 + i * 0.1,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }

        // 하모니 연결선
        this.elements.push({
            type: 'harmony',
            connections: []
        });
    }

    createReverb() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 공간 경계 (반사면)
        this.elements.push({
            type: 'room',
            walls: [
                { x1: 0, y1: 0, x2: w, y2: 0 },
                { x1: w, y1: 0, x2: w, y2: h },
                { x1: w, y1: h, x2: 0, y2: h },
                { x1: 0, y1: h, x2: 0, y2: 0 }
            ]
        });

        // 음원
        this.elements.push({
            type: 'reverb_source',
            x: w / 2,
            y: h / 2,
            phase: 0
        });

        // 잔향 입자들
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: 3 + Math.random() * 5,
                life: 1,
                maxLife: 1
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawEcho(ctx, t);
        } else if (this.style === 1) {
            this.drawChorus(ctx, t);
        } else {
            this.drawReverb(ctx, t);
        }
    }

    drawEcho(ctx, t) {
        const mainColor = this.engine.colors[0];
        const source = this.elements.find(el => el.type === 'source');
        const echoRings = this.elements.find(el => el.type === 'echo_rings');

        if (!source || !echoRings) return;

        source.phase += 0.1;

        // 주기적으로 새 링 생성
        if (Math.sin(source.phase) > 0.95 && echoRings.rings.length < 8) {
            echoRings.rings.push({
                radius: 20,
                opacity: 0.8,
                distortion: Math.random() * 5,
                speed: 2 + Math.random()
            });
        }

        // 중심 음원
        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = mainColor;

        const sourceSize = 15 + Math.sin(source.phase) * 5;
        const gradient = ctx.createRadialGradient(source.x, source.y, 0, source.x, source.y, sourceSize);
        gradient.addColorStop(0, this.engine.hexToRgba(mainColor, 0.8));
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(source.x, source.y, sourceSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();

        // 메아리 링
        echoRings.rings = echoRings.rings.filter(ring => {
            ring.radius += ring.speed;
            ring.opacity -= 0.008;

            if (ring.opacity <= 0) return false;

            ctx.save();
            ctx.shadowBlur = 15 * ring.opacity;
            ctx.shadowColor = mainColor;

            ctx.beginPath();

            // 불규칙한 원 (음파 왜곡)
            const points = 60;
            for (let i = 0; i <= points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const distortion = Math.sin(angle * 5 + t * 2) * ring.distortion * ring.opacity;
                const r = ring.radius + distortion;

                const x = source.x + Math.cos(angle) * r;
                const y = source.y + Math.sin(angle) * r;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.closePath();
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, ring.opacity * 0.6);
            ctx.lineWidth = 2;
            ctx.stroke();

            // 글로우
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, ring.opacity * 0.2);
            ctx.lineWidth = 8;
            ctx.stroke();

            ctx.restore();

            return true;
        });
    }

    drawChorus(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 각 목소리 (음원)
        const voices = this.elements.filter(el => el.type === 'voice');

        // 하모니 연결
        ctx.save();
        voices.forEach((v1, i) => {
            voices.forEach((v2, j) => {
                if (i >= j) return;

                // 두 음원 사이의 하모니 라인
                const phase = Math.sin(t * v1.frequency + v1.phase) * Math.sin(t * v2.frequency + v2.phase);
                const opacity = Math.abs(phase) * 0.4;

                if (opacity > 0.1) {
                    ctx.beginPath();
                    ctx.moveTo(v1.x, v1.y);

                    // 곡선 연결
                    const midX = (v1.x + v2.x) / 2 + Math.sin(t + i) * 20;
                    const midY = (v1.y + v2.y) / 2 + Math.cos(t + j) * 20;
                    ctx.quadraticCurveTo(midX, midY, v2.x, v2.y);

                    ctx.strokeStyle = this.engine.hexToRgba(v1.color, opacity);
                    ctx.lineWidth = 1 + Math.abs(phase) * 2;
                    ctx.stroke();
                }
            });
        });
        ctx.restore();

        // 각 목소리 시각화
        voices.forEach((voice, i) => {
            const pulse = Math.sin(t * voice.frequency + voice.phase);
            const size = 20 + pulse * 10;

            ctx.save();
            ctx.shadowBlur = 25;
            ctx.shadowColor = voice.color;

            // 음파 원
            ctx.beginPath();
            ctx.arc(voice.x, voice.y, size, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(voice.color, 0.3 + Math.abs(pulse) * 0.3);
            ctx.fill();

            // 외곽
            ctx.beginPath();
            ctx.arc(voice.x, voice.y, size + 5, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(voice.color, 0.4);
            ctx.lineWidth = 2;
            ctx.stroke();

            // 작은 파동
            if (Math.abs(pulse) > 0.8) {
                ctx.beginPath();
                ctx.arc(voice.x, voice.y, size + 20 + (1 - Math.abs(pulse)) * 30, 0, Math.PI * 2);
                ctx.strokeStyle = this.engine.hexToRgba(voice.color, (Math.abs(pulse) - 0.8) * 2);
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            ctx.restore();
        });

        // 중앙 하모니 포인트
        ctx.save();
        const centerPulse = voices.reduce((sum, v) => sum + Math.sin(t * v.frequency + v.phase), 0) / voices.length;
        const centerSize = 10 + Math.abs(centerPulse) * 15;

        ctx.shadowBlur = 30;
        ctx.shadowColor = this.engine.colors[0];

        ctx.beginPath();
        ctx.arc(cx, cy, centerSize, 0, Math.PI * 2);
        ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[0], 0.4 + Math.abs(centerPulse) * 0.4);
        ctx.fill();

        ctx.restore();
    }

    drawReverb(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;
        const mainColor = this.engine.colors[0];

        // 룸 경계 (은은한 테두리)
        ctx.save();
        ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.15);
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, w - 40, h - 40);
        ctx.restore();

        // 음원
        const source = this.elements.find(el => el.type === 'reverb_source');
        if (source) {
            source.phase += 0.08;
            const pulse = Math.sin(source.phase);

            ctx.save();
            ctx.shadowBlur = 25;
            ctx.shadowColor = mainColor;

            const sourceSize = 12 + pulse * 5;
            ctx.beginPath();
            ctx.arc(source.x, source.y, sourceSize, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.6 + Math.abs(pulse) * 0.3);
            ctx.fill();

            ctx.restore();

            // 펄스에 맞춰 새 잔향 입자 생성
            if (pulse > 0.9 && Math.random() < 0.5) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 2;

                this.particles.push({
                    x: source.x,
                    y: source.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: 4 + Math.random() * 4,
                    life: 1,
                    maxLife: 1,
                    bounces: 0
                });
            }
        }

        // 잔향 입자
        this.particles = this.particles.filter(p => {
            // 이동
            p.x += p.vx;
            p.y += p.vy;

            // 벽 반사
            if (p.x < 25 || p.x > w - 25) {
                p.vx *= -0.8;
                p.x = Math.max(25, Math.min(w - 25, p.x));
                p.bounces++;
            }
            if (p.y < 25 || p.y > h - 25) {
                p.vy *= -0.8;
                p.y = Math.max(25, Math.min(h - 25, p.y));
                p.bounces++;
            }

            // 감쇠
            p.vx *= 0.995;
            p.vy *= 0.995;
            p.life -= 0.005 + p.bounces * 0.002;

            if (p.life <= 0) return false;

            // 그리기
            const alpha = p.life * 0.6;
            const color = this.engine.colors[p.bounces % this.engine.colors.length];

            ctx.save();
            ctx.shadowBlur = 10 * p.life;
            ctx.shadowColor = color;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(color, alpha);
            ctx.fill();

            // 트레일
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 5, p.y - p.vy * 5);
            ctx.strokeStyle = this.engine.hexToRgba(color, alpha * 0.3);
            ctx.lineWidth = p.size * p.life * 0.5;
            ctx.stroke();

            ctx.restore();

            return true;
        });

        // 공간 잔향 효과 (배경)
        const reverbGlow = Math.sin(t) * 0.02 + 0.03;
        const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
        gradient.addColorStop(0, this.engine.hexToRgba(mainColor, reverbGlow));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }
}
