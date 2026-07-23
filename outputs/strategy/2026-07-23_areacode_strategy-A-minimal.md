# 개선 전략 A — 최소 개입 (Minimal Intervention)

- **대상**: 행정구역코드 변환 도구(areacode) 디자인 리뉴얼
- **철학**: 진단된 문제만 정밀 수정, 유지 자산(기존 코드·구조·톤) 최대 보존
- **작성일**: 2026-07-23
- **근거 문서**: `outputs/brief/2026-07-23_areacode_redesign-brief.md`, `outputs/research/2026-07-23_areacode_audit-axisA-goal-fit.md`(축A), `outputs/research/2026-07-23_areacode_audit-axisB-quality.md`(축B)
- **검토 코드**: `index.html`, `css/style.css` (전문 확인). 이하 이슈 번호는 `축A-C1` / `축B-M1` 형태로 두 축을 구분해 인용한다.

---

## 1. 전략 개요

이 안은 "옷을 갈아입힌다"가 아니라 **"솔기를 뜯지 않고 얼룩만 지운다."** 축A 진단은 표면 처리(그래디언트·대형 그림자·글래스모피즘)·색 시스템(4색 계열)·타이포 위계가 "서로 얽혀 하나의 톤을 만들고 있어 국소 수정으로는 톤이 바뀌지 않는다"고 결론 내렸지만, 이 전략은 의도적으로 그 결론의 절반만 따른다 — **값 교체만으로 해소되는 항목(그래디언트→단색, 그림자 축소, 호버 변위 축소, 타이포 사이즈/웨이트, 출처 표기 추가, ARIA 속성 추가)은 전부 수정**하되, **컴포넌트 구조를 다시 설계해야 하는 항목(색 시스템 전면 재편, 모바일 표 카드뷰 전환)은 명시적으로 미룬다.** 실제 코드를 확인한 결과 그래디언트는 정확히 4곳, `--shadow-lg` 사용처는 1곳, `backdrop-filter`는 1곳, 과도한 모션은 3곳(`fadeInUp`, `scale(1.2)`, `scale(1.03)`)뿐이었다 — 이는 "화려한 SaaS 톤"이 소수의 값에 집중되어 있다는 뜻이고, 그 값들만 갈아 끼우면 브리프가 요구한 절제된 톤에 상당히 가까워지면서도 HTML 구조·정보구조(IA)·JS 로직·기존 디자인 토큰 이름은 거의 그대로 유지할 수 있다는 뜻이다. 다만 이 전략은 축A가 "근본 방향 전환"이 필요하다고 못박은 색 재편(축A-C3)과 축B가 Critical로 지정한 모바일 대용량 표 실사용성(축B-C1)을 완전히 해결하지는 못한다 — 이 두 가지가 이 전략의 명확한 한계이자, 더 큰 개입 강도를 요구하는 다른 전략안과의 경계선이다.

---

## 2. 해결하는 진단 이슈 목록 (이슈 번호 → 대응 방식 1:1)

