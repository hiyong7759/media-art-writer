/**
 * RefractionSoundProfile - PRISM-2 작가용 사운드 프로파일
 * 테마: Refraction (빛의 굴절, 프리즘)
 * 특성: 밝은 삼각파, 페이저, 쉬머 효과
 */
import { BaseSoundProfile } from '../../core/BaseSoundProfile.js';

export class RefractionSoundProfile extends BaseSoundProfile {
  constructor(artistId, config) {
    super(artistId, {
      baseFrequency: 880,
      waveform: 'triangle',
      ...config
    });

    this.oscillators = [];
    this.gains = [];
    this.phaserLFO = null;
    this.allpassFilters = [];
    this.shimmerDelay = null;
    this.reverb = null;
  }

  async setupSound() {
    const rootFreq = this.config.baseFrequency;

    // 프리즘처럼 분산되는 주파수 (무지개 스펙트럼)
    const spectrum = [1, 1.122, 1.26, 1.414, 1.587, 1.782, 2]; // 등비급수

    for (let i = 0; i < spectrum.length; i++) {
      const osc = this.createOscillator(rootFreq * spectrum[i], 'triangle');
      const gain = this.createGain(0);
      osc.connect(gain);
      this.oscillators.push(osc);
      this.gains.push(gain);
    }

    // 페이저 (빛의 간섭)
    this.phaserLFO = this.createOscillator(0.5, 'sine');
    this.phaserLFOGain = this.createGain(1000);

    const phaserFreqs = [300, 600, 1200, 2400];
    for (const freq of phaserFreqs) {
      const allpass = this.createFilter('allpass', freq, 1);
      this.allpassFilters.push(allpass);
    }

    this.phaserLFO.connect(this.phaserLFOGain);
    for (const allpass of this.allpassFilters) {
      this.phaserLFOGain.connect(allpass.frequency);
    }

    // 쉬머 딜레이
    this.shimmerDelay = this.createDelay(0.08);
    const shimmerFeedback = this.createGain(0.4);
    this.shimmerDelay.connect(shimmerFeedback);
    shimmerFeedback.connect(this.shimmerDelay);

    // 밝은 리버브
    this.reverb = await this.createReverb(3, 2.5);

    // 하이패스 (밝은 느낌)
    this.highpass = this.createFilter('highpass', 400, 0.5);

    // 출력
    this.outputGain = this.createGain(0.15);
    const dryGain = this.createGain(0.3);
    const wetGain = this.createGain(0.7);

    // 연결
    const mixBus = this.createGain(1);
    for (const gain of this.gains) {
      gain.connect(mixBus);
    }

    // 믹스 -> 페이저 체인
    mixBus.connect(this.allpassFilters[0]);
    for (let i = 0; i < this.allpassFilters.length - 1; i++) {
      this.allpassFilters[i].connect(this.allpassFilters[i + 1]);
    }
    const phaserOut = this.allpassFilters[this.allpassFilters.length - 1];

    phaserOut.connect(this.highpass);
    this.highpass.connect(dryGain);
    this.highpass.connect(this.shimmerDelay);

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
    this.phaserLFO.start(now);

    // 무지개처럼 펼쳐지는 페이드인
    const baseAmp = 0.04;
    for (let i = 0; i < this.gains.length; i++) {
      const amp = baseAmp * (1 - i * 0.1);
      this.gains[i].gain.setTargetAtTime(amp, now + i * 0.15, 0.3);
    }

    console.log(`[${this.artistId}] RefractionSoundProfile started`);
  }

  onStop() {
    const now = this.audioContext.currentTime;
    for (const gain of this.gains) {
      gain.gain.setTargetAtTime(0, now, 0.4);
    }
  }

  update(frame, visualData = {}) {
    if (!this.isPlaying || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const intensity = visualData.intensity || Math.sin(frame * 0.015) * 0.5 + 0.5;

    // 스펙트럼 흔들림
    const shimmer = Math.sin(frame * 0.03) * 20;
    for (let i = 0; i < this.oscillators.length; i++) {
      const detune = shimmer * (i + 1) * 0.5;
      this.oscillators[i].detune.setTargetAtTime(detune, now, 0.1);
    }

    // 페이저 속도 (빛의 떨림)
    const phaserRate = 0.3 + intensity * 1.5;
    this.phaserLFO.frequency.setTargetAtTime(phaserRate, now, 0.1);

    // 하이패스 주파수
    const hpFreq = 300 + intensity * 400;
    this.highpass.frequency.setTargetAtTime(hpFreq, now, 0.1);

    // 볼륨
    const volume = 0.1 + intensity * 0.08;
    this.outputGain.gain.setTargetAtTime(volume, now, 0.15);
  }

  onModeChange(modeIndex, variantIndex) {
    super.onModeChange(modeIndex, variantIndex);
    if (!this.audioContext || !this.isPlaying) return;

    const now = this.audioContext.currentTime;

    // 모드별 주파수 (빛의 스펙트럼)
    const modeRoots = [880, 784, 988, 698, 1047, 659, 1175];
    const rootFreq = modeRoots[modeIndex] || this.config.baseFrequency;

    const spectrum = [1, 1.122, 1.26, 1.414, 1.587, 1.782, 2];
    for (let i = 0; i < this.oscillators.length; i++) {
      this.oscillators[i].frequency.setTargetAtTime(rootFreq * spectrum[i], now, 0.4);
    }

    console.log(`[${this.artistId}] Mode: ${modeIndex}, Root: ${rootFreq}Hz`);
  }
}
