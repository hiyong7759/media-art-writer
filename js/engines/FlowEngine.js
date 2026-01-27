import { ArtEngine } from './ArtEngine.js';

/**
 * Flow Engine (AQUA-5)
 * 떠오르는 물방울
 */
export class FlowEngine extends ArtEngine {
    // AQUA-5 스킬 정의
    static SKILLS = [
        { name: 'Drop', nameKo: '물방울', variants: ['Rain', 'Dew', 'Tear'] },
        { name: 'Ripple', nameKo: '파문', variants: ['Wave', 'Echo', 'Impact'] },
        { name: 'Tide', nameKo: '조류', variants: ['High', 'Low', 'Storm'] },
        { name: 'Bubble', nameKo: '거품', variants: ['Rising', 'Popping', 'Foam'] },
        { name: 'Deep', nameKo: '심해', variants: ['Abyss', 'Pressure', 'Glow'] },
        { name: 'Mist', nameKo: '안개', variants: ['Morning', 'Sea', 'Dense'] },
        { name: 'Ice', nameKo: '얼음', variants: ['Frost', 'Glacier', 'Crystal'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.bubbles = [];
        this.setMode(0, 0); // Default: Drop
    }

    // 새 표준 인터페이스
    setMode(modeIndex, variantIndex = 0) {
        super.setMode(modeIndex, variantIndex);
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 레거시 호환성
        const modeNames = ['rain', 'scanner', 'hud', 'data', 'circuit', 'sign', 'net'];
        this.mode = modeNames[modeIndex] || 'rain';

        console.log(`[FlowEngine] Mode: ${modeIndex} (${this.mode}), Variant: ${variantIndex}`);
        this.initBubbles();
    }

    initBubbles() {
        // Variants Logic
        // 0: Standard, 1: Slow/Dense, 2: Fast/Dynamic
        let count = 40;
        let speedMult = 1.0;
        let sizeMult = 1.0;

        if (this.currentVariant === 1) { // Variants like Dew, Echo, Low
            count = 60;
            speedMult = 0.5;
            sizeMult = 0.7;
        } else if (this.currentVariant === 2) { // Variants like Tear, Impact, Storm
            count = 50;
            speedMult = 2.0;
            sizeMult = 1.2;
        }

        this.bubbles = Array.from({ length: count }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: (Math.random() * 10 + 5) * sizeMult,
            speed: (Math.random() * 1.5 + 0.5) * speedMult,
            wobble: Math.random() * Math.PI * 2,
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }));
    }

    resize(width, height) {
        super.resize(width, height);
        this.setMode(this.currentMode, this.currentVariant);
    }

    draw() {
        this.ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.bubbles.forEach(b => {
            b.y -= b.speed;
            b.x += Math.sin(this.frame * 0.05 + b.wobble) * 0.5;

            if (b.y < -50) b.y = this.height + 50;

            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);

            // Variant Color Adjustment
            let color = b.color;
            if (this.currentVariant === 2) {
                // Brighter / More opaque for dynamic variant
                this.ctx.globalCompositeOperation = 'screen';
            } else {
                this.ctx.globalCompositeOperation = 'source-over';
            }

            this.ctx.fillStyle = this.hexToRgba(color, 0.6);
            this.ctx.fill();

            // Highlight
            this.ctx.beginPath();
            this.ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fill();
        });
        this.ctx.globalCompositeOperation = 'source-over';
    }
}
