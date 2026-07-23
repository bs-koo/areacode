# 제작 보고서 — 행정구역코드 변환 도구(areacode) 디자인 리뉴얼 (전략 B: 리프레시)

- **작성일**: 2026-07-23
- **대상**: `D:\SQ\areacode` (GitHub Pages, 바닐라 HTML/CSS/JS)
- **적용 전략**: `outputs/strategy/2026-07-23_areacode_strategy-B-refresh.md`
- **실제 수정 파일**: `index.html`, `css/style.css`, `js/app.js` (`js/bjd.js`는 순수 데이터 배열 파일로 판명되어 수정 대상에서 제외 — 3장 참조)
- **미수정 파일(의도적)**: `js/data.js`, `js/codegen.js`, `js/bjd.js` — 데이터 조회·변환 로직 자체는 무변경

---

## 1. 작업 배경 및 착수 상태에 대한 메모

작업을 시작하며 저장소를 확인한 결과, `index.html`과 `css/style.css`, `js/app.js`에는 이미 전략 B 명세의 대부분이 반영되어 있는 상태였다(작업 디렉터리에 uncommitted 상태로 존재, `git diff` 기준 style.css 576줄·index.html 19줄·app.js 63줄 변경). 이는 이번 세션 내에서 선행 작업된 것으로 보이며, 본 보고서는 그 상태를 이어받아 **① 명세 대비 남은 결손을 점검하고 ② 실제로 비어 있던 부분(법정동 검색 결과 표의 모바일 카드뷰 대응)을 완성한 뒤 ③ 전체를 브라우저에서 실동작 검증**하는 순서로 진행했다.

점검 결과 유일하게 미반영된 항목은 **법정동 검색 결과 표(`#bjd-result`, 8열)의 `data-label` 속성 및 빈 셀 대시 처리**였다. CSS 쪽 모바일 카드형 레이아웃 규칙(`@media (max-width: 640px)`)은 `#convert-result`와 `#bjd-result` 양쪽에 이미 정의되어 있었으나, 실제 `<td>`를 만드는 JS 렌더 함수 중 `#convert-result`를 채우는 `runConvert()`는 `data-label`이 부여된 반면 `#bjd-result`를 채우는 `renderBjdPage()`는 그대로여서, 법정동 검색 탭만 모바일에서 카드형이 아니라 빈 라벨로 깨지는 상태였다. 이 함수를 찾아 수정한 것이 이번 세션의 실질 작업이다(2장 표의 마지막 두 행).

---

## 2. 변경 내역 매핑표 (before → after → 근거)