| # | 대응 조치 | 해소하는 이슈 | 방식 |
|---|---|---|---|
| S1 | 헤더 배경 그래디언트 → 단색(`#0f172a`) | **축A-C1** | 값 교체 (`linear-gradient(135deg,#0f172a,#16233d)` → `#0f172a`) |
| S2 | 헤더 하단 3색 그래디언트 언더라인 → `var(--primary)` 단색 2px 라인 | **축A-C1**, **축A-Minor1**(부분) | 값 교체 |
| S3 | 조회 버튼 그래디언트 → 단색(`var(--primary)` / hover `var(--primary-dark)`) | **축A-C1**, **축A-Minor1** | 값 교체, 기존 토큰(`--primary-dark`) 재사용, 신규 색 없음 |
| S4 | 코드 생성 패널 배경 그래디언트 → 단색(`#0f172a`, 기존 `--gray-900`) | **축A-C1** | 값 교체 |
| S5 | nav-bar 글래스모피즘(`backdrop-filter: blur(12px)`) 제거 → 불투명 배경 | **축A-C1** | 속성 삭제 + 배경값 교체 |
| S6 | 타임라인 카드 hover: `--shadow-lg`(0 10px 40px) → `--shadow`(0 4px 16px, 기존 토큰) 재사용, `translateY(-3px)` → `-1px` | **축A-C1**, **축A-Minor6** | 값 교체(신규 변수 불필요, 기존 `--shadow` 재사용) |
| S7 | `digit-diff` 3중 마감(배경+글자색+inset box-shadow) → 배경+글자색만, inset box-shadow 제거 | **축A-Minor5**, **축A-C3**(부분 완화 — 유일한 "포인트" 색을 더 절제되게) | 속성 삭제 |
| S8 | 타임라인 도트 hover `scale(1.2)` → `scale(1.05)`, code-badge hover `scale(1.03)` 제거, `fadeInUp` 스태거 애니메이션 제거(섹션 전환 `sectionFadeIn`은 유지) | **축A-M3** | 값 교체/속성 삭제 |
| S9 | 4개 탭 전부에 `.data-source`(기존 컴포넌트) 표기 추가 — 변경 이력/시도코드/변환 3개 탭에 신설, 법정동 탭은 유지 | **축A-C2** | 기존 컴포넌트 패턴을 3곳에 복제(신규 CSS 없음) |
| S10 | `h1` 1.15rem → 1.5rem, `h2` font-weight 800 → 700 | **축A-M2**, **축B-M2**(h1<h2 위계 역전 해소) | 값 교체 |
| S11 | 헤더 상하 패딩 16px 0 15px → 24px 0 22px(홀수 비대칭 정리 겸용) | **축A-M4**(부분), **축B-N1** | 값 교체 |
| S12 | 조회/검색 버튼에 `disabled` + 스피너 상태, 결과 컨테이너에 `aria-busy` 토글 신설 | **축A-M1**, **축B-M5** | 소규모 신규 CSS 클래스 1개 + JS 토글(3개 폼 공통 재사용) |
| S13 | `.result-container`(sido/convert/bjd, index.html:78/103/170) 에 `role="status" aria-live="polite"` 부여 | **축B-C2** | 속성 추가만(시각 변화 없음) |
| S14 | 시도코드 결과 컨테이너 폭 660px → 460px | **축B-M1** | 값 교체 |
| S15 | 폼 라벨 `text-transform: uppercase` 삭제 | **축A-Minor4**, **축B-M3** | 속성 삭제 |
| S16 | nav-btn에 `:focus-visible` 아웃라인 추가 | **축B-N3** | 신규 CSS 규칙 1줄 |
| S17 | 검색 아이콘 이모지(`&#128269;`) → 기존 copy-icon과 통일된 인라인 SVG | **축B-N2** | 마크업 교체(1곳) |
| S18 | 코드 생성 헤더 배경 `--gray-50` → `--gray-100`(다크 패널과의 톤 점프 완화) | **축B-N6** | 값 교체 |
| S19 | 모바일(≤640px) 대용량 표 첫 열 `position: sticky; left:0` 고정 + 표 하단 "좌우로 스크롤하여 전체 항목을 확인하세요" 캡션 1줄 | **축B-C1**(부분 완화, 전면 해결 아님) | CSS 전용, 신규 HTML 1줄 |

> S1~S8은 전부 `css/style.css`의 **선택자를 바꾸지 않고 선언 값만 교체**한다. S9·S13·S17·S19만 마크업이 소폭 늘어나고(기존 패턴 복제), S12만 JS 상태 로직이 신규로 추가된다.

---

## 3. 해결하지 못하는 / 미루는 이슈

