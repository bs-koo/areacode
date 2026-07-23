# 개선 전략 B — 리프레시 (Refresh)

- **대상**: 행정구역코드 변환 도구(areacode) 디자인 리뉴얼
- **철학**: 디자인 시스템(토큰·컴포넌트)을 전면 재정의하되, 정보구조(4탭 IA)와 핵심 정보설계(digit-diff 강조 로직)는 계승. 최소개입보다 과감하되 전면 재설계는 아님.
- **작성일**: 2026-07-23
- **참조**: `outputs/brief/2026-07-23_areacode_redesign-brief.md`, `outputs/research/2026-07-23_areacode_audit-axisA-goal-fit.md`, `outputs/research/2026-07-23_areacode_audit-axisB-quality.md`, `index.html`, `css/style.css` 전문

---

## 1. 전략 개요

이 전략은 정보구조와 diff 강조 로직이라는 "이미 잘 만든 뼈대"는 건드리지 않고, 그 위에 입은 표면 처리(그라디언트·과다 그림자·글래스모피즘)와 색 체계(4색이 동시에 강하게 작동)와 타이포 위계(가장 큰 글자가 22px에 그치는 납작함)를 레퍼런스 톤(정제된 개발자 도구/핀테크 대시보드)에 맞춰 전면 재정의하는 데 집중한다. 값 몇 개만 바꾸는 '최소개입'도 아니고, IA까지 포함해 전부 새로 짜는 '전면 재설계'도 아니다 — 색·타이포·radius·shadow 디자인 토큰 세트를 처음부터 다시 정의하고, 그 토큰을 헤더·네비·버튼·표·배지 등 **기존 컴포넌트 구조에 그대로 이식**해 "같은 도구, 다른 옷"이라는 인상을 만든다. 동시에 신뢰성에 직결되는 두 결손(출처·기준일 미표기, 로딩 피드백 부재)과 모바일 대용량 표 문제까지 컴포넌트 레벨 변경으로 실질적으로 해소해, 표면만 바꾼 리스킨이 아니라 완성도까지 끌어올리는 리프레시를 지향한다.

---

## 2. 해결하는 진단 이슈 목록 (1:1 매핑)

