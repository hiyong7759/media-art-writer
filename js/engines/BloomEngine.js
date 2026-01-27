import { ArtEngine } from './ArtEngine.js';
import { PetalMode } from './modes/bloom/PetalMode.js';
import { PollenMode } from './modes/bloom/PollenMode.js';
import { VineMode } from './modes/bloom/VineMode.js';

export class BloomEngine extends ArtEngine {
    static SKILLS = [
        { name: 'Petal', nameKo: '꽃잎', variants: ['Rose', 'Cherry', 'Lily'] },
        { name: 'Bloom', nameKo: '개화', variants: ['Full', 'Bud', 'Wild'] },
        { name: 'Bouquet', nameKo: '꽃다발', variants: ['Round', 'Cascade', 'Posy'] },
        { name: 'Vine', nameKo: '덩굴', variants: ['Ivy', 'Thorn', 'Creeper'] },
        { name: 'Pollen', nameKo: '꽃가루', variants: ['Dust', 'Sparkle', 'Scent'] },
        { name: 'Garden', nameKo: '정원', variants: ['Secret', 'Zen', 'Maze'] },
        { name: 'Dry', nameKo: '건조', variants: ['Pressed', 'Withered', 'Vintage'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);

        // Mode instances - reusing classes for similar modes
        this.petalMode = new PetalMode(this);
        this.pollenMode = new PollenMode(this);
        this.vineMode = new VineMode(this);

        this.modes = [
            this.petalMode, // Petal
            this.petalMode, // Bloom
            this.petalMode, // Bouquet
            this.vineMode,  // Vine
            this.pollenMode,// Pollen
            this.petalMode, // Garden
            this.petalMode  // Dry
        ];

        this.setMode(0, 0);
    }
}
