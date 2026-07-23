# 개선 전략 C — 전면 리뉴얼 (행정구역코드 변환 도구 areacode)

- **작성일**: 2026-07-23
- **적용 철학**: C안 — 리뉴얼(불가침 자산 없음, 전면 재검토 허용)
- **입력 문서**: `outputs/brief/2026-07-23_areacode_redesign-brief.md`, `outputs/research/2026-07-23_areacode_audit-axisA-goal-fit.md`, `outputs/research/2026-07-23_areacode_audit-axisB-quality.md`, `index.html`, `css/style.css`, 스크린샷 4장

---

## 1. 전략 개요

이 리뉴얼의 핵심 태도는 **"뼈대는 계승하고 옷을 새로 짓는다"** 다. 두 진단 리포트는 독립적으로 같은 결론에 도달했다 — 정보구조(4탭 IA)와 정보설계(digit-diff 자릿수 강조, tabular-nums 정렬, 콘텐츠별 폭 전략, 접기 아코디언, sticky 헤더, 페이지네이션)는 이미 "이 데이터 대조 도구가 무엇을 위해 존재하는가"를 정확히 이해하고 만든 자산이며, 여기에 문제를 제기한 이슈 번호가 단 하나도 없다. 반면 비주얼 시스템(색·표면·타이포·여백)은 축A·축B 양쪽에서 공통으로 지적된 결함 지대이며, 브리프가 지정한 레퍼런스 톤(Stripe·Linear류 — 거의 무채색+포인트 1개, 플랫 카드, 큰 타이포 위계, 넉넉한 여백)과 정반대 방향으로 구현돼 있다. 따라서 이번 리뉴얼은 **정보구조·정보설계는 계승, 비주얼 시스템은 전면 재정의, 상태 피드백·모바일 대응은 신규 구축**이라는 세 갈래로 나뉜다.

계승 여부를 이슈별로 스스로 판단한 근거는 다음과 같다. (1) 4탭 IA와 탭 구성은 계승한다 — 두 진단 모두 견고하다 평가했고, 순서를 바꿔야 한다는 근거가 어느 리포트에도 없다. 브리프가 "탭 순서·구성 변경도 고려하라"고 지시했기에 검토는 했으나, 사용 빈도 데이터 없이 순서를 뒤집는 것은 근거 없는 변경이라 판단해 이번 라운드에서는 보류한다(§3에 명시). (2) 탭의 시각적 표현(필박스 액티브, 글래스모피즘 nav)과 모바일에서의 표현 방식(가로 스크롤 pill)은 갈아엎는다 — 이는 IA 자체가 아니라 IA를 감싼 표면 처리이며, C1(플랫 위반)·모바일 우선 재설계 요청과 직결된다. (3) diff 강조 로직·색 격리 전략(앰버=diff 전용)은 계승하되, 상태색(신규/변경/폐지)의 "면적과 채도"는 갈아엎는다 — 축A가 "부분적 정당성 인정"이라며 정확히 이 지점을 권고했다. (4) 데이터 테이블의 모바일 렌더링 방식은 구조적으로 갈아엎는다 — 축B C1이 "핵심 과업(코드 대조)이 소형 화면에서 붕괴한다"고 지적했고 브리프도 모바일 우선 재설계를 명시했으므로, 가로 스크롤을 카드형 스택으로 교체하는 구조 변경이 정당화된다. (5) 상태 피드백 체계(로딩·aria-live)는 기존에 아예 없었으므로 계승/갈아엎기의 문제가 아니라 신규 구축이다.

---

## 2. 해결하는 진단 이슈 목록 (1:1 매핑)