| 항목 | Before | After | 근거 |
|---|---|---|---|
| 색 토큰 체계 | `--primary/--primary-dark/--primary-light/--primary-lighter/--accent/--accent-light`(파랑 6종) + `--success/--warning/--danger`(+`-light`) + `--gray-50~900`(9단) | `--ink-900~300`(무채색 4단) + `--surface-0~2` + `--line/--line-strong` + `--accent/--accent-strong/--accent-subtle`(3단) + `--state-new/--state-abolished/--state-changed` | A-C3, 전략§4.1 |
| radius 토큰 | `--radius:12px`, `--radius-sm:8px` 2단 정의였으나 실제 코드 곳곳에 3/8/12px 하드코딩 혼재 | `--radius-lg:12px / --radius:8px / --radius-sm:4px / --radius-pill:100px` 4단으로 통일, 하드코딩 제거 | A-미너3 |
| 그림자 토큰 | `--shadow-sm/--shadow/--shadow-lg` 3단, 최대 `0 10px 40px rgba(0,0,0,.1)` 대형 그림자 포함 | `--shadow-1(0 1px 2px)/--shadow-2(0 2px 6px)` 2단, 대형 그림자 완전 제거 | A-C1 |
| 헤더 배경 | `linear-gradient(135deg, #0f172a, #16233d)` 다크 네이비 + `::after`에 그라디언트 언더라인(앰버→파랑) | `background: var(--surface-0)` 라이트 플랫 + `border-bottom: 1px solid var(--line)`, `::after` 언더라인 삭제 | A-C1, A-M4 |
| 헤더 상하 패딩 | `16px 0 15px` | `32px 0` | A-M4 |
| 헤더 내부 구조 | h1 → subtitle → badge가 한 줄에 나열 | `.header-top`(h1+badge) wrapping div 신설, subtitle을 별도 줄로 재배치 | A-M4, 전략§4.3 |
| h1(사이트 타이틀) | `1.15rem(18.4px)/700`, 흰색 | `1.75rem(28px)/700`, `color: var(--ink-900)` | A-M2, B-M2 |
| h2(섹션 타이틀) | `1.4rem(22.4px)/800` | `1.5rem(24px)/700` — h1(28px) > h2(24px)로 위계 정상화 | A-M2, A-미너2, B-M2 |
| header-badge | `rgba(255,255,255,.08)` 반투명 필+보더, `color:#93c5fd` | `background: transparent`, `border: 1px solid var(--line)`, `color: var(--ink-500)` — 아웃라인만 | A-C1 |
| 네비게이션 배경 | `rgba(255,255,255,.85)` + `backdrop-filter: blur(12px)` + `box-shadow: 0 1px 8px` | `background: var(--surface-0)` 불투명, `backdrop-filter`/`box-shadow` 완전 제거 | A-C1 |
| nav-btn.active | `box-shadow: 0 2px 8px rgba(30,64,175,.25)` | box-shadow 제거 | A-C1 |
| nav-btn:focus-visible | 규칙 없음 | `outline: 2px solid var(--accent); outline-offset: 2px` 신설 | B-N3 |
| 섹션 전환 애니메이션 | `.section { animation: sectionFadeIn .35s ease }` + `.fade-in/.fade-out` 클래스 | 애니메이션 삭제, `display` 전환만 남김 | A-M3 |
| 타임라인 아이템 stagger | `animation: fadeInUp .4s ease both; animation-delay: calc(var(--i,0)*.07s)`, JS에서 `style="--i:${i}"` 인라인 주입 | `@keyframes fadeInUp` 및 인라인 `--i` 주입 완전 제거(CSS+JS 양쪽) | A-M3 |
| 타임라인 도트 | `box-shadow` 이중 링 + hover 시 `transform: scale(1.2)` | box-shadow 링/hover scale 제거, 정적 도트만 유지 | A-M3, A-C1 |
| 타임라인 카드 그림자/hover | `--shadow-sm`→`--shadow-lg`, hover `translateY(-3px)` | `--shadow-1`→`--shadow-2`, hover `translateY(-1px)` | A-C1, A-미너6 |
| code-badge hover | `transform: scale(1.03)` | 제거(색/보더 전환만 유지) | A-M3 |
| digit-diff 마감 | 배경+글자색+`font-weight`+`border-radius:3px`+**`box-shadow: inset 0 -2px 0 rgba(217,119,6,.45)`** 3중 | inset box-shadow 제거, `border-radius: var(--radius-sm)`(4px)로 통일, 배경+글자색 2중 마감만 유지 | A-미너5 |
| 상태색(신규/변경/폐지) 표시 | `.row-new td{background:#f0fdf4}`, `.row-changed td{background:#fff7ed}`, `.row-abolished td{background:#fef2f2;opacity:.75}` — 행 전체 셀 배경 풀칠 | `.row-new/changed/abolished td:first-child{border-left:2px solid ...}` 좌측 2px 마커만, `.row-abolished{opacity:.8}` | A-C3 |
| "변경" 상태 색상 | change-note.changed 배경 `var(--warning-light)`(앰버 계열), `color: var(--warning)` | 배경 `var(--surface-2)`(무채색), `color: var(--state-changed)`(회색) — "변경"에서 채도 제거, 실제 강조는 digit-diff 앰버가 전담 | A-C3 |
| legend 컬러칩 | `new:#bbf7d0`, `changed:#fde68a`(앰버), `abolished:#fecaca` 하드코딩 옅은색 | `--state-new`/`--state-changed`(회색)/`--state-abolished` 토큰 사용 | A-C3 |
| 폼 라벨(`.form-group label`) | `font-size:.78rem`, `text-transform:uppercase`, `letter-spacing:.04em` | `font-size:.8rem`, `text-transform`/`letter-spacing` 삭제 | A-미너4, B-M3 |
| 조회 버튼(`.query-btn`) | `background: linear-gradient(135deg, primary, #2563eb)`, `box-shadow: 0 2px 6px`, hover 시 더 진한 그라디언트+더 큰 그림자 | `background: var(--accent)` 단색, hover `var(--accent-strong)`, box-shadow 완전 제거 | A-C1, A-미너1 |
| 조회/검색 버튼 로딩 상태 | 없음(클릭 즉시 결과 전환, 피드백 부재) | `[data-loading="true"]` 시 텍스트 투명화 + `::after` 스피너(`btn-spin` 애니메이션) + `pointer-events:none`; JS `runWithLoading()`이 최소 180ms 로딩 상태 유지 후 콜백 실행 | A-M1, B-C2, B-M5 |
| 결과 컨테이너 3종(`#sido-result`,`#convert-result`,`#bjd-result`) | 역할 속성 없음 | `role="status" aria-live="polite"` 부여 | B-C2 |
| 오류 메시지(`.error-msg`) | 역할 속성 없음 | `role="alert"` 부여 (`showError()` 함수 수정) | B-C2 |
| 데이터 출처·기준일 표기 | 법정동 탭에만 존재, 나머지 3개 탭 누락 | 변경 이력·시도코드 조회·지역코드 변환 3개 탭에 `.data-source` 문단 신설, 4개 탭 공통 스타일로 통일(`font-size:.8rem`, `color:var(--ink-500)`, `border-top:1px dashed var(--line)`) | A-C2 |
| 시도코드 결과 폭 | `.result-container`가 `.query-form`과 함께 660px 공유 | `#section-sido .result-container`만 480px로 분리, `.query-form`은 660px 유지 | B-M1 |
| 지역코드 변환·법정동 검색 표(모바일 640px↓) | 표 형태 그대로 가로 스크롤만 지원 | `display:block` 기반 카드형(행→라벨:값 스택)으로 전환, `thead`는 시각적으로 숨기되 스크린리더용으로 유지(`clip:rect(0 0 0 0)`) | B-C1 |
| 지역코드 변환 결과 렌더(`runConvert()`, app.js) | `<td class="code-cell">`,`<td>`,`<td class="arrow-cell">` 등 `data-label` 없음 | 각 `<td>`에 `data-label`(변환 전 코드/명칭, 변환 후 코드/명칭) 부여, `arrow-cell`에 `aria-hidden="true"` 추가 | B-C1 |
| **법정동 검색 결과 렌더(`renderBjdPage()`, app.js) — 이번 세션 실작업** | `<td><code>${row[0]}</code></td>` 등 8개 셀 모두 `data-label` 없음, 빈 값(리명·삭제일·과거법정동코드)은 그냥 `''` 출력 → 모바일에서 라벨 없는 빈 줄로 깨짐 | 8개 셀 전부 `data-label`(법정동코드/시도명/시군구명/읍면동명/리명/생성일/삭제일/과거법정동코드) 부여, 값이 없으면 `<span class="cell-dash">–</span>`로 명시 출력 | B-C1, B-M4(절반) |
| 검색 아이콘(시도코드 조회 탭) | `&#128269;` 이모지 | `.copy-icon`과 동일 톤의 인라인 SVG 돋보기(`stroke="currentColor"`, 14×14) | B-N2 |
| warning-msg(법정동 안내 배너) | `background: var(--warning-light)` | `background: var(--diff-bg)`(앰버 토큰 재사용 — 이 문구 자체가 "주의" 성격이라 앰버 유지가 타당) | 토큰 이관(전략§4.1 부수 효과) |

