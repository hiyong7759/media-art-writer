export class HUDMode {
    constructor(engine) {
        this.engine = engine;
        this.state = 0;
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.scale = 1.5;
        this.timer = 0;
        this.config = { shape: 0, colorShift: false, spinSpeed: 0.01 };
    }

    init(variant = 0) {
        this.config = {
            shape: variant,
            colorShift: variant % 2 === 0,
            spinSpeed: ((variant % 5) + 1) * 0.01
        };
        console.log(`[HUDMode] Variant: ${this.config.shape}`);

        this.pickNewTarget();
        this.state = 0;
        this.scale = 1.5;
        this.timer = 0;
        this.x = this.engine.width / 2;
        this.y = this.engine.height / 2;
    }

    pickNewTarget() {
        const margin = 100;
        this.targetX = margin + Math.random() * (this.engine.width - margin * 2);
        this.targetY = margin + Math.random() * (this.engine.height - margin * 2);
        this.state = 0;
    }

    draw() {
        const ctx = this.engine.ctx;
        const ease = 0.05;

        // Update logic included in draw
        if (this.state === 0) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            this.x += dx * ease;
            this.y += dy * ease;
            this.scale = 1.5 + Math.sin(this.engine.frame * 0.1) * 0.1;
            if (Math.abs(dx) < 5 && Math.abs(dy) < 5) this.state = 1;
        }
        else if (this.state === 1) {
            this.scale += (1.0 - this.scale) * 0.1;
            if (Math.abs(1.0 - this.scale) < 0.01) {
                this.scale = 1.0;
                this.state = 2;
                this.timer = 60;
            }
        }
        else if (this.state === 2) {
            this.timer--;
            if (this.timer <= 0) this.pickNewTarget();
        }

        const cx = this.x;
        const cy = this.y;
        const scale = this.scale;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);

        let mainColor = '#ff3333';
        if (this.state === 2) mainColor = '#00ffff';
        else if (this.state === 1) mainColor = '#ff3333';

        ctx.strokeStyle = mainColor;
        ctx.fillStyle = mainColor;
        ctx.lineWidth = 1.5;

        const size = 100;

        if (this.config.shape === 0) {
            ctx.beginPath();
            ctx.moveTo(-size, -size + 30); ctx.lineTo(-size, -size); ctx.lineTo(-size + 30, -size);
            ctx.moveTo(size - 30, -size); ctx.lineTo(size, -size); ctx.lineTo(size, -size + 30);
            ctx.moveTo(size, size - 30); ctx.lineTo(size, size); ctx.lineTo(size - 30, size);
            ctx.moveTo(-size + 30, size); ctx.lineTo(-size, size); ctx.lineTo(-size, size - 30);
            ctx.stroke();
        }
        else if (this.config.shape === 1) {
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.moveTo(0, -size - 10); ctx.lineTo(0, -size + 10);
            ctx.moveTo(0, size + 10); ctx.lineTo(0, size - 10);
            ctx.moveTo(-size - 10, 0); ctx.lineTo(-size + 10, 0);
            ctx.moveTo(size + 10, 0); ctx.lineTo(size - 10, 0);
            ctx.stroke();
        }
        else {
            ctx.strokeRect(-size, -size, size * 2, size * 2);
            ctx.fillRect(-size - 2, -size - 2, 4, 4);
            ctx.fillRect(size - 2, -size - 2, 4, 4);
            ctx.fillRect(size - 2, size - 2, 4, 4);
            ctx.fillRect(-size - 2, size - 2, 4, 4);
        }

        if (this.state !== 2) ctx.rotate(this.engine.frame * this.config.spinSpeed);

        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        const innerSize = this.config.shape === 1 ? 40 : 60;
        ctx.arc(0, 0, innerSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        if (this.state !== 2) ctx.rotate(-this.engine.frame * this.config.spinSpeed);

        ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.8);
        ctx.fillRect(-2, -10, 4, 20);
        ctx.fillRect(-10, -2, 20, 4);

        ctx.font = '12px "JetBrains Mono"';
        ctx.textAlign = 'center';
        let statusText = this.state === 2 ? "TARGET LOCKED" : "SEARCHING...";
        ctx.fillText(statusText, 0, -size - 15);
        ctx.fillText(`COORD: ${cx.toFixed(0)}, ${cy.toFixed(0)}`, 0, size + 25);

        // Pulse
        let pulseFreq = 0.2;
        if (this.state === 1) pulseFreq = 0.1;
        else if (this.state === 2) pulseFreq = 0.05;

        const beat = Math.sin(this.engine.frame * pulseFreq);
        if (beat > 0.8) {
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.5);
            ctx.lineWidth = 3;
            const baseSize = (this.config.shape === 1) ? 40 : 60;
            const pulseSize = baseSize + (beat - 0.8) * 30;
            ctx.beginPath();
            ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();

        // Graph
        const graphX = this.engine.width - 150;
        const graphY = this.engine.height / 2;
        const graphW = 200;

        ctx.save();
        ctx.translate(graphX, graphY);

        ctx.beginPath();
        ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.9);
        ctx.lineWidth = 2;
        ctx.moveTo(-graphW / 2, 0);

        for (let i = 0; i < graphW; i++) {
            const t = (this.engine.frame + i) * pulseFreq;
            let y = 0;
            const cycle = t % (Math.PI * 2);
            if (cycle < 0.5) y = Math.sin(cycle * 20) * (this.state === 2 ? 12 : 32); // simpler amplitude ref
            else y = Math.sin(cycle) * (this.state === 2 ? 5 : 12);
            ctx.lineTo(-graphW / 2 + i, -y);
        }
        ctx.stroke();

        let bpm = this.state === 0 ? "110 BPM" : (this.state === 1 ? "85 BPM" : "60 BPM");
        ctx.fillStyle = mainColor;
        ctx.font = 'bold 16px "JetBrains Mono"';
        ctx.textAlign = 'center';
        ctx.fillText(bpm, 0, 35);

        ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.5);
        ctx.lineWidth = 2;
        ctx.strokeRect(-graphW / 2 - 10, -50, graphW + 20, 100);
        ctx.restore();

        // Connecting Line
        if (this.state === 0) {
            ctx.beginPath();
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.2);
            ctx.moveTo(this.engine.width / 2, this.engine.height / 2);
            ctx.lineTo(cx, cy);
            ctx.stroke();
        }
    }
}
