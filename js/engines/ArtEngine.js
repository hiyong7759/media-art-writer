/**
 * Generative Art Engines Base Class
 */

export class ArtEngine {
    // 각 엔진에서 오버라이드 - 확장 가능한 배열 구조
    static SKILLS = [
        // { name: 'Mode1', variants: ['Var1', 'Var2', 'Var3'] },
    ];

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
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    update() {
        this.frame++;
    }

    // 표준 인터페이스: 모드와 variant 인덱스로 설정
    setMode(modeIndex, variantIndex = 0) {
        this.currentMode = modeIndex;
        this.currentVariant = variantIndex;
        // 각 엔진에서 오버라이드하여 실제 초기화 수행
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
        // Base implementation does nothing
    }

    hexToRgba(hex, alpha) {
        // Handle hex with alpha or without
        let r = 0, g = 0, b = 0;
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

