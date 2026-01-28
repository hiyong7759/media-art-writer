import { ArtEngine } from './ArtEngine.js';
import { PetalMode } from './modes/bloom/PetalMode.js';
import { PollenMode } from './modes/bloom/PollenMode.js';
import { VineMode } from './modes/bloom/VineMode.js';
import { BloomMode } from './modes/bloom/BloomMode.js';
import { BouquetMode } from './modes/bloom/BouquetMode.js';
import { GardenMode } from './modes/bloom/GardenMode.js';
import { DryMode } from './modes/bloom/DryMode.js';

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

        // Mode instances - each mode has unique visual style
        this.petalMode = new PetalMode(this);
        this.bloomMode = new BloomMode(this);
        this.bouquetMode = new BouquetMode(this);
        this.vineMode = new VineMode(this);
        this.pollenMode = new PollenMode(this);
        this.gardenMode = new GardenMode(this);
        this.dryMode = new DryMode(this);

        this.modes = [
            this.petalMode,   // Petal: 꽃잎이 흩날리는 효과
            this.bloomMode,   // Bloom: 꽃이 피어나는 효과
            this.bouquetMode, // Bouquet: 꽃다발 효과
            this.vineMode,    // Vine: 덩굴 성장 효과
            this.pollenMode,  // Pollen: 꽃가루 효과
            this.gardenMode,  // Garden: 정원 효과
            this.dryMode      // Dry: 드라이플라워 효과
        ];

        this.setMode(0, 0);
    }

    // 잔상 없이 투명하게 지우기 (배경 이미지 보이게)
    drawBackground() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}
