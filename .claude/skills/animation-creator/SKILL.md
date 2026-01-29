---
name: animation-creator
description: 작가별 고유한 애니메이션 모드를 생성하고 수정하는 스킬입니다. 이 스킬은 사용자가 Canvas API를 사용하여 새로운 시각화 모드를 생성(/create-mode)하거나 기존 모드를 수정(/edit-mode)할 때 사용해야 합니다.
---

# Animation Creator Skill

작가별 고유한 애니메이션 모드를 생성하고 수정하는 스킬입니다.

## 사용법

```
/create-mode <engine-name> <mode-name>
```

또는 기존 모드 수정:
```
/edit-mode <engine-name> <mode-name>
```

## 기능

1. **새 애니메이션 모드 생성**
   - 작가 테마에 맞는 Canvas 2D 시각화 구현
   - 3가지 스타일 변형(variant) 구현
   - 파티클 시스템, 기하학적 패턴, 유기적 움직임 등

2. **기존 모드 수정**
   - 애니메이션 파라미터 조정
   - 새로운 스타일 변형 추가
   - 성능 최적화

## 프로젝트 구조

```
js/
├── core/
│   ├── BaseMode.js      # 모든 모드의 추상 클래스
│   └── EngineFactory.js # 엔진 생성 팩토리
├── engines/
│   ├── ArtEngine.js     # 기본 엔진 클래스
│   ├── OrganicEngine.js # AURA-7
│   ├── GeometricEngine.js # KURO-X
│   ├── CyberpunkEngine.js # NEON-V
│   ├── BloomEngine.js   # FLORA-9
│   ├── WaveEngine.js    # ECHO-0
│   ├── CosmicEngine.js  # VOID-3
│   ├── ContourEngine.js # TERRA-1
│   ├── FlowEngine.js    # AQUA-5
│   └── RefractionEngine.js # PRISM-2
└── engines/modes/<theme>/
    └── <ModeName>Mode.js
```

## 작가별 테마 가이드

| 작가 | 테마 | 특징 | 주요 기법 |
|------|------|------|----------|
| AURA-7 | Organic | 유기적, 생명체 | 파티클, 성장, 호흡 |
| KURO-X | Geometric | 기하학적, 정밀 | 다각형, 프랙탈, 그리드 |
| NEON-V | Cyberpunk | 사이버펑크, 디지털 | 글리치, 스캔라인, 회로 |
| FLORA-9 | Bloom | 꽃, 자연 | 꽃잎, 성장, 확산 |
| ECHO-0 | Wave | 파동, 음파 | 사인파, 진동, 주파수 |
| VOID-3 | Cosmic | 우주, 심연 | 별, 궤도, 블랙홀 |
| TERRA-1 | Contour | 지형, 등고선 | 레이어, 침식, 지질 |
| AQUA-5 | Flow | 물, 흐름 | 유체, 파문, 방울 |
| PRISM-2 | Refraction | 빛, 굴절 | 스펙트럼, 렌즈, 반사 |

## 모드 구현 패턴

### 기본 구조

```javascript
import { BaseMode } from '../../core/BaseMode.js';

export class NewMode extends BaseMode {
    constructor(engine) {
        super(engine);
        // 모드 특화 속성 초기화
    }

    init(variant = 0) {
        super.init(variant);
        // variant별 초기화
        // 0: 기본 스타일
        // 1: 강화된 스타일
        // 2: 실험적 스타일
    }

    draw() {
        const ctx = this.ctx;
        const t = this.frame * 0.02; // 시간 기반 애니메이션

        if (this.style === 0) {
            // 스타일 0 구현
        } else if (this.style === 1) {
            // 스타일 1 구현
        } else {
            // 스타일 2 구현
        }
    }

    resize() {
        super.resize();
        // 필요시 리사이즈 처리
    }
}
```

### 유용한 접근자 (BaseMode에서 상속)

- `this.ctx` - Canvas 2D 컨텍스트
- `this.width` / `this.height` - 캔버스 크기
- `this.frame` - 현재 프레임 번호
- `this.colors` - 작가 팔레트 색상 배열
- `this.style` - 현재 스타일 변형 (0, 1, 2)

### 헬퍼 메서드

- `this.hexToRgba(hex, alpha)` - 색상 변환
- `this.randomColor()` - 팔레트에서 랜덤 색상
- `this.createParticle(props)` - 파티클 생성

## 구현 체크리스트

- [ ] BaseMode 상속 또는 호환 구조
- [ ] constructor() - 초기 속성 설정
- [ ] init(variant) - 3가지 스타일 변형 지원
- [ ] draw() - 프레임별 렌더링
- [ ] resize() - 캔버스 크기 변경 대응
- [ ] 엔진의 modes 배열에 등록

## 엔진에 모드 등록

```javascript
// 예: OrganicEngine.js
import { NewMode } from './modes/organic/NewMode.js';

class OrganicEngine extends ArtEngine {
    constructor(canvas) {
        super(canvas);
        this.modes = [
            new PulseMode(this),
            new SeedMode(this),
            new NewMode(this),  // 새 모드 추가
            // ...
        ];
    }
}
```

## 테스트

1. viewer.html 열기
2. 해당 작가 선택
3. 모드 전환하여 새 모드 확인
4. 각 스타일 변형(R 버튼) 테스트
5. 브라우저 콘솔에서 에러 확인
6. 리사이즈 시 정상 동작 확인
