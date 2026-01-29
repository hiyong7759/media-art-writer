# Web Audio API 패턴 레퍼런스

## AudioContext 기본

```javascript
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 브라우저 정책: 사용자 인터랙션 후 resume
if (audioContext.state === 'suspended') {
  await audioContext.resume();
}
```

## 오실레이터 (Oscillator)

### 기본 웨이브폼
- `sine` - 부드러운 사인파 (따뜻한 톤)
- `square` - 사각파 (거친, 8비트)
- `sawtooth` - 톱니파 (밝은, 신스)
- `triangle` - 삼각파 (부드러운, 플루트)

```javascript
const osc = audioContext.createOscillator();
osc.type = 'sine';
osc.frequency.value = 440; // Hz
osc.detune.value = 0; // cents (100 = 반음)
osc.connect(destination);
osc.start();
```

### 주파수 참조
- C3: 130.81 Hz
- C4 (중앙 도): 261.63 Hz
- A4 (표준): 440 Hz
- C5: 523.25 Hz

## 게인 노드 (Gain Node)

```javascript
const gain = audioContext.createGain();
gain.gain.value = 0.5; // 0 ~ 1

// 스무스 전환
gain.gain.setTargetAtTime(targetValue, startTime, timeConstant);

// 선형 전환
gain.gain.linearRampToValueAtTime(targetValue, endTime);

// 지수 전환
gain.gain.exponentialRampToValueAtTime(targetValue, endTime);
```

## 필터 (BiquadFilter)

### 필터 타입
- `lowpass` - 저역 통과 (따뜻한, 뭉개진)
- `highpass` - 고역 통과 (밝은, 얇은)
- `bandpass` - 대역 통과 (특정 주파수 강조)
- `allpass` - 위상 변경 (페이저)
- `notch` - 노치 (특정 주파수 제거)

```javascript
const filter = audioContext.createBiquadFilter();
filter.type = 'lowpass';
filter.frequency.value = 1000; // 컷오프 주파수
filter.Q.value = 1; // 레조넌스 (0.0001 ~ 1000)
```

## 딜레이 (Delay)

```javascript
const delay = audioContext.createDelay(maxDelayTime);
delay.delayTime.value = 0.3; // 초

// 피드백 딜레이
const feedback = audioContext.createGain();
feedback.gain.value = 0.4;
delay.connect(feedback);
feedback.connect(delay);
```

## 컨볼버 (Convolver / Reverb)

```javascript
const convolver = audioContext.createConvolver();

// 임펄스 응답 생성
function createReverbImpulse(duration, decay) {
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * duration;
  const buffer = audioContext.createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i/length, decay);
    }
  }

  return buffer;
}

convolver.buffer = createReverbImpulse(2, 2);
```

## 웨이브쉐이퍼 (Distortion)

```javascript
const waveshaper = audioContext.createWaveShaper();
waveshaper.oversample = '4x';

function makeDistortionCurve(amount) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;

  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }

  return curve;
}

waveshaper.curve = makeDistortionCurve(50);
```

## LFO (Low Frequency Oscillator)

모듈레이션용 저주파 오실레이터

```javascript
// 트레몰로 (볼륨 변조)
const lfo = audioContext.createOscillator();
lfo.type = 'sine';
lfo.frequency.value = 5; // Hz

const lfoGain = audioContext.createGain();
lfoGain.gain.value = 0.3;

lfo.connect(lfoGain);
lfoGain.connect(targetGain.gain); // 게인 노드의 gain AudioParam에 연결

// 비브라토 (피치 변조)
lfoGain.connect(oscillator.frequency); // 오실레이터 주파수에 연결
```

## 스테레오 패너

```javascript
const panner = audioContext.createStereoPanner();
panner.pan.value = 0; // -1 (좌) ~ 1 (우)
```

## 노이즈 생성

```javascript
function createNoiseBuffer(duration) {
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

const noise = audioContext.createBufferSource();
noise.buffer = createNoiseBuffer(2);
noise.loop = true;
```

## 주파수-MIDI 변환

```javascript
// 주파수 -> MIDI 노트
function freqToMidi(freq) {
  return 69 + 12 * Math.log2(freq / 440);
}

// MIDI -> 주파수
function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
```

## 스케일 주파수 생성

```javascript
const scales = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  wholetone: [0, 2, 4, 6, 8, 10]
};

function getScaleFrequencies(rootFreq, scaleName, octaves = 1) {
  const scale = scales[scaleName];
  const rootMidi = freqToMidi(rootFreq);
  const frequencies = [];

  for (let oct = 0; oct < octaves; oct++) {
    for (const semitone of scale) {
      frequencies.push(midiToFreq(rootMidi + semitone + oct * 12));
    }
  }

  return frequencies;
}
```

## 클린업

```javascript
// 오실레이터 정지
oscillator.stop();

// 노드 연결 해제
node.disconnect();

// AudioContext 종료
audioContext.close();
```

## 성능 팁

1. **노드 재사용**: 자주 생성/삭제하지 말고 재사용
2. **게인으로 음소거**: 노드 연결 해제 대신 게인을 0으로
3. **스케줄링 활용**: setValueAtTime, linearRampToValueAtTime 사용
4. **GC 최소화**: 오디오 루프 내 객체 생성 피하기