---

## 3. 판단이 필요했던 지점과 그 근거

1. **`js/bjd.js`를 손대지 않은 이유**: 전략 문서 §4.3은 "`app.js`/`bjd.js`의 렌더 템플릿에 `data-label` 속성 추가"라고 명시했으나, 실제로 `js/bjd.js`(5MB, 53,414줄)를 열어보니 이 파일은 `국토교통부 전국 법정동 데이터`를 담은 순수 배열(`PROCESSED_BJD_DATA = [...]`) 하나로만 구성되어 있고 렌더링 로직이 전혀 없었다. 법정동 검색의 실제 검색·페이징·렌더 함수(`searchBjd`, `renderBjdPage`)는 전부 `js/app.js`(552번 줄 이후)에 있다. 따라서 전략 문서가 지목한 "bjd.js 렌더 템플릿" 수정은 실제로는 `app.js`의 `renderBjdPage()` 수정으로 등가 치환하여 적용했다. `js/bjd.js` 자체는 데이터 원본이므로 제약 조건("기존 데이터 로직 변경 금지")에 따라 완전히 그대로 두었다.
2. **법정동 표 컬럼 순서와 `data-label` 매핑**: `renderBjdPage()`의 `<td>` 순서는 `row[0]`(코드)→`row[1..4]`(시도/시군구/읍면동/리)→`row[6]`(생성일)→`row[5]`(삭제일)→`row[7]`(과거코드)로, 배열 인덱스 순서와 화면 표시 순서가 다르다(생성일이 배열상 6번, 삭제일이 5번). `<thead>`의 실제 헤더 문구(`법정동코드/시도명/시군구명/읍면동명/리명/생성일/삭제일/과거법정동코드`) 순서에 맞춰 `data-label`을 1:1로 부여해, 모바일 카드뷰에서 라벨과 값이 어긋나지 않도록 확인했다.
3. **빈 셀 대시 처리 범위**: 전략 문서는 "삭제일·리명 등"이라고 예시만 들었으므로, 실제 데이터 패턴(꼬리 샘플 확인 결과 리명·삭제일·과거법정동코드 세 컬럼이 대부분 공백)을 근거로 이 세 컬럼에만 대시 처리를 적용했다. 시도명·시군구명·읍면동명·법정동코드·생성일은 항상 값이 있어 대시 처리 대상에서 제외했다.

