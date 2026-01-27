import { PolyMode } from './PolyMode.js';
import { SolidMode } from './SolidMode.js';

export class DimMode {
    constructor(engine) {
        this.engine = engine;
        this.style = 0;
        this.polyMode = new PolyMode(engine);
        this.solidMode = new SolidMode(engine);
    }

    init(variant = 0) {
        this.style = variant;
        // Init helpers appropriately
        this.polyMode.init(0); // Variant doesn't strictly matter for mirror base but keeping clean
        this.solidMode.init(0);
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        if (this.style === 1) { // Mirror
            ctx.save();
            ctx.translate(cx, cy);
            for (let i = 0; i < 8; i++) {
                ctx.rotate(Math.PI / 4);
                this.polyMode.draw(); // Reuse Poly draw logic
            }
            ctx.restore();
        } else if (this.style === 2) { // Wormhole
            for (let i = 0; i < 15; i++) {
                const t = (this.engine.frame * 0.02 + i * 0.5) % 8;
                const r = Math.pow(1.5, t) * 10;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[i % 4], 0.3 * (1 - t / 8));
                ctx.stroke();
            }
        } else { // Tesseract
            this.solidMode.draw();
            ctx.save();
            ctx.scale(0.5, 0.5);
            // Re-center for scaled draw if necessary, though solidMode centers itself usually.
            // Since SolidMode uses engine width/height/2, scaling context scales the offset too?
            // Wait, SolidMode uses absolute coords (width/2).
            // ctx.scale(0.5, 0.5) will shift (w/2, h/2) to (w/4, h/4).
            // We need to translate to center, scale, translate back.
            ctx.translate(cx, cy);
            ctx.scale(0.5, 0.5);
            ctx.translate(-cx, -cy);
            this.solidMode.draw();
            ctx.restore();
        }
    }
}
