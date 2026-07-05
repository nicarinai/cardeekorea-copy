# cardee Xeno Landing Page

cardee Xeno의 2.00mm 초슬림 구조, 펼침 동작, 일상 사용 장면을 한 페이지 안에서 단계적으로 전달하는 반응형 브랜드 랜딩페이지입니다.

## 실행

별도 빌드 없이 정적 서버에서 실행합니다. `site` 폴더에서 다음 명령을 사용합니다.

```powershell
python -m http.server 8091
```

브라우저에서 `http://127.0.0.1:8091`을 엽니다. `file://`로 직접 열면 브라우저 보안 정책과 모듈 로딩 차이 때문에 검증 결과가 달라질 수 있으므로 로컬 서버 사용을 기본으로 합니다.

## 경험 구조

1. **Hero** — 제품 전체와 핵심 가치 제안을 한 화면에서 전달합니다.
2. **Premise** — 좌·우 거치 각도와 2.00mm 측면을 짧은 합성 모션으로 압축합니다.
3. **Motion / Orbit** — 112개 WebP 프레임을 스크롤 위치에 연결해 제품 각도를 직접 탐색하게 합니다.
4. **Details** — Thinness, Attachment, Grip, Orientation을 동일한 탭 모듈로 비교합니다.
5. **Everyday** — Workday와 Quiet 장면으로 기능을 일상 효용으로 번역합니다.
6. **Colors** — 버튼과 결과 이미지를 같은 화면에 유지하며 세 컬러를 전환합니다.
7. **Craft / Closing** — 설계 태도와 최종 브랜드 메시지를 정리합니다.

전역 스크롤 스냅은 사용하지 않습니다. 사용자의 휠 민감도와 화면 높이에 따라 예상 밖의 점프가 발생하지 않도록 일반 섹션은 자유 스크롤을 유지하고, 프레임 진행 자체가 정보인 Orbit만 sticky 구간으로 구성합니다.

## 주요 파일

- `index.html` — 페이지 콘텐츠와 시맨틱 구조
- `css/style.css` — 디자인 토큰, 컴포넌트, 모션, 반응형 스타일
- `js/product-data.js` — Orbit 프레임 경로와 컬러 데이터
- `js/main.js` — 페이지 상태, Orbit, Premise, Feature, Everyday, Color 인터랙션
- `DESIGN_RATIONALE.md` — 제품 명제, 시각 철학, 인지 원칙, 섹션별 구현 근거
- `assets/sequence/orbit/` — 스크롤 회전 프레임 112개
- `assets/images/editorial/` — 원본 편집 이미지
- `assets/images/responsive/` — 모바일·태블릿용 960px 이미지
- `scripts/build-orbit-frames.ps1` — 원본 영상에서 Orbit 프레임을 재생성하는 스크립트
- `scripts/build-responsive-images.ps1` — 반응형 이미지를 재생성하는 스크립트

## 프레임과 반응형 이미지 재생성

FFmpeg가 PATH에 있는 상태에서 프로젝트 루트에서 실행합니다.

```powershell
.\scripts\build-orbit-frames.ps1
.\scripts\build-responsive-images.ps1
```

Orbit 스크립트는 원본 세로 영상의 1초부터 14초 구간을 초당 8프레임으로 추출해 608×1080 WebP 112개를 생성합니다.

## Details 모듈 확장

새 정보는 탭과 패널을 한 쌍으로 추가합니다. `data-feature-tab`과 `data-feature-panel` 값, ARIA 연결 ID를 동일하게 유지해야 합니다.

```html
<button
  id="feature-tab-material"
  type="button"
  role="tab"
  aria-selected="false"
  aria-controls="feature-panel-material"
  data-feature-tab="material">
  <span>05</span><b>Material</b><small>Surface finish</small>
</button>

<article
  class="feature-panel"
  id="feature-panel-material"
  role="tabpanel"
  aria-labelledby="feature-tab-material"
  data-feature-panel="material"
  hidden>
  <div class="feature__media">...</div>
  <div class="feature__copy">...</div>
</article>
```

재질·표면 마감, 지원 거치 각도, 힌지 반복 내구성, 무선 충전 영향 등 정보가 확정되면 같은 위계로 확장할 수 있습니다. 현재 확인되지 않은 수치나 성능 주장은 추가하지 않습니다.

## 변경 전 기준

구현 전에 `DESIGN_RATIONALE.md`의 체크리스트를 확인합니다. 새로운 요소는 다음 질문에 답할 수 있어야 합니다.

- 제품 이해를 어떤 방식으로 늘리는가?
- 기존 정보와 중복되지 않는가?
- 현재 선택과 결과가 한눈에 연결되는가?
- 모션이 소비하는 시간만큼 정보를 추가하는가?
- 제품 형태와 수치를 왜곡하지 않는가?
