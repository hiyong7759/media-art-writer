/**
 * ArtistRoom - Builds themed 3D rooms for each artist
 * Generates walls, floors, lighting, artwork frames, and portals
 */

export class ArtistRoom {
    constructor(scene, artist, position, angle) {
        this.scene = scene;
        this.artist = artist;
        this.center = position.clone();
        this.angle = angle; // Angle from center of museum
        this.group = new THREE.Group();
        this.roomRadius = 8;
        this.roomHeight = 5;
        this.interactables = []; // Objects player can interact with
        this.collisionObjects = [];

        this.scene.add(this.group);
    }

    build(latestDate) {
        this._buildFloor();
        this._buildWalls();
        this._buildCeiling();
        this._buildArtworkFrame(latestDate);
        this._buildArtistSign();
        this._buildAccentLighting();
        this._buildCorridor();
        return this;
    }

    _buildFloor() {
        const colors = this.artist.styleHints?.colorPalette || ['#333'];
        const baseColor = colors[0];

        const geo = new THREE.CircleGeometry(this.roomRadius, 32);
        const mat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(baseColor).multiplyScalar(0.15),
            side: THREE.DoubleSide,
        });
        const floor = new THREE.Mesh(geo, mat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.copy(this.center);
        floor.position.y = 0.01;
        this.group.add(floor);

        // Floor accent ring
        const ringGeo = new THREE.RingGeometry(this.roomRadius - 0.1, this.roomRadius, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(baseColor).multiplyScalar(0.3),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.copy(this.center);
        ring.position.y = 0.02;
        this.group.add(ring);
    }

    _buildWalls() {
        const colors = this.artist.styleHints?.colorPalette || ['#333'];
        const wallColor = new THREE.Color(colors[0]).multiplyScalar(0.08);

        // Create curved wall segments (open on corridor side)
        const segments = 24;
        const corridorAngle = this.angle; // Direction back to center
        const openingWidth = Math.PI / 4; // How wide the opening is

        for (let i = 0; i < segments; i++) {
            const a = (i / segments) * Math.PI * 2;

            // Skip segments near the corridor opening
            const angleDiff = Math.abs(this._angleDiff(a, corridorAngle));
            if (angleDiff < openingWidth) continue;

            const nextA = ((i + 1) / segments) * Math.PI * 2;
            const nextAngleDiff = Math.abs(this._angleDiff(nextA, corridorAngle));
            if (nextAngleDiff < openingWidth) continue;

            const x1 = this.center.x + Math.cos(a) * this.roomRadius;
            const z1 = this.center.z + Math.sin(a) * this.roomRadius;
            const x2 = this.center.x + Math.cos(nextA) * this.roomRadius;
            const z2 = this.center.z + Math.sin(nextA) * this.roomRadius;

            const width = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
            const geo = new THREE.PlaneGeometry(width, this.roomHeight);
            const mat = new THREE.MeshBasicMaterial({
                color: wallColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85,
            });
            const wall = new THREE.Mesh(geo, mat);
            wall.position.set((x1 + x2) / 2, this.roomHeight / 2, (z1 + z2) / 2);
            wall.lookAt(this.center.x, this.roomHeight / 2, this.center.z);
            this.group.add(wall);
        }
    }

    _buildCeiling() {
        const colors = this.artist.styleHints?.colorPalette || ['#333'];
        const geo = new THREE.CircleGeometry(this.roomRadius, 32);
        const mat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(colors[0]).multiplyScalar(0.05),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6,
        });
        const ceiling = new THREE.Mesh(geo, mat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.copy(this.center);
        ceiling.position.y = this.roomHeight;
        this.group.add(ceiling);
    }

    _buildArtworkFrame(latestDate) {
        // Place artwork on the wall opposite to the entrance
        const oppositeAngle = this.angle + Math.PI;
        const frameDistance = this.roomRadius - 0.5;
        const fx = this.center.x + Math.cos(oppositeAngle) * frameDistance;
        const fz = this.center.z + Math.sin(oppositeAngle) * frameDistance;

        // Frame border
        const frameW = 3;
        const frameH = 2;
        const frameGeo = new THREE.PlaneGeometry(frameW + 0.2, frameH + 0.2);
        const frameMat = new THREE.MeshBasicMaterial({
            color: 0x222222,
            side: THREE.DoubleSide,
        });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.set(fx, 2.2, fz);
        frame.lookAt(this.center.x, 2.2, this.center.z);
        this.group.add(frame);

        // Artwork plane (will be textured when image loads)
        const artGeo = new THREE.PlaneGeometry(frameW, frameH);
        const artMat = new THREE.MeshBasicMaterial({
            color: 0x111111,
            side: THREE.DoubleSide,
        });
        const artwork = new THREE.Mesh(artGeo, artMat);
        artwork.position.set(fx, 2.2, fz);
        // Nudge slightly forward from frame
        const toCenter = new THREE.Vector3(this.center.x - fx, 0, this.center.z - fz).normalize();
        artwork.position.add(toCenter.multiplyScalar(0.05));
        artwork.lookAt(
            artwork.position.x + (this.center.x - fx),
            2.2,
            artwork.position.z + (this.center.z - fz)
        );
        artwork.userData = {
            type: 'artwork',
            artistId: this.artist.id,
            artist: this.artist,
            latestDate: latestDate,
        };
        this.group.add(artwork);
        this.interactables.push(artwork);

        // Try to load artwork image
        if (latestDate) {
            const imgUrl = `data/artworks/${latestDate}/${this.artist.id}.png`;
            const loader = new THREE.TextureLoader();
            loader.load(imgUrl, (texture) => {
                artwork.material.map = texture;
                artwork.material.color.set(0xffffff);
                artwork.material.needsUpdate = true;
            }, undefined, () => {
                // Image not found - show colored placeholder
                artwork.material.color.set(
                    new THREE.Color(this.artist.styleHints?.colorPalette?.[0] || '#333').multiplyScalar(0.3)
                );
            });
        }

        // Spotlight effect on artwork
        const spotGeo = new THREE.PlaneGeometry(frameW + 1, 0.1);
        const spotMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
        });
        const spot = new THREE.Mesh(spotGeo, spotMat);
        spot.position.set(fx, 3.5, fz);
        spot.lookAt(this.center.x, 3.5, this.center.z);
        this.group.add(spot);
    }

    _buildArtistSign() {
        // Text label near artwork using a simple plane with canvas texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx2d = canvas.getContext('2d');

        ctx2d.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx2d.fillRect(0, 0, 512, 128);

        ctx2d.fillStyle = this.artist.styleHints?.colorPalette?.[0] || '#fff';
        ctx2d.font = 'bold 36px monospace';
        ctx2d.fillText(this.artist.name, 20, 45);

        ctx2d.fillStyle = '#aaa';
        ctx2d.font = '20px sans-serif';
        ctx2d.fillText(this.artist.theme || '', 20, 80);

        const desc = this.artist.description?.ko || '';
        ctx2d.fillStyle = '#666';
        ctx2d.font = '14px sans-serif';
        ctx2d.fillText(desc.substring(0, 40), 20, 108);

        const texture = new THREE.CanvasTexture(canvas);
        const geo = new THREE.PlaneGeometry(2, 0.5);
        const mat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
        });

        const sign = new THREE.Mesh(geo, mat);
        const oppositeAngle = this.angle + Math.PI;
        const signDist = this.roomRadius - 0.4;
        // Offset to the side of the artwork
        const sideAngle = oppositeAngle + 0.35;
        sign.position.set(
            this.center.x + Math.cos(sideAngle) * signDist,
            1.0,
            this.center.z + Math.sin(sideAngle) * signDist
        );
        sign.lookAt(this.center.x, 1.0, this.center.z);
        this.group.add(sign);
    }

    _buildAccentLighting() {
        const colors = this.artist.styleHints?.colorPalette || ['#ffffff'];

        // Ground accent lights (small glowing planes)
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const color = colors[i % colors.length];
            const geo = new THREE.CircleGeometry(0.2, 8);
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(color),
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide,
            });
            const light = new THREE.Mesh(geo, mat);
            light.rotation.x = -Math.PI / 2;
            light.position.set(
                this.center.x + Math.cos(angle) * (this.roomRadius - 1),
                0.03,
                this.center.z + Math.sin(angle) * (this.roomRadius - 1)
            );
            this.group.add(light);
        }

        // Vertical light pillars at entrance
        const entranceAngle = this.angle;
        for (const side of [-1, 1]) {
            const pillarAngle = entranceAngle + side * (Math.PI / 8);
            const geo = new THREE.CylinderGeometry(0.05, 0.05, this.roomHeight, 8);
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(colors[0]),
                transparent: true,
                opacity: 0.2,
            });
            const pillar = new THREE.Mesh(geo, mat);
            pillar.position.set(
                this.center.x + Math.cos(pillarAngle) * this.roomRadius,
                this.roomHeight / 2,
                this.center.z + Math.sin(pillarAngle) * this.roomRadius
            );
            this.group.add(pillar);
        }
    }

    _buildCorridor() {
        // Build a short corridor from center hub to this room
        const corridorAngle = this.angle;
        const corridorLength = 5;
        const hubRadius = 8; // Must match Gallery3D hub radius
        const startDist = hubRadius;
        const endDist = this._distToCenter() - this.roomRadius;

        if (endDist <= startDist) return;

        const corridorWidth = 2.5;
        const corridorHeight = 3.5;
        const colors = this.artist.styleHints?.colorPalette || ['#333'];
        const wallColor = new THREE.Color(colors[0]).multiplyScalar(0.06);

        // Left and right walls
        for (const side of [-1, 1]) {
            const geo = new THREE.PlaneGeometry(endDist - startDist, corridorHeight);
            const mat = new THREE.MeshBasicMaterial({
                color: wallColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7,
            });
            const wall = new THREE.Mesh(geo, mat);

            const perpAngle = corridorAngle + side * Math.PI / 2;
            const midDist = (startDist + endDist) / 2;
            wall.position.set(
                Math.cos(corridorAngle) * midDist + Math.cos(perpAngle) * corridorWidth / 2,
                corridorHeight / 2,
                Math.sin(corridorAngle) * midDist + Math.sin(perpAngle) * corridorWidth / 2
            );
            wall.rotation.y = -corridorAngle + Math.PI / 2;
            this.group.add(wall);
        }

        // Corridor floor
        const floorGeo = new THREE.PlaneGeometry(corridorWidth, endDist - startDist);
        const floorMat = new THREE.MeshBasicMaterial({
            color: wallColor.clone().multiplyScalar(1.5),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
        });
        const corridorFloor = new THREE.Mesh(floorGeo, floorMat);
        const midDist = (startDist + endDist) / 2;
        corridorFloor.rotation.x = -Math.PI / 2;
        corridorFloor.rotation.z = -corridorAngle + Math.PI / 2;
        corridorFloor.position.set(
            Math.cos(corridorAngle) * midDist,
            0.02,
            Math.sin(corridorAngle) * midDist
        );
        this.group.add(corridorFloor);

        // Guide lights along corridor floor
        const numLights = 4;
        for (let i = 0; i < numLights; i++) {
            const t = startDist + (endDist - startDist) * ((i + 0.5) / numLights);
            const geo = new THREE.CircleGeometry(0.1, 8);
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(colors[0]),
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide,
            });
            const light = new THREE.Mesh(geo, mat);
            light.rotation.x = -Math.PI / 2;
            light.position.set(
                Math.cos(corridorAngle) * t,
                0.03,
                Math.sin(corridorAngle) * t
            );
            this.group.add(light);
        }
    }

    _distToCenter() {
        return Math.sqrt(this.center.x ** 2 + this.center.z ** 2);
    }

    _angleDiff(a, b) {
        let diff = a - b;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return diff;
    }

    getCenter() {
        return this.center.clone();
    }

    getInteractables() {
        return this.interactables;
    }

    getOrbPosition() {
        // Place orb near center of room, slightly elevated
        return new THREE.Vector3(
            this.center.x + (Math.random() - 0.5) * 3,
            1.5,
            this.center.z + (Math.random() - 0.5) * 3
        );
    }

    dispose() {
        this.group.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (child.material.map) child.material.map.dispose();
                child.material.dispose();
            }
        });
        this.scene.remove(this.group);
    }
}
