export class CircuitMode {
    constructor(engine) {
        this.engine = engine;
        this.nodes = [];
        this.style = 0;
        this.color = '#ffffff';
    }

    init(variant = 0) {
        this.style = variant;
        console.log(`[CircuitMode] Style: ${['Logic', 'Overload', 'Organic'][this.style]}`);

        let gridSize = 60;
        if (this.style === 2) gridSize = 40;

        const count = 30;
        this.nodes = Array.from({ length: count }, () => ({
            x: Math.floor(Math.random() * (this.engine.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (this.engine.height / gridSize)) * gridSize,
            active: Math.random() > 0.5,
            head: false
        }));

        if (this.style === 1) this.color = '#ff5500';
        else if (this.style === 2) this.color = '#00ff55';
        else this.color = this.engine.colors[1];

        for (let i = 0; i < 5; i++) {
            if (this.nodes[i]) this.nodes[i].head = true;
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        ctx.lineWidth = this.style === 2 ? 3 : 6;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        let drawDelay = 4;
        if (this.style === 1) drawDelay = 2;
        if (this.style === 2) drawDelay = 6;

        if (this.engine.frame % drawDelay !== 0) return;

        if (this.nodes.length === 0) return;

        const headIdx = Math.floor(Math.random() * this.nodes.length);
        const node = this.nodes[headIdx];

        if (!node || !node.active) return;

        const dir = Math.floor(Math.random() * 4);
        let len = this.style === 2 ? 40 : 60;

        const prevX = node.x;
        const prevY = node.y;

        if (this.style === 1) {
            if (Math.random() > 0.5) {
                node.x += Math.random() > 0.5 ? len : -len;
                node.y += Math.random() > 0.5 ? len : -len;
            } else {
                if (dir === 0) node.x += len;
                else if (dir === 1) node.y += len;
                else if (dir === 2) node.x -= len;
                else node.y -= len;
            }
        } else {
            if (dir === 0) node.x += len;
            else if (dir === 1) node.y += len;
            else if (dir === 2) node.x -= len;
            else node.y -= len;
        }

        const w = this.engine.width;
        const h = this.engine.height;
        if (node.x > w) node.x = 0; if (node.x < 0) node.x = w;
        if (node.y > h) node.y = 0; if (node.y < 0) node.y = h;

        ctx.strokeStyle = this.engine.hexToRgba(this.color, 0.9);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        if (this.style === 0) ctx.fillRect(node.x - 6, node.y - 6, 12, 12);
        else {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }
}
