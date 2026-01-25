import { ArtEngine } from './ArtEngine.js';

/**
 * Cosmic Engine (VOID-3)
 * 별, 깊이감, 회전
 */
export class CosmicEngine extends ArtEngine {
    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.mode = 'rain'; // Dust
        this.stars = [];
        this.initDust();
    }

    setMode(mode) {
        this.mode = mode;
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (mode === 'rain') this.initDust();
        else if (mode === 'scanner') this.initOrbit();
        else if (mode === 'hud') this.initNova();
        else if (mode === 'data') this.initVoid();
        else if (mode === 'circuit') this.initGalaxy();
        else if (mode === 'sign') this.initQuasar();
        else if (mode === 'net') this.initMulti();
        else this.initDust();
    }

    draw() {
        if (this.transparentMode) {
            this.ctx.fillStyle = 'rgba(0, 0, 5, 0.3)';
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

        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        this.ctx.fillStyle = '#000';
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.stroke();

        this.voidParticles.forEach(p => {
            p.angle += p.speed * (100 / p.dist);
            p.dist -= 0.5;
            if (p.dist < 40) p.dist = 350;

            const x = cx + Math.cos(p.angle) * p.dist;
            const y = cy + Math.sin(p.angle) * p.dist * 0.3;

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

        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        this.ctx.fill();

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

            this.ctx.beginPath();
            this.ctx.arc(b.x + b.r * 0.3, b.y - b.r * 0.3, b.r * 0.2, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
            this.ctx.fill();
        });
    }
}
