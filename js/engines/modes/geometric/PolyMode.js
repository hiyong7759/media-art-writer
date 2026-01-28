export class PolyMode {
    constructor(engine) {
        this.engine = engine;
        this.shapes = [];
        this.style = 0;
        this.hexGrid = [];
        this.voronoiCells = [];
        this.pulsePhase = 0;
    }

    init(variant = 0) {
        this.style = variant;
        // Poly variants: 0: Shape, 1: Hexagon (벌집), 2: Voronoi

        if (this.style === 0) {
            // Shape: 회전하는 다각형들
            this.shapes = Array.from({ length: 8 }, () => ({
                x: Math.random() * this.engine.width,
                y: Math.random() * this.engine.height,
                size: Math.random() * 40 + 20,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.03,
                sides: Math.floor(Math.random() * 4) + 3,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
            }));
        } else if (this.style === 1) {
            // Hexagon: 벌집 그리드
            this.initHexGrid();
        } else {
            // Voronoi: 보로노이 다이어그램
            this.initVoronoi();
        }
    }

    initHexGrid() {
        this.hexGrid = [];
        const hexSize = 40;
        const hexHeight = hexSize * Math.sqrt(3);
        const hexWidth = hexSize * 2;

        for (let row = -1; row < this.engine.height / hexHeight + 1; row++) {
            for (let col = -1; col < this.engine.width / (hexWidth * 0.75) + 1; col++) {
                const x = col * hexWidth * 0.75;
                const y = row * hexHeight + (col % 2 ? hexHeight / 2 : 0);
                this.hexGrid.push({
                    x, y,
                    size: hexSize,
                    phase: Math.random() * Math.PI * 2,
                    color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)],
                    active: Math.random() > 0.3
                });
            }
        }
    }

    initVoronoi() {
        // 보로노이 시드 포인트
        this.voronoiCells = Array.from({ length: 20 }, () => ({
            x: Math.random() * this.engine.width,
            y: Math.random() * this.engine.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
        }));
    }

    draw() {
        const ctx = this.engine.ctx;
        this.pulsePhase += 0.02;

        if (this.style === 0) {
            this.drawShape(ctx);
        } else if (this.style === 1) {
            this.drawHexagon(ctx);
        } else {
            this.drawVoronoi(ctx);
        }
    }

    drawShape(ctx) {
        // 기존 Shape 로직
        this.shapes.forEach(s => {
            s.rotation += s.rotSpeed;
            s.x += Math.sin(this.engine.frame * 0.01 + s.size) * 0.3;
            if (s.x < 0) s.x = this.engine.width;
            if (s.x > this.engine.width) s.x = 0;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            ctx.strokeStyle = this.engine.hexToRgba(s.color, 0.85);
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < s.sides; i++) {
                const angle = (i / s.sides) * Math.PI * 2;
                const x = Math.cos(angle) * s.size;
                const y = Math.sin(angle) * s.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = this.engine.hexToRgba(s.color, 0.05);
            ctx.fill();
            ctx.restore();
        });
    }

    drawHexagon(ctx) {
        // 벌집 그리드: 맥동하는 육각형들
        this.hexGrid.forEach(hex => {
            if (!hex.active) return;

            const pulse = Math.sin(this.pulsePhase + hex.phase) * 0.3 + 0.7;
            const size = hex.size * pulse;

            ctx.save();
            ctx.translate(hex.x, hex.y);

            // 육각형 그리기
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
                const x = Math.cos(angle) * size;
                const y = Math.sin(angle) * size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            // 채우기 (맥동에 따라 알파 변화)
            const fillAlpha = pulse * 0.15;
            ctx.fillStyle = this.engine.hexToRgba(hex.color, fillAlpha);
            ctx.fill();

            // 테두리
            ctx.strokeStyle = this.engine.hexToRgba(hex.color, pulse * 0.8);
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 중심점 (밝게 빛남)
            if (pulse > 0.85) {
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(hex.color, 0.9);
                ctx.fill();
            }

            ctx.restore();
        });

        // 가끔 활성화 상태 변경 (파동 효과)
        if (Math.random() > 0.98) {
            const idx = Math.floor(Math.random() * this.hexGrid.length);
            this.hexGrid[idx].active = !this.hexGrid[idx].active;
        }
    }

    drawVoronoi(ctx) {
        // 보로노이: 셀 이동 + 영역 시각화
        const w = this.engine.width;
        const h = this.engine.height;

        // 셀 이동
        this.voronoiCells.forEach(cell => {
            cell.x += cell.vx;
            cell.y += cell.vy;

            // 경계 반사
            if (cell.x < 0 || cell.x > w) cell.vx *= -1;
            if (cell.y < 0 || cell.y > h) cell.vy *= -1;
            cell.x = Math.max(0, Math.min(w, cell.x));
            cell.y = Math.max(0, Math.min(h, cell.y));
        });

        // 보로노이 경계선 그리기 (근사)
        const step = 8;
        for (let x = 0; x < w; x += step) {
            for (let y = 0; y < h; y += step) {
                // 가장 가까운 두 셀 찾기
                let minDist1 = Infinity, minDist2 = Infinity;
                let closest1 = null, closest2 = null;

                this.voronoiCells.forEach(cell => {
                    const d = Math.hypot(x - cell.x, y - cell.y);
                    if (d < minDist1) {
                        minDist2 = minDist1;
                        closest2 = closest1;
                        minDist1 = d;
                        closest1 = cell;
                    } else if (d < minDist2) {
                        minDist2 = d;
                        closest2 = cell;
                    }
                });

                // 두 셀의 거리 차이가 작으면 경계선
                if (closest1 && closest2 && Math.abs(minDist1 - minDist2) < 15) {
                    const alpha = 1 - Math.abs(minDist1 - minDist2) / 15;
                    ctx.fillStyle = this.engine.hexToRgba(closest1.color, alpha * 0.8);
                    ctx.fillRect(x, y, step, step);
                }
            }
        }

        // 셀 중심점 그리기
        this.voronoiCells.forEach(cell => {
            ctx.beginPath();
            ctx.arc(cell.x, cell.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = cell.color;
            ctx.fill();

            // 글로우
            ctx.shadowBlur = 15;
            ctx.shadowColor = cell.color;
            ctx.beginPath();
            ctx.arc(cell.x, cell.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }
}