| 진단 이슈 번호 | 이슈 요약 | 대응 방식 |
|---|---|---|
| **A-C1** | 표면 처리(그라디언트 3곳·대형 그림자·글래스모피즘·큰 호버 리프트)가 "플랫 카드" 위반 | 헤더·버튼·코드블록 그라디언트 전량 단색 교체, 카드 그림자를 `--shadow-1`(정지)/`--shadow-2`(hover만) 2단으로 축소, nav `backdrop-filter` 제거, hover 변위를 `translateY(-1px)`로 축소 |
| **A-C2** | 출처·기준일 표기가 법정동 탭에만 있고 3개 탭 누락 | `.data-source` 컴포넌트를 4개 탭 공통 표준화, 섹션 헤딩 하단에 출처·기준일 문구 통일 삽입 |
| **A-C3** | 색상이 파랑·초록·빨강·앰버 4계열 동시 작동, "무채색+포인트 1개"와 근본 괴리 | 상태색(신규/변경/폐지)을 행 전체 배경 풀칠 → 좌측 2px 마커+저채도 텍스트 배지로 전환, "변경" 상태는 별도 채도 없이 중립 회색 마커로 처리(실제 강조는 앰버 digit-diff가 전담), 파랑은 인터랙션 전용 accent 1개로 통합, 앰버는 digit-diff 전용 포인트로 유지 |
| **A-M1** | 로딩 상태 피드백 전 탭 부재 | 버튼 pending 상태(스피너+비활성) CSS 신설, 결과 컨테이너에 "조회 중…" 인라인 표시 |
| **A-M2** | 타이포 위계 납작(최대 22px), h1(18px)이 브랜드 존재감 약함 | h1 28px/700, h2 24px/700로 스케일 확대·재배치 |
| **A-M3** | 장식 요소 과다(스태거 애니메이션·도트 scale·code-badge scale) | 타임라인 스태거 애니메이션·도트 hover scale·code-badge hover scale 제거, 색/보더 전환만 남김 |
| **A-M4** | 헤더 밀도 과다·여백 부족 | 헤더를 라이트 배경으로 재구성하며 상하 패딩 16px→32~40px 확대, 타이틀-부제 수직 배치로 재구성 |
| **A-미너1** | 버튼/헤더 그라디언트 → 단색 권장 | A-C1과 통합 처리 |
| **A-미너2** | h2 weight 800 과함 | A-M2 타이포 스펙에 weight 700으로 포함 |
| **A-미너3** | radius 2/3/8/12px 불일치 | `--radius-lg`(12)/`--radius`(8)/`--radius-sm`(4)/`--radius-pill`(100) 4단으로 통일 |
| **A-미너4** | 한글 라벨 uppercase 무의미 | `.form-group label`에서 `text-transform`/`letter-spacing` 제거 |
| **A-미너5** | digit-diff 배경+글자색+inset shadow 3중 마감 | inset box-shadow 제거, 배경+글자색 2요소만 유지 |
| **A-미너6** | 카드 hover 리프트(`-3px`) 과함 | `translateY(-1px)` + `--shadow-2`로 축소 (A-C1과 통합) |
| **B-C1** | 모바일(640↓) 대용량 표(4열·8열) 실사용성 미완, 모바일 실검증 흔적 없음 | 지역코드 변환·법정동 검색 결과 표를 640px 이하에서 **카드형 레이아웃**(행→라벨:값 스택)으로 전환. `app.js`/`bjd.js` 렌더 템플릿에 `data-label` 속성 추가 |
| **B-C2** | 동적 결과·오류의 상태 전이 피드백 부재(접근성+로딩) | 3개 `.result-container`에 `role="status" aria-live="polite"` 부여, 오류 메시지에 `role="alert"` 부여, 버튼 로딩 상태 신설(A-M1과 통합) |
| **B-M1** | 시도코드 표 2열이 660px 고정, 우측 대량 공백 | `#section-sido .result-container` 폭을 480px로 축소(폼은 660px 유지) |
| **B-M2** | 전역 타이틀(h1) < 섹션 타이틀(h2), 위계 역전 | A-M2 타이포 재설계로 h1(28px) > h2(24px) 정상화 |
| **B-M3** | 폼 라벨 전역 uppercase, 한글에 무의미 | A-미너4와 동일 이슈, 동일 대응으로 해소 |
| **B-M4** | 상시 비어 있는 열(삭제일·리명)이 고정폭 낭비 | 빈 셀에 대시(–) placeholder 처리로 시선 낭비 완화 (열 조건부 토글 기능은 미룸, 3장 참조) |
| **B-M5** | 로딩 상태 부재(시각 관점) | A-M1/B-C2와 통합 처리 |
| **B-N2** | 검색 아이콘 이모지 의존, SVG 톤과 불일치 | 이모지 → 기존 copy-icon과 동일한 인라인 SVG 돋보기로 교체 |
| **B-N3** | nav-btn 명시적 `:focus-visible` 부재 | `.nav-btn:focus-visible` 아웃라인 규칙 추가 |

---

## 3. 해결하지 못하는 / 미룬 이슈 (명시적)

이 전략은 "리프레시"이지 "전면 재설계"가 아니므로, 다음 항목은 **의도적으로 이번 라운드 범위 밖**에 둔다.

1. **B-M4의 절반(열 조건부 토글 기능)** — 빈 셀 대시 처리까지만 이번에 하고, "검색 맥락별로 열을 접고 펴는" 인터랙티브 기능은 새 기능 추가에 해당해 미룬다. 리프레시는 기존 컴포넌트를 다듬는 것이지 새 상호작용을 발명하는 것이 아니다.
2. **B-N4 (건수 중복 표기: "118건 검색됨" vs "총 118건")** — 카피/콘텐츠 정리 사안으로, 시각 디자인 토큰과 무관해 별도 콘텐츠 QA 패스로 미룬다.
3. **B-N5 (입력 힌트 3중 반복: 라벨·placeholder·오류메시지)** — 동일 사유로 카피 정리 후속 작업으로 미룬다.
4. **B-N6 (코드 패널 다크/라이트 경계 톤 점프)** — 원 감사 자체가 "의도적 대비로 타당하다"고 평가한 항목이라, 이번 라운드에서는 현행 유지하고 우선순위에서 제외한다.
5. **B-C1의 완전한 대안(핵심 열 sticky 고정)** — 카드뷰 방식을 채택했으므로 sticky 좌측열 고정은 병행하지 않는다. 두 방식을 동시에 구현하는 것은 과잉이다.
6. **브랜드 색상 계열의 전면 교체(예: 파랑 → 인디고/무채색 계열)** — 브리프는 파랑 브랜드 컬러도 재검토 허용했으나, 이 전략은 "리프레시"이므로 기존 파랑 정체성을 계승하되 토큰 수(6개 파랑 계열 변수 → accent 3종)만 정리한다. 색상 계(hue) 자체의 전환은 다루지 않는다.
7. **전체 WCAG 대비 감사 및 다중 브라우저 스크린리더 실측 QA** — 이번 전략은 `aria-live`/`role="alert"` 부여와 로딩 상태 신설까지를 설계 범위로 삼고, 구현 이후의 전수 접근성 테스트는 구현 단계의 QA 몫으로 남긴다.
8. **시각 목업(Figma/.pen) 제작** — 별도 디자인 파일 없이 토큰·컴포넌트 명세를 코드 레벨로 직접 정의한다. 실제 검증은 브라우저에서 HTML/CSS 반영 후 진행한다.