| 이슈 | 왜 이 전략에서 다루지 않는가 |
|---|---|
| **축A-C3 (색상 팔레트 4색 계열 과다 — 근본 재편)** | 축A 자체가 "행 전체 배경 풀칠 → 좌측 마커+저채도 배지"로의 전환을 권고하는데, 이는 `.row-new/.row-changed/.row-abolished`, `.change-note`, `.tag`, `.impact-badge`, 타임라인 5색 좌측 보더 등 **거의 모든 컴포넌트의 배경·보더 규칙을 다시 설계**해야 하는 작업이다. S7(digit-diff 단순화)로 "포인트 색"의 절제도를 소폭 개선하지만, 4색 계열 시맨틱 시스템 자체는 그대로 남는다. **"거의 무채색+포인트 1개"라는 브리프 레퍼런스 톤에는 도달하지 못한다.**
| **축B-C1 (모바일 대용량 표 실사용성 — 카드뷰 전환)** | 완전한 해법(행→라벨:값 카드 스택, 또는 우선순위 열만 남기고 나머지 토글)은 표 렌더링 템플릿(`app.js`/`bjd.js`)과 CSS 레이아웃을 함께 다시 짜야 하는 구조적 작업이다. S19(첫 열 sticky + 스크롤 힌트)로 체감을 완화하지만, "360px 화면에서 8열 좌우 대조가 성립한다"는 축B의 기준을 완전히 충족하지는 못한다. 모바일 실기기 스크린샷 검증도 이 전략 범위 밖.
| **축A-M4 (헤더 여백 재구성 — 수직 위계 재배치)** | S11(패딩 값 확대)만 적용하고, "타이틀-부제-배지를 수직 위계로 재배치"하는 레이아웃 변경(현재 flex 한 줄 → 다단 배치)은 하지 않는다. 헤더의 `header-inner` flex 구조 자체는 유지.
| **축B-M4 (법정동 표 상시 빈 열 — 삭제일/리명)** | 값 없는 셀에 대시(–) 표기 또는 검색 맥락별 열 토글은 `bjd.js` 렌더링 로직을 건드려야 한다. 이번 검토 범위(`index.html`, `css/style.css`)를 벗어나 있어 구현 단계에서 별도 확인 필요.
| **축B-N4 (건수 중복 표기), 축B-N5 (입력 힌트 3중 반복)** | 카피/콘텐츠 편집 사안이며 CSS·구조 변경이 아니다. 우선순위 최하위로 후속 라운드에 위임.

---

## 4. 구체적 변경 명세

### 4.1 색상

| 대상 | 현재 값 | 변경 값 | 근거 |
|---|---|---|---|
| `.site-header` background | `linear-gradient(135deg,#0f172a 0%,#16233d 100%)` | `#0f172a` (기존 `--gray-900`) | S1 |
| `.site-header::after` (하단 라인) | `linear-gradient(90deg,var(--diff-line),#3b82f6 45%,#0284c7)` | `var(--primary)` 단색, height 2px 유지 | S2 |
| `.query-btn` background | `linear-gradient(135deg,var(--primary) 0%,#2563eb 100%)` | `var(--primary)` | S3 |
| `.query-btn:hover` background | `linear-gradient(135deg,#2563eb 0%,#3b82f6 100%)` | `var(--primary-dark)` (`#1e3a8a`, 기존 토큰) | S3 |
| `.code-pre` background | `linear-gradient(180deg,#0f172a 0%,#1a2332 100%)` | `#0f172a` | S4 |
| `.nav-bar` background | `rgba(255,255,255,.85)` + `backdrop-filter: blur(12px)` | `#ffffff` (blur 속성 삭제) | S5 |
| `.digit-diff` | `background:var(--diff-bg); color:var(--diff-fg); box-shadow: inset 0 -2px 0 rgba(217,119,6,.45)` | `box-shadow` 라인 삭제, 배경·글자색·weight만 유지 | S7 |
| `.code-gen-header` background | `var(--gray-50)` | `var(--gray-100)` | S18 |

> 신규 색상 변수는 추가하지 않는다. `--primary`, `--primary-dark`, `--gray-900`, `--gray-100` 등 **기존 `:root` 토큰만 재사용**한다.

### 4.2 그림자·모션

