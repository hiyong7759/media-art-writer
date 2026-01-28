export class EQMode {
    constructor(engine) {
        this.engine = engine;
        this.bars = [];
        this.particles = [];
        this.style = 0;
    }

    init(variant = 0) {
        this.style = variant;
        this.bars = [];
        this.particles = [];

        if (this.style === 0) {
            // Digital: 디지털 블록 스타일
            this.createDigitalBars();
        } else if (this.style === 1) {
            // Analog: 부드러운 아날로그 VU 미터
            this.createAnalogBars();
        } else {
            // Spectrum: 원형 스펙트럼
            this.createSpectrumBars();
        }
    }

    createDigitalBars() {
        const count = 24;
        for (let i = 0; i < count; i++) {
            this.bars.push({
                x: i,
                height: 0,
                targetHeight: 0,
                phase: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }
    }

    createAnalogBars() {
        // VU 미터 스타일
        this.bars.push({
            type: 'vu_left',
            value: 0,
            targetValue: 0,
            phase: 0
        });
        this.bars.push({
            type: 'vu_right',
            value: 0,
            targetValue: 0,
            phase: Math.PI / 4
        });

        // 배경 눈금
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                type: 'tick',
                angle: -Math.PI * 0.75 + (i / 9) * Math.PI * 0.5,
                label: -20 + i * 4
            });
        }
    }

    createSpectrumBars() {
        const count = 32;
        for (let i = 0; i < count; i++) {
            this.bars.push({
                angle: (i / count) * Math.PI * 2,
                height: 0,
                targetHeight: 0,
                phase: Math.random() * Math.PI * 2,
                color: this.engine.colors[i % this.engine.colors.length]
            });
        }
    }

    draw() {
        const ctx = this.engine.ctx;
        const t = this.engine.frame * 0.02;

        if (this.style === 0) {
            this.drawDigital(ctx, t);
        } else if (this.style === 1) {
            this.drawAnalog(ctx, t);
        } else {
            this.drawSpectrum(ctx, t);
        }
    }

    drawDigital(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;
        const barCount = this.bars.length;
        const barWidth = w / barCount;
        const maxHeight = h * 0.7;

        this.bars.forEach((bar, i) => {
            // 오디오 시뮬레이션
            const freq = Math.sin(t * 2 + bar.phase + i * 0.2) * 0.3 +
                        Math.sin(t * 3 + bar.phase * 2) * 0.2 +
                        Math.sin(t * 5 + i * 0.1) * 0.15 + 0.35;

            bar.targetHeight = freq * maxHeight;
            bar.height += (bar.targetHeight - bar.height) * 0.15;

            const x = i * barWidth;
            const y = h - bar.height;
            const blockHeight = 8;
            const gap = 3;
            const blocks = Math.floor(bar.height / (blockHeight + gap));

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = bar.color;

            // 블록들
            for (let b = 0; b < blocks; b++) {
                const blockY = h - (b + 1) * (blockHeight + gap);
                const intensity = 1 - (b / blocks) * 0.5;

                // 상단 블록은 더 밝게
                const alpha = b === blocks - 1 ? 0.9 : 0.5 * intensity;

                ctx.fillStyle = this.engine.hexToRgba(bar.color, alpha);
                ctx.fillRect(x + 2, blockY, barWidth - 4, blockHeight);
            }

            // 피크 홀드 (상단 밝은 블록)
            if (blocks > 0) {
                ctx.fillStyle = this.engine.hexToRgba(bar.color, 0.95);
                ctx.fillRect(x + 2, h - blocks * (blockHeight + gap), barWidth - 4, blockHeight);
            }

            ctx.restore();
        });

        // 베이스 라인
        ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[0], 0.3);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(w, h);
        ctx.stroke();
    }

    drawAnalog(ctx, t) {
        const w = this.engine.width;
        const h = this.engine.height;
        const mainColor = this.engine.colors[0];

        // 두 개의 VU 미터
        const meters = [
            { cx: w * 0.35, cy: h * 0.55, label: 'L' },
            { cx: w * 0.65, cy: h * 0.55, label: 'R' }
        ];

        meters.forEach((meter, mi) => {
            const bar = this.bars[mi];
            if (!bar) return;

            // 값 시뮬레이션
            const audio = Math.sin(t * 3 + bar.phase) * 0.3 +
                         Math.sin(t * 5 + bar.phase * 2) * 0.2 +
                         Math.sin(t * 7) * 0.1 + 0.4;

            bar.targetValue = audio;
            bar.value += (bar.targetValue - bar.value) * 0.1;

            const radius = Math.min(w, h) * 0.25;
            const needleAngle = -Math.PI * 0.75 + bar.value * Math.PI * 0.5;

            ctx.save();
            ctx.translate(meter.cx, meter.cy);

            // 미터 배경 (호)
            ctx.beginPath();
            ctx.arc(0, 0, radius, -Math.PI * 0.8, -Math.PI * 0.2);
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.2);
            ctx.lineWidth = 30;
            ctx.stroke();

            // 활성 영역 (채워진 호)
            ctx.beginPath();
            ctx.arc(0, 0, radius, -Math.PI * 0.8, needleAngle);
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.4);
            ctx.lineWidth = 25;
            ctx.stroke();

            // 글로우
            ctx.shadowBlur = 20;
            ctx.shadowColor = mainColor;

            // 눈금
            for (let i = 0; i <= 10; i++) {
                const tickAngle = -Math.PI * 0.8 + (i / 10) * Math.PI * 0.6;
                const innerR = radius - 40;
                const outerR = radius - 25;

                ctx.beginPath();
                ctx.moveTo(Math.cos(tickAngle) * innerR, Math.sin(tickAngle) * innerR);
                ctx.lineTo(Math.cos(tickAngle) * outerR, Math.sin(tickAngle) * outerR);
                ctx.strokeStyle = this.engine.hexToRgba(mainColor, i > 7 ? 0.7 : 0.4);
                ctx.lineWidth = i % 2 === 0 ? 2 : 1;
                ctx.stroke();
            }

            // 바늘
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(needleAngle) * (radius - 15), Math.sin(needleAngle) * (radius - 15));
            ctx.strokeStyle = this.engine.hexToRgba(mainColor, 0.8);
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.stroke();

            // 바늘 끝 점
            ctx.beginPath();
            ctx.arc(Math.cos(needleAngle) * (radius - 15), Math.sin(needleAngle) * (radius - 15), 4, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.9);
            ctx.fill();

            // 중심점
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.6);
            ctx.fill();

            // 라벨
            ctx.font = '14px monospace';
            ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.6);
            ctx.textAlign = 'center';
            ctx.fillText(meter.label, 0, radius + 30);

            ctx.restore();
        });

        // dB 표시
        ctx.save();
        ctx.font = '12px monospace';
        ctx.fillStyle = this.engine.hexToRgba(mainColor, 0.5);
        ctx.textAlign = 'center';
        ctx.fillText('VU METER', w / 2, h * 0.15);
        ctx.restore();
    }

    drawSpectrum(ctx, t) {
        const cx = this.engine.width / 2;
        const cy = this.engine.height / 2;
        const innerRadius = 80;
        const maxHeight = 150;

        // 배경 원
        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.engine.colors[0];

        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius - 10, 0, Math.PI * 2);
        ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[0], 0.2);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // 스펙트럼 바
        this.bars.forEach((bar, i) => {
            // 오디오 시뮬레이션
            const freq = Math.sin(t * 2 + bar.phase + i * 0.3) * 0.25 +
                        Math.sin(t * 4 + bar.phase * 1.5) * 0.2 +
                        Math.sin(t * 6 + i * 0.15) * 0.15 + 0.4;

            bar.targetHeight = freq * maxHeight;
            bar.height += (bar.targetHeight - bar.height) * 0.12;

            const angle = bar.angle - Math.PI / 2;
            const barWidth = (Math.PI * 2 / this.bars.length) * 0.7;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            ctx.shadowBlur = 15;
            ctx.shadowColor = bar.color;

            // 바 그리기 (부채꼴 형태)
            ctx.beginPath();
            ctx.arc(0, 0, innerRadius, -barWidth / 2, barWidth / 2);
            ctx.arc(0, 0, innerRadius + bar.height, barWidth / 2, -barWidth / 2, true);
            ctx.closePath();

            const gradient = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, innerRadius + bar.height);
            gradient.addColorStop(0, this.engine.hexToRgba(bar.color, 0.3));
            gradient.addColorStop(0.7, this.engine.hexToRgba(bar.color, 0.6));
            gradient.addColorStop(1, this.engine.hexToRgba(bar.color, 0.8));

            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.restore();
        });

        // 중심 글로우
        ctx.save();
        const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerRadius - 10);
        coreGradient.addColorStop(0, this.engine.hexToRgba(this.engine.colors[0], 0.3));
        coreGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius - 10, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();
        ctx.restore();

        // 호흡하는 내부 원
        const breathe = Math.sin(t * 2) * 10;
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.engine.colors[0];

        ctx.beginPath();
        ctx.arc(cx, cy, 30 + breathe, 0, Math.PI * 2);
        ctx.strokeStyle = this.engine.hexToRgba(this.engine.colors[0], 0.5);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
}
