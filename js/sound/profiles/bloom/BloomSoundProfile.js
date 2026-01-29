/**
 * BloomSoundProfile - FLORA-9 작가용 사운드 프로파일
 * 테마: Bloom (꽃, 자연)
 * 특성: 부드러운 삼각파, 리버브, 쉬머 효과
 */
import { BaseSoundProfile } from '../../core/BaseSoundProfile.js';

export class BloomSoundProfile extends BaseSoundProfile {
  constructor(artistId, config) {
    super(artistId, {
      baseFrequency: 440,
      waveform: 'triangle',
      ...config
    });

    this.oscillators = [];
    this.gains = [];
    this.reverb = null;
    this.shimmerDelay = null;
    this.shimmerPitch = null;
  }

  async setupSound() {
    const rootFreq = this.config.baseFrequency;

    // 꽃잎처럼 펼쳐지는 하모닉스 (메이저 코드 + 7th)
    const ratios = [1, 1.25, 1.5, 1.875]; // 루트, 장3도, 완전5도, 장7도

    for (let i = 0; i < ratios.length; i++) {
      const osc = this.createOscillator(rootFreq * ratios[i], 'triangle');
      const gain = this.createGain(0);
      osc.connect(gain);
      this.oscillators.push(osc);
      this.gains.push(gain);
    }

    // 쉬머 효과 (딜레이 + 옥타브 위)
    this.shimmerDelay = this.createDelay(0.1);
    const shimmerFeedback = this.createGain(0.3);
    this.shimmerDelay.connect(shimmerFeedback);
    shimmerFeedback.connect(this.shimmerDelay);

    // 쉬머용 고역 오실레이터
    this.shimmerOsc = this.createOscillator(rootFreq * 2, 'sine');
    this.shimmerGain = this.createGain(0);

    // 긴 리버브 (공간감)
    this.reverb = await this.createReverb(4, 3);

    // 출력
    this.outputGain = this.createGain(0.2);
    const dryGain = this.createGain(0.4);
    const wetGain = this.createGain(0.6);

    // 연결
    for (const gain of this.gains) {
      gain.connect(dryGain);
      gain.connect(this.shimmerDelay);
    }

    this.shimmerOsc.connect(this.shimmerGain);
    this.shimmerGain.connect(this.shimmerDelay);

    this.shimmerDelay.connect(this.reverb);
    this.reverb.connect(wetGain);

    dryGain.connect(this.outputGain);
    wetGain.connect(this.outputGain);
    this.outputGain.connect(this.masterGain);
  }

  onStart() {
    const now = this.audioContext.currentTime;

    for (const osc of this.oscillators) {
      osc.start(now);
    }
    this.shimmerOsc.start(now);

    // 꽃이 피듯 천천히 페이드인
    const amps = [0.12, 0.08, 0.06, 0.04];
    for (let i = 0; i < this.gains.length; i++) {
      this.gains[i].gain.setTargetAtTime(amps[i], now + i * 0.3, 0.8);
    }

    // 쉬머 천천히
    this.shimmerGain.gain.setTargetAtTime(0.02, now + 1, 1);

    console.log(`[${this.artistId}] BloomSoundProfile started`);
  }

  onStop() {
    const now = this.audioContext.currentTime;
    for (const gain of this.gains) {
      gain.gain.setTargetAtTime(0, now, 0.8);
    }
    this.shimmerGain.gain.setTargetAtTime(0, now, 0.5);
  }

  update(frame, visualData = {}) {
    if (!this.isPlaying || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const intensity = visualData.intensity || Math.sin(frame * 0.005) * 0.5 + 0.5;

    // 부드러운 디튠 (바람에 흔들리는 느낌)
    const sway = Math.sin(frame * 0.01) * 8 + Math.sin(frame * 0.007) * 4;
    for (const osc of this.oscillators) {
      osc.detune.setTargetAtTime(sway, now, 0.3);
    }

    // 쉬머 강도
    const shimmerAmp = 0.01 + intensity * 0.03;
    this.shimmerGain.gain.setTargetAtTime(shimmerAmp, now, 0.2);

    // 전체 볼륨
    const volume = 0.15 + intensity * 0.1;
    this.outputGain.gain.setTargetAtTime(volume, now, 0.3);
  }

  onModeChange(modeIndex, variantIndex) {
    super.onModeChange(modeIndex, variantIndex);
    if (!this.audioContext || !this.isPlaying) return;

    const now = this.audioContext.currentTime;

    // 모드별 주파수 (꽃의 종류)
    const modeRoots = [440, 392, 494, 349, 523, 330, 587];
    const rootFreq = modeRoots[modeIndex] || this.config.baseFrequency;

    const ratios = [1, 1.25, 1.5, 1.875];
    for (let i = 0; i < this.oscillators.length; i++) {
      this.oscillators[i].frequency.setTargetAtTime(rootFreq * ratios[i], now, 1);
    }

    // 쉬머 옥타브
    this.shimmerOsc.frequency.setTargetAtTime(rootFreq * 2, now, 0.5);

    console.log(`[${this.artistId}] Mode: ${modeIndex}, Root: ${rootFreq}Hz`);
  }
}