| 대상 | 현재 | 변경 | 근거 |
|---|---|---|---|
| `.timeline-card:hover` box-shadow | `var(--shadow-lg)` = `0 10px 40px rgba(0,0,0,.1), 0 4px 12px rgba(0,0,0,.05)` | `var(--shadow)` = `0 4px 16px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.03)` (기존 토큰 재사용, `--shadow-lg` 사용처는 이 1곳뿐이라 정의 자체를 지워도 무방) | S6 |
| `.timeline-card:hover` transform | `translateY(-3px)` | `translateY(-1px)` | S6 |
| `.timeline-item:hover .timeline-dot` transform | `translateY(-50%) scale(1.2)` | `translateY(-50%) scale(1.05)` | S8 |
| `.code-badge:hover` transform | `scale(1.03)` | 규칙 삭제(hover 시 별도 변형 없음) | S8 |
| `.timeline-item` animation | `fadeInUp .4s ease both` + `animation-delay: calc(var(--i,0)*.07s)` | 규칙 삭제(카드는 즉시 표시, 탭 전환 시 `.section`의 `sectionFadeIn`만 유지) | S8 |

### 4.3 타이포

| 대상 | 현재 | 변경 |
|---|---|---|
| `.site-header h1` font-size | `1.15rem` (~18.4px) | `1.5rem` (24px) |
| `.section-heading h2` font-weight | `800` | `700` |
| `.form-group label` text-transform | `uppercase` | 삭제 (letter-spacing `.04em`은 영문 약어에도 과하지 않으므로 유지) |

> h1(24px, 700) > h2(22.4px, 700) 순으로 사이즈만으로 위계가 명확해져 축B-M2(위계 역전)가 해소된다. 축A-M2가 제안한 28~32px까지는 올리지 않는다 — 이는 "부분 해결"이며, 완전한 대비 강화는 헤더 레이아웃 재구성(축A-M4 전체 해결)과 함께 가는 편이 자연스러워 이번 라운드에서는 보수적으로 잡는다.

### 4.4 여백

| 대상 | 현재 | 변경 |
|---|---|---|
| `.site-header` padding | `16px 0 15px` | `24px 0 22px` |
| `#section-sido .query-form`, `#section-sido .result-container` max-width | `660px` | `460px` |

### 4.5 컴포넌트

**출처·기준일 표기 (`.data-source`, 기존 스타일 `style.css:248-252` 그대로 재사용)**
- 변경 이력 탭 `<div class="section-heading">` 내부, `<p>` 설명 아래 추가:
  `<p class="data-source">데이터 기준: 행정안전부·국토교통부 행정구역 변경 고시 · 2026.07.01 개편 반영</p>`
- 시도코드 조회 탭:
  `<p class="data-source">데이터 기준: 행정안전부 행정구역코드(시도) · 2026.06.30 기준</p>`
- 지역코드 변환 탭:
  `<p class="data-source">데이터 기준: 행정안전부·국토교통부 행정구역 변경 고시 · 2026.06.30 기준</p>`
- (문구는 초안이며, 실제 데이터 출처·정확한 기준일은 담당자 확인 후 확정 필요 — 법정동 탭 기존 문구의 톤만 맞췄다.)

**로딩 상태 (신규, 최소 범위)**
```css
.query-btn.is-loading { opacity: .7; cursor: not-allowed; pointer-events: none; }
.query-btn.is-loading::after {
  content: '';
  display: inline-block;
  width: 12px; height: 12px;
  margin-left: 8px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: btnSpin .6s linear infinite;
  vertical-align: -2px;
}
@keyframes btnSpin { to { transform: rotate(360deg); } }
```
- JS(사이드: `app.js`, 이번 검토 범위 밖이나 연동 지점만 명시): 조회/검색 버튼 클릭 시 `is-loading` 클래스 추가 + `disabled` 속성, 렌더 완료 후 제거. 결과 컨테이너에 `aria-busy="true"`를 병행 토글.

**상태·오류 라이브 리전**
- `index.html:78, 103, 170`의 3개 `.result-container`에 `role="status" aria-live="polite"` 부여(시각 변화 없음, 오류 메시지도 같은 컨테이너 안에 렌더되므로 별도 `role="alert"` 컨테이너 분리 없이 해결).

