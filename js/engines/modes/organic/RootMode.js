export class RootMode {
    constructor(engine) {
        this.engine = engine;
        this.roots = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.roots = [];
        this.seedRoots();
    }

    seedRoots() {
        const w = this.engine.width;
        const h = this.engine.height;

        let count = 5;
        if (this.style === 1) count = 12; // Fibrous
        if (this.style === 2) count = 4;  // Rhizome

        for (let i = 0; i < count; i++) {
            let x, y, angle;

            if (this.style === 0) {
                // Taproot: 화면 중앙 하단에서 위로
                x = w / 2 + (Math.random() - 0.5) * 150;
                y = h * 0.75; // 75% 지점에서 시작 (위로 올림)
                angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
            } else if (this.style === 1) {
                // Fibrous: 화면 중앙에서 사방으로
                x = w / 2 + (Math.random() - 0.5) * 100;
                y = h * 0.6; // 60% 지점
                angle = Math.random() * Math.PI * 2;
            } else {
                // Rhizome: 양쪽에서 가로로
                x = (i % 2 === 0) ? w * 0.1 : w * 0.9;
                y = h * 0.5 + (Math.random() - 0.5) * 200;
                angle = (i % 2 === 0) ? 0 : Math.PI;
            }

            this.roots.push({
                x, y,
                angle: angle + (Math.random() - 0.5) * 0.3,
                points: [{ x, y }],
                life: 150 + Math.random() * 100,
                active: true,
                width: (this.style === 0) ? 6 : 3,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;

        // Grow
        this.roots.forEach(r => {
            if (r.active) {
                // 성장 속도 증가
                const speed = this.style === 1 ? 2.5 : 3;
                r.x += Math.cos(r.angle) * speed;
                r.y += Math.sin(r.angle) * speed;

                // Wiggle
                r.angle += (Math.random() - 0.5) * 0.15;

                r.points.push({ x: r.x, y: r.y });
                r.life--;

                // Branching (더 자주)
                if (Math.random() < 0.03 && r.width > 1) {
                    this.roots.push({
                        x: r.x, y: r.y,
                        angle: r.angle + (Math.random() - 0.5) * 1.2,
                        points: [{ x: r.x, y: r.y }],
                        life: r.life * 0.7,
                        active: true,
                        width: r.width * 0.6,
                        color: r.color
                    });
                }

                if (r.life <= 0) r.active = false;
            }

            // Draw with glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = r.color;
            ctx.beginPath();
            ctx.strokeStyle = r.color;
            ctx.lineWidth = r.width;
            ctx.lineCap = 'round';
            ctx.moveTo(r.points[0].x, r.points[0].y);
            r.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // Auto-reseeding
        if (this.roots.every(r => !r.active) && Math.random() < 0.02) {
            this.init(this.style);
        }
    }
}
