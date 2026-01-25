/**
 * Generative Art Engines
 * 각 작가의 스타일에 맞는 다양한 시각 효과 엔진 모음
 */

class ArtEngine {
    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.colors = colors || ['#ffffff'];
        this.width = canvas.width;
        this.height = canvas.height;
        this.frame = 0;
        this.transparentMode = transparentMode;
        this.data = data;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    update() {
        this.frame++;
    }

    draw() {
        // Base implementation does nothing
    }

    hexToRgba(hex, alpha) {
        // Handle hex with alpha or without
        let r = 0, g = 0, b = 0;
        if (hex.startsWith('#')) hex = hex.slice(1);

        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

/**
 * Organic Engine (AURA-7, FLORA-9)
 * 부드러운 입자와 연결선, 자연스러운 움직임
 */
class OrganicEngine extends ArtEngine {
    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.mode = 'rain'; // Default internal mapping (Rain=Seed)
        this.particles = [];
        this.initSeed(); // Default
    }

    setMode(mode) {
        this.mode = mode;
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (mode === 'rain') this.initSeed();      // SEED
        else if (mode === 'scanner') this.initWind();   // WIND
        else if (mode === 'hud') this.initBloom();      // BLOOM
        else if (mode === 'data') this.initFlow();      // FLOW (DNA)
        else if (mode === 'circuit') this.initRoot();   // ROOT
        else if (mode === 'sign') this.initPulse();     // PULSE
        else if (mode === 'net') this.initLife();       // LIFE (Original Particles)
        else this.initLife();
    }

    draw() {
        // Organic trails - Adjusted for background visibility
        if (this.transparentMode) {
            this.ctx.fillStyle = 'rgba(10, 15, 10, 0.02)'; // Very transparent
        } else {
            this.ctx.fillStyle = 'rgba(10, 15, 10, 0.1)';
        }
        this.ctx.fillRect(0, 0, this.width, this.height);

        switch (this.mode) {
            case 'rain': this.drawSeed(); break;
            case 'scanner': this.drawWind(); break;
            case 'hud': this.drawBloom(); break;
            case 'data': this.drawFlow(); break;
            case 'circuit': this.drawRoot(); break;
            case 'sign': this.drawPulse(); break;
            case 'net': this.drawLife(); break;
            default: this.drawLife();
        }
    }

    // Helper: Determine Style from Data
    getStyle(salt = 0) {
        if (!this.data || !this.data.prompt) return 0;
        const sum = this.data.prompt.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + salt;
        return sum % 3;
    }

    // 1. SEED (Rain Mapping) - Falling Spores
    initSeed() {
        this.seedStyle = this.getStyle(1);
        this.particles = Array.from({ length: 50 }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * -this.height,
            speed: Math.random() * 2 + 1,
            size: Math.random() * 3 + 1,
            sway: Math.random() * 0.05
        }));
    }
    drawSeed() {
        this.particles.forEach(p => {
            p.y += p.speed;
            p.x += Math.sin(this.frame * p.sway) * 0.5;
            if (p.y > this.height) { p.y = -10; p.x = Math.random() * this.width; }

            this.ctx.beginPath();

            // Variants
            if (this.seedStyle === 0) { // Cell (Circle)
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            } else if (this.seedStyle === 1) { // Sprout (Leaf)
                this.ctx.ellipse(p.x, p.y, p.size, p.size * 2, Math.sin(this.frame * 0.1), 0, Math.PI * 2);
            } else { // Egg (Glow)
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = this.colors[0];
            }

            this.ctx.fillStyle = this.colors[0]; // Primary
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }

    // 2. WIND (Scanner Mapping) - Sweeping Sunlight/Breeze
    initWind() {
        this.windStyle = this.getStyle(2);
        this.particles = []; // Not used directly
        this.windOffset = 0;
    }
    drawWind() {
        this.windOffset += 0.01;
        this.ctx.strokeStyle = this.hexToRgba(this.colors[1], 0.1);
        this.ctx.lineWidth = 1;

        const step = this.windStyle === 0 ? 30 : 20;

        for (let i = 0; i < this.height; i += step) {
            this.ctx.beginPath();
            let y = i;
            if (this.windStyle === 2) { // Gale (Fast)
                y += Math.sin(this.frame * 0.1 + i * 0.05) * 40;
            } else { // Breeze (Gentle)
                y += Math.sin(this.frame * 0.02 + i * 0.01) * 20;
            }
            this.ctx.moveTo(0, y);
            this.ctx.bezierCurveTo(
                this.width * 0.3, y - 50,
                this.width * 0.7, y + 50,
                this.width, y
            );
            this.ctx.stroke();
        }

        // God ray sweep
        const sweepX = (Math.sin(this.frame * 0.01) * 0.5 + 0.5) * this.width;
        const grad = this.ctx.createLinearGradient(sweepX - 100, 0, sweepX + 100, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.5, 'rgba(255,255,255,0.05)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // 3. BLOOM (HUD Mapping) - Mandala Focus
    initBloom() {
        this.bloomSize = 0;
    }
    drawBloom() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        this.bloomSize = 100 + Math.sin(this.frame * 0.02) * 20;

        this.ctx.translate(cx, cy);
        this.ctx.rotate(this.frame * 0.005);

        // Mandala petals
        for (let i = 0; i < 8; i++) {
            this.ctx.rotate(Math.PI / 4);
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.hexToRgba(this.colors[2], 0.5);
            this.ctx.lineWidth = 2;
            this.ctx.moveTo(0, 0);
            this.ctx.quadraticCurveTo(30, -this.bloomSize / 2, 0, -this.bloomSize);
            this.ctx.quadraticCurveTo(-30, -this.bloomSize / 2, 0, 0);
            this.ctx.stroke();
        }

        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
    }

    // 4. FLOW (Data Mapping) - DNA / Stream
    initFlow() {
        this.particles = Array.from({ length: 40 }, (_, i) => ({
            x: -50,
            y: (this.height / 40) * i,
            speed: Math.random() * 2 + 1,
            offset: Math.random() * Math.PI * 2
        }));
    }
    drawFlow() {
        this.particles.forEach(p => {
            p.x += p.speed;
            if (p.x > this.width) p.x = -50;

            const helixY = Math.sin(p.x * 0.02 + this.frame * 0.05) * 30;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y + helixY, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colors[3] || this.colors[0];
            this.ctx.fill();

            // Double helix
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y - helixY, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = this.hexToRgba(this.colors[3] || this.colors[0], 0.5);
            this.ctx.fill();

            // Connection
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y + helixY);
            this.ctx.lineTo(p.x, p.y - helixY);
            this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            this.ctx.stroke();
        });
    }

    // 5. ROOT (Circuit Mapping) - Growing Roots
    initRoot() {
        this.roots = [{ x: this.width / 2, y: this.height, angle: -Math.PI / 2, life: 100 }];
    }
    drawRoot() {
        // Slowly add new roots or extend
        if (this.frame % 2 === 0) {
            const count = this.roots.length;
            for (let i = 0; i < count; i++) {
                const r = this.roots[i];
                if (r.life > 0) {
                    const speed = 2;
                    const nextX = r.x + Math.cos(r.angle) * speed;
                    const nextY = r.y + Math.sin(r.angle) * speed;

                    this.ctx.beginPath();
                    this.ctx.strokeStyle = this.hexToRgba(this.colors[1], 0.8);
                    this.ctx.lineWidth = r.life / 20;
                    this.ctx.moveTo(r.x, r.y);
                    this.ctx.lineTo(nextX, nextY);
                    this.ctx.stroke();

                    r.x = nextX;
                    r.y = nextY;
                    r.life--;
                    r.angle += (Math.random() - 0.5) * 0.5; // Wiggle

                    // Branching
                    if (Math.random() < 0.05 && this.roots.length < 50) {
                        this.roots.push({ x: r.x, y: r.y, angle: r.angle + (Math.random() - 0.5), life: r.life * 0.8 });
                    }
                }
            }
        }
        // Fade out very slowly (already handled by global clear)
    }

    // 6. PULSE (Sign Mapping) - Breathing
    initPulse() {
        // No specific state needed
    }
    drawPulse() {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const radius = Math.min(this.width, this.height) * 0.3;

        const breathe = Math.sin(this.frame * 0.05); // -1 to 1

        // Multi-layered aura
        for (let i = 0; i < 5; i++) {
            const r = radius + breathe * 20 + i * 20;
            const alpha = 0.5 - (i * 0.1) + (breathe * 0.1);

            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
            this.ctx.strokeStyle = this.hexToRgba(this.colors[0], alpha);
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    // 7. LIFE (Net Mapping) - Original Organic Particles
    initLife() {
        this.initParticles(); // Use existing method
    }
    drawLife() {
        // Existing draw code adapted for mode
        const maxDist = Math.min(this.width, this.height) * 0.15;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Movement logic included in update(), just draw here? 
            // Need to update position manually if we override main update or rely on it
            p.x += p.vx; p.y += p.vy;
            if (p.x < -50) p.x = this.width + 50;
            if (p.x > this.width + 50) p.x = -50;
            if (p.y < -50) p.y = this.height + 50;
            if (p.y > this.height + 50) p.y = -50;

            const currentAlpha = p.alpha + Math.sin(this.frame * p.pulseSpeed + p.pulseOffset) * 0.2;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.hexToRgba(p.color, Math.max(0, currentAlpha));
            this.ctx.fill();

            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const lineAlpha = (1 - dist / maxDist) * 0.15;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = this.hexToRgba(p.color, lineAlpha);
                    this.ctx.stroke();
                }
            }
        }
    }

    // ... Helper initParticles from original ...
    initParticles() {
        const count = Math.floor((this.width * this.height) / 20000);
        this.particles = Array.from({ length: count }, () => this.createParticle());
    }
    createParticle() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            radius: Math.random() * 3 + 1,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            alpha: Math.random() * 0.5 + 0.2,
            pulseSpeed: Math.random() * 0.05 + 0.01,
            pulseOffset: Math.random() * Math.PI * 2
        };
    }
}

