/**
 * Media Art Viewer - Main Controller (v3.1 - Refactored)
 */

import { EngineFactory } from './core/EngineFactory.js';

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
    // KST 기준으로 YYYY-MM-DD 포맷 생성
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    const today = kstDate.toISOString().split('T')[0]; // "2026-01-28"
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
    } catch (error) {
      console.error('Load Error:', error);
      // Fallback data if load fails
      if (!this.currentArtist) {
        this.currentArtist = {
          id: 'aura-7', name: 'AURA-7', theme: 'Organic Flow',
          styleHints: { colorPalette: ['#ffffff', '#88ff88', '#00ff00', '#ffff00'] }
        };
      }
      this.dailyArtwork = { title: { ko: "데이터 로딩 오류", en: "Data Load Error" } };
    } finally {
      this.updateUI();
      this.initEngine();
      this.animate();
    }
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
    const artwork = this.dailyArtwork;

    // 1. Text Info
    document.getElementById('artworkTitle').textContent = artwork?.title?.ko || artwork?.title || "제목 없음";

    const desc = typeof artwork?.description === 'object' ? artwork.description.ko : artwork?.description;
    document.getElementById('artworkDescription').textContent = desc || "작품 설명이 없습니다.";

    document.getElementById('artistName').textContent = artist.name;
    const artistDesc = typeof artist.description === 'object' ? artist.description.ko : artist.description;
    document.getElementById('artistDescription').textContent = artistDesc;

    document.getElementById('generatedDate').textContent = this.targetDate;
    document.getElementById('modelInfo').textContent = `MODEL: ${artist.id.toUpperCase()}-V3`;
    document.getElementById('promptText').textContent = artwork?.prompt || "No prompt data.";

    // 2. Artist Colors
    const colorContainer = document.getElementById('artistColors');
    if (colorContainer && artist.styleHints?.colorPalette) {
      colorContainer.innerHTML = artist.styleHints.colorPalette.map(color =>
        `<span class="color-dot" style="background: ${color};" title="${color}"></span>`
      ).join('');
    }

    // 3. Show Controls
    const controls = document.getElementById('animationControls');
    if (controls) controls.classList.remove('hidden');

    const viewerContainer = document.querySelector('.viewer-container');
    if (viewerContainer) viewerContainer.classList.add('show-controls');
  }

  initEngine() {
    const artist = this.currentArtist;
    const colors = artist.styleHints.colorPalette;

    // Completely Reset Context
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Factory Pattern: 작가 ID로 적절한 엔진 생성
    this.engine = EngineFactory.create(
      artist.id,
      this.canvas,
      this.ctx,
      colors,
      this.hasBackgroundImage,
      this.dailyArtwork
    );

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
