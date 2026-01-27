import { ArtEngine } from './ArtEngine.js';

/**
 * Contour Engine (TERRA-1)
 * 등고선
 */
export class ContourEngine extends ArtEngine {
    // TERRA-1 스킬 정의
    static SKILLS = [
        { name: 'Map', nameKo: '지도', variants: ['Topo', 'Grid', 'Satellite'] },
        { name: 'Mountain', nameKo: '산맥', variants: ['Peak', 'Range', 'Valley'] },
        { name: 'River', nameKo: '강', variants: ['Flow', 'Delta', 'Meander'] },
        { name: 'Rock', nameKo: '암석', variants: ['Sediment', 'Igneous', 'Crystal'] },
        { name: 'Sand', nameKo: '모래', variants: ['Dune', 'Ripple', 'Grain'] },
        { name: 'Layer', nameKo: '지층', variants: ['Strata', 'Fault', 'Bedrock'] },
        { name: 'Core', nameKo: '중심', variants: ['Inner', 'Magma', 'Solid'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.contours = [];
        this.setMode(0, 0); // Default: Map
    }

    // 새 표준 인터페이스
    setMode(modeIndex, variantIndex = 0) {
        super.setMode(modeIndex, variantIndex);
        this.ctx.clearRect(0, 0, this.width, this.height);

        const modeNames = ['rain', 'scanner', 'hud', 'data', 'circuit', 'sign', 'net'];
        this.mode = modeNames[modeIndex] || 'rain';

        console.log(`[ContourEngine] Mode: ${modeIndex} (${this.mode}), Variant: ${variantIndex}`);
        this.initContours();
    }

    initContours() {
        let count = 10;
        let speedMult = 1.0;

        if (this.currentVariant === 1) { // Variant 1: Grid/Range
            count = 20;
            speedMult = 0.5;
        } else if (this.currentVariant === 2) { // Variant 2: Satellite/Valley
            count = 5;
            speedMult = 2.0;
        }

        this.contours = Array.from({ length: count }, (_, i) => ({
            y: (this.height / count) * i,
            points: Array.from({ length: 20 }, () => Math.random() * 20 - 10),
            speed: (Math.random() * 0.02 + 0.01) * speedMult,
            color: this.colors[i % this.colors.length]
        }));
    }

    resize(width, height) {
        super.resize(width, height);
        this.setMode(this.currentMode, this.currentVariant);
    }

    draw() {
        this.ctx.fillStyle = 'rgba(20, 15, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.contours.forEach((c, i) => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.hexToRgba(c.color, 0.7);

            if (this.currentVariant === 1) {
                this.ctx.setLineDash([5, 5]); // Dashed line for Grid/Range
            } else {
                this.ctx.setLineDash([]);
            }

            this.ctx.lineWidth = 2;

            for (let x = 0; x <= this.width; x += 20) {
                const idx = Math.floor(x / (this.width / 20));
                const offset = c.points[idx % c.points.length] || 0;
                const nextOffset = c.points[(idx + 1) % c.points.length] || 0;
                const t = (x % (this.width / 20)) / (this.width / 20);
                const smoothOffset = offset * (1 - t) + nextOffset * t;

                const y = c.y + smoothOffset * 10 + Math.sin(this.frame * c.speed + i) * 15;
                if (x === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        });
    }
}
