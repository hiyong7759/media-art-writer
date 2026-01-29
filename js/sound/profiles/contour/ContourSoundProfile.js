/**
 * ContourSoundProfile - TERRA-1 작가용 사운드 프로파일
 * 테마: Contour (지형, 등고선)
 * 특성: 흙빛 톱니파, 필터 스윕, 리버브
 */
import { BaseSoundProfile } from '../../core/BaseSoundProfile.js';

export class ContourSoundProfile extends BaseSoundProfile {
  constructor(artistId, config) {
    super(artistId, {
      baseFrequency: 165,
      waveform: 'sawtooth',
      ...config
    });

    this.oscillators = [];
    this.gains = [];
    this.filter = null;
    this.filterLFO = null;
    this.reverb = null;
  }

  async setupSound() {
    const rootFreq = this.config.baseFrequency;

    // 지층처럼 쌓인 옥타브
    const octaves = [0.5, 1, 2];

    for (const mult of octaves) {
      const osc = this.createOscillator(rootFreq * mult, 'sawtooth');
      const gain = this.createGain(0);
      osc.connect(gain);
      this.oscillators.push(osc);
      this.gains.push(gain);
    }

    // 필터 LFO (지형의 굴곡)
    this.filterLFO = this.createOscillator(0.1, 'sine');
    this.filterLFOGain = this.createGain(500);

    // 레조넌트 필터 (지형적 특성)
    this.filter = this.createFilter('lowpass', 800, 3);

    this.filterLFO.connect(this.filterLFOGain);
    this.filterLFOGain.connect(this.filter.frequency);

    // 리버브 (자연 공간)
    this.reverb = await this.createReverb(2.5, 2);

    // 출력
    this.outputGain = this.createGain(0.2);
    const dryGain = this.createGain(0.5);
    const wetGain = this.createGain(0.5);

    // 연결
    for (const gain of this.gains) {
      gain.connect(this.filter);
    }

    this.filter.connect(dryGain);
    this.filter.connect(this.reverb);
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
    this.filterLFO.start(now);

    // 지층이 드러나듯
    const amps = [0.08, 0.12, 0.06];
    for (let i = 0; i < this.gains.length; i++) {
      this.gains[i].gain.setTargetAtTime(amps[i], now + i * 0.5, 0.5);
    }

    console.log(`[${this.artistId}] ContourSoundProfile started`);
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
    const intensity = visualData.intensity || Math.sin(frame * 0.008) * 0.5 + 0.5;

    // 필터 LFO 속도 (지형의 복잡도)
    const lfoRate = 0.05 + intensity * 0.2;
    this.filterLFO.frequency.setTargetAtTime(lfoRate, now, 0.2);

    // 필터 베이스 주파수
    const baseFreq = 400 + intensity * 1200;
    this.filter.frequency.setTargetAtTime(baseFreq, now, 0.3);

    // 레조넌스 (능선의 날카로움)
    const resonance = 1 + intensity * 5;
    this.filter.Q.setTargetAtTime(resonance, now, 0.2);

    // 볼륨
    const volume = 0.15 + intensity * 0.1;
    this.outputGain.gain.setTargetAtTime(volume, now, 0.3);
  }

  onModeChange(modeIndex, variantIndex) {
    super.onModeChange(modeIndex, variantIndex);
    if (!this.audioContext || !this.isPlaying) return;

    const now = this.audioContext.currentTime;

    // 모드별 주파수 (지형 특성)
    const modeRoots = [165, 147, 185, 131, 196, 110, 220];
    const rootFreq = modeRoots[modeIndex] || this.config.baseFrequency;

    const octaves = [0.5, 1, 2];
    for (let i = 0; i < this.oscillators.length; i++) {
      this.oscillators[i].frequency.setTargetAtTime(rootFreq * octaves[i], now, 0.5);
    }

    // 변형별 웨이브폼
    const waveforms = ['sawtooth', 'triangle', 'square'];
    const waveform = waveforms[variantIndex % 3];
    for (const osc of this.oscillators) {
      osc.type = waveform;
    }

    console.log(`[${this.artistId}] Mode: ${modeIndex}, Root: ${rootFreq}Hz`);
  }
}
