import { ArtEngine } from './ArtEngine.js';

/**
 * Cosmic Engine (VOID-3)
 * 별, 깊이감, 회전
 */
export class CosmicEngine extends ArtEngine {
    // VOID-3 스킬 정의
    static SKILLS = [
        { name: 'Dust', nameKo: '성운', variants: ['Nebula', 'Stardust', 'Cluster'] },
        { name: 'Orbit', nameKo: '궤도', variants: ['Planetary', 'Ring', 'Satellite'] },
        { name: 'Nova', nameKo: '초신성', variants: ['Burst', 'Collapse', 'Remnant'] },
        { name: 'Void', nameKo: '공허', variants: ['Blackhole', 'Horizon', 'Singularity'] },
        { name: 'Galaxy', nameKo: '은하', variants: ['Spiral', 'Elliptical', 'Irregular'] },
        { name: 'Quasar', nameKo: '퀘이사', variants: ['Jet', 'Beam', 'Active'] },
        { name: 'Multi', nameKo: '다중우주', variants: ['Bubble', 'Foam', 'String'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.stars = [];
        this.voidParticles = [];
        this.setMode(0, 0); // Default: Dust
    }


    // 새 표준 인터페이스
    setMode(modeIndex, variantIndex = 0) {
        super.setMode(modeIndex, variantIndex);
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 레거시 호환성
        const modeNames = ['rain', 'scanner', 'hud', 'data', 'circuit', 'sign', 'net'];
        this.mode = modeNames[modeIndex] || 'rain';
        this.variant = variantIndex;

        console.log(`[CosmicEngine] Mode: ${modeIndex} (${this.mode}), Variant: ${this.variant}`);

        if (modeIndex === 0) this.initDust();
        else if (modeIndex === 1) this.initOrbit();
        else if (modeIndex === 2) this.initNova();
        else if (modeIndex === 3) this.initVoid();
        else if (modeIndex === 4) this.initGalaxy();
        else if (modeIndex === 5) this.initQuasar();
        else if (modeIndex === 6) this.initMulti();
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

    // 1. DUST (Rain)
    initDust() {
        let count = 100;
        let depthSpread = 2;
        if (this.variant === 1) { // Stardust (Many small)
            count = 300;
            depthSpread = 1;
        } else if (this.variant === 2) { // Cluster (Dense, low depth)
            count = 150;
            depthSpread = 0.5;
        }

        this.stars = Array.from({ length: count }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            z: Math.random() * depthSpread + 0.1,
            size: Math.random() * 2 + 0.5
        }));
    }
    drawDust() {
        this.stars.forEach(s => {
            s.y += s.z;
            if (s.y > this.height) s.y = 0;
            this.ctx.fillStyle = this.colors[0];
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    // 2. ORBIT (Scanner)
    initOrbit() { }
    drawOrbit() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        this.ctx.lineWidth = 1;
        const count = (this.variant === 1) ? 5 : ((this.variant === 2) ? 15 : 10);

        for (let i = 1; i <= count; i++) {
            const r = i * (this.variant === 2 ? 20 : 40);
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
            this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
            this.ctx.stroke();

            const angle = this.frame * (0.05 / i) * (this.variant === 1 ? -1 : 1);
            const px = cx + Math.cos(angle) * r;
            const py = cy + Math.sin(angle) * r;

            this.ctx.beginPath();
            this.ctx.arc(px, py, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colors[i % this.colors.length];
            this.ctx.fill();
        }
    }

    // 3. NOVA (HUD)
    initNova() {
        this.novaR = 0;
    }
    drawNova() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        const speed = (this.variant === 0) ? 2 : ((this.variant === 1) ? 5 : 1);
        this.novaR += speed;
        if (this.novaR > this.width) this.novaR = 0;

        const grad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, this.novaR);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.8, this.hexToRgba(this.colors[1], 0.5));
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        this.ctx.beginPath();
        this.ctx.arc(cx, cy, this.novaR, 0, Math.PI * 2);
        this.ctx.fillStyle = grad;
        this.ctx.fill();

        if (this.variant !== 2) { // Not Remnant (Simple)
            this.ctx.strokeStyle = this.colors[0];
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(cx - 50, cy); this.ctx.lineTo(cx + 50, cy);
            this.ctx.moveTo(cx, cy - 50); this.ctx.lineTo(cx, cy + 50);
            this.ctx.stroke();
        }
    }

    // 4. VOID (Data)
    initVoid() {
        const count = (this.variant === 0) ? 100 : 200;
        this.voidParticles = Array.from({ length: count }, () => ({
            angle: Math.random() * Math.PI * 2,
            dist: Math.random() * 300 + 50,
            speed: Math.random() * 0.05 + 0.01
        }));
    }
    drawVoid() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        const coreSize = (this.variant === 2) ? 10 : 40; // Singularity is small

        this.ctx.beginPath();
        this.ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
        this.ctx.fillStyle = '#000';
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.stroke();

        this.voidParticles.forEach(p => {
            p.angle += p.speed * (100 / p.dist);
            p.dist -= 0.5;
            if (p.dist < coreSize) p.dist = 350;

            const x = cx + Math.cos(p.angle) * p.dist;
            const y = cy + Math.sin(p.angle) * p.dist * ((this.variant === 1) ? 0.8 : 0.3); // Horizon is wider

            this.ctx.fillStyle = this.hexToRgba(this.colors[2], 0.8);
            this.ctx.fillRect(x, y, 2, 2);
        });
    }

    // 5. GALAXY (Circuit)
    initGalaxy() { }
    drawGalaxy() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(this.frame * 0.005);

        const arms = (this.variant === 0) ? 2 : ((this.variant === 1) ? 1 : 4); // Spiral(2), Elliptical(1 blob approx), Irregular(4)

        for (let j = 0; j < arms; j++) {
            const armOffset = j * (Math.PI * 2 / arms);
            for (let i = 0; i < 200; i += 2) {
                const angle = i * 0.1 + armOffset;
                const r = i * 2;
                const spread = (Math.random() - 0.5) * (this.variant === 2 ? 50 : 20);
                const x = Math.cos(angle) * r + spread;
                const y = Math.sin(angle) * r + spread;

                this.ctx.fillStyle = this.hexToRgba(this.colors[j % this.colors.length], 0.6);
                this.ctx.beginPath();
                this.ctx.arc(x, y, Math.random() * 2 + 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.restore();
    }

    // 6. QUASAR (Sign)
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
        const active = (this.variant === 2); // Active quasar
        const len = active ? 400 : 200;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(cx + len + flicker, cy - len - flicker);
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(cx - len - flicker, cy + len + flicker);
        this.ctx.stroke();
    }

    // 7. MULTI (Net)
    initMulti() {
        this.bubbles = Array.from({ length: 20 }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            r: Math.random() * 50 + 20
        }));
    }
    drawMulti() {
        this.bubbles.forEach(b => {
            // String variant -> Linear movement
            if (this.variant === 2) b.y -= 2;
            else b.y -= 0.5;

            if (b.y < -100) b.y = this.height + 100;

            this.ctx.strokeStyle = this.hexToRgba(this.colors[3] || '#fff', 0.3);
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            this.ctx.stroke();

            // Foam variant -> Solid fill
            if (this.variant === 1) {
                this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
                this.ctx.fill();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(b.x + b.r * 0.3, b.y - b.r * 0.3, b.r * 0.2, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
                this.ctx.fill();
            }
        });
    }
}
