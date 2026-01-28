export class QuasarMode {
    constructor(engine) {
        this.engine = engine;
        this.particles = [];
        this.elements = [];
        this.style = 0;
        this.phase = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.particles = [];
        this.elements = [];
        this.phase = 0;

        if (this.style === 0) {
            // Beam: 제트 빔 방출 (기존 개선)
            this.createBeam();
        } else if (this.style === 1) {
            // Radio: 전파 방출 (동심원 파동)
            this.createRadio();
        } else {
            // Active: 활동 은하핵 (AGN)
            this.createActive();
        }
    }

    createBeam() {
        // 강착원반
        this.elements.push({
            type: 'disk',
            rotation: 0
        });

        // 제트 빔 입자
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                y: Math.random() * 200,
                speed: 3 + Math.random() * 3,
                size: 2 + Math.random() * 3,
                offset: (Math.random() - 0.5) * 10,
                direction: 1,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
            });
            this.particles.push({
                y: Math.random() * 200,
                speed: 3 + Math.random() * 3,
                size: 2 + Math.random() * 3,
                offset: (Math.random() - 0.5) * 10,
                direction: -1,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
            });
        }
    }

    createRadio() {
        // 전파 원 (동심원)
        this.elements.push({
            type: 'radio_waves',
            waves: []
        });

        // 로브 (전파 영역)
        this.elements.push({
            type: 'lobe',
            side: 1,
            size: 80,
            phase: 0
        });
        this.elements.push({
            type: 'lobe',
            side: -1,
            size: 70,
            phase: Math.PI
        });
    }

    createActive() {
        // 중심 블랙홀
        this.elements.push({
            type: 'core',
            size: 30,
            phase: 0
        });

        // 강착원반 입자
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                radius: 40 + Math.random() * 80,
                speed: 0.02 + Math.random() * 0.03,
                size: 1 + Math.random() * 2,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
            });
        }

        // 불규칙 플레어
        this.elements.push({
            type: 'flares',
            items: []
        });
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;
        this.phase += 0.03;

        if (this.style === 0) {
            this.drawBeam(ctx, t);
        } else if (this.style === 1) {
            this.drawRadio(ctx, t);
        } else {
            this.drawActive(ctx, t);
        }
    }

    drawBeam(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 강착원반
        const disk = this.elements.find(e => e.type === 'disk');
        if (disk) {
            disk.rotation += 0.02;

            ctx.save();
            ctx.translate(cx, cy);

            // 원반 (타원형)
            for (let i = 3; i > 0; i--) {
                const radius = 30 + i * 15;
                const gradient = ctx.createRadialGradient(0, 0, radius - 10, 0, 0, radius + 10);
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(0.5, this.engine.hexToRgba(this.engine.colors[2], 0.3 / i));
                gradient.addColorStop(1, 'transparent');

                ctx.save();
                ctx.scale(1, 0.25);
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 10;
                ctx.stroke();
                ctx.restore();
            }

            ctx.restore();
        }

        // 제트 빔 (상하)
        ctx.save();

        // 상단 빔 글로우
        const beamGradient1 = ctx.createLinearGradient(cx, cy, cx, cy - 250);
        beamGradient1.addColorStop(0, this.engine.hexToRgba(this.engine.colors[3], 0.6));
        beamGradient1.addColorStop(0.3, this.engine.hexToRgba(this.engine.colors[2], 0.3));
        beamGradient1.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(cx - 15, cy);
        ctx.lineTo(cx - 5, cy - 250);
        ctx.lineTo(cx + 5, cy - 250);
        ctx.lineTo(cx + 15, cy);
        ctx.closePath();
        ctx.fillStyle = beamGradient1;
        ctx.fill();

        // 하단 빔 글로우
        const beamGradient2 = ctx.createLinearGradient(cx, cy, cx, cy + 250);
        beamGradient2.addColorStop(0, this.engine.hexToRgba(this.engine.colors[3], 0.6));
        beamGradient2.addColorStop(0.3, this.engine.hexToRgba(this.engine.colors[2], 0.3));
        beamGradient2.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(cx - 15, cy);
        ctx.lineTo(cx - 5, cy + 250);
        ctx.lineTo(cx + 5, cy + 250);
        ctx.lineTo(cx + 15, cy);
        ctx.closePath();
        ctx.fillStyle = beamGradient2;
        ctx.fill();

        ctx.restore();

        // 빔 입자
        this.particles.forEach(p => {
            p.y += p.speed;
            if (p.y > 250) p.y = 0;

            const x = cx + p.offset + Math.sin(p.y * 0.05 + t) * 3;
            const y = cy + p.y * p.direction;
            const alpha = 1 - p.y / 250;

            ctx.save();
            ctx.shadowBlur = 8 * alpha;
            ctx.shadowColor = p.color;

            ctx.beginPath();
            ctx.arc(x, y, p.size * alpha, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, 0.6 * alpha);
            ctx.fill();

            ctx.restore();
        });

        // 중심 코어
        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.engine.colors[3];

        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[3], 0.9);
        ctx.fill();

        ctx.restore();
    }

    drawRadio(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 전파 로브 (양쪽 타원형 영역)
        this.elements.filter(e => e.type === 'lobe').forEach(lobe => {
            lobe.phase += 0.01;
            const breathe = Math.sin(lobe.phase) * 10;

            const lobeX = cx + lobe.side * 120;

            ctx.save();

            const lobeGradient = ctx.createRadialGradient(lobeX, cy, 0, lobeX, cy, lobe.size + breathe);
            lobeGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[2], 0.3));
            lobeGradient.addColorStop(0.5, this.engine.hexToRgba(this.engine.colors[1], 0.15));
            lobeGradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(lobeX, cy, lobe.size + breathe, 0, Math.PI * 2);
            ctx.fillStyle = lobeGradient;
            ctx.fill();

            // 로브 테두리
            ctx.beginPath();
            ctx.arc(lobeX, cy, lobe.size + breathe, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[2], 0.2);
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        });

        // 전파 파동 (중심에서 퍼져나감)
        const radioWaves = this.elements.find(e => e.type === 'radio_waves');
        if (radioWaves) {
            // 새 파동 생성
            if (Math.random() < 0.03) {
                radioWaves.waves.push({
                    radius: 20,
                    opacity: 0.6
                });
            }

            // 파동 그리기 및 업데이트
            radioWaves.waves = radioWaves.waves.filter(wave => {
                wave.radius += 1.5;
                wave.opacity -= 0.005;

                if (wave.opacity <= 0) return false;

                ctx.save();
                ctx.shadowBlur = 10 * wave.opacity;
                ctx.shadowColor = this.engine.colors[1];

                ctx.beginPath();
                ctx.arc(cx, cy, wave.radius, 0, Math.PI * 2);
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[1], wave.opacity * 0.5);
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.restore();

                return true;
            });
        }

        // 연결 제트 (중심에서 로브로)
        ctx.save();
        ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[2], 0.3);
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 120, cy);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 120, cy);
        ctx.stroke();

        ctx.restore();

        // 중심 퀘이사
        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = this.engine.colors[3];

        const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
        coreGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[3], 0.9));
        coreGradient.addColorStop(0.5, this.engine.hexToRgba(this.engine.colors[2], 0.4));
        coreGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, 25, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();

        ctx.restore();
    }

    drawActive(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 강착원반 입자
        this.particles.forEach(p => {
            p.angle += p.speed * (60 / p.radius);

            const x = cx + Math.cos(p.angle) * p.radius;
            const y = cy + Math.sin(p.angle) * p.radius * 0.3;

            // 밝기 변화 (도플러 효과 시뮬레이션)
            const doppler = Math.cos(p.angle) * 0.3 + 0.7;

            ctx.save();
            ctx.shadowBlur = 5 * doppler;
            ctx.shadowColor = p.color;

            ctx.beginPath();
            ctx.arc(x, y, p.size * doppler, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, 0.5 * doppler);
            ctx.fill();

            ctx.restore();
        });

        // 불규칙 플레어
        const flares = this.elements.find(e => e.type === 'flares');
        if (flares) {
            // 새 플레어 생성
            if (Math.random() < 0.02) {
                const angle = Math.random() * Math.PI * 2;
                flares.items.push({
                    angle,
                    length: 50 + Math.random() * 50,
                    width: 5 + Math.random() * 10,
                    life: 1
                });
            }

            // 플레어 그리기
            flares.items = flares.items.filter(flare => {
                flare.life -= 0.015;

                if (flare.life <= 0) return false;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(flare.angle);

                const flareGradient = ctx.createLinearGradient(0, 0, flare.length * flare.life, 0);
                flareGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[3], 0.8 * flare.life));
                flareGradient.addColorStop(0.5, this.engine.hexToRgba(this.engine.colors[2], 0.4 * flare.life));
                flareGradient.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.moveTo(30, -flare.width * flare.life / 2);
                ctx.lineTo(30 + flare.length * flare.life, 0);
                ctx.lineTo(30, flare.width * flare.life / 2);
                ctx.closePath();
                ctx.fillStyle = flareGradient;
                ctx.fill();

                ctx.restore();

                return true;
            });
        }

        // 중심 블랙홀
        const core = this.elements.find(e => e.type === 'core');
        if (core) {
            core.phase += 0.05;
            const pulse = Math.sin(core.phase) * 0.2 + 0.8;

            ctx.save();

            // 블랙홀
            const holeGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, core.size);
            holeGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            holeGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.9)');
            holeGradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(cx, cy, core.size, 0, Math.PI * 2);
            ctx.fillStyle = holeGradient;
            ctx.fill();

            // 이벤트 호라이즌 테두리
            ctx.shadowBlur = 20 * pulse;
            ctx.shadowColor = this.engine.colors[3];

            ctx.beginPath();
            ctx.arc(cx, cy, core.size - 5, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[3], 0.6 * pulse);
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        }

        // 전체 활동 글로우
        const activeGlow = ctx.createRadialGradient(cx, cy, 30, cx, cy, 150);
        activeGlow.addColorStop(0, this.engine.hexToRgba(this.engine.colors[2], 0.1));
        activeGlow.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, 150, 0, Math.PI * 2);
        ctx.fillStyle = activeGlow;
        ctx.fill();
    }
}
