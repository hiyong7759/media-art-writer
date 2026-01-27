import { ArtEngine } from './ArtEngine.js';

/**
 * BloomEngine (FLORA-9) - v3.2 (Stable & Distributed)
 * 초기 뭉침 현상을 해결하고 로딩 안정성을 확보한 버전
 */
export class BloomEngine extends ArtEngine {
    // FLORA-9 스킬 정의
    static SKILLS = [
        { name: 'Petal', nameKo: '꽃잎', variants: ['Rose', 'Cherry', 'Lily'] },
        { name: 'Bloom', nameKo: '개화', variants: ['Full', 'Bud', 'Wild'] },
        { name: 'Bouquet', nameKo: '꽃다발', variants: ['Round', 'Cascade', 'Posy'] },
        { name: 'Vine', nameKo: '덩굴', variants: ['Ivy', 'Thorn', 'Creeper'] },
        { name: 'Pollen', nameKo: '꽃가루', variants: ['Dust', 'Sparkle', 'Scent'] },
        { name: 'Garden', nameKo: '정원', variants: ['Secret', 'Zen', 'Maze'] },
        { name: 'Dry', nameKo: '건조', variants: ['Pressed', 'Withered', 'Vintage'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.frame = 0;
        this.items = [];
        this.setMode(0, 0); // Default: Petal
    }

    init() {
        this.items = [];
        const count = this.getParticleCount();
        for (let i = 0; i < count; i++) {
            this.items.push(this.createItem());
        }
    }

    getParticleCount() {
        let base = 40;
        switch (this.mode) {
            case 'petal': base = 50; break;
            case 'pollen': base = 120; break;
            case 'vine': base = 8; break;
            case 'garden': base = 40; break;
            case 'dry': base = 30; break;
            default: base = 40;
        }

        // Variant Logic
        if (this.currentVariant === 1) return Math.floor(base * 0.5); // Less items
        if (this.currentVariant === 2) return Math.floor(base * 1.5); // More items
        return base;
    }

    createItem() {
        // Variant Logic for Size
        let sizeMult = 1.0;
        if (this.currentVariant === 1) sizeMult = 0.7; // Smaller
        if (this.currentVariant === 2) sizeMult = 1.3; // Larger

        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: (Math.random() * 12 + 5) * sizeMult,
            angle: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.01,
            sway: Math.random() * 0.05,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            alpha: Math.random() * 0.6 + 0.3,
            rotation: Math.random() * Math.PI * 2,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            progress: 0,
            points: [{ x: Math.random() * this.width, y: Math.random() * this.height }],
            maxLength: 100 + Math.random() * 100,
            decorations: []
        };
    }

    // 새 표준 인터페이스
    setMode(modeIndex, variantIndex = 0) {
        super.setMode(modeIndex, variantIndex);
        this.ctx.clearRect(0, 0, this.width, this.height);

        const modeNames = ['petal', 'bloom', 'bouquet', 'vine', 'pollen', 'garden', 'dry'];
        this.mode = modeNames[modeIndex] || 'petal';

        console.log(`[BloomEngine] Mode: ${modeIndex} (${this.mode}), Variant: ${variantIndex}`);
        this.init();
    }


    update() {
        this.frame++;
        this.items.forEach(item => {
            switch (this.mode) {
                case 'petal':
                    item.angle += item.speed;
                    item.x += Math.sin(this.frame * item.sway) * 0.7;
                    item.y += 1.2 + Math.cos(this.frame * item.sway) * 0.4;
                    if (item.y > this.height + 50) {
                        item.y = -50;
                        item.x = Math.random() * this.width;
                    }
                    break;
                case 'pollen':
                    item.vx += (Math.random() - 0.5) * 0.1;
                    item.vy += (Math.random() - 0.5) * 0.1;
                    item.vx *= 0.96;
                    item.vy *= 0.96;
                    item.x += item.vx + Math.sin(this.frame * 0.02) * 0.3;
                    item.y += item.vy + Math.cos(this.frame * 0.02) * 0.3;
                    if (item.x < 0) item.x = this.width;
                    if (item.x > this.width) item.x = 0;
                    if (item.y < 0) item.y = this.height;
                    if (item.y > this.height) item.y = 0;
                    break;
                case 'vine':
                    if (item.points.length < item.maxLength) {
                        const last = item.points[item.points.length - 1];
                        item.angle += (Math.random() - 0.5) * 0.4;
                        const nx = last.x + Math.cos(item.angle) * 3;
                        const ny = last.y + Math.sin(item.angle) * 3;
                        item.points.push({ x: nx, y: ny });
                    } else if (Math.random() > 0.99) {
                        Object.assign(item, this.createItem());
                    }
                    break;
                default:
                    item.angle += item.speed;
            }
        });
    }

    draw() {
        this.ctx.globalCompositeOperation = 'source-over';
        if (this.hasBackgroundImage) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        } else {
            this.ctx.fillStyle = '#0a0514';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        this.items.forEach(item => {
            this.ctx.save();
            this.ctx.translate(item.x, item.y);
            this.ctx.rotate(item.angle + item.rotation);

            if (this.mode === 'petal') this.drawPetal(item);
            else if (this.mode === 'pollen') this.drawPollen(item);
            else if (this.mode === 'vine') {
                this.ctx.restore();
                this.drawVine(item);
                return;
            } else this.drawPetal(item);

            this.ctx.restore();
        });
    }

    drawPetal(item) {
        this.ctx.beginPath();
        const s = item.size;
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(-s, -s, 0, -s * 3);
        this.ctx.quadraticCurveTo(s * 0.5, -s * 1.5, 0, -s * 2.2);
        this.ctx.quadraticCurveTo(-s * 0.5, -s * 1.5, 0, -s * 3);
        this.ctx.quadraticCurveTo(s, -s, 0, 0);
        this.ctx.fillStyle = this.hexToRgba(item.color, item.alpha);
        this.ctx.fill();
    }

    drawPollen(item) {
        const r = item.size * 2;
        const g = this.ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, this.hexToRgba(item.color, 0.7));
        g.addColorStop(1, 'transparent');
        this.ctx.fillStyle = g;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawVine(item) {
        if (!item.points || item.points.length < 2) return;
        this.ctx.beginPath();
        this.ctx.moveTo(item.points[0].x, item.points[0].y);
        item.points.forEach(p => this.ctx.lineTo(p.x, p.y));
        this.ctx.strokeStyle = this.hexToRgba(item.color, 0.6);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    hexToRgba(hex, alpha) {
        let r = 0, g = 0, b = 0;
        if (hex.startsWith('#')) hex = hex.slice(1);
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16); g = parseInt(hex[1] + hex[1], 16); b = parseInt(hex[2] + hex[2], 16);
        } else {
            r = parseInt(hex.slice(0, 2), 16); g = parseInt(hex.slice(2, 4), 16); b = parseInt(hex.slice(4, 6), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
