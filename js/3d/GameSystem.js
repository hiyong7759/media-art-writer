/**
 * GameSystem - Manages game mechanics: collectibles, discovery, scoring, gacha, skill collection
 */

// All 9 artists' skill data (mirrored from engine SKILLS definitions)
const ARTIST_SKILLS = {
    'aura-7': [
        { name: 'Flow', nameKo: '흐름', variants: ['DNA', 'Stream', 'Network'] },
        { name: 'Seed', nameKo: '씨앗', variants: ['Cell', 'Sprout', 'Egg'] },
        { name: 'Wind', nameKo: '바람', variants: ['Breeze', 'Gale', 'Pollen'] },
        { name: 'Bloom', nameKo: '개화', variants: ['Heart', 'Lotus', 'Orbital'] },
        { name: 'Root', nameKo: '뿌리', variants: ['Taproot', 'Fibrous', 'Rhizome'] },
        { name: 'Pulse', nameKo: '맥동', variants: ['Breath', 'Shockwave', 'Magnetic'] },
        { name: 'Life', nameKo: '생명', variants: ['Firefly', 'Butterfly', 'Spirit'] }
    ],
    'kuro-x': [
        { name: 'Poly', nameKo: '다각형', variants: ['Shape', 'Hexagon', 'Voronoi'] },
        { name: 'Point', nameKo: '점', variants: ['Scatter', 'Grid', 'Orbit'] },
        { name: 'Line', nameKo: '선', variants: ['Connect', 'Flow', 'Web'] },
        { name: 'Solid', nameKo: '입체', variants: ['Cube', 'Pyramid', 'Sphere'] },
        { name: 'Fractal', nameKo: '프랙탈', variants: ['Tree', 'Snowflake', 'Sierpinski'] },
        { name: 'Dim', nameKo: '차원', variants: ['Hypercube', 'Projection', 'Fold'] },
        { name: 'Chaos', nameKo: '혼돈', variants: ['Attractor', 'Noise', 'Glitch'] }
    ],
    'neon-v': [
        { name: 'Rain', nameKo: '디지털 비', variants: ['Modern', 'Binary', 'Storm'] },
        { name: 'Scanner', nameKo: '스캔', variants: ['Horizontal', 'Vertical', 'Quantum'] },
        { name: 'HUD', nameKo: '인터페이스', variants: ['Brackets', 'Circle', 'Box'] },
        { name: 'Data', nameKo: '데이터', variants: ['Vertical', 'Horizontal', 'Scattered'] },
        { name: 'Circuit', nameKo: '회로', variants: ['Logic', 'Overload', 'Organic'] },
        { name: 'Sign', nameKo: '신호', variants: ['Sine', 'Noise', 'Pulse'] },
        { name: 'Net', nameKo: '네트워크', variants: ['Grid', 'Terrain', 'Warp'] }
    ],
    'void-3': [
        { name: 'Dust', nameKo: '성운', variants: ['Nebula', 'Stardust', 'DarkMatter'] },
        { name: 'Orbit', nameKo: '궤도', variants: ['Planet', 'Comet', 'Asteroid'] },
        { name: 'Nova', nameKo: '초신성', variants: ['Explosion', 'Remnant', 'Pulsar'] },
        { name: 'Void', nameKo: '공허', variants: ['BlackHole', 'Wormhole', 'Abyss'] },
        { name: 'Galaxy', nameKo: '은하', variants: ['Spiral', 'Elliptical', 'Collision'] },
        { name: 'Quasar', nameKo: '퀘이사', variants: ['Beam', 'Radio', 'Active'] },
        { name: 'Multi', nameKo: '다중우주', variants: ['Bubble', 'String', 'Quantum'] }
    ],
    'aqua-5': [
        { name: 'Bubble', nameKo: '거품', variants: ['Rising', 'Popping', 'Foam'] },
        { name: 'Drop', nameKo: '물방울', variants: ['Rain', 'Dew', 'Tear'] },
        { name: 'Ripple', nameKo: '파문', variants: ['Wave', 'Echo', 'Impact'] },
        { name: 'Tide', nameKo: '조류', variants: ['High', 'Low', 'Storm'] },
        { name: 'Deep', nameKo: '심해', variants: ['Abyss', 'Pressure', 'Glow'] },
        { name: 'Mist', nameKo: '안개', variants: ['Morning', 'Sea', 'Dense'] },
        { name: 'Ice', nameKo: '얼음', variants: ['Frost', 'Glacier', 'Crystal'] }
    ],
    'prism-2': [
        { name: 'Beam', nameKo: '광선', variants: ['Laser', 'Ray', 'Focus'] },
        { name: 'Spectrum', nameKo: '스펙트럼', variants: ['Rainbow', 'Prism', 'Split'] },
        { name: 'Glass', nameKo: '유리', variants: ['Shard', 'Pane', 'Frosted'] },
        { name: 'Bokeh', nameKo: '보케', variants: ['Circle', 'Hex', 'Star'] },
        { name: 'Neon', nameKo: '네온', variants: ['Glow', 'Sign', 'Flicker'] },
        { name: 'Mirror', nameKo: '거울', variants: ['Reflection', 'Distort', 'Infinite'] },
        { name: 'Flash', nameKo: '섬광', variants: ['Burst', 'Strobe', 'Flare'] }
    ],
    'echo-0': [
        { name: 'Wave', nameKo: '파동', variants: ['Sine', 'Square', 'Sawtooth'] },
        { name: 'Pulse', nameKo: '맥박', variants: ['Rhythm', 'Heartbeat', 'Tempo'] },
        { name: 'EQ', nameKo: '이퀄라이저', variants: ['Digital', 'Analog', 'Spectrum'] },
        { name: 'Noise', nameKo: '노이즈', variants: ['White', 'Pink', 'Static'] },
        { name: 'Voice', nameKo: '목소리', variants: ['Echo', 'Chorus', 'Reverb'] },
        { name: 'String', nameKo: '현', variants: ['Vibration', 'Pluck', 'Resonance'] },
        { name: 'Silence', nameKo: '침묵', variants: ['Void', 'Quiet', 'Mute'] }
    ],
    'terra-1': [
        { name: 'Map', nameKo: '지도', variants: ['Topo', 'Grid', 'Satellite'] },
        { name: 'Mountain', nameKo: '산맥', variants: ['Peak', 'Range', 'Valley'] },
        { name: 'River', nameKo: '강', variants: ['Flow', 'Delta', 'Meander'] },
        { name: 'Rock', nameKo: '암석', variants: ['Sediment', 'Igneous', 'Crystal'] },
        { name: 'Sand', nameKo: '모래', variants: ['Dune', 'Ripple', 'Grain'] },
        { name: 'Layer', nameKo: '지층', variants: ['Strata', 'Fault', 'Bedrock'] },
        { name: 'Core', nameKo: '중심', variants: ['Inner', 'Magma', 'Solid'] }
    ],
    'flora-9': [
        { name: 'Petal', nameKo: '꽃잎', variants: ['Rose', 'Cherry', 'Lily'] },
        { name: 'Bloom', nameKo: '개화', variants: ['Full', 'Bud', 'Wild'] },
        { name: 'Bouquet', nameKo: '꽃다발', variants: ['Round', 'Cascade', 'Posy'] },
        { name: 'Vine', nameKo: '덩굴', variants: ['Ivy', 'Thorn', 'Creeper'] },
        { name: 'Pollen', nameKo: '꽃가루', variants: ['Dust', 'Sparkle', 'Scent'] },
        { name: 'Garden', nameKo: '정원', variants: ['Secret', 'Zen', 'Maze'] },
        { name: 'Dry', nameKo: '건조', variants: ['Pressed', 'Withered', 'Vintage'] }
    ]
};