---

## 4. 구체적 변경 명세

### 4.1 신규 디자인 토큰 세트

```css
:root {
  /* ---- 무채색 베이스 ---- */
  --ink-900: #0f172a;   /* 헤딩, 본문 강조 */
  --ink-700: #334155;   /* 보조 텍스트 */
  --ink-500: #64748b;   /* 메타/캡션 */
  --ink-300: #cbd5e1;   /* 비활성/placeholder */
  --surface-0: #ffffff; /* 카드, 헤더, 네비 배경 */
  --surface-1: #f8fafc; /* 페이지 배경, th 배경 */
  --surface-2: #f1f5f9; /* hover 배경, 칩 배경 */
  --line: #e2e8f0;      /* 기본 1px 보더 */
  --line-strong: #cbd5e1; /* 인풋 보더 등 강조 보더 */

  /* ---- 포인트 1: accent(파랑, 인터랙션 전용) ---- */
  --accent: #2563eb;
  --accent-strong: #1d4ed8;
  --accent-subtle: #eff6ff;

  /* ---- 포인트 2: 앰버(digit-diff 전용, 유지) ---- */
  --diff-bg: #fde68a;
  --diff-fg: #92400e;
  --diff-line: #d97706;

  /* ---- 상태 마커(면적 최소화 — 좌측 마커+텍스트 배지 전용) ---- */
  --state-new: #15803d;
  --state-new-bg: #f0fdf4;
  --state-abolished: #b91c1c;
  --state-abolished-bg: #fef2f2;
  --state-changed: #64748b; /* 채도 없음 — "무엇이 바뀌었는지"는 앰버 digit-diff가 전담 */

  /* ---- 형태 ---- */
  --radius-lg: 12px;
  --radius: 8px;
  --radius-sm: 4px;
  --radius-pill: 100px;

  /* ---- 그림자(플랫 지향, 2단으로 축소) ---- */
  --shadow-1: 0 1px 2px rgba(15,23,42,.04);   /* 정지 상태 카드 */
  --shadow-2: 0 2px 6px rgba(15,23,42,.06);   /* hover 상태만, 이 이상 쓰지 않음 */
  --shadow-focus: 0 0 0 3px rgba(37,99,235,.15);

  --font: 'Pretendard Variable', ...; /* 유지 */
  --font-mono: ui-monospace, ...;     /* 유지 */
  --transition-fast: .15s ease;
  --transition: .25s ease;

  --shell: 1200px;
  --shell-wide: 1440px;
}
```

기존 `--primary/--primary-dark/--primary-light/--primary-lighter/--accent/--accent-light` 6개 파랑 계열 변수는 `--accent/--accent-strong/--accent-subtle` 3개로 통합한다. `--warning`/`--warning-light`는 더 이상 "변경" 상태의 기본 색으로 쓰지 않는다(앰버는 digit-diff 전용으로 격리). `--shadow-sm/--shadow/--shadow-lg` 3단은 `--shadow-1/--shadow-2` 2단으로 축소하고 `0 10px 40px` 대형 그림자는 완전히 제거한다.

### 4.2 타이포 스케일

| 용도 | 기존 | 변경 |
|---|---|---|
| 사이트 타이틀 (h1) | 1.15rem(18.4px) / 700 | **1.75rem(28px) / 700**, `letter-spacing:-.02em` |
| 섹션 타이틀 (h2) | 1.4rem(22.4px) / 800 | **1.5rem(24px) / 700**, `letter-spacing:-.02em` (h1보다 반드시 작게 — 위계 역전 해소) |
| 서브헤딩 (h3, code-gen-header) | .95rem / 700 | 1rem(16px) / 600 |
| 본문 | 14px / 400 | 유지 |
| 메타/캡션(subtitle, data-source) | .8rem / 400 | .8rem(13px) / 500, `color: var(--ink-500)` |
| 배지/마이크로 라벨 | .72~.78rem | .74rem(12px) / 600 유지 |

