import { ArtEngine } from './ArtEngine.js';
import { SeedMode } from './modes/organic/SeedMode.js';
import { WindMode } from './modes/organic/WindMode.js';
import { BloomMode } from './modes/organic/BloomMode.js';
import { FlowMode } from './modes/organic/FlowMode.js';
import { RootMode } from './modes/organic/RootMode.js';
import { PulseMode } from './modes/organic/PulseMode.js';
import { LifeMode } from './modes/organic/LifeMode.js';

export class OrganicEngine extends ArtEngine {
    static SKILLS = [
        { name: 'Flow', nameKo: '흐름', variants: ['DNA', 'Stream', 'Network'] },
        { name: 'Seed', nameKo: '씨앗', variants: ['Cell', 'Sprout', 'Egg'] },
        { name: 'Wind', nameKo: '바람', variants: ['Breeze', 'Gale', 'Pollen'] },
        { name: 'Bloom', nameKo: '개화', variants: ['Heart', 'Lotus', 'Orbital'] },
        { name: 'Root', nameKo: '뿌리', variants: ['Taproot', 'Fibrous', 'Rhizome'] },
        { name: 'Pulse', nameKo: '맥동', variants: ['Breath', 'Shockwave', 'Magnetic'] },
        { name: 'Life', nameKo: '생명', variants: ['Firefly', 'Butterfly', 'Spirit'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.modes = [
            new FlowMode(this),
            new SeedMode(this),
            new WindMode(this),
            new BloomMode(this),
            new RootMode(this),
            new PulseMode(this),
            new LifeMode(this)
        ];
        this.setMode(0, 2); // Network variant (index와 동일)
    }

    // Custom Background for Organic Theme
    drawBackground() {
        if (this.canvas && !this.transparentMode) {
            const t = this.frame * 0.1;
            const beat = Math.pow(Math.sin(t), 6) * 0.5 + 0.5;
            const alpha = 0.2 + beat * 0.3;
            const tintColor = this.colors[1] || this.colors[0];
            this.canvas.style.backgroundColor = this.hexToRgba(tintColor, alpha);
        }
        super.drawBackground();
    }
}
