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
            // Use destination-out to fade existing drawings to transparent, preserving the background image visibility
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Fade speed
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
