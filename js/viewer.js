/**
 * Media Art Viewer - Main Controller (v3.0 - Reconstruction)
 */

import { OrganicEngine } from './engines/OrganicEngine.js';
import { GeometricEngine } from './engines/GeometricEngine.js';
import { CyberpunkEngine } from './engines/CyberpunkEngine.js';
import { WaveEngine } from './engines/WaveEngine.js';
import { CosmicEngine } from './engines/CosmicEngine.js';
import { FlowEngine } from './engines/FlowEngine.js';
import { ContourEngine } from './engines/ContourEngine.js';
import { RefractionEngine } from './engines/RefractionEngine.js';
import { BloomEngine } from './engines/BloomEngine.js';

class MediaArtViewer {
  constructor() {
    this.canvas = document.getElementById('generativeCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.bgDiv = document.getElementById('artworkBackground');
    this.currentArtist = null;
    this.dailyArtwork = null;
    this.animationId = null;
    this.engine = null;
    this.hasBackgroundImage = false;
    this.targetDate = null;

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
      if (this.engine) this.engine.resize(this.canvas.width, this.canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.location.href = 'index.html';
      if (e.key === 'd' || e.key === 'D') this.testRandomData();
    });

    // 모드 버튼 클릭 (동적 생성된 버튼)
    document.getElementById('modeButtons')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('mode-btn')) {
        const modeIndex = parseInt(e.target.dataset.mode);
        if (this.engine) {
          this.engine.setMode(modeIndex, 0);
          this.renderVariantButtons(modeIndex);
          this.updateModeButtonsUI(modeIndex);
        }
      }
    });

    // Variant 버튼 클릭
    document.getElementById('variantButtons')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('variant-btn')) {
        const variantIndex = parseInt(e.target.dataset.variant);
        if (this.engine) {
          this.engine.setMode(this.engine.getCurrentMode(), variantIndex);
          this.updateVariantButtonsUI(variantIndex);
        }
      }
    });

    document.getElementById('saveBtn')?.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = `media-art-${Date.now()}.png`;
      link.href = this.canvas.toDataURL('image/png');
      link.click();
    });
  }

  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
      setTimeout(() => overlay.style.display = 'none', 500);
    }
  }

  showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.classList.remove('hidden');
    }
  }

  async loadArtist() {
    const params = new URLSearchParams(window.location.search);
    const artistId = params.get('artist') || 'flora-9';
    const today = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    this.targetDate = params.get('date') || today;

    try {
      const resp = await fetch(`data/artists.json?v=${Date.now()}`);
      const data = await resp.json();
      this.currentArtist = data.artists.find(a => a.id === artistId) || data.artists[0];

      try {
        const artResp = await fetch(`data/artworks/${this.targetDate}/${artistId}.json?v=${Date.now()}`);
        this.dailyArtwork = artResp.ok ? await artResp.json() : { title: "DUMMY" };
      } catch (e) { this.dailyArtwork = { title: "DUMMY" }; }

      await this.loadBackgroundImage(artistId, this.targetDate);
      this.updateUI();
      this.initEngine();
      this.animate();
    } catch (error) { console.error('Load Error:', error); }
  }

  loadBackgroundImage(artistId, targetDate) {
    return new Promise((resolve) => {
      const bgUrl = `data/artworks/${targetDate}/${artistId}.png`;
      const img = new Image();
      img.onload = () => {
        this.bgDiv.style.backgroundImage = `url(${bgUrl})`;
        this.hasBackgroundImage = true;
        resolve();
      };
      img.onerror = () => {
        this.hasBackgroundImage = false;
        this.bgDiv.style.backgroundImage = 'none';
        this.bgDiv.style.backgroundColor = '#0a0514';
        resolve();
      };
      img.src = bgUrl;
    });
  }

  // 동적 모드 버튼 렌더링
  renderModeButtons() {
    console.log("[Viewer] Rendering Mode Buttons...", this.engine ? "Engine Active" : "No Engine");
    const container = document.getElementById('modeButtons');
    if (!container || !this.engine) {
      console.warn("[Viewer] Missing container or engine");
      return;
    }

    const skills = this.engine.getSkills();
    container.innerHTML = skills.map((skill, i) =>
      `<button class="mode-btn${i === 0 ? ' active' : ''}" data-mode="${i}" title="${skill.nameKo || skill.name}">${skill.name}</button>`
    ).join('');

    // 첫번째 모드의 variants 표시
    this.renderVariantButtons(0);
  }

  // 동적 Variant 버튼 렌더링
  renderVariantButtons(modeIndex) {
    const container = document.getElementById('variantButtons');
    if (!container || !this.engine) return;

    const skills = this.engine.getSkills();
    const variants = skills[modeIndex]?.variants || [];

    container.innerHTML = variants.map((v, i) =>
      `<button class="variant-btn${i === this.engine.getCurrentVariant() ? ' active' : ''}" data-variant="${i}">${v}</button>`
    ).join('');
  }

  updateModeButtonsUI(activeIndex) {
    document.querySelectorAll('#modeButtons .mode-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === activeIndex);
    });
  }

  updateVariantButtonsUI(activeIndex) {
    document.querySelectorAll('#variantButtons .variant-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === activeIndex);
    });
  }

  updateUI() {
    const artist = this.currentArtist;
    document.getElementById('artworkTitle').textContent = this.dailyArtwork?.title?.ko || this.dailyArtwork?.title || "만개를 기다리며";
    document.getElementById('artistName').textContent = artist.name;

    const controls = document.getElementById('animationControls');
    if (controls) {
      controls.classList.remove('hidden');
    }

    // UI 표시: 컨테이너에 show-controls 추가하여 투명도 해제
    const viewerContainer = document.querySelector('.viewer-container');
    if (viewerContainer) viewerContainer.classList.add('show-controls');
  }

  initEngine() {
    const artist = this.currentArtist;
    const colors = artist.styleHints.colorPalette;

    // Completely Reset Context
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 각 작가별 올바른 엔진 연결 (artist_skills_definition.md 참조)
    switch (artist.id) {
      case 'aura-7':   // Nature Engine (유기적 자연)
        this.engine = new OrganicEngine(this.canvas, this.ctx, colors, this.hasBackgroundImage, this.dailyArtwork);
        break;
      case 'kuro-x':   // Geometric Engine (기하학적 형태)
        this.engine = new GeometricEngine(this.canvas, this.ctx, colors, this.hasBackgroundImage, this.dailyArtwork);
        break;
      case 'neon-v':   // Cyberpunk Engine (사이버펑크)
        this.engine = new CyberpunkEngine(this.canvas, this.ctx, colors, this.hasBackgroundImage, this.dailyArtwork);
        break;
      case 'void-3':   // Cosmic Engine (우주)
        this.engine = new CosmicEngine(this.canvas, this.ctx, colors, this.hasBackgroundImage, this.dailyArtwork);
        break;
      case 'aqua-5':   // Flow Engine (물/유동)
        this.engine = new FlowEngine(this.canvas, this.ctx, colors, this.hasBackgroundImage, this.dailyArtwork);
        break;
      case 'prism-2':  // Refraction Engine (빛 굴절)
        this.engine = new RefractionEngine(this.canvas, this.ctx, colors, this.hasBackgroundImage, this.dailyArtwork);
        break;
      case 'echo-0':   // Wave Engine (소리 시각화)
        this.engine = new WaveEngine(this.canvas, this.ctx, colors, this.hasBackgroundImage, this.dailyArtwork);
        break;
      case 'terra-1':  // Contour Engine (지형)
        this.engine = new ContourEngine(this.canvas, this.ctx, colors, this.hasBackgroundImage, this.dailyArtwork);
        break;
      case 'flora-9':  // Bloom Engine (꽃)
        this.engine = new BloomEngine(this.canvas, this.ctx, colors, this.hasBackgroundImage, this.dailyArtwork);
        break;
      default:
        this.engine = new OrganicEngine(this.canvas, this.ctx, colors, this.hasBackgroundImage, this.dailyArtwork);
    }

    this.engine.resize(this.canvas.width, this.canvas.height);
    this.renderModeButtons();
  }

  animate() {
    if (this.engine) { this.engine.update(); this.engine.draw(); }
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  testRandomData() {
    console.log("%c [FORCE RESET] New Context & Data ", "background: #c0392b; color: white;");
    this.dailyArtwork = { title: "새로운 영감 (" + Math.floor(Math.random() * 100) + ")", prompt: "Random", style: {} };
    this.hasBackgroundImage = false;
    this.bgDiv.style.backgroundImage = 'none';
    this.bgDiv.style.backgroundColor = '#0a0514';

    // Kill engine and restart
    this.engine = null;
    this.initEngine();
  }
}

document.addEventListener('DOMContentLoaded', () => { new MediaArtViewer(); });
