/**
 * EngineFactory - Factory pattern for creating art engines
 * Centralizes engine registration and instantiation
 */

// Engine imports
import { OrganicEngine } from '../engines/OrganicEngine.js';
import { GeometricEngine } from '../engines/GeometricEngine.js';
import { CyberpunkEngine } from '../engines/CyberpunkEngine.js';
import { WaveEngine } from '../engines/WaveEngine.js';
import { CosmicEngine } from '../engines/CosmicEngine.js';
import { FlowEngine } from '../engines/FlowEngine.js';
import { ContourEngine } from '../engines/ContourEngine.js';
import { RefractionEngine } from '../engines/RefractionEngine.js';
import { BloomEngine } from '../engines/BloomEngine.js';

/**
 * Engine Registry - Maps artist IDs to engine classes
 * @type {Map<string, typeof ArtEngine>}
 */
const ENGINE_REGISTRY = new Map([
    ['aura-7', OrganicEngine],      // Nature/Organic
    ['kuro-x', GeometricEngine],    // Geometric
    ['neon-v', CyberpunkEngine],    // Cyberpunk
    ['void-3', CosmicEngine],       // Cosmic
    ['aqua-5', FlowEngine],         // Flow/Water
    ['prism-2', RefractionEngine],  // Light/Refraction
    ['echo-0', WaveEngine],         // Sound/Wave
    ['terra-1', ContourEngine],     // Terrain/Contour
    ['flora-9', BloomEngine],       // Flower/Bloom
]);

/**
 * Default engine class when artist ID is not found
 */
const DEFAULT_ENGINE = OrganicEngine;

/**
 * EngineFactory class
 */
export class EngineFactory {
    /**
     * Create an engine instance for the given artist
     * @param {string} artistId - Artist identifier
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string[]} colors - Color palette
     * @param {boolean} transparentMode - Enable transparent background
     * @param {Object} data - Additional data (artwork info)
     * @returns {ArtEngine} Engine instance
     */
    static create(artistId, canvas, ctx, colors, transparentMode = false, data = null) {
        const EngineClass = ENGINE_REGISTRY.get(artistId) || DEFAULT_ENGINE;

        console.log(`%c[EngineFactory] Creating ${EngineClass.name} for artist: ${artistId}`,
            'color: #00aaff; font-weight: bold;');

        return new EngineClass(canvas, ctx, colors, transparentMode, data);
    }

    /**
     * Register a new engine class
     * @param {string} artistId - Artist identifier
     * @param {typeof ArtEngine} EngineClass - Engine class to register
     */
    static register(artistId, EngineClass) {
        ENGINE_REGISTRY.set(artistId, EngineClass);
        console.log(`[EngineFactory] Registered ${EngineClass.name} for artist: ${artistId}`);
    }

    /**
     * Check if an engine is registered for the given artist
     * @param {string} artistId - Artist identifier
     * @returns {boolean}
     */
    static has(artistId) {
        return ENGINE_REGISTRY.has(artistId);
    }

    /**
     * Get all registered artist IDs
     * @returns {string[]}
     */
    static getRegisteredArtists() {
        return Array.from(ENGINE_REGISTRY.keys());
    }

    /**
     * Get engine class for artist (without instantiating)
     * @param {string} artistId - Artist identifier
     * @returns {typeof ArtEngine}
     */
    static getEngineClass(artistId) {
        return ENGINE_REGISTRY.get(artistId) || DEFAULT_ENGINE;
    }
}
