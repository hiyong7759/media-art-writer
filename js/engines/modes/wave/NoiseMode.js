export class NoiseMode {
    constructor(engine) {
        this.engine = engine;
        this.particles = [];
        this.elements = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.particles = [];
        this.elements = [];

        if (this.style === 0) {
            // White: 백색 노이즈 (기존 유지하되 개선)
            this.createWhiteNoise();
        } else if (this.style === 1) {
            // Pink: 부드러운 핑크 노이즈 파동
            this.createPinkNoise();
        } else {
            // Static: TV 정적 글리치
            this.createStaticNoise();
        }
    }

    createWhiteNoise() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 노이즈 입자
        for (let i = 0; i < 200; i++) {
            this.particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 1 + Math.random() * 2,
                opacity: Math.random() * 0.5,
                speed: 0.5 + Math.random(),
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    createPinkNoise() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 부드러운 파동 레이어
        for (let i = 0; i < 8; i++) {
            this.elements.push({
                type: 'wave',
                y: h * (0.2 + i * 0.08),
                amplitude: 20 + Math.random() * 30,
                frequency: 0.005 + Math.random() * 0.01,
                phase: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.02,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }

        // 부유 입자
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 2 + Math.random() * 4,
                phase: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 0.5
            });
        }
    }

    createStaticNoise() {
        // 글리치 라인들
        for (let i = 0; i < 15; i++) {
            this.elements.push({
                type: 'glitch_line',
                y: Math.random() * this.engine.height,
                width: 50 + Math.random() * 200,
                offset: 0,
                speed: 2 + Math.random() * 5,
                active: false,
                timer: Math.random() * 100
            });
        }

        // 스캔라인
        this.elements.push({
            type: 'scanline',
            y: 0,
            speed: 3
        });

        // 노이즈 블록
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                width: 20 + Math.random() * 100,
                height: 2 + Math.random() * 10,
                opacity: 0,
                targetOpacity: 0
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawWhiteNoise(ctx, t);
        } else if (this.style === 1) {
            this.drawPinkNoise(ctx, t);
        } else {
            this.drawStaticNoise(ctx, t);
        }
    }

    drawWhiteNoise(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;
        const mainColor = this.engine.colors[0];

        // 배경 노이즈 패턴
        ctx.save();

        // 작은 노이즈 점들
        this.particles.forEach(p => {
            // 랜덤 이동
            p.x += (Math.random() - 0.5) * p.speed * 2;
            p.y += (Math.random() - 0.5) * p.speed * 2;

            // 경계 체크
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            // 깜빡임
            const flicker = Math.random() > 0.3;
            if (flicker) {
                ctx.fillStyle = this.engine.hexToRgba(mainColor, p.opacity * (0.5 + Math.random() * 0.5));
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }
        });

        // 가끔 큰 노이즈 플래시
        if (Math.random() < 0.05) {
            const flashX = Math.random() * w;
            const flashY = Math.random() * h;
            const flashSize = 5 + Math.random() * 20;

            ctx.shadowBlur = 10;
            ctx.shadowColor = mainColor;
            ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.3);
            ctx.fillRect(flashX, flashY, flashSize, flashSize);
        }

        // 수평 노이즈 라인
        for (let i = 0; i < 3; i++) {
            if (Math.random() < 0.1) {
                const lineY = Math.random() * h;
                ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.1);
                ctx.fillRect(0, lineY, w, 1 + Math.random() * 2);
            }
        }

        ctx.restore();
    }

    drawPinkNoise(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;

        // 부드러운 파동들
        this.elements.filter(el => el.type === 'wave').forEach((wave, i) => {
            wave.phase += wave.speed;

            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = wave.color;

            ctx.beginPath();

            for (let x = 0; x <= w; x += 5) {
                const y = wave.y +
                    Math.sin(x * wave.frequency + wave.phase) * wave.amplitude +
                    Math.sin(x * wave.frequency * 2 + wave.phase * 1.5) * (wave.amplitude * 0.3);

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.strokeStyle = this.engine.hexToRgba(wave.color, 0.4);
            ctx.lineWidth = 2;
            ctx.stroke();

            // 글로우 효과
            ctx.strokeStyle = this.engine.hexToRgba(wave.color, 0.15);
            ctx.lineWidth = 8;
            ctx.stroke();

            ctx.restore();
        });

        // 부유 입자
        this.particles.forEach((p, i) => {
            p.x += Math.sin(t + p.phase) * p.speed;
            p.y += Math.cos(t * 0.7 + p.phase) * p.speed * 0.5;

            // 경계 체크
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            const glow = Math.sin(t * 2 + p.phase) * 0.3 + 0.7;
            const color = this.engine.colors[i % this.engine.colors.length];

            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * glow, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(color, 0.3 * glow);
            ctx.fill();

            ctx.restore();
        });

        // 전체 오버레이 글로우
        const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
        gradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[0], 0.05));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }

    drawStaticNoise(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;
        const mainColor = this.engine.colors[0];

        // 스캔라인
        const scanline = this.elements.find(el => el.type === 'scanline');
        if (scanline) {
            scanline.y += scanline.speed;
            if (scanline.y > h) scanline.y = 0;

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = mainColor;

            // 스캔라인 효과
            const gradient = ctx.createLinearGradient(0, scanline.y - 30, 0, scanline.y + 30);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, this.engine.hexToRgba(mainColor, 0.15));
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, scanline.y - 30, w, 60);

            ctx.restore();
        }

        // 글리치 라인
        this.elements.filter(el => el.type === 'glitch_line').forEach(line => {
            line.timer--;

            if (line.timer <= 0) {
                line.active = !line.active;
                line.timer = 20 + Math.random() * 80;

                if (line.active) {
                    line.y = Math.random() * h;
                    line.offset = (Math.random() - 0.5) * 50;
                    line.width = 50 + Math.random() * 200;
                }
            }

            if (line.active) {
                ctx.save();

                // 글리치 효과 - RGB 분리
                const lineHeight = 2 + Math.random() * 6;

                // Red 채널
                ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.3);
                ctx.fillRect(line.offset - 2, line.y, line.width, lineHeight);

                // 메인 라인
                ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.5);
                ctx.fillRect(line.offset, line.y + 1, line.width, lineHeight - 1);

                ctx.restore();
            }
        });

        // 노이즈 블록
        this.particles.forEach(block => {
            // 랜덤하게 활성화
            if (Math.random() < 0.02) {
                block.targetOpacity = 0.3 + Math.random() * 0.3;
                block.x = Math.random() * w;
                block.y = Math.random() * h;
                block.width = 20 + Math.random() * 100;
                block.height = 2 + Math.random() * 10;
            }

            // 페이드 아웃
            block.opacity += (block.targetOpacity - block.opacity) * 0.2;
            block.targetOpacity *= 0.95;

            if (block.opacity > 0.01) {
                ctx.fillStyle = this.engine.hexToRgba(mainColor, block.opacity * 0.5);
                ctx.fillRect(block.x, block.y, block.width, block.height);
            }
        });

        // 가끔 전체 글리치
        if (Math.random() < 0.01) {
            ctx.save();
            ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.05);
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        }

        // CRT 효과 - 수평 라인
        ctx.save();
        ctx.globalAlpha = 0.03;
        for (let y = 0; y < h; y += 3) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, y, w, 1);
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}
