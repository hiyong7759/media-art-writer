import { ArtEngine } from './ArtEngine.js';
import { ContourMode } from './modes/contour/ContourMode.js';

export class ContourEngine extends ArtEngine {
    static SKILLS = [
        { name: 'Map', nameKo: '지도', variants: ['Topo', 'Grid', 'Satellite'] },
        { name: 'Mountain', nameKo: '산맥', variants: ['Peak', 'Range', 'Valley'] },
        { name: 'River', nameKo: '강', variants: ['Flow', 'Delta', 'Meander'] },
        { name: 'Rock', nameKo: '암석', variants: ['Sediment', 'Igneous', 'Crystal'] },
        { name: 'Sand', nameKo: '모래', variants: ['Dune', 'Ripple', 'Grain'] },
        { name: 'Layer', nameKo: '지층', variants: ['Strata', 'Fault', 'Bedrock'] },
        { name: 'Core', nameKo: '중심', variants: ['Inner', 'Magma', 'Solid'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);

        this.contourMode = new ContourMode(this);
        this.modes = Array(7).fill(this.contourMode);

        this.setMode(0, 0);
    }
}
