/**
 * FlowSoundProfile - AQUA-5 작가용 사운드 프로파일
 * 테마: Flow (물, 유체)
 * 특성: 유동적인 사인파, 코러스, 페이저 효과
 */
import { BaseSoundProfile } from '../../core/BaseSoundProfile.js';

export class FlowSoundProfile extends BaseSoundProfile {
  constructor(artistId, config) {
    super(artistId, {
      baseFrequency: 220,
      waveform: 'sine',
      ...config
    });

    this.oscillators = [];
    this.gains = [];
    this.chorusLFO = null;
    this.chorusDelay = null;
    this.phaserLFO = null;
    this.allpassFilters = [];
  }

  async setupSound() {
    const rootFreq = this.config.baseFrequency;

    // 물방울처럼 퍼지는 화음
    const ratios = [1, 1.2, 1.5, 2];

    for (const ratio of ratios) {
      const osc = this.createOscillator(rootFreq * ratio, 'sine');
      const gain = this.createGain(0);
      osc.connect(gain);
      this.oscillators.push(osc);
      this.gains.push(gain);
    }

    // 코러스
    this.chorusLFO = this.createOscillator(0.5, 'sine');
    this.chorusLFOGain = this.createGain(0.003);
    this.chorusDelay = this.createDelay(0.02);

    this.chorusLFO.connect(this.chorusLFOGain);
    this.chorusLFOGain.connect(this.chorusDelay.delayTime);

    // 페이저 (올패스 필터 체인)
    this.phaserLFO = this.createOscillator(0.3, 'sine');
    this.phaserLFOGain = this.createGain(500);

    const phaserFrequencies = [200, 400, 800, 1600];
    for (const freq of phaserFrequencies) {
      const allpass = this.createFilter('allpass', freq, 1);
      this.allpassFilters.push(allpass);
    }

    this.phaserLFO.connect(this.phaserLFOGain);
    for (const allpass of this.allpassFilters) {
      this.phaserLFOGain.connect(allpass.frequency);
    }

    // 리버브
    this.reverb = await this.createReverb(3, 2);

    // 출력
    this.outputGain = this.createGain(0.2);
    const dryGain = this.createGain(0.4);
    const wetGain = this.createGain(0.6);

    // 연결
    let lastNode = null;
    for (const gain of this.gains) {
      gain.connect(this.chorusDelay);
    }

    // 코러스 -> 페이저 체인
    this.chorusDelay.connect(this.allpassFilters[0]);
    for (let i = 0; i < this.allpassFilters.length - 1; i++) {
      this.allpassFilters[i].connect(this.allpassFilters[i + 1]);
    }
    lastNode = this.allpassFilters[this.allpassFilters.length - 1];

    lastNode.connect(dryGain);
    lastNode.connect(this.reverb);
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
    this.chorusLFO.start(now);
    this.phaserLFO.start(now);

    // 물이 차오르듯
    const amps = [0.1, 0.08, 0.06, 0.04];
    for (let i = 0; i < this.gains.length; i++) {
      this.gains[i].gain.setTargetAtTime(amps[i], now, 0.8 + i * 0.2);
    }

    console.log(`[${this.artistId}] FlowSoundProfile started`);
  }

  onStop() {
    const now = this.audioContext.currentTime;
    for (const gain of this.gains) {
      gain.gain.setTargetAtTime(0, now, 0.5);
    }
  }

  update(frame, visualData = {}) {
    if (!this.isPlaying || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const intensity = visualData.intensity || Math.sin(frame * 0.01) * 0.5 + 0.5;

    // 물결치는 디튠
    const wave = Math.sin(frame * 0.02) * 15 + Math.sin(frame * 0.013) * 8;
    for (const osc of this.oscillators) {
      osc.detune.setTargetAtTime(wave, now, 0.1);
    }

    // 코러스 속도
    const chorusRate = 0.3 + intensity * 0.8;
    this.chorusLFO.frequency.setTargetAtTime(chorusRate, now, 0.2);

    // 페이저 속도
    const phaserRate = 0.1 + intensity * 0.5;
    this.phaserLFO.frequency.setTargetAtTime(phaserRate, now, 0.2);

    // 볼륨
    const volume = 0.15 + intensity * 0.1;
    this.outputGain.gain.setTargetAtTime(volume, now, 0.2);
  }

  onModeChange(modeIndex, variantIndex) {
    super.onModeChange(modeIndex, variantIndex);
    if (!this.audioContext || !this.isPlaying) return;

    const now = this.audioContext.currentTime;

    // 모드별 주파수 (물의 상태)
    const modeRoots = [220, 196, 247, 175, 262, 165, 294];
    const rootFreq = modeRoots[modeIndex] || this.config.baseFrequency;

    const ratios = [1, 1.2, 1.5, 2];
    for (let i = 0; i < this.oscillators.length; i++) {
      this.oscillators[i].frequency.setTargetAtTime(rootFreq * ratios[i], now, 0.6);
    }

    console.log(`[${this.artistId}] Mode: ${modeIndex}, Root: ${rootFreq}Hz`);
  }
}
