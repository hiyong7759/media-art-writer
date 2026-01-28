export class RainMode {
    constructor(engine) {
        this.engine = engine;
        this.drops = [];
        this.style = 0;
        this.trails = []; // Binary용 트레일
        this.glitchTimer = 0;
    }

    init(variant = 0) {
        this.style = variant;
        console.log(`[RainMode] Style: ${['Modern', 'Binary', 'Storm'][this.style]}`);

        const columns = Math.floor(this.engine.width / 15);
        this.drops = Array(columns).fill(0).map(() => Math.random() * this.engine.height);

        // Binary: 각 컬럼별 트레일 길이
        if (this.style === 1) {
            this.trails = Array(columns).fill(0).map(() => ({
                length: Math.floor(Math.random() * 15) + 5,
                chars: []
            }));
        }
    }

    draw() {
        const ctx = this.engine.ctx;

        if (this.style === 0) {
            // Modern: index와 동일하게 (한글 매트릭스)
            this.drawModern(ctx);
        } else if (this.style === 1) {
            // Binary: 클래식 매트릭스 (0/1 + 트레일 효과)
            this.drawBinary(ctx);
        } else {
            // Storm: 폭풍 + 글리치 + 번개
            this.drawStorm(ctx);
        }
    }

    drawModern(ctx) {
        // index와 동일한 한글 매트릭스
        const chars = '가나다라마바사아자차카타파하디지털코드데이터미래네온시티전력신호접속흐름';
        ctx.font = '13px monospace';

        for (let i = 0; i < this.drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * 15;
            const y = this.drops[i];

            // index와 동일: 5% 확률로 흰색
            if (Math.random() > 0.95) {
                ctx.fillStyle = '#ffffff';
            } else {
                ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[0], 0.9);
            }

            ctx.fillText(char, x, y);
            this.drops[i] += 5;

            if (this.drops[i] > this.engine.height && Math.random() > 0.975) {
                this.drops[i] = -20;
            }
        }
    }

    drawBinary(ctx) {
        // 클래식 매트릭스: 0/1 + 밝은 헤드 + 페이딩 트레일
        ctx.font = '14px monospace';
        const mainColor = this.engine.colors[0];

        for (let i = 0; i < this.drops.length; i++) {
            const x = i * 15;
            const y = this.drops[i];
            const trail = this.trails[i];

            // 새 문자 추가
            const newChar = Math.random() > 0.5 ? '1' : '0';
            trail.chars.unshift({ char: newChar, y: y });

            // 트레일 길이 제한
            if (trail.chars.length > trail.length) {
                trail.chars.pop();
            }

            // 트레일 그리기 (페이딩)
            trail.chars.forEach((item, idx) => {
                const fadeAlpha = 1 - (idx / trail.length);
                if (idx === 0) {
                    // 헤드: 밝은 흰색/민트
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = mainColor;
                } else {
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = this.engine.hexToRgba(mainColor, fadeAlpha * 0.8);
                }
                ctx.fillText(item.char, x, item.y);
            });
            ctx.shadowBlur = 0;

            // 이동
            this.drops[i] += 3;

            if (this.drops[i] > this.engine.height && Math.random() > 0.98) {
                this.drops[i] = -20;
                trail.chars = [];
            }
        }
    }

    drawStorm(ctx) {
        // 폭풍: 빠른 속도 + 대각선 + 글리치 + 번개
        const chars = '번개폭풍충격파동에너지전류섬광방전';
        ctx.font = 'bold 16px monospace';
        const mainColor = this.engine.colors[0];

        this.glitchTimer++;

        // 번개 효과 (가끔)
        if (Math.random() > 0.995) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`;
            ctx.fillRect(0, 0, this.engine.width, this.engine.height);
        }

        for (let i = 0; i < this.drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            let x = i * 15;
            const y = this.drops[i];

            // 글리치: 가끔 x 위치 흔들림
            if (Math.random() > 0.95) {
                x += (Math.random() - 0.5) * 20;
            }

            // 색상 변화
            if (Math.random() > 0.9) {
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ffffff';
            } else if (Math.random() > 0.7) {
                // 보조 색상
                ctx.fillStyle = this.engine.colors[1] || mainColor;
                ctx.shadowBlur = 8;
                ctx.shadowColor = this.engine.colors[1] || mainColor;
            } else {
                ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.9);
                ctx.shadowBlur = 5;
                ctx.shadowColor = mainColor;
            }

            ctx.fillText(char, x, y);
            ctx.shadowBlur = 0;

            // 빠른 속도 + 약간의 가속
            this.drops[i] += 8 + Math.random() * 4;

            // 글리치 라인 (가끔)
            if (Math.random() > 0.99) {
                ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.5);
                ctx.fillRect(0, y, this.engine.width, 2);
            }

            if (this.drops[i] > this.engine.height && Math.random() > 0.95) {
                this.drops[i] = -30;
            }
        }
    }
}