---

## 4. 해결하지 못한 / 의도적으로 미룬 항목 (전략 문서 §3과 동일, 변경 없음)

- B-M4 절반(열 조건부 토글 인터랙션) — 대시 처리까지만 적용, 신규 상호작용 발명은 리프레시 범위 밖
- B-N4(건수 중복 표기), B-N5(입력 힌트 3중 반복) — 카피 정리 사안으로 별도 QA 패스로 이관
- B-N6(코드 패널 다크/라이트 경계 톤) — 원 감사에서 "의도된 대비로 타당" 평가, 현행 유지(`code-pre`의 `linear-gradient(180deg,#0f172a,#1a2332)`가 유일하게 남은 그라디언트인 이유)
- B-C1의 완전한 대안(sticky 열 고정) — 카드뷰 채택으로 병행하지 않음
- 브랜드 색상 계열(hue) 전면 교체 — 파랑 정체성은 유지, 변수 개수만 정리
- 전체 WCAG 대비 감사, 다중 브라우저 스크린리더 실측 — 구현 단계 스코프 밖, 후속 QA 필요

---

## 5. 자체 검수 결과

1. **그라디언트 잔존 확인**: `grep -n "linear-gradient" css/style.css` → 결과 1건, `.code-pre`(코드 생성 패널 다크 배경)만 남음을 확인. 이는 전략 문서가 "의도적으로 유지"라고 명시한 유일한 예외(B-N6)이며, 헤더·버튼·타임라인 언더라인의 그라디언트는 모두 제거됨을 확인했다.
2. **구 토큰 잔존 확인**: `grep -n "primary\|warning"` → `index.html`, `js/app.js`, `css/style.css` 전체에서 `.warning-msg`(클래스명, 정상) 1건 외 `--primary*`/`--warning*`/`--gray-*` 변수 참조가 완전히 사라졌음을 확인.
3. **장식 요소 제거 확인**: `grep -n "fadeInUp\|scale(1.2)\|scale(1.03)\|backdrop-filter"` → 매치 0건. 타임라인 stagger, 도트 hover scale, code-badge hover scale, 네비 글래스모피즘이 전부 삭제됐음을 확인.
4. **폼 라벨 uppercase 제거 확인**: `grep -n "text-transform"` → 매치 0건.
5. **데이터 로직 미변경 확인**: `git status`/`git diff --stat` 기준 `js/data.js`, `js/codegen.js`, `js/bjd.js`에는 변경 사항이 전혀 없음을 확인(수정된 파일은 `index.html`, `css/style.css`, `js/app.js` 3개뿐). `js/app.js` 내 변경도 전부 마크업 속성(`data-label`, `role`, `aria-hidden`) 부여와 렌더용 문자열 템플릿 수정에 국한되며, `querySido`/`getChangesBetween`/`markDigitDiff` 등 실제 조회·변환·매핑 계산 로직 함수 본문은 건드리지 않았음을 diff로 재확인.
6. **브라우저 실동작 검증**: `python -m http.server`로 로컬 서버를 띄운 뒤 Playwright로 4개 탭 전부를 실제 클릭해 확인.
   - 변경 이력 탭: 라이트 헤더, 28px h1, 좌측 accent 보더 타임라인 카드, `.data-source` 문구, 이벤트 유형별 배지 색상 정상 렌더 확인(스크린샷).
   - 시도코드 조회 탭: 결과 컨테이너 480px 폭, 신규/폐지 항목의 좌측 마커+배지, 범례 정상 확인.
   - 지역코드 변환 탭: 조회 버튼 클릭 시 `data-loading` 속성이 실제로 `"true"`로 세팅되는 것을 JS로 검증했고, 스피너 시각 표시와 180ms 후 결과 렌더 전환, digit-diff 앰버 하이라이트를 스크린샷으로 확인.
   - 법정동 검색 탭: "역삼" 검색 실행 → 결과 표에 리명/삭제일/과거법정동코드가 대시(–)로 명시 출력됨을 확인.
   - 모바일 뷰포트(390×844)에서 지역코드 변환·법정동 검색 결과가 모두 카드형(라벨:값 스택)으로 정상 전환되고, 변환 표의 화살표 칸이 카드뷰에서 숨겨짐을 확인.
   - 브라우저 콘솔 에러 0건 확인.
7. 검증에 사용한 로컬 HTTP 서버(포트 8791)와 Playwright 브라우저 세션은 검수 완료 후 종료했다.

---

## 6. 요약

Critical 5건(A-C1, A-C2, A-C3, B-C1, B-C2) 전부 반영, Major 9건 중 8.5건(A-M1~M4 전부, B-M1~M3·M5 전부, B-M4는 대시 처리까지) 반영, Minor 다수(A-미너 6건 전부, B-N2·N3) 반영을 코드 레벨에서 확인했다. 이번 세션의 실질 기여는 선행 반영 상태를 전수 검증하고, 유일하게 비어 있던 법정동 검색 결과의 모바일 카드뷰 대응(`data-label` + 대시 placeholder)을 완성한 것이다.
