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
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.1)'; // Trails
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Shapes
        this.shapes.forEach(s => {
            s.rotation += s.rotationSpeed;
            // Gentle float movement like index
            s.x += Math.sin(this.frame * 0.005 + s.size) * 0.5;

            this.ctx.save();
            this.ctx.translate(s.x, s.y);
            this.ctx.rotate(s.rotation);
            this.ctx.strokeStyle = this.hexToRgba(s.color, 0.7);
            this.ctx.lineWidth = 1.5;

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
            // Korean character
            const koreanChars = '가나다라마바사아자차카타파하디지털코드데이터미래네온시티전력신호접속흐름빛';
            const char = koreanChars[Math.floor(Math.random() * koreanChars.length)];
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
