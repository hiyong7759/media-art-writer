export class PollenMode {
    constructor(engine) {
        this.engine = engine;
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
    }

    draw(item) {
        const ctx = this.engine.ctx;
        const r = item.size * 2;
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, this.engine.hexToRgba(item.color, 0.7));
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
    }

    update(item) {
        item.vx += (Math.random() - 0.5) * 0.1;
        item.vy += (Math.random() - 0.5) * 0.1;
        item.vx *= 0.96;
        item.vy *= 0.96;
        item.x += item.vx + Math.sin(this.engine.frame * 0.02) * 0.3;
        item.y += item.vy + Math.cos(this.engine.frame * 0.02) * 0.3;

        if (item.x < 0) item.x = this.engine.width;
        if (item.x > this.engine.width) item.x = 0;
        if (item.y < 0) item.y = this.engine.height;
        if (item.y > this.engine.height) item.y = 0;
    }
}
