export class FractalMode {
    constructor(engine) {
        this.engine = engine;
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        if (this.style === 2) { // Snowflake
            this.drawKoch(cx - 150, cy + 80, cx + 150, cy + 80, 4);
            this.drawKoch(cx + 150, cy + 80, cx, cy - 180, 4);
            this.drawKoch(cx, cy - 180, cx - 150, cy + 80, 4);
        } else { // Mandelbrot/Fern
            this.drawTree(cx, this.engine.height, 120, -Math.PI / 2, 0);
        }
    }

    drawTree(x, y, len, angle, depth) {
        if (depth > (this.style === 0 ? 5 : 4)) return;
        const ex = x + Math.cos(angle) * len;
        const ey = y + Math.sin(angle) * len;
        const ctx = this.engine.ctx;

        ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[depth % this.engine.colors.length], 0.6);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        const spread = this.style === 0 ? 0.7 : 0.5;
        this.drawTree(ex, ey, len * 0.7, angle + spread + Math.sin(this.engine.frame * 0.02) * 0.1, depth + 1);
        this.drawTree(ex, ey, len * 0.7, angle - spread - Math.sin(this.engine.frame * 0.02) * 0.1, depth + 1);
    }

    drawKoch(x1, y1, x2, y2, depth) {
        if (depth === 0) {
            this.engine.ctx.beginPath();
            this.engine.ctx.moveTo(x1, y1);
            this.engine.ctx.lineTo(x2, y2);
            this.engine.ctx.strokeStyle = this.engine.colors[0];
            this.engine.ctx.stroke();
            return;
        }
        const dx = (x2 - x1) / 3, dy = (y2 - y1) / 3;
        const p1 = { x: x1 + dx, y: y1 + dy };
        const p3 = { x: x2 - dx, y: y2 - dy };
        const sin60 = Math.sin(Math.PI / 3);
        const cos60 = Math.cos(Math.PI / 3);
        const p2 = {
            x: p1.x + (p3.x - p1.x) * cos60 - (p3.y - p1.y) * sin60,
            y: p1.y + (p3.x - p1.x) * sin60 + (p3.y - p1.y) * cos60
        };
        this.drawKoch(x1, y1, p1.x, p1.y, depth - 1);
        this.drawKoch(p1.x, p1.y, p2.x, p2.y, depth - 1);
        this.drawKoch(p2.x, p2.y, p3.x, p3.y, depth - 1);
        this.drawKoch(p3.x, p3.y, x2, y2, depth - 1);
    }
}
