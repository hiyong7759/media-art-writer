import { ArtEngine } from './ArtEngine.js';
import { BubbleMode } from './modes/flow/BubbleMode.js';

export class FlowEngine extends ArtEngine {
    static SKILLS = [
        { name: 'Drop', nameKo: '물방울', variants: ['Rain', 'Dew', 'Tear'] },
        { name: 'Ripple', nameKo: '파문', variants: ['Wave', 'Echo', 'Impact'] },
        { name: 'Tide', nameKo: '조류', variants: ['High', 'Low', 'Storm'] },
        { name: 'Bubble', nameKo: '거품', variants: ['Rising', 'Popping', 'Foam'] },
        { name: 'Deep', nameKo: '심해', variants: ['Abyss', 'Pressure', 'Glow'] },
        { name: 'Mist', nameKo: '안개', variants: ['Morning', 'Sea', 'Dense'] },
        { name: 'Ice', nameKo: '얼음', variants: ['Frost', 'Glacier', 'Crystal'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);

        this.bubbleMode = new BubbleMode(this);

        // FlowEngine shares one mode class for now
        this.modes = Array(7).fill(this.bubbleMode);

        this.setMode(0, 0);
    }
}
