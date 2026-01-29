/**
 * GeometricSoundProfile - KURO-X 작가용 사운드 프로파일
 * 테마: Geometric
 * 특성: 거친 사각파, 디스토션, 비트크러셔 효과
 */
import { BaseSoundProfile } from '../../core/BaseSoundProfile.js';

export class GeometricSoundProfile extends BaseSoundProfile {
  constructor(artistId, config) {
    super(artistId, {
      baseFrequency: 110,
      waveform: 'square',
      ...config
    });

    this.oscillators = [];
    this.gains = [];
    this.distortion = null;
    this.filter = null;
  }

  async setupSound() {
    const rootFreq = this.config.baseFrequency;

    // 기하학적 간격 (완전 5도, 옥타브)
    const intervals = [1, 1.5, 2, 3];

    for (let i = 0; i < intervals.length; i++) {
      const osc = this.createOscillator(rootFreq * intervals[i], 'square');
      const gain = this.createGain(0);
      osc.connect(gain);
      this.oscillators.push(osc);
      this.gains.push(gain);
    }

    // 웨이브쉐이퍼 (디스토션)
    this.distortion = this.audioContext.createWaveShaper();
    this.distortion.curve = this.makeDistortionCurve(50);
    this.distortion.oversample = '4x';
    this.nodes.push(this.distortion);

    // 로우패스 필터 (날카로움 조절)
    this.filter = this.createFilter('lowpass', 2000, 2);

    // 출력
    this.outputGain = this.createGain(0.15);

    // 연결
    for (const gain of this.gains) {
      gain.connect(this.distortion);
    }

    this.distortion.connect(this.filter);
    this.filter.connect(this.outputGain);
    this.outputGain.connect(this.masterGain);
  }

  makeDistortionCurve(amount) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }

    return curve;
  }

  onStart() {
    const now = this.audioContext.currentTime;

    for (const osc of this.oscillators) {
      osc.start(now);
    }

    // 급격한 어택
    for (let i = 0; i < this.gains.length; i++) {
      const amp = 0.1 / (i + 1);
      this.gains[i].gain.setTargetAtTime(amp, now, 0.05);
    }

    console.log(`[${this.artistId}] GeometricSoundProfile started`);
  }

  onStop() {
    const now = this.audioContext.currentTime;
    for (const gain of this.gains) {
      gain.gain.setTargetAtTime(0, now, 0.1);
    }
  }

  update(frame, visualData = {}) {
    if (!this.isPlaying || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const intensity = visualData.intensity || Math.abs(Math.sin(frame * 0.05));

    // 필터 컷오프 변조
    const cutoff = 500 + intensity * 3000;
    this.filter.frequency.setTargetAtTime(cutoff, now, 0.05);

    // 스텝 디튠 (기계적 느낌)
    const stepDetune = Math.floor(intensity * 8) * 12.5; // 반음 단위
    for (const osc of this.oscillators) {
      osc.detune.setTargetAtTime(stepDetune, now, 0.02);
    }

    // 볼륨
    const volume = 0.1 + intensity * 0.08;
    this.outputGain.gain.setTargetAtTime(volume, now, 0.05);
  }

  onModeChange(modeIndex, variantIndex) {
    super.onModeChange(modeIndex, variantIndex);
    if (!this.audioContext || !this.isPlaying) return;

    const now = this.audioContext.currentTime;

    // 모드별 기본 주파수 (기하학적 비율)
    const modeRoots = [110, 82.5, 146.8, 98, 130.8, 73.4, 164.8];
    const rootFreq = modeRoots[modeIndex] || this.config.baseFrequency;

    // 변형별 웨이브폼
    const waveforms = ['square', 'sawtooth', 'triangle'];
    const waveform = waveforms[variantIndex % 3];

    const intervals = [1, 1.5, 2, 3];
    for (let i = 0; i < this.oscillators.length; i++) {
      this.oscillators[i].frequency.setTargetAtTime(rootFreq * intervals[i], now, 0.1);
      this.oscillators[i].type = waveform;
    }

    console.log(`[${this.artistId}] Mode: ${modeIndex}, Waveform: ${waveform}`);
  }
}
