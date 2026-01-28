export class DeepMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        const ctx = this.engine.ctx;
        // Dark gradient + floating particles
        const grad = ctx.createLinearGradient(0, 0, 0, this.engine.height);
        grad.addColorStop(0, 'rgba(0,0,20,0)');
        grad.addColorStop(1, this.engine.hexToRgba(this.engine.colors[0], 0.5));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.engine.width, this.engine.height);
    }
}
