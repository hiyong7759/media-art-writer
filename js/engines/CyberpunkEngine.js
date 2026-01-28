import { ArtEngine } from './ArtEngine.js';
import { RainMode } from './modes/cyberpunk/RainMode.js';
import { ScannerMode } from './modes/cyberpunk/ScannerMode.js';
import { HUDMode } from './modes/cyberpunk/HUDMode.js';
import { DataMode } from './modes/cyberpunk/DataMode.js';
import { CircuitMode } from './modes/cyberpunk/CircuitMode.js';
import { SignMode } from './modes/cyberpunk/SignMode.js';
import { NetMode } from './modes/cyberpunk/NetMode.js';

export class CyberpunkEngine extends ArtEngine {
    static SKILLS = [
        { name: 'Rain', nameKo: '디지털 비', variants: ['Modern', 'Binary', 'Storm'] },
        { name: 'Scanner', nameKo: '스캔', variants: ['Horizontal', 'Vertical', 'Quantum'] },
        { name: 'HUD', nameKo: '인터페이스', variants: ['Brackets', 'Circle', 'Box'] },
        { name: 'Data', nameKo: '데이터', variants: ['Vertical', 'Horizontal', 'Scattered'] },
        { name: 'Circuit', nameKo: '회로', variants: ['Logic', 'Overload', 'Organic'] },
        { name: 'Sign', nameKo: '신호', variants: ['Sine', 'Noise', 'Pulse'] },
        { name: 'Net', nameKo: '네트워크', variants: ['Grid', 'Terrain', 'Warp'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.modes = [
            new RainMode(this),
            new ScannerMode(this),
            new HUDMode(this),
            new DataMode(this),
            new CircuitMode(this),
            new SignMode(this),
            new NetMode(this)
        ];
        this.setMode(0, 0);
    }

    drawBackground() {
        if (this.transparentMode) {
            // 배경 이미지가 있을 때: 검정색 대신 기존 그림만 페이드 아웃
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();

            // 번쩍이는 효과 (색상 플래시) - 유지
            if (Math.random() > 0.99 && ['rain', 'scanner', 'data'].includes(this.getSkills()[this.currentMode]?.name.toLowerCase())) {
                const flashColor = this.colors[0];
                this.ctx.fillStyle = this.hexToRgba(flashColor, 0.12);
                this.ctx.fillRect(0, 0, this.width, this.height);
            }
        } else {
            // 배경 이미지 없을 때: 기존 로직
            this.ctx.fillStyle = (this.currentMode === 4) ? 'rgba(10, 10, 15, 0.02)' : 'rgba(10, 10, 15, 0.2)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
}
