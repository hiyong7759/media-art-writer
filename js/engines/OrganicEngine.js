import { ArtEngine } from './ArtEngine.js';

/**
 * Organic Engine (AURA-7, FLORA-9)
 * 부드러운 입자와 연결선, 자연스러운 움직임
 */
export class OrganicEngine extends ArtEngine {
    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.mode = 'rain'; // Default internal mapping (Rain=Seed)
        this.particles = [];
        this.roots = [];
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
        // 1. Dynamic Background Tint (Breathing)
        if (this.canvas) {
            // Sync with Pulse rhythm (Heartbeat)
            const t = this.frame * 0.1;
            const beat = Math.pow(Math.sin(t), 6) * 0.5 + 0.5; // Sharper peaks

            // Alpha: 0.2 ~ 0.5
            const alpha = 0.2 + beat * 0.3;

            const tintColor = this.colors[1] || this.colors[0];
            this.canvas.style.backgroundColor = this.hexToRgba(tintColor, alpha);
        }

        if (this.transparentMode) {
            // Use destination-out to fade existing drawings to transparent
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Normal fade speed
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        } else {
            this.ctx.fillStyle = 'rgba(10, 15, 10, 0.1)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

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

    // 1. SEED (Rain Mapping) - Distinct Shapes
    initSeed() {
        this.seedStyle = this.getStyle(1);
        this.particles = Array.from({ length: 50 }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * -this.height,
            speed: Math.random() * 2 + 1,
            size: Math.random() * 3 + 2, // Larger base
            sway: Math.random() * 0.05,
            angle: Math.random() * Math.PI * 2
        }));
    }
    drawSeed() {
        this.particles.forEach(p => {
            p.y += p.speed;
            p.x += Math.sin(this.frame * p.sway) * 0.5;
            p.angle += 0.02;
            if (p.y > this.height) { p.y = -20; p.x = Math.random() * this.width; }

            this.ctx.beginPath();

            // Variants - Radically Different
            if (this.seedStyle === 0) { // Cell (Double Circle)
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2); // Inner nucleus
            }
            else if (this.seedStyle === 1) { // Sprout (Triangle / Y-Shape)
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(Math.sin(this.frame * p.sway));
                this.ctx.moveTo(0, -p.size * 2);
                this.ctx.lineTo(-p.size, p.size);
                this.ctx.lineTo(p.size, p.size);
                this.ctx.closePath();
                this.ctx.restore();
            }
            else { // Egg (Hollow Ring)
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = this.colors[0];
                this.ctx.stroke();
                // Inner glow dot
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
            }

            if (this.seedStyle !== 2) {
                this.ctx.fillStyle = this.colors[0];
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = this.hexToRgba(this.colors[0], 0.5);
                this.ctx.fill();
            }

            // Stroke for visibility in transparent mode
            if (this.transparentMode && this.seedStyle !== 2) {
                this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        });
    }

    // 2. WIND (Scanner Mapping) - Sweeping Sunlight/Breeze/Pollen
    initWind() {
        this.windStyle = this.getStyle(2);
        this.particles = [];
        this.windOffset = 0;

        // Pollen (Variant 3)
        if (this.windStyle === 2) {
            this.particles = Array.from({ length: 150 }, () => ({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: Math.random() * 2 + 1,
                vy: Math.random() - 0.5,
                size: Math.random() * 3 + 1
            }));
        }
    }
    drawWind() {
        this.windOffset += 0.01;

        if (this.windStyle === 2) { // Pollen
            this.ctx.fillStyle = this.colors[2] || '#FFD700';
            this.particles.forEach(p => {
                p.x += p.vx + Math.sin(this.frame * 0.01) * 2;
                p.y += p.vy + Math.cos(this.frame * 0.01);

                if (p.x > this.width) p.x = -10;
                if (p.x < -10) p.x = this.width;
                if (p.y > this.height) p.y = -10;
                if (p.y < -10) p.y = this.height;

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            return;
        }

        this.ctx.strokeStyle = this.hexToRgba(this.colors[1], 0.1);
        this.ctx.lineWidth = 1;
        const step = this.windStyle === 0 ? 30 : 20;

        for (let i = 0; i < this.height; i += step) {
            this.ctx.beginPath();
            let y = i;
            if (this.windStyle === 1) { // Gale
                y += Math.sin(this.frame * 0.1 + i * 0.05) * 40;
            } else { // Breeze
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

        const sweepX = (Math.sin(this.frame * 0.01) * 0.5 + 0.5) * this.width;
        const grad = this.ctx.createLinearGradient(sweepX - 100, 0, sweepX + 100, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.5, 'rgba(255,255,255,0.05)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // 3. BLOOM (HUD Mapping) - Pulse Shapes
    initBloom() {
        this.bloomStyle = this.getStyle(3);
    }
    drawBloom() {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const t = this.frame * 0.1;
        const beat = Math.pow(Math.sin(t), 63) * Math.sin(t + 1.5) * 8;
        const smoothBeat = (Math.sin(t) + 1) * 5;

        this.ctx.translate(cx, cy);
        this.ctx.beginPath();

        if (this.bloomStyle === 0) { // Heart
            const scale = 5 + beat * 2;
            for (let i = 0; i < Math.PI * 2; i += 0.05) {
                const x = 16 * Math.pow(Math.sin(i), 3);
                const y = -(13 * Math.cos(i) - 5 * Math.cos(2 * i) - 2 * Math.cos(3 * i) - Math.cos(4 * i));
                this.ctx.lineTo(x * scale, y * scale);
            }
            this.ctx.fillStyle = this.hexToRgba(this.colors[2] || '#ff5555', 0.8);
            this.ctx.shadowColor = this.colors[2] || '#ff5555';
            this.ctx.shadowBlur = 30 + beat * 5;
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        else if (this.bloomStyle === 1) { // Lotus
            const count = 12;
            this.ctx.rotate(this.frame * 0.01);
            for (let i = 0; i < count; i++) {
                this.ctx.rotate((Math.PI * 2) / count);
                this.ctx.beginPath();
                this.ctx.ellipse(0, -60 - smoothBeat * 5, 20, 50, 0, 0, Math.PI * 2);
                this.ctx.fillStyle = this.hexToRgba(this.colors[3] || '#ffff55', 0.6);
                this.ctx.fill();
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.stroke();
            }
        }
        else { // Orbital
            const count = 8;
            const r = 80 + smoothBeat * 5;
            for (let i = 0; i < count; i++) {
                const angle = (this.frame * 0.05) + (i * (Math.PI * 2 / count));
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;

                this.ctx.beginPath();
                this.ctx.arc(px, py, 10, 0, Math.PI * 2);
                this.ctx.fillStyle = this.hexToRgba(this.colors[0], 0.8);
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = this.colors[0];
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(px, py);
                this.ctx.strokeStyle = this.hexToRgba(this.colors[0], 0.3);
                this.ctx.stroke();
            }
        }

        this.ctx.shadowBlur = 0;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // 4. FLOW (Data Mapping) - DNA / Stream / Network
    initFlow() {
        this.flowStyle = this.getStyle(4);
        if (this.flowStyle === 0) { // DNA
            this.particles = Array.from({ length: 40 }, (_, i) => ({
                x: -50,
                y: (this.height / 40) * i,
                speed: Math.random() * 2 + 1,
            }));
        } else if (this.flowStyle === 1) { // Stream
            this.particles = Array.from({ length: 50 }, () => ({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                len: Math.random() * 100 + 50,
                speed: Math.random() * 10 + 5
            }));
        } else { // Network
            this.particles = Array.from({ length: 30 }, () => ({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2
            }));
        }
    }
    drawFlow() {
        if (this.flowStyle === 0) { // DNA
            this.particles.forEach(p => {
                p.x += p.speed;
                if (p.x > this.width) p.x = -50;
                const helixY = Math.sin(p.x * 0.02 + this.frame * 0.05) * 30;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y + helixY, 3, 0, Math.PI * 2);
                this.ctx.fillStyle = this.colors[3] || this.colors[0];
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y - helixY, 3, 0, Math.PI * 2);
                this.ctx.fillStyle = this.hexToRgba(this.colors[3] || this.colors[0], 0.5);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y + helixY);
                this.ctx.lineTo(p.x, p.y - helixY);
                this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                this.ctx.stroke();
            });
        } else if (this.flowStyle === 1) { // Stream
            this.ctx.strokeStyle = this.hexToRgba(this.colors[1], 0.5);
            this.particles.forEach(p => {
                p.x += p.speed;
                if (p.x > this.width) p.x = -p.len;
                this.ctx.beginPath();
                this.ctx.lineWidth = 1;
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x - p.len, p.y);
                this.ctx.stroke();
            });
        } else { // Network
            this.ctx.fillStyle = this.colors[0];
            this.ctx.strokeStyle = this.hexToRgba(this.colors[0], 0.2);
            this.particles.forEach((p, i) => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > this.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.height) p.vy *= -1;

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                this.ctx.fill();

                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        this.ctx.beginPath();
                        this.ctx.lineWidth = (1 - dist / 150) * 2;
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.stroke();
                    }
                }
            });
        }
    }

    // 5. ROOT (Circuit Mapping) - Looping & Vis improvements
    initRoot() {
        this.rootStyle = this.getStyle(5);
        this.roots = [];
        this.startRoot(); // Initial spawn
    }

    startRoot() {
        let count = (this.rootStyle === 1) ? 10 : 3;

        for (let i = 0; i < count; i++) {
            let startX = this.width / 2;
            let startY = this.height;
            let startAngle = -Math.PI / 2;
            let startLife = 300;
            let startWidth = 6;

            if (this.rootStyle === 1) { // Fibrous (Spread from center bottom)
                startX = this.width / 2 + (Math.random() - 0.5) * 200; // Center bias
                startAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
                startLife = 250;
                startWidth = 3;
            } else if (this.rootStyle === 2) { // Rhizome (Side to Side)
                startX = (Math.random() > 0.5) ? 0 : this.width;
                startY = this.height - Math.random() * 100;
                startAngle = (startX === 0) ? 0 : Math.PI; // Go towards center
                startLife = 400;
                startWidth = 8;
            } else { // Taproot (Center)
                startX = this.width / 2 + (Math.random() - 0.5) * 50;
            }

            this.roots.push({
                path: [{ x: startX, y: startY }],
                angle: startAngle,
                life: startLife,
                maxLife: startLife,
                width: startWidth,
                dead: false
            });
        }
    }

    drawRoot() {
        // Grow Phase
        this.roots.forEach(r => {
            if (r.life > 0) {
                const lastP = r.path[r.path.length - 1];
                let speed = 4;
                if (this.rootStyle === 2) speed = 3;

                let nextX = lastP.x + Math.cos(r.angle) * speed;
                let nextY = lastP.y + Math.sin(r.angle) * speed;

                // Bounds check - steer back if near edge
                if (nextX < 50) r.angle += 0.1;
                if (nextX > this.width - 50) r.angle -= 0.1;
                if (nextY < 50) r.angle += (Math.random() > 0.5 ? 0.1 : -0.1);
                // Don't let it go off screen easily
                nextX = Math.max(0, Math.min(this.width, nextX));
                nextY = Math.max(0, Math.min(this.height, nextY));

                r.path.push({ x: nextX, y: nextY });
                r.life--;

                // Wiggle
                let wiggle = 0.2;
                if (this.rootStyle === 1) wiggle = 0.1;
                r.angle += (Math.random() - 0.5) * wiggle;

                // Branching
                if (this.roots.length < 100) {
                    if (Math.random() < 0.05) {
                        this.roots.push({
                            path: [{ x: nextX, y: nextY }],
                            angle: r.angle + (Math.random() - 0.5) * 1.5,
                            life: r.life * 0.6,
                            maxLife: r.life * 0.6,
                            width: r.width * 0.7,
                            dead: false
                        });
                    }
                }
            } else {
                r.dead = true;
            }
        });

        // Loop / Regeneration
        if (this.roots.every(r => r.dead) || this.frame % 300 === 0) {
            // Reset excessive dead roots to save memory if needed, or just spawn new ones
            if (this.roots.length < 200) this.startRoot();
        }

        // Draw Phase
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        const strokeColor = (this.colors && this.colors[1]) ? this.hexToRgba(this.colors[1], 0.8) : 'rgba(100, 200, 100, 0.8)';

        this.roots.forEach(r => {
            if (r.path.length < 2) return;
            this.ctx.beginPath();
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = Math.max(1, r.width * (r.life / r.maxLife + 0.3));
            this.ctx.moveTo(r.path[0].x, r.path[0].y);
            for (let i = 1; i < r.path.length; i++) {
                this.ctx.lineTo(r.path[i].x, r.path[i].y);
            }
            this.ctx.stroke();

            // Glowing Node at tip
            if (r.life > 0) {
                const tip = r.path[r.path.length - 1];
                this.ctx.beginPath();
                this.ctx.fillStyle = '#ffffff';
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = '#ffffff';
                this.ctx.arc(tip.x, tip.y, Math.max(1, r.width / 2), 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
    }

    // 6. PULSE (Sign Mapping) - Breath / Shockwave / Magnetic Field
    initPulse() {
        this.pulseStyle = this.getStyle(6);
        this.magneticLines = Array.from({ length: 20 }, () => Math.random() * Math.PI * 2);
    }
    drawPulse() {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const radius = Math.min(this.width, this.height) * 0.3;

        if (this.pulseStyle === 0) { // Breath (Standard)
            const breathe = Math.sin(this.frame * 0.05);
            for (let i = 0; i < 5; i++) {
                const r = radius + breathe * 20 + i * 20;
                const alpha = 0.5 - (i * 0.1) + (breathe * 0.1);
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
                this.ctx.strokeStyle = this.hexToRgba(this.colors[0], alpha);
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        } else if (this.pulseStyle === 1) { // Shockwave (Fast Rings)
            const t = (this.frame % 60) / 60; // 0 to 1
            const r = t * radius * 2;
            const alpha = 1 - t;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
            this.ctx.strokeStyle = this.hexToRgba(this.colors[2], alpha);
            this.ctx.lineWidth = 5 * alpha;
            this.ctx.stroke();
        } else { // Magnetic Field (Lines of Force)
            this.ctx.strokeStyle = this.hexToRgba(this.colors[1], 0.4);
            this.ctx.lineWidth = 1;

            const time = this.frame * 0.02;
            this.magneticLines.forEach((angle, i) => {
                const r = radius + Math.sin(time + i) * 50;
                const x1 = cx + Math.cos(angle) * r;
                const y1 = cy + Math.sin(angle) * r;
                const x2 = cx + Math.cos(angle + Math.PI) * r;
                const y2 = cy + Math.sin(angle + Math.PI) * r;

                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.quadraticCurveTo(cx + Math.cos(time) * 100, cy + Math.sin(time) * 100, x2, y2);
                this.ctx.stroke();

                // Moving particle on line
                const pt = (Math.sin(time * 2 + i) + 1) / 2;
                // Simple lerp along quadratic bezier approximation
                const qx = (1 - pt) * (1 - pt) * x1 + 2 * (1 - pt) * pt * (cx) + pt * pt * x2;
                const qy = (1 - pt) * (1 - pt) * y1 + 2 * (1 - pt) * pt * (cy) + pt * pt * y2;

                this.ctx.beginPath();
                this.ctx.fillStyle = '#ffffff';
                this.ctx.arc(qx, qy, 2, 0, Math.PI * 2);
                this.ctx.fill();
            });
        }
    }

    // 7. LIFE (Net Mapping) - Firefly / Butterfly / Spirit
    initLife() {
        this.lifeStyle = this.getStyle(7);
        this.particles = Array.from({ length: 30 }, () => this.createParticle());
    }
    drawLife() {
        this.particles.forEach(p => {
            // Move logic
            p.x += p.vx; p.y += p.vy;
            if (p.x < -50) p.x = this.width + 50;
            if (p.x > this.width + 50) p.x = -50;
            if (p.y < -50) p.y = this.height + 50;
            if (p.y > this.height + 50) p.y = -50;

            const alpha = p.alpha + Math.sin(this.frame * p.pulseSpeed) * 0.2;
            this.ctx.fillStyle = this.hexToRgba(p.color, Math.max(0, alpha));

            if (this.lifeStyle === 0) { // Firefly (Shimmering Dot)
                this.ctx.beginPath();
                // Intense center
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fill();
                // Glow
                const shimmer = Math.random() * 0.5 + 0.5;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
                this.ctx.fillStyle = this.hexToRgba(p.color, 0.2 * shimmer);
                this.ctx.fill();

            } else if (this.lifeStyle === 1) { // Butterfly (Triangle)
                this.ctx.beginPath();
                const wing = Math.abs(Math.sin(this.frame * 0.2)) * 10;
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x - wing, p.y - 5);
                this.ctx.lineTo(p.x - wing, p.y + 5);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x + wing, p.y - 5);
                this.ctx.lineTo(p.x + wing, p.y + 5);
                this.ctx.fill();
            } else { // Spirit (Wisp with Tail)
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = p.color;
                this.ctx.fill();

                // Tail
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.quadraticCurveTo(p.x - p.vx * 10, p.y - p.vy * 10, p.x - p.vx * 20, p.y - p.vy * 20 + Math.sin(this.frame * 0.2) * 5);
                this.ctx.strokeStyle = this.hexToRgba(p.color, 0.5);
                this.ctx.stroke();

                this.ctx.shadowBlur = 0;
            }
        });
    }

    createParticle() {
        // Unique color HSL shift based on base color
        // Here we just use palette randomly
        const baseColor = this.colors[Math.floor(Math.random() * this.colors.length)];

        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            radius: Math.random() * 3 + 1,
            color: baseColor,
            alpha: Math.random() * 0.5 + 0.2,
            pulseSpeed: Math.random() * 0.1 + 0.05, // Faster blink
        };
    }
}
