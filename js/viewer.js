/**
 * Media Art Viewer - Main Controller
 * 작가별 제너러티브 아트 렌더링 및 UI 제어
 */

class MediaArtViewer {
  constructor() {
    this.canvas = document.getElementById('generativeCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.bgDiv = document.getElementById('artworkBackground');
    this.currentArtist = null;
    this.dailyArtwork = null; // Store daily data
    this.animationId = null;
    this.engine = null;
    this.hasBackgroundImage = false; // 배경 이미지 모드 플래그

    this.init();
  }

  async init() {
    await this.loadArtist();
    this.setupCanvas();
    this.setupEventListeners();
    this.hideLoading();
  }

  setupCanvas() {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      if (this.engine) {
        this.engine.resize(this.canvas.width, this.canvas.height);
      }
    };
    resize();
    window.addEventListener('resize', resize);
  }

  setupEventListeners() {
    const container = document.getElementById('viewerContainer');
    let hideTimeout = null;
    const HIDE_DELAY = 3000;

    const showControls = () => {
      container?.classList.add('show-controls');
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        container?.classList.remove('show-controls');
      }, HIDE_DELAY);
    };

    showControls();

    container?.addEventListener('mousemove', showControls);
    container?.addEventListener('mousedown', showControls);
    container?.addEventListener('touchstart', showControls);
    container?.addEventListener('touchmove', showControls);

    document.addEventListener('keydown', (e) => {
      showControls();
      if (e.key === 'i' || e.key === 'I') {
        document.getElementById('infoOverlay')?.classList.toggle('hidden');
      }
      if (e.key === 'Escape') {
        window.location.href = 'index.html';
      }
      // [Dev] Test random data for variety check
      if (e.key === 'd' || e.key === 'D') {
        this.testRandomData();
      }
    });

    document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    document.getElementById('saveBtn')?.addEventListener('click', () => {
      // 1. Create temporary canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      const tCtx = tempCanvas.getContext('2d');

      // 2. Draw Background
      if (this.hasBackgroundImage && this.bgImage) {
        // Cover fit logic
        const img = this.bgImage;
        const aspect = img.width / img.height;
        const canvasAspect = tempCanvas.width / tempCanvas.height;
        let drawW, drawH, drawX, drawY;

        if (aspect > canvasAspect) {
          drawH = tempCanvas.height;
          drawW = drawH * aspect;
          drawX = (tempCanvas.width - drawW) / 2;
          drawY = 0;
        } else {
          drawW = tempCanvas.width;
          drawH = drawW / aspect;
          drawX = 0;
          drawY = (tempCanvas.height - drawH) / 2;
        }
        tCtx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        tCtx.fillStyle = '#0a0a0f';
        tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      }

      // 3. Apply Mix-Blend-Mode simulation (approximate)
      if (this.currentArtist && this.currentArtist.id === 'neon-v') {
        tCtx.globalCompositeOperation = 'screen';
      } else {
        tCtx.globalCompositeOperation = 'source-over';
      }

      // 4. Draw Generative Canvas
      tCtx.drawImage(this.canvas, 0, 0);

      // 5. Download
      const link = document.createElement('a');
      link.download = `media-art-${this.currentArtist.id}-${Date.now()}.png`;
      link.href = tempCanvas.toDataURL('image/png');
      link.click();
    });

    document.getElementById('toggleInfoBtn')?.addEventListener('click', () => {
      document.getElementById('infoOverlay')?.classList.toggle('hidden');
    });

    // Animation Mode Switching
    document.getElementById('animationControls')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('mode-btn')) {
        const mode = e.target.dataset.mode;

        // Update Active UI
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        // Switch Engine Mode
        if (this.engine && typeof this.engine.setMode === 'function') {
          this.engine.setMode(mode);
        }
      }
    });
  }

  async loadArtist() {
    const params = new URLSearchParams(window.location.search);
    const artistId = params.get('artist') || 'aura-7';
    // Use URL date parameter or default to today (KST)
    const urlDate = params.get('date');

    // Calculate Today KST
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(Date.now() + kstOffset);
    const today = kstDate.toISOString().split('T')[0];

    const targetDate = urlDate || today;

    try {
      // 1. Load Static Profile
      const response = await fetch('data/artists.json');
      const data = await response.json();
      let artist = data.artists.find(a => a.id === artistId) || data.artists[0];

      // 2. Try to Load Daily Artwork
      let dailyData = null;
      try {
        const artworkResponse = await fetch(`data/artworks/${targetDate}/${artistId}.json`);
        if (artworkResponse.ok) {
          dailyData = await artworkResponse.json();
          console.log('Loaded daily artwork:', dailyData);

          // Apply dynamic style from daily data
          if (dailyData.style) {
            if (dailyData.style['--dynamic-primary']) {
              artist.styleHints.colorPalette[0] = dailyData.style['--dynamic-primary'];
            }
            if (dailyData.style['--dynamic-secondary']) {
              artist.styleHints.colorPalette[1] = dailyData.style['--dynamic-secondary'];
            }
            if (dailyData.style['--dynamic-tertiary']) {
              artist.styleHints.colorPalette[2] = dailyData.style['--dynamic-tertiary'];
            }
            if (dailyData.style['--dynamic-quaternary']) {
              artist.styleHints.colorPalette[3] = dailyData.style['--dynamic-quaternary'];
            }
          }
        } else {
          console.log('No daily artwork found (fetch error), using mock data.');
          dailyData = this.getMockData(targetDate);
        }
      } catch (artworkError) {
        console.log('No daily artwork found (catch), using mock data.');
        dailyData = this.getMockData(targetDate);
      }

      this.currentArtist = artist;
      this.dailyArtwork = dailyData;

      // 배경 이미지 로드 시도
      await this.loadBackgroundImage(artistId, targetDate);

      this.updateUI();
      this.updateUI();
      this.initEngine();
      this.animate();
    } catch (error) {
      console.error('Failed to load artist:', error);
    }
  }

  // 배경 이미지 로드 (하이브리드 아트)
  loadBackgroundImage(artistId, targetDate) {
    return new Promise((resolve) => {
      const bgUrl = `data/artworks/${targetDate}/${artistId}.png`;
      const img = new Image();
      img.onload = () => {
        this.bgDiv.style.backgroundImage = `url(${bgUrl})`;
        this.bgImage = img; // Save capture reference
        this.hasBackgroundImage = true;
        console.log('Background image loaded:', bgUrl);

        const BLEND_MODES = {
          'neon-v': 'screen',
          'aqua-5': 'overlay',
          'void-3': 'lighten',
          'prism-2': 'color-dodge',
          'default': 'normal'
        };
        this.canvas.style.mixBlendMode = BLEND_MODES[artistId] || BLEND_MODES.default;
        resolve();
      };
      img.onerror = () => {
        this.hasBackgroundImage = false;
        console.log('No background image found, using solid background');
        resolve();
      };
      img.src = bgUrl;
    });
  }

  getArtistModes(artistId) {
    const common = {
      rain: 'Rain', scanner: 'Scan', hud: 'Sniper', data: 'Data', circuit: 'Circ', sign: 'Sign', net: 'Net'
    };

    const mapping = {
      'neon-v': { ...common },
      'aura-7': { rain: 'Seed', scanner: 'Wind', hud: 'Bloom', data: 'Flow', circuit: 'Root', sign: 'Pulse', net: 'Life' },
      'kuro-x': { rain: 'Point', scanner: 'Line', hud: 'Poly', data: 'Solid', circuit: 'Chaos', sign: 'Frac', net: 'Dim' },
      'void-3': { rain: 'Dust', scanner: 'Orbit', hud: 'Star', data: 'Nova', circuit: 'Galaxy', sign: 'Quasar', net: 'Void' },
      'aqua-5': { rain: 'Drop', scanner: 'Tide', hud: 'Bubble', data: 'Stream', circuit: 'Deep', sign: 'Mist', net: 'Ice' },
      'prism-2': { rain: 'Beam', scanner: 'Spec', hud: 'Bokeh', data: 'Neon', circuit: 'Mirror', sign: 'Glass', net: 'Flash' },
      'echo-0': { rain: 'Voice', scanner: 'Wave', hud: 'EQ', data: 'Noise', circuit: 'String', sign: 'Pulse', net: 'Void' },
      'terra-1': { rain: 'Sand', scanner: 'Layer', hud: 'Map', data: 'River', circuit: 'Rock', sign: 'Core', net: 'Mount' },
      'flora-9': { rain: 'Petal', scanner: 'Vine', hud: 'Bloom', data: 'Pollen', circuit: 'Vine', sign: 'Scent', net: 'Garden' }
    };

    return mapping[artistId] || common;
  }

  getMockData(date) {
    return {
      title: "로컬 테스트 작품 (Dummy)",
      description: "데이터가 없을 경우 표시되는 임시 설명입니다. 실제 배포 시에는 생성된 데이터가 표시됩니다.",
      prompt: "This is a dummy prompt for local testing purposes. The API key might be missing or the generation script has not run yet. (Local mode)",
      model: "Mock-Model (Local)",
      generatedAt: new Date().toISOString(),
      style: {
        // Only override if needed, otherwise uses artist default
      }
    };
  }

  updateUI() {
    // 1. Language Setting
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }
    const userLang = getCookie('userLang') || 'ko';

    const artist = this.currentArtist;
    const daily = this.dailyArtwork;

    // 2. Headings & Metadata
    const titleEl = document.getElementById('artworkTitle');
    const dateEl = document.getElementById('generatedDate');

    if (daily) {
      // Dynamic Title (Dual Language)
      const title = (daily.title && typeof daily.title === 'object')
        ? daily.title[userLang]
        : daily.title || "무제";
      titleEl.textContent = title;

      const dateStr = daily.generatedAt ? daily.generatedAt.split('T')[0].replace(/-/g, '.') : new Date().toISOString().split('T')[0].replace(/-/g, '.');
      dateEl.textContent = dateStr;
    } else {
      titleEl.textContent = artist.theme;
      dateEl.textContent = "";
    }

    // 3. Daily Description
    const dailyDescEl = document.getElementById('artworkDescription');
    if (dailyDescEl) {
      if (daily) {
        // Dynamic Description (Dual Language)
        let desc = "";
        if (daily.description && typeof daily.description === 'object') {
          desc = daily.description[userLang] || daily.description['ko'];
        } else if (daily.description) {
          desc = daily.description;
        } else {
          desc = userLang === 'ko' ? "작품 설명이 없습니다." : "No description available.";
        }

        dailyDescEl.textContent = desc;
        dailyDescEl.style.display = 'block';
        dailyDescEl.style.color = '';
      } else {
        dailyDescEl.textContent = userLang === 'ko' ? "오늘 생성된 작품 데이터가 없습니다." : "No artwork data generated for today.";
      }
    }

    // 4. Artist Profile
    // Dynamic Artist Desc (Dual Language)
    const artistDesc = (artist.description && typeof artist.description === 'object')
      ? artist.description[userLang]
      : artist.description;

    document.getElementById('artistName').textContent = artist.name;
    document.getElementById('artistDescription').textContent = artistDesc;

    // 5. Color Palette (Ensure all 4 colors are shown)
    const colorsContainer = document.getElementById('artistColors');
    if (colorsContainer) {
      const colors = artist.styleHints.colorPalette;
      // Removed slice to show all available colors (usually 4)
      colorsContainer.innerHTML = colors.map(color =>
        `<span class="color-dot" style="background: ${color};" title="${color}"></span>`
      ).join('');
    }

    // 6. Metadata (Model, Prompt)
    const modelEl = document.getElementById('modelInfo');
    const promptEl = document.getElementById('promptText');

    if (daily) {
      if (modelEl) modelEl.textContent = `MODEL: ${daily.model || 'Unknown'}`;
      if (promptEl) promptEl.textContent = daily.prompt || 'No prompt available';
    } else {
      if (modelEl) modelEl.textContent = "MODEL: -";
      if (promptEl) promptEl.textContent = userLang === 'ko' ? "프롬프트 정보가 없습니다." : "No prompt information available.";
    }

    // 7. Global Styles & Title
    const pageTitle = daily
      ? (typeof daily.title === 'object' ? daily.title[userLang] : daily.title)
      : artist.name;
    document.title = `${pageTitle} | Media Art Viewer`;

    const colors = artist.styleHints.colorPalette;
    document.documentElement.style.setProperty('--color-dynamic-primary', colors[0]);
    document.documentElement.style.setProperty('--color-dynamic-secondary', colors[1]);

    // 8. Animation Controls Visibility & Label Update
    const controls = document.getElementById('animationControls');
    if (controls) {
      // Show controls for ALL artists now
      controls.classList.remove('hidden');

      // Update Button Labels based on Artist Theme
      const modeNames = this.getArtistModes(artist.id);
      const buttons = controls.querySelectorAll('.mode-btn');

      buttons.forEach(btn => {
        const modeKey = btn.getAttribute('data-mode'); // rain, scanner, etc.
        if (modeNames[modeKey]) {
          btn.textContent = modeNames[modeKey].toUpperCase();
          btn.title = `${modeNames[modeKey]} Mode`;
        }
      });
    }
  }

  hideLoading() {
    setTimeout(() => {
      document.getElementById('loadingOverlay')?.classList.add('hidden');
    }, 500);
  }

  initEngine() {
    const artist = this.currentArtist;
    const colors = artist.styleHints.colorPalette;

    // Select Engine
    let engineType = artist.styleHints.engineType || this.inferEngineType(artist.id);

    // Initialize specific engine
    switch (engineType) {
      case 'Organic':
        this.engine = new OrganicEngine(this.canvas, this.ctx, colors);
        break;
      case 'Geometric':
        this.engine = new GeometricEngine(this.canvas, this.ctx, colors);
        break;
      case 'Cyberpunk':
        this.engine = new CyberpunkEngine(this.canvas, this.ctx, colors, this.hasBackgroundImage, this.dailyArtwork);
        break;
      case 'Wave':
        this.engine = new WaveEngine(this.canvas, this.ctx, colors);
        break;
      case 'Cosmic':
        this.engine = new CosmicEngine(this.canvas, this.ctx, colors);
        break;
      case 'Flow':
        this.engine = new FlowEngine(this.canvas, this.ctx, colors);
        break;
      case 'Contour':
        this.engine = new ContourEngine(this.canvas, this.ctx, colors);
        break;
      case 'Refraction':
        this.engine = new RefractionEngine(this.canvas, this.ctx, colors);
        break;
      case 'Bloom':
        this.engine = new BloomEngine(this.canvas, this.ctx, colors);
        break;
      default:
        this.engine = new OrganicEngine(this.canvas, this.ctx, colors);
    }

    // Initial resize to set up engine state
    this.engine.resize(this.canvas.width, this.canvas.height);

    // Sync UI with Auto-Selected Mode (for Cyberpunk engine)
    if (engineType === 'Cyberpunk' && this.engine.mode) {
      const mode = this.engine.mode;
      document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
      if (activeBtn) activeBtn.classList.add('active');
    }
  }

  inferEngineType(id) {
    const map = {
      'aura-7': 'Organic',
      'kuro-x': 'Geometric',
      'neon-v': 'Cyberpunk',
      'flora-9': 'Bloom',
      'echo-0': 'Wave',
      'void-3': 'Cosmic',
      'terra-1': 'Contour',
      'aqua-5': 'Flow',
      'prism-2': 'Refraction'
    };
    return map[id] || 'Organic';
  }

  animate() {
    if (this.engine) {
      this.engine.update();
      this.engine.draw();
    }
    this.animationId = requestAnimationFrame(() => this.animate());
  }


  // Developer Tool: Generate Random Data for Testing
  testRandomData() {
    const prompts = [
      "Minimal short text.", // Should trigger Style 1 (Horizontal) or similar
      "Complex neural network topology visualizing deep learning pathways. The data flows like water through the digital veins of the city.", // Style 0?
      "ERROR ERROR ERROR ERROR ERROR ERROR FATAL SYSTEM FAILURE REBOOT SEQUENCE INITIATED", // Style 1 or 2
      "0101010101011110001010101010101010101010101010101010101010101", // Style 0 or 2
      "Aha!",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    ];

    // Randomize length more drastically
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    // Allow very short or very long
    let longText = randomPrompt;
    if (Math.random() > 0.5) {
      longText = randomPrompt.repeat(Math.floor(Math.random() * 5) + 1);
    }

    // Ensure variety in starting char for Circuit Style
    const prefix = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    longText = prefix + longText;

    console.log(`[TEST] Applying Random Data (Length: ${longText.length})`);
    console.log(`[TEST] Prompt: ${longText.substring(0, 50)}...`);

    // Mock Daily Data
    this.dailyArtwork = {
      prompt: longText,
      title: { ko: "테스트 데이터 모드", en: "Test Data Mode" },
      description: { ko: "랜덤 생성된 데이터로 시각화 테스트 중입니다.", en: "Visualizing random generated data." }
    };

    // Save current mode if engine exists
    let currentMode = 'rain';
    if (this.engine && this.engine.mode) {
      currentMode = this.engine.mode;
    }

    this.updateUI();
    this.initEngine(); // Re-init engine with new data

    // Restore mode
    if (this.engine && typeof this.engine.setMode === 'function') {
      this.engine.setMode(currentMode);

      // Update UI buttons
      const btn = document.querySelector(`.mode-btn[data-mode="${currentMode}"]`);
      if (btn) {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    }

    // Show toast or log
    const titleEl = document.getElementById('artworkTitle');
    let styleInfo = "";
    if (this.engine.getCurrentStyleName) {
      styleInfo = ` | Style: ${this.engine.getCurrentStyleName()}`;
    }
    if (titleEl) titleEl.textContent = `TEST DATA (${longText.length} chars)${styleInfo}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MediaArtViewer();
});
