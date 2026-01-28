import { ArtEngine } from './ArtEngine.js';
import { PointMode } from './modes/geometric/PointMode.js';
import { LineMode } from './modes/geometric/LineMode.js';
import { PolyMode } from './modes/geometric/PolyMode.js';
import { SolidMode } from './modes/geometric/SolidMode.js';
import { FractalMode } from './modes/geometric/FractalMode.js';
import { DimMode } from './modes/geometric/DimMode.js';
import { ChaosMode } from './modes/geometric/ChaosMode.js';

export class GeometricEngine extends ArtEngine {
    static SKILLS = [
        { name: 'Poly', nameKo: '다각형', variants: ['Shape', 'Hexagon', 'Voronoi'] },
        { name: 'Point', nameKo: '점', variants: ['Scatter', 'Grid', 'Orbit'] },
        { name: 'Line', nameKo: '선', variants: ['Connect', 'Flow', 'Web'] },
        { name: 'Solid', nameKo: '입체', variants: ['Cube', 'Pyramid', 'Sphere'] },
        { name: 'Fractal', nameKo: '프랙탈', variants: ['Tree', 'Snowflake', 'Sierpinski'] },
        { name: 'Dim', nameKo: '차원', variants: ['Hypercube', 'Projection', 'Fold'] },
        { name: 'Chaos', nameKo: '혼돈', variants: ['Attractor', 'Noise', 'Glitch'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.modes = [
            new PolyMode(this),
            new PointMode(this),
            new LineMode(this),
            new SolidMode(this),
            new FractalMode(this),
            new DimMode(this),
            new ChaosMode(this)
        ];
        this.setMode(0, 0);
    }

    drawBackground() {
        // Dim Projection (mode 5, variant 1)은 잔상 없이 깨끗하게
        if (this.currentMode === 5 && this.currentVariant === 1) {
            if (this.transparentMode) {
                // 배경 이미지 있을 때: 완전히 지우기
                this.ctx.clearRect(0, 0, this.width, this.height);
            } else {
                // 배경 이미지 없을 때: 어두운 배경
                this.ctx.fillStyle = 'rgba(10, 10, 15, 1)';
                this.ctx.fillRect(0, 0, this.width, this.height);
            }
        } else {
            super.drawBackground();
        }
    }
}
