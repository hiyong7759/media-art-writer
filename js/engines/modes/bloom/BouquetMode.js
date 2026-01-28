export class BouquetMode {
    constructor(engine) {
        this.engine = engine;
        this.bouquets = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.bouquets = [];

        // 꽃다발 위치
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        if (this.style === 0) {
            // Round: 둥근 꽃다발
            this.createRoundBouquet(cx, cy);
        } else if (this.style === 1) {
            // Cascade: 흘러내리는 꽃다발
            this.createCascadeBouquet(cx, cy - 100);
        } else {
            // Posy: 작은 꽃다발 여러개
            for (let i = 0; i < 3; i++) {
                const x = this.engine.width * (0.25 + i * 0.25);
                const y = this.engine.height * 0.5 + (Math.random() - 0.5) * 100;
                this.createRoundBouquet(x, y, 0.6);
            }
        }
    }

    createRoundBouquet(cx, cy, scale = 1) {
        const layers = 3;
        for (let layer = 0; layer < layers; layer++) {
            const count = 6 + layer * 4;
            const radius = (50 + layer * 40) * scale;

            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + layer * 0.2;
                const x = cx + Math.cos(angle) * radius;
                const y = cy + Math.sin(angle) * radius;

                this.bouquets.push({
                    x, y,
                    size: (25 - layer * 5) * scale,
                    angle: Math.random() * Math.PI * 2,
                    phase: Math.random() * Math.PI * 2,
                    color: this.engine.colors[i % this.engine.colors.length],
                    petalCount: 5 + Math.floor(Math.random() * 3)
                });
            }
        }
    }

    createCascadeBouquet(cx, cy) {
        // 위에서 아래로 흘러내리는 형태
        for (let i = 0; i < 25; i++) {
            const progress = i / 25;
            const spread = 50 + progress * 150;
            const x = cx + (Math.random() - 0.5) * spread;
            const y = cy + progress * 300;

            this.bouquets.push({
                x, y,
                size: 20 - progress * 8,
                angle: Math.random() * Math.PI * 2,
                phase: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length],
                petalCount: 5
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.01;

        // 리본/줄기 (중앙)
        if (this.style !== 2) {
            const cx = this.engine.width / 2;
            const cy = this.engine.height / 2 + 100;
            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[0], 0.3);
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx, cy + 150);
            ctx.stroke();
        }

        this.bouquets.forEach(f => {
            f.phase += 0.01;
            const sway = Math.sin(t + f.phase) * 3;

            ctx.save();
            ctx.translate(f.x + sway, f.y);
            ctx.rotate(f.angle + Math.sin(t + f.phase) * 0.05);

            ctx.shadowBlur = 15;
            ctx.shadowColor = f.color;

            // 꽃잎
            for (let i = 0; i < f.petalCount; i++) {
                const pAngle = (i / f.petalCount) * Math.PI * 2;
                ctx.save();
                ctx.rotate(pAngle);

                ctx.beginPath();
                ctx.ellipse(0, -f.size * 0.6, f.size * 0.3, f.size * 0.6, 0, 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(f.color, 0.8);
                ctx.fill();

                ctx.restore();
            }

            // 중심
            ctx.beginPath();
            ctx.arc(0, 0, f.size * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.restore();
        });
    }
}
