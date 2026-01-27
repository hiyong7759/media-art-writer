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
            // Simplified custom flash logic
            let bgOverlayColor = 'rgba(0, 0, 0, 0.2)';
            if (Math.random() > 0.99 && ['rain', 'scanner', 'data'].includes(this.getSkills()[this.currentMode]?.name.toLowerCase())) {
                const flashColor = this.colors[0];
                bgOverlayColor = this.hexToRgba(flashColor, 0.15);
            } else {
                bgOverlayColor = 'rgba(0, 0, 0, 0.05)';
            }
            this.ctx.fillStyle = bgOverlayColor;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else {
            // Specific opaque bg
            this.ctx.fillStyle = (this.currentMode === 4) ? 'rgba(10, 10, 15, 0.02)' : 'rgba(10, 10, 15, 0.2)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
}