| 이슈 번호 | 이슈 요약 | 대응 방식 |
|---|---|---|
| **축A-C1** | 그래디언트·대형 그림자·글래스모피즘·큰 호버 리프트가 "플랫 카드" 위반 | §4-B 표면 토큰 전면 교체: `--shadow-lg`(0 10px 40px) 삭제, 카드 그림자를 `shadow-xs`(0 1px 2px)로, 1px 보더 중심 마감. 헤더·버튼·코드블록 그래디언트 3곳 전부 단색 교체. nav-bar `backdrop-filter: blur(12px)` 제거, 불투명 배경+1px 보더로 교체. hover 리프트 `-3px → -1px` |
| **축A-C2** | 데이터 출처·기준일 표기가 법정동 탭에만 있고 3개 탭 누락 | §4-E 전 탭 공통 `.data-source` 컴포넌트 표준화 — 변경 이력/시도코드/지역코드변환 3개 탭 section-heading 하단에 동일 포맷("○○부 · YYYY.MM.DD 기준 · N건")을 신설 부착 |
| **축A-C3** | 색상 팔레트 4색 계열(파랑/초록/빨강/앰버) 과다, "무채색+포인트1" 위반 | §4-A 색 토큰 재편: 배경·카드·표를 무채색 스케일로, `.row-new/.row-changed/.row-abolished`의 배경 풀칠 제거 → 좌측 2px 마커+저채도 텍스트 배지로 면적·채도 축소. 앰버는 diff 전용 격리 계승. 브랜드 액센트(버튼/활성탭/링크)는 파랑 계열 1색만 유지·채도 절제 |
| **축A-M1** | 로딩 상태 피드백 전 탭 부재 | §4-F 버튼 `.is-loading` 상태(스피너+disabled+"조회 중…") 신규, 결과 영역 스켈레톤/인라인 로더 신규 |
| **축A-M2** | 타이포 위계 납작함(최대 22px), h1이 본문과 4px 차이 | §4-C 타이포 스케일 재설계: h1 32px/700, h2 24px/700(축B-M2와 동시 해결) |
| **축A-M3** | 장식 요소 과다(스태거 애니메이션, dot scale, badge scale) | §4-D 마이크로 모션 최소화: `fadeInUp` 스태거 제거, dot `scale(1.2)`·code-badge `scale(1.03)` 제거, hover는 색/보더 변화 위주로 절제 |
| **축A-M4** | 헤더 밀도 과다, 여백 부족 | §4-F 헤더 재구성: padding 16px→40px, 타이틀-부제-메타 수직 위계로 재배치 |
| 축A-Minor 1 | 버튼/헤더 언더라인 그래디언트 | §4-B에서 함께 해결(그래디언트 전면 제거) |
| 축A-Minor 2 | h2 weight 800 과함 | §4-C h2 weight 700으로 조정 |
| 축A-Minor 3 | radius 2px/3px 소단위 불일치 | §4-B radius 스케일 4px 배수로 통일(6/8/10) |
| 축A-Minor 4 | 한글 라벨 `text-transform:uppercase` 무의미 | 축B-M3과 동일 건, §4-E에서 함께 해결 |
| 축A-Minor 5 | digit-diff 배경+글자+inset shadow 3중 마감 | §4-A inset box-shadow 제거, 배경+글자 2중으로 절제 |
| 축A-Minor 6 | 카드 hover `translateY(-3px)` 과함 | §4-B `-1px`로 축소(축A-C1과 통합 처리) |
| **축B-C1** | 모바일 640px 이하 대용량 표 실사용성 미완 + 미검증 | §4-G 640px 이하에서 데이터 테이블을 카드형(행→라벨:값 스택) 레이아웃으로 구조 전환. 실검증(360/390px 스크린샷)은 구현 단계로 이관(§3) |
| **축B-C2** | 동적 결과·오류 상태 전이 피드백 부재(접근성+로딩) | §4-F `.result-container`에 `role="status" aria-live="polite"` 부여, 오류 시 `role="alert"`. 로딩 상태는 축A-M1과 통합 처리 |
| 축B-M1 | 시도코드 표 660px 폭에 2열만 있어 우측 공백 과다 | §4-G 시도코드 컨테이너 폭 660px → 480px로 축소 |
| 축B-M2 | 전역 타이틀(h1) < 섹션 타이틀(h2) 위계 역전 | 축A-M2와 동일 건, §4-C에서 h1(32px) > h2(24px)로 정상화 |
| 축B-M3 | 폼 라벨 전역 uppercase, 한글에 무의미 | §4-E `text-transform:uppercase` 제거, weight 600 + 컬러로 구분 대체 |
| 축B-M4 | 상시 비어있는 열(삭제일 등)이 고정폭 점유 | §4-G 빈 셀 "–" 대시 표기, 열 폭 데이터 특성에 맞게 재조정 |
| 축B-M5 | 로딩 상태 부재(시각) | 축B-C2/축A-M1과 통합 처리 |
| 축B-N2 | 검색 아이콘 이모지(🔍) 의존 | §4-D 인라인 SVG로 통일(복사 버튼과 동일 톤) |
| 축B-N3 | nav-btn `:focus-visible` 명시 부재 | §4-D nav-btn에 focus-visible 아웃라인 추가 |
| 축B-N4 | 법정동 탭 건수 중복 표기("검색됨"/"총 건수") | §4-E 상단 요약 문구로 통합, 하단 페이지네이션은 페이지 정보만 표기 |
| 축B-N5 | YYYYMM 형식 힌트 3중 반복(라벨/placeholder/에러) | §4-E 라벨은 명칭만, placeholder는 예시만, 에러 메시지만 형식 설명 담당하도록 역할 분담 |
| 축B-N6 | 코드 생성 패널 다크/라이트 경계 톤 점프 | §4-B code-gen-header 배경을 다크 계열 톤(--ink-100 대신 --ink-900 계열 옅은 버전)으로 조정해 경계 완화 |
| 축B-N1 | 헤더 padding 16px/15px 미세 비대칭 | §4-F 헤더 재구성 시 4/8px 그리드로 통일(40px/40px) |

