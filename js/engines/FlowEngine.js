import { ArtEngine } from './ArtEngine.js';
import { BubbleMode } from './modes/flow/BubbleMode.js';
import { DropMode } from './modes/flow/DropMode.js';
import { RippleMode } from './modes/flow/RippleMode.js';
import { TideMode } from './modes/flow/TideMode.js';
import { DeepMode } from './modes/flow/DeepMode.js';
import { MistMode } from './modes/flow/MistMode.js';
import { IceMode } from './modes/flow/IceMode.js';

export class FlowEngine extends ArtEngine {
    static SKILLS = [
        { name: 'Bubble', nameKo: '거품', variants: ['Rising', 'Popping', 'Foam'] },
        { name: 'Drop', nameKo: '물방울', variants: ['Rain', 'Dew', 'Tear'] },
        { name: 'Ripple', nameKo: '파문', variants: ['Wave', 'Echo', 'Impact'] },
        { name: 'Tide', nameKo: '조류', variants: ['High', 'Low', 'Storm'] },
        { name: 'Deep', nameKo: '심해', variants: ['Abyss', 'Pressure', 'Glow'] },
        { name: 'Mist', nameKo: '안개', variants: ['Morning', 'Sea', 'Dense'] },
        { name: 'Ice', nameKo: '얼음', variants: ['Frost', 'Glacier', 'Crystal'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);

        this.modes = [
            new BubbleMode(this),
            new DropMode(this),
            new RippleMode(this),
            new TideMode(this),
            new DeepMode(this),
            new MistMode(this),
            new IceMode(this)
        ];

        this.setMode(0, 0);
    }
}
