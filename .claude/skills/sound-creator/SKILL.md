---
name: sound-creator
description: 작가별 고유한 사운드 프로파일을 생성하고 튜닝하는 스킬입니다. 이 스킬은 사용자가 Web Audio API를 사용하여 특정 작가의 사운드 프로파일을 생성(/create-sound)하거나 기존 프로파일을 수정(/tune-sound)할 때 사용해야 합니다.
---

# Sound Creator Skill

작가별 고유한 사운드 프로파일을 생성하고 튜닝하는 스킬입니다.

## 사용법

```
/create-sound <artist-id>
```

또는 기존 프로파일 수정:
```
/tune-sound <artist-id>
```

## 기능

1. **새 사운드 프로파일 생성**
   - 작가 테마에 맞는 Web Audio API 노드 구성
   - 기본 주파수, 웨이브폼, 이펙트 체인 설정
   - 모드/변형별 사운드 변화 로직 구현

2. **기존 프로파일 튜닝**
   - 주파수 조정
   - 이펙트 파라미터 수정
   - 시각-사운드 매핑 개선

## 작가별 사운드 특성 가이드

| 작가 | 테마 | 기본 주파수 | 웨이브폼 | 주요 이펙트 |
|------|------|------------|---------|-----------|
| AURA-7 | Organic | 220Hz | sine | reverb, chorus |
| KURO-X | Geometric | 110Hz | square | distortion, bitcrusher |
| NEON-V | Cyberpunk | 330Hz | sawtooth | delay, flanger |
| FLORA-9 | Bloom | 440Hz | triangle | reverb, shimmer |
| ECHO-0 | Wave | 440Hz | sine | delay, reverb |
| VOID-3 | Cosmic | 55Hz | sine+noise | deep reverb |
| TERRA-1 | Contour | 165Hz | sawtooth | filter sweep |
| AQUA-5 | Flow | 220Hz | sine | chorus, phaser |
| PRISM-2 | Refraction | 880Hz | triangle | phaser, shimmer |

## Web Audio API 패턴

### 기본 구조
```javascript
class NewSoundProfile extends BaseSoundProfile {
  constructor(artistId, config) {
    super(artistId, config);
    // 프로파일 특화 속성
  }

  async setupSound() {
    // 1. 오실레이터 생성
    // 2. 이펙트 체인 구성
    // 3. 출력 연결
  }

  onStart() {
    // 오실레이터 시작, 페이드인
  }

  update(frame, visualData) {
    // 프레임별 사운드 변조
  }

  onModeChange(modeIndex, variantIndex) {
    // 모드/변형 변경 시 사운드 전환
  }
}
```

### 이펙트 체인 예시

**Reverb (리버브)**
```javascript
const reverb = await this.createReverb(duration, decay);
source.connect(reverb);
reverb.connect(this.outputGain);
```

**Delay (딜레이)**
```javascript
const delay = this.createDelay(0.3);
const feedback = this.createGain(0.4);
delay.connect(feedback);
feedback.connect(delay);
```

**Chorus (코러스)**
```javascript
const lfo = this.createOscillator(0.5, 'sine');
const lfoGain = this.createGain(0.003);
const chorusDelay = this.createDelay(0.02);
lfo.connect(lfoGain);
lfoGain.connect(chorusDelay.delayTime);
```

**Phaser (페이저)**
```javascript
const phaserLFO = this.createOscillator(0.3, 'sine');
const allpass = this.createFilter('allpass', 1000, 1);
phaserLFO.connect(allpass.frequency);
```

## 파일 위치

- 코어: `js/sound/core/`
  - `SoundEngine.js` - AudioContext 관리
  - `BaseSoundProfile.js` - 추상 클래스
  - `SoundFactory.js` - 팩토리 패턴

- 프로파일: `js/sound/profiles/<theme>/`
  - `OrganicSoundProfile.js` (AURA-7)
  - `GeometricSoundProfile.js` (KURO-X)
  - 등...

## 구현 체크리스트

- [ ] BaseSoundProfile 상속
- [ ] setupSound() 구현
- [ ] onStart()/onStop() 구현
- [ ] update() - 시각 데이터 연동
- [ ] onModeChange() - 모드별 사운드 변화
- [ ] cleanup() - 리소스 정리
- [ ] SoundFactory에 등록

## 테스트

1. viewer.html 열기
2. 화면 클릭하여 사운드 활성화
3. 사운드 토글 버튼 (또는 M키) 클릭
4. 모드/변형 변경 시 사운드 변화 확인
5. 브라우저 콘솔에서 에러 확인
