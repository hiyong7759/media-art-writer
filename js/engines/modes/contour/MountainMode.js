export class MountainMode {
    constructor(engine) {
        this.engine = engine;
        this.mountains = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.mountains = [];

        if (this.style === 0) {
            // Peak: 독립적인 산봉우리들
            this.createPeaks();
        } else if (this.style === 1) {
            // Range: 연결된 산맥
            this.createRange();
        } else {
            // Valley: 계곡 (V자 형태)
            this.createValley();
        }
    }

    createPeaks() {
        const w = this.engine.width;
        const h = this.engine.height;

        for (let i = 0; i < 5; i++) {
            const baseX = w * (0.15 + i * 0.18);
            const baseY = h * 0.7;
            const peakHeight = 150 + Math.random() * 150;

            this.mountains.push({
                type: 'peak',
                x: baseX,
                y: baseY,
                height: peakHeight,
                width: 80 + Math.random() * 60,
                phase: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length],
                snowLine: 0.3 + Math.random() * 0.2 // 눈 덮인 부분
            });
        }
    }

    createRange() {
        const w = this.engine.width;
        const h = this.engine.height;
        const segments = 12;

        // 여러 층의 산맥
        for (let layer = 0; layer < 3; layer++) {
            const points = [];
            const baseY = h * (0.5 + layer * 0.15);

            for (let i = 0; i <= segments; i++) {
                const x = (w / segments) * i;
                const peakHeight = 50 + Math.sin(i * 0.8 + layer) * 80 + Math.random() * 30;
                points.push({
                    x,
                    y: baseY - peakHeight,
                    baseY
                });
            }

            this.mountains.push({
                type: 'range',
                points,
                layer,
                color: this.engine.colors[layer % this.engine.colors.length],
                phase: layer * 0.5
            });
        }
    }

    createValley() {
        const w = this.engine.width;
        const h = this.engine.height;
        const cx = w / 2;

        // 양쪽 산
        this.mountains.push({
            type: 'valley_left',
            x: 0,
            y: h * 0.3,
            color: this.engine.colors[0]
        });

        this.mountains.push({
            type: 'valley_right',
            x: w,
            y: h * 0.3,
            color: this.engine.colors[1]
        });

        // 계곡 바닥 강
        this.mountains.push({
            type: 'valley_river',
            cx,
            y: h * 0.75,
            color: this.engine.colors[2]
        });

        // 안개/구름
        for (let i = 0; i < 8; i++) {
            this.mountains.push({
                type: 'mist',
                x: Math.random() * w,
                y: h * 0.5 + Math.random() * h * 0.3,
                size: 50 + Math.random() * 100,
                speed: 0.2 + Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.01;

        if (this.style === 0) {
            this.drawPeaks(ctx, t);
        } else if (this.style === 1) {
            this.drawRange(ctx, t);
        } else {
            this.drawValley(ctx, t);
        }
    }

    drawPeaks(ctx, t) {
        this.mountains.forEach((m, idx) => {
            const sway = Math.sin(t + m.phase) * 2;

            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = m.color;

            // 산 본체
            ctx.beginPath();
            ctx.moveTo(m.x - m.width, m.y);
            ctx.lineTo(m.x + sway, m.y - m.height);
            ctx.lineTo(m.x + m.width, m.y);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(m.x, m.y - m.height, m.x, m.y);
            gradient.addColorStop(0, this.engine.hexToRgba('#ffffff', 0.8));
            gradient.addColorStop(m.snowLine, this.engine.hexToRgba(m.color, 0.7));
            gradient.addColorStop(1, this.engine.hexToRgba(m.color, 0.3));
            ctx.fillStyle = gradient;
            ctx.fill();

            // 윤곽선
            ctx.strokeStyle = this.engine.hexToRgba(m.color, 0.9);
            ctx.lineWidth = 2;
            ctx.stroke();

            // 정상 표시
            ctx.beginPath();
            ctx.arc(m.x + sway, m.y - m.height, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.restore();
        });
    }

    drawRange(ctx, t) {
        // 뒤에서 앞으로 (layer 역순)
        const sorted = [...this.mountains].sort((a, b) => a.layer - b.layer);

        sorted.forEach(m => {
            const wave = Math.sin(t + m.phase) * 3;

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = m.color;

            ctx.beginPath();
            ctx.moveTo(0, this.engine.height);

            m.points.forEach((p, i) => {
                const y = p.y + Math.sin(t * 0.5 + i * 0.3 + m.phase) * 5;
                if (i === 0) {
                    ctx.lineTo(p.x, y);
                } else {
                    // 부드러운 곡선
                    const prev = m.points[i - 1];
                    const cpX = (prev.x + p.x) / 2;
                    ctx.quadraticCurveTo(cpX, prev.y + wave, p.x, y);
                }
            });

            ctx.lineTo(this.engine.width, this.engine.height);
            ctx.closePath();

            // 레이어별 투명도
            const alpha = 0.3 + (2 - m.layer) * 0.2;
            ctx.fillStyle = this.engine.hexToRgba(m.color, alpha);
            ctx.fill();

            ctx.strokeStyle = this.engine.hexToRgba(m.color, 0.8);
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        });
    }

    drawValley(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;
        const cx = w / 2;

        this.mountains.forEach(m => {
            if (m.type === 'valley_left') {
                ctx.save();
                ctx.shadowBlur = 20;
                ctx.shadowColor = m.color;

                ctx.beginPath();
                ctx.moveTo(0, h);
                ctx.lineTo(0, m.y);
                ctx.quadraticCurveTo(w * 0.2, m.y - 100, cx - 50, h * 0.6);
                ctx.lineTo(cx - 50, h);
                ctx.closePath();

                ctx.fillStyle = this.engine.hexToRgba(m.color, 0.5);
                ctx.fill();
                ctx.strokeStyle = this.engine.hexToRgba(m.color, 0.8);
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();

            } else if (m.type === 'valley_right') {
                ctx.save();
                ctx.shadowBlur = 20;
                ctx.shadowColor = m.color;

                ctx.beginPath();
                ctx.moveTo(w, h);
                ctx.lineTo(w, m.y);
                ctx.quadraticCurveTo(w * 0.8, m.y - 100, cx + 50, h * 0.6);
                ctx.lineTo(cx + 50, h);
                ctx.closePath();

                ctx.fillStyle = this.engine.hexToRgba(m.color, 0.5);
                ctx.fill();
                ctx.strokeStyle = this.engine.hexToRgba(m.color, 0.8);
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();

            } else if (m.type === 'valley_river') {
                // 강
                ctx.save();
                ctx.shadowBlur = 15;
                ctx.shadowColor = m.color;

                ctx.beginPath();
                for (let x = cx - 40; x <= cx + 40; x += 5) {
                    const y = m.y + Math.sin(x * 0.05 + t * 2) * 10;
                    if (x === cx - 40) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = this.engine.hexToRgba(m.color, 0.7);
                ctx.lineWidth = 30;
                ctx.lineCap = 'round';
                ctx.stroke();
                ctx.restore();

            } else if (m.type === 'mist') {
                // 안개
                m.x += Math.sin(t + m.phase) * m.speed;
                if (m.x < -m.size) m.x = w + m.size;
                if (m.x > w + m.size) m.x = -m.size;

                const alpha = Math.sin(t * 0.5 + m.phase) * 0.1 + 0.15;
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fill();
            }
        });
    }
}
