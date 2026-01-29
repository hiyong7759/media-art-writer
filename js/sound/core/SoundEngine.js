/**
 * SoundEngine - Web Audio API 관리 및 마스터 볼륨 제어
 * 브라우저 오디오 정책을 준수하여 사용자 인터랙션 후 활성화
 */
export class SoundEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.volume = 0.5;
    this.currentProfile = null;
  }

  /**
   * AudioContext 초기화 (사용자 인터랙션 후 호출 필수)
   */
  async init() {
    if (this.isInitialized) return true;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;

      // suspended 상태면 resume
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      console.log('[SoundEngine] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[SoundEngine] Initialization failed:', error);
      return false;
    }
  }

  /**
   * AudioContext resume (suspended 상태 해제)
   */
  async resume() {
    if (!this.audioContext) return false;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('[SoundEngine] Resumed');
    }
    return this.audioContext.state === 'running';
  }

  /**
   * 볼륨 설정 (0.0 ~ 1.0)
   */
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 0.1);
    }
  }

  /**
   * 음소거 토글
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      const targetVolume = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetVolume, this.audioContext.currentTime, 0.1);
    }
    return this.isMuted;
  }

  /**
   * 음소거 상태 설정
   */
  setMute(muted) {
    this.isMuted = muted;
    if (this.masterGain) {
      const targetVolume = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetVolume, this.audioContext.currentTime, 0.1);
    }
  }

  /**
   * 현재 프로파일 설정 및 시작
   */
  async setProfile(profile) {
    // 이전 프로파일 정리
    if (this.currentProfile) {
      this.currentProfile.cleanup();
    }

    this.currentProfile = profile;

    if (profile && this.isInitialized) {
      await profile.init(this.audioContext, this.masterGain);
      profile.start();
    }
  }

  /**
   * 프로파일 설정만 (시작하지 않음)
   */
  async setProfileWithoutStart(profile) {
    // 이전 프로파일 정리
    if (this.currentProfile) {
      this.currentProfile.cleanup();
    }

    this.currentProfile = profile;

    if (profile && this.isInitialized) {
      await profile.init(this.audioContext, this.masterGain);
      // start() 호출하지 않음
    }
  }

  /**
   * 현재 프로파일 시작
   */
  startProfile() {
    if (this.currentProfile && !this.currentProfile.isPlaying) {
      this.currentProfile.start();
    }
  }

  /**
   * 프로파일 업데이트 (애니메이션 프레임에서 호출)
   */
  update(frame, visualData) {
    if (this.currentProfile && this.isInitialized) {
      this.currentProfile.update(frame, visualData);
    }
  }

  /**
   * 모드/변형 변경 시 호출
   */
  onModeChange(modeIndex, variantIndex) {
    if (this.currentProfile) {
      this.currentProfile.onModeChange(modeIndex, variantIndex);
    }
  }

  /**
   * 정리 (페이지 언로드 시)
   */
  cleanup() {
    if (this.currentProfile) {
      this.currentProfile.cleanup();
      this.currentProfile = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isInitialized = false;
    console.log('[SoundEngine] Cleaned up');
  }

  /**
   * 상태 정보 반환
   */
  getState() {
    return {
      initialized: this.isInitialized,
      muted: this.isMuted,
      volume: this.volume,
      contextState: this.audioContext?.state || 'closed',
      hasProfile: !!this.currentProfile
    };
  }
}

// 싱글톤 인스턴스
export const soundEngine = new SoundEngine();
