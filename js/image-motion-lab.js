const DATES = ['2026-04-01', '2026-04-05'];
const ARTISTS = ['aura-7', 'flora-9', 'aqua-5', 'prism-2', 'neon-v', 'kuro-x', 'echo-0', 'terra-1', 'void-3'];
const ARTWORKS = DATES.flatMap(date => ARTISTS.map(artist => ({
    id: date + '/' + artist,
    date,
    artist,
    label: date + ' · ' + artist.toUpperCase()
})));

const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
};

const elements = {
    canvas: document.getElementById('motionCanvas'),
    select: document.getElementById('artworkSelect'),
    status: document.getElementById('statusText'),
    fps: document.getElementById('fpsText'),
    title: document.getElementById('artworkTitle'),
    description: document.getElementById('artworkDescription'),
    stats: document.getElementById('statsText'),
    strength: document.getElementById('strengthSlider'),
    speed: document.getElementById('speedSlider'),
    mask: document.getElementById('maskSlider'),
    split: document.getElementById('splitToggle'),
    modeButtons: [...document.querySelectorAll('[data-mode]')]
};

function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Could not load ' + src));
        image.src = src;
    });
}

async function loadJson(src) {
    const response = await fetch(src);
    if (!response.ok) throw new Error('Could not load ' + src);
    return response.json();
}

function localized(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.ko || value.en || '';
}

function sampleBilinear(data, width, height, x, y, out, offset) {
    x = clamp(x, 0, width - 1.001);
    y = clamp(y, 0, height - 1.001);
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(width - 1, x0 + 1);
    const y1 = Math.min(height - 1, y0 + 1);
    const tx = x - x0;
    const ty = y - y0;
    const i00 = (y0 * width + x0) * 4;
    const i10 = (y0 * width + x1) * 4;
    const i01 = (y1 * width + x0) * 4;
    const i11 = (y1 * width + x1) * 4;

    for (let c = 0; c < 3; c++) {
        const a = data[i00 + c] * (1 - tx) + data[i10 + c] * tx;
        const b = data[i01 + c] * (1 - tx) + data[i11 + c] * tx;
        out[offset + c] = a * (1 - ty) + b * ty;
    }
    out[offset + 3] = 255;
}

