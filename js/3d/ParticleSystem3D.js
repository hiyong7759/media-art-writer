/**
 * ParticleSystem3D - Artist-themed 3D particle effects
 * Each artist gets a unique particle behavior
 */

export class ParticleSystem3D {
    constructor(scene, colors, type = 'default') {
        this.scene = scene;
        this.colors = colors;
        this.type = type;
        this.particles = [];
        this.group = new THREE.Group();
        this.frame = 0;
        this.scene.add(this.group);
    }

    // Create particle system based on artist type
    static create(scene, artistId, colors, roomCenter, roomRadius) {
        const system = new ParticleSystem3D(scene, colors, artistId);
        system.roomCenter = roomCenter || new THREE.Vector3();
        system.roomRadius = roomRadius || 8;
        system._initByType(artistId);
        return system;
    }

    _initByType(type) {
        switch (type) {
            case 'aura-7': this._initOrganic(); break;
            case 'kuro-x': this._initGeometric(); break;
            case 'neon-v': this._initCyberpunk(); break;
            case 'void-3': this._initCosmic(); break;
            case 'aqua-5': this._initFlow(); break;
            case 'prism-2': this._initRefraction(); break;
            case 'echo-0': this._initWave(); break;
            case 'terra-1': this._initContour(); break;
            case 'flora-9': this._initBloom(); break;
            default: this._initDefault(); break;
        }
    }