### 4.3 컴포넌트별 변경

**헤더 (`.site-header`)** — 다크 네이비 그라디언트 배너 → 라이트 플랫 헤더로 재구성 (A-C1, A-M2, A-M4, B-M2 동시 해소)
```css
.site-header {
  background: var(--surface-0);
  border-bottom: 1px solid var(--line);
  padding: 32px 0;
}
/* ::after 그라디언트 언더라인 삭제 */
.header-inner {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: var(--shell); margin: 0 auto; padding: 0 24px;
}
.header-top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.site-header h1 { font-size: 1.75rem; font-weight: 700; color: var(--ink-900); letter-spacing: -.02em; }
.site-header .subtitle { font-size: .85rem; color: var(--ink-500); }
.header-badge {
  padding: 3px 12px; border: 1px solid var(--line); border-radius: var(--radius-pill);
  font-size: .74rem; font-weight: 600; color: var(--ink-500); background: transparent; /* 배지 배경 채움 제거, 아웃라인만 */
}
```
> HTML 변경: `.header-inner` 내부에 `.header-top`(h1+badge) 래핑 div 1개 추가, subtitle은 그 아래 별도 줄로 배치.

**네비게이션 (`.nav-bar`)** — 글래스모피즘 제거, 그림자 제거
```css
.nav-bar {
  background: var(--surface-0);
  border-bottom: 1px solid var(--line);
  /* backdrop-filter, box-shadow 삭제 */
}
.nav-btn.active { background: var(--accent); color: #fff; /* box-shadow 삭제 */ }
.nav-btn:hover { background: var(--accent-subtle); color: var(--accent); }
.nav-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

**버튼 (`.query-btn`)** — 그라디언트 → 단색 + 로딩 상태 신설 (A-C1, A-M1, B-C2, B-M5)
```css
.query-btn {
  background: var(--accent); box-shadow: none;
}
.query-btn:hover { background: var(--accent-strong); }
.query-btn[data-loading="true"] {
  color: transparent; pointer-events: none; position: relative;
}
.query-btn[data-loading="true"]::after {
  content: ''; position: absolute; inset: 0; margin: auto; width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%;
  animation: btn-spin .6s linear infinite;
}
@keyframes btn-spin { to { transform: rotate(360deg); } }
```
> JS 변경(app.js/bjd.js): 조회/검색 버튼 클릭 시 `data-loading="true"` 세팅 후 결과 렌더 완료 시 해제. 데이터가 로컬이라 체감 지연이 짧더라도, 최소 150~200ms는 로딩 상태를 유지해 "눌렸다"는 피드백을 보장.

**결과 영역 (`.result-container`)** — 라이브 리전 부여 (B-C2)
```html
<div class="result-container" id="sido-result" role="status" aria-live="polite"></div>
<div class="result-container" id="convert-result" role="status" aria-live="polite"></div>
<div class="result-container" id="bjd-result" role="status" aria-live="polite"></div>
```
오류 메시지 템플릿에는 `role="alert"` 별도 부여(`.error-msg[role="alert"]`). 대량 결과(수십~백건)를 라이브 리전이 전부 읽지 않도록, 구현 단계에서는 표 자체가 아니라 "n건 검색됨" 요약 문장만 담는 별도 `sr-only` 라이브 리전으로 분리하는 방안을 우선 검토.

**카드(`.timeline-card`, `.query-form`, `.event-block`, `.code-gen-section`)** — 그림자 2단화, hover 축소 (A-C1, A-미너6)
```css
.timeline-card, .query-form, .event-block, .code-gen-section, .bjd-pagination, .table-wrap {
  box-shadow: var(--shadow-1); border: 1px solid var(--line);
}
.timeline-card:hover { box-shadow: var(--shadow-2); transform: translateY(-1px); }
```
타임라인 도트 hover `scale(1.2)` 및 링 그림자, code-badge hover `scale(1.03)`, 스태거 `fadeInUp` 애니메이션은 전량 삭제(A-M3). 색/보더 전환만 남긴다.

**상태색 재편 — 행 배경 풀칠 → 좌측 마커+배지 (A-C3)**
```css
/* 기존: .row-new td { background:#f0fdf4 } 등 전체 셀 배경 채움 → 삭제 */
.row-new    { border-left: 2px solid var(--state-new); }
.row-changed{ border-left: 2px solid var(--state-changed); }
.row-abolished { border-left: 2px solid var(--state-abolished); opacity: .8; }