/**
 * Geometric Engine (KURO-X)
 * 기하학적 형태, 선, 회전
 */
class GeometricEngine extends ArtEngine {
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
            this.ctx.fillStyle = 'rgba(5, 5, 10, 0.01)'; // Almost clear
        } else {
            this.ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        }
        this.ctx.fillRect(0, 0, this.width, this.height);

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

/**
 * Cyberpunk Engine (NEON-V)
 * 디지털 비, 글리치, 네온
 */
/**
 * Cyberpunk Engine (NEON-V)
 * 디지털 비, 글리치, 네온 + 5 Modes
 */
class CyberpunkEngine extends ArtEngine {
    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors);
        this.transparentMode = transparentMode;
        this.data = data;
        this.mode = 'rain'; // Default mode

        // Resources
        this.drops = [];
        this.scanY = 0;

        // HUD State
        this.hudState = 0; // 0: SEARCH, 1: LOCKING, 2: LOCKED
        this.hudX = canvas.width / 2;
        this.hudY = canvas.height / 2;
        this.targetX = canvas.width / 2;
        this.targetY = canvas.height / 2;
        this.hudScale = 1.5;
        this.lockTimer = 0;

        this.streamLines = [];
        this.circuitNodes = [];

        // Init Default
        if (this.data) {
            this.mode = this.determineModeFromData();
            console.log(`[Auto Select] Mode based on data: ${this.mode}`);
        } else {
            this.mode = 'rain'; // Fallback
        }

        // Initial setup based on selected mode
        this.setMode(this.mode);
    }

    determineModeFromData() {
        const text = ((this.data.prompt || "") + " " + (this.data.description || "")).toLowerCase();

        // Keyword Mapping
        const keywords = {
            'rain': ['rain', 'storm', 'drop', 'wet', 'water', 'binary', 'fall', 'matrix'],
            'scanner': ['scan', 'glitch', 'search', 'bar', 'line', 'sweep', 'error', 'detect'],
            'hud': ['target', 'aim', 'scope', 'sniper', 'view', 'hud', 'lock', 'weapon', 'tactical'],
            'data': ['data', 'code', 'stream', 'flow', 'numbers', 'text', 'scroll', 'info'],
            'circuit': ['circuit', 'node', 'connect', 'wire', 'chip', 'board', 'logic', 'path'],
            'sign': ['wave', 'signal', 'pulse', 'sine', 'sound', 'frequency', 'noise', 'analog'],
            'net': ['grid', 'net', 'space', '3d', 'terrain', 'cyber', 'world', 'plane', 'dimension']
        };

        // Score counting
        let scores = {};
        for (let mode in keywords) scores[mode] = 0;

        for (let mode in keywords) {
            keywords[mode].forEach(word => {
                if (text.includes(word)) scores[mode]++;
            });
        }

        // Find max score
        let bestMode = 'rain';
        let maxScore = 0;

        // Random tie-breaking by default order or simple loop
        for (let mode in scores) {
            if (scores[mode] > maxScore) {
                maxScore = scores[mode];
                bestMode = mode;
            }
        }

        // If no keywords found, pick semi-randomly based on text length hash
        if (maxScore === 0) {
            const hash = text.length % 7;
            const modes = ['rain', 'scanner', 'hud', 'data', 'circuit', 'sign', 'net'];
            bestMode = modes[hash];
        }

        return bestMode;
    }

    getCurrentStyleName() {
        if (this.mode === 'rain') return ['Modern', 'Binary', 'Storm'][this.rainStyle] || 'Matrix';
        if (this.mode === 'scanner') return ['Horizontal', 'Vertical', 'Quantum'][this.scanStyle] || 'Standard';
        if (this.mode === 'hud') return 'Sniper'; // Unified name
        if (this.mode === 'data') return ['Vertical', 'Horizontal', 'Scattered'][this.dataStyle] || 'Stream';
        if (this.mode === 'circuit') return ['Logic', 'Overload', 'Organic'][this.circuitStyle] || 'Neural';
        if (this.mode === 'sign') return ['Sine', 'Noise', 'Pulse'][this.signStyle] || 'Wave';
        if (this.mode === 'net') return ['Grid', 'Terrain', 'Warp'][this.netStyle] || 'Cyber';
        return 'Default';
    }

    setMode(mode) {
        this.mode = mode;
        console.log(`Switched to mode: ${mode}`);
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Re-init specific resources
        if (mode === 'rain') this.initRain();
        if (mode === 'scanner') this.initScanner();
        if (mode === 'hud') {
            this.initHUD();
            // Reset HUD State
            this.hudState = 0;
            this.hudScale = 1.5;
            this.lockTimer = 0;
            this.pickNewTarget();
        }
        if (mode === 'data') this.initDataStream();
        if (mode === 'circuit') this.initCircuit();
        if (mode === 'sign') this.initSign();
        if (mode === 'net') this.initNet();
    }

    pickNewTarget() {
        // ... (Already defined, but we are replacing block to be safe or skipping)
        // Actually replacing getCurrentStyleName needs correct context.
        // Let's target getCurrentStyleName specifically first.
    }

    // ... we need to replace drawHUDSniper separately.
    // Let's split this into two replacements for safety.

    pickNewTarget() {
        const margin = 100;
        this.targetX = margin + Math.random() * (this.width - margin * 2);
        this.targetY = margin + Math.random() * (this.height - margin * 2);
        this.hudState = 0; // SEARCH
    }

    resize(width, height) {
        super.resize(width, height);
        // Re-init current mode
        this.setMode(this.mode);
    }

    draw() {
        // --- Dynamic Ambient Background (Interactive Lighting) ---
        if (this.transparentMode) {
            let bgOverlayColor = 'rgba(0, 0, 0, 0.2)'; // Default dim

            // 1. Rain, Scanner, Data: Lightning flashes only, otherwise clear
            if (['rain', 'scanner', 'data'].includes(this.mode)) {
                // Random lightning / Flash effect
                if (Math.random() > 0.99) {
                    // Flash background with theme color
                    // Scanner uses color[1] for accent, others uses color[0] usually
                    const flashColor = this.mode === 'scanner' ? this.colors[1] : this.colors[0];
                    bgOverlayColor = this.hexToRgba(flashColor, 0.15);
                } else {
                    // No overlay (Clear view of background image)
                    bgOverlayColor = 'rgba(0, 0, 0, 0.05)';
                }
            }
            // 3. HUD: Heartbeat pulse interaction
            else if (this.mode === 'hud') {
                let pf = this.hudState === 2 ? 0.05 : (this.hudState === 1 ? 0.1 : 0.2);
                const beat = Math.sin(this.frame * pf);

                if (beat > 0.9) {
                    bgOverlayColor = this.hexToRgba(this.colors[0], 0.05);
                } else {
                    bgOverlayColor = 'rgba(0, 0, 0, 0.25)';
                }
            }
            // 5. Circuit, Sign: Existing logic (Trail heavy)
            else if (['circuit', 'sign'].includes(this.mode)) {
                bgOverlayColor = `rgba(0, 0, 0, 0.05)`; // Allow trails
            }
            // 6. Net: Deeper space
            else if (this.mode === 'net') {
                // Deep dark grid background
                bgOverlayColor = 'rgba(0, 5, 20, 0.3)';
            }

            this.ctx.fillStyle = bgOverlayColor;
            this.ctx.fillRect(0, 0, this.width, this.height);

        } else {
            // Non-transparent mode (Solid dark)
            this.ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
            if (this.mode === 'circuit') this.ctx.fillStyle = 'rgba(10, 10, 15, 0.02)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        switch (this.mode) {
            case 'rain': this.drawRain(); break;
            case 'scanner': this.drawScanner(); break;
            case 'hud': this.drawHUD(); break;
            case 'data': this.drawData(); break;
            case 'circuit': this.drawCircuit(); break;
            case 'sign': this.drawSign(); break;
            case 'net': this.drawNet(); break;
            default: this.drawRain();
        }
    }

    // --- 1. Rain Mode (Data-Driven: Styles) ---
    initRain() {
        const text = (this.data && this.data.prompt) ? this.data.prompt : "";
        // Improved Hash: Sum of all chars
        const seedValue = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        // 0: Modern (Matrix)
        // 1: Binary (Code) - Static/Slow
        // 2: Storm (Heavy) - Angled/Fast
        this.rainStyle = seedValue % 3;
        console.log(`[RAIN Mode] Style: ${['Modern', 'Binary', 'Storm'][this.rainStyle]}`);

        const columns = Math.floor(this.width / 20);
        this.drops = Array(columns).fill(1).map(() => Math.random() * -100);
    }

    drawRain() {
        this.ctx.font = '15px monospace';

        // Setup chars based on style
        let chars = '가나다라마바사아자차카타파하디지털코드데이터미래네온시티전력신호접속흐름빛';
        if (this.rainStyle === 1) chars = '01';
        if (this.rainStyle === 2) chars = '⚡↯▁▂▃░▒▓';

        for (let i = 0; i < this.drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * 20;
            const y = this.drops[i] * 20;

            // Color logic
            if (Math.random() > 0.98) {
                this.ctx.fillStyle = this.colors[1] || '#fff';
            } else {
                this.ctx.fillStyle = this.hexToRgba(this.colors[0], 0.8);
            }

            // Storm tilt
            let drawX = x;
            if (this.rainStyle === 2) {
                drawX = x + (y * 0.2); // Slanted
            }

            this.ctx.fillText(char, drawX, y);

            if (y > this.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }

            // Speed logic
            let speed = 1;
            if (this.rainStyle === 1) speed = 0.2; // Slow Binary
            if (this.rainStyle === 2) speed = 2.5; // Fast Storm

            this.drops[i] += speed;
        }
    }

    // --- 2. Scanner Mode (Data-Driven: Styles) ---
    initScanner() {
        // Just establish style
        const text = (this.data && this.data.prompt) ? this.data.prompt : "";
        // Weighted Hash to prevent bias
        const seedValue = text.split('').reduce((acc, char, idx) => acc + (char.charCodeAt(0) * (idx + 13)), 0);

        // 0: Horizontal (Standard)
        // 1: Vertical (Sweep)
        // 2: Quantum (Noise - No Lines)
        this.scanStyle = seedValue % 3;
        console.log(`[SCAN Mode] Style: ${['Horizontal', 'Vertical', 'Quantum'][this.scanStyle]}`);

        this.scanY = 0;
        this.scanX = 0; // For Vertical
    }

    drawScanner() {
        // 1. Horizontal
        if (this.scanStyle === 0) {
            this.scanY += 2;
            if (this.scanY > this.height) this.scanY = -100;

            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = this.colors[0];
            this.ctx.fillStyle = this.hexToRgba(this.colors[0], 0.8);
            this.ctx.fillRect(0, this.scanY, this.width, 4);
            // Trail
            this.ctx.fillStyle = this.hexToRgba(this.colors[0], 0.1);
            this.ctx.fillRect(0, this.scanY - 20, this.width, 20);
            this.ctx.shadowBlur = 0;
        }

        // 2. Vertical
        else if (this.scanStyle === 1) {
            this.scanX += 4;
            if (this.scanX > this.width) this.scanX = -100;

            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = this.colors[1];
            this.ctx.fillStyle = this.hexToRgba(this.colors[1], 0.8);
            this.ctx.fillRect(this.scanX, 0, 4, this.height);
            this.ctx.shadowBlur = 0;
        }

        // 3. Quantum (Noise + Flash)
        else {
            // Constant low noise background
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
            if (Math.random() > 0.5) this.ctx.fillRect(Math.random() * this.width, Math.random() * this.height, 50, 2);

            // Random flashes
            if (Math.random() > 0.9) {
                const y = Math.random() * this.height;
                const h = Math.random() * 50;
                this.ctx.fillStyle = this.hexToRgba(this.colors[0], 0.1);
                this.ctx.fillRect(0, y, this.width, h);
            }

            // Full Screen Glitch
            if (Math.random() > 0.98) {
                this.ctx.fillStyle = this.hexToRgba(this.colors[1], 0.15);
                this.ctx.fillRect(0, 0, this.width, this.height);
            }
        }

        // Glitch blocks (Common)
        let glitchChance = this.scanStyle === 2 ? 0.7 : 0.85;

        if (Math.random() > glitchChance) {
            const w = Math.random() * 200 + 50;
            const h = Math.random() * 20 + 2;
            const x = Math.random() * this.width;

            let y;
            if (this.scanStyle === 0) y = this.scanY + (Math.random() - 0.5) * 100;
            else if (this.scanStyle === 1) y = Math.random() * this.height;
            else y = Math.random() * this.height;

            this.ctx.fillStyle = this.hexToRgba(this.scanStyle === 1 ? this.colors[0] : this.colors[1], 0.6);
            this.ctx.fillRect(x, y, w, h);
        }
    }

    // --- 3. HUD Mode (Data-Driven: Sniper Variations) ---
    initHUD() {
        const text = (this.data && this.data.prompt) ? this.data.prompt : "";
        const seedValue = text.split('').reduce((acc, char, idx) => acc + (char.charCodeAt(0) * (idx + 17)), 0);

        // Always Sniper style, but vary details
        this.hudConfig = {
            shape: seedValue % 3, // 0: Brackets, 1: Circle, 2: Box
            colorShift: seedValue % 2 === 0, // Accent color usage
            spinSpeed: ((seedValue % 5) + 1) * 0.01
        };
        console.log(`[HUD Mode] Sniper Var: ${this.hudConfig.shape}`);
    }

    drawHUD() {
        this.drawHUDSniper();
    }

    drawHUDSniper() {
        // 1. State Machine Logic
        const ease = 0.05;

        if (this.hudState === 0) { // SEARCH move
            const dx = this.targetX - this.hudX;
            const dy = this.targetY - this.hudY;
            this.hudX += dx * ease;
            this.hudY += dy * ease;
            this.hudScale = 1.5 + Math.sin(this.frame * 0.1) * 0.1;
            if (Math.abs(dx) < 5 && Math.abs(dy) < 5) this.hudState = 1;
        }
        else if (this.hudState === 1) { // LOCKING
            this.hudScale += (1.0 - this.hudScale) * 0.1;
            if (Math.abs(1.0 - this.hudScale) < 0.01) {
                this.hudScale = 1.0;
                this.hudState = 2;
                this.lockTimer = 60;
            }
        }
        else if (this.hudState === 2) { // LOCKED
            this.lockTimer--;
            if (this.lockTimer <= 0) this.pickNewTarget();
        }

        const cx = this.hudX;
        const cy = this.hudY;
        const scale = this.hudScale;

        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.scale(scale, scale);

        // Color Logic from Config (Modified by Request)
        // High Pulse (Search) -> Red
        // Low Pulse (Locked) -> Cyan
        let mainColor = '#ff3333'; // Red default (High stress)

        if (this.hudState === 2) {
            mainColor = '#00ffff'; // Cyan (Calm/Locked)
        } else if (this.hudState === 1) {
            // Blending or just keep Red until locked
            mainColor = '#ff3333';
        }

        this.ctx.strokeStyle = mainColor;
        this.ctx.fillStyle = mainColor;
        this.ctx.lineWidth = 1.5;

        // Visual Layout based on Config Shape
        const size = 100;

        // 0: Brackets (Original)
        if (this.hudConfig.shape === 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(-size, -size + 30); this.ctx.lineTo(-size, -size); this.ctx.lineTo(-size + 30, -size);
            this.ctx.moveTo(size - 30, -size); this.ctx.lineTo(size, -size); this.ctx.lineTo(size, -size + 30);
            this.ctx.moveTo(size, size - 30); this.ctx.lineTo(size, size); this.ctx.lineTo(size - 30, size);
            this.ctx.moveTo(-size + 30, size); this.ctx.lineTo(-size, size); this.ctx.lineTo(-size, size - 30);
            this.ctx.stroke();
        }
        // 1: Circle Target
        else if (this.hudConfig.shape === 1) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, size, 0, Math.PI * 2); // Big outer circle
            this.ctx.moveTo(0, -size - 10); this.ctx.lineTo(0, -size + 10);
            this.ctx.moveTo(0, size + 10); this.ctx.lineTo(0, size - 10);
            this.ctx.moveTo(-size - 10, 0); this.ctx.lineTo(-size + 10, 0);
            this.ctx.moveTo(size + 10, 0); this.ctx.lineTo(size - 10, 0);
            this.ctx.stroke();
        }
        // 2: Box Frame
        else {
            this.ctx.strokeRect(-size, -size, size * 2, size * 2);
            // Corner dots
            this.ctx.fillRect(-size - 2, -size - 2, 4, 4);
            this.ctx.fillRect(size - 2, -size - 2, 4, 4);
            this.ctx.fillRect(size - 2, size - 2, 4, 4);
            this.ctx.fillRect(-size - 2, size - 2, 4, 4);
        }

        // Inner Spinner (Common)
        if (this.hudState !== 2) this.ctx.rotate(this.frame * this.hudConfig.spinSpeed);

        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        // Varied inner size
        const innerSize = this.hudConfig.shape === 1 ? 40 : 60;
        this.ctx.arc(0, 0, innerSize, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        if (this.hudState !== 2) this.ctx.rotate(-this.frame * this.hudConfig.spinSpeed);

        // Center Crosshair
        this.ctx.fillStyle = this.hexToRgba(mainColor, 0.8);
        this.ctx.fillRect(-2, -10, 4, 20);
        this.ctx.fillRect(-10, -2, 20, 4);

        // Text
        this.ctx.font = '12px "JetBrains Mono"';
        this.ctx.textAlign = 'center';
        let statusText = this.hudState === 2 ? "TARGET LOCKED" : "SEARCHING...";
        this.ctx.fillText(statusText, 0, -size - 15);
        this.ctx.fillText(`COORD: ${cx.toFixed(0)}, ${cy.toFixed(0)}`, 0, size + 25);

        // --- Heartbeat Frequency Logic ---
        let pulseFreq = 0.2;
        let pulseAmp = 8; // Increased Amp
        if (this.hudState === 1) { pulseFreq = 0.1; pulseAmp = 5; }
        else if (this.hudState === 2) { pulseFreq = 0.05; pulseAmp = 3; }

        // 1. Visual Pulse (On Target) - Center
        const beat = Math.sin(this.frame * pulseFreq);
        if (beat > 0.8) {
            this.ctx.strokeStyle = this.hexToRgba(mainColor, 0.5);
            this.ctx.lineWidth = 3;
            const baseSize = (this.hudConfig && this.hudConfig.shape === 1) ? 40 : 60;
            const pulseSize = baseSize + (beat - 0.8) * 30; // Bigger pulse

            this.ctx.beginPath();
            this.ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        this.ctx.restore();

        // 2. ECG Graph (Right Center Fixed - MUCH BIGGER)
        const graphX = this.width - 150;
        const graphY = this.height / 2;
        const graphW = 200;
        const graphH = 100;

        this.ctx.save();
        this.ctx.translate(graphX, graphY);

        // ECG Graph
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.hexToRgba(mainColor, 0.9);
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(-graphW / 2, 0);

        for (let i = 0; i < graphW; i++) {
            const t = (this.frame + i) * pulseFreq;
            let y = 0;
            const cycle = t % (Math.PI * 2);
            if (cycle < 0.5) y = Math.sin(cycle * 20) * pulseAmp * 4; // Higher peak
            else y = Math.sin(cycle) * pulseAmp * 1.5;

            this.ctx.lineTo(-graphW / 2 + i, - y);
        }
        this.ctx.stroke();

        // BPM Text (Big)
        let bpm = this.hudState === 0 ? "110 BPM" : (this.hudState === 1 ? "85 BPM" : "60 BPM");
        this.ctx.fillStyle = mainColor;
        this.ctx.font = 'bold 16px "JetBrains Mono"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(bpm, 0, 35);

        // BPM Box Border
        this.ctx.strokeStyle = this.hexToRgba(mainColor, 0.5);
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-graphW / 2 - 10, -50, graphW + 20, 100);

        this.ctx.restore();

        // Connector Line (to Target)
        if (this.hudState === 0) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.hexToRgba(mainColor, 0.2);
            this.ctx.moveTo(this.width / 2, this.height / 2);
            this.ctx.lineTo(cx, cy);
            this.ctx.stroke();
        }
    }

    // --- 4. Data Stream Mode (Data-Driven: Dynamic Layouts) ---
    initDataStream() {
        const text = (this.data && this.data.prompt) ? this.data.prompt : "NO DATA SYSTEM OFFLINE";

        // Determine Style based on Text Length/Content
        // Style 0: Vertical Matrix (Long text)
        // Style 1: Horizontal High-Speed (Short text or specific keyword)
        // Style 2: Scattered Cloud (Medium text)
        const seedValue = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        this.dataStyle = seedValue % 3; // 0, 1, 2

        console.log(`[DATA Mode] Style: ${['Vertical', 'Horizontal', 'Scattered'][this.dataStyle]}`);

        this.streamLines = [];

        if (this.dataStyle === 0) { // Vertical
            this.streamLines = Array.from({ length: 15 }, () => ({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                speed: Math.random() * 2 + 2,
                text: text.substring(Math.floor(Math.random() * (text.length - 20))),
                color: Math.random() > 0.3 ? this.colors[1] : '#ffffff',
                size: Math.floor(Math.random() * 10 + 16)
            }));
        } else if (this.dataStyle === 1) { // Horizontal
            this.streamLines = Array.from({ length: 8 }, (_, i) => ({
                x: Math.random() * this.width,
                y: (this.height / 8) * i + 50,
                speed: Math.random() * 10 + 5, // Very Fast
                text: text + " // " + text,
                color: this.colors[0],
                size: Math.floor(Math.random() * 20 + 20) // Bigger
            }));
        } else { // Scattered
            this.streamLines = Array.from({ length: 30 }, () => ({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                text: text.substring(Math.floor(Math.random() * text.length)).substring(0, 5),
                color: Math.random() > 0.5 ? this.colors[0] : '#ffffff',
                size: Math.floor(Math.random() * 10 + 12),
                blinkSpeed: Math.random() * 0.1
            }));
        }
    }

    drawData() {
        if (this.transparentMode) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        this.streamLines.forEach(line => {
            this.ctx.font = `bold ${line.size}px "JetBrains Mono", monospace`;
            this.ctx.fillStyle = this.hexToRgba(line.color, 1.0);

            if (this.dataStyle === 0) { // Vertical
                line.y += line.speed;
                if (line.y > this.height) line.y = -50;
                this.ctx.fillText(line.text.substring(0, 20), line.x, line.y);
            }
            else if (this.dataStyle === 1) { // Horizontal
                line.x -= line.speed;
                if (line.x < -1000) line.x = this.width;
                this.ctx.fillText(line.text, line.x, line.y);
            }
            else { // Scattered
                if (Math.sin(this.frame * line.blinkSpeed) > 0) {
                    this.ctx.fillText(line.text, line.x, line.y);
                }
                // Jitter
                if (Math.random() > 0.95) line.x = Math.random() * this.width;
            }
        });
    }

    // --- 5. Circuit Mode (Data-Driven: Improved Visibility) ---
    initCircuit() {
        const text = (this.data && this.data.prompt) ? this.data.prompt : "";
        const seedValue = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        // Define Circuit Style based on data
        // 0: Rectangular Blue/Cyan (Logic) - Balanced
        // 1: Diagonal Red/Orange (Overload) - Pseudo-Fast (Visual only)
        // 2: Dense Green (Organic) - Slow & Complex
        this.circuitStyle = seedValue % 3;
        console.log(`[CIRC Mode] Style: ${['Logic', 'Overload', 'Organic'][this.circuitStyle]}`);

        // Much Bigger Grid for visibility
        let gridSize = 60;
        if (this.circuitStyle === 2) gridSize = 40; // Organic slightly denser

        // Fewer nodes to match bigger grid
        const count = seedValue % 2 === 0 ? 20 : 40;

        this.circuitNodes = Array.from({ length: count }, () => ({
            x: Math.floor(Math.random() * (this.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (this.height / gridSize)) * gridSize,
            active: Math.random() > 0.5,
            head: false
        }));

        // Select accent color based on style
        if (this.circuitStyle === 1) this.circuitColor = '#ff5500'; // Orange
        else if (this.circuitStyle === 2) this.circuitColor = '#00ff55'; // Green
        else this.circuitColor = this.colors[1]; // Default

        for (let i = 0; i < 5; i++) this.circuitNodes[i].head = true;
    }

    drawCircuit() {
        // Much Thicker lines
        this.ctx.lineWidth = this.circuitStyle === 2 ? 3 : 6;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.circuitColor;

        // Slow down: Draw only every N frames
        let drawDelay = 4; // Default slow
        if (this.circuitStyle === 1) drawDelay = 2; // Overload slightly faster
        if (this.circuitStyle === 2) drawDelay = 6; // Organic very slow

        if (this.frame % drawDelay !== 0) return;

        // Draw one step per active head
        const headIdx = Math.floor(Math.random() * this.circuitNodes.length);
        const node = this.circuitNodes[headIdx];

        if (!node.active) return;

        const dir = Math.floor(Math.random() * 4); // 0:R, 1:D, 2:L, 3:U

        // Match larger grid size
        let len = this.circuitStyle === 2 ? 40 : 60;

        const prevX = node.x;
        const prevY = node.y;

        // Movement logic
        if (this.circuitStyle === 1) { // Diagonal chance
            if (Math.random() > 0.5) {
                node.x += Math.random() > 0.5 ? len : -len;
                node.y += Math.random() > 0.5 ? len : -len;
            } else {
                if (dir === 0) node.x += len;
                else if (dir === 1) node.y += len;
                else if (dir === 2) node.x -= len;
                else node.y -= len;
            }
        } else {
            if (dir === 0) node.x += len;
            else if (dir === 1) node.y += len;
            else if (dir === 2) node.x -= len;
            else node.y -= len;
        }

        // Boundary wrap
        if (node.x > this.width) node.x = 0; if (node.x < 0) node.x = this.width;
        if (node.y > this.height) node.y = 0; if (node.y < 0) node.y = this.height;

        this.ctx.strokeStyle = this.hexToRgba(this.circuitColor, 0.9);
        this.ctx.beginPath();
        this.ctx.moveTo(prevX, prevY);
        this.ctx.lineTo(node.x, node.y);
        this.ctx.stroke();

        // Huge Nodes
        this.ctx.fillStyle = '#ffffff';
        if (this.circuitStyle === 0) this.ctx.fillRect(node.x - 6, node.y - 6, 12, 12); // Rect
        else {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 8, 0, Math.PI * 2); // Circle
            this.ctx.fill();
        }
        this.ctx.shadowBlur = 0;
    }

    // --- 6. SIGN Mode (Signal Processing) ---
    initSign() {
        const text = (this.data && this.data.prompt) ? this.data.prompt : "";
        const seedValue = text.split('').reduce((acc, char, idx) => acc + (char.charCodeAt(0) * (idx + 7)), 0);

        // 0: Sine (Pure)
        // 1: Noise (Static)
        // 2: Pulse (Square/Saw)
        this.signStyle = seedValue % 3;
        console.log(`[SIGN Mode] Style: ${['Sine', 'Noise', 'Pulse'][this.signStyle]}`);

        this.signPoints = [];
        const segments = 100;
        for (let i = 0; i <= segments; i++) {
            this.signPoints.push({
                x: (this.width / segments) * i,
                y: this.height / 2
            });
        }
    }

    drawSign() {
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = this.hexToRgba(this.colors[0], 0.8);
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.colors[0];

        this.ctx.beginPath();

        const speed = this.frame * 0.1;
        const amplitude = this.height * 0.2;

        // 1. Sine (Pure)
        if (this.signStyle === 0) {
            for (let i = 0; i < this.signPoints.length; i++) {
                const p = this.signPoints[i];
                const y = this.height / 2 +
                    Math.sin(i * 0.1 + speed) * amplitude +
                    Math.sin(i * 0.05 - speed * 0.5) * (amplitude * 0.5);

                if (i === 0) this.ctx.moveTo(p.x, y);
                else this.ctx.lineTo(p.x, y);
            }
        }
        // 2. Noise (Static/Glitch)
        else if (this.signStyle === 1) {
            this.ctx.lineWidth = 2;
            for (let i = 0; i < this.signPoints.length; i++) {
                const p = this.signPoints[i];
                let noise = (Math.random() - 0.5) * amplitude * 1.5;
                if (Math.sin(i * 0.2 + speed) > 0.5) noise *= 2;
                else noise *= 0.1;

                const y = this.height / 2 + noise;
                if (i === 0) this.ctx.moveTo(p.x, y);
                else this.ctx.lineTo(p.x, y);
            }
        }
        // 3. Pulse (Digital/Square)
        else {
            this.ctx.lineWidth = 4;
            for (let i = 0; i < this.signPoints.length; i++) {
                const p = this.signPoints[i];
                const t = i + speed * 10;
                let yVal = Math.sin(t * 0.2) > 0 ? 1 : -1;
                if (Math.sin(t * 0.05) > 0.8) yVal = 0;

                const y = this.height / 2 + yVal * amplitude * 0.8;

                if (i === 0) this.ctx.moveTo(p.x, y);
                else {
                    this.ctx.lineTo(p.x, this.signPoints[i - 1].y);
                    this.ctx.lineTo(p.x, y);
                }
                // Update previous y for next step logic is implicitly handled
                this.signPoints[i].y = y; // Save state if needed
            }
        }

        this.ctx.stroke();

        // Draw Center Line
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height / 2);
        this.ctx.lineTo(this.width, this.height / 2);
        this.ctx.stroke();
    }

    // --- 7. NET Mode (3D Grid Space) ---
    initNet() {
        const text = (this.data && this.data.prompt) ? this.data.prompt : "";
        const seedValue = text.split('').reduce((acc, char, idx) => acc + (char.charCodeAt(0) * (idx + 11)), 0);

        // 0: Grid (Flat Floor)
        // 1: Terrain (Mountanous)
        // 2: Warp (Tunnel)
        this.netStyle = seedValue % 3;
        console.log(`[NET Mode] Style: ${['Grid', 'Terrain', 'Warp'][this.netStyle]}`);

        this.netOffset = 0;
    }

    drawNet() {
        // Perspective Setup
        const cx = this.width / 2;
        const cy = this.height / 2;
        const horizon = cy; // Horizon at center

        this.netOffset += 2; // Speed
        if (this.netOffset > 40) this.netOffset = 0; // Grid cell size loop

        this.ctx.strokeStyle = this.hexToRgba(this.colors[1], 0.6); // Use accent color
        this.ctx.lineWidth = 1.5;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.colors[1];

        // 1. Grid (Flat/Retro)
        if (this.netStyle === 0) {
            // Vertical Lines (Perspective)
            for (let i = -1000; i <= 1000; i += 100) {
                this.ctx.beginPath();
                this.ctx.moveTo(cx + i, horizon); // Vanishing point approx
                // Spread out at bottom
                const xBottom = cx + i * 4;
                this.ctx.lineTo(xBottom, this.height);
                this.ctx.stroke();
            }

            // Horizontal Lines (Moving)
            for (let y = 0; y < this.height / 2; y += 20) {
                // Exponential spacing for depth
                const depthY = horizon + Math.pow(y / 20, 2.5) + (this.netOffset * (y / 300));
                if (depthY > this.height) continue;

                this.ctx.beginPath();
                this.ctx.moveTo(0, depthY);
                this.ctx.lineTo(this.width, depthY);
                this.ctx.stroke();
            }

            // Sun/Moon
            this.ctx.fillStyle = this.colors[0]; // Main color sun
            this.ctx.beginPath();
            this.ctx.arc(cx, horizon - 100, 60, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // 2. Terrain (Wavy Cyber Mountain) - UPGRADED & EXPANDED
        else if (this.netStyle === 1) {
            const rows = 35; // More density
            const cols = 40;
            const gridW = this.width * 2.5; // Much wider for immersion

            // Horizon higher up to cover more screen (35% from top)
            const horizonY = this.height * 0.35;

            // Dynamic movement
            const speedZ = this.frame * 0.05;

            // Pre-calculate vertices
            const vertices = [];
            for (let r = 0; r <= rows; r++) {
                const rowArr = [];
                // Perspective Z depth (non-linear)
                const t = r / rows;
                // Modified curve: Start closer to 0 (horizon)
                const z = 0.01 + Math.pow(t, 1.8) * 0.99;

                const yBase = horizonY + (this.height - horizonY) * z;

                // Perspective scale
                const scaleAtRow = 0.1 + z * 1.5;

                for (let c = 0; c <= cols; c++) {
                    const u = c / cols; // 0 to 1
                    const xBase = this.width / 2 + (u - 0.5) * gridW * scaleAtRow;

                    // Height Noise
                    const noiseX = c * 0.4;
                    const noiseY = r * 0.4 - speedZ * 2;

                    // Increased amplitude for more dramatic effect
                    const amp = 80 * z;
                    const h = (Math.sin(noiseX) + Math.sin(noiseY) + Math.sin(noiseX * 0.5 + noiseY * 0.5)) * amp;

                    rowArr.push({ x: xBase, y: yBase - h });
                }
                vertices.push(rowArr);
            }

            // Draw Grid
            this.ctx.lineWidth = 1.5;

            // Horizontal Lines
            for (let r = 0; r <= rows; r++) {
                this.ctx.beginPath();
                // Visibility fog logic
                let alpha = (r / rows);
                alpha = Math.pow(alpha, 0.5); // Fade in faster

                this.ctx.strokeStyle = this.hexToRgba(this.colors[1], alpha);

                for (let c = 0; c <= cols; c++) {
                    const v = vertices[r][c];
                    if (c === 0) this.ctx.moveTo(v.x, v.y);
                    else this.ctx.lineTo(v.x, v.y);
                }
                this.ctx.stroke();
            }

            // Vertical Lines
            for (let c = 0; c <= cols; c += 2) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = this.hexToRgba(this.colors[1], 0.3);

                for (let r = 0; r <= rows; r++) {
                    const v = vertices[r][c];
                    if (r === 0) this.ctx.moveTo(v.x, v.y);
                    else this.ctx.lineTo(v.x, v.y);
                }
                this.ctx.stroke();
            }
        }

        // 3. Warp (Tunnel)
        else {
            const rings = 10;
            const maxRadius = Math.max(this.width, this.height);

            for (let i = 0; i < rings; i++) {
                // Expanding rings
                let r = ((this.frame * 2 + i * 100) % 1000); // 0 to 1000
                // Exponential radius for depth effect
                const radius = Math.pow(r / 1000, 3) * maxRadius;

                this.ctx.beginPath();
                this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            // Zoom lines
            const spokes = 12;
            for (let i = 0; i < spokes; i++) {
                const ang = (i / spokes) * Math.PI * 2 + this.frame * 0.01;
                this.ctx.beginPath();
                this.ctx.moveTo(cx, cy);
                this.ctx.lineTo(cx + Math.cos(ang) * maxRadius, cy + Math.sin(ang) * maxRadius);
                this.ctx.stroke();
            }
        }

        this.ctx.shadowBlur = 0;
    }
}

/**
 * Wave Engine (ECHO-0, AQUA-5)
 * 부드러운 사인파, 흐름
 */
class WaveEngine extends ArtEngine {
    constructor(canvas, ctx, colors) {
        super(canvas, ctx, colors);
        this.lines = [];
        this.initLines();
    }

    initLines() {
        this.lines = [];
        const count = 50; // Number of wave lines
        for (let i = 0; i < count; i++) {
            this.lines.push({
                y: (this.height / count) * i,
                amplitude: Math.random() * 50 + 20,
                frequency: Math.random() * 0.02 + 0.01,
                speed: Math.random() * 0.05 + 0.02,
                offset: Math.random() * Math.PI * 2,
                color: this.colors[i % this.colors.length]
            });
        }
    }

    resize(width, height) {
        super.resize(width, height);
        this.initLines();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height); // Clear completely for clean waves

        this.lines.forEach((line, index) => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.hexToRgba(line.color, 0.5);
            this.ctx.lineWidth = 2;

            for (let x = 0; x < this.width; x += 10) {
                const y = line.y +
                    Math.sin(x * line.frequency + this.frame * line.speed + line.offset) * line.amplitude +
                    Math.sin(x * line.frequency * 0.5 + this.frame * line.speed * 1.5) * (line.amplitude * 0.5); // Complex wave

                if (x === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        });
    }
}

/**
/**
 * Cosmic Engine (VOID-3)
 * 별, 깊이감, 회전
 */
class CosmicEngine extends ArtEngine {
    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.mode = 'rain'; // Dust
        this.stars = [];
        this.initDust();
    }

    setMode(mode) {
        this.mode = mode;
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (mode === 'rain') this.initDust();       // DUST
        else if (mode === 'scanner') this.initOrbit();  // ORBIT
        else if (mode === 'hud') this.initNova();       // NOVA
        else if (mode === 'data') this.initVoid();      // VOID
        else if (mode === 'circuit') this.initGalaxy(); // GALAXY
        else if (mode === 'sign') this.initQuasar();    // QUASAR
        else if (mode === 'net') this.initMulti();      // MULTI
        else this.initDust();
    }

    draw() {
        // Deep Space Darkening for VOID-3
        if (this.transparentMode) {
            this.ctx.fillStyle = 'rgba(0, 0, 5, 0.3)'; // Darken overlay heavily to show stars
        } else {
            this.ctx.fillStyle = 'rgba(5, 5, 12, 0.2)';
        }
        this.ctx.fillRect(0, 0, this.width, this.height);

        switch (this.mode) {
            case 'rain': this.drawDust(); break;
            case 'scanner': this.drawOrbit(); break;
            case 'hud': this.drawNova(); break;
            case 'data': this.drawVoid(); break;
            case 'circuit': this.drawGalaxy(); break;
            case 'sign': this.drawQuasar(); break;
            case 'net': this.drawMulti(); break;
            default: this.drawDust();
        }
    }

    getStyle(salt) { return (this.data?.prompt?.length + salt) % 3 || 0; }

    // 1. DUST (Rain) - Nebula/Stardust
    initDust() {
        this.stars = Array.from({ length: 100 }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            z: Math.random() * 2
        }));
    }
    drawDust() {
        this.stars.forEach(s => {
            s.y += s.z;
            if (s.y > this.height) s.y = 0;
            this.ctx.fillStyle = this.colors[0];
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.z, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    // 2. ORBIT (Scanner) - Planetary Rings
    initOrbit() { }
    drawOrbit() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        this.ctx.lineWidth = 1;
        for (let i = 1; i <= 10; i++) {
            const r = i * 40;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
            this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
            this.ctx.stroke();

            // Planet
            const angle = this.frame * (0.05 / i);
            const px = cx + Math.cos(angle) * r;
            const py = cy + Math.sin(angle) * r;

            this.ctx.beginPath();
            this.ctx.arc(px, py, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colors[i % this.colors.length];
            this.ctx.fill();
        }
    }

    // 3. NOVA (HUD) - Supernova Burst
    initNova() {
        this.novaR = 0;
    }
    drawNova() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        this.novaR += 2;
        if (this.novaR > this.width) this.novaR = 0;

        const grad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, this.novaR);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.8, this.hexToRgba(this.colors[1], 0.5));
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        this.ctx.beginPath();
        this.ctx.arc(cx, cy, this.novaR, 0, Math.PI * 2);
        this.ctx.fillStyle = grad;
        this.ctx.fill();

        // Cross glare
        this.ctx.strokeStyle = this.colors[0];
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 50, cy); this.ctx.lineTo(cx + 50, cy);
        this.ctx.moveTo(cx, cy - 50); this.ctx.lineTo(cx, cy + 50);
        this.ctx.stroke();
    }

    // 4. VOID (Data) - Blackhole
    initVoid() {
        this.voidParticles = Array.from({ length: 100 }, () => ({
            angle: Math.random() * Math.PI * 2,
            dist: Math.random() * 300 + 50,
            speed: Math.random() * 0.05 + 0.01
        }));
    }
    drawVoid() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        // Event Horizon
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        this.ctx.fillStyle = '#000';
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.stroke();

        // Accretion Disk
        this.voidParticles.forEach(p => {
            p.angle += p.speed * (100 / p.dist); // Faster near center
            p.dist -= 0.5; // Fall in
            if (p.dist < 40) p.dist = 350;

            const x = cx + Math.cos(p.angle) * p.dist;
            const y = cy + Math.sin(p.angle) * p.dist * 0.3; // Flattened

            this.ctx.fillStyle = this.hexToRgba(this.colors[2], 0.8);
            this.ctx.fillRect(x, y, 2, 2);
        });
    }

    // 5. GALAXY (Circuit) - Spiral Arms
    initGalaxy() { }
    drawGalaxy() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(this.frame * 0.005);

        // 2 Arms
        for (let j = 0; j < 2; j++) {
            const armOffset = j * Math.PI;
            for (let i = 0; i < 200; i += 2) {
                const angle = i * 0.1 + armOffset;
                const r = i * 2;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;

                this.ctx.fillStyle = this.hexToRgba(this.colors[j], 0.6);
                this.ctx.beginPath();
                this.ctx.arc(x, y, Math.random() * 2 + 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.restore();
    }

    // 6. QUASAR (Sign) - Jet Stream
    initQuasar() { }
    drawQuasar() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        // Core
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        this.ctx.fill();

        // Jets
        this.ctx.strokeStyle = this.hexToRgba(this.colors[1], 0.5);
        this.ctx.lineWidth = 4;

        const flicker = Math.random() * 50;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(cx + 200 + flicker, cy - 200 - flicker);
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(cx - 200 - flicker, cy + 200 + flicker);
        this.ctx.stroke();
    }

    // 7. MULTI (Net) - Bubble Universe
    initMulti() {
        this.bubbles = Array.from({ length: 20 }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            r: Math.random() * 50 + 20
        }));
    }
    drawMulti() {
        this.bubbles.forEach(b => {
            b.y -= 0.5;
            if (b.y < -100) b.y = this.height + 100;

            this.ctx.strokeStyle = this.hexToRgba(this.colors[3] || '#fff', 0.3);
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            this.ctx.stroke();

            // Inner reflection
            this.ctx.beginPath();
            this.ctx.arc(b.x + b.r * 0.3, b.y - b.r * 0.3, b.r * 0.2, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
            this.ctx.fill();
        });
    }
}

