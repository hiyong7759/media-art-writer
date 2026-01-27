import { ArtEngine } from './ArtEngine.js';
import { DustMode } from './modes/cosmic/DustMode.js';
import { OrbitMode } from './modes/cosmic/OrbitMode.js';
import { NovaMode } from './modes/cosmic/NovaMode.js';
import { VoidMode } from './modes/cosmic/VoidMode.js';
import { GalaxyMode } from './modes/cosmic/GalaxyMode.js';
import { QuasarMode } from './modes/cosmic/QuasarMode.js';
import { MultiMode } from './modes/cosmic/MultiMode.js';

export class CosmicEngine extends ArtEngine {
    static SKILLS = [
        { name: 'Dust', nameKo: '성운', variants: ['Nebula', 'Stardust', 'DarkMatter'] },
        { name: 'Orbit', nameKo: '궤도', variants: ['Planet', 'Comet', 'Asteroid'] },
        { name: 'Nova', nameKo: '초신성', variants: ['Explosion', 'Remnant', 'Pulsar'] },
        { name: 'Void', nameKo: '공허', variants: ['BlackHole', 'Wormhole', 'Abyss'] },
        { name: 'Galaxy', nameKo: '은하', variants: ['Spiral', 'Elliptical', 'Collision'] },
        { name: 'Quasar', nameKo: '퀘이사', variants: ['Beam', 'Radio', 'Active'] },
        { name: 'Multi', nameKo: '다중우주', variants: ['Bubble', 'String', 'Quantum'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.modes = [
            new DustMode(this),
            new OrbitMode(this),
            new NovaMode(this),
            new VoidMode(this),
            new GalaxyMode(this),
            new QuasarMode(this),
            new MultiMode(this)
        ];
        this.setMode(0, 0);
    }
}
