/**
 * Generative Art Engines
 * 각 작가의 스타일에 맞는 다양한 시각 효과 엔진 모음
 */

class ArtEngine {
    constructor(canvas, ctx, colors) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.colors = colors || ['#ffffff'];
        this.width = canvas.width;
        this.height = canvas.height;
        this.frame = 0;
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
    constructor(canvas, ctx, colors) {
        super(canvas, ctx, colors);
        this.particles = [];
        this.initParticles();
    }

    initParticles() {
        const count = Math.floor((this.width * this.height) / 20000); // 밀도 조절
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
            alpha: Math.random() * 0.5 + 0.2, // Base alpha
            pulseSpeed: Math.random() * 0.05 + 0.01,
            pulseOffset: Math.random() * Math.PI * 2
        };
    }

    resize(width, height) {
        super.resize(width, height);
        this.initParticles();
    }

    update() {
        super.update();
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Soft boundaries
            if (p.x < -50) p.x = this.width + 50;
            if (p.x > this.width + 50) p.x = -50;
            if (p.y < -50) p.y = this.height + 50;
            if (p.y > this.height + 50) p.y = -50;
        });
    }

    draw() {
        // Trail effect
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.1)'; // Alpha controls trail length
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Connections (Max distance driven by screen size)
        const maxDist = Math.min(this.width, this.height) * 0.15;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Draw particle with pulse
            const currentAlpha = p.alpha + Math.sin(this.frame * p.pulseSpeed + p.pulseOffset) * 0.2;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.hexToRgba(p.color, Math.max(0, currentAlpha));
            this.ctx.fill();

            // Draw connections
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
}

/**
 * Geometric Engine (KURO-X)
 * 기하학적 형태, 선, 회전
 */
class GeometricEngine extends ArtEngine {
    constructor(canvas, ctx, colors) {
        super(canvas, ctx, colors);
        this.shapes = [];
        this.initShapes();
    }

    initShapes() {
        this.shapes = [];
        const count = 15;
        for (let i = 0; i < count; i++) {
            this.shapes.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 100 + 50,
                sides: Math.floor(Math.random() * 3) + 3, // 3 to 5 sides
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                lineWidth: Math.random() * 1 + 0.5
            });
        }
    }

    update() {
        super.update();
        this.shapes.forEach(s => {
            s.rotation += s.rotationSpeed;
            s.x += Math.sin(this.frame * 0.005 + s.size) * 0.5; // Gentle float
        });
    }

    resize(width, height) {
        super.resize(width, height);
        this.initShapes();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Background grid (subtle)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        const gridSize = 100;

        // Grid movement
        const offset = (this.frame * 0.5) % gridSize;

        this.ctx.beginPath();
        for (let x = offset; x < this.width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
        }
        this.ctx.stroke();

        this.ctx.beginPath();
        for (let y = offset; y < this.height; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
        }
        this.ctx.stroke();

        // Shapes
        this.shapes.forEach(s => {
            this.ctx.save();
            this.ctx.translate(s.x, s.y);
            this.ctx.rotate(s.rotation);
            this.ctx.strokeStyle = this.hexToRgba(s.color, 0.6);
            this.ctx.lineWidth = s.lineWidth;

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

            // Connecting lines to corners
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(Math.cos(0) * s.size, Math.sin(0) * s.size); // Just one for minimalism
            this.ctx.stroke();

            this.ctx.restore();
        });
    }
}

/**
 * Cyberpunk Engine (NEON-V)
 * 디지털 비, 글리치, 네온
 */
class CyberpunkEngine extends ArtEngine {
    constructor(canvas, ctx, colors) {
        super(canvas, ctx, colors);
        this.drops = [];
        this.initRain();
    }

    initRain() {
        const columns = Math.floor(this.width / 20);
        this.drops = Array(columns).fill(1).map(() => Math.random() * -100);
    }

    resize(width, height) {
        super.resize(width, height);
        this.initRain();
    }

    draw() {
        // Trail effect heavily used here
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = this.colors[0] || '#0f0';
        this.ctx.font = '15px monospace';

        for (let i = 0; i < this.drops.length; i++) {
            // Random character
            const char = String.fromCharCode(0x30A0 + Math.random() * 96);
            const x = i * 20;
            const y = this.drops[i] * 20;

            // Randomly switch colors
            if (Math.random() > 0.98) {
                this.ctx.fillStyle = this.colors[1] || '#fff';
            } else {
                this.ctx.fillStyle = this.hexToRgba(this.colors[0], 0.8);
            }

            this.ctx.fillText(char, x, y);

            if (y > this.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
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
 * Cosmic Engine (VOID-3)
 * 별, 깊이감, 회전
 */
class CosmicEngine extends ArtEngine {
    constructor(canvas, ctx, colors) {
        super(canvas, ctx, colors);
        this.stars = [];
        this.initStars();
    }

    initStars() {
        const count = 300;
        this.stars = Array.from({ length: count }, () => ({
            x: Math.random() * this.width - this.width / 2,
            y: Math.random() * this.height - this.height / 2,
            z: Math.random() * 1000 + 100, // Depth
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }));
    }

    update() {
        super.update();
        this.stars.forEach(star => {
            star.z -= 2; // Move towards viewer
            if (star.z <= 0) {
                star.z = 1000;
                star.x = Math.random() * this.width - this.width / 2;
                star.y = Math.random() * this.height - this.height / 2;
            }
        });
    }

    resize(width, height) {
        super.resize(width, height);
        this.initStars();
    }

    draw() {
        // Star trails
        this.ctx.fillStyle = 'rgba(5, 5, 10, 0.2)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        const cx = this.width / 2;
        const cy = this.height / 2;

        this.stars.forEach(star => {
            const scale = 300 / star.z;
            const x = cx + star.x * scale;
            const y = cy + star.y * scale;
            const r = Math.max(0.5, scale * 2);

            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, Math.PI * 2);
            this.ctx.fillStyle = this.hexToRgba(star.color, 0.8 * (1 - star.z / 1000));
            this.ctx.fill();
        });
    }
}
