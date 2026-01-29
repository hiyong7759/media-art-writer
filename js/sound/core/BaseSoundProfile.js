/**
 * BaseSoundProfile - 사운드 프로파일 추상 클래스
 * 각 작가별 사운드 프로파일이 상속받아 구현
 */
export class BaseSoundProfile {
  constructor(artistId, config = {}) {
    this.artistId = artistId;
    this.config = {
      baseFrequency: 440,
      waveform: 'sine',
      ...config
    };

    this.audioContext = null;
    this.masterGain = null;
    this.nodes = [];
    this.isPlaying = false;
    this.currentMode = 0;
    this.currentVariant = 0;
  }

  /**
   * 초기화 (SoundEngine에서 호출)
   */
  async init(audioContext, masterGain) {
    this.audioContext = audioContext;
    this.masterGain = masterGain;
    await this.setupSound();
  }

  /**
   * 사운드 노드 설정 (하위 클래스에서 구현)
   * @abstract
   */
  async setupSound() {
    throw new Error('setupSound() must be implemented by subclass');
  }

  /**
   * 사운드 재생 시작
   */
  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.onStart();
  }

  /**
   * 시작 시 호출 (하위 클래스에서 오버라이드 가능)
   */
  onStart() {}

  /**
   * 사운드 정지
   */
  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.onStop();
  }

  /**
   * 정지 시 호출 (하위 클래스에서 오버라이드 가능)
   */
  onStop() {}

  /**
   * 프레임 업데이트 (하위 클래스에서 구현)
   * @param {number} frame - 현재 프레임 번호
   * @param {Object} visualData - 시각적 데이터 (파티클 위치, 밝기 등)
   */
  update(frame, visualData) {
    // 하위 클래스에서 구현
  }

  /**
   * 모드/변형 변경 시 호출
   */
  onModeChange(modeIndex, variantIndex) {
    this.currentMode = modeIndex;
    this.currentVariant = variantIndex;
    // 하위 클래스에서 오버라이드하여 사운드 특성 변경
  }

  /**
   * 오실레이터 생성 헬퍼
   */
  createOscillator(frequency, type = 'sine') {
    const osc = this.audioContext.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;
    this.nodes.push(osc);
    return osc;
  }

  /**
   * 게인 노드 생성 헬퍼
   */
  createGain(value = 0.5) {
    const gain = this.audioContext.createGain();
    gain.gain.value = value;
    this.nodes.push(gain);
    return gain;
  }

  /**
   * 필터 생성 헬퍼
   */
  createFilter(type = 'lowpass', frequency = 1000, Q = 1) {
    const filter = this.audioContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = Q;
    this.nodes.push(filter);
    return filter;
  }

  /**
   * 딜레이 생성 헬퍼
   */
  createDelay(time = 0.3) {
    const delay = this.audioContext.createDelay(5.0);
    delay.delayTime.value = time;
    this.nodes.push(delay);
    return delay;
  }

  /**
   * 컨볼버(리버브) 생성 헬퍼
   */
  async createReverb(duration = 2, decay = 2) {
    const convolver = this.audioContext.createConvolver();
    convolver.buffer = this.generateReverbImpulse(duration, decay);
    this.nodes.push(convolver);
    return convolver;
  }

  /**
   * 리버브 임펄스 응답 생성
   */
  generateReverbImpulse(duration, decay) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }

    return buffer;
  }

  /**
   * 주파수를 MIDI 노트 번호로 변환
   */
  freqToMidi(freq) {
    return 69 + 12 * Math.log2(freq / 440);
  }

  /**
   * MIDI 노트 번호를 주파수로 변환
   */
  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * 스케일 내 주파수 생성 (하위 클래스에서 사용)
   */
  getScaleFrequencies(rootFreq, scale = 'major', octaves = 2) {
    const scales = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      pentatonic: [0, 2, 4, 7, 9],
      chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      dorian: [0, 2, 3, 5, 7, 9, 10],
      phrygian: [0, 1, 3, 5, 7, 8, 10],
      lydian: [0, 2, 4, 6, 7, 9, 11],
      mixolydian: [0, 2, 4, 5, 7, 9, 10],
      wholetone: [0, 2, 4, 6, 8, 10]
    };

    const scaleNotes = scales[scale] || scales.major;
    const frequencies = [];
    const rootMidi = this.freqToMidi(rootFreq);

    for (let octave = 0; octave < octaves; octave++) {
      for (const semitone of scaleNotes) {
        frequencies.push(this.midiToFreq(rootMidi + semitone + octave * 12));
      }
    }

    return frequencies;
  }

  /**
   * 리소스 정리
   */
  cleanup() {
    this.stop();

    // 모든 오실레이터 정지
    for (const node of this.nodes) {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // 이미 정지된 노드 무시
      }
    }

    this.nodes = [];
    this.audioContext = null;
    this.masterGain = null;
    console.log(`[${this.artistId}] Sound profile cleaned up`);
  }
}
