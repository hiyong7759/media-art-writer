/**
 * Gallery3D - Main controller for the 3D virtual museum
 * Orchestrates scene, rooms, player, game system, and rendering
 */

import { PlayerController } from './PlayerController.js';
import { ArtistRoom } from './ArtistRoom.js';
import { ParticleSystem3D } from './ParticleSystem3D.js';
import { GameSystem } from './GameSystem.js';

class Gallery3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.gameSystem = null;
        this.clock = new THREE.Clock();

        this.artists = [];
        this.rooms = [];
        this.particleSystems = [];
        this.interactables = [];
        this.currentNearArtwork = null;

        this.hubRadius = 8;
        this.roomDistance = 22;
        this.latestDate = null;

        this.frame = 0;
        this.minimapCtx = null;

        this._init();
    }

    async _init() {
        this._updateLoading(10, 'Loading artist data...');
        await this._loadData();

        this._updateLoading(30, 'Creating 3D scene...');
        this._setupScene();
        this._setupRenderer();

        this._updateLoading(50, 'Building museum...');
        this._buildCentralHub();
        this._buildRooms();

        this._updateLoading(70, 'Placing collectibles...');
        this._setupGameSystem();

        this._updateLoading(85, 'Initializing controls...');
        this._setupPlayer();
        this._setupMinimap();
        this._setupInteraction();

        this._updateLoading(100, 'Ready');

        // Show start screen after short delay
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('fade-out');
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
                document.getElementById('startScreen').classList.remove('hidden');
            }, 800);
        }, 500);

        this._setupStartButton();
    }

    _updateLoading(pct, status) {
        const fill = document.getElementById('loadingBarFill');
        const statusEl = document.getElementById('loadingStatus');
        if (fill) fill.style.width = pct + '%';
        if (statusEl) statusEl.textContent = status;
    }

    async _loadData() {
        try {
            const resp = await fetch(`data/artists.json?v=${Date.now()}`);
            const data = await resp.json();
            this.artists = data.artists || [];
        } catch (e) {
            console.warn('Failed to load artists:', e);
            this.artists = [];
        }

        try {
            const resp = await fetch(`data/history.json?v=${Date.now()}`);
            const history = await resp.json();
            // Find latest date across all artists
            let latest = null;
            for (const artistId of Object.keys(history)) {
                const dates = Object.keys(history[artistId]).sort();
                if (dates.length > 0) {
                    const d = dates[dates.length - 1];
                    if (!latest || d > latest) latest = d;
                }
            }
            this.latestDate = latest || new Date().toISOString().split('T')[0];
        } catch (e) {
            this.latestDate = new Date().toISOString().split('T')[0];
        }
    }

    _setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050510);
        this.scene.fog = new THREE.FogExp2(0x050510, 0.015);

        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            200
        );
        this.camera.position.set(0, 1.7, 0);

        // Ambient light
        const ambient = new THREE.AmbientLight(0x222233, 0.5);
        this.scene.add(ambient);
    }

    _setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.insertBefore(this.renderer.domElement, document.body.firstChild);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    _buildCentralHub() {
        // Circular floor
        const floorGeo = new THREE.CircleGeometry(this.hubRadius, 64);
        const floorMat = new THREE.MeshBasicMaterial({
            color: 0x0a0a1a,
            side: THREE.DoubleSide,
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        this.scene.add(floor);

        // Center pillar / monument
        const pillarGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
        const pillarMat = new THREE.MeshBasicMaterial({
            color: 0x1a1a2e,
            transparent: true,
            opacity: 0.8,
        });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(0, 1.5, 0);
        this.scene.add(pillar);

        // Glowing top of pillar
        const topGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const topMat = new THREE.MeshBasicMaterial({
            color: 0x00ffaa,
            transparent: true,
            opacity: 0.6,
        });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.set(0, 3.2, 0);
        top.userData = { type: 'hubGlow' };
        this.scene.add(top);

        // Title text on the floor
        const titleCanvas = document.createElement('canvas');
        titleCanvas.width = 1024;
        titleCanvas.height = 256;
        const ctx = titleCanvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, 1024, 256);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MEDIA ART MUSEUM', 512, 100);
        ctx.fillStyle = 'rgba(0,255,170,0.4)';
        ctx.font = '24px sans-serif';
        ctx.fillText('9 Virtual Artists Gallery', 512, 160);

        const titleTexture = new THREE.CanvasTexture(titleCanvas);
        const titleGeo = new THREE.PlaneGeometry(6, 1.5);
        const titleMat = new THREE.MeshBasicMaterial({
            map: titleTexture,
            transparent: true,
            side: THREE.DoubleSide,
        });
        const titleMesh = new THREE.Mesh(titleGeo, titleMat);
        titleMesh.rotation.x = -Math.PI / 2;
        titleMesh.position.set(0, 0.03, 3);
        this.scene.add(titleMesh);

        // Direction markers to each room
        for (let i = 0; i < this.artists.length; i++) {
            const angle = (i / this.artists.length) * Math.PI * 2 - Math.PI / 2;
            const artist = this.artists[i];
            const color = artist.styleHints?.colorPalette?.[0] || '#fff';

            // Arrow on floor
            const arrowGeo = new THREE.PlaneGeometry(0.5, 2);
            const arrowCanvas = document.createElement('canvas');
            arrowCanvas.width = 128;
            arrowCanvas.height = 512;
            const actx = arrowCanvas.getContext('2d');
            actx.fillStyle = color;
            actx.globalAlpha = 0.4;
            // Arrow shape
            actx.beginPath();
            actx.moveTo(64, 0);
            actx.lineTo(128, 128);
            actx.lineTo(96, 128);
            actx.lineTo(96, 512);
            actx.lineTo(32, 512);
            actx.lineTo(32, 128);
            actx.lineTo(0, 128);
            actx.closePath();
            actx.fill();

            const arrowTexture = new THREE.CanvasTexture(arrowCanvas);
            const arrowMat = new THREE.MeshBasicMaterial({
                map: arrowTexture,
                transparent: true,
                side: THREE.DoubleSide,
            });
            const arrow = new THREE.Mesh(arrowGeo, arrowMat);
            arrow.rotation.x = -Math.PI / 2;
            arrow.rotation.z = -angle + Math.PI / 2;
            arrow.position.set(
                Math.cos(angle) * (this.hubRadius - 2),
                0.03,
                Math.sin(angle) * (this.hubRadius - 2)
            );
            this.scene.add(arrow);

            // Artist name label
            const labelCanvas = document.createElement('canvas');
            labelCanvas.width = 256;
            labelCanvas.height = 64;
            const lctx = labelCanvas.getContext('2d');
            lctx.fillStyle = color;
            lctx.font = 'bold 28px monospace';
            lctx.textAlign = 'center';
            lctx.fillText(artist.name, 128, 40);

            const labelTexture = new THREE.CanvasTexture(labelCanvas);
            const labelGeo = new THREE.PlaneGeometry(1.5, 0.4);
            const labelMat = new THREE.MeshBasicMaterial({
                map: labelTexture,
                transparent: true,
                side: THREE.DoubleSide,
            });
            const label = new THREE.Mesh(labelGeo, labelMat);
            label.position.set(
                Math.cos(angle) * (this.hubRadius - 0.5),
                0.5,
                Math.sin(angle) * (this.hubRadius - 0.5)
            );
            label.lookAt(0, 0.5, 0);
            this.scene.add(label);
        }

        // Outer boundary (subtle wall)
        this._buildOuterBoundary();
    }

    _buildOuterBoundary() {
        // Large circular boundary at the edges of the museum
        const boundaryRadius = 50;
        const segments = 64;
        for (let i = 0; i < segments; i++) {
            const a = (i / segments) * Math.PI * 2;
            const nextA = ((i + 1) / segments) * Math.PI * 2;
            const x1 = Math.cos(a) * boundaryRadius;
            const z1 = Math.sin(a) * boundaryRadius;
            const x2 = Math.cos(nextA) * boundaryRadius;
            const z2 = Math.sin(nextA) * boundaryRadius;

            const width = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
            const geo = new THREE.PlaneGeometry(width, 8);
            const mat = new THREE.MeshBasicMaterial({
                color: 0x050510,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9,
            });
            const wall = new THREE.Mesh(geo, mat);
            wall.position.set((x1 + x2) / 2, 4, (z1 + z2) / 2);
            wall.lookAt(0, 4, 0);
            this.scene.add(wall);
        }

        // Ground plane (large)
        const groundGeo = new THREE.PlaneGeometry(120, 120);
        const groundMat = new THREE.MeshBasicMaterial({
            color: 0x050510,
            side: THREE.DoubleSide,
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        this.scene.add(ground);
    }

    _buildRooms() {
        for (let i = 0; i < this.artists.length; i++) {
            const angle = (i / this.artists.length) * Math.PI * 2 - Math.PI / 2;
            const artist = this.artists[i];

            const roomCenter = new THREE.Vector3(
                Math.cos(angle) * this.roomDistance,
                0,
                Math.sin(angle) * this.roomDistance
            );

            // Room faces back toward center
            const roomAngle = angle + Math.PI;

            const room = new ArtistRoom(this.scene, artist, roomCenter, roomAngle);
            room.build(this.latestDate);
            this.rooms.push(room);

            // Collect interactables
            this.interactables.push(...room.getInteractables());

            // Create particles for this room
            const colors = artist.styleHints?.colorPalette || ['#fff'];
            const particles = ParticleSystem3D.create(
                this.scene, artist.id, colors, roomCenter, 8
            );
            this.particleSystems.push(particles);
        }
    }

    _setupGameSystem() {
        this.gameSystem = new GameSystem();
        this.gameSystem.init(this.artists);

        // Create orbs in each room
        for (let i = 0; i < this.rooms.length; i++) {
            const room = this.rooms[i];
            const artist = this.artists[i];
            const orbPos = room.getOrbPosition();
            const color = artist.styleHints?.colorPalette?.[0] || '#fff';

            const orb = this.gameSystem.createOrb(this.scene, artist.id, orbPos, color);
            orb.userData.baseY = orbPos.y;
            orb.userData.phase = Math.random() * Math.PI * 2;
        }
    }

    _setupPlayer() {
        this.player = new PlayerController(this.camera, this.renderer.domElement);
        this.player.position.set(0, 1.7, 5);
    }

    _setupMinimap() {
        const canvas = document.getElementById('minimapCanvas');
        if (canvas) {
            this.minimapCtx = canvas.getContext('2d');
        }
    }

    _setupInteraction() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyE') {
                this._handleInteraction();
            }
            if (e.code === 'Escape') {
                this._closePanel();
                // Also close collection book
                const cb = document.getElementById('collectionBook');
                if (cb) cb.remove();
            }
            if (e.code === 'KeyC') {
                this.gameSystem.showCollectionBook();
            }
        });

        // Collection book button
        const collBtn = document.getElementById('collectionBtn');
        if (collBtn) {
            collBtn.addEventListener('click', () => {
                this.gameSystem.showCollectionBook();
            });
        }
    }

    _setupStartButton() {
        const btn = document.getElementById('startButton');
        if (btn) {
            btn.addEventListener('click', () => {
                document.getElementById('startScreen').classList.add('hidden');
                document.getElementById('hud').classList.remove('hidden');
                this.player.lock();
                this._startGameLoop();
            });
        }
    }

    _startGameLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            const delta = Math.min(this.clock.getDelta(), 0.1);
            this.frame++;

            // Update player
            this.player.update(delta);

            // Update particles
            for (const ps of this.particleSystems) {
                ps.update(delta);
            }

            // Update game system
            this.gameSystem.updateOrbs(this.frame);
            this.gameSystem.checkOrbCollection(this.player.getPosition());

            // Spawn scatter orbs periodically in rooms
            this._spawnScatterOrbs();

            // Check room proximity
            this._checkRoomProximity();

            // Check artwork interaction
            this._checkNearbyArtwork();

            // Update hub glow
            this._updateHubGlow();

            // Update minimap
            this._updateMinimap();

            // Render
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    _checkRoomProximity() {
        const pos = this.player.getPosition();

        // Check if in hub
        const hubDist = Math.sqrt(pos.x ** 2 + pos.z ** 2);
        if (hubDist < this.hubRadius) {
            this.gameSystem.setLocation('Central Hall');
            return;
        }

        // Check each room
        for (let i = 0; i < this.rooms.length; i++) {
            const roomCenter = this.rooms[i].getCenter();
            const dist = pos.distanceTo(roomCenter);
            if (dist < 10) {
                const artist = this.artists[i];
                this.gameSystem.setLocation(`${artist.name} - ${artist.theme}`);
                this.gameSystem.checkRoomDiscovery(artist.id, artist.name);
                return;
            }
        }

        this.gameSystem.setLocation('Corridor');
    }

    _checkNearbyArtwork() {
        const pos = this.player.getPosition();
        const dir = this.player.getForwardDirection();
        let nearestArtwork = null;
        let nearestDist = Infinity;

        for (const obj of this.interactables) {
            if (obj.userData.type !== 'artwork') continue;
            const dist = pos.distanceTo(obj.position);
            if (dist < 4 && dist < nearestDist) {
                nearestDist = dist;
                nearestArtwork = obj;
            }
        }

        if (nearestArtwork && nearestDist < 4) {
            this.currentNearArtwork = nearestArtwork;
            this.gameSystem.showInteractionPrompt('작품 감상하기');
        } else {
            this.currentNearArtwork = null;
            this.gameSystem.hideInteractionPrompt();
        }
    }

    _handleInteraction() {
        if (!this.currentNearArtwork) return;

        const data = this.currentNearArtwork.userData;
        const artist = data.artist;
        if (!artist) return;

        // Show artist panel
        const panel = document.getElementById('artistPanel');
        if (!panel) return;

        document.getElementById('panelArtistName').textContent = artist.name;
        document.getElementById('panelArtistTheme').textContent = artist.theme;
        document.getElementById('panelDescription').textContent =
            artist.description?.ko || artist.description?.en || '';

        // Colors
        const colorsEl = document.getElementById('panelColors');
        if (colorsEl && artist.styleHints?.colorPalette) {
            colorsEl.innerHTML = artist.styleHints.colorPalette.map(c =>
                `<div class="panel-color-dot" style="background: ${c}"></div>`
            ).join('');
        }

        // Artwork image
        const img = document.getElementById('panelArtworkImage');
        if (img && data.latestDate) {
            img.src = `data/artworks/${data.latestDate}/${artist.id}.png`;
            img.onerror = () => { img.style.display = 'none'; };
            img.onload = () => { img.style.display = 'block'; };
        }

        // Link to 2D viewer
        const link = document.getElementById('panelViewLink');
        if (link) {
            link.href = `viewer.html?artist=${artist.id}&date=${data.latestDate || ''}`;
        }

        panel.classList.remove('hidden');
        this.player.unlock();

        // Close button
        document.getElementById('panelClose').onclick = () => this._closePanel();

        // Add score for viewing
        this.gameSystem.addScore(25);
    }

    _closePanel() {
        const panel = document.getElementById('artistPanel');
        if (panel && !panel.classList.contains('hidden')) {
            panel.classList.add('hidden');
            this.player.lock();
        }
    }

    _spawnScatterOrbs() {
        // Spawn a scatter orb every ~300 frames (~5 seconds) in a random room
        if (this.frame % 300 !== 0) return;
        if (this.gameSystem.scatterOrbs.filter(o => !o.userData.collected).length >= 15) return;

        const roomIndex = Math.floor(Math.random() * this.rooms.length);
        const room = this.rooms[roomIndex];
        const artist = this.artists[roomIndex];
        const center = room.getCenter();
        const pos = new THREE.Vector3(
            center.x + (Math.random() - 0.5) * 10,
            1 + Math.random() * 2,
            center.z + (Math.random() - 0.5) * 10
        );
        this.gameSystem.createScatterOrb(this.scene, pos, artist.id);
    }

    _updateHubGlow() {
        this.scene.traverse((obj) => {
            if (obj.userData?.type === 'hubGlow') {
                obj.material.opacity = 0.4 + 0.2 * Math.sin(this.frame * 0.02);
                obj.rotation.y += 0.005;
            }
        });
    }

    _updateMinimap() {
        if (!this.minimapCtx) return;
        const ctx = this.minimapCtx;
        const w = 160, h = 160;
        const scale = 2.5; // pixels per unit
        const cx = w / 2, cy = h / 2;
        const pos = this.player.getPosition();
        const rot = this.player.getYRotation();

        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);

        // Hub circle
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx - pos.x * scale, cy - pos.z * scale, this.hubRadius * scale, 0, Math.PI * 2);
        ctx.stroke();

        // Rooms
        for (let i = 0; i < this.rooms.length; i++) {
            const roomCenter = this.rooms[i].getCenter();
            const artist = this.artists[i];
            const color = artist.styleHints?.colorPalette?.[0] || '#fff';

            const rx = cx + (roomCenter.x - pos.x) * scale;
            const rz = cy + (roomCenter.z - pos.z) * scale;

            // Room circle
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(rx, rz, 8 * scale, 0, Math.PI * 2);
            ctx.stroke();

            // Room dot
            ctx.fillStyle = color;
            ctx.globalAlpha = this.gameSystem.discoveredRooms.has(artist.id) ? 0.8 : 0.3;
            ctx.beginPath();
            ctx.arc(rx, rz, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1;
        }

        // Player
        ctx.fillStyle = '#00ffaa';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();

        // Player direction
        ctx.strokeStyle = '#00ffaa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
            cx + Math.sin(rot) * 12,
            cy - Math.cos(rot) * 12
        );
        ctx.stroke();

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, w, h);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new Gallery3D();
});
