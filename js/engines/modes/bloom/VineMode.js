export class VineMode {
    constructor(engine) {
        this.engine = engine;
        this.vines = [];
        this.flowers = [];
        this.particles = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.vines = [];
        this.flowers = [];
        this.particles = [];

        if (this.style === 0) {
            // Ivy: 담쟁이 - 화면을 덮어가는 밝은 덩굴
            this.createIvyVines();
        } else if (this.style === 1) {
            // Thorn: 가시 장미 - 화려한 장미와 가시
            this.createThornVines();
        } else {
            // Creeper: 등나무 - 늘어지는 꽃덩굴
            this.createCreeperVines();
        }
    }

    createIvyVines() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 코너에서 시작하는 큰 덩굴들
        const starts = [
            { x: 0, y: 0, angle: Math.PI / 4 },
            { x: w, y: 0, angle: Math.PI * 3 / 4 },
            { x: 0, y: h, angle: -Math.PI / 4 },
            { x: w, y: h, angle: -Math.PI * 3 / 4 }
        ];

        starts.forEach((start, i) => {
            this.createVineBranch(start.x, start.y, start.angle, 120, 0, i);
        });

        // 빛 파티클
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 2 + Math.random() * 4,
                phase: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 0.5,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }
    }

    createVineBranch(x, y, angle, length, depth, colorIndex) {
        if (depth > 3 || length < 20) return;

        const vine = {
            startX: x,
            startY: y,
            angle,
            length,
            currentLength: 0,
            growSpeed: 1.5 + Math.random(),
            depth,
            thickness: Math.max(2, 8 - depth * 2),
            color: this.engine.colors[colorIndex % this.engine.colors.length],
            leaves: [],
            phase: Math.random() * Math.PI * 2
        };

        this.vines.push(vine);

        // 분기점 예약
        const branchPoints = [];
        for (let l = length * 0.3; l < length; l += 25 + Math.random() * 20) {
            branchPoints.push({
                at: l,
                angle: angle + (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 4 + Math.random() * Math.PI / 4),
                length: length * (0.5 + Math.random() * 0.3)
            });
        }

        vine.branchPoints = branchPoints;
        vine.colorIndex = colorIndex;
    }

    createThornVines() {
        const w = this.engine.width;
        const h = this.engine.height;

        // 여러 방향에서 뻗어나오는 장미 덩굴
        for (let i = 0; i < 6; i++) {
            const side = i % 4;
            let x, y, angle;

            if (side === 0) { // left
                x = -20;
                y = h * (0.2 + Math.random() * 0.6);
                angle = (Math.random() - 0.3) * Math.PI / 3;
            } else if (side === 1) { // right
                x = w + 20;
                y = h * (0.2 + Math.random() * 0.6);
                angle = Math.PI + (Math.random() - 0.5) * Math.PI / 3;
            } else if (side === 2) { // top
                x = w * (0.2 + Math.random() * 0.6);
                y = -20;
                angle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
            } else { // bottom
                x = w * (0.2 + Math.random() * 0.6);
                y = h + 20;
                angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
            }

            this.vines.push({
                type: 'thorn',
                points: [{ x, y }],
                angle,
                maxLength: 80 + Math.random() * 60,
                speed: 2 + Math.random(),
                color: this.engine.colors[i % this.engine.colors.length],
                thorns: [],
                roses: [],
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    createCreeperVines() {
        const w = this.engine.width;

        // 위에서 늘어지는 등나무 덩굴
        for (let i = 0; i < 8; i++) {
            const x = w * (0.05 + i * 0.12);

            this.vines.push({
                type: 'wisteria',
                x,
                segments: [],
                maxSegments: 15 + Math.floor(Math.random() * 10),
                color: this.engine.colors[i % this.engine.colors.length],
                phase: i * 0.3,
                swayAmount: 15 + Math.random() * 20
            });

            // 꽃 클러스터
            for (let j = 0; j < 3; j++) {
                this.flowers.push({
                    vineIndex: i,
                    segmentRatio: 0.3 + j * 0.25 + Math.random() * 0.1,
                    size: 25 + Math.random() * 20,
                    phase: Math.random() * Math.PI * 2,
                    color: this.engine.colors[(i + j) % this.engine.colors.length]
                });
            }
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawIvyVines(ctx, t);
        } else if (this.style === 1) {
            this.drawThornVines(ctx, t);
        } else {
            this.drawCreeperVines(ctx, t);
        }
    }

    drawIvyVines(ctx, t) {
        // 덩굴 성장 및 그리기
        this.vines.forEach((vine, vi) => {
            // 성장
            if (vine.currentLength < vine.length) {
                vine.currentLength = Math.min(vine.length, vine.currentLength + vine.growSpeed);

                // 분기 생성 체크
                vine.branchPoints = vine.branchPoints.filter(bp => {
                    if (vine.currentLength >= bp.at && !bp.created) {
                        const px = vine.startX + Math.cos(vine.angle) * bp.at;
                        const py = vine.startY + Math.sin(vine.angle) * bp.at;
                        this.createVineBranch(px, py, bp.angle, bp.length, vine.depth + 1, vine.colorIndex);
                        bp.created = true;

                        // 잎 추가
                        vine.leaves.push({
                            x: px, y: py,
                            angle: bp.angle,
                            size: 12 + Math.random() * 10,
                            phase: Math.random() * Math.PI * 2
                        });
                    }
                    return true;
                });
            }

            // 흔들림
            const sway = Math.sin(t + vine.phase) * 3 * (1 - vine.depth * 0.2);

            ctx.save();
            ctx.shadowBlur = 15 + (3 - vine.depth) * 5;
            ctx.shadowColor = vine.color;

            // 덩굴 줄기
            const endX = vine.startX + Math.cos(vine.angle) * vine.currentLength;
            const endY = vine.startY + Math.sin(vine.angle) * vine.currentLength;
            const midX = (vine.startX + endX) / 2 + sway;
            const midY = (vine.startY + endY) / 2 + sway;

            ctx.beginPath();
            ctx.moveTo(vine.startX, vine.startY);
            ctx.quadraticCurveTo(midX, midY, endX + sway, endY + sway);
            ctx.strokeStyle = this.engine.hexToRgba(vine.color, 0.8);
            ctx.lineWidth = vine.thickness;
            ctx.lineCap = 'round';
            ctx.stroke();

            // 잎 그리기
            vine.leaves.forEach(leaf => {
                const leafSway = Math.sin(t * 2 + leaf.phase) * 8;

                ctx.save();
                ctx.translate(leaf.x + leafSway * 0.5, leaf.y);
                ctx.rotate(leaf.angle + leafSway * 0.02);

                // 담쟁이 잎 (5갈래)
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const a = (i / 5 - 0.5) * Math.PI * 0.7;
                    const r = leaf.size * (0.7 + Math.sin(i * 1.5) * 0.3);
                    const lx = Math.cos(a) * r;
                    const ly = -Math.sin(a) * r - leaf.size * 0.3;

                    if (i === 0) ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(lx * 0.5, ly * 0.5, lx, ly);
                }
                ctx.closePath();

                const leafGradient = ctx.createRadialGradient(0, -leaf.size * 0.3, 0, 0, -leaf.size * 0.3, leaf.size);
                leafGradient.addColorStop(0, this.engine.hexToRgba(vine.color, 0.9));
                leafGradient.addColorStop(1, this.engine.hexToRgba(vine.color, 0.5));
                ctx.fillStyle = leafGradient;
                ctx.fill();

                ctx.restore();
            });

            ctx.restore();
        });

        // 빛 파티클
        this.particles.forEach(p => {
            p.x += Math.sin(t + p.phase) * p.speed;
            p.y += Math.cos(t * 0.7 + p.phase) * p.speed * 0.5;
            p.phase += 0.01;

            const glow = Math.sin(t * 3 + p.phase) * 0.4 + 0.6;

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = p.color;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * glow, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(p.color, 0.5 * glow);
            ctx.fill();

            ctx.restore();
        });
    }

    drawThornVines(ctx, t) {
        this.vines.forEach(vine => {
            // 덩굴 성장
            if (vine.points.length < vine.maxLength) {
                const last = vine.points[vine.points.length - 1];
                vine.angle += (Math.random() - 0.5) * 0.4;

                const nx = last.x + Math.cos(vine.angle) * vine.speed;
                const ny = last.y + Math.sin(vine.angle) * vine.speed;
                vine.points.push({ x: nx, y: ny });

                // 가시 추가
                if (vine.points.length % 3 === 0) {
                    vine.thorns.push({
                        x: nx, y: ny,
                        angle: vine.angle + (Math.random() > 0.5 ? 1 : -1) * Math.PI / 3,
                        size: 6 + Math.random() * 6
                    });
                }

                // 장미 추가 (드물게)
                if (vine.points.length % 20 === 0) {
                    vine.roses.push({
                        x: nx, y: ny,
                        size: 20 + Math.random() * 15,
                        phase: Math.random() * Math.PI * 2,
                        petalCount: 5 + Math.floor(Math.random() * 3)
                    });
                }
            } else if (Math.random() < 0.003) {
                // 리셋
                this.resetThornVine(vine);
            }

            // 전체 흔들림
            const globalSway = Math.sin(t + vine.phase) * 3;

            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = vine.color;

            // 덩굴 줄기
            if (vine.points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(vine.points[0].x + globalSway, vine.points[0].y);

                for (let i = 1; i < vine.points.length; i++) {
                    const sway = Math.sin(t + i * 0.1) * 2;
                    ctx.lineTo(vine.points[i].x + globalSway + sway, vine.points[i].y + sway * 0.5);
                }

                ctx.strokeStyle = this.engine.hexToRgba(vine.color, 0.7);
                ctx.lineWidth = 5;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            // 가시
            vine.thorns.forEach(thorn => {
                ctx.save();
                ctx.translate(thorn.x + globalSway, thorn.y);
                ctx.rotate(thorn.angle);

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-3, -thorn.size * 0.4);
                ctx.lineTo(0, -thorn.size);
                ctx.lineTo(3, -thorn.size * 0.4);
                ctx.closePath();

                ctx.fillStyle = this.engine.hexToRgba(vine.color, 0.9);
                ctx.fill();

                ctx.restore();
            });

            // 장미
            vine.roses.forEach(rose => {
                const breath = Math.sin(t * 2 + rose.phase) * 0.1 + 1;

                ctx.save();
                ctx.translate(rose.x + globalSway, rose.y);
                ctx.scale(breath, breath);

                ctx.shadowBlur = 25;
                ctx.shadowColor = vine.color;

                // 꽃잎
                for (let i = 0; i < rose.petalCount; i++) {
                    ctx.save();
                    ctx.rotate((i / rose.petalCount) * Math.PI * 2 + t * 0.1);

                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.bezierCurveTo(
                        -rose.size * 0.4, -rose.size * 0.3,
                        -rose.size * 0.3, -rose.size * 0.8,
                        0, -rose.size
                    );
                    ctx.bezierCurveTo(
                        rose.size * 0.3, -rose.size * 0.8,
                        rose.size * 0.4, -rose.size * 0.3,
                        0, 0
                    );

                    const gradient = ctx.createLinearGradient(0, 0, 0, -rose.size);
                    gradient.addColorStop(0, this.engine.hexToRgba(vine.color, 0.9));
                    gradient.addColorStop(1, this.engine.hexToRgba('#ffffff', 0.6));
                    ctx.fillStyle = gradient;
                    ctx.fill();

                    ctx.restore();
                }

                // 중심
                ctx.beginPath();
                ctx.arc(0, 0, rose.size * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 220, 100, 0.9)';
                ctx.fill();

                ctx.restore();
            });

            ctx.restore();
        });
    }

    resetThornVine(vine) {
        const w = this.engine.width;
        const h = this.engine.height;
        const side = Math.floor(Math.random() * 4);

        if (side === 0) {
            vine.points = [{ x: -20, y: h * (0.2 + Math.random() * 0.6) }];
            vine.angle = (Math.random() - 0.3) * Math.PI / 3;
        } else if (side === 1) {
            vine.points = [{ x: w + 20, y: h * (0.2 + Math.random() * 0.6) }];
            vine.angle = Math.PI + (Math.random() - 0.5) * Math.PI / 3;
        } else if (side === 2) {
            vine.points = [{ x: w * (0.2 + Math.random() * 0.6), y: -20 }];
            vine.angle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
        } else {
            vine.points = [{ x: w * (0.2 + Math.random() * 0.6), y: h + 20 }];
            vine.angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
        }

        vine.thorns = [];
        vine.roses = [];
        vine.maxLength = 80 + Math.random() * 60;
    }

    drawCreeperVines(ctx, t) {
        const h = this.engine.height;

        this.vines.forEach((vine, vi) => {
            // 세그먼트 성장
            if (vine.segments.length < vine.maxSegments) {
                vine.segments.push({
                    length: 20 + Math.random() * 15,
                    angle: (Math.random() - 0.5) * 0.3
                });
            }

            // 덩굴 경로 계산
            const path = [{ x: vine.x, y: -20 }];
            let currentY = -20;

            vine.segments.forEach((seg, si) => {
                const sway = Math.sin(t + vine.phase + si * 0.3) * vine.swayAmount * (si / vine.maxSegments);
                currentY += seg.length;
                path.push({
                    x: vine.x + sway + Math.sin(seg.angle + t * 0.5) * 10,
                    y: currentY
                });
            });

            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = vine.color;

            // 주 줄기
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);

            for (let i = 1; i < path.length; i++) {
                const prev = path[i - 1];
                const curr = path[i];
                const cpX = (prev.x + curr.x) / 2;
                const cpY = (prev.y + curr.y) / 2;
                ctx.quadraticCurveTo(prev.x, prev.y, cpX, cpY);
            }

            ctx.strokeStyle = this.engine.hexToRgba(vine.color, 0.6);
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.stroke();

            // 작은 잎들
            path.forEach((p, pi) => {
                if (pi % 3 !== 0 || pi === 0) return;

                const leafSway = Math.sin(t * 2 + pi) * 5;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(Math.PI / 6 + leafSway * 0.05);

                ctx.beginPath();
                ctx.ellipse(8, 0, 5, 12, 0, 0, Math.PI * 2);
                ctx.fillStyle = this.engine.hexToRgba(vine.color, 0.5);
                ctx.fill();

                ctx.restore();
            });

            ctx.restore();

            // 꽃 클러스터
            this.flowers.filter(f => f.vineIndex === vi).forEach(flower => {
                const segIndex = Math.floor(flower.segmentRatio * path.length);
                if (segIndex >= path.length) return;

                const pos = path[segIndex];
                const breath = Math.sin(t * 1.5 + flower.phase) * 0.15 + 1;

                ctx.save();
                ctx.translate(pos.x, pos.y);
                ctx.scale(breath, breath);

                ctx.shadowBlur = 25;
                ctx.shadowColor = flower.color;

                // 등나무 꽃 클러스터 (아래로 늘어지는 작은 꽃들)
                for (let i = 0; i < 12; i++) {
                    const fx = (Math.random() - 0.5) * flower.size * 0.6;
                    const fy = i * 4 + Math.sin(t + i) * 3;
                    const fSize = 4 + Math.random() * 4 * (1 - i / 12);

                    ctx.beginPath();
                    ctx.arc(fx, fy, fSize, 0, Math.PI * 2);

                    const alpha = 0.8 - i * 0.05;
                    ctx.fillStyle = this.engine.hexToRgba(flower.color, alpha);
                    ctx.fill();
                }

                ctx.restore();
            });
        });
    }
}
