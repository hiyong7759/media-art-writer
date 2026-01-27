import { PointMode } from './PointMode.js';
import { PolyMode } from './PolyMode.js';

export class ChaosMode {
    constructor(engine) {
        this.engine = engine;
        this.chaosP = { x: 0.1, y: 0.1, z: 0.1 };
        this.style = 0;
        this.pointMode = new PointMode(engine);
        this.polyMode = new PolyMode(engine);
    }

    init(variant = 0) {
        this.style = variant;
        this.chaosP = { x: 0.1, y: 0.1, z: 0.1 };
        this.pointMode.init(1); // Dust
        this.polyMode.init(0);  // Shape
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        if (this.style === 1) { // Glitch
            this.polyMode.draw();
            if (Math.random() > 0.9) {
                const x = Math.random() * this.engine.width;
                const y = Math.random() * this.engine.height;
                const w = Math.random() * 100;
                const h = Math.random() * 5;
                ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[0], 0.6);
                ctx.fillRect(x, y, w, h);
                // Canvas read-back is heavy, maybe skip drawImage or use simple rect 
                // Using simple rect for performance/simplicity in this refactor
                ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[1], 0.3);
                ctx.fillRect(x + (Math.random() - 0.5) * 40, y, w, h);
            }
        } else if (this.style === 2) { // Entropy
            this.pointMode.draw();
        } else { // Attractor
            const dt = 0.01;
            const sigma = 10, rho = 28, beta = 8 / 3;
            let { x, y, z } = this.chaosP;
            ctx.beginPath();
            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[0], 0.6);
            ctx.moveTo(cx + x * 10, cy + y * 10);
            for (let i = 0; i < 40; i++) {
                let dx = sigma * (y - x);
                let dy = x * (rho - z) - y;
                let dz = x * y - beta * z;
                x += dx * dt; y += dy * dt; z += dz * dt;
                ctx.lineTo(cx + x * 12, cy + y * 12);
            }
            ctx.stroke();
            this.chaosP = { x, y, z };
        }
    }
}
