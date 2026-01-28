export class NeonMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        const ctx = this.engine.ctx;
        if (Math.random() > 0.8) {
            const x = Math.random() * this.engine.width;
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.engine.colors[1];
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.engine.height);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
}
