# 아티스트 스킬 정의서 (Artist Skills Definition)

9명의 AI 작가별 고유 7개 스킬(모드)과 각 스킬당 3가지 Variant 상세 정의.

> **현행화 일자**: 2026-02-04
> **참조 소스**: `js/engines/*Engine.js` 내 `static SKILLS` 정의

---

## 엔진-작가 매핑 (EngineFactory)

| 작가 ID | 엔진 | 컨셉 |
|---------|------|------|
| `aura-7` | OrganicEngine | 자연/유기체 |
| `kuro-x` | GeometricEngine | 기하학 |
| `neon-v` | CyberpunkEngine | 사이버펑크 |
| `void-3` | CosmicEngine | 우주 |
| `aqua-5` | FlowEngine | 물/유동 |
| `prism-2` | RefractionEngine | 빛/굴절 |
| `echo-0` | WaveEngine | 소리/파동 |
| `terra-1` | ContourEngine | 지형/등고선 |
| `flora-9` | BloomEngine | 꽃/개화 |

---

## 1. AURA-7 (OrganicEngine)
자연의 순환과 생명력을 다루는 드루이드 컨셉.

| 모드 | 한글명 | Variant 0 | Variant 1 | Variant 2 |
|------|--------|-----------|-----------|-----------|
| **Flow** | 흐름 | DNA | Stream | Network |
| **Seed** | 씨앗 | Cell | Sprout | Egg |
| **Wind** | 바람 | Breeze | Gale | Pollen |
| **Bloom** | 개화 | Heart | Lotus | Orbital |
| **Root** | 뿌리 | Taproot | Fibrous | Rhizome |
| **Pulse** | 맥동 | Breath | Shockwave | Magnetic |
| **Life** | 생명 | Firefly | Butterfly | Spirit |

---

## 2. KURO-X (GeometricEngine)
차원과 도형을 조작하는 기하학적 설계자 컨셉.

| 모드 | 한글명 | Variant 0 | Variant 1 | Variant 2 |
|------|--------|-----------|-----------|-----------|
| **Poly** | 다각형 | Shape | Hexagon | Voronoi |
| **Point** | 점 | Scatter | Grid | Orbit |
| **Line** | 선 | Connect | Flow | Web |
| **Solid** | 입체 | Cube | Pyramid | Sphere |
| **Fractal** | 프랙탈 | Tree | Snowflake | Sierpinski |
| **Dim** | 차원 | Hypercube | Projection | Fold |
| **Chaos** | 혼돈 | Attractor | Noise | Glitch |

---

## 3. NEON-V (CyberpunkEngine)
사이버펑크 세계의 디지털 비와 글리치, 네온 사인을 조작하는 해커.

| 모드 | 한글명 | Variant 0 | Variant 1 | Variant 2 |
|------|--------|-----------|-----------|-----------|
| **Rain** | 디지털 비 | Modern | Binary | Storm |
| **Scanner** | 스캔 | Horizontal | Vertical | Quantum |
| **HUD** | 인터페이스 | Brackets | Circle | Box |
| **Data** | 데이터 | Vertical | Horizontal | Scattered |
| **Circuit** | 회로 | Logic | Overload | Organic |
| **Sign** | 신호 | Sine | Noise | Pulse |
| **Net** | 네트워크 | Grid | Terrain | Warp |

---

## 4. VOID-3 (CosmicEngine)
우주의 섭리와 미지의 현상을 관측하는 우주적 존재.

| 모드 | 한글명 | Variant 0 | Variant 1 | Variant 2 |
|------|--------|-----------|-----------|-----------|
| **Dust** | 성운 | Nebula | Stardust | DarkMatter |
| **Orbit** | 궤도 | Planet | Comet | Asteroid |
| **Nova** | 초신성 | Explosion | Remnant | Pulsar |
| **Void** | 공허 | BlackHole | Wormhole | Abyss |
| **Galaxy** | 은하 | Spiral | Elliptical | Collision |
| **Quasar** | 퀘이사 | Beam | Radio | Active |
| **Multi** | 다중우주 | Bubble | String | Quantum |

---

## 5. AQUA-5 (FlowEngine)
형태가 없는 물의 유동성과 투명함을 다루는 수질 조작자.

| 모드 | 한글명 | Variant 0 | Variant 1 | Variant 2 |
|------|--------|-----------|-----------|-----------|
| **Bubble** | 거품 | Rising | Popping | Foam |
| **Drop** | 물방울 | Rain | Dew | Tear |
| **Ripple** | 파문 | Wave | Echo | Impact |
| **Tide** | 조류 | High | Low | Storm |
| **Deep** | 심해 | Abyss | Pressure | Glow |
| **Mist** | 안개 | Morning | Sea | Dense |
| **Ice** | 얼음 | Frost | Glacier | Crystal |

> **Bubble 모드 특이사항**:
> - Variant 0 (Rising): 미니프리뷰와 동일한 심플한 상승 버블 (꼬리 없음)
> - Variant 1 (Popping): 꼬리/잔상 효과 + 터지는 애니메이션
> - Variant 2 (Foam): 하단 거품 클러스터

---

## 6. PRISM-2 (RefractionEngine)
빛의 굴절, 반사, 스펙트럼을 다루는 광학 설계자.

