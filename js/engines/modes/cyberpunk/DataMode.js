export class DataMode {
    constructor(engine) {
        this.engine = engine;
        this.lines = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        const text = (this.engine.data && this.engine.data.prompt) ? this.engine.data.prompt : "NO DATA SYSTEM OFFLINE";
        console.log(`[DataMode] Style: ${['Vertical', 'Horizontal', 'Scattered'][this.style]}`);

        this.lines = [];
        const w = this.engine.width;
        const h = this.engine.height;

        if (this.style === 0) {
            this.lines = Array.from({ length: 15 }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                speed: Math.random() * 2 + 2,
                text: text.substring(Math.floor(Math.random() * (text.length - 20))),
                color: Math.random() > 0.3 ? this.engine.colors[1] : '#ffffff',
                size: Math.floor(Math.random() * 10 + 16)
            }));
        } else if (this.style === 1) {
            this.lines = Array.from({ length: 8 }, (_, i) => ({
                x: Math.random() * w,
                y: (h / 8) * i + 50,
                speed: Math.random() * 10 + 5,
                text: text + " // " + text,
                color: this.engine.colors[0],
                size: Math.floor(Math.random() * 20 + 20)
            }));
        } else {
            this.lines = Array.from({ length: 30 }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                text: text.substring(Math.floor(Math.random() * text.length)).substring(0, 5),
                color: Math.random() > 0.5 ? this.engine.colors[0] : '#ffffff',
                size: Math.floor(Math.random() * 10 + 12),
                blinkSpeed: Math.random() * 0.1
            }));
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        if (this.engine.transparentMode) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, this.engine.width, this.engine.height);
        }

        this.lines.forEach(line => {
            ctx.font = `bold ${line.size}px "JetBrains Mono", monospace`;
            ctx.fillStyle = this.engine.hexToRgba(line.color, 1.0);

            if (this.style === 0) {
                line.y += line.speed;
                if (line.y > this.engine.height) line.y = -50;
                ctx.fillText(line.text.substring(0, 20), line.x, line.y);
            }
            else if (this.style === 1) {
                line.x -= line.speed;
                if (line.x < -1000) line.x = this.engine.width;
                ctx.fillText(line.text, line.x, line.y);
            }
            else {
                if (Math.sin(this.engine.frame * line.blinkSpeed) > 0) {
                    ctx.fillText(line.text, line.x, line.y);
                }
                if (Math.random() > 0.95) line.x = Math.random() * this.engine.width;
            }
        });
    }
}
