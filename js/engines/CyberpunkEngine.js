import { ArtEngine } from './ArtEngine.js';

/**
 * Cyberpunk Engine (NEON-V)
 * 디지털 비, 글리치, 네온 + 7 Modes
 */
export class CyberpunkEngine extends ArtEngine {
    constructor(canvas, ctx, colors, transparentMode = false, data = null) {
        super(canvas, ctx, colors);
        this.transparentMode = transparentMode;
        this.data = data;
        this.mode = 'rain'; // Default mode

        // Resources
        this.drops = [];
        this.scanY = 0;

        // HUD State
        this.hudState = 0; // 0: SEARCH, 1: LOCKING, 2: LOCKED
        this.hudX = canvas.width / 2;
        this.hudY = canvas.height / 2;
        this.targetX = canvas.width / 2;
        this.targetY = canvas.height / 2;
        this.hudScale = 1.5;
        this.lockTimer = 0;

        this.streamLines = [];
        this.circuitNodes = [];

        // Init Default
        if (this.data) {
            this.mode = this.determineModeFromData();
            console.log(`[Auto Select] Mode based on data: ${this.mode}`);
        } else {
            this.mode = 'rain'; // Fallback
        }

        // Initial setup based on selected mode
        this.setMode(this.mode);
    }

    determineModeFromData() {
        const text = ((this.data.prompt || "") + " " + (this.data.description || "")).toLowerCase();

        // Keyword Mapping
        const keywords = {
            'rain': ['rain', 'storm', 'drop', 'wet', 'water', 'binary', 'fall', 'matrix'],
            'scanner': ['scan', 'glitch', 'search', 'bar', 'line', 'sweep', 'error', 'detect'],
            'hud': ['target', 'aim', 'scope', 'sniper', 'view', 'hud', 'lock', 'weapon', 'tactical'],
            'data': ['data', 'code', 'stream', 'flow', 'numbers', 'text', 'scroll', 'info'],
            'circuit': ['circuit', 'node', 'connect', 'wire', 'chip', 'board', 'logic', 'path'],
            'sign': ['wave', 'signal', 'pulse', 'sine', 'sound', 'frequency', 'noise', 'analog'],
            'net': ['grid', 'net', 'space', '3d', 'terrain', 'cyber', 'world', 'plane', 'dimension']
        };

        // Score counting
        let scores = {};
        for (let mode in keywords) scores[mode] = 0;

        for (let mode in keywords) {
            keywords[mode].forEach(word => {
                if (text.includes(word)) scores[mode]++;
            });
        }

        // Find max score
        let bestMode = 'rain';
        let maxScore = 0;

        for (let mode in scores) {
            if (scores[mode] > maxScore) {
                maxScore = scores[mode];
                bestMode = mode;
            }
        }

        // If no keywords found, pick semi-randomly based on text length hash
        if (maxScore === 0) {
            const hash = text.length % 7;
            const modes = ['rain', 'scanner', 'hud', 'data', 'circuit', 'sign', 'net'];
            bestMode = modes[hash];
        }

        return bestMode;
    }

    getCurrentStyleName() {
        if (this.mode === 'rain') return ['Modern', 'Binary', 'Storm'][this.rainStyle] || 'Matrix';
        if (this.mode === 'scanner') return ['Horizontal', 'Vertical', 'Quantum'][this.scanStyle] || 'Standard';
        if (this.mode === 'hud') return 'Sniper';
        if (this.mode === 'data') return ['Vertical', 'Horizontal', 'Scattered'][this.dataStyle] || 'Stream';
        if (this.mode === 'circuit') return ['Logic', 'Overload', 'Organic'][this.circuitStyle] || 'Neural';
        if (this.mode === 'sign') return ['Sine', 'Noise', 'Pulse'][this.signStyle] || 'Wave';
        if (this.mode === 'net') return ['Grid', 'Terrain', 'Warp'][this.netStyle] || 'Cyber';
        return 'Default';
    }

    setMode(mode) {
        this.mode = mode;
        console.log(`Switched to mode: ${mode}`);
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (mode === 'rain') this.initRain();
        if (mode === 'scanner') this.initScanner();
        if (mode === 'hud') {
            this.initHUD();
            this.hudState = 0;
            this.hudScale = 1.5;
            this.lockTimer = 0;
            this.pickNewTarget();
        }
        if (mode === 'data') this.initDataStream();
        if (mode === 'circuit') this.initCircuit();
        if (mode === 'sign') this.initSign();
        if (mode === 'net') this.initNet();
    }

