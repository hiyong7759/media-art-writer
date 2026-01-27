import { ArtEngine } from './ArtEngine.js';
import { WaveMode } from './modes/wave/WaveMode.js';

export class WaveEngine extends ArtEngine {
    static SKILLS = [
        { name: 'Pulse', nameKo: '맥박', variants: ['Rhythm', 'Heartbeat', 'Tempo'] },
        { name: 'Wave', nameKo: '파동', variants: ['Sine', 'Square', 'Sawtooth'] },
        { name: 'EQ', nameKo: '이퀄라이저', variants: ['Digital', 'Analog', 'Spectrum'] },
        { name: 'Noise', nameKo: '노이즈', variants: ['White', 'Pink', 'Static'] },
        { name: 'Voice', nameKo: '목소리', variants: ['Echo', 'Chorus', 'Reverb'] },
        { name: 'String', nameKo: '현', variants: ['Vibration', 'Pluck', 'Resonance'] },
        { name: 'Silence', nameKo: '침묵', variants: ['Void', 'Quiet', 'Mute'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);

        this.waveMode = new WaveMode(this);
        this.modes = Array(7).fill(this.waveMode);

        this.setMode(0, 0);
    }
}