---

## 3. 해결하지 못하는 / 미룬 이슈 (명시)

1. **축B-C1의 "모바일 실검증"** — 본 문서는 설계 명세이며 실제 브라우저 스크린샷 검증은 불가능하다. 구현 완료 후 360/390px 뷰포트에서 4탭 전체를 스크린샷으로 검증하는 절차를 구현 단계 완료 조건에 반드시 포함할 것을 명시한다.
2. **탭 순서 재배치** — 브리프가 "탭 순서·구성 변경 등 구조적 재검토를 적극 고려"하라고 지시했으나, 두 진단 리포트 어디에도 순서 자체를 문제 삼은 지점이 없고 실사용 빈도 데이터(어느 탭이 가장 많이 쓰이는지)가 없는 상태에서 순서를 뒤집는 것은 근거 없는 변경이다. "변경 이력(맥락 파악) → 시도코드/지역코드변환/법정동(실무 조회)"라는 현재 순서는 학습 곡선상 합리적이므로, 이번 라운드에서는 **탭 순서는 유지**하고 탭의 시각적 표현과 모바일 대응만 재설계한다. 향후 실사용 로그(어느 탭이 진입 직후 가장 먼저 클릭되는지)가 확보되면 재검토 대상으로 남긴다.
3. **축B-M1 대안 중 "유효기간·비고 열 추가"** — 축B는 시도코드 표 공백 해소책으로 폭 축소 또는 열 추가 두 가지를 제시했다. 열 추가는 `js/data.js`의 데이터 구조 확장이 필요해 디자인 전략 범위를 넘어서므로 채택하지 않고, 폭 축소(660px→480px)만 채택한다. 열 추가는 별도 데이터 검토 후 후속 과제로 남긴다.
4. **축B-N4~N6 등 초저비용 카피/톤 다듬기의 최종 문구 확정** — 방향은 §2에 명시했으나 실제 최종 카피(예: "검색됨" vs "결과") 확정은 구현 단계에서 짧게 조정한다.

