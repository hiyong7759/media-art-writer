export class SandMode {
    constructor(engine) { this.engine = engine; }
    init() { }
    draw() {
        const ctx = this.engine.ctx;
        // Noise texture
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.engine.width;
            const y = Math.random() * this.engine.height;
            ctx.fillStyle = this.engine.colors[2];
            ctx.fillRect(x, y, 1, 1);
        }
    }
}
