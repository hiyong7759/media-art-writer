export class SilenceMode {
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
            // Void: 깊은 공허
            this.createVoid();
        } else if (this.style === 1) {
            // Quiet: 고요한 수면
            this.createQuiet();
        } else {
            // Mute: 음소거된 세계
            this.createMute();
        }
    }

    createVoid() {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 중심 공허
        this.elements.push({
            type: 'void_core',
            x: cx,
            y: cy,
            size: 80,
            phase: 0
        });

        // 미세한 먼지 입자
        for (let i = 0; i < 40; i++) {
            this.particles.push({
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                size: 1 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2,
                speed: 0.1 + Math.random() * 0.2,
                attracted: false
            });
        }
    }

    createQuiet() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 수평선
        this.elements.push({
            type: 'horizon',
            y: h * 0.5,
            phase: 0
        });

        // 물결 레이어
        for (let i = 0; i < 5; i++) {
            this.elements.push({
                type: 'ripple_layer',
                y: h * 0.5 + i * 15,
                amplitude: 3 - i * 0.5,
                frequency: 0.01 + i * 0.002,
                phase: i * Math.PI / 4,
                opacity: 0.3 - i * 0.05
            });
        }

        // 부유하는 작은 빛
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: Math.random() * w,
                y: h * (0.2 + Math.random() * 0.25),
                size: 2 + Math.random() * 3,
                phase: Math.random() * Math.PI * 2,
                speed: 0.05 + Math.random() * 0.1
            });
        }
    }

    createMute() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 음소거 심볼
        this.elements.push({
            type: 'mute_symbol',
            x: w / 2,
            y: h / 2,
            size: 60,
            phase: 0
        });

        // 사라지는 음파 잔해
        for (let i = 0; i < 15; i++) {
            this.elements.push({
                type: 'fading_wave',
                y: h * (0.2 + Math.random() * 0.6),
                amplitude: 5 + Math.random() * 10,
                frequency: 0.02 + Math.random() * 0.02,
                phase: Math.random() * Math.PI * 2,
                opacity: 0.15 + Math.random() * 0.15,
                fadeSpeed: 0.001 + Math.random() * 0.002
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.01; // 느린 시간

        if (this.style === 0) {
            this.drawVoid(ctx, t);
        } else if (this.style === 1) {
            this.drawQuiet(ctx, t);
        } else {
            this.drawMute(ctx, t);
        }
    }

    drawVoid(ctx, t) {
        const mainColor = this.engine.colors[0];
        const voidCore = this.elements.find(el => el.type === 'void_core');

        if (voidCore) {
            voidCore.phase += 0.02;

            const cx = voidCore.x;
            const cy = voidCore.y;

            // 어두운 중심
            ctx.save();

            // 블랙홀 같은 그라데이션
            const voidGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, voidCore.size * 2);
            voidGradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
            voidGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.5)');
            voidGradient.addColorStop(0.7, this.engine.hexToRgba(mainColor, 0.1));
            voidGradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(cx, cy, voidCore.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = voidGradient;
            ctx.fill();

            // 이벤트 호라이즌
            const breathe = Math.sin(voidCore.phase) * 5;

            ctx.shadowBlur = 20;
            ctx.shadowColor = mainColor;

            ctx.beginPath();
            ctx.arc(cx, cy, voidCore.size + breathe, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.3);
            ctx.lineWidth = 1;
            ctx.stroke();

            // 내부 빛
            ctx.beginPath();
            ctx.arc(cx, cy, voidCore.size * 0.3, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.15 + Math.sin(voidCore.phase * 2) * 0.1);
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        }

        // 먼지 입자 (공허에 끌려감)
        this.particles.forEach(p => {
            if (voidCore) {
                const dx = voidCore.x - p.x;
                const dy = voidCore.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // 공허에 가까워지면 서서히 끌려감
                if (dist < voidCore.size * 3) {
                    const force = 0.0005 * (1 - dist / (voidCore.size * 3));
                    p.x += dx * force;
                    p.y += dy * force;
                    p.attracted = true;
                } else {
                    p.attracted = false;
                    // 자유로운 이동
                    p.x += Math.sin(t + p.phase) * p.speed;
                    p.y += Math.cos(t * 0.7 + p.phase) * p.speed;
                }

                // 공허에 빨려들면 재생성
                if (dist < voidCore.size * 0.5) {
                    p.x = Math.random() * this.engine.width;
                    p.y = Math.random() * this.engine.height;
                }
            }

            const glow = Math.sin(t * 2 + p.phase) * 0.2 + 0.3;

            ctx.save();
            ctx.shadowBlur = 5;
            ctx.shadowColor = mainColor;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (p.attracted ? 0.7 : 1), 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(mainColor, glow);
            ctx.fill();

            ctx.restore();
        });
    }

    drawQuiet(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;
        const mainColor = this.engine.colors[0];

        // 수평선
        const horizon = this.elements.find(el => el.type === 'horizon');
        if (horizon) {
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = mainColor;

            ctx.beginPath();
            ctx.moveTo(0, horizon.y);
            ctx.lineTo(w, horizon.y);
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.4);
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }

        // 물결 레이어
        this.elements.filter(el => el.type === 'ripple_layer').forEach(layer => {
            layer.phase += 0.01;

            ctx.save();

            ctx.beginPath();
            for (let x = 0; x <= w; x += 8) {
                const y = layer.y + Math.sin(x * layer.frequency + layer.phase) * layer.amplitude;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.strokeStyle = this.engine.hexToRgba(mainColor, layer.opacity);
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        });

        // 부유하는 빛
        this.particles.forEach((p, i) => {
            p.x += Math.sin(t + p.phase) * p.speed;
            p.y += Math.sin(t * 0.5 + p.phase) * p.speed * 0.3;

            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;

            const glow = Math.sin(t * 1.5 + p.phase) * 0.3 + 0.5;

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = mainColor;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * glow, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.3 * glow);
            ctx.fill();

            // 반사
            ctx.beginPath();
            ctx.arc(p.x, horizon.y + (horizon.y - p.y) * 0.3, p.size * glow * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.1 * glow);
            ctx.fill();

            ctx.restore();
        });

        // 전체 분위기 (안개 효과)
        const fogGradient = ctx.createLinearGradient(0, 0, 0, h);
        fogGradient.addColorStop(0, this.engine.hexToRgba(mainColor, 0.02));
        fogGradient.addColorStop(0.5, 'transparent');
        fogGradient.addColorStop(1, this.engine.hexToRgba(mainColor, 0.03));

        ctx.fillStyle = fogGradient;
        ctx.fillRect(0, 0, w, h);
    }

    drawMute(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;
        const mainColor = this.engine.colors[0];

        // 사라지는 음파들
        this.elements.filter(el => el.type === 'fading_wave').forEach(wave => {
            wave.phase += 0.02;
            wave.opacity -= wave.fadeSpeed;

            // 완전히 사라지면 재생성
            if (wave.opacity <= 0) {
                wave.opacity = 0.15 + Math.random() * 0.15;
                wave.y = h * (0.2 + Math.random() * 0.6);
                wave.amplitude = 5 + Math.random() * 10;
            }

            ctx.save();

            ctx.beginPath();
            for (let x = 0; x <= w; x += 10) {
                const fadeEnvelope = 1 - Math.abs(x - w / 2) / (w / 2);
                const y = wave.y + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude * fadeEnvelope;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.strokeStyle = this.engine.hexToRgba(mainColor, wave.opacity);
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        });

        // 음소거 심볼
        const muteSymbol = this.elements.find(el => el.type === 'mute_symbol');
        if (muteSymbol) {
            muteSymbol.phase += 0.03;

            const cx = muteSymbol.x;
            const cy = muteSymbol.y;
            const size = muteSymbol.size;
            const breathe = Math.sin(muteSymbol.phase) * 3;

            ctx.save();
            ctx.translate(cx, cy);

            ctx.shadowBlur = 20;
            ctx.shadowColor = mainColor;

            // 스피커 아이콘 (간소화)
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.4);
            ctx.lineWidth = 2;

            // 스피커 본체
            ctx.beginPath();
            ctx.moveTo(-size * 0.3, -size * 0.15);
            ctx.lineTo(-size * 0.1, -size * 0.15);
            ctx.lineTo(size * 0.1, -size * 0.3);
            ctx.lineTo(size * 0.1, size * 0.3);
            ctx.lineTo(-size * 0.1, size * 0.15);
            ctx.lineTo(-size * 0.3, size * 0.15);
            ctx.closePath();
            ctx.stroke();

            // X 표시 (음소거)
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.5 + Math.sin(muteSymbol.phase * 2) * 0.2);
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.moveTo(size * 0.2, -size * 0.2);
            ctx.lineTo(size * 0.5, size * 0.2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(size * 0.5, -size * 0.2);
            ctx.lineTo(size * 0.2, size * 0.2);
            ctx.stroke();

            // 주변 원
            ctx.beginPath();
            ctx.arc(0, 0, size + breathe, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.15);
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }

        // 침묵의 분위기
        const silenceGradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
        silenceGradient.addColorStop(0, 'transparent');
        silenceGradient.addColorStop(1, this.engine.hexToRgba(mainColor, 0.02));

        ctx.fillStyle = silenceGradient;
        ctx.fillRect(0, 0, w, h);
    }
}
