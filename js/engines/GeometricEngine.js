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
        { name: 'Point', nameKo: '점', variants: ['Scatter', 'Grid', 'Orbit'] },
        { name: 'Line', nameKo: '선', variants: ['Connect', 'Flow', 'Web'] },
        { name: 'Poly', nameKo: '다각형', variants: ['Triangle', 'Hexagon', 'Voronoi'] },
        { name: 'Solid', nameKo: '입체', variants: ['Cube', 'Pyramid', 'Sphere'] },
        { name: 'Fractal', nameKo: '프랙탈', variants: ['Tree', 'Snowflake', 'Sierpinski'] },
        { name: 'Dim', nameKo: '차원', variants: ['Hypercube', 'Projection', 'Fold'] },
        { name: 'Chaos', nameKo: '혼돈', variants: ['Attractor', 'Noise', 'Glitch'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.modes = [
            new PointMode(this),
            new LineMode(this),
            new PolyMode(this),
            new SolidMode(this),
            new FractalMode(this),
            new DimMode(this),
            new ChaosMode(this)
        ];
        this.setMode(0, 0);
    }
}