---

## 4. 구체적 변경 명세

### 4-A. 색상 토큰 (전면 재편)

**설계 원칙**: 무채색 베이스 + 브랜드 액센트 1색(인터랙션 전용) + 앰버(diff 전용, 격리 계승) + 저채도 시맨틱 마커(신규/변경/폐지, 배경 풀칠 금지).

```css
:root {
  /* 무채색 스케일 — 기존 9단계에서 11단계로 세분화, Stripe/Linear 수준의 미세 대비 확보 */
  --ink-950: #0b0d12;
  --ink-900: #12141a;
  --ink-800: #1c1f28;
  --ink-700: #2b2f3a;
  --ink-600: #454b58;
  --ink-500: #626878;
  --ink-400: #868c99;
  --ink-300: #b0b5c0;
  --ink-200: #d8dae0;
  --ink-150: #e7e8ec;
  --ink-100: #f0f1f3;
  --ink-50:  #f7f7f9;
  --white:   #ffffff;

  /* 브랜드 액센트 — 파랑 계열 계승, 채도·명도 절제(기존 #1e40af보다 차분) */
  --accent-600: #2451c9;   /* hover, 강조 텍스트 */
  --accent-500: #2f5fe0;   /* 기본 액센트: 버튼, 활성 탭 언더라인, 링크 */
  --accent-100: #e7edfb;   /* 연한 배경(활성 상태, 안내 박스) */
  --accent-050: #f2f5fd;

  /* diff 전용 — 앰버 격리 전략 계승 (축A "부분적 정당성 인정") */
  --diff-bg:   #fde68a;
  --diff-fg:   #7c3a06;   /* 대비 강화(기존 #92400e에서 소폭 조정) */
  --diff-line: #d97706;

  /* 시맨틱 마커 — 배경 풀칠 금지, 좌측 2px 마커 + 텍스트 배지 전용 (채도·면적 축소) */
  --state-new:       #157347;  /* 텍스트/마커, 기존 success보다 저채도 */
  --state-new-bg:    #f1faf5; /* 배지 배경만, 행 배경 아님 */
  --state-changed:   #b45309;  /* 앰버보다 어두운 브라운 톤으로 diff와 구분 */
  --state-changed-bg:#fdf6ec;
  --state-abolished: #b3261e;
  --state-abolished-bg:#fdf1f0;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-pill: 999px;

  --shadow-xs: 0 1px 2px rgba(11,13,18,.05);
  --shadow-sm: 0 1px 3px rgba(11,13,18,.06);
  --shadow-focus: 0 0 0 3px rgba(47,95,224,.16);
  /* --shadow-lg 완전 삭제 (0 10px 40px 급 대형 그림자는 레퍼런스 톤에 존재하지 않음) */
}
```

- `body background`: `#f7f8fa` → `var(--ink-50)`로 계승(종이톤 유지, 미세 조정만).
- 기존 `--primary/--accent/--success/--warning/--danger` 이름은 폐기하고 위 체계로 전면 교체. (브리프가 파랑 브랜드색·앰버 diff색 모두 재검토 허용했으므로 이름 체계부터 새로 정의)

**적용 예 — 상태색 사용 방식 전환**:
```css
/* Before: 행 전체 배경 풀칠 */
.row-new td { background: #f0fdf4; }

/* After: 좌측 마커 + 텍스트 배지, 배경은 무채색 유지 */
.row-new { border-left: 2px solid var(--state-new); }
.row-new td:first-child { padding-left: 12px; }
.change-note.new { background: var(--state-new-bg); color: var(--state-new); }
```

