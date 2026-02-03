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

    // Artist navigation
    this.artistList = [];

    this.init();
  }

  async init() {
    await this.loadAvailableDates();
    await this.loadArtistList();
    await this.loadArtist();
    this.setupCanvas();
    this.setupEventListeners();
    this.setupDateControls();
    this.setupSoundControls();
    this.setupSwipeNavigation();
    this.hideLoading();
    this.showSwipeHintIfNeeded();
    this.restoreFullscreenState();
  }

  // URL 파라미터에서 fullscreen 상태 복원
  restoreFullscreenState() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('fullscreen') === '1') {
      // UI 숨김 상태로 복원
      const viewerContainer = document.querySelector('.viewer-container');
      if (viewerContainer) {
        viewerContainer.classList.remove('show-controls');
        this.controlsVisible = false;
        clearTimeout(this.hideControlsTimeout);
      }
    }
  }

  // 모바일에서 첫 방문시 스와이프 힌트 표시
  showSwipeHintIfNeeded() {
    // 모바일 기기 확인
    const isMobile = window.matchMedia('(max-width: 768px)').matches ||
                     ('ontouchstart' in window);

    if (!isMobile) return;

    // 이미 힌트를 본 적이 있는지 확인
    const hasSeenHint = localStorage.getItem('viewerSwipeHintSeen');
    if (hasSeenHint) return;

    const swipeHint = document.getElementById('swipeHint');
    if (!swipeHint) return;

    // 힌트 표시
    setTimeout(() => {
      swipeHint.classList.add('show');

      // 3초 후 자동 숨김
      setTimeout(() => {
        swipeHint.classList.remove('show');
        localStorage.setItem('viewerSwipeHintSeen', 'true');
      }, 3000);
    }, 1000);

    // 터치 시 즉시 숨김
    document.addEventListener('touchstart', () => {
      if (swipeHint.classList.contains('show')) {
        swipeHint.classList.remove('show');
        localStorage.setItem('viewerSwipeHintSeen', 'true');
      }
    }, { once: true });
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

    // 화면 탭으로 UI 토글 (컨트롤 영역 제외)
    document.getElementById('viewerContainer')?.addEventListener('click', (e) => {
      const isControl = e.target.closest('.controls, .back-btn, .top-controls, .sound-controls, .info-overlay a, button');
      if (!isControl) {
        this.toggleControls();
      }
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
    this.hideControlsTimeout = setTimeout(() => this.hideControls(), 5000);
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
      this.hideControlsTimeout = setTimeout(() => this.hideControls(), 5000);
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

  async loadArtistList() {
    try {
      const resp = await fetch(`data/artists.json?v=${Date.now()}`);
      if (resp.ok) {
        const data = await resp.json();
        this.artistList = data.artists.map(a => a.id);
      }
    } catch (e) {
      console.warn('Failed to load artist list:', e);
      this.artistList = [];
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
    // UI 숨김 상태 유지
    if (!this.controlsVisible) {
      params.set('fullscreen', '1');
    } else {
      params.delete('fullscreen');
    }
    window.location.search = params.toString();
  }

  navigateToNextDate() {
    const currentIndex = this.availableDates.indexOf(this.targetDate);
    if (currentIndex < this.availableDates.length - 1) {
      this.navigateToDate(this.availableDates[currentIndex + 1]);
    }
  }

  navigateToPrevDate() {
    const currentIndex = this.availableDates.indexOf(this.targetDate);
    if (currentIndex > 0) {
      this.navigateToDate(this.availableDates[currentIndex - 1]);
    }
  }

  navigateToArtist(artistId) {
    const params = new URLSearchParams(window.location.search);
    params.set('artist', artistId);
    // 현재 날짜와 모드 유지
    if (this.engine) {
      params.set('mode', this.engine.getCurrentMode());
      params.set('variant', this.engine.getCurrentVariant());
    }
    // UI 숨김 상태 유지
    if (!this.controlsVisible) {
      params.set('fullscreen', '1');
    } else {
      params.delete('fullscreen');
    }
    window.location.search = params.toString();
  }

  navigateToNextArtist() {
    const currentIndex = this.artistList.indexOf(this.artistId);
    if (currentIndex < this.artistList.length - 1) {
      this.navigateToArtist(this.artistList[currentIndex + 1]);
    }
  }

  navigateToPrevArtist() {
    const currentIndex = this.artistList.indexOf(this.artistId);
    if (currentIndex > 0) {
      this.navigateToArtist(this.artistList[currentIndex - 1]);
    }
  }

  // 경계 체크 메소드
  canNavigateNextArtist() {
    const currentIndex = this.artistList.indexOf(this.artistId);
    return currentIndex < this.artistList.length - 1;
  }

  canNavigatePrevArtist() {
    const currentIndex = this.artistList.indexOf(this.artistId);
    return currentIndex > 0;
  }

  canNavigateNextDate() {
    const currentIndex = this.availableDates.indexOf(this.targetDate);
    return currentIndex < this.availableDates.length - 1;
  }

  canNavigatePrevDate() {
    const currentIndex = this.availableDates.indexOf(this.targetDate);
    return currentIndex > 0;
  }

  setupSwipeNavigation() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;

    document.addEventListener('touchstart', (e) => {
      // 버튼/컨트롤 영역만 제외, info-overlay에서는 스와이프 허용
      if (e.target.closest('.controls, .top-controls, .sound-controls, .back-btn')) {
        return;
      }
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      // 버튼/컨트롤 영역만 제외, info-overlay에서는 스와이프 허용
      if (e.target.closest('.controls, .top-controls, .sound-controls, .back-btn')) {
        return;
      }

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const swipeTime = Date.now() - touchStartTime;

      if (swipeTime > maxSwipeTime) return;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        // 좌우 스와이프 → 날짜 변경 (경계 체크)
        if (deltaX > 0 && this.canNavigatePrevDate()) {
          this.navigateWithTransition(() => this.navigateToPrevDate(), 'right');
        } else if (deltaX < 0 && this.canNavigateNextDate()) {
          this.navigateWithTransition(() => this.navigateToNextDate(), 'left');
        }
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
        // 상하 스와이프 → 작가 변경 (경계 체크)
        if (deltaY > 0 && this.canNavigatePrevArtist()) {
          this.navigateWithTransition(() => this.navigateToPrevArtist(), 'down');
        } else if (deltaY < 0 && this.canNavigateNextArtist()) {
          this.navigateWithTransition(() => this.navigateToNextArtist(), 'up');
        }
      }
    }, { passive: true });
  }

  // 전환 애니메이션과 함께 네비게이션
  navigateWithTransition(navigateCallback, direction) {
    const overlay = document.getElementById('transitionOverlay');
    const wrapper = document.querySelector('.artwork-wrapper');

    if (!overlay || !wrapper) {
      navigateCallback();
      return;
    }

    // 슬라이드 아웃 애니메이션 적용
    wrapper.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
    wrapper.style.opacity = '0';

    const slideDistance = '30px';
    switch (direction) {
      case 'left':
        wrapper.style.transform = `translateX(-${slideDistance})`;
        break;
      case 'right':
        wrapper.style.transform = `translateX(${slideDistance})`;
        break;
      case 'up':
        wrapper.style.transform = `translateY(-${slideDistance})`;
        break;
      case 'down':
        wrapper.style.transform = `translateY(${slideDistance})`;
        break;
    }

    // 페이드 아웃 후 네비게이션
    overlay.classList.add('active');

    setTimeout(() => {
      navigateCallback();
    }, 250);
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

    const currentMode = this.engine.getCurrentMode();
    const skills = this.engine.getSkills();
    container.innerHTML = skills.map((skill, i) =>
      `<button class="mode-btn${i === currentMode ? ' active' : ''}" data-mode="${i}" title="${skill.nameKo || skill.name}">${skill.name}</button>`
    ).join('');

    // 현재 모드의 variants 표시
    this.renderVariantButtons(currentMode);
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

    // URL에서 모드/variant 복원 (명시적으로 지정된 경우에만)
    const params = new URLSearchParams(window.location.search);
    const hasModeParam = params.has('mode');
    const hasVariantParam = params.has('variant');

    // URL에 파라미터가 있으면 적용, 없으면 엔진 기본값 유지
    const currentMode = hasModeParam ? parseInt(params.get('mode')) : this.engine.getCurrentMode();
    const currentVariant = hasVariantParam ? parseInt(params.get('variant')) : this.engine.getCurrentVariant();

    if (hasModeParam || hasVariantParam) {
      this.engine.setMode(currentMode, currentVariant);
    }

    this.renderModeButtons();
    this.renderVariantButtons(currentMode);
    this.updateModeButtonsUI(currentMode);
    this.updateVariantButtonsUI(currentVariant);
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