    pickNewTarget() {
        const margin = 100;
        this.targetX = margin + Math.random() * (this.width - margin * 2);
        this.targetY = margin + Math.random() * (this.height - margin * 2);
        this.hudState = 0;
    }

    resize(width, height) {
        super.resize(width, height);
        this.setMode(this.mode);
    }

    draw() {
        if (this.transparentMode) {
            let bgOverlayColor = 'rgba(0, 0, 0, 0.2)';

            if (['rain', 'scanner', 'data'].includes(this.mode)) {
                if (Math.random() > 0.99) {
                    const flashColor = this.mode === 'scanner' ? this.colors[1] : this.colors[0];
                    bgOverlayColor = this.hexToRgba(flashColor, 0.15);
                } else {
                    bgOverlayColor = 'rgba(0, 0, 0, 0.05)';
                }
            }
            else if (this.mode === 'hud') {
                let pf = this.hudState === 2 ? 0.05 : (this.hudState === 1 ? 0.1 : 0.2);
                const beat = Math.sin(this.frame * pf);

                if (beat > 0.9) {
                    bgOverlayColor = this.hexToRgba(this.colors[0], 0.05);
                } else {
                    bgOverlayColor = 'rgba(0, 0, 0, 0.25)';
                }
            }
            else if (['circuit', 'sign'].includes(this.mode)) {
                bgOverlayColor = `rgba(0, 0, 0, 0.05)`;
            }
            else if (this.mode === 'net') {
                bgOverlayColor = 'rgba(0, 5, 20, 0.3)';
            }

            this.ctx.fillStyle = bgOverlayColor;
            this.ctx.fillRect(0, 0, this.width, this.height);

        } else {
            this.ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
            if (this.mode === 'circuit') this.ctx.fillStyle = 'rgba(10, 10, 15, 0.02)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        switch (this.mode) {
            case 'rain': this.drawRain(); break;
            case 'scanner': this.drawScanner(); break;
            case 'hud': this.drawHUD(); break;
            case 'data': this.drawData(); break;
            case 'circuit': this.drawCircuit(); break;
            case 'sign': this.drawSign(); break;
            case 'net': this.drawNet(); break;
            default: this.drawRain();
        }
    }

    // --- 1. Rain Mode ---
    initRain() {
        const text = (this.data && this.data.prompt) ? this.data.prompt : "";
        const seedValue = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        this.rainStyle = seedValue % 3;
        console.log(`[RAIN Mode] Style: ${['Modern', 'Binary', 'Storm'][this.rainStyle]}`);

        const columns = Math.floor(this.width / 20);
        this.drops = Array(columns).fill(1).map(() => Math.random() * -100);
    }

    drawRain() {
        this.ctx.font = '15px monospace';
        let chars = '가나다라마바사아자차카타파하디지털코드데이터미래네온시티전력신호접속흐름빛';
        if (this.rainStyle === 1) chars = '01';
        if (this.rainStyle === 2) chars = '⚡↯▁▂▃░▒▓';

        for (let i = 0; i < this.drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * 20;
            const y = this.drops[i] * 20;

            if (Math.random() > 0.98) {
                this.ctx.fillStyle = this.colors[1] || '#fff';
            } else {
                this.ctx.fillStyle = this.hexToRgba(this.colors[0], 0.8);
            }

            let drawX = x;
            if (this.rainStyle === 2) {
                drawX = x + (y * 0.2);
            }

            this.ctx.fillText(char, drawX, y);

            if (y > this.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }

            let speed = 1;
            if (this.rainStyle === 1) speed = 0.2;
            if (this.rainStyle === 2) speed = 2.5;

            this.drops[i] += speed;
        }
    }

    // --- 2. Scanner Mode ---
    initScanner() {
        const text = (this.data && this.data.prompt) ? this.data.prompt : "";
        const seedValue = text.split('').reduce((acc, char, idx) => acc + (char.charCodeAt(0) * (idx + 13)), 0);
        this.scanStyle = seedValue % 3;
        console.log(`[SCAN Mode] Style: ${['Horizontal', 'Vertical', 'Quantum'][this.scanStyle]}`);

        this.scanY = 0;
        this.scanX = 0;
    }

