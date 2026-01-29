/**
 * OrganicSoundProfile - AURA-7 작가용 사운드 프로파일
 * 테마: Organic Flow
 * 특성: 따뜻한 사인파, 리버브, 코러스 효과
 */
import { BaseSoundProfile } from '../../core/BaseSoundProfile.js';

export class OrganicSoundProfile extends BaseSoundProfile {
  constructor(artistId, config) {
    super(artistId, {
      baseFrequency: 220,
      waveform: 'sine',
      ...config
    });

    this.oscillators = [];
    this.gains = [];
    this.reverb = null;
    this.chorusLFO = null;
    this.chorusDelay = null;
  }

  async setupSound() {
    const rootFreq = this.config.baseFrequency;

    // 유기적인 하모닉 구성 (자연 배음)
    const harmonics = [1, 2, 3, 4, 5];
    const harmonicAmps = [0.5, 0.25, 0.125, 0.0625, 0.03];

    for (let i = 0; i < harmonics.length; i++) {
      const osc = this.createOscillator(rootFreq * harmonics[i], 'sine');
      const gain = this.createGain(0);
      osc.connect(gain);
      this.oscillators.push(osc);
      this.gains.push({ node: gain, targetAmp: harmonicAmps[i] });
    }

    // 코러스 효과 (LFO + Delay)
    this.chorusLFO = this.createOscillator(0.5, 'sine');
    const chorusLFOGain = this.createGain(0.002); // 딜레이 모듈레이션 깊이
    this.chorusDelay = this.createDelay(0.025);

    this.chorusLFO.connect(chorusLFOGain);
    chorusLFOGain.connect(this.chorusDelay.delayTime);

    // 리버브
    this.reverb = await this.createReverb(3, 2.5);

    // 출력 구성
    this.outputGain = this.createGain(0.25);
    const dryGain = this.createGain(0.5);
    const wetGain = this.createGain(0.5);

    // 연결
    for (const { node } of this.gains) {
      node.connect(dryGain);
      node.connect(this.chorusDelay);
    }

    this.chorusDelay.connect(this.reverb);
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

    // 느린 페이드 인 (유기적 느낌)
    for (const { node, targetAmp } of this.gains) {
      node.gain.setTargetAtTime(targetAmp * 0.3, now, 1.5);
    }

    console.log(`[${this.artistId}] OrganicSoundProfile started`);
  }

  onStop() {
    const now = this.audioContext.currentTime;
    for (const { node } of this.gains) {
      node.gain.setTargetAtTime(0, now, 0.5);
    }
  }

  update(frame, visualData = {}) {
    if (!this.isPlaying || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const intensity = visualData.intensity || Math.sin(frame * 0.01) * 0.5 + 0.5;

    // 유기적인 주파수 변조 (숨쉬는 느낌)
    const breathRate = Math.sin(frame * 0.008) * 10 + Math.sin(frame * 0.003) * 5;
    for (const osc of this.oscillators) {
      osc.detune.setTargetAtTime(breathRate, now, 0.2);
    }

    // 코러스 LFO 속도
    const chorusRate = 0.3 + intensity * 0.5;
    this.chorusLFO.frequency.setTargetAtTime(chorusRate, now, 0.1);

    // 볼륨 (자연스러운 다이나믹)
    const volume = 0.15 + intensity * 0.15;
    this.outputGain.gain.setTargetAtTime(volume, now, 0.2);
  }

  onModeChange(modeIndex, variantIndex) {
    super.onModeChange(modeIndex, variantIndex);
    if (!this.audioContext || !this.isPlaying) return;

    const now = this.audioContext.currentTime;

    // 모드별 기본 주파수
    const modeRoots = [220, 196, 247, 185, 262, 175, 294];
    const rootFreq = modeRoots[modeIndex] || this.config.baseFrequency;

    // 변형별 옥타브 오프셋
    const octaveOffset = [1, 0.5, 2][variantIndex % 3];

    for (let i = 0; i < this.oscillators.length; i++) {
      const newFreq = rootFreq * octaveOffset * (i + 1);
      this.oscillators[i].frequency.setTargetAtTime(newFreq, now, 0.8);
    }

    console.log(`[${this.artistId}] Mode: ${modeIndex}, Root: ${rootFreq}Hz`);
  }
}
