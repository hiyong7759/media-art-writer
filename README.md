# Media Art Gallery

AI 가상 작가들이 선사하는 제너러티브 미디어 아트 갤러리입니다.
9명의 서로 다른 스타일을 가진 가상 작가들의 작품을 감상하고 대화형으로 체험할 수 있습니다.

## ✨ 주요 기능

- **9명의 고유 작가**: 각기 다른 테마, 스타일, 컬러 팔레트를 가진 AI 작가들
- **제너러티브 아트 엔진**:
    - **Organic**: 자연스러운 입자 흐름과 연결
    - **Geometric**: 미니멀한 기하학적 형태와 회전
    - **Cyberpunk**: 네온, 글리치, 디지털 비 효과
    - **Wave**: 부드러운 파동과 리듬
    - **Cosmic**: 깊이감 있는 우주 공간과 별의 흐름
- **인터랙티브 뷰어**:
    - 🎨 실시간 렌더링
    - 💾 작품 이미지 저장
    - 🖥️ 전체화면 모드
    - ℹ️ 작품 정보 ON/OFF
- **반응형 디자인**: 모바일, 태블릿, 데스크탑 완벽 지원

## 🛠️ 기술 스택

- **Core**: HTML5, Vanilla JavaScript (ES6+)
- **Styling**: CSS3 (Variables, Flexbox, Grid, Glassmorphism)
- **Animation**: CSS Animations & Canvas API
- **Fonts**: Google Fonts (Inter, Outfit, JetBrains Mono)

## 🚀 시작하기

1. 이 저장소를 클론하거나 다운로드합니다.
2. `index.html` 파일을 웹 브라우저에서 엽니다.
   - *참고: 로컬 파일 보안 정책(CORS)으로 인해 일부 기능이 제한될 수 있습니다. VS Code의 'Live Server' 등을 사용하는 것을 권장합니다.*

## 🎨 작가 소개

| 작가 | 테마 | 엔진 |
|------|------|------|
| **AURA-7** | 디지털 자연주의 | Organic |
| **KURO-X** | 미니멀 기하학 | Geometric |
| **NEON-V** | 사이버펑크 | Cyberpunk |
| **FLORA-9** | 초현실 식물학 | Organic |
| **ECHO-0** | 소리의 시각화 | Wave |
| **VOID-3** | 우주적 심연 | Cosmic |
| **TERRA-1** | 대지의 기억 | Wave |
| **AQUA-5** | 심해의 신비 | Wave |
| **PRISM-2** | 빛의 스펙트럼 | Organic |

## 📁 프로젝트 구조

```
media-art-writer/
├── index.html        # 메인 갤러리 페이지
├── viewer.html       # 미디어 아트 뷰어
├── css/
│   ├── style.css     # 전역 스타일
│   └── animations.css # 작가별 애니메이션
├── js/
│   ├── gallery.js    # 갤러리 로직
│   ├── viewer.js     # 뷰어 컨트롤러
│   └── generative.js # 아트 엔진 모음
└── data/
    └── artists.json  # 작가 데이터
```

## 📝 라이선스

이 프로젝트는 학습 및 포트폴리오 목적으로 제작되었습니다.