    drawScanner() {
        if (this.scanStyle === 0) {
            this.scanY += 2;
            if (this.scanY > this.height) this.scanY = -100;

            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = this.colors[0];
            this.ctx.fillStyle = this.hexToRgba(this.colors[0], 0.8);
            this.ctx.fillRect(0, this.scanY, this.width, 4);
            this.ctx.fillStyle = this.hexToRgba(this.colors[0], 0.1);
            this.ctx.fillRect(0, this.scanY - 20, this.width, 20);
            this.ctx.shadowBlur = 0;
        }
        else if (this.scanStyle === 1) {
            this.scanX += 4;
            if (this.scanX > this.width) this.scanX = -100;

            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = this.colors[1];
            this.ctx.fillStyle = this.hexToRgba(this.colors[1], 0.8);
            this.ctx.fillRect(this.scanX, 0, 4, this.height);
            this.ctx.shadowBlur = 0;
        }
        else {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
            if (Math.random() > 0.5) this.ctx.fillRect(Math.random() * this.width, Math.random() * this.height, 50, 2);

            if (Math.random() > 0.9) {
                const y = Math.random() * this.height;
                const h = Math.random() * 50;
                this.ctx.fillStyle = this.hexToRgba(this.colors[0], 0.1);
                this.ctx.fillRect(0, y, this.width, h);
            }

            if (Math.random() > 0.98) {
                this.ctx.fillStyle = this.hexToRgba(this.colors[1], 0.15);
                this.ctx.fillRect(0, 0, this.width, this.height);
            }
        }

        let glitchChance = this.scanStyle === 2 ? 0.7 : 0.85;

        if (Math.random() > glitchChance) {
            const w = Math.random() * 200 + 50;
            const h = Math.random() * 20 + 2;
            const x = Math.random() * this.width;

            let y;
            if (this.scanStyle === 0) y = this.scanY + (Math.random() - 0.5) * 100;
            else if (this.scanStyle === 1) y = Math.random() * this.height;
            else y = Math.random() * this.height;

            this.ctx.fillStyle = this.hexToRgba(this.scanStyle === 1 ? this.colors[0] : this.colors[1], 0.6);
            this.ctx.fillRect(x, y, w, h);
        }
    }

    // --- 3. HUD Mode ---
    initHUD() {
        const text = (this.data && this.data.prompt) ? this.data.prompt : "";
        const seedValue = text.split('').reduce((acc, char, idx) => acc + (char.charCodeAt(0) * (idx + 17)), 0);

        this.hudConfig = {
            shape: seedValue % 3,
            colorShift: seedValue % 2 === 0,
            spinSpeed: ((seedValue % 5) + 1) * 0.01
        };
        console.log(`[HUD Mode] Sniper Var: ${this.hudConfig.shape}`);
    }

    drawHUD() {
        this.drawHUDSniper();
    }

