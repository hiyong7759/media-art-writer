import { PulseMode } from './modes/wave/PulseMode.js';
import { WaveMode } from './modes/wave/WaveMode.js';
import { EQMode } from './modes/wave/EQMode.js';
import { NoiseMode } from './modes/wave/NoiseMode.js';
import { VoiceMode } from './modes/wave/VoiceMode.js';
import { StringMode } from './modes/wave/StringMode.js';
import { SilenceMode } from './modes/wave/SilenceMode.js';
import { ArtEngine } from './ArtEngine.js';

export class WaveEngine extends ArtEngine {
    static SKILLS = [
        { name: 'Wave', nameKo: '파동', variants: ['Sine', 'Square', 'Sawtooth'] }, // Swapped to be first
        { name: 'Pulse', nameKo: '맥박', variants: ['Rhythm', 'Heartbeat', 'Tempo'] },
        { name: 'EQ', nameKo: '이퀄라이저', variants: ['Digital', 'Analog', 'Spectrum'] },
        { name: 'Noise', nameKo: '노이즈', variants: ['White', 'Pink', 'Static'] },
        { name: 'Voice', nameKo: '목소리', variants: ['Echo', 'Chorus', 'Reverb'] },
        { name: 'String', nameKo: '현', variants: ['Vibration', 'Pluck', 'Resonance'] },
        { name: 'Silence', nameKo: '침묵', variants: ['Void', 'Quiet', 'Mute'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.modes = [
            new WaveMode(this),
            new PulseMode(this),
            new EQMode(this),
            new NoiseMode(this),
            new VoiceMode(this),
            new StringMode(this),
            new SilenceMode(this)
        ];
        this.setMode(0, 0);
    }
}