`digit-diff`는 3중 마감(배경+글자+inset shadow) → 2중으로 절제:
```css
.digit-diff {
  background: var(--diff-bg);
  color: var(--diff-fg);
  font-weight: 700;
  border-radius: var(--radius-sm);
  padding: 1px 2px;
  /* inset box-shadow 제거 — Minor 5 해결 */
}
```

---

### 4-B. 표면·컴포넌트 (플랫화)

**헤더** — 그래디언트·그래디언트 언더라인 제거, 단색 다크 유지(공식성 신호로서 다크 자체는 유효, 문제는 그래디언트였다는 축A 판단 반영):
```css
.site-header {
  background: var(--ink-950); /* linear-gradient 삭제 */
  padding: 40px 0; /* 16px→40px, 상하 대칭(N1 해결) */
}
.site-header::after { content: none; } /* 그래디언트 언더라인 완전 삭제 */
```

**네비게이션** — 글래스모피즘 제거, 액티브 표시를 필박스→언더라인 인디케이터로:
```css
.nav-bar {
  background: var(--white); /* backdrop-filter 삭제 */
  border-bottom: 1px solid var(--ink-150);
  box-shadow: none;
}
.nav-btn.active {
  background: transparent; /* 필박스 배경 제거 */
  color: var(--ink-950);
  box-shadow: none;
  border-bottom: 2px solid var(--accent-500); /* 언더라인 인디케이터 */
}
.nav-btn:focus-visible {
  outline: 2px solid var(--accent-500);
  outline-offset: 2px;
} /* 축B-N3 해결 */
```

**카드류 (timeline-card, query-form, event-block, code-gen-section)** — 그림자 축소, 1px 보더 중심:
```css
.timeline-card, .query-form, .event-block, .code-gen-section {
  border: 1px solid var(--ink-150);
  box-shadow: none; /* shadow-sm도 걷어내고 보더만 */
}
.timeline-card:hover {
  border-color: var(--ink-300);
  box-shadow: var(--shadow-xs); /* 0 10px 40px → 0 1px 2px */
  transform: translateY(-1px); /* -3px → -1px, "미세 변위" */
}
```

**버튼** — 그래디언트 제거, 단색 액센트:
```css
.query-btn {
  background: var(--accent-500); /* linear-gradient 삭제 */
  box-shadow: none;
}
.query-btn:hover { background: var(--accent-600); }
```

**코드 생성 패널** — 그래디언트 제거 + 헤더 경계 톤 점프 완화(축B-N6):
```css
.code-pre { background: var(--ink-950); } /* linear-gradient 삭제 */
.code-gen-header { background: var(--ink-900); color: var(--ink-100); }
/* 기존 라이트 gray-50 헤더 → 다크 계열로 통일해 code-pre와의 경계 완화 */
```

**radius 통일**: 카드 10px(`--radius-lg`), 버튼/인풋 8px(`--radius-md`), 배지 6px(`--radius-sm`) — 기존 2px/3px 소단위 전부 흡수(Minor 3 해결).

---

### 4-C. 타이포그래피 (위계 재설계)

```css
:root {
  --text-display: 2rem;     /* 32px — 사이트 타이틀 h1 */
  --text-h2: 1.5rem;        /* 24px — 섹션 타이틀 */
  --text-h3: 1.125rem;      /* 18px — 카드/서브섹션 타이틀 */
  --text-body: 0.9375rem;   /* 15px — 본문(기존 14px에서 소폭 확대) */
  --text-small: 0.8125rem;  /* 13px */
  --text-micro: 0.75rem;    /* 12px — 배지/메타 */
}

.site-header h1 {
  font-size: var(--text-display); /* 1.15rem(18px) → 32px */
  font-weight: 700;
  color: var(--white);
}
.section-heading h2 {
  font-size: var(--text-h2); /* 1.4rem/800 → 24px/700 */
  font-weight: 700; /* Minor 2: 800→700 */
}
```

