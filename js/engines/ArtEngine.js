/**
 * Generative Art Engines Base Class
 */

export class ArtEngine {
    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.colors = colors || ['#ffffff'];
        this.width = canvas.width;
        this.height = canvas.height;
        this.frame = 0;
        this.transparentMode = transparentMode;
        this.data = data;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    update() {
        this.frame++;
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
