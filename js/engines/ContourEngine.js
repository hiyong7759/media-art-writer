import { ArtEngine } from './ArtEngine.js';
import { ContourMode } from './modes/contour/ContourMode.js';
import { MountainMode } from './modes/contour/MountainMode.js';
import { RiverMode } from './modes/contour/RiverMode.js';
import { RockMode } from './modes/contour/RockMode.js';
import { SandMode } from './modes/contour/SandMode.js';
import { LayerMode } from './modes/contour/LayerMode.js';
import { CoreMode } from './modes/contour/CoreMode.js';

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

        this.modes = [
            new ContourMode(this),
            new MountainMode(this),
            new RiverMode(this),
            new RockMode(this),
            new SandMode(this),
            new LayerMode(this),
            new CoreMode(this)
        ];

        this.setMode(0, 0);
    }
}