| 모드 | 한글명 | Variant 0 | Variant 1 | Variant 2 |
|------|--------|-----------|-----------|-----------|
| **Beam** | 광선 | Laser | Ray | Focus |
| **Spectrum** | 스펙트럼 | Rainbow | Prism | Split |
| **Glass** | 유리 | Shard | Pane | Frosted |
| **Bokeh** | 보케 | Circle | Hex | Star |
| **Neon** | 네온 | Glow | Sign | Flicker |
| **Mirror** | 거울 | Reflection | Distort | Infinite |
| **Flash** | 섬광 | Burst | Strobe | Flare |

---

## 7. ECHO-0 (WaveEngine)
소리를 시각화하는 공감각적 오디오 비주얼라이저.

| 모드 | 한글명 | Variant 0 | Variant 1 | Variant 2 |
|------|--------|-----------|-----------|-----------|
| **Wave** | 파동 | Sine | Square | Sawtooth |
| **Pulse** | 맥박 | Rhythm | Heartbeat | Tempo |
| **EQ** | 이퀄라이저 | Digital | Analog | Spectrum |
| **Noise** | 노이즈 | White | Pink | Static |
| **Voice** | 목소리 | Echo | Chorus | Reverb |
| **String** | 현 | Vibration | Pluck | Resonance |
| **Silence** | 침묵 | Void | Quiet | Mute |

---

## 8. TERRA-1 (ContourEngine)
지형의 생성과 지질학적 시간을 다루는 대지의 창조자.

| 모드 | 한글명 | Variant 0 | Variant 1 | Variant 2 |
|------|--------|-----------|-----------|-----------|
| **Map** | 지도 | Topo | Grid | Satellite |
| **Mountain** | 산맥 | Peak | Range | Valley |
| **River** | 강 | Flow | Delta | Meander |
| **Rock** | 암석 | Sediment | Igneous | Crystal |
| **Sand** | 모래 | Dune | Ripple | Grain |
| **Layer** | 지층 | Strata | Fault | Bedrock |
| **Core** | 중심 | Inner | Magma | Solid |

> **스타일 가이드라인**:
> - 모든 모드는 **선 위주(stroke)** 렌더링 우선
> - fill 사용 시 **alpha 0.05~0.15** 범위로 매우 투명하게
> - 미니프리뷰(gallery.js)와 뷰어 모드 시각적 일관성 유지

---

## 9. FLORA-9 (BloomEngine)
꽃의 개화와 색채의 아름다움에 집중하는 정원사.

| 모드 | 한글명 | Variant 0 | Variant 1 | Variant 2 |
|------|--------|-----------|-----------|-----------|
| **Petal** | 꽃잎 | Rose | Cherry | Lily |
| **Bloom** | 개화 | Full | Bud | Wild |
| **Bouquet** | 꽃다발 | Round | Cascade | Posy |
| **Vine** | 덩굴 | Ivy | Thorn | Creeper |
| **Pollen** | 꽃가루 | Dust | Sparkle | Scent |
| **Garden** | 정원 | Secret | Zen | Maze |
| **Dry** | 건조 | Pressed | Withered | Vintage |

---

## 파일 구조

```
js/engines/
├── ArtEngine.js              # 베이스 엔진 클래스
├── OrganicEngine.js          # aura-7
├── GeometricEngine.js        # kuro-x
├── CyberpunkEngine.js        # neon-v
├── CosmicEngine.js           # void-3
├── FlowEngine.js             # aqua-5
├── RefractionEngine.js       # prism-2
├── WaveEngine.js             # echo-0
├── ContourEngine.js          # terra-1
├── BloomEngine.js            # flora-9
└── modes/
    ├── organic/              # Flow, Seed, Wind, Bloom, Root, Pulse, Life
    ├── geometric/            # Poly, Point, Line, Solid, Fractal, Dim, Chaos
    ├── cyberpunk/            # Rain, Scanner, HUD, Data, Circuit, Sign, Net
    ├── cosmic/               # Dust, Orbit, Nova, Void, Galaxy, Quasar, Multi
    ├── flow/                 # Bubble, Drop, Ripple, Tide, Deep, Mist, Ice
    ├── refraction/           # Beam, Spectrum, Glass, Bokeh, Neon, Mirror, Flash
    ├── wave/                 # Wave, Pulse, EQ, Noise, Voice, String, Silence
    ├── contour/              # Map(Contour), Mountain, River, Rock, Sand, Layer, Core
    └── bloom/                # Petal, Bloom, Bouquet, Vine, Pollen, Garden, Dry
```

---

## 모드 구현 규칙

### BaseMode 상속
```javascript
import { BaseMode } from '../../../core/BaseMode.js';

export class ExampleMode extends BaseMode {
    constructor(engine) {
        super(engine);
        this.elements = [];
    }

    init(variant = 0) {
        super.init(variant);  // this.style 설정
        // variant에 따른 초기화
        if (this.style === 0) { /* Variant 0 */ }
        else if (this.style === 1) { /* Variant 1 */ }
        else { /* Variant 2 */ }
    }

    draw() {
        // this.ctx, this.width, this.height, this.frame, this.colors 사용
    }
}
```

### 미니프리뷰 일관성
- **첫 번째 모드(index 0)**의 **Variant 0**이 미니프리뷰와 동일해야 함
- gallery.js의 draw 함수와 모드의 draw 함수가 시각적으로 일치
