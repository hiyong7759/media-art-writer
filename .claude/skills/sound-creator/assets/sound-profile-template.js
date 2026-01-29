/**
 * {{ProfileName}} - {{ArtistId}} 작가용 사운드 프로파일
 * 테마: {{Theme}}
 * 특성: {{Description}}
 */
import { BaseSoundProfile } from '../../core/BaseSoundProfile.js';

export class {{ProfileName}} extends BaseSoundProfile {
  constructor(artistId, config) {
    super(artistId, {
      baseFrequency: {{BaseFrequency}},
      waveform: '{{Waveform}}',
      ...config
    });

    // 프로파일 특화 속성
    this.oscillators = [];
    this.gains = [];
    // TODO: 추가 이펙트 노드 선언
  }

  async setupSound() {
    const rootFreq = this.config.baseFrequency;

    // 1. 오실레이터 생성
    // TODO: 작가 특성에 맞는 오실레이터 구성
    const osc = this.createOscillator(rootFreq, this.config.waveform);
    const gain = this.createGain(0);
    osc.connect(gain);
    this.oscillators.push(osc);
    this.gains.push(gain);

    // 2. 이펙트 체인 구성
    // TODO: 작가 특성에 맞는 이펙트 추가
    // 예: const reverb = await this.createReverb(2, 2);

    // 3. 출력 연결
    this.outputGain = this.createGain(0.2);
    gain.connect(this.outputGain);
    this.outputGain.connect(this.masterGain);
  }

  onStart() {
    const now = this.audioContext.currentTime;

    // 오실레이터 시작
    for (const osc of this.oscillators) {
      osc.start(now);
    }

    // 페이드 인
    for (const gain of this.gains) {
      gain.gain.setTargetAtTime(0.1, now, 0.5);
    }

    console.log(`[${this.artistId}] {{ProfileName}} started`);
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
    const intensity = visualData.intensity || 0.5;

    // TODO: 시각 데이터 기반 사운드 변조
    // 예: 주파수 디튠, 필터 컷오프, LFO 속도 등

    // 볼륨 조절
    const volume = 0.15 + intensity * 0.1;
    this.outputGain.gain.setTargetAtTime(volume, now, 0.1);
  }

  onModeChange(modeIndex, variantIndex) {
    super.onModeChange(modeIndex, variantIndex);
    if (!this.audioContext || !this.isPlaying) return;

    const now = this.audioContext.currentTime;

    // TODO: 모드별 주파수 설정
    const modeRoots = [{{BaseFrequency}}, /* 다른 주파수들 */];
    const rootFreq = modeRoots[modeIndex] || this.config.baseFrequency;

    // 주파수 전환
    for (const osc of this.oscillators) {
      osc.frequency.setTargetAtTime(rootFreq, now, 0.5);
    }

    console.log(`[${this.artistId}] Mode: ${modeIndex}, Root: ${rootFreq}Hz`);
  }
}
