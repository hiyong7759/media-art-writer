import { ArtEngine } from './ArtEngine.js';

/**
 * Refraction Engine (PRISM-2)
 * 빛 굴절
 */
export class RefractionEngine extends ArtEngine {
    // PRISM-2 스킬 정의
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
        this.beams = [];
        this.setMode(0, 0); // Default: Beam
    }

    // 새 표준 인터페이스
    setMode(modeIndex, variantIndex = 0) {
        super.setMode(modeIndex, variantIndex);
        this.ctx.clearRect(0, 0, this.width, this.height);

        const modeNames = ['rain', 'scanner', 'hud', 'data', 'circuit', 'sign', 'net'];
        this.mode = modeNames[modeIndex] || 'rain';

        console.log(`[RefractionEngine] Mode: ${modeIndex} (${this.mode}), Variant: ${variantIndex}`);
        this.initBeams();
    }

    initBeams() {
        let count = 20;
        let widthMult = 1.0;

        if (this.currentVariant === 1) { // Variant 1: Ray/Prism
            count = 40;
            widthMult = 0.5;
        } else if (this.currentVariant === 2) { // Variant 2: Focus/Split
            count = 10;
            widthMult = 2.0;
        }

        this.beams = Array.from({ length: count }, () => ({
            x: Math.random() * this.width,
            angle: Math.random() * Math.PI - Math.PI / 2,
            width: (Math.random() * 20 + 10) * widthMult,
            length: Math.random() * this.height * 0.6 + this.height * 0.4,
            speed: Math.random() * 0.01 + 0.005,
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }));
    }

    resize(width, height) {
        super.resize(width, height);
        this.setMode(this.currentMode, this.currentVariant);
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.beams.forEach(b => {
            b.angle += Math.sin(this.frame * 0.01) * 0.002;

            this.ctx.save();
            this.ctx.translate(b.x, this.height);
            this.ctx.rotate(b.angle);

            const grad = this.ctx.createLinearGradient(0, 0, 0, -b.length);

            // Mix color based on variant
            let color = b.color;

            grad.addColorStop(0, this.hexToRgba(color, 0));
            grad.addColorStop(0.5, this.hexToRgba(color, 0.8));
            grad.addColorStop(1, this.hexToRgba(color, 0));

            this.ctx.fillStyle = grad;
            this.ctx.fillRect(-b.width / 2, -b.length, b.width, b.length);

            this.ctx.restore();
        });
    }
}
