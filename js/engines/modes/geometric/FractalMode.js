export class FractalMode {
    constructor(engine) {
        this.engine = engine;
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
    }

    draw() {
        const ctx = this.engine.ctx;
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        if (this.style === 0) {
            // Tree: 중앙에서 자라는 나무
            this.drawTree(cx, cy + 120, 90, -Math.PI / 2, 0);
        } else if (this.style === 1) {
            // Snowflake: 코흐 눈송이
            this.drawSnowflake(cx, cy);
        } else {
            // Sierpinski: 시에르핀스키 삼각형
            this.drawSierpinski(cx, cy - 100, 200, 0);
        }
    }

    drawTree(x, y, len, angle, depth) {
        if (depth > 10 || len < 4) return;
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.015;

        // 바람에 흔들림 (위쪽 가지일수록 더 많이)
        const sway = Math.sin(t + x * 0.01) * 0.03 * depth;
        const ex = x + Math.cos(angle + sway) * len;
        const ey = y + Math.sin(angle + sway) * len;

        // 줄기: 굵고 아래쪽, 가지: 가늘고 위쪽
        const thickness = Math.max(1.5, 14 - depth * 1.3);

        const baseColor = this.engine.colors[0];

        ctx.lineCap = 'round';

        // 기둥/가지 그리기
        if (depth < 3) {
            // 줄기: 더 밝고 굵게, 흰색 외곽
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffffff';

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = thickness + 3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            ctx.strokeStyle = baseColor;
            ctx.lineWidth = thickness;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        } else {
            // 가지: 글로우 + 흰색 섞임
            ctx.shadowBlur = 12;
            ctx.shadowColor = baseColor;

            const whiteBlend = Math.min(0.8, depth * 0.1);
            ctx.strokeStyle = `rgba(255, 255, 255, ${whiteBlend})`;
            ctx.lineWidth = thickness + 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            ctx.strokeStyle = baseColor;
            ctx.lineWidth = thickness;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        }

        ctx.shadowBlur = 0;

        // 가지 분기
        if (len > 4) {
            const spread = 0.4 + Math.random() * 0.2;
            const shrink = 0.68 + Math.random() * 0.1;

            this.drawTree(ex, ey, len * shrink, angle - spread, depth + 1);
            this.drawTree(ex, ey, len * shrink, angle + spread, depth + 1);

            if (depth < 4 && Math.random() > 0.6) {
                this.drawTree(ex, ey, len * shrink * 0.7, angle, depth + 1);
            }
        }
    }

    drawSnowflake(cx, cy) {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.005;
        const size = 200;
        const color = this.engine.colors[0];

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t);

        // 강한 글로우
        ctx.shadowBlur = 30;
        ctx.shadowColor = color;

        // 6개 가지
        for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.rotate((i / 6) * Math.PI * 2);

            // 흰색 외곽
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            this.drawKochBranch(0, 0, size, 4);

            // 색상 내부
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            this.drawKochBranch(0, 0, size, 4);

            ctx.restore();
        }

        ctx.shadowBlur = 0;
        ctx.restore();

        // 중심 빛 (더 크게)
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    drawKochBranch(x, y, len, depth) {
        const ctx = this.engine.ctx;
        if (depth === 0) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y - len);
            ctx.stroke();
            return;
        }

        const seg = len / 3;

        // 메인 줄기
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - seg);
        ctx.stroke();

        // 양쪽 가지
        ctx.save();
        ctx.translate(x, y - seg);
        ctx.rotate(-Math.PI / 3);
        this.drawKochBranch(0, 0, seg, depth - 1);
        ctx.restore();

        ctx.save();
        ctx.translate(x, y - seg);
        ctx.rotate(Math.PI / 3);
        this.drawKochBranch(0, 0, seg, depth - 1);
        ctx.restore();

        // 위쪽 계속
        this.drawKochBranch(x, y - seg * 2, seg, depth - 1);
    }

    drawSierpinski(cx, cy, size, depth) {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.01;

        // 전체 회전 + 줌 효과
        const zoom = 1 + Math.sin(t * 0.5) * 0.15;
        const rotation = t * 0.2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.scale(zoom, zoom);
        ctx.translate(-cx, -cy);

        // 메인 삼각형 그리기 시작
        this.drawSierpinskiTriangle(cx, cy, size * 1.2, 0);

        ctx.restore();
    }

    drawSierpinskiTriangle(cx, cy, size, depth) {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (depth > 6 || size < 8) return;

        const h = size * Math.sqrt(3) / 2;
        const p1 = { x: cx, y: cy - h * 0.6 };
        const p2 = { x: cx - size / 2, y: cy + h * 0.4 };
        const p3 = { x: cx + size / 2, y: cy + h * 0.4 };

        const color = this.engine.colors[depth % this.engine.colors.length];

        // 빈 삼각형 (가운데) - 이게 시에르핀스키의 핵심
        if (depth > 0) {
            const midH = h / 2;
            const m1 = { x: cx, y: cy + h * 0.15 };
            const m2 = { x: cx - size / 4, y: cy - h * 0.1 };
            const m3 = { x: cx + size / 4, y: cy - h * 0.1 };

            // 빈 삼각형을 밝게 표시 (역삼각형)
            ctx.beginPath();
            ctx.moveTo(m1.x, m1.y);
            ctx.lineTo(m2.x, m2.y);
            ctx.lineTo(m3.x, m3.y);
            ctx.closePath();

            const pulse = Math.sin(t + depth * 1.5) * 0.3 + 0.5;
            ctx.fillStyle = this.engine.hexToRgba(color, pulse * 0.4);
            ctx.fill();
        }

        // 외곽선
        ctx.shadowBlur = 15 - depth * 2;
        ctx.shadowColor = color;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();

        ctx.strokeStyle = this.engine.hexToRgba(color, 0.9 - depth * 0.1);
        ctx.lineWidth = Math.max(1, 3 - depth * 0.4);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // 재귀: 3개의 작은 삼각형 (꼭짓점 방향)
        const newSize = size / 2;
        this.drawSierpinskiTriangle(cx, cy - h * 0.3, newSize, depth + 1);
        this.drawSierpinskiTriangle(cx - size / 4, cy + h * 0.2, newSize, depth + 1);
        this.drawSierpinskiTriangle(cx + size / 4, cy + h * 0.2, newSize, depth + 1);
    }
}
