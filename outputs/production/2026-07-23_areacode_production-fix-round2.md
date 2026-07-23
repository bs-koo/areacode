# 제작 수정 보고서 (Round 2) — 3축 검수 결함 해소

- **작성일**: 2026-07-23
- **대상**: `D:\SQ\areacode` (GitHub Pages, 바닐라 HTML/CSS/JS)
- **배경**: 3축(전략일치/완성도/개선목표달성) 독립 검수에서 축B Critical 1건, 축A·축C 공통 Major 1건 발견 → 두 축 모두 Critical 0건이 되어야 `outputs/final/` 저장이 가능하므로 이번 라운드에서 반드시 해소
- **실제 수정 파일**: `index.html`, `css/style.css`, `js/app.js`
- **미수정 파일(의도적, 제약 조건 준수)**: `js/data.js`, `js/codegen.js`, `js/bjd.js` — 데이터 조회·변환 로직 자체는 무변경. 4탭 정보구조와 digit-diff 자릿수 강조 로직도 그대로 유지

---

## 1. 수정 대상 1 (Critical, 축B-C1) — 모바일 카드뷰에서 강조 요소가 있는 셀의 값 분열

### Before

- **증상**: 모바일(390px 이하) 카드형 레이아웃에서 `<mark>`(법정동 검색어 하이라이트)나 `<span class="digit-diff">`(변환 코드 강조)가 포함된 셀만 값이 여러 조각으로 벌어져 보임. 예: "군위군"이 "군위 / 군"으로, 코드 `4119 0603 00`이 라벨과 함께 뒤섞여 벌어짐.
- **원인 코드**: `css/style.css`의 `@media (max-width: 640px)` 카드뷰 규칙에서 `td`에 `display:flex; justify-content:space-between`을 적용하고, 라벨은 `td::before { content: attr(data-label) }`로 생성. 하이라이트 없는 셀은 flex 아이템이 2개(`::before` + 텍스트 노드)라 정상 정렬되지만, `<mark>`나 `digit-diff` `<span>`이 섞인 셀은 자식 노드가 3개 이상이 되어 `space-between`이 이들을 균등 분산시켜버림.
- `js/app.js`의 `runConvert()`(지역코드 변환)와 `renderBjdPage()`(법정동 검색) 두 렌더 함수 모두에서 `<td>` 내용물이 라벨(`::before`) 외에 감싸는 컨테이너 없이 그대로 출력되고 있었음.

### After

1. **`js/app.js` — `runConvert()`** (`D:\SQ\areacode\js\app.js` 321-332행 부근): 매핑 행 렌더 템플릿의 5개 `<td>` 중 데이터가 들어가는 4개(변환 전/후 코드·명칭)의 내용물을 `<span class="cell-value">...</span>`로 감쌈. `markDigitDiff()`가 반환하는 `<mark class="digit-diff">` 마크업이 이 span 안에 그대로 포함되도록 처리.
2. **`js/app.js` — `renderBjdPage()`** (668-681행 부근): 8개 `<td>` 전부(법정동코드/시도명/시군구명/읍면동명/리명/생성일/삭제일/과거법정동코드)를 `<span class="cell-value">...</span>`로 감쌈. `highlightMatch()`가 반환하는 `<mark>` 하이라이트, 값이 없을 때 쓰는 대시 placeholder(`<span class="cell-dash">`)도 동일하게 `cell-value` 안에 포함시켜 일관성 유지.
3. **`css/style.css`** (900행 부근, `@media (max-width: 640px)` 블록): `td`에 `align-items: baseline` 추가, 그리고 `.cell-value`에 `text-align: right` 규칙 신설.
   ```css
   #convert-result .data-table td, #bjd-result .data-table td {
     display: flex;
     justify-content: space-between;
     align-items: baseline;
     gap: 12px;
     padding: 6px 0;
     border-bottom: 1px solid var(--surface-2);
   }
   #convert-result .data-table td > .cell-value, #bjd-result .data-table td > .cell-value {
     text-align: right;
   }
   ```
   이제 모든 `<td>`는 항상 `::before`(라벨) + `.cell-value`(값 1개, 내부에 `<mark>`/`digit-diff`가 몇 개 있든 하나의 flex 아이템) 딱 2개의 flex 아이템만 갖게 되어, 하이라이트 개수와 무관하게 분열이 발생하지 않음.

### 근거

- 축B 검수 리포트(`outputs/final/2026-07-23_areacode_review-axisB.md`) 3장 C-1

### 검증

Playwright로 390×844 뷰포트에서 실제 렌더링 확인.

- **법정동 검색**: "군위" 검색 → 첫 행 시군구명 셀 실제 렌더 HTML:
  ```html
  <td data-label="시군구명"><span class="cell-value"><mark>군위</mark>군</span></td>
  ```
  스크린샷(`outputs/production/screenshots/round2-mobile-bjd-after.png`)에서 "군위" 하이라이트와 "군"이 붙어 **"군위군" 한 덩어리**로 표시됨을 확인 (기존 결함이었던 "군위 / 군" 분열 없음).
- **지역코드 변환**: `202306 → 202602` 조회 → 강원특별자치도 승격 행 렌더 HTML:
  ```html
  <td class="code-cell" data-label="변환 전 코드"><span class="cell-value"><code><mark class="digit-diff">42</mark></code></span></td>
  ```
  스크린샷(`outputs/production/screenshots/round2-mobile-convert-after.png`)에서 부천시 구 재신설 등 10자리 코드(`4119060300` 등)가 `digit-diff` 강조를 포함한 채로 한 줄에 붙어 표시됨을 확인.
