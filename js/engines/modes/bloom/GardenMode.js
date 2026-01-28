export class GardenMode {
    constructor(engine) {
        this.engine = engine;
        this.elements = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.elements = [];

        if (this.style === 0) {
            // Secret: 신비로운 비밀 정원
            this.createSecretGarden();
        } else if (this.style === 1) {
            // Zen: 젠 가든 (미니멀)
            this.createZenGarden();
        } else {
            // Maze: 미로 정원
            this.createMazeGarden();
        }
    }

    createSecretGarden() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 신비로운 꽃들 (다양한 깊이)
        for (let i = 0; i < 25; i++) {
            const depth = Math.random();
            this.elements.push({
                type: 'mystical_flower',
                x: Math.random() * w,
                y: h * 0.4 + depth * h * 0.5,
                size: 15 + (1 - depth) * 30,
                depth,
                phase: Math.random() * Math.PI * 2,
                glowPhase: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length],
                petalCount: 5 + Math.floor(Math.random() * 4)
            });
        }

        // 반딧불이
        for (let i = 0; i < 20; i++) {
            this.elements.push({
                type: 'firefly',
                x: Math.random() * w,
                y: Math.random() * h,
                phase: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 0.5,
                glowPhase: Math.random() * Math.PI * 2
            });
        }

        // 빛 줄기
        for (let i = 0; i < 5; i++) {
            this.elements.push({
                type: 'light_beam',
                x: w * (0.1 + i * 0.2),
                width: 30 + Math.random() * 50,
                phase: i * 0.5
            });
        }
    }

    createZenGarden() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 물결 무늬 (모래)
        for (let i = 0; i < 15; i++) {
            this.elements.push({
                type: 'sand_ripple',
                y: h * 0.2 + i * (h * 0.5 / 15),
                phase: i * 0.2,
                amplitude: 8 + Math.sin(i * 0.5) * 4
            });
        }

        // 돌
        const stones = [
            { x: w * 0.3, y: h * 0.5, size: 40 },
            { x: w * 0.7, y: h * 0.45, size: 30 },
            { x: w * 0.5, y: h * 0.65, size: 25 }
        ];
        stones.forEach((s, i) => {
            this.elements.push({
                type: 'stone',
                ...s,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        });

        // 연꽃
        this.elements.push({
            type: 'lotus',
            x: w * 0.5,
            y: h * 0.35,
            size: 50,
            phase: 0,
            color: this.engine.colors[0]
        });

        // 이끼
        for (let i = 0; i < 8; i++) {
            this.elements.push({
                type: 'moss',
                x: Math.random() * w,
                y: h * 0.6 + Math.random() * h * 0.3,
                size: 20 + Math.random() * 30
            });
        }
    }

    createMazeGarden() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 생울타리 격자
        const cols = 5;
        const rows = 4;
        const cellW = w / cols;
        const cellH = h / rows;

        // 수직 울타리
        for (let c = 0; c <= cols; c++) {
            for (let r = 0; r < rows; r++) {
                if (Math.random() > 0.3) {
                    this.elements.push({
                        type: 'hedge_v',
                        x: c * cellW,
                        y: r * cellH,
                        height: cellH,
                        phase: (c + r) * 0.2
                    });
                }
            }
        }

        // 수평 울타리
        for (let r = 0; r <= rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (Math.random() > 0.3) {
                    this.elements.push({
                        type: 'hedge_h',
                        x: c * cellW,
                        y: r * cellH,
                        width: cellW,
                        phase: (c + r) * 0.2
                    });
                }
            }
        }

        // 꽃 장식
        for (let i = 0; i < 12; i++) {
            this.elements.push({
                type: 'topiary_flower',
                x: (Math.floor(Math.random() * cols) + 0.5) * cellW,
                y: (Math.floor(Math.random() * rows) + 0.5) * cellH,
                size: 20 + Math.random() * 15,
                phase: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }

        // 분수 (중앙 배치, 여러 층의 물줄기)
        this.elements.push({
            type: 'fountain',
            x: w / 2,
            y: h / 2,
            jets: [
                { angle: -Math.PI / 2, power: 8, spread: 0.1 },
                { angle: -Math.PI / 2 - 0.3, power: 5, spread: 0.15 },
                { angle: -Math.PI / 2 + 0.3, power: 5, spread: 0.15 },
                { angle: -Math.PI / 2 - 0.5, power: 3, spread: 0.2 },
                { angle: -Math.PI / 2 + 0.5, power: 3, spread: 0.2 }
            ],
            particles: [],
            ripples: [],
            phase: 0
        });
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawSecretGarden(ctx, t);
        } else if (this.style === 1) {
            this.drawZenGarden(ctx, t);
        } else {
            this.drawMazeGarden(ctx, t);
        }
    }

    drawSecretGarden(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;

        // 빛 줄기
        this.elements.filter(el => el.type === 'light_beam').forEach(el => {
            const shimmer = Math.sin(t + el.phase) * 0.1 + 0.9;

            const gradient = ctx.createLinearGradient(el.x, 0, el.x, h);
            gradient.addColorStop(0, `rgba(255, 255, 200, ${0.15 * shimmer})`);
            gradient.addColorStop(0.5, `rgba(255, 255, 150, ${0.08 * shimmer})`);
            gradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.moveTo(el.x - el.width / 2, 0);
            ctx.lineTo(el.x + el.width / 2, 0);
            ctx.lineTo(el.x + el.width, h);
            ctx.lineTo(el.x - el.width, h);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();
        });

        // 꽃 (깊이순 정렬)
        const flowers = this.elements.filter(el => el.type === 'mystical_flower')
            .sort((a, b) => a.depth - b.depth);

        flowers.forEach(f => {
            const sway = Math.sin(t + f.phase) * 3 * (1 - f.depth);
            const glow = Math.sin(t * 2 + f.glowPhase) * 0.3 + 0.7;

            ctx.save();
            ctx.translate(f.x + sway, f.y);

            ctx.shadowBlur = 20 * glow;
            ctx.shadowColor = f.color;

            // 줄기
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 30);
            ctx.strokeStyle = this.engine.hexToRgba(f.color, 0.3);
            ctx.lineWidth = 2;
            ctx.stroke();

            // 꽃잎
            for (let i = 0; i < f.petalCount; i++) {
                ctx.save();
                ctx.rotate((i / f.petalCount) * Math.PI * 2);

                ctx.beginPath();
                ctx.ellipse(0, -f.size * 0.5, f.size * 0.25, f.size * 0.5, 0, 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(f.color, 0.6 * glow);
                ctx.fill();

                ctx.restore();
            }

            // 빛나는 중심
            ctx.beginPath();
            ctx.arc(0, 0, f.size * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * glow})`;
            ctx.fill();

            ctx.restore();
        });

        // 반딧불이
        this.elements.filter(el => el.type === 'firefly').forEach(f => {
            f.x += Math.sin(t * 2 + f.phase) * f.speed;
            f.y += Math.cos(t * 1.5 + f.phase) * f.speed * 0.7;

            if (f.x < 0) f.x = w;
            if (f.x > w) f.x = 0;
            if (f.y < 0) f.y = h;
            if (f.y > h) f.y = 0;

            const glow = Math.sin(t * 3 + f.glowPhase) * 0.5 + 0.5;

            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffffaa';

            ctx.beginPath();
            ctx.arc(f.x, f.y, 3 + glow * 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 180, ${0.4 + glow * 0.6})`;
            ctx.fill();

            ctx.restore();
        });
    }

    drawZenGarden(ctx, t) {
        const w = this.engine.width;
        const color = this.engine.colors[0];

        // 모래 물결
        this.elements.filter(el => el.type === 'sand_ripple').forEach(el => {
            ctx.beginPath();
            for (let x = 0; x <= w; x += 5) {
                const y = el.y + Math.sin(x * 0.02 + t + el.phase) * el.amplitude;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = this.engine.hexToRgba(color, 0.2);
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // 이끼
        this.elements.filter(el => el.type === 'moss').forEach(el => {
            ctx.beginPath();
            ctx.arc(el.x, el.y, el.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(80, 120, 80, 0.2)';
            ctx.fill();
        });

        // 돌
        this.elements.filter(el => el.type === 'stone').forEach(el => {
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = el.color;

            // 그림자
            ctx.beginPath();
            ctx.ellipse(el.x + 5, el.y + 5, el.size, el.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fill();

            // 돌
            ctx.beginPath();
            ctx.ellipse(el.x, el.y, el.size, el.size * 0.7, 0, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(el.x - 10, el.y - 10, 0, el.x, el.y, el.size);
            gradient.addColorStop(0, this.engine.hexToRgba(el.color, 0.6));
            gradient.addColorStop(1, this.engine.hexToRgba(el.color, 0.3));
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.restore();
        });

        // 연꽃
        this.elements.filter(el => el.type === 'lotus').forEach(el => {
            el.phase += 0.01;
            const breath = Math.sin(el.phase) * 0.1 + 1;

            ctx.save();
            ctx.translate(el.x, el.y);
            ctx.scale(breath, breath);

            ctx.shadowBlur = 25;
            ctx.shadowColor = el.color;

            // 연잎
            ctx.beginPath();
            ctx.arc(0, 20, el.size * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(60, 100, 60, 0.4)';
            ctx.fill();

            // 꽃잎 (8장)
            for (let i = 0; i < 8; i++) {
                ctx.save();
                ctx.rotate((i / 8) * Math.PI * 2);

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(-el.size * 0.2, -el.size * 0.5, 0, -el.size);
                ctx.quadraticCurveTo(el.size * 0.2, -el.size * 0.5, 0, 0);

                ctx.fillStyle = this.engine.hexToRgba(el.color, 0.7);
                ctx.fill();

                ctx.restore();
            }

            // 중심
            ctx.beginPath();
            ctx.arc(0, 0, el.size * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 220, 50, 0.9)';
            ctx.fill();

            ctx.restore();
        });
    }

    drawMazeGarden(ctx, t) {
        const hedgeColor = 'rgba(40, 80, 40, 0.6)';

        // 울타리
        this.elements.filter(el => el.type === 'hedge_v').forEach(el => {
            const sway = Math.sin(t + el.phase) * 2;

            ctx.fillStyle = hedgeColor;
            ctx.fillRect(el.x - 8 + sway, el.y, 16, el.height);

            // 잎 디테일
            for (let y = el.y; y < el.y + el.height; y += 15) {
                ctx.beginPath();
                ctx.arc(el.x + sway + (Math.random() - 0.5) * 10, y, 5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(50, 100, 50, 0.4)';
                ctx.fill();
            }
        });

        this.elements.filter(el => el.type === 'hedge_h').forEach(el => {
            const sway = Math.sin(t + el.phase) * 2;

            ctx.fillStyle = hedgeColor;
            ctx.fillRect(el.x, el.y - 8 + sway, el.width, 16);

            for (let x = el.x; x < el.x + el.width; x += 15) {
                ctx.beginPath();
                ctx.arc(x, el.y + sway + (Math.random() - 0.5) * 10, 5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(50, 100, 50, 0.4)';
                ctx.fill();
            }
        });

        // 꽃 장식
        this.elements.filter(el => el.type === 'topiary_flower').forEach(el => {
            const pulse = Math.sin(t * 2 + el.phase) * 0.15 + 1;

            ctx.save();
            ctx.translate(el.x, el.y);
            ctx.scale(pulse, pulse);

            ctx.shadowBlur = 15;
            ctx.shadowColor = el.color;

            // 둥근 꽃
            for (let i = 0; i < 6; i++) {
                ctx.save();
                ctx.rotate((i / 6) * Math.PI * 2);

                ctx.beginPath();
                ctx.arc(0, -el.size * 0.4, el.size * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(el.color, 0.7);
                ctx.fill();

                ctx.restore();
            }

            ctx.beginPath();
            ctx.arc(0, 0, el.size * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.restore();
        });

        // 분수
        this.elements.filter(el => el.type === 'fountain').forEach(f => {
            f.phase += 0.02;
            const mainColor = this.engine.colors[0];

            // 여러 물줄기에서 파티클 생성
            f.jets.forEach((jet, ji) => {
                if (Math.random() < 0.5) {
                    const spread = (Math.random() - 0.5) * jet.spread;
                    f.particles.push({
                        x: f.x,
                        y: f.y,
                        vx: Math.cos(jet.angle + spread) * jet.power * (0.8 + Math.random() * 0.4),
                        vy: Math.sin(jet.angle + spread) * jet.power * (0.8 + Math.random() * 0.4),
                        size: 2 + Math.random() * 3,
                        life: 1,
                        jetIndex: ji
                    });
                }
            });

            // 물 파동 생성
            if (Math.random() < 0.1) {
                f.ripples.push({
                    x: f.x + (Math.random() - 0.5) * 60,
                    y: f.y + 25 + Math.random() * 15,
                    radius: 5,
                    maxRadius: 30 + Math.random() * 20,
                    life: 1
                });
            }

            ctx.save();
            ctx.shadowBlur = 25;
            ctx.shadowColor = mainColor;

            // 분수대 그릇 (3단)
            // 하단 받침
            ctx.beginPath();
            ctx.ellipse(f.x, f.y + 40, 55, 20, 0, 0, Math.PI * 2);
            const baseGrad = ctx.createRadialGradient(f.x, f.y + 40, 0, f.x, f.y + 40, 55);
            baseGrad.addColorStop(0, this.engine.hexToRgba(mainColor, 0.4));
            baseGrad.addColorStop(1, this.engine.hexToRgba(mainColor, 0.2));
            ctx.fillStyle = baseGrad;
            ctx.fill();
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.6);
            ctx.lineWidth = 3;
            ctx.stroke();

            // 기둥
            ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.3);
            ctx.fillRect(f.x - 8, f.y - 10, 16, 50);

            // 상단 받침
            ctx.beginPath();
            ctx.ellipse(f.x, f.y, 35, 12, 0, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.35);
            ctx.fill();
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.5);
            ctx.lineWidth = 2;
            ctx.stroke();

            // 물 파티클 업데이트 및 렌더
            f.particles = f.particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.25; // 중력
                p.life -= 0.015;

                if (p.life > 0) {
                    const alpha = p.life * 0.8;
                    const glitter = Math.sin(f.phase * 10 + p.x * 0.1) * 0.3 + 0.7;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);

                    // 물 색상 (파란색 계열 + 메인 컬러 힌트)
                    const waterGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                    waterGrad.addColorStop(0, `rgba(200, 230, 255, ${alpha * glitter})`);
                    waterGrad.addColorStop(1, this.engine.hexToRgba(mainColor, alpha * 0.5));
                    ctx.fillStyle = waterGrad;
                    ctx.fill();

                    return true;
                }
                return false;
            });

            // 물 파동
            f.ripples = f.ripples.filter(r => {
                r.radius += 1;
                r.life -= 0.03;

                if (r.life > 0 && r.radius < r.maxRadius) {
                    ctx.beginPath();
                    ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.4, 0, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(180, 220, 255, ${r.life * 0.5})`;
                    ctx.lineWidth = 2 * r.life;
                    ctx.stroke();
                    return true;
                }
                return false;
            });

            // 분수 중앙 물줄기 하이라이트
            const shimmer = Math.sin(f.phase * 3) * 0.2 + 0.8;
            ctx.beginPath();
            ctx.moveTo(f.x, f.y);
            ctx.lineTo(f.x - 3, f.y - 60 * shimmer);
            ctx.lineTo(f.x + 3, f.y - 60 * shimmer);
            ctx.closePath();
            ctx.fillStyle = `rgba(220, 240, 255, ${0.4 * shimmer})`;
            ctx.fill();

            ctx.restore();
        });
    }
}