/**
 * Flow Engine (AQUA-5)
 * 떠오르는 물방울
 */
class FlowEngine extends ArtEngine {
    constructor(canvas, ctx, colors) {
        super(canvas, ctx, colors);
        this.bubbles = [];
        this.initBubbles();
    }

    initBubbles() {
        const count = 40;
        this.bubbles = Array.from({ length: count }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: Math.random() * 10 + 5,
            speed: Math.random() * 1.5 + 0.5,
            wobble: Math.random() * Math.PI * 2,
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }));
    }

    resize(width, height) {
        super.resize(width, height);
        this.initBubbles();
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
            this.ctx.fillStyle = this.hexToRgba(b.color, 0.6);
            this.ctx.strokeStyle = this.hexToRgba(b.color, 0.8);
            this.ctx.lineWidth = 1;
            this.ctx.fill();
            this.ctx.stroke();
        });
    }
}

/**
 * Contour Engine (TERRA-1)
 * 등고선
 */
class ContourEngine extends ArtEngine {
    constructor(canvas, ctx, colors) {
        super(canvas, ctx, colors);
        this.contours = [];
        this.initContours();
    }

    initContours() {
        const count = 10;
        this.contours = Array.from({ length: count }, (_, i) => ({
            y: (this.height / count) * i,
            points: Array.from({ length: 20 }, () => Math.random() * 20 - 10),
            speed: Math.random() * 0.02 + 0.01,
            color: this.colors[i % this.colors.length]
        }));
    }

