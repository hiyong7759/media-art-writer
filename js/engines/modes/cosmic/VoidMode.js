export class VoidMode {
    constructor(engine) {
        this.engine = engine;
        this.particles = [];
        this.elements = [];
        this.style = 0;
        this.phase = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.particles = [];
        this.elements = [];
        this.phase = 0;

        if (this.style === 0) {
            // BlackHole: 블랙홀 (기존 개선)
            this.createBlackHole();
        } else if (this.style === 1) {
            // Wormhole: 웜홀 터널
            this.createWormhole();
        } else {
            // Abyss: 무한한 심연
            this.createAbyss();
        }
    }

    createBlackHole() {
        const count = 150;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                dist: 50 + Math.random() * 250,
                speed: 0.02 + Math.random() * 0.03,
                size: 1 + Math.random() * 2,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
            });
        }

        // 강착원반 링
        for (let i = 0; i < 5; i++) {
            this.elements.push({
                type: 'disk_ring',
                radius: 60 + i * 30,
                speed: 0.03 - i * 0.005,
                opacity: 0.4 - i * 0.06
            });
        }
    }

    createWormhole() {
        // 터널 링들
        for (let i = 0; i < 15; i++) {
            this.elements.push({
                type: 'tunnel_ring',
                z: i * 40,
                baseZ: i * 40,
                radius: 150 - i * 8,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }

        // 에너지 입자
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                z: Math.random() * 600,
                speed: 3 + Math.random() * 3,
                size: 2 + Math.random() * 3,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
            });
        }
    }

    createAbyss() {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 심연 레이어
        for (let i = 0; i < 8; i++) {
            this.elements.push({
                type: 'abyss_layer',
                depth: i,
                radius: 180 - i * 20,
                phase: i * Math.PI / 4,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }

        // 부유하는 희미한 빛들
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 50 + Math.random() * 150;
            this.particles.push({
                x: cx + Math.cos(angle) * dist,
                y: cy + Math.sin(angle) * dist,
                baseX: cx + Math.cos(angle) * dist,
                baseY: cy + Math.sin(angle) * dist,
                size: 1 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2,
                fadeSpeed: 0.01 + Math.random() * 0.02,
                color: this.engine.colors[Math.floor(Math.random() * this.engine.colors.length)]
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;
        this.phase += 0.02;

        if (this.style === 0) {
            this.drawBlackHole(ctx, t);
        } else if (this.style === 1) {
            this.drawWormhole(ctx, t);
        } else {
            this.drawAbyss(ctx, t);
        }
    }

    drawBlackHole(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 강착원반 링
        this.elements.filter(e => e.type === 'disk_ring').forEach(ring => {
            ctx.save();
            ctx.translate(cx, cy);

            // 원반을 타원으로 표현
            ctx.scale(1, 0.3);

            ctx.beginPath();
            ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[2], ring.opacity);
            ctx.lineWidth = 8;
            ctx.stroke();

            // 내부 글로우
            ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[3], ring.opacity * 0.5);
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.restore();
        });

        // 블랙홀 중심 (이벤트 호라이즌)
        ctx.save();
        const holeGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
        holeGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        holeGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.95)');
        holeGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, 50, 0, Math.PI * 2);
        ctx.fillStyle = holeGradient;
        ctx.fill();

        // 이벤트 호라이즌 테두리
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.engine.colors[2];
        ctx.beginPath();
        ctx.arc(cx, cy, 45, 0, Math.PI * 2);
        ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[2], 0.5);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // 빨려들어가는 입자들
        this.particles.forEach(p => {
            p.angle += p.speed * (80 / p.dist);
            p.dist -= 0.3;

            if (p.dist < 45) {
                p.dist = 50 + Math.random() * 250;
                p.angle = Math.random() * Math.PI * 2;
            }

            const x = cx + Math.cos(p.angle) * p.dist;
            const y = cy + Math.sin(p.angle) * p.dist * 0.3;

            // 거리에 따른 밝기
            const brightness = 1 - (p.dist - 45) / 250;

            ctx.save();
            ctx.shadowBlur = 5 * brightness;
            ctx.shadowColor = p.color;

            ctx.beginPath();
            ctx.arc(x, y, p.size * brightness, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, 0.4 + brightness * 0.4);
            ctx.fill();

            ctx.restore();
        });
    }

    drawWormhole(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 터널 배경 (깊이감)
        const bgGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
        bgGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[1], 0.3));
        bgGradient.addColorStop(0.5, this.engine.hexToRgba(this.engine.colors[0], 0.1));
        bgGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, 200, 0, Math.PI * 2);
        ctx.fillStyle = bgGradient;
        ctx.fill();

        // 터널 링들 (뒤에서 앞으로)
        const tunnelRings = this.elements.filter(e => e.type === 'tunnel_ring');
        tunnelRings.sort((a, b) => b.z - a.z);

        tunnelRings.forEach(ring => {
            ring.z -= 2;
            if (ring.z < 0) ring.z = 600;

            const scale = 1 - ring.z / 700;
            const currentRadius = ring.radius * scale;
            const alpha = scale * 0.5;

            if (currentRadius > 5) {
                ctx.save();

                ctx.shadowBlur = 15 * scale;
                ctx.shadowColor = ring.color;

                // 왜곡된 타원형 링
                ctx.beginPath();
                const wobble = Math.sin(t + ring.baseZ * 0.01) * 10 * scale;
                for (let a = 0; a <= Math.PI * 2; a += 0.1) {
                    const r = currentRadius + Math.sin(a * 3 + t) * wobble;
                    const x = cx + Math.cos(a) * r;
                    const y = cy + Math.sin(a) * r * 0.6;

                    if (a === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();

                ctx.strokeStyle = this.engine.hexToRgba(ring.color, alpha);
                ctx.lineWidth = 2 * scale + 1;
                ctx.stroke();

                ctx.restore();
            }
        });

        // 에너지 입자 (터널 통과)
        this.particles.forEach(p => {
            p.z -= p.speed;
            if (p.z < 0) {
                p.z = 600;
                p.angle = Math.random() * Math.PI * 2;
            }

            const scale = 1 - p.z / 700;
            const radius = 100 * scale;
            const x = cx + Math.cos(p.angle) * radius;
            const y = cy + Math.sin(p.angle) * radius * 0.6;

            ctx.save();
            ctx.shadowBlur = 8 * scale;
            ctx.shadowColor = p.color;

            ctx.beginPath();
            ctx.arc(x, y, p.size * scale, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, scale * 0.7);
            ctx.fill();

            ctx.restore();
        });

        // 중심 특이점
        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.engine.colors[3];

        const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
        coreGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[3], 0.9));
        coreGradient.addColorStop(0.5, this.engine.hexToRgba(this.engine.colors[2], 0.4));
        coreGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();

        ctx.restore();
    }

    drawAbyss(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;

        // 심연 레이어들 (바깥에서 안으로)
        this.elements.filter(e => e.type === 'abyss_layer').forEach(layer => {
            layer.phase += 0.005;

            // 레이어별 그라데이션
            const breathe = Math.sin(layer.phase) * 10;
            const currentRadius = layer.radius + breathe;

            const gradient = ctx.createRadialGradient(
                cx, cy, currentRadius * 0.8,
                cx, cy, currentRadius
            );

            const baseAlpha = 0.1 - layer.depth * 0.01;
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, this.engine.hexToRgba(layer.color, baseAlpha));
            gradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // 레이어 테두리 (희미한)
            ctx.beginPath();
            ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
            ctx.strokeStyle = this.engine.hexToRgba(layer.color, baseAlpha * 0.5);
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // 중심 심연 (완전한 어둠)
        const abyssGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
        abyssGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        abyssGradient.addColorStop(0.5, this.engine.hexToRgba(this.engine.colors[0], 0.3));
        abyssGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, 60, 0, Math.PI * 2);
        ctx.fillStyle = abyssGradient;
        ctx.fill();

        // 부유하는 희미한 빛들 (심연에서 나타났다 사라지는)
        this.particles.forEach(p => {
            p.phase += p.fadeSpeed;

            // 나타났다 사라지는 효과
            const fade = Math.sin(p.phase) * 0.5 + 0.5;

            // 느린 움직임
            const drift = Math.sin(p.phase * 0.5) * 5;
            p.x = p.baseX + drift;
            p.y = p.baseY + Math.cos(p.phase * 0.3) * 3;

            // 심연 중심에 가까울수록 어두워짐
            const distToCenter = Math.sqrt(Math.pow(p.x - cx, 2) + Math.pow(p.y - cy, 2));
            const centerFade = Math.min(1, distToCenter / 60);

            const alpha = fade * centerFade * 0.4;

            if (alpha > 0.05) {
                ctx.save();
                ctx.shadowBlur = 10 * fade;
                ctx.shadowColor = p.color;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * fade, 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(p.color, alpha);
                ctx.fill();

                ctx.restore();
            }
        });

        // 심연의 숨결 (전체 화면 미세 맥동)
        const breatheAlpha = Math.sin(this.phase) * 0.02 + 0.02;
        const breatheGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
        breatheGradient.addColorStop(0, 'transparent');
        breatheGradient.addColorStop(0.5, this.engine.hexToRgba(this.engine.colors[1], breatheAlpha));
        breatheGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = breatheGradient;
        ctx.fillRect(0, 0, this.engine.width, this.engine.height);
    }
}