class ImageMotionLab {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mode = 'flow';
        this.frame = 0;
        this.raf = null;
        this.lastTime = performance.now();
        this.fpsTime = performance.now();
        this.fpsFrames = 0;
        this.pixelRatio = 1;
        this.viewWidth = 1;
        this.viewHeight = 1;
        this.image = null;
        this.metadata = null;
        this.processWidth = 720;
        this.processHeight = 405;
        this.sourceCanvas = createCanvas(this.processWidth, this.processHeight);
        this.sourceCtx = this.sourceCanvas.getContext('2d', { willReadFrequently: true });
        this.workCanvas = createCanvas(this.processWidth, this.processHeight);
        this.workCtx = this.workCanvas.getContext('2d', { willReadFrequently: true });
        this.sourceData = null;
        this.outputData = null;
        this.mask = null;
        this.flowX = null;
        this.flowY = null;
        this.maskStats = null;
        this.resize = this.resize.bind(this);
        this.render = this.render.bind(this);
        window.addEventListener('resize', this.resize);
        this.resize();
    }

    setMode(mode) {
        this.mode = mode;
    }

    async load(item) {
        elements.status.textContent = 'loading';
        const imageSrc = 'data/artworks/' + item.date + '/' + item.artist + '.png';
        const jsonSrc = 'data/artworks/' + item.date + '/' + item.artist + '.json';
        const [image, metadata] = await Promise.all([
            loadImage(imageSrc),
            loadJson(jsonSrc).catch(() => null)
        ]);
        this.image = image;
        this.metadata = metadata;
        elements.title.textContent = localized(metadata?.title) || item.label;
        elements.description.textContent = localized(metadata?.description) || '';
        this.prepareSource();
        elements.status.textContent = 'running';
        this.start();
    }

    prepareSource() {
        const iw = this.image.naturalWidth || this.image.width;
        const ih = this.image.naturalHeight || this.image.height;
        const targetWidth = 720;
        const targetHeight = Math.round(targetWidth * ih / iw);
        this.processWidth = targetWidth;
        this.processHeight = targetHeight;
        this.sourceCanvas.width = targetWidth;
        this.sourceCanvas.height = targetHeight;
        this.workCanvas.width = targetWidth;
        this.workCanvas.height = targetHeight;
        this.sourceCtx.clearRect(0, 0, targetWidth, targetHeight);
        this.sourceCtx.drawImage(this.image, 0, 0, targetWidth, targetHeight);
        this.sourceData = this.sourceCtx.getImageData(0, 0, targetWidth, targetHeight);
        this.outputData = this.workCtx.createImageData(targetWidth, targetHeight);
        this.buildMaskAndFlow();
        this.updateStats();
    }

    buildMaskAndFlow() {
        const width = this.processWidth;
        const height = this.processHeight;
        const src = this.sourceData.data;
        const gray = new Float32Array(width * height);
        const sat = new Float32Array(width * height);
        const mask = new Float32Array(width * height);
        const flowX = new Float32Array(width * height);
        const flowY = new Float32Array(width * height);
        let sumMask = 0;
        let maxMask = 0;

        for (let i = 0; i < width * height; i++) {
            const p = i * 4;
            const r = src[p];
            const g = src[p + 1];
            const b = src[p + 2];
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            gray[i] = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
            sat[i] = max === 0 ? 0 : (max - min) / max;
        }

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = y * width + x;
                const gx = gray[i + 1] - gray[i - 1];
                const gy = gray[i + width] - gray[i - width];
                const grad = Math.sqrt(gx * gx + gy * gy);
                const bright = smoothstep(0.42, 0.88, gray[i]);
                const color = smoothstep(0.18, 0.72, sat[i]);
                const texture = smoothstep(0.03, 0.16, grad);
                const edgeProtect = 1 - smoothstep(0.10, 0.28, grad);
                let value = (bright * 0.42 + color * 0.5 + texture * 0.24) * (0.34 + edgeProtect * 0.66);
                mask[i] = clamp(value, 0, 1);

                let tx = -gy;
                let ty = gx;
                const len = Math.sqrt(tx * tx + ty * ty);
                if (len > 0.00001) {
                    tx /= len;
                    ty /= len;
                } else {
                    tx = Math.sin(y * 0.037);
                    ty = Math.cos(x * 0.031);
                }
                flowX[i] = tx;
                flowY[i] = ty;
            }
        }

        this.blurScalar(mask, width, height, 2);
        this.blurVector(flowX, flowY, width, height, 2);

        for (let i = 0; i < mask.length; i++) {
            maxMask = Math.max(maxMask, mask[i]);
            sumMask += mask[i];
        }

        this.mask = mask;
        this.flowX = flowX;
        this.flowY = flowY;
        this.maskStats = {
            avg: sumMask / mask.length,
            max: maxMask
        };
    }

    blurScalar(values, width, height, passes) {
        const tmp = new Float32Array(values.length);
        for (let pass = 0; pass < passes; pass++) {
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const i = y * width + x;
                    tmp[i] = (values[i] * 4 + values[i - 1] + values[i + 1] + values[i - width] + values[i + width]) / 8;
                }
            }
            values.set(tmp);
        }
    }

    blurVector(xValues, yValues, width, height, passes) {
        const tx = new Float32Array(xValues.length);
        const ty = new Float32Array(yValues.length);
        for (let pass = 0; pass < passes; pass++) {
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const i = y * width + x;
                    tx[i] = (xValues[i] * 4 + xValues[i - 1] + xValues[i + 1] + xValues[i - width] + xValues[i + width]) / 8;
                    ty[i] = (yValues[i] * 4 + yValues[i - 1] + yValues[i + 1] + yValues[i - width] + yValues[i + width]) / 8;
                }
            }
            xValues.set(tx);
            yValues.set(ty);
        }
    }

    resize() {
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        this.viewWidth = window.innerWidth;
        this.viewHeight = window.innerHeight;
        this.canvas.width = Math.round(this.viewWidth * this.pixelRatio);
        this.canvas.height = Math.round(this.viewHeight * this.pixelRatio);
        this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    }

    start() {
        if (!this.raf) this.raf = requestAnimationFrame(this.render);
    }

    render(now) {
        this.raf = requestAnimationFrame(this.render);
        if (!this.sourceData) return;
        const dt = Math.min(48, now - this.lastTime);
        this.lastTime = now;
        this.frame += dt / 16.6667;

        if (this.mode === 'still') this.renderStill();
        else if (this.mode === 'slice') this.renderSlice();
        else if (this.mode === 'mesh') this.renderMesh(false);
        else if (this.mode === 'hybrid') this.renderHybrid();
        else if (this.mode === 'mask') this.renderMask();
        else this.renderMaskedFlow(false);

        this.drawToScreen();
        this.updateFps(now);
    }

    options() {
        return {
            strength: Number(elements.strength.value),
            speed: Number(elements.speed.value),
            maskThreshold: Number(elements.mask.value),
            split: elements.split.checked
        };
    }

    renderStill() {
        this.workCtx.globalAlpha = 1;
        this.workCtx.globalCompositeOperation = 'source-over';
        this.workCtx.clearRect(0, 0, this.processWidth, this.processHeight);
        this.workCtx.drawImage(this.sourceCanvas, 0, 0);
    }

    renderSlice() {
        const { strength, speed } = this.options();
        const amp = lerp(1, 14, strength);
        const t = this.frame * lerp(0.012, 0.08, speed);
        const sliceH = Math.max(2, Math.round(lerp(14, 4, strength)));
        this.workCtx.clearRect(0, 0, this.processWidth, this.processHeight);
        this.workCtx.drawImage(this.sourceCanvas, 0, 0);
        this.workCtx.save();
        this.workCtx.globalAlpha = 0.82;
        for (let y = 0; y < this.processHeight; y += sliceH) {
            const wave1 = Math.sin(y * 0.026 + t) * amp;
            const wave2 = Math.sin(y * 0.071 - t * 1.7) * amp * 0.32;
            const dx = wave1 + wave2;
            this.workCtx.drawImage(
                this.sourceCanvas,
                0,
                y,
                this.processWidth,
                sliceH + 1,
                dx,
                y,
                this.processWidth,
                sliceH + 1
            );
        }
        this.workCtx.restore();
    }

    renderMaskedFlow(additive) {
        const { strength, speed, maskThreshold } = this.options();
        const width = this.processWidth;
        const height = this.processHeight;
        const src = this.sourceData.data;
        const dst = this.outputData.data;
        const amp = lerp(0.35, 9.5, strength);
        const t = this.frame * lerp(0.012, 0.075, speed);
        const threshold = lerp(0.08, 0.72, maskThreshold);
        const temp = new Uint8ClampedArray(4);

        for (let y = 0; y < height; y++) {
            const row = y * width;
            for (let x = 0; x < width; x++) {
                const i = row + x;
                const p = i * 4;
                const m = smoothstep(threshold, 1, this.mask[i]);
                const local = Math.sin((x * 0.018 + y * 0.009) + t + this.flowX[i] * 2.0);
                const swirl = Math.cos((x * -0.006 + y * 0.021) - t * 1.37 + this.flowY[i] * 1.7);
                const dx = (this.flowX[i] * local + this.flowY[i] * swirl * 0.35) * amp * m;
                const dy = (this.flowY[i] * local - this.flowX[i] * swirl * 0.35) * amp * m;
                sampleBilinear(src, width, height, x - dx, y - dy, temp, 0);
                const alpha = m * lerp(0.18, 0.78, strength);

                dst[p] = src[p] * (1 - alpha) + temp[0] * alpha;
                dst[p + 1] = src[p + 1] * (1 - alpha) + temp[1] * alpha;
                dst[p + 2] = src[p + 2] * (1 - alpha) + temp[2] * alpha;
                dst[p + 3] = 255;
            }
        }

        this.workCtx.putImageData(this.outputData, 0, 0);
        if (additive) {
            this.workCtx.save();
            this.workCtx.globalCompositeOperation = 'screen';
            this.workCtx.globalAlpha = 0.16 + strength * 0.16;
            this.workCtx.drawImage(this.sourceCanvas, 0, 0);
            this.workCtx.restore();
        }
    }

    renderMesh(softOnly) {
        const { strength, speed, maskThreshold } = this.options();
        const width = this.processWidth;
        const height = this.processHeight;
        const cols = 36;
        const rows = Math.max(12, Math.round(cols * height / width));
        const cellW = width / cols;
        const cellH = height / rows;
        const amp = lerp(0.6, softOnly ? 5 : 13, strength);
        const t = this.frame * lerp(0.01, 0.06, speed);
        const threshold = lerp(0.08, 0.72, maskThreshold);

        this.workCtx.clearRect(0, 0, width, height);
        this.workCtx.drawImage(this.sourceCanvas, 0, 0);
        this.workCtx.save();
        this.workCtx.globalCompositeOperation = 'source-over';
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const sx = Math.floor(col * cellW);
                const sy = Math.floor(row * cellH);
                const sw = Math.ceil(cellW) + 2;
                const sh = Math.ceil(cellH) + 2;
                const cx = clamp(Math.floor(sx + cellW * 0.5), 0, width - 1);
                const cy = clamp(Math.floor(sy + cellH * 0.5), 0, height - 1);
                const i = cy * width + cx;
                const m = smoothstep(threshold, 1, this.mask[i]);
                if (m < 0.02) continue;
                const phase = col * 0.37 + row * 0.53;
                const local = Math.sin(t + phase) * 0.72 + Math.sin(t * 1.8 - row * 0.41) * 0.28;
                const dx = this.flowX[i] * amp * local * m;
                const dy = this.flowY[i] * amp * local * m;
                this.workCtx.globalAlpha = m * lerp(0.18, 0.58, strength);
                this.workCtx.drawImage(this.sourceCanvas, sx, sy, sw, sh, sx + dx, sy + dy, sw, sh);
            }
        }
        this.workCtx.restore();
    }

    renderHybrid() {
        this.renderMaskedFlow(true);
        this.workCtx.save();
        this.workCtx.globalAlpha = 0.42;
        this.workCtx.globalCompositeOperation = 'screen';
        const originalStrength = elements.strength.value;
        elements.strength.value = String(Math.min(0.55, Number(originalStrength) * 0.65));
        this.renderMesh(true);
        elements.strength.value = originalStrength;
        this.workCtx.restore();
    }

    renderMask() {
        const width = this.processWidth;
        const height = this.processHeight;
        const src = this.sourceData.data;
        const dst = this.outputData.data;
        const threshold = lerp(0.08, 0.72, Number(elements.mask.value));
        for (let i = 0; i < width * height; i++) {
            const p = i * 4;
            const m = smoothstep(threshold, 1, this.mask[i]);
            dst[p] = src[p] * 0.26 + 40 + 120 * m;
            dst[p + 1] = src[p + 1] * 0.26 + 180 * m;
            dst[p + 2] = src[p + 2] * 0.26 + 220 * m;
            dst[p + 3] = 255;
        }
        this.workCtx.putImageData(this.outputData, 0, 0);
    }

    drawToScreen() {
        this.ctx.clearRect(0, 0, this.viewWidth, this.viewHeight);
        const scale = Math.max(this.viewWidth / this.processWidth, this.viewHeight / this.processHeight);
        const dw = this.processWidth * scale;
        const dh = this.processHeight * scale;
        const dx = (this.viewWidth - dw) * 0.5;
        const dy = (this.viewHeight - dh) * 0.5;

        if (this.options().split && this.mode !== 'still') {
            this.ctx.drawImage(this.sourceCanvas, dx, dy, dw, dh);
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.rect(this.viewWidth * 0.5, 0, this.viewWidth * 0.5, this.viewHeight);
            this.ctx.clip();
            this.ctx.drawImage(this.workCanvas, dx, dy, dw, dh);
            this.ctx.restore();
            this.ctx.strokeStyle = 'rgba(255,255,255,0.72)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(this.viewWidth * 0.5, 0);
            this.ctx.lineTo(this.viewWidth * 0.5, this.viewHeight);
            this.ctx.stroke();
        } else {
            this.ctx.drawImage(this.workCanvas, dx, dy, dw, dh);
        }
    }

    updateStats() {
        const avg = this.maskStats?.avg || 0;
        const max = this.maskStats?.max || 0;
        elements.stats.innerHTML = [
            '<span>mode: ' + this.mode + '</span>',
            '<span>process: ' + this.processWidth + 'x' + this.processHeight + '</span>',
            '<span>mask avg: ' + avg.toFixed(3) + '</span>',
            '<span>mask max: ' + max.toFixed(3) + '</span>',
            '<span>renderer: canvas pixel resample</span>'
        ].join('');
    }

    updateFps(now) {
        this.fpsFrames++;
        if (now - this.fpsTime > 500) {
            const fps = Math.round(this.fpsFrames * 1000 / (now - this.fpsTime));
            elements.fps.textContent = fps + ' fps';
            this.fpsFrames = 0;
            this.fpsTime = now;
            this.updateStats();
        }
    }
}