    resize(width, height) {
        super.resize(width, height);
        this.initContours();
    }

    draw() {
        // Clear fully for clean lines or trail? Let's use trails for smoothness
        this.ctx.fillStyle = 'rgba(20, 15, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.contours.forEach((c, i) => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.hexToRgba(c.color, 0.7);
            this.ctx.lineWidth = 2;

            for (let x = 0; x <= this.width; x += 20) {
                const idx = Math.floor(x / (this.width / 20)); // Adjusted step
                const offset = c.points[idx % c.points.length] || 0;
                const nextOffset = c.points[(idx + 1) % c.points.length] || 0;
                const t = (x % (this.width / 20)) / (this.width / 20);
                const smoothOffset = offset * (1 - t) + nextOffset * t;

                const y = c.y + smoothOffset * 10 + Math.sin(this.frame * c.speed + i) * 15;
                if (x === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        });
    }
}

/**
 * Refraction Engine (PRISM-2)
 * 빛 굴절
 */
class RefractionEngine extends ArtEngine {
    constructor(canvas, ctx, colors) {
        super(canvas, ctx, colors);
        this.beams = [];
        this.initBeams();
    }

    initBeams() {
        const count = 20;
        this.beams = Array.from({ length: count }, () => ({
            x: Math.random() * this.width,
            angle: Math.random() * Math.PI - Math.PI / 2,
            width: Math.random() * 20 + 10,
            length: Math.random() * this.height * 0.6 + this.height * 0.4, // Much longer beams
            speed: Math.random() * 0.01 + 0.005,
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }));
    }

