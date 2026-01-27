export class BeamMode {
    constructor(engine) {
        this.engine = engine;
        this.beams = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        let count = 20;
        let widthMult = 1.0;

        if (this.style === 1) { // Variant 1
            count = 40;
            widthMult = 0.5;
        } else if (this.style === 2) { // Variant 2
            count = 10;
            widthMult = 2.0;
        }

        this.beams = Array.from({ length: count }, () => ({
            x: Math.random() * this.engine.width,
            angle: Math.random() * Math.PI - Math.PI / 2,
            width: (Math.random() * 20 + 10) * widthMult,
            length: Math.random() * this.engine.height * 0.6 + this.engine.height * 0.4,
            speed: Math.random() * 0.01 + 0.005,
            color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
        }));
    }

    draw() {
        const ctx = this.engine.ctx;
        this.beams.forEach(b => {
            b.angle += Math.sin(this.engine.frame * 0.01) * 0.002;

            ctx.save();
            ctx.translate(b.x, this.engine.height);
            ctx.rotate(b.angle);

            const grad = ctx.createLinearGradient(0, 0, 0, -b.length);
            let color = b.color;
            grad.addColorStop(0, this.engine.hexToRgba(color, 0));
            grad.addColorStop(0.5, this.engine.hexToRgba(color, 0.8));
            grad.addColorStop(1, this.engine.hexToRgba(color, 0));

            ctx.fillStyle = grad;
            ctx.fillRect(-b.width / 2, -b.length, b.width, b.length);

            ctx.restore();
        });
    }
}