const lab = new ImageMotionLab(elements.canvas);

function fillSelect() {
    elements.select.innerHTML = ARTWORKS.map(item => '<option value="' + item.id + '">' + item.label + '</option>').join('');
}

function currentFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const date = params.get('date');
    const artist = params.get('artist');
    return ARTWORKS.find(item => item.date === date && item.artist === artist) || ARTWORKS[0];
}

function setUrl(item) {
    const params = new URLSearchParams(window.location.search);
    params.set('date', item.date);
    params.set('artist', item.artist);
    window.history.replaceState({}, '', window.location.pathname + '?' + params.toString());
}

function setMode(mode) {
    lab.setMode(mode);
    elements.modeButtons.forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
    lab.updateStats();
}

function loadItem(item) {
    elements.select.value = item.id;
    setUrl(item);
    lab.load(item).catch(error => {
        console.error(error);
        elements.status.textContent = error.message;
    });
}

fillSelect();
const initial = currentFromUrl();
elements.select.value = initial.id;

elements.select.addEventListener('change', event => {
    const item = ARTWORKS.find(entry => entry.id === event.target.value);
    if (item) loadItem(item);
});

elements.modeButtons.forEach(button => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
});

for (const input of [elements.strength, elements.speed, elements.mask, elements.split]) {
    input.addEventListener('input', () => lab.updateStats());
    input.addEventListener('change', () => lab.updateStats());
}

document.addEventListener('keydown', event => {
    if (event.key === '1') setMode('still');
    if (event.key === '2') setMode('slice');
    if (event.key === '3') setMode('flow');
    if (event.key === '4') setMode('mesh');
    if (event.key === '5') setMode('hybrid');
    if (event.key === '6') setMode('mask');
});

setMode('flow');
loadItem(initial);