- 로컬 서버는 `python -m http.server 8791`로 기동 후 검증 완료 시점에 종료.

---

## 2. 수정 대상 2 (Major, 축A-M1 / 축C-MJ-1) — aria-live 과독 위험 미완화

### Before

- `index.html`의 `#sido-result`, `#convert-result`, `#bjd-result` 3개 결과 컨테이너에 `role="status" aria-live="polite"`가 직접 부여되어 있었음. 이 컨테이너들은 조회/검색 시마다 표 전체(법정동 검색은 최대 100행)를 `innerHTML`로 통째로 갈아끼우므로, 스크린리더가 매 조회마다 표 전체를 낭독하는 과독(over-announcement) 위험이 있었음.
- 전략 문서·제작 보고서 모두 "표 전체가 아니라 'n건 검색됨' 요약 문장만 담는 별도 sr-only 라이브 리전으로 분리" 대안을 예고했으나 실제로는 미적용 상태로 배포되어 있었음.

### After

1. **`index.html`**: 3개 결과 컨테이너에서 `role="status" aria-live="polite"`를 제거(84행, 111행, 179행 부근). 대신 각 결과 영역 바로 앞에 시각적으로 숨겨진 요약 전용 라이브 리전을 신설.
   ```html
   <span class="sr-only" role="status" aria-live="polite" id="sido-result-summary"></span>
   <div class="result-container" id="sido-result"></div>
   ```
   `#convert-result-summary`, `#bjd-result-summary`도 동일 패턴. 오류 메시지의 `role="alert"`(`showError()`가 생성)는 그대로 유지 — 오류는 건수가 적어 과독 위험이 없다는 원 지적 그대로 반영.
2. **`css/style.css`**: `.sr-only` 유틸리티 클래스 신설(843행 부근, `.cell-dash` 바로 아래).
   ```css
   .sr-only {
     position: absolute; width: 1px; height: 1px;
     padding: 0; margin: -1px; overflow: hidden;
     clip: rect(0,0,0,0); white-space: nowrap; border: 0;
   }
   ```
3. **`js/app.js`**: 공통 헬퍼 `updateResultSummary(id, text)` 신설, 3개 탭의 조회/검색 완료 시점(결과 렌더 직후)에 각각 호출하도록 연결.
   - `querySido()`: 표 렌더 직후 `` `${년}년 ${월}월 기준 시도코드 ${건수}건 조회됨` `` 으로 갱신.
   - `runConvert()`: 정상 결과와 "변경 없음"(0건 이벤트) 두 경로 모두에서 갱신 — 정상 시 `` `${From}에서 ${To}로 변환, 이벤트 ${n}건, 총 ${m}건 매핑 조회됨` ``, 변경 없음 시 `` `${From}과 ${To} 사이 변경된 행정구역코드 없음` ``. (입력값 검증 오류로 `showError()`가 호출되는 경로는 `role="alert"`만으로 충분하므로 요약 갱신 대상에서 제외.)
   - `renderBjdPage()`: 검색·페이지 전환마다 `` `${총건수}건 검색됨` `` 으로 갱신 — 표 전체가 아니라 이 한 문장만 스크린리더가 낭독.

### 근거

- 축A 검수 리포트(`outputs/final/2026-07-23_areacode_review-axisA.md`) 4장 M-1
- 축C 검수 리포트(`outputs/final/2026-07-23_areacode_review-axisC.md`) 5장 MJ-1

### 검증

```
grep -n "aria-live" index.html
84:    <span class="sr-only" role="status" aria-live="polite" id="sido-result-summary"></span>
111:    <span class="sr-only" role="status" aria-live="polite" id="convert-result-summary"></span>
179:    <span class="sr-only" role="status" aria-live="polite" id="bjd-result-summary"></span>
```
→ `aria-live`가 `#sido-result`/`#convert-result`/`#bjd-result` 3개 결과 컨테이너 자체에서는 완전히 제거되었고, 신설한 sr-only 요약 리전에만 남아있음을 확인.

Playwright로 각 탭을 실제 조회/검색한 뒤 요약 리전 텍스트를 확인:
```json
{
  "sido": "2026년 07월 기준 시도코드 16건 조회됨",
  "convert": "2023년 06월에서 2026년 02월로 변환, 이벤트 5건, 총 42건 매핑 조회됨",
  "bjd": "118건 검색됨"
}
```
`getComputedStyle`로 `#bjd-result-summary`의 `position: absolute; width: 1px; height: 1px; overflow: hidden`을 확인해, 시각적으로는 숨겨진 채 텍스트만 갱신됨을 검증.

---

## 3. 요약

| 항목 | 상태 |
|---|---|
| 축B-C1 (모바일 카드뷰 값 분열) | 해소 — `cell-value` 래핑 + CSS flex 아이템 2개 고정으로 하이라이트 유무와 무관하게 값이 한 덩어리로 렌더링됨을 390px 실측으로 확인 |
| 축A-M1 / 축C-MJ-1 (aria-live 과독) | 해소 — 결과 컨테이너 3종에서 `aria-live` 제거, sr-only 요약 리전 신설 및 3탭 전부 연결 확인 |

바닐라 HTML/CSS/JS, 4탭 정보구조, digit-diff 강조 로직, `js/data.js`/`js/codegen.js`/`js/bjd.js`의 데이터·계산 로직은 이번 라운드에서도 전혀 손대지 않았다. 검증에 사용한 로컬 HTTP 서버(포트 8791)와 Playwright 브라우저 세션은 검수 완료 후 종료했다.
