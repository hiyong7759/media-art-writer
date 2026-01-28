export class FlashMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        const ctx = this.engine.ctx;
        if (Math.random() > 0.98) {
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillRect(0, 0, this.engine.width, this.engine.height);
        }
    }
}