    drawHUDSniper() {
        const ease = 0.05;

        if (this.hudState === 0) {
            const dx = this.targetX - this.hudX;
            const dy = this.targetY - this.hudY;
            this.hudX += dx * ease;
            this.hudY += dy * ease;
            this.hudScale = 1.5 + Math.sin(this.frame * 0.1) * 0.1;
            if (Math.abs(dx) < 5 && Math.abs(dy) < 5) this.hudState = 1;
        }
        else if (this.hudState === 1) {
            this.hudScale += (1.0 - this.hudScale) * 0.1;
            if (Math.abs(1.0 - this.hudScale) < 0.01) {
                this.hudScale = 1.0;
                this.hudState = 2;
                this.lockTimer = 60;
            }
        }
        else if (this.hudState === 2) {
            this.lockTimer--;
            if (this.lockTimer <= 0) this.pickNewTarget();
        }

        const cx = this.hudX;
        const cy = this.hudY;
        const scale = this.hudScale;

        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.scale(scale, scale);

        let mainColor = '#ff3333';

        if (this.hudState === 2) {
            mainColor = '#00ffff';
        } else if (this.hudState === 1) {
            mainColor = '#ff3333';
        }

        this.ctx.strokeStyle = mainColor;
        this.ctx.fillStyle = mainColor;
        this.ctx.lineWidth = 1.5;

        const size = 100;

        if (this.hudConfig.shape === 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(-size, -size + 30); this.ctx.lineTo(-size, -size); this.ctx.lineTo(-size + 30, -size);
            this.ctx.moveTo(size - 30, -size); this.ctx.lineTo(size, -size); this.ctx.lineTo(size, -size + 30);
            this.ctx.moveTo(size, size - 30); this.ctx.lineTo(size, size); this.ctx.lineTo(size - 30, size);
            this.ctx.moveTo(-size + 30, size); this.ctx.lineTo(-size, size); this.ctx.lineTo(-size, size - 30);
            this.ctx.stroke();
        }
        else if (this.hudConfig.shape === 1) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, size, 0, Math.PI * 2);
            this.ctx.moveTo(0, -size - 10); this.ctx.lineTo(0, -size + 10);
            this.ctx.moveTo(0, size + 10); this.ctx.lineTo(0, size - 10);
            this.ctx.moveTo(-size - 10, 0); this.ctx.lineTo(-size + 10, 0);
            this.ctx.moveTo(size + 10, 0); this.ctx.lineTo(size - 10, 0);
            this.ctx.stroke();
        }
        else {
            this.ctx.strokeRect(-size, -size, size * 2, size * 2);
            this.ctx.fillRect(-size - 2, -size - 2, 4, 4);
            this.ctx.fillRect(size - 2, -size - 2, 4, 4);
            this.ctx.fillRect(size - 2, size - 2, 4, 4);
            this.ctx.fillRect(-size - 2, size - 2, 4, 4);
        }

        if (this.hudState !== 2) this.ctx.rotate(this.frame * this.hudConfig.spinSpeed);

        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        const innerSize = this.hudConfig.shape === 1 ? 40 : 60;
        this.ctx.arc(0, 0, innerSize, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        if (this.hudState !== 2) this.ctx.rotate(-this.frame * this.hudConfig.spinSpeed);

        this.ctx.fillStyle = this.hexToRgba(mainColor, 0.8);
        this.ctx.fillRect(-2, -10, 4, 20);
        this.ctx.fillRect(-10, -2, 20, 4);

        this.ctx.font = '12px "JetBrains Mono"';
        this.ctx.textAlign = 'center';
        let statusText = this.hudState === 2 ? "TARGET LOCKED" : "SEARCHING...";
        this.ctx.fillText(statusText, 0, -size - 15);
        this.ctx.fillText(`COORD: ${cx.toFixed(0)}, ${cy.toFixed(0)}`, 0, size + 25);

        let pulseFreq = 0.2;
        let pulseAmp = 8;
        if (this.hudState === 1) { pulseFreq = 0.1; pulseAmp = 5; }
        else if (this.hudState === 2) { pulseFreq = 0.05; pulseAmp = 3; }

        const beat = Math.sin(this.frame * pulseFreq);
        if (beat > 0.8) {
            this.ctx.strokeStyle = this.hexToRgba(mainColor, 0.5);
            this.ctx.lineWidth = 3;
            const baseSize = (this.hudConfig && this.hudConfig.shape === 1) ? 40 : 60;
            const pulseSize = baseSize + (beat - 0.8) * 30;

            this.ctx.beginPath();
            this.ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        this.ctx.restore();

        const graphX = this.width - 150;
        const graphY = this.height / 2;
        const graphW = 200;
        const graphH = 100;

        this.ctx.save();
        this.ctx.translate(graphX, graphY);

        this.ctx.beginPath();
        this.ctx.strokeStyle = this.hexToRgba(mainColor, 0.9);
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(-graphW / 2, 0);

        for (let i = 0; i < graphW; i++) {
            const t = (this.frame + i) * pulseFreq;
            let y = 0;
            const cycle = t % (Math.PI * 2);
            if (cycle < 0.5) y = Math.sin(cycle * 20) * pulseAmp * 4;
            else y = Math.sin(cycle) * pulseAmp * 1.5;

            this.ctx.lineTo(-graphW / 2 + i, - y);
        }
        this.ctx.stroke();

        let bpm = this.hudState === 0 ? "110 BPM" : (this.hudState === 1 ? "85 BPM" : "60 BPM");
        this.ctx.fillStyle = mainColor;
        this.ctx.font = 'bold 16px "JetBrains Mono"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(bpm, 0, 35);

        this.ctx.strokeStyle = this.hexToRgba(mainColor, 0.5);
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-graphW / 2 - 10, -50, graphW + 20, 100);

        this.ctx.restore();

        if (this.hudState === 0) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.hexToRgba(mainColor, 0.2);
            this.ctx.moveTo(this.width / 2, this.height / 2);
            this.ctx.lineTo(cx, cy);
            this.ctx.stroke();
        }
    }

    // --- 4. Data Stream Mode ---
    initDataStream() {
        const text = (this.data && this.data.prompt) ? this.data.prompt : "NO DATA SYSTEM OFFLINE";
        const seedValue = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        this.dataStyle = seedValue % 3;

        console.log(`[DATA Mode] Style: ${['Vertical', 'Horizontal', 'Scattered'][this.dataStyle]}`);

        this.streamLines = [];

        if (this.dataStyle === 0) {
            this.streamLines = Array.from({ length: 15 }, () => ({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                speed: Math.random() * 2 + 2,
                text: text.substring(Math.floor(Math.random() * (text.length - 20))),
                color: Math.random() > 0.3 ? this.colors[1] : '#ffffff',
                size: Math.floor(Math.random() * 10 + 16)
            }));
        } else if (this.dataStyle === 1) {
            this.streamLines = Array.from({ length: 8 }, (_, i) => ({
                x: Math.random() * this.width,
                y: (this.height / 8) * i + 50,
                speed: Math.random() * 10 + 5,
                text: text + " // " + text,
                color: this.colors[0],
                size: Math.floor(Math.random() * 20 + 20)
            }));
        } else {
            this.streamLines = Array.from({ length: 30 }, () => ({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                text: text.substring(Math.floor(Math.random() * text.length)).substring(0, 5),
                color: Math.random() > 0.5 ? this.colors[0] : '#ffffff',
                size: Math.floor(Math.random() * 10 + 12),
                blinkSpeed: Math.random() * 0.1
            }));
        }
    }

    drawData() {
        if (this.transparentMode) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        this.streamLines.forEach(line => {
            this.ctx.font = `bold ${line.size}px "JetBrains Mono", monospace`;
            this.ctx.fillStyle = this.hexToRgba(line.color, 1.0);

            if (this.dataStyle === 0) {
                line.y += line.speed;
                if (line.y > this.height) line.y = -50;
                this.ctx.fillText(line.text.substring(0, 20), line.x, line.y);
            }
            else if (this.dataStyle === 1) {
                line.x -= line.speed;
                if (line.x < -1000) line.x = this.width;
                this.ctx.fillText(line.text, line.x, line.y);
            }
            else {
                if (Math.sin(this.frame * line.blinkSpeed) > 0) {
                    this.ctx.fillText(line.text, line.x, line.y);
                }
                if (Math.random() > 0.95) line.x = Math.random() * this.width;
            }
        });
    }

    // --- 5. Circuit Mode ---
    initCircuit() {
        const text = (this.data && this.data.prompt) ? this.data.prompt : "";
        const seedValue = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        this.circuitStyle = seedValue % 3;
        console.log(`[CIRC Mode] Style: ${['Logic', 'Overload', 'Organic'][this.circuitStyle]}`);

        let gridSize = 60;
        if (this.circuitStyle === 2) gridSize = 40;

        const count = seedValue % 2 === 0 ? 20 : 40;

        this.circuitNodes = Array.from({ length: count }, () => ({
            x: Math.floor(Math.random() * (this.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (this.height / gridSize)) * gridSize,
            active: Math.random() > 0.5,
            head: false
        }));

        if (this.circuitStyle === 1) this.circuitColor = '#ff5500';
        else if (this.circuitStyle === 2) this.circuitColor = '#00ff55';
        else this.circuitColor = this.colors[1];

        for (let i = 0; i < 5; i++) this.circuitNodes[i].head = true;
    }

    drawCircuit() {
        this.ctx.lineWidth = this.circuitStyle === 2 ? 3 : 6;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.circuitColor;

        let drawDelay = 4;
        if (this.circuitStyle === 1) drawDelay = 2;
        if (this.circuitStyle === 2) drawDelay = 6;

        if (this.frame % drawDelay !== 0) return;

        const headIdx = Math.floor(Math.random() * this.circuitNodes.length);
        const node = this.circuitNodes[headIdx];

        if (!node.active) return;

        const dir = Math.floor(Math.random() * 4);
        let len = this.circuitStyle === 2 ? 40 : 60;

        const prevX = node.x;
        const prevY = node.y;

        if (this.circuitStyle === 1) {
            if (Math.random() > 0.5) {
                node.x += Math.random() > 0.5 ? len : -len;
                node.y += Math.random() > 0.5 ? len : -len;
            } else {
                if (dir === 0) node.x += len;
                else if (dir === 1) node.y += len;
                else if (dir === 2) node.x -= len;
                else node.y -= len;
            }
        } else {
            if (dir === 0) node.x += len;
            else if (dir === 1) node.y += len;
            else if (dir === 2) node.x -= len;
            else node.y -= len;
        }

        if (node.x > this.width) node.x = 0; if (node.x < 0) node.x = this.width;
        if (node.y > this.height) node.y = 0; if (node.y < 0) node.y = this.height;

        this.ctx.strokeStyle = this.hexToRgba(this.circuitColor, 0.9);
        this.ctx.beginPath();
        this.ctx.moveTo(prevX, prevY);
        this.ctx.lineTo(node.x, node.y);
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        if (this.circuitStyle === 0) this.ctx.fillRect(node.x - 6, node.y - 6, 12, 12);
        else {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.shadowBlur = 0;
    }

    // --- 6. SIGN Mode ---
    initSign() {
        const text = (this.data && this.data.prompt) ? this.data.prompt : "";
        const seedValue = text.split('').reduce((acc, char, idx) => acc + (char.charCodeAt(0) * (idx + 7)), 0);
        this.signStyle = seedValue % 3;
        console.log(`[SIGN Mode] Style: ${['Sine', 'Noise', 'Pulse'][this.signStyle]}`);

        this.signPoints = [];
        const segments = 100;
        for (let i = 0; i <= segments; i++) {
            this.signPoints.push({
                x: (this.width / segments) * i,
                y: this.height / 2
            });
        }
    }

    drawSign() {
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = this.hexToRgba(this.colors[0], 0.8);
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.colors[0];

        this.ctx.beginPath();

        const speed = this.frame * 0.1;
        const amplitude = this.height * 0.2;

        if (this.signStyle === 0) {
            for (let i = 0; i < this.signPoints.length; i++) {
                const p = this.signPoints[i];
                const y = this.height / 2 +
                    Math.sin(i * 0.1 + speed) * amplitude +
                    Math.sin(i * 0.05 - speed * 0.5) * (amplitude * 0.5);

                if (i === 0) this.ctx.moveTo(p.x, y);
                else this.ctx.lineTo(p.x, y);
            }
        }
        else if (this.signStyle === 1) {
            this.ctx.lineWidth = 2;
            for (let i = 0; i < this.signPoints.length; i++) {
                const p = this.signPoints[i];
                let noise = (Math.random() - 0.5) * amplitude * 1.5;
                if (Math.sin(i * 0.2 + speed) > 0.5) noise *= 2;
                else noise *= 0.1;

                const y = this.height / 2 + noise;
                if (i === 0) this.ctx.moveTo(p.x, y);
                else this.ctx.lineTo(p.x, y);
            }
        }
        else {
            this.ctx.lineWidth = 4;
            for (let i = 0; i < this.signPoints.length; i++) {
                const p = this.signPoints[i];
                const t = i + speed * 10;
                let yVal = Math.sin(t * 0.2) > 0 ? 1 : -1;
                if (Math.sin(t * 0.05) > 0.8) yVal = 0;

                const y = this.height / 2 + yVal * amplitude * 0.8;

                if (i === 0) this.ctx.moveTo(p.x, y);
                else {
                    this.ctx.lineTo(p.x, this.signPoints[i - 1].y);
                    this.ctx.lineTo(p.x, y);
                }
                this.signPoints[i].y = y;
            }
        }

        this.ctx.stroke();

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height / 2);
        this.ctx.lineTo(this.width, this.height / 2);
        this.ctx.stroke();
    }

    // --- 7. NET Mode ---
    initNet() {
        const text = (this.data && this.data.prompt) ? this.data.prompt : "";
        const seedValue = text.split('').reduce((acc, char, idx) => acc + (char.charCodeAt(0) * (idx + 11)), 0);
        this.netStyle = seedValue % 3;
        console.log(`[NET Mode] Style: ${['Grid', 'Terrain', 'Warp'][this.netStyle]}`);

        this.netOffset = 0;
    }

    drawNet() {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const horizon = cy;

        this.netOffset += 2;
        if (this.netOffset > 40) this.netOffset = 0;

        this.ctx.strokeStyle = this.hexToRgba(this.colors[1], 0.6);
        this.ctx.lineWidth = 1.5;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.colors[1];

        if (this.netStyle === 0) {
            for (let i = -1000; i <= 1000; i += 100) {
                this.ctx.beginPath();
                this.ctx.moveTo(cx + i, horizon);
                const xBottom = cx + i * 4;
                this.ctx.lineTo(xBottom, this.height);
                this.ctx.stroke();
            }

            for (let y = 0; y < this.height / 2; y += 20) {
                const depthY = horizon + Math.pow(y / 20, 2.5) + (this.netOffset * (y / 300));
                if (depthY > this.height) continue;

                this.ctx.beginPath();
                this.ctx.moveTo(0, depthY);
                this.ctx.lineTo(this.width, depthY);
                this.ctx.stroke();
            }

            this.ctx.fillStyle = this.colors[0];
            this.ctx.beginPath();
            this.ctx.arc(cx, horizon - 100, 60, 0, Math.PI * 2);
            this.ctx.fill();
        }

        else if (this.netStyle === 1) {
            const rows = 35;
            const cols = 40;
            const gridW = this.width * 2.5;
            const horizonY = this.height * 0.35;
            const speedZ = this.frame * 0.05;

            const vertices = [];
            for (let r = 0; r <= rows; r++) {
                const rowArr = [];
                const t = r / rows;
                const z = 0.01 + Math.pow(t, 1.8) * 0.99;
                const yBase = horizonY + (this.height - horizonY) * z;
                const scaleAtRow = 0.1 + z * 1.5;

                for (let c = 0; c <= cols; c++) {
                    const u = c / cols;
                    const xBase = this.width / 2 + (u - 0.5) * gridW * scaleAtRow;

                    const noiseX = c * 0.4;
                    const noiseY = r * 0.4 - speedZ * 2;
                    const amp = 80 * z;
                    const h = (Math.sin(noiseX) + Math.sin(noiseY) + Math.sin(noiseX * 0.5 + noiseY * 0.5)) * amp;

                    rowArr.push({ x: xBase, y: yBase - h });
                }
                vertices.push(rowArr);
            }

            this.ctx.lineWidth = 1.5;

            for (let r = 0; r <= rows; r++) {
                this.ctx.beginPath();
                let alpha = (r / rows);
                alpha = Math.pow(alpha, 0.5);

                this.ctx.strokeStyle = this.hexToRgba(this.colors[1], alpha);

                for (let c = 0; c <= cols; c++) {
                    const v = vertices[r][c];
                    if (c === 0) this.ctx.moveTo(v.x, v.y);
                    else this.ctx.lineTo(v.x, v.y);
                }
                this.ctx.stroke();
            }

            for (let c = 0; c <= cols; c += 2) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = this.hexToRgba(this.colors[1], 0.3);

                for (let r = 0; r <= rows; r++) {
                    const v = vertices[r][c];
                    if (r === 0) this.ctx.moveTo(v.x, v.y);
                    else this.ctx.lineTo(v.x, v.y);
                }
                this.ctx.stroke();
            }
        }

        else {
            const rings = 10;
            const maxRadius = Math.max(this.width, this.height);

            for (let i = 0; i < rings; i++) {
                let r = ((this.frame * 2 + i * 100) % 1000);
                const radius = Math.pow(r / 1000, 3) * maxRadius;

                this.ctx.beginPath();
                this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            const spokes = 12;
            for (let i = 0; i < spokes; i++) {
                const ang = (i / spokes) * Math.PI * 2 + this.frame * 0.01;
                this.ctx.beginPath();
                this.ctx.moveTo(cx, cy);
                this.ctx.lineTo(cx + Math.cos(ang) * maxRadius, cy + Math.sin(ang) * maxRadius);
                this.ctx.stroke();
            }
        }

        this.ctx.shadowBlur = 0;
    }
}
