/**
 * Generative Art Engines Base Class
 * Strategy Pattern Manager & Context
 */

export class ArtEngine {
    // 각 엔진에서 오버라이드 - 확장 가능한 배열 구조
    static SKILLS = [];

    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.colors = colors || ['#ffffff'];
        this.width = canvas.width;
        this.height = canvas.height;
        this.frame = 0;
        this.transparentMode = transparentMode;
        this.data = data;

        this.currentMode = 0;
        this.currentVariant = 0;
        this.currentModeInstance = null;

        // This should be populated by subclasses
        this.modes = [];
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        // Re-init current mode to handle resize logic if needed
        if (this.currentModeInstance) {
            this.setMode(this.currentMode, this.currentVariant);
        }
    }

    update() {
        this.frame++;
    }

    // 표준 인터페이스: 모드와 variant 인덱스로 설정
    setMode(modeIndex, variantIndex = 0) {
        this.currentMode = modeIndex;
        this.currentVariant = variantIndex;

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Map index to name for debugging/logging (Optional, requires subclass to define names or just use index)
        // Let's rely on SKILLS to get names if available
        const skillName = this.getSkills()[modeIndex]?.name || 'Unknown';
        console.log(`%c[${this.constructor.name}] Switch Mode: ${skillName} (${modeIndex}), Variant: ${variantIndex}`, 'color: #00ffaa; font-weight: bold;');

        // Strategy Pattern: Switch Context
        this.currentModeInstance = this.modes[modeIndex];

        if (!this.currentModeInstance) {
            console.error(`[${this.constructor.name}] Invalid Mode Index: ${modeIndex}. Fallback to 0.`);
            this.currentModeInstance = this.modes[0];
        }

        // Delegate initialization
        if (this.currentModeInstance && this.currentModeInstance.init) {
            this.currentModeInstance.init(variantIndex);
        }
    }

    getSkills() {
        return this.constructor.SKILLS;
    }

    getCurrentMode() {
        return this.currentMode;
    }

    getCurrentVariant() {
        return this.currentVariant;
    }

    draw() {
        this.drawBackground();

        // Delegate drawing
        if (this.currentModeInstance && this.currentModeInstance.draw) {
            this.currentModeInstance.draw();
        }
    }

    // Common background logic - Subclasses can override if needed
    drawBackground() {
        if (this.transparentMode) {
            // Default transparent logic: fade out slightly
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
            this.ctx.globalCompositeOperation = 'source-over';
        } else {
            // Default dark background
            this.ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }

    hexToRgba(hex, alpha) {
        let r = 0, g = 0, b = 0;
        if (!hex) return `rgba(0,0,0,${alpha})`;
        if (hex.startsWith('#')) hex = hex.slice(1);

        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
