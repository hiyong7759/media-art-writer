export class MirrorMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        const ctx = this.engine.ctx;
        // Symmetry line
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(this.engine.width / 2, 0);
        ctx.lineTo(this.engine.width / 2, this.engine.height);
        ctx.stroke();
    }
}
