/**
 * Media Art Viewer - Main Controller (v3.2 - Sound System Added)
 */

import { EngineFactory } from './core/EngineFactory.js';
import { soundEngine } from './sound/core/SoundEngine.js';
import { SoundFactory } from './sound/core/SoundFactory.js';

// Language helpers
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

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
    this.availableDates = [];
    this.artistId = null;
    this.bgImage = null;
    this.hideControlsTimeout = null;
    this.controlsVisible = true;
    this.frameCount = 0;
    this.isOverControls = false; // 마우스가 컨트롤 영역 위에 있는지

    // Sound system
    this.soundEnabled = false;
    this.soundInitialized = false;

    this.init();
  }

  async init() {
    await this.loadAvailableDates();
    await this.loadArtist();
    this.setupCanvas();
    this.setupEventListeners();
    this.setupDateControls();
    this.setupSoundControls();
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
      if (e.key === 'm' || e.key === 'M') this.toggleSound();
    });

    // 모드 버튼 클릭 (동적 생성된 버튼)
    document.getElementById('modeButtons')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('mode-btn')) {
        const modeIndex = parseInt(e.target.dataset.mode);
        if (this.engine) {
          this.engine.setMode(modeIndex, 0);
          this.renderVariantButtons(modeIndex);
          this.updateModeButtonsUI(modeIndex);
          this.updateUrlParams({ mode: modeIndex, variant: 0 });

          // 사운드 모드 변경
          soundEngine.onModeChange(modeIndex, 0);
        }
      }
    });

    // Variant 버튼 클릭
    document.getElementById('variantButtons')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('variant-btn')) {
        const variantIndex = parseInt(e.target.dataset.variant);
        if (this.engine) {
          const currentMode = this.engine.getCurrentMode();
          this.engine.setMode(currentMode, variantIndex);
          this.updateVariantButtonsUI(variantIndex);
          this.updateUrlParams({ variant: variantIndex });

          // 사운드 변형 변경
          soundEngine.onModeChange(currentMode, variantIndex);
        }
      }
    });

    // 저장 버튼 - 배경 + 캔버스 합성
    document.getElementById('saveBtn')?.addEventListener('click', () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      const tempCtx = tempCanvas.getContext('2d');

      // 배경 이미지 그리기
      if (this.bgImage) {
        const scale = Math.max(tempCanvas.width / this.bgImage.width, tempCanvas.height / this.bgImage.height);
        const x = (tempCanvas.width - this.bgImage.width * scale) / 2;
        const y = (tempCanvas.height - this.bgImage.height * scale) / 2;
        tempCtx.drawImage(this.bgImage, x, y, this.bgImage.width * scale, this.bgImage.height * scale);
      } else {
        tempCtx.fillStyle = '#0a0514';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      }

      // 캔버스 내용 위에 그리기
      tempCtx.drawImage(this.canvas, 0, 0);

      const link = document.createElement('a');
      link.download = `media-art-${Date.now()}.png`;
      link.href = tempCanvas.toDataURL('image/png');
      link.click();
    });

    // 정보 토글 버튼 - 상단 컨트롤도 함께 토글
    document.getElementById('toggleInfoBtn')?.addEventListener('click', () => {
      this.toggleControls();
    });

    // 전체화면 버튼
    document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.() ||
        document.documentElement.webkitRequestFullscreen?.();
      } else {
        document.exitFullscreen?.() || document.webkitExitFullscreen?.();
      }
    });

    // 마우스 움직임 감지 - 컨트롤 표시 및 자동 숨김
    document.addEventListener('mousemove', () => this.showControls());
    document.addEventListener('touchstart', () => this.showControls());

    // 컨트롤 영역 위에 마우스가 있으면 숨기지 않음
    const controlAreas = ['.controls', '.top-controls', '.sound-controls', '.info-overlay', '.back-btn'];
    controlAreas.forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        el.addEventListener('mouseenter', () => {
          this.isOverControls = true;
          clearTimeout(this.hideControlsTimeout);
        });
        el.addEventListener('mouseleave', () => {
          this.isOverControls = false;
          this.resetHideTimer();
        });
      }
    });

    // 페이지 언로드 시 사운드 정리
    window.addEventListener('beforeunload', () => {
      soundEngine.cleanup();
    });
  }

  // 사운드 컨트롤 설정
  setupSoundControls() {
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const volumeSlider = document.getElementById('volumeSlider');

    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => this.toggleSound());
    }

    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        soundEngine.setVolume(volume);
        this.updateVolumeUI(volume);
      });
    }

    // 사운드 버튼 클릭 시에만 초기화됨 (toggleSound에서 처리)
  }

  // 사운드 초기화 (음소거 상태로 준비만 함)
  async initSound() {
    if (this.soundInitialized) return;

    // AudioContext만 초기화 (음소거 상태)
    const success = await soundEngine.init();
    if (success) {
      soundEngine.setMute(true); // 먼저 음소거

      // 작가별 사운드 프로파일 설정 (start하지 않음)
      const profile = SoundFactory.create(this.artistId || 'echo-0');
      await soundEngine.setProfileWithoutStart(profile);

      // URL에서 모드/variant 복원
      const params = new URLSearchParams(window.location.search);
      const savedMode = parseInt(params.get('mode')) || 0;
      const savedVariant = parseInt(params.get('variant')) || 0;
      soundEngine.onModeChange(savedMode, savedVariant);

      this.soundInitialized = true;
      console.log('[Viewer] Sound initialized (muted) for artist:', this.artistId);
    }
  }

  // 사운드 토글
  async toggleSound() {
    if (!this.soundInitialized) {
      await this.initSound();
    }

    this.soundEnabled = !this.soundEnabled;

    if (this.soundEnabled) {
      await soundEngine.resume();
      soundEngine.startProfile(); // 프로파일 시작
      soundEngine.setMute(false);
    } else {
      soundEngine.setMute(true);
    }

    this.updateSoundUI();
  }

  // 사운드 UI 업데이트
  updateSoundUI() {
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const soundIcon = document.getElementById('soundIcon');
    const viewerContainer = document.querySelector('.viewer-container');

    if (soundToggleBtn) {
      soundToggleBtn.classList.toggle('active', this.soundEnabled);
    }

    // 볼륨 컨트롤 표시/숨김을 위한 클래스 토글
    if (viewerContainer) {
      viewerContainer.classList.toggle('sound-enabled', this.soundEnabled);
    }

    if (soundIcon) {
      // 아이콘 변경 (음소거/활성)
      if (this.soundEnabled) {
        soundIcon.innerHTML = `
          <path d="M11 5L6 9H2v6h4l5 4V5z"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
        `;
      } else {
        soundIcon.innerHTML = `
          <path d="M11 5L6 9H2v6h4l5 4V5z"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        `;
      }
    }
  }

  // 볼륨 UI 업데이트
  updateVolumeUI(volume) {
    const volumeValue = document.getElementById('volumeValue');
    if (volumeValue) {
      volumeValue.textContent = Math.round(volume * 100) + '%';
    }
  }

  showControls() {
    const viewerContainer = document.querySelector('.viewer-container');
    if (viewerContainer && !this.controlsVisible) {
      viewerContainer.classList.add('show-controls');
      this.controlsVisible = true;
    }

    // 컨트롤 영역 위가 아닐 때만 타이머 설정
    if (!this.isOverControls) {
      this.resetHideTimer();
    }
  }

  resetHideTimer() {
    clearTimeout(this.hideControlsTimeout);
    this.hideControlsTimeout = setTimeout(() => this.hideControls(), 3000);
  }

  hideControls() {
    // 컨트롤 영역 위에 마우스가 있으면 숨기지 않음
    if (this.isOverControls) return;

    const viewerContainer = document.querySelector('.viewer-container');
    if (viewerContainer) {
      viewerContainer.classList.remove('show-controls');
      this.controlsVisible = false;
    }
  }

  toggleControls() {
    const viewerContainer = document.querySelector('.viewer-container');
    if (!viewerContainer) return;

    if (this.controlsVisible) {
      viewerContainer.classList.remove('show-controls');
      this.controlsVisible = false;
      clearTimeout(this.hideControlsTimeout);
    } else {
      viewerContainer.classList.add('show-controls');
      this.controlsVisible = true;
      this.hideControlsTimeout = setTimeout(() => this.hideControls(), 3000);
    }
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

  async loadAvailableDates() {
    try {
      const params = new URLSearchParams(window.location.search);
      this.artistId = params.get('artist') || 'flora-9';

      // history.json에서 해당 작가의 날짜 목록 가져오기
      const resp = await fetch(`data/history.json?v=${Date.now()}`);
      if (resp.ok) {
        const history = await resp.json();
        if (history[this.artistId]) {
          this.availableDates = Object.keys(history[this.artistId]).sort();
        }
      }
    } catch (e) {
      console.warn('Failed to load available dates:', e);
      this.availableDates = [];
    }
  }

  setupDateControls() {
    const prevBtn = document.getElementById('prevDateBtn');
    const nextBtn = document.getElementById('nextDateBtn');
    const datePickerBtn = document.getElementById('datePickerBtn');
    const datePicker = document.getElementById('datePicker');
    const dateDisplay = document.getElementById('currentDateDisplay');

    if (!prevBtn || !nextBtn || !datePickerBtn || !datePicker) return;

    // 현재 날짜 표시
    if (dateDisplay) dateDisplay.textContent = this.targetDate;

    // 버튼 상태 업데이트
    this.updateDateNavButtons();

    // 이전 날짜
    prevBtn.addEventListener('click', () => {
      const currentIndex = this.availableDates.indexOf(this.targetDate);
      if (currentIndex > 0) {
        this.navigateToDate(this.availableDates[currentIndex - 1]);
      }
    });

    // 다음 날짜
    nextBtn.addEventListener('click', () => {
      const currentIndex = this.availableDates.indexOf(this.targetDate);
      if (currentIndex < this.availableDates.length - 1) {
        this.navigateToDate(this.availableDates[currentIndex + 1]);
      }
    });

    // 데이트 피커 버튼 클릭
    datePickerBtn.addEventListener('click', () => {
      datePicker.showPicker?.() || datePicker.click();
    });

    // 데이트 피커 값 설정 및 제한
    datePicker.value = this.targetDate;
    if (this.availableDates.length > 0) {
      datePicker.min = this.availableDates[0];
      datePicker.max = this.availableDates[this.availableDates.length - 1];
    }

    // 데이트 피커 변경
    datePicker.addEventListener('change', (e) => {
      const selectedDate = e.target.value;
      // 데이터가 있는 날짜인지 확인
      if (this.availableDates.includes(selectedDate)) {
        this.navigateToDate(selectedDate);
      } else {
        // 가장 가까운 이전 날짜 찾기
        const closestDate = this.availableDates.filter(d => d <= selectedDate).pop()
          || this.availableDates[0];
        if (closestDate) {
          this.navigateToDate(closestDate);
        }
      }
    });
  }

  updateDateNavButtons() {
    const prevBtn = document.getElementById('prevDateBtn');
    const nextBtn = document.getElementById('nextDateBtn');

    if (!prevBtn || !nextBtn) return;

    const currentIndex = this.availableDates.indexOf(this.targetDate);
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= this.availableDates.length - 1 || currentIndex === -1;
  }

  navigateToDate(date) {
    const params = new URLSearchParams(window.location.search);
    params.set('date', date);
    // 현재 모드와 variant 유지
    if (this.engine) {
      params.set('mode', this.engine.getCurrentMode());
      params.set('variant', this.engine.getCurrentVariant());
    }
    window.location.search = params.toString();
  }

  updateUrlParams(updates) {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) {
      params.set(key, value);
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
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
        this.bgImage = img;
        resolve();
      };
      img.onerror = () => {
        this.hasBackgroundImage = false;
        this.bgImage = null;
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
    const lang = getCookie('userLang') || 'ko';

    // 1. Text Info (언어에 따라 선택)
    const title = artwork?.title?.[lang] || artwork?.title?.ko || artwork?.title || (lang === 'ko' ? "제목 없음" : "Untitled");
    document.getElementById('artworkTitle').textContent = title;

    const desc = artwork?.description?.[lang] || artwork?.description?.ko || (typeof artwork?.description === 'string' ? artwork.description : (lang === 'ko' ? "작품 설명이 없습니다." : "No description available."));
    document.getElementById('artworkDescription').textContent = desc;

    document.getElementById('artistName').textContent = artist.name;
    const artistDesc = artist.description?.[lang] || artist.description?.ko || (typeof artist.description === 'string' ? artist.description : '');
    document.getElementById('artistDescription').textContent = artistDesc;

    document.getElementById('generatedDate').textContent = this.targetDate;
    document.getElementById('modelInfo').textContent = `MODEL: GEMINI-3-FLASH`;
    document.getElementById('promptText').textContent = artwork?.prompt || "No prompt data.";

    // 2. Artist Colors
    const colorContainer = document.getElementById('artistColors');
    if (colorContainer && artist.styleHints?.colorPalette) {
      colorContainer.innerHTML = artist.styleHints.colorPalette.map(color =>
        `<span class="color-dot" style="background: ${color};" title="${color}"></span>`
      ).join('');
    }

    // 3. Show Controls
    const topControls = document.getElementById('topControls');
    if (topControls) topControls.classList.remove('hidden');

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

    // URL에서 모드/variant 복원
    const params = new URLSearchParams(window.location.search);
    const savedMode = parseInt(params.get('mode')) || 0;
    const savedVariant = parseInt(params.get('variant')) || 0;

    this.engine.setMode(savedMode, savedVariant);
    this.renderModeButtons();
    this.renderVariantButtons(savedMode);
    this.updateModeButtonsUI(savedMode);
    this.updateVariantButtonsUI(savedVariant);
  }

  animate() {
    this.frameCount++;

    if (this.engine) {
      this.engine.update();
      this.engine.draw();

      // 사운드 업데이트 (시각 데이터 전달)
      if (this.soundEnabled && this.soundInitialized) {
        const visualData = {
          intensity: this.engine.getIntensity?.() || 0.5,
          brightness: this.engine.getBrightness?.() || 0.5
        };
        soundEngine.update(this.frameCount, visualData);
      }
    }

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