.change-note.new       { color: var(--state-new); background: var(--state-new-bg); border: 1px solid #bbf7d0; }
.change-note.abolished { color: var(--state-abolished); background: var(--state-abolished-bg); border: 1px solid #fecaca; }
.change-note.changed   { color: var(--state-changed); background: var(--surface-2); border: 1px solid var(--line); }
```
"변경" 상태는 더 이상 앰버 계열을 쓰지 않는다 — 채도 없는 회색 마커로만 표시하고, 실제 "무엇이 바뀌었는지"는 셀 내부의 `.digit-diff` 앰버가 전담한다. 이렇게 하면 화면 전체에서 채도 있는 색은 accent(파랑, 인터랙션)·state-new(초록)·state-abolished(빨강)·diff(앰버) 4개로 줄되, 각각 면적이 작아(마커 2px·배지·텍스트 강조) "무채색+포인트" 인상에 근접한다.

**digit-diff 단순화 (A-미너5)**
```css
.digit-diff {
  background: var(--diff-bg); color: var(--diff-fg);
  font-weight: 700; border-radius: var(--radius-sm); padding: 1px 2px;
  /* inset box-shadow 제거 */
}
```

**출처·기준일 표준화 (A-C2)**
```css
.data-source {
  font-size: .8rem; color: var(--ink-500); margin-top: 8px;
  padding-top: 8px; border-top: 1px dashed var(--line);
}
```
4개 탭 `.section-heading` 하단에 동일 톤으로 삽입:
- 변경 이력: "데이터 출처: 행정안전부·국토교통부 공개데이터 · 기준일 2026.06.30"
- 시도코드 조회: "데이터 출처: 행정안전부 시도코드 고시자료 · 기준일 2026.06.30"
- 지역코드 변환: "데이터 출처: 행정안전부·국토교통부 변경이력 데이터 · 기준일 2026.06.30"
- 법정동 검색: 기존 문구 유지, 공통 컴포넌트 스타일만 통일

**모바일 대용량 표 → 카드형 레이아웃 (B-C1)**
```css
@media (max-width: 640px) {
  #convert-result .data-table, #bjd-result .data-table,
  #convert-result .data-table tbody, #bjd-result .data-table tbody,
  #convert-result .data-table tr, #bjd-result .data-table tr,
  #convert-result .data-table td, #bjd-result .data-table td {
    display: block; width: 100%;
  }
  #convert-result .data-table thead, #bjd-result .data-table thead {
    position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); /* sr-only, 스크린리더용으로만 유지 */
  }
  #convert-result .data-table tr, #bjd-result .data-table tr {
    border: 1px solid var(--line); border-radius: var(--radius); margin-bottom: 10px; padding: 10px 14px;
  }
  #convert-result .data-table td, #bjd-result .data-table td {
    display: flex; justify-content: space-between; gap: 12px; padding: 6px 0;
    border-bottom: 1px solid var(--surface-2);
  }
  #convert-result .data-table td:last-child, #bjd-result .data-table td:last-child { border-bottom: none; }
  #convert-result .data-table td::before, #bjd-result .data-table td::before {
    content: attr(data-label); font-weight: 600; color: var(--ink-500); flex-shrink: 0;
  }
}
```
> JS 변경(app.js — 변환 결과 렌더 / bjd.js — 검색 결과 렌더): 각 `<td>`에 대응 컬럼명을 `data-label` 속성으로 부여. 예: `<td data-label="변환전 코드">...</td>`. 지역코드 변환(4열)·법정동 검색(8열) 두 표 모두 적용. sticky 열 고정 방식 대신 카드형을 택한 이유는, 변환 표는 "좌 코드 ↔ 우 코드" 대조가 핵심이라 sticky만으로는 우측 열이 화면 밖에 남는 문제가 해결되지 않고, 법정동 표는 검색 후 "한 행의 전체 정보"를 읽는 용도라 카드 스택이 스캔 동선에 더 맞기 때문이다.

**빈 셀 대시 처리 (B-M4 일부)**
JS 렌더 시 값이 없는 셀(삭제일·리명 등)은 빈 문자열 대신 `–`를 명시적으로 출력. `td:empty::before{content:'–'; color:var(--ink-300)}`를 CSS 폴백으로 추가하되, 실제로는 JS에서 값을 채워 넣는 쪽을 우선한다(진짜 빈 엘리먼트는 `:empty`가 신뢰성 있게 걸리지 않을 수 있음).

**폼 라벨 (A-미너4, B-M3)**
```css
.form-group label {
  font-size: .8rem; font-weight: 600; color: var(--ink-700);
  /* text-transform, letter-spacing 삭제 */
}
```

**시도코드 결과 폭 (B-M1)**
```css
#section-sido .result-container { max-width: 480px; }
/* .query-form은 660px 유지 (입력 2개 + 버튼 + 아이콘이 들어갈 폭 필요) */
```

**검색 아이콘 (B-N2)**
`&#128269;` 이모지 → `.copy-icon`과 동일한 `stroke="currentColor"` 인라인 SVG 돋보기로 교체, 크기 14~16px.

