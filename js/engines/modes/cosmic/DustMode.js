export class DustMode {
    constructor(engine) {
        this.engine = engine;
        this.stars = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        let count = 100;
        let depthSpread = 2;
        if (this.style === 1) { // Stardust
            count = 300;
            depthSpread = 1;
        } else if (this.style === 2) { // Cluster
            count = 150;
            depthSpread = 0.5;
        }

        this.stars = Array.from({ length: count }, () => ({
            x: Math.random() * this.engine.width,
            y: Math.random() * this.engine.height,
            z: Math.random() * depthSpread + 0.1,
            size: Math.random() * 2 + 0.5
        }));
    }

    draw() {
        const ctx = this.engine.ctx;
        this.stars.forEach(s => {
            s.y += s.z;
            if (s.y > this.engine.height) s.y = 0;
            ctx.fillStyle = this.engine.colors[0];
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}