h1(32px) > h2(24px)로 축A-M2·축B-M2(위계 역전)를 동시 해결. 사이트 부제(`.subtitle`)는 `--text-small` + `var(--ink-400)`로 절제해 타이틀과의 대비를 명확히 한다.

---

### 4-D. 장식·아이콘·모션 감량

- `@keyframes fadeInUp`(타임라인 카드 스태거 진입) 삭제 — 카드가 즉시 나타나도록.
- `.timeline-dot:hover { transform: scale(1.2) }` 삭제 — hover는 보더 색 변화만.
- `.code-badge:hover { transform: scale(1.03) }` 삭제.
- 검색 아이콘 `&#128269;`(이모지) → 인라인 SVG로 교체(복사 버튼 SVG와 동일 stroke 스타일):
```html
<svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
```

---

### 4-E. 출처 표기 · 폼 라벨 · 카피 정리

**전 탭 공통 출처 컴포넌트** (축A-C2 해결) — 기존 법정동 탭에만 있던 `.data-source`를 4개 탭 section-heading에 표준 부착:
```html
<p class="data-source">데이터 출처: 행정안전부 · 기준일 2026.07.01 · 총 N건</p>
```
변경 이력/시도코드/지역코드변환 탭에 각 데이터 특성에 맞는 출처·기준일 문구를 동일 클래스로 추가.

**폼 라벨** (축A-Minor4/축B-M3):
```css
.form-group label {
  /* text-transform: uppercase 삭제, letter-spacing 삭제 */
  font-weight: 600;
  color: var(--ink-600);
}
```

**입력 힌트 역할 분담** (축B-N5): 라벨 "기준년월", placeholder "예: 202401", 에러 메시지에만 "YYYYMM 형식으로 입력하세요" — 3중 반복 제거.

**건수 표기 통합** (축B-N4): 법정동 탭 상단 결과 헤더에만 "총 N건" 1회 표기, 하단 페이지네이션은 "페이지 X / Y"만 표기.

---

### 4-F. 상태 피드백 신설 (로딩 · 접근성 라이브 리전)

```html
<div class="result-container" id="sido-result" role="status" aria-live="polite"></div>
```
오류 렌더 시 JS에서 `role="alert"`로 동적 전환(또는 별도 `.error-msg[role=alert]` 컨테이너 삽입).

```css
.query-btn.is-loading {
  opacity: .7;
  pointer-events: none;
}
.query-btn.is-loading::after {
  content: '';
  display: inline-block;
  width: 12px; height: 12px;
  margin-left: 8px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```
버튼 클릭 시 JS가 `.is-loading` 클래스를 토글하고 텍스트를 "조회 중…"으로 교체, 응답 도착 시 원복 + 결과를 라이브 리전에 주입. 법정동 검색(53,402건)처럼 지연 가능성이 있는 탭에 최우선 적용.

---

### 4-G. 레이아웃 · 반응형 · 정보구조

**콘텐츠 폭 전략 계승 + 조정**: 타임라인 840px, 법정동 1440px(`--shell-wide`)는 유지(계승). 시도코드는 660px → **480px**로 축소(축B-M1 해결, 2열 표에 맞는 밀착 폭).

**모바일 탭 내비게이션 재구성** (모바일 우선 재설계 요청 반영): 640px 이하에서 가로 스크롤 pill 대신 4등분 그리드로 전환:
```css
@media (max-width: 640px) {
  .nav-inner { display: grid; grid-template-columns: repeat(4, 1fr); overflow-x: visible; gap: 2px; }
  .nav-btn { padding: 10px 4px; font-size: .78rem; }
}
```

