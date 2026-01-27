export class VineMode {
    constructor(engine) {
        this.engine = engine;
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
    }

    draw(item) {
        // Vine needs context restore first if transformed outside
        // But Strategy pattern calls draw(item) inside save/restore block of engine?
        // Let's assume engine handles transforms for item position, but vine needs special handling
        // because it draws a path in world space, not local.
        // Actually, previous code restored context, then drove vine.
        // We will Handle it by resetting transform in draw if needed or just drawing simple local segments
        // The original code: restore(), then drawVine(item).
        // Here we should probably not use item transforms for Vine since it's a fixed path?
        // Or updated item points are world coordinates.
        // Let's just draw in local space? No, points are world space (nx = last.x + ...).
        // So we need to reset transform.

        this.engine.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

        if (!item.points || item.points.length < 2) return;
        const ctx = this.engine.ctx;
        ctx.beginPath();
        ctx.moveTo(item.points[0].x, item.points[0].y);
        item.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = this.engine.hexToRgba(item.color, 0.6);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    update(item) {
        if (item.points.length < item.maxLength) {
            const last = item.points[item.points.length - 1];
            item.angle += (Math.random() - 0.5) * 0.4;
            const nx = last.x + Math.cos(item.angle) * 3;
            const ny = last.y + Math.sin(item.angle) * 3;
            item.points.push({ x: nx, y: ny });
        } else if (Math.random() > 0.99) {
            // Re-spawn handled by engine or here?
            // Engine's createItem is needed. Wrapper can helper.
            // For now just reset points
            item.points = [{ x: Math.random() * this.engine.width, y: Math.random() * this.engine.height }];
            item.maxLength = 100 + Math.random() * 100;
        }
    }
}
