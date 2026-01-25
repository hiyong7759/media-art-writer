/**
 * Media Art Viewer - Main Controller
 * 작가별 제너러티브 아트 렌더링 및 UI 제어
 */

class MediaArtViewer {
  constructor() {
    this.canvas = document.getElementById('generativeCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.currentArtist = null;
    this.animationId = null;
    this.engine = null;

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
    });

    document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    document.getElementById('saveBtn')?.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = `media-art-${this.currentArtist.id}-${Date.now()}.png`;
      link.href = this.canvas.toDataURL('image/png');
      link.click();
    });

    document.getElementById('toggleInfoBtn')?.addEventListener('click', () => {
      document.getElementById('infoOverlay')?.classList.toggle('hidden');
    });
  }

  async loadArtist() {
    const params = new URLSearchParams(window.location.search);
    const artistId = params.get('artist') || 'aura-7';

    try {
      const response = await fetch('data/artists.json');
      const data = await response.json();
      this.currentArtist = data.artists.find(a => a.id === artistId) || data.artists[0];

      this.updateUI();
      this.initEngine();
      this.animate();
    } catch (error) {
      console.error('Failed to load artist:', error);
    }
  }

  updateUI() {
    const artist = this.currentArtist;
    document.getElementById('artistName').textContent = artist.name;
    document.getElementById('artworkTitle').textContent = artist.theme;
    document.getElementById('artworkDescription').textContent = artist.description;
    document.title = `${artist.name} | Media Art Viewer`;

    const colors = artist.styleHints.colorPalette;
    document.documentElement.style.setProperty('--color-dynamic-primary', colors[0]);
    document.documentElement.style.setProperty('--color-dynamic-secondary', colors[1]);
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
        this.engine = new CyberpunkEngine(this.canvas, this.ctx, colors);
        break;
      case 'Wave':
        this.engine = new WaveEngine(this.canvas, this.ctx, colors);
        break;
      case 'Cosmic':
        this.engine = new CosmicEngine(this.canvas, this.ctx, colors);
        break;
      default:
        this.engine = new OrganicEngine(this.canvas, this.ctx, colors);
    }

    // Initial resize to set up engine state
    this.engine.resize(this.canvas.width, this.canvas.height);
  }

  inferEngineType(id) {
    const map = {
      'aura-7': 'Organic',
      'kuro-x': 'Geometric',
      'neon-v': 'Cyberpunk',
      'flora-9': 'Organic',
      'echo-0': 'Wave',
      'void-3': 'Cosmic',
      'terra-1': 'Wave',
      'aqua-5': 'Wave',
      'prism-2': 'Organic'
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
}

document.addEventListener('DOMContentLoaded', () => {
  new MediaArtViewer();
});
