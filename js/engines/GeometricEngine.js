import { ArtEngine } from './ArtEngine.js';

/**
 * Geometric Engine (KURO-X)
 * 기하학적 형태, 선, 회전 + 7 Modes (POINT, LINE, POLY, SOLID, FRACTAL, DIM, CHAOS)
 */
export class GeometricEngine extends ArtEngine {
    // KURO-X 스킬 정의
    static SKILLS = [
        { name: 'Point', nameKo: '점', variants: ['Star', 'Dust', 'Grid'] },
        { name: 'Line', nameKo: '선', variants: ['String', 'Connect', 'Ray'] },
        { name: 'Poly', nameKo: '다각형', variants: ['Shape', 'Voronoi', 'Hex'] },
        { name: 'Solid', nameKo: '입체', variants: ['Cube', 'Crystal', 'Platonic'] },
        { name: 'Fractal', nameKo: '프랙탈', variants: ['Tree', 'Fern', 'Snow'] },
        { name: 'Dim', nameKo: '차원', variants: ['Tesseract', 'Mirror', 'Wormhole'] },
        { name: 'Chaos', nameKo: '혼돈', variants: ['Attractor', 'Glitch', 'Entropy'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.shapes = [];
        this.points = [];
        this.lines = [];
        this.cubes = [];
        this.chaosP = { x: 0.1, y: 0.1, z: 0.1 };
        this.variant = 0; // 호환성 유지

        this.setMode(2, 0); // Default: Poly (Shape) matches HUD in viewer.js mapping (index 2)
    }


    // 새 표준 인터페이스
    setMode(modeIndex, variantIndex = 0) {
        super.setMode(modeIndex, variantIndex);
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 레거시 호환성
        const modeNames = ['point', 'line', 'poly', 'solid', 'fractal', 'dim', 'chaos'];
        this.mode = modeNames[modeIndex] || 'poly';
        this.variant = variantIndex;

        console.log(`[GeometricEngine] Mode: ${modeIndex} (${this.mode}), Variant: ${this.variant}`);

        if (modeIndex === 0) this.initPoint();
        else if (modeIndex === 1) this.initLine();
        else if (modeIndex === 2) this.initShapes();
        else if (modeIndex === 3) this.initSolid();
        else if (modeIndex === 4) this.initFractal();
        else if (modeIndex === 5) this.initDim();
        else if (modeIndex === 6) this.initChaos();
        else this.initShapes();
    }

    resize(width, height) {
        super.resize(width, height);
        this.setMode(this.currentMode, this.currentVariant);
    }


    draw() {
        // Deep background for Kuro-X
        if (this.transparentMode) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        } else {
            this.ctx.fillStyle = 'rgba(5, 5, 8, 0.1)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        switch (this.mode) {
            case 'point': this.drawPoint(); break;
            case 'line': this.drawLine(); break;
            case 'poly': this.drawPoly(); break;
            case 'solid': this.drawSolid(); break;
            case 'fractal': this.drawFractal(); break;
            case 'dim': this.drawDim(); break;
            case 'chaos': this.drawChaos(); break;
            default: this.drawPoly();
        }
    }

    // --- 1. POINT (Star, Dust, Grid) ---
    initPoint() {
        // Point variants: 0: Star, 1: Dust, 2: Grid
        const count = this.variant === 2 ? 100 : 200;
        this.points = Array.from({ length: count }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            z: Math.random() * 200,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }));
    }
    drawPoint() {
        this.points.forEach(p => {
            if (this.variant === 0) { // Star (Nebula)
                p.x += Math.sin(this.frame * 0.001 + p.z) * 0.2;
                p.y += Math.cos(this.frame * 0.001 + p.z) * 0.2;
            } else if (this.variant === 1) { // Dust (Random Noise)
                p.x += (Math.random() - 0.5) * 2;
                p.y += (Math.random() - 0.5) * 2;
            } else { // Grid
                // Handled in draw for static feel, but with pulse
            }

            if (p.x < 0) p.x = this.width; if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height; if (p.y > this.height) p.y = 0;

            const alpha = 0.3 + Math.sin(this.frame * 0.05 + p.z) * 0.4;
            this.ctx.fillStyle = this.hexToRgba(p.color, alpha);

            if (this.variant === 2) { // Grid override
                const gap = 40;
                const gx = Math.floor(p.x / gap) * gap;
                const gy = Math.floor(p.y / gap) * gap;
                this.ctx.fillRect(gx, gy, 2, 2);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    // --- 2. LINE (String, Connect, Ray) ---
    initLine() {
        // Line variants: 0: String, 1: Connect, 2: Ray
        this.initPoint(); // Use points for connections
    }
    drawLine() {
        this.ctx.lineWidth = 1;

        if (this.variant === 0) { // String (Vibrating lines)
            for (let i = 0; i < 20; i++) {
                const y = (this.height / 20) * i;
                this.ctx.beginPath();
                this.ctx.strokeStyle = this.hexToRgba(this.colors[i % this.colors.length], 0.3);
                this.ctx.moveTo(0, y);
                for (let x = 0; x < this.width; x += 10) {
                    const wave = Math.sin(x * 0.01 + this.frame * 0.1 + i) * 10;
                    this.ctx.lineTo(x, y + wave);
                }
                this.ctx.stroke();
            }
        } else if (this.variant === 1) { // Connect (Constellation)
            this.drawPoint(); // Draw points first
            this.ctx.strokeStyle = this.hexToRgba(this.colors[0], 0.2);
            for (let i = 0; i < this.points.length; i++) {
                for (let j = i + 1; j < this.points.length; j++) {
                    const d = Math.hypot(this.points[i].x - this.points[j].x, this.points[i].y - this.points[j].y);
                    if (d < 100) { // Increased distance for visibility
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.points[i].x, this.points[i].y);
                        this.ctx.lineTo(this.points[j].x, this.points[j].y);
                        this.ctx.stroke();
                    }
                }
            }
        } else { // Ray (Center Burst)
            const cx = this.width / 2;
            const cy = this.height / 2;
            for (let i = 0; i < 36; i++) {
                const angle = (i * 10) * Math.PI / 180 + this.frame * 0.01;
                const len = 200 + Math.sin(this.frame * 0.05 + i) * 100;
                this.ctx.beginPath();
                this.ctx.strokeStyle = this.hexToRgba(this.colors[i % this.colors.length], 0.4);
                this.ctx.moveTo(cx, cy);
                this.ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
                this.ctx.stroke();
            }
        }
    }

    // --- 3. POLY (Shape, Voronoi, Hex) ---
    initShapes() {
        // Poly variants: 0: Shape (Multy), 1: Voronoi, 2: Hex
        const density = this.variant === 1 ? 25 : (this.variant === 2 ? 18 : 8);
        this.shapes = Array.from({ length: density }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 40 + 20,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.03,
            sides: this.variant === 2 ? 6 : (Math.floor(Math.random() * 4) + 3), // 3~6 for Shape/Voronoi
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }));
    }
    drawPoly() {
        if (this.variant === 1) { // Voronoi approximation
            this.ctx.strokeStyle = this.hexToRgba(this.colors[1], 0.2);
            this.shapes.forEach(s => {
                s.x += Math.sin(this.frame * 0.01) * 0.2;
                s.y += Math.cos(this.frame * 0.01) * 0.2;
                // Simple cellular lines
                this.ctx.beginPath();
                this.shapes.forEach(target => {
                    const d = Math.hypot(s.x - target.x, s.y - target.y);
                    if (d < 100) {
                        this.ctx.moveTo(s.x, s.y);
                        this.ctx.lineTo(target.x, target.y);
                    }
                });
                this.ctx.stroke();
            });
            return;
        }

        this.shapes.forEach(s => {
            s.rotation += s.rotSpeed;
            s.x += Math.sin(this.frame * 0.01 + s.size) * 0.3;
            if (s.x < 0) s.x = this.width;
            if (s.x > this.width) s.x = 0;

            this.ctx.save();
            this.ctx.translate(s.x, s.y);
            this.ctx.rotate(s.rotation);
            this.ctx.strokeStyle = this.hexToRgba(s.color, 0.85);
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            for (let i = 0; i < s.sides; i++) {
                const angle = (i / s.sides) * Math.PI * 2;
                const x = Math.cos(angle) * s.size;
                const y = Math.sin(angle) * s.size;
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.closePath();
            this.ctx.stroke();

            // Light fill for Kuro-X
            this.ctx.fillStyle = this.hexToRgba(s.color, 0.05);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    // --- 4. SOLID (Cube, Crystal, Platonic) ---
    initSolid() {
        this.cubes = [{ x: this.width / 2, y: this.height / 2, size: 120, rx: 0, ry: 0 }];
    }
    drawSolid() {
        const cube = this.cubes[0];
        cube.rx += 0.015; cube.ry += 0.01;

        const nodes = this.variant === 2 ? [ // Platonic (Octahedron approx)
            [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]
        ] : [ // Cube
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];

        const project = (x, y, z) => {
            let x1 = x * Math.cos(cube.ry) - z * Math.sin(cube.ry);
            let z1 = z * Math.cos(cube.ry) + x * Math.sin(cube.ry);
            let y2 = y * Math.cos(cube.rx) - z1 * Math.sin(cube.rx);
            let z2 = z1 * Math.cos(cube.rx) + y * Math.sin(cube.rx);
            const scale = 400 / (400 + z2 * cube.size);
            return {
                x: cube.x + x1 * cube.size * scale,
                y: cube.y + y2 * cube.size * scale
            };
        };

        const pts = nodes.map(n => project(n[0], n[1], n[2]));

        this.ctx.strokeStyle = this.colors[0];
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        const edges = this.variant === 2 ? [
            [0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [4, 3], [3, 5], [5, 2]
        ] : [
            [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        edges.forEach(e => {
            this.ctx.moveTo(pts[e[0]].x, pts[e[0]].y);
            this.ctx.lineTo(pts[e[1]].x, pts[e[1]].y);
        });
        this.ctx.stroke();

        if (this.variant === 1) { // Crystal (Inner glow)
            this.ctx.fillStyle = this.hexToRgba(this.colors[1], 0.1);
            this.ctx.fill();
        }
    }

    // --- 5. FRACTAL (Mandelbrot, Fern, Snowflake) ---
    initFractal() { }
    drawFractal() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        if (this.variant === 2) { // Snowflake (Koch-like)
            this.drawKoch(cx - 150, cy + 80, cx + 150, cy + 80, 4);
            this.drawKoch(cx + 150, cy + 80, cx, cy - 180, 4);
            this.drawKoch(cx, cy - 180, cx - 150, cy + 80, 4);
        } else { // Mandelbrot/Fern approx (Recursive pattern)
            this.drawTree(cx, this.height, 120, -Math.PI / 2, 0);
        }
    }
    drawTree(x, y, len, angle, depth) {
        if (depth > (this.variant === 0 ? 5 : 4)) return;
        const ex = x + Math.cos(angle) * len;
        const ey = y + Math.sin(angle) * len;
        this.ctx.strokeStyle = this.hexToRgba(this.colors[depth % this.colors.length], 0.6);
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(ex, ey);
        this.ctx.stroke();
        const spread = this.variant === 0 ? 0.7 : 0.5;
        this.drawTree(ex, ey, len * 0.7, angle + spread + Math.sin(this.frame * 0.02) * 0.1, depth + 1);
        this.drawTree(ex, ey, len * 0.7, angle - spread - Math.sin(this.frame * 0.02) * 0.1, depth + 1);
    }
    drawKoch(x1, y1, x2, y2, depth) {
        if (depth === 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = this.colors[0];
            this.ctx.stroke();
            return;
        }
        const dx = (x2 - x1) / 3, dy = (y2 - y1) / 3;
        const p1 = { x: x1 + dx, y: y1 + dy };
        const p3 = { x: x2 - dx, y: y2 - dy };
        const sin60 = Math.sin(Math.PI / 3);
        const cos60 = Math.cos(Math.PI / 3);
        const p2 = {
            x: p1.x + (p3.x - p1.x) * cos60 - (p3.y - p1.y) * sin60,
            y: p1.y + (p3.x - p1.x) * sin60 + (p3.y - p1.y) * cos60
        };
        this.drawKoch(x1, y1, p1.x, p1.y, depth - 1);
        this.drawKoch(p1.x, p1.y, p2.x, p2.y, depth - 1);
        this.drawKoch(p2.x, p2.y, p3.x, p3.y, depth - 1);
        this.drawKoch(p3.x, p3.y, x2, y2, depth - 1);
    }

    // --- 6. DIM (Tesseract, Mirror, Wormhole) ---
    initDim() { }
    drawDim() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        if (this.variant === 1) { // Mirror (Kaleidoscope)
            this.ctx.save();
            this.ctx.translate(cx, cy);
            for (let i = 0; i < 8; i++) {
                this.ctx.rotate(Math.PI / 4);
                this.drawPoly(); // Draw base shapes mirrored
            }
            this.ctx.restore();
        } else if (this.variant === 2) { // Wormhole
            for (let i = 0; i < 15; i++) {
                const t = (this.frame * 0.02 + i * 0.5) % 8;
                const r = Math.pow(1.5, t) * 10;
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
                this.ctx.strokeStyle = this.hexToRgba(this.colors[i % 4], 0.3 * (1 - t / 8));
                this.ctx.stroke();
            }
        } else { // Tesseract (4D projection)
            this.drawSolid(); // Reuse solid but with double layering
            this.ctx.save();
            this.ctx.scale(0.5, 0.5);
            this.drawSolid();
            this.ctx.restore();
        }
    }

    // --- 7. CHAOS (Attractor, Glitch, Entropy) ---
    initChaos() {
        this.chaosP = { x: 0.1, y: 0.1, z: 0.1 };
    }
    drawChaos() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        if (this.variant === 1) { // Glitch
            this.drawPoly(); // Base
            if (Math.random() > 0.9) {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                const w = Math.random() * 100;
                const h = Math.random() * 5;
                this.ctx.fillStyle = this.hexToRgba(this.colors[0], 0.6);
                this.ctx.fillRect(x, y, w, h);
                this.ctx.drawImage(this.canvas, x, y, w, h, x + (Math.random() - 0.5) * 40, y, w, h);
            }
        } else if (this.variant === 2) { // Entropy (Diffusion)
            this.initPoint(); // Keep points moving
            this.drawPoint();
        } else { // Attractor (Lorenz)
            const dt = 0.01;
            const sigma = 10, rho = 28, beta = 8 / 3;
            let { x, y, z } = this.chaosP;
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.hexToRgba(this.colors[0], 0.6);
            this.ctx.moveTo(cx + x * 10, cy + y * 10);
            for (let i = 0; i < 40; i++) {
                let dx = sigma * (y - x);
                let dy = x * (rho - z) - y;
                let dz = x * y - beta * z;
                x += dx * dt; y += dy * dt; z += dz * dt;
                this.ctx.lineTo(cx + x * 12, cy + y * 12);
            }
            this.ctx.stroke();
            this.chaosP = { x, y, z };
        }
    }
}
