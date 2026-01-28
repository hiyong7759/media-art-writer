export class PetalMode {
    constructor(engine) {
        this.engine = engine;
        this.petals = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.petals = [];

        const count = this.style === 1 ? 30 : 20; // Cherry는 더 많이

        for (let i = 0; i < count; i++) {
            this.petals.push(this.createPetal());
        }
    }

    createPetal() {
        const base = {
            x: Math.random() * this.engine.width,
            y: Math.random() * this.engine.height,
            angle: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.01,
            sway: Math.random() * 0.05,
            alpha: 0.7 + Math.random() * 0.3,
            color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
        };

        if (this.style === 0) {
            // Rose: 크고 풍성한 장미 꽃잎
            base.size = Math.random() * 15 + 8;
            base.fallSpeed = 1.2;
        } else if (this.style === 1) {
            // Cherry: 작고 가벼운 벚꽃잎
            base.size = Math.random() * 8 + 4;
            base.fallSpeed = 0.6;
            base.flutter = Math.random() * 0.1; // 펄럭임
        } else {
            // Lily: 길고 우아한 백합 꽃잎
            base.size = Math.random() * 12 + 10;
            base.elongation = 2.5 + Math.random() * 0.5;
            base.fallSpeed = 1.0;
        }

        return base;
    }

    draw() {
        const ctx = this.engine.ctx;

        this.petals.forEach(p => {
            // Update
            p.angle += p.speed;

            if (this.style === 1) {
                // Cherry: 더 많이 흔들리며 천천히
                p.x += Math.sin(this.engine.frame * p.sway) * 1.5 + Math.sin(this.engine.frame * p.flutter) * 0.5;
                p.y += p.fallSpeed + Math.cos(this.engine.frame * p.sway) * 0.3;
            } else {
                p.x += Math.sin(this.engine.frame * p.sway) * 0.7;
                p.y += p.fallSpeed + Math.cos(this.engine.frame * p.sway) * 0.4;
            }

            // Wrap
            if (p.y > this.engine.height + 50) {
                p.y = -50;
                p.x = Math.random() * this.engine.width;
            }
            if (p.x < -50) p.x = this.engine.width + 50;
            if (p.x > this.engine.width + 50) p.x = -50;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);

            if (this.style === 0) {
                this.drawRose(ctx, p);
            } else if (this.style === 1) {
                this.drawCherry(ctx, p);
            } else {
                this.drawLily(ctx, p);
            }

            ctx.restore();
        });
    }

    drawRose(ctx, p) {
        // 장미 꽃잎: 풍성하고 둥근 형태
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-s, -s, 0, -s * 3);
        ctx.quadraticCurveTo(s * 0.5, -s * 1.5, 0, -s * 2.2);
        ctx.quadraticCurveTo(-s * 0.5, -s * 1.5, 0, -s * 3);
        ctx.quadraticCurveTo(s, -s, 0, 0);

        ctx.fillStyle = this.engine.hexToRgba(p.color, p.alpha);
        ctx.fill();
    }

    drawCherry(ctx, p) {
        // 벚꽃잎: 작고 하트 모양에 가까움, 끝이 갈라짐
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        // 왼쪽 곡선
        ctx.quadraticCurveTo(-s * 0.8, 0, -s * 0.5, -s * 0.8);
        ctx.quadraticCurveTo(-s * 0.2, -s * 1.2, 0, -s * 1.0);
        // 오른쪽 곡선
        ctx.quadraticCurveTo(s * 0.2, -s * 1.2, s * 0.5, -s * 0.8);
        ctx.quadraticCurveTo(s * 0.8, 0, 0, s * 0.3);

        ctx.fillStyle = this.engine.hexToRgba(p.color, p.alpha);
        ctx.fill();

        // 끝부분 갈라짐 (벚꽃 특징)
        ctx.strokeStyle = this.engine.hexToRgba(p.color, p.alpha * 0.5);
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.9);
        ctx.lineTo(-s * 0.15, -s * 1.15);
        ctx.moveTo(0, -s * 0.9);
        ctx.lineTo(s * 0.15, -s * 1.15);
        ctx.stroke();
    }

    drawLily(ctx, p) {
        // 백합 꽃잎: 길고 뾰족하며 우아함
        const s = p.size;
        const len = s * p.elongation;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        // 좁고 긴 형태
        ctx.bezierCurveTo(
            -s * 0.3, -len * 0.2,
            -s * 0.4, -len * 0.5,
            -s * 0.15, -len * 0.85
        );
        ctx.quadraticCurveTo(0, -len, 0, -len);
        ctx.quadraticCurveTo(0, -len, s * 0.15, -len * 0.85);
        ctx.bezierCurveTo(
            s * 0.4, -len * 0.5,
            s * 0.3, -len * 0.2,
            0, 0
        );

        ctx.fillStyle = this.engine.hexToRgba(p.color, p.alpha);
        ctx.fill();

        // 중앙 맥 (백합 특징)
        ctx.strokeStyle = this.engine.hexToRgba('#ffffff', 0.2);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.3);
        ctx.lineTo(0, -len * 0.85);
        ctx.stroke();
    }
}
