import { ArtEngine } from './ArtEngine.js';

/**
 * Wave Engine (ECHO-0)
 * 부드러운 사인파, 흐름
 */
export class WaveEngine extends ArtEngine {
    // ECHO-0 스킬 정의
    static SKILLS = [
        { name: 'Pulse', nameKo: '맥박', variants: ['Rhythm', 'Heartbeat', 'Tempo'] },
        { name: 'Wave', nameKo: '파동', variants: ['Sine', 'Square', 'Sawtooth'] },
        { name: 'EQ', nameKo: '이퀄라이저', variants: ['Digital', 'Analog', 'Spectrum'] },
        { name: 'Noise', nameKo: '노이즈', variants: ['White', 'Pink', 'Static'] },
        { name: 'Voice', nameKo: '목소리', variants: ['Echo', 'Chorus', 'Reverb'] },
        { name: 'String', nameKo: '현', variants: ['Vibration', 'Pluck', 'Resonance'] },
        { name: 'Silence', nameKo: '침묵', variants: ['Void', 'Quiet', 'Mute'] }
    ];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors, transparentMode, data);
        this.lines = [];
        this.setMode(0, 0); // Default: Pulse
    }

    // 새 표준 인터페이스
    setMode(modeIndex, variantIndex = 0) {
        super.setMode(modeIndex, variantIndex);
        this.ctx.clearRect(0, 0, this.width, this.height);

        const modeNames = ['rain', 'scanner', 'hud', 'data', 'circuit', 'sign', 'net'];
        this.mode = modeNames[modeIndex] || 'rain';

        console.log(`[WaveEngine] Mode: ${modeIndex} (${this.mode}), Variant: ${variantIndex}`);
        this.initLines();
    }

    initLines() {
        this.lines = [];
        const count = 50;

        let freqMult = 1.0;
        let speedMult = 1.0;

        if (this.currentVariant === 1) { // Variant 1: Heartbeat/Square/Analog
            freqMult = 0.5;
            speedMult = 0.5;
        } else if (this.currentVariant === 2) { // Variant 2: Tempo/Sawtooth/Spectrum
            freqMult = 2.0;
            speedMult = 2.0;
        }

        for (let i = 0; i < count; i++) {
            this.lines.push({
                y: (this.height / count) * i,
                amplitude: Math.random() * 50 + 20,
                frequency: (Math.random() * 0.02 + 0.01) * freqMult,
                speed: (Math.random() * 0.05 + 0.02) * speedMult,
                offset: Math.random() * Math.PI * 2,
                color: this.colors[i % this.colors.length]
            });
        }
    }

    resize(width, height) {
        super.resize(width, height);
        this.setMode(this.currentMode, this.currentVariant);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.lines.forEach((line, index) => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.hexToRgba(line.color, 0.5);
            this.ctx.lineWidth = 2;

            for (let x = 0; x < this.width; x += 10) {
                let y = line.y;

                // Variant 1: More square-like or jagged if desired, but kept simple for now
                if (this.currentVariant === 1 && this.mode === 'data') { // Sample logic for specific mode variant
                    if (Math.sin(x * line.frequency) > 0) y += line.amplitude;
                    else y -= line.amplitude;
                } else {
                    y += Math.sin(x * line.frequency + this.frame * line.speed + line.offset) * line.amplitude +
                        Math.sin(x * line.frequency * 0.5 + this.frame * line.speed * 1.5) * (line.amplitude * 0.5);
                }

                if (x === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        });
    }
}