// Rarity system
const RARITY = {
    COMMON: { name: 'Common', nameKo: '일반', color: '#aaaaaa', chance: 0.60, stars: 1, scoreMultiplier: 1 },
    RARE: { name: 'Rare', nameKo: '레어', color: '#4da6ff', chance: 0.25, stars: 2, scoreMultiplier: 2 },
    EPIC: { name: 'Epic', nameKo: '에픽', color: '#b44dff', chance: 0.12, stars: 3, scoreMultiplier: 4 },
    LEGENDARY: { name: 'Legendary', nameKo: '전설', color: '#ffd700', chance: 0.03, stars: 4, scoreMultiplier: 10 },
};

export class GameSystem {
    constructor() {
        this.score = 0;
        this.discoveredRooms = new Set();
        this.collectedOrbs = new Set();
        this.totalArtists = 9;

        // Skill collection: Map<string, Set<string>> e.g. "aura-7:Flow" -> Set(["DNA", "Stream"])
        this.unlockedSkills = new Map();  // artistId:skillName -> Set of variant names
        this.totalCards = 0;
        this.gachaHistory = []; // Array of { artistId, skill, variant, rarity, timestamp }

        // Gacha state
        this.gachaActive = false;
        this.gachaQueue = []; // Pending gacha results to show

        // Orb meshes in the scene
        this.orbs = new Map();

        // Scatter orbs: small orbs that spawn over time
        this.scatterOrbs = [];
        this.scatterOrbCooldown = 0;

        // UI elements
        this.scoreEl = document.getElementById('scoreValue');
        this.discoveryFill = document.getElementById('discoveryFill');
        this.discoveryCount = document.getElementById('discoveryCount');
        this.locationEl = document.getElementById('currentLocation');
        this.notificationEl = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
        this.orbCollectionEl = document.getElementById('orbCollection');
        this.interactionPrompt = document.getElementById('interactionPrompt');
        this.interactionText = document.getElementById('interactionText');

        this._notifTimeout = null;
        this._gachaAnimTimeout = null;

        // Load saved progress
        this._loadProgress();
    }

