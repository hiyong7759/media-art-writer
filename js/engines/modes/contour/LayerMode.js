export class LayerMode {
    constructor(engine) {
        this.engine = engine;
        this.elements = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.elements = [];

        if (this.style === 0) {
            // Strata: 지층
            this.createStrata();
        } else if (this.style === 1) {
            // Fault: 단층
            this.createFault();
        } else {
            // Bedrock: 기반암
            this.createBedrock();
        }
    }

    createStrata() {
        const w = this.engine.width;
        const h = this.engine.height;
        const layers = 10;

        for (let i = 0; i < layers; i++) {
            const y = (h / layers) * i;
            const thickness = h / layers;
            const tilt = (Math.random() - 0.5) * 20;

            this.elements.push({
                type: 'stratum',
                y,
                thickness,
                tilt,
                color: this.engine.colors[i % this.engine.colors.length],
                pattern: Math.floor(Math.random() * 3), // 0: solid, 1: dotted, 2: striped
                phase: i * 0.2
            });
        }

        // 화석
        for (let i = 0; i < 8; i++) {
            this.elements.push({
                type: 'fossil',
                x: Math.random() * w,
                y: Math.random() * h,
                size: 15 + Math.random() * 20,
                rotation: Math.random() * Math.PI * 2,
                fossylType: Math.floor(Math.random() * 3) // 0: shell, 1: leaf, 2: bone
            });
        }
    }

    createFault() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 단층선
        const faultX = w * 0.5;
        const offset = 50;

        this.elements.push({
            type: 'fault_line',
            x: faultX,
            offset
        });

        // 좌측 지층
        for (let i = 0; i < 6; i++) {
            this.elements.push({
                type: 'fault_layer',
                side: 'left',
                index: i,
                y: (h / 6) * i,
                offset: -offset,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }

        // 우측 지층 (어긋남)
        for (let i = 0; i < 6; i++) {
            this.elements.push({
                type: 'fault_layer',
                side: 'right',
                index: i,
                y: (h / 6) * i + offset,
                offset: offset,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }

        // 균열 파편
        for (let i = 0; i < 20; i++) {
            this.elements.push({
                type: 'debris',
                x: faultX + (Math.random() - 0.5) * 100,
                y: Math.random() * h,
                size: 3 + Math.random() * 8,
                vx: (Math.random() - 0.5) * 0.5,
                vy: Math.random() * 0.5
            });
        }
    }

    createBedrock() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 거대한 암반 블록들
        for (let i = 0; i < 5; i++) {
            const blockW = 100 + Math.random() * 150;
            const blockH = 80 + Math.random() * 120;

            this.elements.push({
                type: 'bedrock_block',
                x: (w / 5) * i + Math.random() * 50,
                y: h * 0.3 + Math.random() * h * 0.4,
                width: blockW,
                height: blockH,
                rotation: (Math.random() - 0.5) * 0.2,
                color: this.engine.colors[i % this.engine.colors.length],
                phase: Math.random() * Math.PI * 2
            });
        }

        // 광맥
        for (let i = 0; i < 3; i++) {
            this.elements.push({
                type: 'vein',
                startX: Math.random() * w,
                startY: Math.random() * h,
                length: 100 + Math.random() * 150,
                angle: Math.random() * Math.PI,
                color: this.engine.colors[(i + 2) % this.engine.colors.length]
            });
        }

        // 균열
        for (let i = 0; i < 10; i++) {
            this.elements.push({
                type: 'crack',
                x: Math.random() * w,
                y: Math.random() * h,
                length: 30 + Math.random() * 50,
                angle: Math.random() * Math.PI
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.01;

        if (this.style === 0) {
            this.drawStrata(ctx, t);
        } else if (this.style === 1) {
            this.drawFault(ctx, t);
        } else {
            this.drawBedrock(ctx, t);
        }
    }

    drawStrata(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;

        // 지층
        this.elements.filter(el => el.type === 'stratum').forEach(el => {
            const wave = Math.sin(t * 0.3 + el.phase) * 3;

            ctx.save();
            ctx.shadowBlur = 8;
            ctx.shadowColor = el.color;

            ctx.beginPath();

            // 기울어진 지층
            const tiltOffset = el.tilt;
            ctx.moveTo(0, el.y + wave - tiltOffset);

            for (let x = 0; x <= w; x += 20) {
                const noise = Math.sin(x * 0.03 + el.phase) * 5;
                const tilt = (x / w) * tiltOffset * 2;
                ctx.lineTo(x, el.y + noise + wave + tilt);
            }

            ctx.lineTo(w, el.y + el.thickness + wave + tiltOffset);
            ctx.lineTo(0, el.y + el.thickness + wave - tiltOffset);
            ctx.closePath();

            ctx.fillStyle = this.engine.hexToRgba(el.color, 0.1);
            ctx.fill();

            // 패턴
            if (el.pattern === 1) {
                // 점선 패턴
                for (let x = 10; x < w; x += 30) {
                    for (let y = el.y + 10; y < el.y + el.thickness - 10; y += 15) {
                        ctx.beginPath();
                        ctx.arc(x, y + wave, 2, 0, Math.PI * 2);
                        ctx.fillStyle = this.engine.hexToRgba(el.color, 0.08);
                        ctx.fill();
                    }
                }
            } else if (el.pattern === 2) {
                // 줄무늬 패턴
                ctx.strokeStyle = this.engine.hexToRgba(el.color, 0.3);
                ctx.lineWidth = 1;
                for (let y = el.y + 5; y < el.y + el.thickness; y += 8) {
                    ctx.beginPath();
                    ctx.moveTo(0, y + wave);
                    ctx.lineTo(w, y + wave);
                    ctx.stroke();
                }
            }

            // 경계선
            ctx.strokeStyle = this.engine.hexToRgba(el.color, 0.7);
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        });

        // 화석
        this.elements.filter(el => el.type === 'fossil').forEach(el => {
            ctx.save();
            ctx.translate(el.x, el.y);
            ctx.rotate(el.rotation);

            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffffff';

            if (el.fossylType === 0) {
                // 조개 화석
                ctx.beginPath();
                ctx.arc(0, 0, el.size, 0, Math.PI, true);
                for (let i = 0; i < 5; i++) {
                    ctx.moveTo(-el.size + i * (el.size * 2 / 5), 0);
                    ctx.quadraticCurveTo(0, -el.size * 0.7, el.size - i * (el.size * 2 / 5), 0);
                }
            } else if (el.fossylType === 1) {
                // 잎 화석
                ctx.beginPath();
                ctx.ellipse(0, 0, el.size * 0.4, el.size, 0, 0, Math.PI * 2);
                ctx.moveTo(0, -el.size);
                ctx.lineTo(0, el.size);
                for (let i = -3; i <= 3; i++) {
                    if (i !== 0) {
                        ctx.moveTo(0, i * (el.size / 3));
                        ctx.lineTo(el.size * 0.3 * (i > 0 ? 1 : -1), i * (el.size / 3) - 5);
                    }
                }
            } else {
                // 뼈 화석
                ctx.beginPath();
                ctx.ellipse(0, 0, el.size, el.size * 0.3, 0, 0, Math.PI * 2);
                ctx.ellipse(-el.size * 0.8, 0, el.size * 0.3, el.size * 0.2, 0, 0, Math.PI * 2);
                ctx.ellipse(el.size * 0.8, 0, el.size * 0.3, el.size * 0.2, 0, 0, Math.PI * 2);
            }

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        });
    }

    drawFault(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;

        // 지층 그리기
        this.elements.filter(el => el.type === 'fault_layer').forEach(el => {
            const layerH = h / 6;
            const shake = Math.sin(t * 2 + el.index) * 2;

            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = el.color;

            if (el.side === 'left') {
                ctx.beginPath();
                ctx.moveTo(0, el.y + shake);
                ctx.lineTo(w * 0.5 - 5, el.y + shake);
                ctx.lineTo(w * 0.5 - 5, el.y + layerH + shake);
                ctx.lineTo(0, el.y + layerH + shake);
                ctx.closePath();
            } else {
                ctx.beginPath();
                ctx.moveTo(w * 0.5 + 5, el.y + shake);
                ctx.lineTo(w, el.y + shake);
                ctx.lineTo(w, el.y + layerH + shake);
                ctx.lineTo(w * 0.5 + 5, el.y + layerH + shake);
                ctx.closePath();
            }

            ctx.fillStyle = this.engine.hexToRgba(el.color, 0.1);
            ctx.fill();
            ctx.strokeStyle = this.engine.hexToRgba(el.color, 0.7);
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        });

        // 단층선
        this.elements.filter(el => el.type === 'fault_line').forEach(el => {
            const shake = Math.sin(t * 3) * 3;

            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff4444';

            ctx.beginPath();
            ctx.moveTo(el.x + shake, 0);

            // 지그재그 단층선
            for (let y = 0; y < h; y += 20) {
                const zigzag = Math.sin(y * 0.1 + t) * 10;
                ctx.lineTo(el.x + zigzag + shake, y);
            }

            ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.restore();
        });

        // 파편
        this.elements.filter(el => el.type === 'debris').forEach(el => {
            el.x += el.vx;
            el.y += el.vy;

            if (el.y > h) {
                el.y = 0;
                el.x = w * 0.5 + (Math.random() - 0.5) * 100;
            }

            ctx.beginPath();
            ctx.arc(el.x, el.y, el.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(150, 100, 80, 0.15)';
            ctx.fill();
        });
    }

    drawBedrock(ctx, t) {
        // 암반 블록
        this.elements.filter(el => el.type === 'bedrock_block').forEach(el => {
            const pulse = Math.sin(t * 0.5 + el.phase) * 0.05 + 1;

            ctx.save();
            ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
            ctx.rotate(el.rotation + Math.sin(t * 0.2 + el.phase) * 0.02);

            ctx.shadowBlur = 20;
            ctx.shadowColor = el.color;

            // 불규칙한 다각형 암반
            ctx.beginPath();
            const points = 6;
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const r = (i % 2 === 0 ? el.width : el.height) * 0.5 * pulse;
                const noise = Math.sin(i * 2 + el.phase) * 10;
                const x = Math.cos(angle) * (r + noise);
                const y = Math.sin(angle) * (r * 0.7 + noise);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            const gradient = ctx.createLinearGradient(-el.width / 2, -el.height / 2, el.width / 2, el.height / 2);
            gradient.addColorStop(0, this.engine.hexToRgba(el.color, 0.12));
            gradient.addColorStop(0.5, this.engine.hexToRgba(el.color, 0.08));
            gradient.addColorStop(1, this.engine.hexToRgba(el.color, 0.1));
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.strokeStyle = this.engine.hexToRgba(el.color, 0.8);
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.restore();
        });

        // 광맥
        this.elements.filter(el => el.type === 'vein').forEach(el => {
            const sparkle = Math.sin(t * 3 + el.startX * 0.01) * 0.4 + 0.6;

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = el.color;

            ctx.beginPath();
            ctx.moveTo(el.startX, el.startY);

            let x = el.startX;
            let y = el.startY;
            for (let i = 0; i < 10; i++) {
                const segLen = el.length / 10;
                const wiggle = (Math.random() - 0.5) * 20;
                x += Math.cos(el.angle + wiggle * 0.05) * segLen;
                y += Math.sin(el.angle + wiggle * 0.05) * segLen;
                ctx.lineTo(x, y);
            }

            ctx.strokeStyle = this.engine.hexToRgba(el.color, sparkle);
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.stroke();

            // 반짝이는 점
            ctx.beginPath();
            ctx.arc(el.startX, el.startY, 8 * sparkle, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba('#ffffff', sparkle * 0.15);
            ctx.fill();

            ctx.restore();
        });

        // 균열
        this.elements.filter(el => el.type === 'crack').forEach(el => {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(el.x, el.y);
            ctx.lineTo(
                el.x + Math.cos(el.angle) * el.length,
                el.y + Math.sin(el.angle) * el.length
            );
            ctx.strokeStyle = 'rgba(50, 50, 50, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        });
    }
}
