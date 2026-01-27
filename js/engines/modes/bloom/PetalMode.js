export class PetalMode {
    constructor(engine) {
        this.engine = engine;
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
    }

    draw(item) {
        const ctx = this.engine.ctx;
        ctx.beginPath();
        const s = item.size;
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-s, -s, 0, -s * 3);
        ctx.quadraticCurveTo(s * 0.5, -s * 1.5, 0, -s * 2.2);
        ctx.quadraticCurveTo(-s * 0.5, -s * 1.5, 0, -s * 3);
        ctx.quadraticCurveTo(s, -s, 0, 0);
        ctx.fillStyle = this.engine.hexToRgba(item.color, item.alpha);
        ctx.fill();
    }

    update(item) {
        item.angle += item.speed;
        item.x += Math.sin(this.engine.frame * item.sway) * 0.7;
        item.y += 1.2 + Math.cos(this.engine.frame * item.sway) * 0.4;
        if (item.y > this.engine.height + 50) {
            item.y = -50;
            item.x = Math.random() * this.engine.width;
        }
    }
}