    init(artists) {
        this.artists = artists;
        this._renderOrbCollection();
        this._updateCollectionCount();
    }

    // ==============================
    // ORB SYSTEM
    // ==============================

    createOrb(scene, artistId, position, color) {
        const group = new THREE.Group();

        const geo = new THREE.SphereGeometry(0.25, 16, 16);
        const mat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.8,
        });
        const sphere = new THREE.Mesh(geo, mat);
        group.add(sphere);

        const ringGeo = new THREE.RingGeometry(0.35, 0.4, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        group.add(ring);

        group.position.copy(position);
        group.userData = { type: 'orb', artistId, color, collected: false };
        scene.add(group);
        this.orbs.set(artistId, group);
        return group;
    }

    // Create smaller scatter orbs that appear in rooms periodically
    createScatterOrb(scene, position, artistId) {
        const artist = this.artists?.find(a => a.id === artistId);
        const colors = artist?.styleHints?.colorPalette || ['#fff'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const group = new THREE.Group();
        const geo = new THREE.SphereGeometry(0.15, 12, 12);
        const mat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.6,
        });
        group.add(new THREE.Mesh(geo, mat));

        // Small sparkle
        const sparkGeo = new THREE.OctahedronGeometry(0.08);
        const sparkMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
        });
        const spark = new THREE.Mesh(sparkGeo, sparkMat);
        spark.position.y = 0.25;
        group.add(spark);

        group.position.copy(position);
        group.userData = {
            type: 'scatterOrb',
            artistId,
            color,
            collected: false,
            baseY: position.y,
            phase: Math.random() * Math.PI * 2,
            lifetime: 600, // frames before despawn
            age: 0,
        };
        scene.add(group);
        this.scatterOrbs.push(group);
        return group;
    }

    updateOrbs(frame) {
        for (const [id, orb] of this.orbs) {
            if (orb.userData.collected) continue;
            const t = frame * 0.02;
            orb.position.y = orb.userData.baseY + Math.sin(t + orb.userData.phase) * 0.3;
            orb.rotation.y += 0.02;
            const ring = orb.children[1];
            if (ring) {
                ring.rotation.x = Math.sin(t * 0.5) * 0.5;
                ring.rotation.z = Math.cos(t * 0.7) * 0.5;
            }
        }

        // Update scatter orbs
        for (const orb of this.scatterOrbs) {
            if (orb.userData.collected) continue;
            orb.userData.age++;
            const t = frame * 0.03;
            orb.position.y = orb.userData.baseY + Math.sin(t + orb.userData.phase) * 0.2;
            orb.rotation.y += 0.03;

            // Fade out near end of life
            if (orb.userData.age > orb.userData.lifetime - 60) {
                const fade = (orb.userData.lifetime - orb.userData.age) / 60;
                orb.children[0].material.opacity = 0.6 * fade;
            }

            // Despawn
            if (orb.userData.age >= orb.userData.lifetime) {
                orb.visible = false;
                orb.userData.collected = true;
            }
        }

        // Cleanup dead scatter orbs
        this.scatterOrbs = this.scatterOrbs.filter(o => !o.userData.collected || o.visible);
    }

    checkOrbCollection(playerPos) {
        // Check main orbs
        for (const [artistId, orb] of this.orbs) {
            if (orb.userData.collected) continue;
            const dist = playerPos.distanceTo(orb.position);
            if (dist < 1.5) {
                this._collectMainOrb(artistId, orb);
                return artistId;
            }
        }

        // Check scatter orbs
        for (const orb of this.scatterOrbs) {
            if (orb.userData.collected) continue;
            const dist = playerPos.distanceTo(orb.position);
            if (dist < 1.2) {
                this._collectScatterOrb(orb);
                return orb.userData.artistId;
            }
        }

        return null;
    }

    _collectMainOrb(artistId, orb) {
        orb.userData.collected = true;
        this.collectedOrbs.add(artistId);
        this._animateOrbCollect(orb);
        this.addScore(100);
        this._updateOrbUI(artistId);

        const artist = this.artists?.find(a => a.id === artistId);
        const name = artist?.name || artistId;
        this.showNotification(`${name}의 에너지 오브 획득! +100`);

        // Trigger gacha roll!
        this._triggerGacha(artistId, 2); // Main orb gives 2 pulls
    }

    _collectScatterOrb(orb) {
        orb.userData.collected = true;
        this._animateOrbCollect(orb);
        this.addScore(25);

        // Trigger single gacha pull
        this._triggerGacha(orb.userData.artistId, 1);
    }

    _animateOrbCollect(orb) {
        const startScale = orb.scale.x;
        let progress = 0;
        const animate = () => {
            progress += 0.05;
            if (progress >= 1) {
                orb.visible = false;
                return;
            }
            const s = startScale * (1 - progress);
            orb.scale.set(s, s, s);
            orb.position.y += 0.1;
            requestAnimationFrame(animate);
        };
        animate();
    }

    // ==============================
    // GACHA SYSTEM
    // ==============================

    _triggerGacha(artistId, pulls) {
        const results = [];
        for (let i = 0; i < pulls; i++) {
            results.push(this._rollGacha(artistId));
        }

        // Queue results and show them
        this.gachaQueue.push(...results);
        if (!this.gachaActive) {
            this._showNextGacha();
        }
    }

    _rollGacha(artistId) {
        const skills = ARTIST_SKILLS[artistId];
        if (!skills) return null;

        // Pick random skill
        const skill = skills[Math.floor(Math.random() * skills.length)];
        // Pick random variant
        const variant = skill.variants[Math.floor(Math.random() * skill.variants.length)];
        // Roll rarity
        const rarity = this._rollRarity();

        // Check if it's new
        const key = `${artistId}:${skill.name}`;
        if (!this.unlockedSkills.has(key)) {
            this.unlockedSkills.set(key, new Set());
        }
        const isNew = !this.unlockedSkills.get(key).has(variant);
        this.unlockedSkills.get(key).add(variant);

        // Score based on rarity
        const scoreGain = 50 * rarity.scoreMultiplier * (isNew ? 2 : 1);
        this.addScore(scoreGain);

        this.totalCards++;

        const result = {
            artistId,
            artistName: this.artists?.find(a => a.id === artistId)?.name || artistId,
            skill: skill.name,
            skillKo: skill.nameKo,
            variant,
            rarity,
            isNew,
            scoreGain,
            timestamp: Date.now(),
        };

        this.gachaHistory.push(result);
        this._saveProgress();
        this._updateCollectionCount();

        return result;
    }

    _rollRarity() {
        const roll = Math.random();
        let cumulative = 0;
        for (const [key, rarity] of Object.entries(RARITY)) {
            cumulative += rarity.chance;
            if (roll <= cumulative) return rarity;
        }
        return RARITY.COMMON;
    }

    _showNextGacha() {
        if (this.gachaQueue.length === 0) {
            this.gachaActive = false;
            return;
        }

        this.gachaActive = true;
        const result = this.gachaQueue.shift();
        if (!result) {
            this._showNextGacha();
            return;
        }

        this._showGachaCard(result);
    }

    _showGachaCard(result) {
        // Remove existing gacha overlay
        const existing = document.getElementById('gachaOverlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'gachaOverlay';
        overlay.className = 'gacha-overlay';
        overlay.innerHTML = `
            <div class="gacha-card ${result.rarity.name.toLowerCase()}">
                <div class="gacha-rarity" style="color: ${result.rarity.color}">
                    ${'★'.repeat(result.rarity.stars)}${'☆'.repeat(4 - result.rarity.stars)}
                </div>
                <div class="gacha-rarity-name" style="color: ${result.rarity.color}">${result.rarity.nameKo}</div>
                ${result.isNew ? '<div class="gacha-new">NEW!</div>' : ''}
                <div class="gacha-artist">${result.artistName}</div>
                <div class="gacha-skill">${result.skillKo} (${result.skill})</div>
                <div class="gacha-variant">${result.variant}</div>
                <div class="gacha-score">+${result.scoreGain}</div>
                <div class="gacha-remaining">${this.gachaQueue.length > 0 ? `남은 카드: ${this.gachaQueue.length}` : ''}</div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Auto dismiss or click to dismiss
        const dismiss = () => {
            overlay.classList.add('gacha-fade-out');
            setTimeout(() => {
                overlay.remove();
                this._showNextGacha();
            }, 300);
        };

        overlay.addEventListener('click', dismiss);
        this._gachaAnimTimeout = setTimeout(dismiss, 2500);
    }

    // ==============================
    // COLLECTION BOOK
    // ==============================

    getCollectionStats() {
        let total = 0;
        let unlocked = 0;

        for (const [artistId, skills] of Object.entries(ARTIST_SKILLS)) {
            for (const skill of skills) {
                for (const variant of skill.variants) {
                    total++;
                    const key = `${artistId}:${skill.name}`;
                    if (this.unlockedSkills.has(key) && this.unlockedSkills.get(key).has(variant)) {
                        unlocked++;
                    }
                }
            }
        }

        return { total, unlocked, percent: Math.round((unlocked / total) * 100) };
    }

    getArtistCollectionStats(artistId) {
        const skills = ARTIST_SKILLS[artistId];
        if (!skills) return { total: 0, unlocked: 0 };

        let total = 0;
        let unlocked = 0;
        for (const skill of skills) {
            for (const variant of skill.variants) {
                total++;
                const key = `${artistId}:${skill.name}`;
                if (this.unlockedSkills.has(key) && this.unlockedSkills.get(key).has(variant)) {
                    unlocked++;
                }
            }
        }
        return { total, unlocked, percent: Math.round((unlocked / total) * 100) };
    }

    showCollectionBook() {
        const existing = document.getElementById('collectionBook');
        if (existing) { existing.remove(); return; }

        const stats = this.getCollectionStats();
        const overlay = document.createElement('div');
        overlay.id = 'collectionBook';
        overlay.className = 'collection-book';

        let artistSections = '';
        for (const artist of (this.artists || [])) {
            const artistStats = this.getArtistCollectionStats(artist.id);
            const skills = ARTIST_SKILLS[artist.id] || [];
            const color = artist.styleHints?.colorPalette?.[0] || '#fff';

            let skillCards = '';
            for (const skill of skills) {
                let variantItems = '';
                for (const variant of skill.variants) {
                    const key = `${artist.id}:${skill.name}`;
                    const owned = this.unlockedSkills.has(key) && this.unlockedSkills.get(key).has(variant);
                    variantItems += `<span class="cb-variant ${owned ? 'owned' : 'locked'}">${owned ? variant : '???'}</span>`;
                }
                skillCards += `
                    <div class="cb-skill">
                        <div class="cb-skill-name">${skill.nameKo} (${skill.name})</div>
                        <div class="cb-variants">${variantItems}</div>
                    </div>
                `;
            }

            artistSections += `
                <div class="cb-artist">
                    <div class="cb-artist-header" style="border-left: 3px solid ${color}">
                        <span class="cb-artist-name">${artist.name}</span>
                        <span class="cb-artist-progress">${artistStats.unlocked}/${artistStats.total}</span>
                    </div>
                    <div class="cb-skills">${skillCards}</div>
                </div>
            `;
        }

        overlay.innerHTML = `
            <div class="cb-container">
                <div class="cb-header">
                    <h2>COLLECTION BOOK</h2>
                    <div class="cb-total">
                        <span>${stats.unlocked} / ${stats.total}</span>
                        <span class="cb-percent">${stats.percent}%</span>
                    </div>
                    <button class="cb-close" id="cbClose">&times;</button>
                </div>
                <div class="cb-body">${artistSections}</div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.getElementById('cbClose').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }

    // ==============================
    // ROOM & LOCATION
    // ==============================

    checkRoomDiscovery(roomId, roomName) {
        if (!this.discoveredRooms.has(roomId)) {
            this.discoveredRooms.add(roomId);
            this.addScore(50);
            this.showNotification(`새로운 공간 발견: ${roomName} +50`);
            this._updateDiscoveryUI();
            this._saveProgress();
            return true;
        }
        return false;
    }

    setLocation(name) {
        if (this.locationEl) this.locationEl.textContent = name;
    }

    addScore(points) {
        this.score += points;
        if (this.scoreEl) this.scoreEl.textContent = this.score;
    }

    // ==============================
    // NOTIFICATIONS / UI
    // ==============================

    showNotification(text) {
        if (!this.notificationEl || !this.notificationText) return;
        this.notificationText.textContent = text;
        this.notificationEl.classList.remove('hidden');
        // Reset animation
        this.notificationEl.style.animation = 'none';
        this.notificationEl.offsetHeight; // reflow
        this.notificationEl.style.animation = '';

        clearTimeout(this._notifTimeout);
        this._notifTimeout = setTimeout(() => {
            this.notificationEl.classList.add('hidden');
        }, 3000);
    }

    showInteractionPrompt(text) {
        if (this.interactionPrompt) {
            this.interactionPrompt.classList.remove('hidden');
            if (this.interactionText) this.interactionText.textContent = text;
        }
    }

    hideInteractionPrompt() {
        if (this.interactionPrompt) {
            this.interactionPrompt.classList.add('hidden');
        }
    }

    _updateDiscoveryUI() {
        const count = this.discoveredRooms.size;
        const pct = (count / this.totalArtists) * 100;
        if (this.discoveryFill) this.discoveryFill.style.width = pct + '%';
        if (this.discoveryCount) this.discoveryCount.textContent = `${count} / ${this.totalArtists}`;
    }

    _updateCollectionCount() {
        const el = document.getElementById('collectionCount');
        if (el) {
            const stats = this.getCollectionStats();
            el.textContent = `${stats.unlocked}/${stats.total}`;
        }
    }

    _renderOrbCollection() {
        if (!this.orbCollectionEl || !this.artists) return;
        this.orbCollectionEl.innerHTML = this.artists.map(a => {
            const color = a.styleHints?.colorPalette?.[0] || '#fff';
            return `<div class="orb-item" id="orb-${a.id}" style="background: ${color}; --orb-color: ${color}"></div>`;
        }).join('');
    }

    _updateOrbUI(artistId) {
        const el = document.getElementById(`orb-${artistId}`);
        if (el) el.classList.add('collected');
    }

    // ==============================
    // PERSISTENCE
    // ==============================

    _saveProgress() {
        try {
            const data = {
                score: this.score,
                discoveredRooms: [...this.discoveredRooms],
                collectedOrbs: [...this.collectedOrbs],
                unlockedSkills: {},
                totalCards: this.totalCards,
            };
            for (const [key, variants] of this.unlockedSkills) {
                data.unlockedSkills[key] = [...variants];
            }
            localStorage.setItem('gallery3d_progress', JSON.stringify(data));
        } catch (e) {
            // localStorage might be unavailable
        }
    }

    _loadProgress() {
        try {
            const raw = localStorage.getItem('gallery3d_progress');
            if (!raw) return;
            const data = JSON.parse(raw);

            this.score = data.score || 0;
            this.discoveredRooms = new Set(data.discoveredRooms || []);
            this.collectedOrbs = new Set(data.collectedOrbs || []);
            this.totalCards = data.totalCards || 0;

            if (data.unlockedSkills) {
                for (const [key, variants] of Object.entries(data.unlockedSkills)) {
                    this.unlockedSkills.set(key, new Set(variants));
                }
            }
        } catch (e) {
            // Corrupted data, start fresh
        }
    }
}
