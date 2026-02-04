import { BaseMode } from '../../../core/BaseMode.js';

export class BubbleMode extends BaseMode {
    constructor(engine) {
        super(engine);
        this.bubbles = [];
        this.style = 0;
    }

    init(variant = 0) {
        super.init(variant);
        this.style = variant;
        this.bubbles = [];

        if (this.style === 0) {
            // Rising: 심플한 상승 버블 (꼬리 없음)
            this.createRising();
        } else if (this.style === 1) {
            // Popping: 꼬리/잔상이 있는 터지는 버블
            this.createPopping();
        } else {
            // Foam: 거품 클러스터
            this.createFoam();
        }
    }

    createRising() {
        // 심플한 상승 버블 (꼬리 없음, 개수만 증가)
        const count = 40;
        for (let i = 0; i < count; i++) {
            this.bubbles.push({
                type: 'rising',
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 4 + 2,  // 원래 크기 유지 (2~6)
                speed: Math.random() * 0.5 + 0.2,
                wobble: Math.random() * Math.PI * 2,
                color: this.colors[i % this.colors.length]
            });
        }
    }

    createPopping() {
        // 꼬리/잔상이 있는 터지는 버블
        const count = 35;
        for (let i = 0; i < count; i++) {
            // 절반은 화면 내에서 시작, 절반은 아래에서 시작
            const startY = i < count / 2
                ? Math.random() * this.height  // 화면 내
                : this.height + Math.random() * 100;  // 화면 아래

            this.bubbles.push({
                type: 'popping',
                x: Math.random() * this.width,
                y: startY,
                radius: Math.random() * 6 + 3,  // 원래 크기 (3~9)
                speed: Math.random() * 0.8 + 0.5,
                wobble: Math.random() * Math.PI * 2,
                color: this.colors[i % this.colors.length],
                popHeight: Math.random() * this.height * 0.3 + 50,
                popping: false,
                popFrame: 0,
                popParticles: [],
                trail: [] // 잔상 히스토리
            });
        }
    }

    createFoam() {
        // 거품 클러스터
        const clusterCount = 10;
        for (let c = 0; c < clusterCount; c++) {
            const cx = Math.random() * this.width;
            const cy = this.height * 0.5 + Math.random() * this.height * 0.4;
            const bubbleCount = 15 + Math.floor(Math.random() * 15);

            for (let i = 0; i < bubbleCount; i++) {
                this.bubbles.push({
                    type: 'foam',
                    x: cx + (Math.random() - 0.5) * 100,
                    y: cy + (Math.random() - 0.5) * 60,
                    radius: Math.random() * 3 + 1,  // 원래 크기 (1~4)
                    wobble: Math.random() * Math.PI * 2,
                    color: this.colors[c % this.colors.length],
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
    }

    draw() {
        if (this.style === 0) {
            this.drawRising();
        } else if (this.style === 1) {
            this.drawPopping();
        } else {
            this.drawFoam();
        }
    }

    drawRising() {
        // 심플한 상승 버블 (꼬리 없음, 미니프리뷰와 동일)
        // 꼬리 효과 제거: 캔버스를 완전히 지움
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();

        this.bubbles.forEach(b => {
            // 상승 움직임
            b.y -= b.speed;
            b.x += Math.sin(this.frame * 0.05 + b.wobble) * 0.5;

            // 화면 밖으로 나가면 리셋
            if (b.y < 0) {
                b.y = this.height + 20;
                b.x = Math.random() * this.width;
            }

            // 버블 그리기 (미니프리뷰와 동일)
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.hexToRgba(b.color, 0.6);
            this.ctx.strokeStyle = this.hexToRgba(b.color, 0.8);
            this.ctx.fill();
            this.ctx.stroke();
        });
    }

    drawPopping() {
        this.bubbles.forEach(b => {
            if (b.popping) {
                // 터지는 애니메이션
                b.popFrame++;
                const progress = b.popFrame / 20;

                if (progress < 1) {
                    // 터지는 파티클들
                    b.popParticles.forEach((p, i) => {
                        const px = b.x + Math.cos(p.angle) * p.dist * progress * 2;
                        const py = b.y + Math.sin(p.angle) * p.dist * progress * 2;
                        const alpha = (1 - progress) * 0.6;
                        const size = p.size * (1 - progress * 0.5);

                        this.ctx.beginPath();
                        this.ctx.arc(px, py, size, 0, Math.PI * 2);
                        this.ctx.fillStyle = this.hexToRgba(b.color, alpha);
                        this.ctx.fill();
                    });
                } else {
                    // 터짐 완료, 리셋
                    b.popping = false;
                    b.popFrame = 0;
                    b.y = this.height + Math.random() * 50;
                    b.x = Math.random() * this.width;
                    b.popParticles = [];
                    b.trail = [];
                }
            } else {
                // 이전 위치 저장 (잔상용)
                b.trail.unshift({ x: b.x, y: b.y });
                if (b.trail.length > 8) b.trail.pop();

                // 상승
                b.y -= b.speed;
                b.x += Math.sin(this.frame * 0.03 + b.wobble) * 0.3;

                // 터지는 높이에 도달
                if (b.y < b.popHeight) {
                    b.popping = true;
                    // 터지는 파티클 생성
                    const particleCount = 6 + Math.floor(Math.random() * 4);
                    for (let i = 0; i < particleCount; i++) {
                        b.popParticles.push({
                            angle: (i / particleCount) * Math.PI * 2,
                            dist: b.radius + Math.random() * 10,
                            size: 1 + Math.random() * 2
                        });
                    }
                }

                // 잔상 그리기
                b.trail.forEach((pos, i) => {
                    const alpha = (1 - i / b.trail.length) * 0.15;
                    const size = b.radius * (1 - i / b.trail.length * 0.3);
                    this.ctx.beginPath();
                    this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
                    this.ctx.fillStyle = this.hexToRgba(b.color, alpha);
                    this.ctx.fill();
                });

                // 메인 버블
                this.ctx.beginPath();
                this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = this.hexToRgba(b.color, 0.6);
                this.ctx.strokeStyle = this.hexToRgba(b.color, 0.8);
                this.ctx.fill();
                this.ctx.stroke();

                // 하이라이트
                this.ctx.beginPath();
                this.ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.3, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.fill();
            }
        });
    }

    drawFoam() {
        this.bubbles.forEach(b => {
            const wobbleX = Math.sin(this.frame * 0.02 + b.wobble) * 2;
            const wobbleY = Math.cos(this.frame * 0.015 + b.phase) * 1.5;
            const pulse = Math.sin(this.frame * 0.05 + b.phase) * 0.2 + 1;

            this.ctx.beginPath();
            this.ctx.arc(b.x + wobbleX, b.y + wobbleY, b.radius * pulse, 0, Math.PI * 2);
            this.ctx.fillStyle = this.hexToRgba(b.color, 0.4);
            this.ctx.strokeStyle = this.hexToRgba(b.color, 0.6);
            this.ctx.fill();
            this.ctx.stroke();
        });
    }
}
