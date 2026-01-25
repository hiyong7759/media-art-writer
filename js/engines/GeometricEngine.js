import { ArtEngine } from './ArtEngine.js';

/**
 * Geometric Engine (KURO-X)
 * 기하학적 형태, 선, 회전
 */
export class GeometricEngine extends ArtEngine {
    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.mode = 'rain'; // Point
        this.shapes = [];
        this.initPoint();
    }

    setMode(mode) {
        this.mode = mode;
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (mode === 'rain') this.initPoint();      // POINT
        else if (mode === 'scanner') this.initLine();   // LINE
        else if (mode === 'hud') this.initPoly();       // POLY
        else if (mode === 'data') this.initSolid();     // SOLID
        else if (mode === 'circuit') this.initFractal();// FRACTAL
        else if (mode === 'sign') this.initDim();       // DIMENSION
        else if (mode === 'net') this.initChaos();      // CHAOS
        else this.initPoint();
    }

    draw() {
        // Transparent Check for Kuro-X (Needs high visibility)
        if (this.transparentMode) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        } else {
            this.ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        switch (this.mode) {
            case 'rain': this.drawPoint(); break;
            case 'scanner': this.drawLine(); break;
            case 'hud': this.drawPoly(); break;
            case 'data': this.drawSolid(); break;
            case 'circuit': this.drawFractal(); break;
            case 'sign': this.drawDim(); break;
            case 'net': this.drawChaos(); break;
            default: this.drawPoint();
        }
    }

    getStyle(salt) {
        if (!this.data || !this.data.prompt) return 0;
        return (this.data.prompt.length + salt) % 3;
    }

    // 1. POINT (Rain) - Star/Grid
    initPoint() {
        this.points = Array.from({ length: 100 }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 2,
            blink: Math.random() * 0.1
        }));
    }
    drawPoint() {
        this.points.forEach(p => {
            if (Math.random() > 0.99) p.x = Math.random() * this.width; // Teleport

            const alpha = 0.5 + Math.sin(this.frame * p.blink) * 0.5;
            this.ctx.fillStyle = this.hexToRgba(this.colors[0], alpha);
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });

        // Grid overlay
        this.ctx.fillStyle = this.hexToRgba(this.colors[1], 0.3);
        const gap = 50;
        for (let x = 0; x < this.width; x += gap) this.ctx.fillRect(x, 0, 1, this.height);
        for (let y = 0; y < this.height; y += gap) this.ctx.fillRect(0, y, this.width, 1);
    }

    // 2. LINE (Scanner) - String Art
    initLine() {
        this.lineStyle = this.getStyle(2);
        this.lines = []; // Procedural
    }
    drawLine() {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const r = Math.min(this.width, this.height) * 0.4;

        this.ctx.strokeStyle = this.hexToRgba(this.colors[1], 0.2);
        this.ctx.lineWidth = 1;

        const count = 30;
        const step = this.frame * 0.01;

        this.ctx.beginPath();
        for (let i = 0; i < count; i++) {
            const a1 = (i / count) * Math.PI * 2 + step;
            // Variant logic for connection index
            const multiplier = (this.lineStyle === 0) ? 2 : (this.lineStyle === 1 ? 3 : 1.5);
            const a2 = ((i * multiplier) / count) * Math.PI * 2 - step;

            const x1 = cx + Math.cos(a1) * r;
            const y1 = cy + Math.sin(a1) * r;
            const x2 = cx + Math.cos(a2) * r;
            const y2 = cy + Math.sin(a2) * r;

            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
        }
        this.ctx.stroke();
    }

    // 3. POLY (HUD) - Triangle / Voronoi
    initPoly() {
        this.polys = [];
        const size = 100;
        for (let x = 0; x < this.width + size; x += size) {
            for (let y = 0; y < this.height + size; y += size) {
                this.polys.push({
                    x: x, y: y,
                    offX: (Math.random() - 0.5) * 50,
                    offY: (Math.random() - 0.5) * 50
                });
            }
        }
    }
    drawPoly() {
        this.ctx.strokeStyle = this.hexToRgba(this.colors[2], 0.3);
        this.ctx.beginPath();
        this.polys.forEach((p, i) => {
            // Simple triangulation grid
            if (i % 10 === 0) return; // Skip edges for variety
            const dx = Math.sin(this.frame * 0.01 + p.x) * 20;
            const dy = Math.cos(this.frame * 0.01 + p.y) * 20;

            this.ctx.moveTo(p.x + dx, p.y + dy);
            this.ctx.lineTo(p.x + dx + 100, p.y + dy);
            this.ctx.lineTo(p.x + dx + 50, p.y + dy + 86); // Equilateral
            this.ctx.lineTo(p.x + dx, p.y + dy);
        });
        this.ctx.stroke();
    }

    // 4. SOLID (Data) - Rotating Cubes
    initSolid() {
        this.cubes = [{ x: this.width / 2, y: this.height / 2, size: 100, rx: 0, ry: 0 }];
    }
    drawSolid() {
        // Simple 3D projection
        const cube = this.cubes[0];
        cube.rx += 0.01; cube.ry += 0.02;

        const nodes = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];

        const project = (x, y, z) => {
            // Rotate Y
            let x1 = x * Math.cos(cube.ry) - z * Math.sin(cube.ry);
            let z1 = z * Math.cos(cube.ry) + x * Math.sin(cube.ry);
            // Rotate X
            let y2 = y * Math.cos(cube.rx) - z1 * Math.sin(cube.rx);
            let z2 = z1 * Math.cos(cube.rx) + y * Math.sin(cube.rx);

            const scale = 300 / (300 + z2);
            return {
                x: cube.x + x1 * cube.size * scale,
                y: cube.y + y2 * cube.size * scale
            };
        };

        const p = nodes.map(n => project(n[0], n[1], n[2]));

        this.ctx.strokeStyle = this.colors[3] || this.colors[0];
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // Front
            [4, 5], [5, 6], [6, 7], [7, 4], // Back
            [0, 4], [1, 5], [2, 6], [3, 7]  // Connect
        ];

        edges.forEach(e => {
            this.ctx.moveTo(p[e[0]].x, p[e[0]].y);
            this.ctx.lineTo(p[e[1]].x, p[e[1]].y);
        });

        this.ctx.stroke();
    }

    // 5. FRACTAL (Circuit) - Recursive Tree
    initFractal() { }
    drawFractal() {
        const cx = this.width / 2;
        const cy = this.height;
        const len = 150;

        this.ctx.strokeStyle = this.hexToRgba(this.colors[0], 0.6);
        this.ctx.lineWidth = 1;

        // Non-recursive approximation for performance or limit depth
        // Just drawing a static fractal-like pattern changing with time
        this.drawBranch(cx, cy, len, -Math.PI / 2, 0);
    }
    drawBranch(x, y, len, angle, depth) {
        if (depth > 4) return;

        const ex = x + Math.cos(angle) * len;
        const ey = y + Math.sin(angle) * len;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(ex, ey);
        this.ctx.stroke();

        const spread = Math.sin(this.frame * 0.01) * 0.5 + 0.5; // Breathe
        this.drawBranch(ex, ey, len * 0.7, angle + spread, depth + 1);
        this.drawBranch(ex, ey, len * 0.7, angle - spread, depth + 1);
    }

    // 6. DIM (Sign) - Tesseract / Dimension
    initDim() { }
    drawDim() {
        // Concentric squares tunnel
        const cx = this.width / 2;
        const cy = this.height / 2;

        this.ctx.strokeStyle = this.hexToRgba(this.colors[1], 0.5);
        this.ctx.lineWidth = 2;

        for (let i = 0; i < 10; i++) {
            const t = (this.frame * 0.02 + i * 0.5) % 5;
            const size = Math.pow(2, t) * 20;
            const rot = t * 0.5;

            this.ctx.save();
            this.ctx.translate(cx, cy);
            this.ctx.rotate(rot);
            this.ctx.strokeRect(-size / 2, -size / 2, size, size);
            this.ctx.restore();
        }
    }

    // 7. CHAOS (Net) - Strange Attractor
    initChaos() {
        this.chaosP = { x: 0.1, y: 0.1, z: 0.1 };
    }
    drawChaos() {
        // Lorentz Attractor math visualization?
        // Simplified: Random glitch lines
        const cx = this.width / 2;
        const cy = this.height / 2;

        this.ctx.strokeStyle = this.hexToRgba(this.colors[2], 0.8);
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        const dt = 0.01;
        const sigma = 10, rho = 28, beta = 8 / 3;

        let x = this.chaosP.x, y = this.chaosP.y, z = this.chaosP.z;
        this.ctx.moveTo(cx + x * 10, cy + y * 10);

        for (let i = 0; i < 50; i++) {
            let dx = sigma * (y - x);
            let dy = x * (rho - z) - y;
            let dz = x * y - beta * z;
            x += dx * dt; y += dy * dt; z += dz * dt;
            this.ctx.lineTo(cx + x * 10, cy + y * 10);
        }
        this.ctx.stroke();

        this.chaosP = { x, y, z }; // Continue state
    }
}