    resize(width, height) {
        super.resize(width, height);
        this.initBeams();
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.beams.forEach(b => {
            b.angle += Math.sin(this.frame * 0.01) * 0.002;

            this.ctx.save();
            this.ctx.translate(b.x, this.height); // Start from bottom
            this.ctx.rotate(b.angle);

            const grad = this.ctx.createLinearGradient(0, 0, 0, -b.length);
            grad.addColorStop(0, this.hexToRgba(b.color, 0));
            grad.addColorStop(0.5, this.hexToRgba(b.color, 0.8)); // Brighter
            grad.addColorStop(1, this.hexToRgba(b.color, 0));

            this.ctx.fillStyle = grad;
            this.ctx.fillRect(-b.width / 2, -b.length, b.width, b.length);

            this.ctx.restore();
        });
    }
}

/**
 * Bloom Engine (FLORA-9)
 * 꽃잎
 */
class BloomEngine extends ArtEngine {
    constructor(canvas, ctx, colors) {
        super(canvas, ctx, colors);
        this.petals = [];
        this.initPetals();
    }

    initPetals() {
        const count = 30;
        this.petals = Array.from({ length: count }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 15 + 5,
            angle: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.01,
            sway: Math.random() * 0.05,
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }));
    }

    resize(width, height) {
        super.resize(width, height);
        this.initPetals();
    }

    draw() {
        this.ctx.fillStyle = 'rgba(10, 5, 20, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.petals.forEach(p => {
            p.angle += p.speed;
            p.x += Math.sin(this.frame * p.sway) * 0.5;
            p.y += Math.cos(this.frame * p.sway) * 0.5;

            if (p.x < -50) p.x = this.width + 50;
            if (p.x > this.width + 50) p.x = -50;
            if (p.y < -50) p.y = this.height + 50;
            if (p.y > this.height + 50) p.y = -50;

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.angle);

            this.ctx.beginPath();
            // Draw petal shape using bezier curves
            this.ctx.moveTo(0, 0);
            this.ctx.quadraticCurveTo(-p.size, -p.size, 0, -p.size * 3);
            this.ctx.quadraticCurveTo(p.size, -p.size, 0, 0);

            this.ctx.fillStyle = this.hexToRgba(p.color, 0.6);
            this.ctx.fill();

            this.ctx.restore();
        });
    }
}