---

## 5. 해결 범위 / 리스크 / 예상 작업량

### 해결 범위 요약
- **Critical 5건 전부 해소**: A-C1, A-C2, A-C3, B-C1, B-C2
- **Major 9건 중 8.5건 해소**: A-M1~M4 전부, B-M1~M3·M5 전부, B-M4는 절반(대시 처리만, 열 토글은 미룸)
- **Minor 다수 해소**: A-미너 6건 전부, B-N2·N3 해소 / B-N1·N4·N5·N6은 미룸(3장 참조)

### 리스크
1. **헤더 다크→라이트 전환**은 가장 눈에 띄는 변화이자 가장 큰 트레이드오프다. 기존 네이비 배너가 일종의 브랜드 신호였다면 그 신호를 잃는다. 다만 성공 기준이 "확 달라진 첫인상"이므로 이 트레이드오프는 의도된 효과에 가깝다. 되돌리기는 CSS 토큰 값 롤백만으로 가능해 리스크 자체는 낮다.
2. **모바일 카드뷰 전환**은 `app.js`/`bjd.js`의 렌더 템플릿(td 생성부)을 직접 수정하므로, 컬럼-라벨 매핑 오타나 누락 같은 회귀 위험이 있다. 배포 전 4개 탭 전체를 실제 모바일 폭(360/390px)에서 시각 검증해야 한다(축B 감사가 "모바일 실검증 흔적 없음"을 지적한 바로 그 지점).
3. **행 배경색 제거(→좌측 마커+배지)**는 의도한 대로 색 면적을 줄이는 효과와 별개로, 색맹 사용자 기준으로는 오히려 개선이다 — 배경색 하나에만 의존하던 기존 방식보다 마커+텍스트 배지 이중 신호가 접근성에 유리하다.
4. **`aria-live="polite"`를 결과 컨테이너 전체에 부여**하면 대량 검색 결과(수십~백건)가 스크린리더에 전부 낭독될 위험이 있다. 구현 단계에서 "표 전체"가 아니라 "n건 검색됨" 요약 문장만 별도 sr-only 라이브 리전에 넣는 대안을 검토해야 한다 — 이 전략 문서는 방향만 제시하고 최종 구현 방식은 구현 단계에서 확정한다.
5. **파랑 계열 변수 통합(6개→3개)**은 `style.css` 전체에서 `--primary`/`--accent` 계열을 참조하는 모든 규칙을 일괄 치환해야 해, 전역 치환 특성상 누락 시 색이 깨진 채 남을 수 있다. 단계적으로(헤더→네비→버튼→배지 순) 적용하며 각 단계마다 화면 확인 권장.

### 예상 작업량 (1인 기준)
| 작업 | 규모 |
|---|---|
| 토큰(색·타이포·radius·shadow) 재정의 | 반나절 |
| 헤더/네비 리디자인(마크업+CSS) | 반나절 |
| 상태색 재편(행배경 제거→마커+배지) + digit-diff 단순화 | 반나절 미만 |
| 출처·기준일 4탭 표준화 | 1시간 내외 |
| 로딩 상태(버튼 스피너) + aria-live 부여 | 반나절 |
| 모바일 카드형 테이블(CSS+JS 렌더 템플릿 수정+실기기 검증) | 1일 내외 |
| 마이너 정리(라벨·아이콘·포커스링·시도 표 폭) | 반나절 |
| **합계** | **약 2.5~3.5일**, 리뷰·모바일 검증 포함 시 **4일 내외** |
