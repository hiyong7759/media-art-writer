/**
 * Color Utility Functions
 */

/**
 * Convert hex color to rgba string
 * @param {string} hex - Hex color (e.g., '#ff0000' or '#f00')
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} rgba color string
 */
export function hexToRgba(hex, alpha = 1) {
    if (!hex) return `rgba(0, 0, 0, ${alpha})`;

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

/**
 * Get random color from palette
 * @param {string[]} palette - Array of color strings
 * @returns {string} Random color
 */
export function randomColor(palette) {
    return palette[Math.floor(Math.random() * palette.length)];
}

/**
 * Interpolate between two colors
 * @param {string} color1 - Start color (hex)
 * @param {string} color2 - End color (hex)
 * @param {number} t - Interpolation factor (0-1)
 * @returns {string} Interpolated color (hex)
 */
export function lerpColor(color1, color2, t) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);

    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Convert hex to RGB object
 * @param {string} hex - Hex color
 * @returns {{r: number, g: number, b: number}}
 */
export function hexToRgb(hex) {
    if (hex.startsWith('#')) hex = hex.slice(1);

    if (hex.length === 3) {
        return {
            r: parseInt(hex[0] + hex[0], 16),
            g: parseInt(hex[1] + hex[1], 16),
            b: parseInt(hex[2] + hex[2], 16)
        };
    }

    return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
    };
}
