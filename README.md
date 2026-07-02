# cardee Xeno Landing Page

`cardee Xeno`의 2.00mm 초슬림 구조와 사용 동작을 스크롤 경험으로 전달하는 반응형 브랜드 랜딩페이지입니다.

## 실행

별도 빌드 없이 정적 서버에서 실행합니다.

```powershell
python -m http.server 8091
```

브라우저에서 `http://127.0.0.1:8091`을 엽니다.

## 경험 구조

- 첫 화면에서 제품 전체가 잘리지 않는 정적 제품 비주얼
- 112개 WebP 프레임으로 구성한 스크롤 제품 회전
- 현재 제품 정보를 같은 형식으로 확장할 수 있는 Feature 모듈
- 2.00mm, Attachment, Grip을 한 화면에서 전환하는 탭형 Feature 모듈
- 제품 위치를 유지한 세 가지 컬러 전환
- 주요 챕터 사이의 근접 스크롤 스냅
- 데스크톱·태블릿·모바일 레이아웃
- 모션 감소 설정과 정적 이미지 폴백

## 주요 파일

- `index.html` — 페이지 콘텐츠와 Feature 모듈
- `css/style.css` — 디자인 토큰, 컴포넌트, 반응형 스타일
- `js/product-data.js` — 프레임 시퀀스와 컬러 데이터
- `js/main.js` — 스크롤 시퀀스, Feature 탭, 컬러 인터랙션
- `assets/sequence/orbit/` — 스크롤 회전 프레임 112개
- `scripts/build-orbit-frames.ps1` — 원본 영상에서 프레임을 재생성하는 스크립트
- `assets/images/responsive/` — 모바일·태블릿용 960px 이미지
- `scripts/build-responsive-images.ps1` — 반응형 이미지 재생성 스크립트

## 프레임 시퀀스 재생성

프로젝트 루트에서 실행합니다. FFmpeg가 PATH에 있어야 합니다.

```powershell
.\scripts\build-orbit-frames.ps1
```

스크립트는 원본 세로 영상의 1초부터 14초 구간을 초당 8프레임으로 추출해 608×1080 WebP 112개를 생성합니다.

반응형 이미지는 다음 명령으로 재생성합니다.

```powershell
.\scripts\build-responsive-images.ps1
```

## Feature 모듈 확장

새로운 제품 정보가 확정되면 `index.html`의 `.feature` 구조를 그대로 추가합니다.

```html
<article class="feature" data-feature data-snap>
  <div class="feature__media">...</div>
  <div class="feature__copy">
    <p class="eyebrow">...</p>
    <h3>...</h3>
    <p>...</p>
    <dl class="spec-list">...</dl>
  </div>
</article>
```

재질·표면 마감, 거치 각도, 세로·가로 거치, 힌지 내구성, 무선 충전 영향 등의 정보도 같은 모듈 규칙으로 추가할 수 있습니다.
