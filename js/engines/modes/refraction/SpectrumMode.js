export class SpectrumMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        const ctx = this.engine.ctx;
        // Rainbow strip
        for (let i = 0; i < 7; i++) {
            ctx.fillStyle = `hsl(${i * 50}, 100%, 50%)`;
            ctx.fillRect(i * 50, 0, 50, this.engine.height);
        }
    }
}
