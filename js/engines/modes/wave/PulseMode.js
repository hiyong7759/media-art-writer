export class PulseMode {
    constructor(engine) {
        this.engine = engine;
        this.circles = [];
        this.variant = 0;
    }

    init(variant) {
        this.variant = variant;
        this.circles = [];
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;
        const time = this.engine.frame * 0.1;

        // Beat mechanism
        const beat = (Math.sin(time) + 1) * 0.5; // 0-1
        
        if (this.variant === 0) { // Rhythm: Multiple concentric rings
            const count = 5;
            for(let i=0; i<count; i++) {
                const r = 50 + i * 30 + beat * 20;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[i % this.engine.colors.length], 0.5);
                ctx.lineWidth = 2 + beat * 5;
                ctx.stroke();
            }
        } else if (this.variant === 1) { // Heartbeat: EKG style
            const w = this.engine.width;
            ctx.beginPath();
            ctx.strokeStyle = this.engine.colors[2]; // Red-ish usuall
            ctx.lineWidth = 3;
            
            for(let x=0; x<w; x+=5) {
                // Moving EKG
                const offset = (x + this.engine.frame * 5) % w;
                let y = cy;
                
                // Simulate spike
                if (offset > cx - 50 && offset < cx + 50) {
                     y += Math.sin((offset - cx) * 0.2) * 150 * Math.exp(-Math.pow((offset - cx)*0.05, 2));
                }
                
                // Drawing logic is tricky with modulo, simplify: just draw static line with moving pulse
                const drawX = x;
                const dist = Math.abs(drawX - ((this.engine.frame * 10) % w));
                let pulseY = cy;
                
                if (dist < 100) {
                     pulseY -= Math.sin(dist * 0.2) * 100 * (1 - dist/100);
                }
                
                if(x===0) ctx.moveTo(drawX, pulseY);
                else ctx.lineTo(drawX, pulseY);
            }
            ctx.stroke();
        } else { // Tempo: Metronome
            const angle = Math.sin(time) * 0.5;
            ctx.save();
            ctx.translate(cx, cy + 200);
            ctx.rotate(angle);
            ctx.fillStyle = this.engine.colors[0];
            ctx.fillRect(-5, -400, 10, 400); // Rod
            ctx.beginPath();
            ctx.arc(0, -350, 20, 0, Math.PI*2); // Weight
            ctx.fill();
            ctx.restore();
        }
    }
}
