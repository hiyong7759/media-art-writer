export class MountainMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        const ctx = this.engine.ctx;
        // Triangle peaks
        ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[0], 0.05);
        ctx.beginPath();
        ctx.moveTo(0, this.engine.height);
        for (let i = 0; i < 5; i++) {
            const x = (this.engine.width / 4) * i;
            const y = this.engine.height - Math.random() * 300 - 100;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(this.engine.width, this.engine.height);
        ctx.fill();
    }
}
