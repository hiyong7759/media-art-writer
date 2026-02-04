export class ContourMode {
    constructor(engine) {
        this.engine = engine;
        this.lines = [];
        this.style = 0;
        this.gridPoints = [];
        this.satellites = [];
    }

    init(variant = 0) {
        this.style = variant;
        this.lines = [];
        this.gridPoints = [];
        this.satellites = [];

        if (this.style === 0) {
            // Topo: 지형도 등고선
            this.createTopoLines();
        } else if (this.style === 1) {
            // Grid: 격자 좌표계
            this.createGrid();
        } else {
            // Satellite: 위성 스캔 효과
            this.createSatellite();
        }
    }

    createTopoLines() {
        const h = this.engine.height;
        const lineCount = 12;

        // 수평 방향 등고선 (미니 프리뷰와 동일)
        for (let i = 0; i < lineCount; i++) {
            const baseY = (h / lineCount) * i + h / (lineCount * 2);
            // 각 라인의 노이즈 포인트들
            const noisePoints = Array.from({ length: 10 }, () => Math.random() * 20 - 10);

            this.lines.push({
                baseY,
                noisePoints,
                color: this.engine.colors[i % this.engine.colors.length],
                speed: Math.random() * 0.02 + 0.01,
                phase: i * 0.3,
                elevation: (lineCount - i) * 100
            });
        }
    }

    createGrid() {
        const spacing = 60;
        const w = this.engine.width;
        const h = this.engine.height;

        // 격자점 생성
        for (let x = spacing; x < w; x += spacing) {
            for (let y = spacing; y < h; y += spacing) {
                this.gridPoints.push({
                    x, y,
                    elevation: Math.sin(x * 0.01) * Math.cos(y * 0.01) * 50,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
    }

    createSatellite() {
        // 스캔 라인
        this.scanY = 0;
        this.scanSpeed = 2;

        // 감지된 특징점들
        for (let i = 0; i < 20; i++) {
            this.satellites.push({
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                size: 20 + Math.random() * 40,
                type: Math.floor(Math.random() * 3), // 0: circle, 1: square, 2: triangle
                detected: false
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawTopo(ctx, t);
        } else if (this.style === 1) {
            this.drawGrid(ctx, t);
        } else {
            this.drawSatellite(ctx, t);
        }
    }

    drawTopo(ctx, t) {
        const w = this.engine.width;

        this.lines.forEach((line, idx) => {
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = line.color;

            ctx.beginPath();
            ctx.strokeStyle = this.engine.hexToRgba(line.color, 0.7);
            ctx.lineWidth = 2;

            // 수평 방향 등고선 (미니 프리뷰와 동일한 로직)
            const step = 20;
            for (let x = 0; x <= w; x += step) {
                const segmentWidth = w / 10;
                const noiseIdx = Math.floor(x / segmentWidth);
                const offset = line.noisePoints[noiseIdx] || 0;
                const nextOffset = line.noisePoints[noiseIdx + 1] || 0;
                const lerp = (x % segmentWidth) / segmentWidth;
                const smoothOffset = offset * (1 - lerp) + nextOffset * lerp;

                const waveOffset = Math.sin(t + line.phase + idx) * 8;
                const y = line.baseY + smoothOffset * 3 + waveOffset;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.stroke();

            // 고도 표시 (숫자)
            if (idx % 3 === 0) {
                const labelX = w * 0.75;
                const segmentWidth = w / 10;
                const noiseIdx = Math.floor(labelX / segmentWidth);
                const offset = line.noisePoints[noiseIdx] || 0;
                const labelY = line.baseY + offset * 3;
                ctx.fillStyle = this.engine.hexToRgba(line.color, 0.8);
                ctx.font = '11px monospace';
                ctx.fillText(`${line.elevation}m`, labelX, labelY - 5);
            }

            ctx.restore();
        });
    }

    drawGrid(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;
        const color = this.engine.colors[0];

        // 격자선
        ctx.strokeStyle = this.engine.hexToRgba(color, 0.2);
        ctx.lineWidth = 1;

        // 세로선
        for (let x = 60; x < w; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        // 가로선
        for (let y = 60; y < h; y += 60) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // 격자점과 고도 표시
        this.gridPoints.forEach((p, i) => {
            const pulse = Math.sin(t + p.phase) * 0.5 + 0.5;
            const elevationPulse = p.elevation + Math.sin(t * 0.5 + p.phase) * 10;

            ctx.save();
            ctx.shadowBlur = 10 + pulse * 10;
            ctx.shadowColor = this.engine.colors[i % this.engine.colors.length];

            // 점
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3 + pulse * 2, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.colors[i % this.engine.colors.length];
            ctx.fill();

            // 고도 막대
            const barHeight = Math.abs(elevationPulse) * 0.5;
            ctx.fillStyle = this.engine.hexToRgba(this.engine.colors[i % this.engine.colors.length], 0.4);
            ctx.fillRect(p.x - 2, p.y - barHeight, 4, barHeight);

            ctx.restore();
        });

        // 좌표 표시
        ctx.fillStyle = this.engine.hexToRgba(color, 0.5);
        ctx.font = '9px monospace';
        for (let x = 60; x < w; x += 120) {
            ctx.fillText(x.toString(), x + 2, 12);
        }
        for (let y = 60; y < h; y += 120) {
            ctx.fillText(y.toString(), 2, y - 2);
        }
    }

    drawSatellite(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;

        // 스캔 라인 이동
        this.scanY = (this.scanY + this.scanSpeed) % h;

        // 스캔 라인 효과
        ctx.save();
        const gradient = ctx.createLinearGradient(0, this.scanY - 30, 0, this.scanY + 30);
        gradient.addColorStop(0, 'rgba(0, 255, 150, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 150, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 150, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, this.scanY - 30, w, 60);

        ctx.strokeStyle = 'rgba(0, 255, 150, 0.8)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ff96';
        ctx.beginPath();
        ctx.moveTo(0, this.scanY);
        ctx.lineTo(w, this.scanY);
        ctx.stroke();
        ctx.restore();

        // 특징점 감지 및 표시
        this.satellites.forEach((s, i) => {
            // 스캔 라인이 지나갔는지 확인
            if (Math.abs(this.scanY - s.y) < 5) {
                s.detected = true;
            }

            if (s.detected) {
                const color = this.engine.colors[i % this.engine.colors.length];
                const pulse = Math.sin(t * 2 + i) * 0.3 + 0.7;

                ctx.save();
                ctx.shadowBlur = 15;
                ctx.shadowColor = color;
                ctx.strokeStyle = this.engine.hexToRgba(color, pulse);
                ctx.lineWidth = 2;

                ctx.beginPath();
                if (s.type === 0) {
                    ctx.arc(s.x, s.y, s.size * pulse, 0, Math.PI * 2);
                } else if (s.type === 1) {
                    const half = s.size * pulse / 2;
                    ctx.rect(s.x - half, s.y - half, s.size * pulse, s.size * pulse);
                } else {
                    const r = s.size * pulse;
                    ctx.moveTo(s.x, s.y - r);
                    ctx.lineTo(s.x + r * 0.866, s.y + r * 0.5);
                    ctx.lineTo(s.x - r * 0.866, s.y + r * 0.5);
                    ctx.closePath();
                }
                ctx.stroke();

                // 좌표 표시
                ctx.fillStyle = this.engine.hexToRgba(color, 0.6);
                ctx.font = '9px monospace';
                ctx.fillText(`(${Math.floor(s.x)}, ${Math.floor(s.y)})`, s.x + s.size + 5, s.y);

                ctx.restore();
            }
        });

        // 리셋
        if (this.scanY < this.scanSpeed) {
            this.satellites.forEach(s => s.detected = false);
        }
    }
}
