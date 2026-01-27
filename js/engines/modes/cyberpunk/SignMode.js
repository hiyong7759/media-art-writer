export class SignMode {
    constructor(engine) {
        this.engine = engine;
        this.points = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        console.log(`[SignMode] Style: ${['Sine', 'Noise', 'Pulse'][this.style]}`);

        this.points = [];
        const segments = 100;
        for (let i = 0; i <= segments; i++) {
            this.points.push({
                x: (this.engine.width / segments) * i,
                y: this.engine.height / 2
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[0], 0.8);
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.engine.colors[0];

        ctx.beginPath();

        const speed = this.engine.frame * 0.1;
        const amplitude = this.engine.height * 0.2;

        if (this.style === 0) {
            for (let i = 0; i < this.points.length; i++) {
                const p = this.points[i];
                const y = this.engine.height / 2 +
                    Math.sin(i * 0.1 + speed) * amplitude +
                    Math.sin(i * 0.05 - speed * 0.5) * (amplitude * 0.5);

                if (i === 0) ctx.moveTo(p.x, y);
                else ctx.lineTo(p.x, y);
            }
        }
        else if (this.style === 1) {
            ctx.lineWidth = 2;
            for (let i = 0; i < this.points.length; i++) {
                const p = this.points[i];
                let noise = (Math.random() - 0.5) * amplitude * 1.5;
                if (Math.sin(i * 0.2 + speed) > 0.5) noise *= 2;
                else noise *= 0.1;

                const y = this.engine.height / 2 + noise;
                if (i === 0) ctx.moveTo(p.x, y);
                else ctx.lineTo(p.x, y);
            }
        }
        else {
            ctx.lineWidth = 4;
            for (let i = 0; i < this.points.length; i++) {
                const p = this.points[i];
                const t = i + speed * 10;
                let yVal = Math.sin(t * 0.2) > 0 ? 1 : -1;
                if (Math.sin(t * 0.05) > 0.8) yVal = 0;

                const y = this.engine.height / 2 + yVal * amplitude * 0.8;

                if (i === 0) ctx.moveTo(p.x, y);
                else {
                    ctx.lineTo(p.x, this.points[i - 1].y);
                    ctx.lineTo(p.x, y);
                }
                this.points[i].y = y;
            }
        }

        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(0, this.engine.height / 2);
        ctx.lineTo(this.engine.width, this.engine.height / 2);
        ctx.stroke();
    }
}