**모바일 표 스크롤 힌트 (부분 완화)**
```css
@media (max-width: 640px) {
  .table-wrap table th:first-child,
  .table-wrap table td:first-child { position: sticky; left: 0; background: inherit; z-index: 1; }
  .table-wrap::after {
    content: '← 좌우로 스크롤하여 전체 항목을 확인하세요';
    display: block;
    font-size: .72rem;
    color: var(--gray-400);
    text-align: center;
    padding: 6px 0 0;
  }
}
```

### 4.6 접근성 폴리시

```css
.nav-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
```

---

## 5. 해결 범위 / 리스크 / 예상 작업량

### 해결 범위 요약
- **완전 해결**: 축A-C1(표면 플랫화), 축A-C2(출처 표기), 축A-M2(위계 역전 해소 수준), 축A-M3(장식 감량), 축A-Minor 1/4/5/6, 축B-C2(라이브 리전), 축B-M1(시도 표 폭), 축B-M2, 축B-M3, 축B-N3
- **부분 완화(전면 해결 아님)**: 축A-C3(색 재편 — 포인트색 절제만), 축A-M1/축B-M5(로딩 — 최소 스피너만, 스켈레톤 없음), 축A-M4(헤더 여백 — 패딩만, 재배치 없음), 축B-C1(모바일 표 — sticky+힌트만, 카드뷰 없음)
- **미해결**: 축B-M4(빈 열 처리), 축B-N4/N5(카피 정리)

### 리스크
1. **성공 기준 미달 위험(중)** — 브리프의 성공 기준은 "첫인상이 확 달라짐"인데, 이 전략은 IA·색 시스템·레이아웃 골격을 그대로 두므로 "달라졌다"는 인상보다 "더 다듬어졌다"는 인상에 가까울 수 있다. 축A 감사가 명시한 "국소 수정으로는 톤이 바뀌지 않는다"는 지적이 부분적으로 유효하다.
2. **축A-C3 미해결에 대한 재검토 리스크(중)** — 레퍼런스 톤("거의 무채색+포인트 1개")을 문자 그대로 기준 삼는 평가자라면 이 전략을 불충분하다고 판단할 수 있다.
3. **축B-C1 부분 완화의 한계(중상)** — sticky 첫 열 + 스크롤 힌트는 "코드 대조"라는 핵심 과업을 완전히 살리지 못한다. 이 항목이 축B에서 유일한 Critical 미해결 항목으로 남는다.
4. **로딩 상태 신규 구현 리스크(하)** — 버튼 3개에 공통 클래스를 적용하는 수준이라 JS 변경이 작지만, 에러 발생 시 `is-loading`/`disabled`가 풀리지 않는 엣지 케이스는 구현 시 확인 필요.
5. **`--shadow-lg` 삭제 파급 리스크(하)** — 그렙 결과 `.timeline-card:hover` 1곳에서만 사용되는 것을 확인했으므로 변수 자체를 지워도 다른 곳에 영향 없음(검증 완료).

### 예상 작업량 (체감 기준)

| 항목 묶음 | 체감 작업량 |
|---|---|
| 4.1 색상(그래디언트 4곳 → 단색, blur 제거) | 하 |
| 4.2 그림자·모션 값 교체 | 하 |
| 4.3 타이포 값 교체 | 하 |
| 4.4 여백 값 교체 | 하 |
| 출처 표기 3탭 추가 | 하 |
| 라이브 리전 속성 추가 | 하 |
| 로딩 상태(CSS+JS 신규) | 중 |
| 모바일 표 스크롤 힌트(sticky+캡션) | 하 |
| 접근성 폴리시(포커스링·아이콘 SVG화) | 하 |
| **전체 합계** | **중** (대부분 값 교체 수준의 하 작업, 로딩 상태 1건만 신규 JS 로직 필요) |

---

## 요약 한 줄
**뼈대(IA)도 근육(정보 설계)도 그대로 두고, 겉옷의 광택(그래디언트·대형 그림자·과잉 모션)만 걷어내고 단추(출처 표기·라이브 리전·로딩 상태)를 채운다 — 색 시스템 재편과 모바일 표 재설계라는 두 벌의 새 옷은 이번 라운드에서 입지 않는다.**
