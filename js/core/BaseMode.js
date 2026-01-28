/**
 * BaseMode - Abstract base class for all visualization modes
 * All mode implementations should extend this class
 *
 * @abstract
 */
export class BaseMode {
    /**
     * @param {ArtEngine} engine - Parent engine instance
     */
    constructor(engine) {
        if (new.target === BaseMode) {
            throw new Error('BaseMode is abstract and cannot be instantiated directly');
        }
        this.engine = engine;
        this.style = 0;
        this.particles = [];
    }

    /**
     * Initialize mode with variant
     * @param {number} variant - Variant index (0, 1, 2)
     */
    init(variant = 0) {
        this.style = variant;
        this.particles = [];
    }

    /**
     * Draw current frame - must be implemented by subclass
     * @abstract
     */
    draw() {
        throw new Error('draw() must be implemented by subclass');
    }

    /**
     * Handle canvas resize
     * Override in subclass if special resize handling needed
     */
    resize() {
        // Re-initialize particles on resize
        this.init(this.style);
    }

    // ==================== Utility Accessors ====================

    /** @returns {CanvasRenderingContext2D} */
    get ctx() {
        return this.engine.ctx;
    }

    /** @returns {number} */
    get width() {
        return this.engine.width;
    }

    /** @returns {number} */
    get height() {
        return this.engine.height;
    }

    /** @returns {number} */
    get frame() {
        return this.engine.frame;
    }

    /** @returns {string[]} */
    get colors() {
        return this.engine.colors;
    }

    // ==================== Helper Methods ====================

    /**
     * Convert hex color to rgba
     * @param {string} hex - Hex color string
     * @param {number} alpha - Alpha value (0-1)
     * @returns {string} rgba string
     */
    hexToRgba(hex, alpha) {
        return this.engine.hexToRgba(hex, alpha);
    }

    /**
     * Get random color from palette
     * @returns {string} Random color from engine's palette
     */
    randomColor() {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    /**
     * Create particle with common properties
     * @param {Object} props - Additional properties
     * @returns {Object} Particle object
     */
    createParticle(props = {}) {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            color: this.randomColor(),
            ...props
        };
    }
}