    _makeParticleMaterial(color, size = 0.1, opacity = 0.8) {
        return new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: opacity,
        });
    }

    _addParticle(geo, mat, pos, userData = {}) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        Object.assign(mesh.userData, userData);
        this.group.add(mesh);
        this.particles.push(mesh);
        return mesh;
    }

    _randomInRoom(yMin = 0.5, yMax = 4) {
        const cx = this.roomCenter.x;
        const cz = this.roomCenter.z;
        const r = this.roomRadius * 0.7;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * r;
        return new THREE.Vector3(
            cx + Math.cos(angle) * dist,
            yMin + Math.random() * (yMax - yMin),
            cz + Math.sin(angle) * dist
        );
    }

    // --- Artist-specific initializers ---

    _initOrganic() {
        const geo = new THREE.SphereGeometry(0.05, 8, 8);
        for (let i = 0; i < 60; i++) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const mat = this._makeParticleMaterial(color, 0.05, 0.6);
            const pos = this._randomInRoom(0.5, 5);
            this._addParticle(geo, mat, pos, {
                baseY: pos.y,
                speed: 0.3 + Math.random() * 0.5,
                amplitude: 0.3 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2,
                orbitRadius: 0.5 + Math.random() * 1.5,
                orbitSpeed: 0.2 + Math.random() * 0.4,
            });
        }
    }

    _initGeometric() {
        const geos = [
            new THREE.BoxGeometry(0.15, 0.15, 0.15),
            new THREE.OctahedronGeometry(0.1),
            new THREE.TetrahedronGeometry(0.1),
        ];
        for (let i = 0; i < 40; i++) {
            const geo = geos[Math.floor(Math.random() * geos.length)];
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const mat = this._makeParticleMaterial(color, 0.1, 0.7);
            const pos = this._randomInRoom(1, 4);
            this._addParticle(geo, mat, pos, {
                rotSpeed: new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
                ),
                basePos: pos.clone(),
                driftSpeed: 0.1 + Math.random() * 0.3,
                driftRange: 0.5 + Math.random(),
                phase: Math.random() * Math.PI * 2,
            });
        }
    }

    _initCyberpunk() {
        const geo = new THREE.PlaneGeometry(0.02, 0.3);
        for (let i = 0; i < 80; i++) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const mat = this._makeParticleMaterial(color, 0.02, 0.5);
            mat.side = THREE.DoubleSide;
            const pos = this._randomInRoom(3, 6);
            this._addParticle(geo, mat, pos, {
                fallSpeed: 1 + Math.random() * 3,
                startY: pos.y,
                resetY: 6,
                groundY: 0,
            });
        }
    }

    _initCosmic() {
        const geo = new THREE.SphereGeometry(0.03, 6, 6);
        for (let i = 0; i < 100; i++) {
            const brightness = 0.5 + Math.random() * 0.5;
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const mat = this._makeParticleMaterial(color, 0.03, brightness);
            const pos = this._randomInRoom(0.3, 6);
            this._addParticle(geo, mat, pos, {
                twinkleSpeed: 1 + Math.random() * 3,
                twinklePhase: Math.random() * Math.PI * 2,
                baseOpacity: brightness,
                orbitCenter: this.roomCenter.clone(),
                orbitRadius: 1 + Math.random() * (this.roomRadius * 0.6),
                orbitSpeed: 0.05 + Math.random() * 0.15,
                orbitAngle: Math.random() * Math.PI * 2,
                orbitY: pos.y,
            });
        }
    }

    _initFlow() {
        const geo = new THREE.SphereGeometry(0.06, 8, 8);
        for (let i = 0; i < 50; i++) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const mat = this._makeParticleMaterial(color, 0.06, 0.5);
            const pos = this._randomInRoom(0.2, 3);
            const scale = 0.5 + Math.random() * 1.5;
            this._addParticle(geo, mat, pos, {
                riseSpeed: 0.3 + Math.random() * 0.7,
                wobbleSpeed: 1 + Math.random() * 2,
                wobbleAmount: 0.1 + Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2,
                resetY: -0.5,
                maxY: 5,
                scale: scale,
            });
        }
    }

    _initRefraction() {
        const geo = new THREE.SphereGeometry(0.08, 12, 12);
        for (let i = 0; i < 35; i++) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const mat = this._makeParticleMaterial(color, 0.08, 0.4);
            const pos = this._randomInRoom(1, 4);
            this._addParticle(geo, mat, pos, {
                basePos: pos.clone(),
                floatSpeed: 0.3 + Math.random() * 0.5,
                floatRange: 0.5 + Math.random(),
                pulseSpeed: 1 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2,
                colorCycle: Math.random() * Math.PI * 2,
            });
        }
    }

    _initWave() {
        const geo = new THREE.SphereGeometry(0.04, 6, 6);
        const rows = 8;
        const cols = 16;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const color = this.colors[Math.floor(Math.random() * this.colors.length)];
                const mat = this._makeParticleMaterial(color, 0.04, 0.6);
                const x = this.roomCenter.x + (c - cols / 2) * 0.8;
                const z = this.roomCenter.z + (r - rows / 2) * 0.8;
                const pos = new THREE.Vector3(x, 2, z);
                this._addParticle(geo, mat, pos, {
                    gridX: c,
                    gridZ: r,
                    baseY: 2,
                    waveAmp: 0.5 + Math.random() * 0.3,
                });
            }
        }
    }

    _initContour() {
        const geo = new THREE.BoxGeometry(0.3, 0.05, 0.3);
        for (let i = 0; i < 40; i++) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const mat = this._makeParticleMaterial(color, 0.1, 0.4);
            const pos = this._randomInRoom(0.1, 0.5);
            const scale = 0.5 + Math.random() * 2;
            this._addParticle(geo, mat, pos, {
                baseY: 0.1 + Math.random() * 0.3,
                layerOffset: Math.random() * Math.PI * 2,
                riseSpeed: 0.1 + Math.random() * 0.2,
                scale: scale,
            });
        }
    }

    _initBloom() {
        // Petal-shaped particles
        const geo = new THREE.CircleGeometry(0.08, 6);
        for (let i = 0; i < 50; i++) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const mat = this._makeParticleMaterial(color, 0.08, 0.6);
            mat.side = THREE.DoubleSide;
            const pos = this._randomInRoom(0.5, 4);
            this._addParticle(geo, mat, pos, {
                fallSpeed: 0.2 + Math.random() * 0.5,
                swaySpeed: 1 + Math.random() * 2,
                swayAmount: 0.3 + Math.random() * 0.5,
                rotSpeed: 0.5 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2,
                startY: 4 + Math.random() * 2,
                resetY: -0.5,
            });
        }
    }

    _initDefault() {
        this._initOrganic();
    }

    // --- Update by type ---

    update(deltaTime) {
        this.frame++;
        const t = this.frame * 0.01;

        for (const p of this.particles) {
            const d = p.userData;
            switch (this.type) {
                case 'aura-7':
                    p.position.y = d.baseY + Math.sin(t * d.speed + d.phase) * d.amplitude;
                    p.position.x += Math.sin(t * d.orbitSpeed + d.phase) * 0.005;
                    p.position.z += Math.cos(t * d.orbitSpeed + d.phase) * 0.005;
                    break;

                case 'kuro-x':
                    p.rotation.x += d.rotSpeed.x * deltaTime;
                    p.rotation.y += d.rotSpeed.y * deltaTime;
                    p.rotation.z += d.rotSpeed.z * deltaTime;
                    p.position.x = d.basePos.x + Math.sin(t * d.driftSpeed + d.phase) * d.driftRange;
                    p.position.y = d.basePos.y + Math.cos(t * d.driftSpeed * 0.7 + d.phase) * d.driftRange * 0.5;
                    break;

                case 'neon-v':
                    p.position.y -= d.fallSpeed * deltaTime;
                    if (p.position.y < d.groundY) {
                        p.position.y = d.resetY;
                        p.position.x = this.roomCenter.x + (Math.random() - 0.5) * this.roomRadius * 1.4;
                        p.position.z = this.roomCenter.z + (Math.random() - 0.5) * this.roomRadius * 1.4;
                    }
                    break;

                case 'void-3':
                    d.orbitAngle += d.orbitSpeed * deltaTime;
                    p.position.x = d.orbitCenter.x + Math.cos(d.orbitAngle) * d.orbitRadius;
                    p.position.z = d.orbitCenter.z + Math.sin(d.orbitAngle) * d.orbitRadius;
                    p.material.opacity = d.baseOpacity * (0.5 + 0.5 * Math.sin(t * d.twinkleSpeed + d.twinklePhase));
                    break;

                case 'aqua-5':
                    p.position.y += d.riseSpeed * deltaTime;
                    p.position.x += Math.sin(t * d.wobbleSpeed + d.phase) * d.wobbleAmount * deltaTime;
                    if (p.position.y > d.maxY) {
                        p.position.y = d.resetY;
                        const angle = Math.random() * Math.PI * 2;
                        const dist = Math.random() * this.roomRadius * 0.7;
                        p.position.x = this.roomCenter.x + Math.cos(angle) * dist;
                        p.position.z = this.roomCenter.z + Math.sin(angle) * dist;
                    }
                    p.scale.setScalar(d.scale * (0.8 + 0.2 * Math.sin(t * 2 + d.phase)));
                    break;

                case 'prism-2':
                    p.position.x = d.basePos.x + Math.sin(t * d.floatSpeed + d.phase) * d.floatRange;
                    p.position.y = d.basePos.y + Math.cos(t * d.floatSpeed * 0.7 + d.phase) * d.floatRange * 0.5;
                    p.material.opacity = 0.2 + 0.4 * Math.abs(Math.sin(t * d.pulseSpeed + d.phase));
                    // Color cycling
                    const hue = (t * 0.1 + d.colorCycle) % 1;
                    p.material.color.setHSL(hue, 0.8, 0.6);
                    break;

                case 'echo-0':
                    p.position.y = d.baseY + Math.sin(t * 2 + d.gridX * 0.5 + d.gridZ * 0.3) * d.waveAmp;
                    break;

                case 'terra-1':
                    p.position.y = d.baseY + Math.sin(t * d.riseSpeed + d.layerOffset) * 0.2;
                    p.material.opacity = 0.2 + 0.3 * Math.abs(Math.sin(t * 0.5 + d.layerOffset));
                    break;

                case 'flora-9':
                    p.position.y -= d.fallSpeed * deltaTime;
                    p.position.x += Math.sin(t * d.swaySpeed + d.phase) * d.swayAmount * deltaTime;
                    p.rotation.z += d.rotSpeed * deltaTime;
                    p.rotation.x += d.rotSpeed * 0.5 * deltaTime;
                    if (p.position.y < d.resetY) {
                        p.position.y = d.startY;
                        const angle = Math.random() * Math.PI * 2;
                        const dist = Math.random() * this.roomRadius * 0.7;
                        p.position.x = this.roomCenter.x + Math.cos(angle) * dist;
                        p.position.z = this.roomCenter.z + Math.sin(angle) * dist;
                    }
                    break;
            }
        }
    }

    dispose() {
        for (const p of this.particles) {
            p.geometry.dispose();
            p.material.dispose();
            this.group.remove(p);
        }
        this.scene.remove(this.group);
        this.particles = [];
    }
}
