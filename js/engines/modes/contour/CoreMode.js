export class CoreMode {
    constructor(engine) {
        this.engine = engine;
        this.elements = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.elements = [];

        if (this.style === 0) {
            // Inner: 지구 내핵 (동심원 구조)
            this.createInnerCore();
        } else if (this.style === 1) {
            // Magma: 마그마 대류
            this.createMagma();
        } else {
            // Solid: 고체 핵 (결정 구조)
            this.createSolidCore();
        }
    }

    createInnerCore() {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 지구 내부 층
        const layers = [
            { name: 'crust', radius: 200, color: this.engine.colors[0] },      // 지각
            { name: 'mantle', radius: 160, color: this.engine.colors[1] },     // 맨틀
            { name: 'outer', radius: 110, color: this.engine.colors[2] },      // 외핵
            { name: 'inner', radius: 50, color: '#ffaa00' }                     // 내핵
        ];

        layers.forEach((layer, i) => {
            this.elements.push({
                type: 'core_layer',
                cx, cy,
                radius: layer.radius,
                color: layer.color,
                name: layer.name,
                phase: i * 0.5
            });
        });

        // 열 흐름 화살표
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.elements.push({
                type: 'heat_flow',
                cx, cy,
                angle,
                innerR: 60,
                outerR: 180,
                phase: i * 0.3
            });
        }
    }

    createMagma() {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 대류 셀
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            this.elements.push({
                type: 'convection_cell',
                cx: cx + Math.cos(angle) * 80,
                cy: cy + Math.sin(angle) * 80,
                radius: 60,
                direction: i % 2 === 0 ? 1 : -1,
                color: this.engine.colors[i % this.engine.colors.length],
                phase: i * 0.5
            });
        }

        // 마그마 버블
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 150;
            this.elements.push({
                type: 'magma_particle',
                x: cx + Math.cos(angle) * dist,
                y: cy + Math.sin(angle) * dist,
                size: 5 + Math.random() * 15,
                speed: 0.3 + Math.random() * 0.5,
                angle: Math.random() * Math.PI * 2,
                phase: Math.random() * Math.PI * 2
            });
        }

        // 중심 핫스팟
        this.elements.push({
            type: 'hotspot',
            cx, cy,
            radius: 40
        });
    }

    createSolidCore() {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 결정 격자
        const gridSize = 40;
        for (let x = -4; x <= 4; x++) {
            for (let y = -4; y <= 4; y++) {
                const dist = Math.sqrt(x * x + y * y);
                if (dist <= 4) {
                    this.elements.push({
                        type: 'crystal_node',
                        x: cx + x * gridSize,
                        y: cy + y * gridSize,
                        size: 8 - dist,
                        phase: (x + y) * 0.3,
                        color: this.engine.colors[Math.abs(x + y) % this.engine.colors.length]
                    });
                }
            }
        }

        // 격자 연결선
        this.elements.push({
            type: 'crystal_bonds',
            cx, cy,
            gridSize
        });

        // 진동 파동
        for (let i = 0; i < 3; i++) {
            this.elements.push({
                type: 'vibration_wave',
                cx, cy,
                radius: 50 + i * 50,
                phase: i * 0.5
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawInnerCore(ctx, t);
        } else if (this.style === 1) {
            this.drawMagma(ctx, t);
        } else {
            this.drawSolidCore(ctx, t);
        }
    }

    drawInnerCore(ctx, t) {
        // 층 (바깥에서 안으로)
        const layers = this.elements.filter(el => el.type === 'core_layer')
            .sort((a, b) => b.radius - a.radius);

        layers.forEach(layer => {
            const pulse = Math.sin(t * 0.5 + layer.phase) * 5;
            const r = layer.radius + pulse;

            ctx.save();
            ctx.shadowBlur = 25;
            ctx.shadowColor = layer.color;

            // 층 원
            ctx.beginPath();
            ctx.arc(layer.cx, layer.cy, r, 0, Math.PI * 2);

            const gradient = ctx.createRadialGradient(
                layer.cx, layer.cy, 0,
                layer.cx, layer.cy, r
            );
            gradient.addColorStop(0, this.engine.hexToRgba(layer.color, 0.03));
            gradient.addColorStop(0.7, this.engine.hexToRgba(layer.color, 0.08));
            gradient.addColorStop(1, this.engine.hexToRgba(layer.color, 0.15));
            ctx.fillStyle = gradient;
            ctx.fill();

            // 경계선
            ctx.strokeStyle = this.engine.hexToRgba(layer.color, 0.8);
            ctx.lineWidth = 2;
            ctx.stroke();

            // 층 이름 표시
            if (layer.name === 'crust') {
                ctx.fillStyle = this.engine.hexToRgba(layer.color, 0.8);
                ctx.font = '12px monospace';
                ctx.fillText('Crust', layer.cx + r - 40, layer.cy - 10);
            }

            ctx.restore();
        });

        // 열 흐름
        this.elements.filter(el => el.type === 'heat_flow').forEach(el => {
            const wave = Math.sin(t * 2 + el.phase);

            ctx.save();
            ctx.translate(el.cx, el.cy);
            ctx.rotate(el.angle);

            // 화살표 형태의 열 흐름
            const flowOffset = (t * 30 + el.phase * 50) % (el.outerR - el.innerR);

            for (let r = el.innerR; r < el.outerR; r += 30) {
                const alpha = 1 - (r - el.innerR) / (el.outerR - el.innerR);
                const rPos = r + flowOffset;
                if (rPos > el.innerR && rPos < el.outerR) {
                    ctx.beginPath();
                    ctx.moveTo(0, -rPos);
                    ctx.lineTo(-5, -rPos + 10);
                    ctx.lineTo(5, -rPos + 10);
                    ctx.closePath();
                    ctx.fillStyle = `rgba(255, 150, 50, ${alpha * 0.15})`;
                    ctx.fill();
                }
            }

            ctx.restore();
        });
    }

    drawMagma(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 배경 원
        ctx.save();
        const bgGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
        bgGradient.addColorStop(0, 'rgba(255, 100, 0, 0.08)');
        bgGradient.addColorStop(0.5, 'rgba(200, 50, 0, 0.05)');
        bgGradient.addColorStop(1, 'rgba(100, 20, 0, 0.02)');
        ctx.beginPath();
        ctx.arc(cx, cy, 200, 0, Math.PI * 2);
        ctx.fillStyle = bgGradient;
        ctx.fill();
        ctx.restore();

        // 대류 셀
        this.elements.filter(el => el.type === 'convection_cell').forEach(el => {
            ctx.save();
            ctx.translate(el.cx, el.cy);
            ctx.rotate(t * el.direction * 0.5);

            ctx.shadowBlur = 20;
            ctx.shadowColor = el.color;

            // 나선형 대류
            ctx.beginPath();
            for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
                const r = angle * el.radius / (Math.PI * 4);
                const x = Math.cos(angle * el.direction) * r;
                const y = Math.sin(angle * el.direction) * r;
                if (angle === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.strokeStyle = this.engine.hexToRgba(el.color, 0.6);
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.restore();
        });

        // 마그마 파티클
        this.elements.filter(el => el.type === 'magma_particle').forEach(el => {
            // 대류 움직임
            el.angle += 0.02;
            const convectionForce = Math.sin(t + el.phase) * 0.5;
            el.x += Math.cos(el.angle) * el.speed + convectionForce;
            el.y += Math.sin(el.angle) * el.speed;

            // 중심으로 끌어당김
            const dx = cx - el.x;
            const dy = cy - el.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 150) {
                el.x += dx * 0.02;
                el.y += dy * 0.02;
            }

            const pulse = Math.sin(t * 3 + el.phase) * 0.3 + 1;
            const alpha = 0.4 + Math.sin(t * 2 + el.phase) * 0.2;

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff6600';

            ctx.beginPath();
            ctx.arc(el.x, el.y, el.size * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, ${100 + Math.floor(pulse * 50)}, 0, ${alpha * 0.3})`;
            ctx.fill();

            ctx.restore();
        });

        // 핫스팟
        this.elements.filter(el => el.type === 'hotspot').forEach(el => {
            const pulse = Math.sin(t * 2) * 10 + el.radius;

            ctx.save();
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#ffaa00';

            const gradient = ctx.createRadialGradient(el.cx, el.cy, 0, el.cx, el.cy, pulse);
            gradient.addColorStop(0, 'rgba(255, 255, 200, 0.25)');
            gradient.addColorStop(0.3, 'rgba(255, 200, 50, 0.18)');
            gradient.addColorStop(0.6, 'rgba(255, 100, 0, 0.12)');
            gradient.addColorStop(1, 'rgba(200, 50, 0, 0.05)');

            ctx.beginPath();
            ctx.arc(el.cx, el.cy, pulse, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.restore();
        });
    }

    drawSolidCore(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 진동 파동
        this.elements.filter(el => el.type === 'vibration_wave').forEach(el => {
            const expandedR = el.radius + Math.sin(t * 2 + el.phase) * 20;
            const alpha = 0.3 - (el.radius / 200) * 0.2;

            ctx.save();
            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[0], alpha);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(el.cx, el.cy, expandedR, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });

        // 격자 연결선
        this.elements.filter(el => el.type === 'crystal_bonds').forEach(el => {
            ctx.save();
            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[1], 0.2);
            ctx.lineWidth = 1;

            // 수평 연결
            for (let y = -4; y <= 4; y++) {
                for (let x = -4; x < 4; x++) {
                    const dist1 = Math.sqrt(x * x + y * y);
                    const dist2 = Math.sqrt((x + 1) * (x + 1) + y * y);
                    if (dist1 <= 4 && dist2 <= 4) {
                        const wave = Math.sin(t + (x + y) * 0.3) * 3;
                        ctx.beginPath();
                        ctx.moveTo(el.cx + x * el.gridSize + wave, el.cy + y * el.gridSize);
                        ctx.lineTo(el.cx + (x + 1) * el.gridSize + wave, el.cy + y * el.gridSize);
                        ctx.stroke();
                    }
                }
            }

            // 수직 연결
            for (let x = -4; x <= 4; x++) {
                for (let y = -4; y < 4; y++) {
                    const dist1 = Math.sqrt(x * x + y * y);
                    const dist2 = Math.sqrt(x * x + (y + 1) * (y + 1));
                    if (dist1 <= 4 && dist2 <= 4) {
                        const wave = Math.sin(t + (x + y) * 0.3) * 3;
                        ctx.beginPath();
                        ctx.moveTo(el.cx + x * el.gridSize, el.cy + y * el.gridSize + wave);
                        ctx.lineTo(el.cx + x * el.gridSize, el.cy + (y + 1) * el.gridSize + wave);
                        ctx.stroke();
                    }
                }
            }

            ctx.restore();
        });

        // 결정 노드
        this.elements.filter(el => el.type === 'crystal_node').forEach(el => {
            const vibration = Math.sin(t * 3 + el.phase) * 3;
            const pulse = Math.sin(t * 2 + el.phase) * 0.3 + 1;

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = el.color;

            ctx.beginPath();
            ctx.arc(el.x + vibration, el.y + vibration * 0.5, el.size * pulse, 0, Math.PI * 2);

            const gradient = ctx.createRadialGradient(
                el.x + vibration, el.y + vibration * 0.5, 0,
                el.x + vibration, el.y + vibration * 0.5, el.size * pulse
            );
            gradient.addColorStop(0, this.engine.hexToRgba('#ffffff', 0.25));
            gradient.addColorStop(0.5, this.engine.hexToRgba(el.color, 0.15));
            gradient.addColorStop(1, this.engine.hexToRgba(el.color, 0.08));
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.restore();
        });
    }
}
