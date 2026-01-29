/**
 * WaveSoundProfile - ECHO-0 작가용 사운드 프로파일
 * 테마: Wave (사운드 시각화)
 * 특성: 순수한 사인파 기반, 딜레이/리버브 효과
 */
import { BaseSoundProfile } from '../../core/BaseSoundProfile.js';

export class WaveSoundProfile extends BaseSoundProfile {
  constructor(artistId, config) {
    super(artistId, {
      baseFrequency: 440,
      waveform: 'sine',
      ...config
    });

    // 모드별 주파수 설정
    this.modeFrequencies = {
      0: 440,   // WAVE - A4
      1: 523,   // EQ - C5
      2: 392,   // NOISE - G4
      3: 329,   // STRING - E4
      4: 261,   // VOICE - C4
      5: 220,   // SILENCE - A3
      6: 349    // PULSE - F4
    };

    // 모드별 스케일
    this.modeScales = {
      0: 'pentatonic',
      1: 'chromatic',
      2: 'wholetone',
      3: 'major',
      4: 'dorian',
      5: 'minor',
      6: 'lydian'
    };

    this.oscillators = [];
    this.gains = [];
    this.delay = null;
    this.reverb = null;
    this.lfo = null;
    this.lfoGain = null;
  }

  async setupSound() {
    // 메인 오실레이터 (화음 - 3개)
    const rootFreq = this.modeFrequencies[this.currentMode] || this.config.baseFrequency;
    const frequencies = [rootFreq, rootFreq * 1.25, rootFreq * 1.5]; // 루트, 장3도, 완전5도

    for (let i = 0; i < frequencies.length; i++) {
      const osc = this.createOscillator(frequencies[i], this.config.waveform);
      const gain = this.createGain(0);

      osc.connect(gain);
      this.oscillators.push(osc);
      this.gains.push(gain);
    }

    // LFO (트레몰로 효과)
    this.lfo = this.createOscillator(2, 'sine'); // 2Hz LFO
    this.lfoGain = this.createGain(0.15);
    this.lfo.connect(this.lfoGain);

    // 딜레이 노드
    this.delay = this.createDelay(0.3);
    const delayFeedback = this.createGain(0.4);
    this.delay.connect(delayFeedback);
    delayFeedback.connect(this.delay);

    // 리버브
    this.reverb = await this.createReverb(2.5, 2);

    // 메인 출력 게인
    this.outputGain = this.createGain(0.3);

    // 드라이/웻 믹스
    const dryGain = this.createGain(0.6);
    const wetGain = this.createGain(0.4);

    // 연결: 오실레이터 -> 게인 -> 출력
    for (let i = 0; i < this.gains.length; i++) {
      // LFO 모듈레이션 연결
      this.lfoGain.connect(this.gains[i].gain);

      // 드라이/웻 분기
      this.gains[i].connect(dryGain);
      this.gains[i].connect(this.delay);
    }

    // 딜레이 -> 리버브 -> 웻 게인
    this.delay.connect(this.reverb);
    this.reverb.connect(wetGain);

    // 드라이/웻 -> 출력 -> 마스터
    dryGain.connect(this.outputGain);
    wetGain.connect(this.outputGain);
    this.outputGain.connect(this.masterGain);
  }

  onStart() {
    // 오실레이터 시작
    const now = this.audioContext.currentTime;

    for (const osc of this.oscillators) {
      osc.start(now);
    }
    this.lfo.start(now);

    // 페이드 인
    for (let i = 0; i < this.gains.length; i++) {
      const targetGain = 0.15 - i * 0.03; // 각 하모닉 점점 작게
      this.gains[i].gain.setTargetAtTime(targetGain, now, 0.5);
    }

    console.log(`[${this.artistId}] WaveSoundProfile started`);
  }

  onStop() {
    const now = this.audioContext.currentTime;

    // 페이드 아웃
    for (const gain of this.gains) {
      gain.gain.setTargetAtTime(0, now, 0.3);
    }
  }

  update(frame, visualData = {}) {
    if (!this.isPlaying || !this.audioContext) return;

    const now = this.audioContext.currentTime;

    // 시각 데이터 기반 사운드 변조
    const intensity = visualData.intensity || Math.sin(frame * 0.02) * 0.5 + 0.5;
    const brightness = visualData.brightness || 0.5;

    // 주파수 미세 변조 (detune)
    const detuneAmount = (intensity - 0.5) * 20; // -10 ~ +10 cents
    for (const osc of this.oscillators) {
      osc.detune.setTargetAtTime(detuneAmount, now, 0.1);
    }

    // LFO 속도 조절 (밝기에 따라)
    const lfoRate = 1 + brightness * 4; // 1Hz ~ 5Hz
    this.lfo.frequency.setTargetAtTime(lfoRate, now, 0.1);

    // 딜레이 타임 미세 조절
    if (this.delay) {
      const delayTime = 0.2 + intensity * 0.2; // 0.2s ~ 0.4s
      this.delay.delayTime.setTargetAtTime(delayTime, now, 0.1);
    }

    // 전체 볼륨 (intensity 기반)
    const volume = 0.2 + intensity * 0.15;
    this.outputGain.gain.setTargetAtTime(volume, now, 0.1);
  }

  onModeChange(modeIndex, variantIndex) {
    super.onModeChange(modeIndex, variantIndex);

    if (!this.audioContext || !this.isPlaying) return;

    const now = this.audioContext.currentTime;
    const rootFreq = this.modeFrequencies[modeIndex] || this.config.baseFrequency;
    const scale = this.modeScales[modeIndex] || 'pentatonic';

    // 스케일에서 주파수 가져오기
    const scaleFreqs = this.getScaleFrequencies(rootFreq, scale, 1);

    // 변형에 따른 코드 선택
    const chordIndex = variantIndex % 3;
    const chordRoots = [
      scaleFreqs[0],
      scaleFreqs[2] || scaleFreqs[0],
      scaleFreqs[4] || scaleFreqs[0]
    ];

    const newRoot = chordRoots[chordIndex];
    const frequencies = [newRoot, newRoot * 1.25, newRoot * 1.5];

    // 주파수 전환 (스무스하게)
    for (let i = 0; i < this.oscillators.length; i++) {
      if (this.oscillators[i] && frequencies[i]) {
        this.oscillators[i].frequency.setTargetAtTime(frequencies[i], now, 0.5);
      }
    }

    // 모드별 웨이브폼 변경
    const waveforms = ['sine', 'triangle', 'sine', 'triangle', 'sine', 'sine', 'square'];
    const newWaveform = waveforms[modeIndex] || 'sine';
    for (const osc of this.oscillators) {
      osc.type = newWaveform;
    }

    console.log(`[${this.artistId}] Mode changed: ${modeIndex}, Variant: ${variantIndex}, Freq: ${newRoot.toFixed(1)}Hz`);
  }
}
