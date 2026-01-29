/**
 * CosmicSoundProfile - VOID-3 작가용 사운드 프로파일
 * 테마: Cosmic (우주, 심연)
 * 특성: 깊은 드론, 저주파 사인파 + 노이즈, 딥 리버브
 */
import { BaseSoundProfile } from '../../core/BaseSoundProfile.js';

export class CosmicSoundProfile extends BaseSoundProfile {
  constructor(artistId, config) {
    super(artistId, {
      baseFrequency: 55,
      waveform: 'sine',
      ...config
    });

    this.droneOsc = null;
    this.subOsc = null;
    this.noiseNode = null;
    this.noiseGain = null;
    this.reverb = null;
    this.filter = null;
  }

  async setupSound() {
    const rootFreq = this.config.baseFrequency;

    // 깊은 드론 (베이스)
    this.droneOsc = this.createOscillator(rootFreq, 'sine');
    this.droneGain = this.createGain(0);

    // 서브 옥타브
    this.subOsc = this.createOscillator(rootFreq / 2, 'sine');
    this.subGain = this.createGain(0);

    // 상위 하모닉 (5도 위)
    this.fifthOsc = this.createOscillator(rootFreq * 1.5, 'sine');
    this.fifthGain = this.createGain(0);

    // 노이즈 (우주 배경음)
    this.noiseNode = this.createNoiseNode();
    this.noiseGain = this.createGain(0);
    this.noiseFilter = this.createFilter('lowpass', 500, 1);

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);

    // 깊은 리버브
    this.reverb = await this.createReverb(6, 4);

    // 로우패스 필터 (우주적 부드러움)
    this.filter = this.createFilter('lowpass', 800, 0.5);

    // 출력
    this.outputGain = this.createGain(0.25);

    // 연결
    this.droneOsc.connect(this.droneGain);
    this.subOsc.connect(this.subGain);
    this.fifthOsc.connect(this.fifthGain);

    this.droneGain.connect(this.filter);
    this.subGain.connect(this.filter);
    this.fifthGain.connect(this.filter);
    this.noiseGain.connect(this.filter);

    this.filter.connect(this.reverb);
    this.reverb.connect(this.outputGain);
    this.outputGain.connect(this.masterGain);
  }

  createNoiseNode() {
    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    this.nodes.push(noise);

    return noise;
  }

  onStart() {
    const now = this.audioContext.currentTime;

    this.droneOsc.start(now);
    this.subOsc.start(now);
    this.fifthOsc.start(now);
    this.noiseNode.start(now);

    // 아주 느린 페이드인 (우주의 심연에서 떠오르듯)
    this.droneGain.gain.setTargetAtTime(0.2, now, 3);
    this.subGain.gain.setTargetAtTime(0.15, now, 4);
    this.fifthGain.gain.setTargetAtTime(0.05, now, 5);
    this.noiseGain.gain.setTargetAtTime(0.03, now, 2);

    console.log(`[${this.artistId}] CosmicSoundProfile started`);
  }

  onStop() {
    const now = this.audioContext.currentTime;
    this.droneGain.gain.setTargetAtTime(0, now, 2);
    this.subGain.gain.setTargetAtTime(0, now, 2);
    this.fifthGain.gain.setTargetAtTime(0, now, 2);
    this.noiseGain.gain.setTargetAtTime(0, now, 1);
  }

  update(frame, visualData = {}) {
    if (!this.isPlaying || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const intensity = visualData.intensity || Math.sin(frame * 0.002) * 0.5 + 0.5;

    // 아주 느린 주파수 변조 (우주적 움직임)
    const cosmicDrift = Math.sin(frame * 0.001) * 5 + Math.sin(frame * 0.0003) * 10;
    this.droneOsc.detune.setTargetAtTime(cosmicDrift, now, 1);
    this.subOsc.detune.setTargetAtTime(cosmicDrift * 0.5, now, 1);

    // 노이즈 필터 변조
    const noiseFreq = 200 + intensity * 600;
    this.noiseFilter.frequency.setTargetAtTime(noiseFreq, now, 0.5);

    // 메인 필터
    const filterFreq = 400 + intensity * 800;
    this.filter.frequency.setTargetAtTime(filterFreq, now, 0.5);

    // 볼륨
    const volume = 0.2 + intensity * 0.1;
    this.outputGain.gain.setTargetAtTime(volume, now, 0.5);
  }

  onModeChange(modeIndex, variantIndex) {
    super.onModeChange(modeIndex, variantIndex);
    if (!this.audioContext || !this.isPlaying) return;

    const now = this.audioContext.currentTime;

    // 모드별 주파수 (우주적 간격)
    const modeRoots = [55, 41, 62, 49, 73, 37, 82];
    const rootFreq = modeRoots[modeIndex] || this.config.baseFrequency;

    this.droneOsc.frequency.setTargetAtTime(rootFreq, now, 2);
    this.subOsc.frequency.setTargetAtTime(rootFreq / 2, now, 2);
    this.fifthOsc.frequency.setTargetAtTime(rootFreq * 1.5, now, 2);

    console.log(`[${this.artistId}] Mode: ${modeIndex}, Root: ${rootFreq}Hz`);
  }
}