**데이터 테이블 모바일 카드 전환** (축B-C1 정면 해결) — 640px 이하에서 `.data-table`을 행→카드 스택으로:
```css
@media (max-width: 640px) {
  .data-table thead { display: none; }
  .data-table, .data-table tbody, .data-table tr, .data-table td { display: block; width: 100%; }
  .data-table tr {
    border: 1px solid var(--ink-150);
    border-radius: var(--radius-md);
    margin-bottom: 8px;
    padding: 10px 12px;
  }
  .data-table td {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 4px 0;
    border-bottom: none;
  }
  .data-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--ink-500);
    flex-shrink: 0;
  }
}
```
JS 렌더링 함수(`app.js`, `bjd.js`)에서 각 `<td>`에 `data-label` 속성만 추가하면 되므로 바닐라 CSS/JS 제약 내에서 구현 가능. 코드·명칭처럼 핵심 열을 상단에 배치하고 나머지(삭제일 등 희소 값)는 순서상 하단에 자연 배치되도록 렌더 순서 조정.

**빈 셀 처리** (축B-M4): JS 렌더링 시 값이 없는 셀에 `–`(en dash) 삽입, 삭제일/리명 열의 CSS 폭을 데이터 희소성에 맞게 유지.

**정보구조(IA)**: 4탭 구성·순서는 계승(§3-2 근거 참조). 탭 전환 애니메이션(`sectionFadeIn`)은 유지하되 duration만 절제(.35s → .2s 정도로 축소해 "장식 최소화" 방향과 조화).

---

## 5. 해결 범위 / 리스크 / 예상 작업량

**해결 범위**: 축A Critical 3건(C1/C2/C3) 전부, Major 4건(M1~M4) 전부, Minor 6건 전부. 축B Critical 2건(C1/C2) 전부, Major 5건(M1~M5) 전부, Minor 6건(N1~N6) 전부. 진단에서 지적된 이슈는 §3에 명시한 3건(모바일 실검증, 탭 순서, 열 추가 대안)을 제외하고 전부 이번 라운드에서 해소된다.

**리스크**:
1. **토큰 전면 교체에 따른 회귀 위험** — CSS 변수명 자체를 바꾸므로(`--primary`→`--accent-500` 등) 기존 클래스 전체를 grep으로 훑어 누락 없이 치환해야 한다. `style.css` 약 1,040줄 전체 재작업이 필요하며 부분 패치가 아니다.
2. **모바일 카드형 테이블은 JS 렌더링 함수 수정 동반** — `data-label` 속성 부착이 `app.js`/`bjd.js`의 테이블 렌더 함수(HTML 문자열 생성 부분) 변경을 요구한다. CSS만으로 끝나지 않는 유일한 항목.
3. **다크 헤더 유지 결정의 재검토 여지** — 그래디언트만 제거하고 다크 자체는 유지했는데, 이는 "거의 무채색" 원칙과 완전히 일치하진 않는다(다크 네이비도 유채색은 아니지만 밝은 화이트 헤더보다는 존재감이 강함). 구현 후 스크린샷에서 "여전히 무겁다"는 인상이 나오면 화이트 헤더로 전환하는 대안을 열어둔다.
4. **상태색 마커 방식 전환 시 가독성 검증 필요** — 배경 풀칠(면 전체 색칠) 대신 좌측 2px 마커로 바꾸면 "이 행이 신규/폐지다"라는 신호가 약해질 수 있다. 구현 후 실제 화면에서 마커만으로 상태 구분이 충분히 눈에 띄는지 확인이 필요하다.

**예상 작업량**: CSS 전면 재작성(토큰 체계·컴포넌트 스타일 전체) — 중~높음. HTML 변경(출처 표기 3곳 추가, aria-live 속성, data-label 속성 자리 확보) — 낮음~중. JS 변경(테이블 렌더 함수에 data-label 부착, 로딩 상태 토글 로직, aria-live 갱신) — 중. 전체적으로 "표면 재도장" 수준이 아니라 CSS 전체 재작성 + JS 일부 수정을 동반하는 중간~높은 작업량이며, 프레임워크·빌드도구 없이 바닐라로 전량 구현 가능하다(제약 조건 충족 확인 완료).
