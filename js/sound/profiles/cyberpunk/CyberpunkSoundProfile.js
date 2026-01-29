/**
 * CyberpunkSoundProfile - NEON-V 작가용 사운드 프로파일
 * 테마: Cyberpunk
 * 특성: 신스 톱니파, 딜레이, 플랜저 효과
 */
import { BaseSoundProfile } from '../../core/BaseSoundProfile.js';

export class CyberpunkSoundProfile extends BaseSoundProfile {
  constructor(artistId, config) {
    super(artistId, {
      baseFrequency: 330,
      waveform: 'sawtooth',
      ...config
    });

    this.oscillators = [];
    this.gains = [];
    this.delay = null;
    this.flangerLFO = null;
    this.flangerDelay = null;
    this.filter = null;
  }

  async setupSound() {
    const rootFreq = this.config.baseFrequency;

    // 신스 스택 (유니즌 디튠)
    const detuneAmounts = [-10, 0, 10, 7, -7];

    for (let i = 0; i < detuneAmounts.length; i++) {
      const osc = this.createOscillator(rootFreq, 'sawtooth');
      osc.detune.value = detuneAmounts[i];
      const gain = this.createGain(0);
      osc.connect(gain);
      this.oscillators.push(osc);
      this.gains.push(gain);
    }

    // 플랜저 (LFO + 짧은 딜레이)
    this.flangerLFO = this.createOscillator(0.3, 'sine');
    const flangerLFOGain = this.createGain(0.003);
    this.flangerDelay = this.createDelay(0.005);

    this.flangerLFO.connect(flangerLFOGain);
    flangerLFOGain.connect(this.flangerDelay.delayTime);

    // 메인 딜레이 (에코)
    this.delay = this.createDelay(0.25);
    const delayFeedback = this.createGain(0.5);
    this.delay.connect(delayFeedback);
    delayFeedback.connect(this.delay);

    // 하이패스 필터
    this.filter = this.createFilter('highpass', 200, 1);

    // 출력
    this.outputGain = this.createGain(0.2);
    const dryGain = this.createGain(0.6);
    const wetGain = this.createGain(0.4);

    // 연결
    for (const gain of this.gains) {
      gain.connect(this.filter);
    }

    this.filter.connect(this.flangerDelay);
    this.flangerDelay.connect(dryGain);
    this.flangerDelay.connect(this.delay);
    this.delay.connect(wetGain);

    dryGain.connect(this.outputGain);
    wetGain.connect(this.outputGain);
    this.outputGain.connect(this.masterGain);
  }

  onStart() {
    const now = this.audioContext.currentTime;

    for (const osc of this.oscillators) {
      osc.start(now);
    }
    this.flangerLFO.start(now);

    // 펄스 같은 어택
    for (const gain of this.gains) {
      gain.gain.setTargetAtTime(0.06, now, 0.08);
    }

    console.log(`[${this.artistId}] CyberpunkSoundProfile started`);
  }

  onStop() {
    const now = this.audioContext.currentTime;
    for (const gain of this.gains) {
      gain.gain.setTargetAtTime(0, now, 0.2);
    }
  }

  update(frame, visualData = {}) {
    if (!this.isPlaying || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const intensity = visualData.intensity || (Math.sin(frame * 0.03) * 0.5 + 0.5);

    // 플랜저 속도
    const flangerRate = 0.2 + intensity * 2;
    this.flangerLFO.frequency.setTargetAtTime(flangerRate, now, 0.1);

    // 필터 변조 (와우 효과)
    const filterFreq = 150 + intensity * 500 + Math.sin(frame * 0.05) * 100;
    this.filter.frequency.setTargetAtTime(filterFreq, now, 0.05);

    // 딜레이 타임 (템포 느낌)
    const delayTime = 0.15 + (1 - intensity) * 0.2;
    this.delay.delayTime.setTargetAtTime(delayTime, now, 0.1);

    // 볼륨
    const volume = 0.15 + intensity * 0.1;
    this.outputGain.gain.setTargetAtTime(volume, now, 0.1);
  }

  onModeChange(modeIndex, variantIndex) {
    super.onModeChange(modeIndex, variantIndex);
    if (!this.audioContext || !this.isPlaying) return;

    const now = this.audioContext.currentTime;

    // 모드별 주파수 (네온 사인 글리치)
    const modeRoots = [330, 392, 294, 349, 262, 440, 247];
    const rootFreq = modeRoots[modeIndex] || this.config.baseFrequency;

    for (const osc of this.oscillators) {
      osc.frequency.setTargetAtTime(rootFreq, now, 0.15);
    }

    // 변형별 디튠 스프레드
    const spreads = [[0, 5, -5, 3, -3], [-15, 0, 15, 10, -10], [-25, -12, 0, 12, 25]];
    const detunes = spreads[variantIndex % 3];

    for (let i = 0; i < this.oscillators.length; i++) {
      this.oscillators[i].detune.setTargetAtTime(detunes[i], now, 0.2);
    }

    console.log(`[${this.artistId}] Mode: ${modeIndex}, Freq: ${rootFreq}Hz`);
  }
}
