import { ArtEngine } from './ArtEngine.js';
import { BeamMode } from './modes/refraction/BeamMode.js';
import { SpectrumMode } from './modes/refraction/SpectrumMode.js';
import { GlassMode } from './modes/refraction/GlassMode.js';
import { BokehMode } from './modes/refraction/BokehMode.js';
import { NeonMode } from './modes/refraction/NeonMode.js';
import { MirrorMode } from './modes/refraction/MirrorMode.js';
import { FlashMode } from './modes/refraction/FlashMode.js';

export class RefractionEngine extends ArtEngine {
    static SKILLS = [
        { name: 'Beam', nameKo: '광선', variants: ['Laser', 'Ray', 'Focus'] },
        { name: 'Spectrum', nameKo: '스펙트럼', variants: ['Rainbow', 'Prism', 'Split'] },
        { name: 'Glass', nameKo: '유리', variants: ['Shard', 'Pane', 'Frosted'] },
        { name: 'Bokeh', nameKo: '보케', variants: ['Circle', 'Hex', 'Star'] },
        { name: 'Neon', nameKo: '네온', variants: ['Glow', 'Sign', 'Flicker'] },
        { name: 'Mirror', nameKo: '거울', variants: ['Reflection', 'Distort', 'Infinite'] },
        { name: 'Flash', nameKo: '섬광', variants: ['Burst', 'Strobe', 'Flare'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);

        this.modes = [
            new BeamMode(this),
            new SpectrumMode(this),
            new GlassMode(this),
            new BokehMode(this),
            new NeonMode(this),
            new MirrorMode(this),
            new FlashMode(this)
        ];

        this.setMode(0, 0);
    }
}
