# 행정구역코드 구현 추적

> 요구사항별 구현 상태를 추적합니다.

## 범례

- ✅ 반영됨 — 코드에 구현 완료
- ⬜ 미반영 — 정책/설계만 확정, 코드 미구현

## 기능 목록

| ID | 기능 | 상태 | PR/커밋 |
|----|------|------|---------|
| FR-1 | 행정구역 변경 이력 타임라인/테이블 표시 | ✅ | renderTimeline() |
| FR-2 | 기준년월 입력 → 17개 시도코드 조회 | ✅ | querySido() |
| FR-3 | 변경된 시도코드 하이라이트 | ✅ | row-new/changed/abolished CSS |
| FR-4 | 기준년월 2개 입력 → 변경 코드 매핑 표 | ✅ | runConvert() |
| FR-5 | 시도 레벨 변경 표시 | ✅ | getEventMappings() |
| FR-6 | 법정동 레벨 변경 표시 (해당 시) | ⬜ | 데이터 미포함 (향후) |
| FR-7 | Python 변환 코드 생성 + 복사 | ✅ | generatePythonCode() |
| FR-8 | JavaScript 변환 코드 생성 + 복사 | ✅ | generateJavaScriptCode() |
| FR-9 | SQL 쿼리 변환 코드 생성 + 복사 | ✅ | generateSQLCode() |
| FR-10 | 시도코드↔시도명 양방향 검색 | ✅ | applySidoFilter() |
| FR-11 | 코드 표시 자릿수 조정 (시도 2자리, 시군구 5자리, 구 신설 10자리) | ✅ | displayLevel 'adm' 분기 추가 |
| FR-12 | 변환 코드 생성도 자릿수 기준 적용 | ✅ | adm은 표시=코드생성 동일 (읍면동 전체) |
| FR-13 | 법정동 검색 탭 추가 | ✅ | PR #6 initBjdSection() |
| FR-14 | CSV→JS 변환 (BJD_DATA 49,878건) | ✅ | PR #6 scripts/csv-to-js.js → js/bjd.js |
| FR-15 | 시도/시군구/읍면동/리명 부분일치 검색 | ✅ | PR #6 searchBjd() |
| FR-16 | 현존/폐지 필터 체크박스 | ✅ | PR #6 bjd-include-abolished |
| FR-17 | 결과 테이블 6컬럼 | ✅ | PR #6 renderBjdResult() |
| FR-18 | 빈 검색어 안내 메시지 | ✅ | PR #6 showError() |
| FR-19 | 0건 결과 안내 메시지 | ✅ | PR #6 showError() |
| FR-20 | 결과 건수 카운트 표시 | ✅ | PR #6 result-header |
| FR-21 | 500건 초과 제한 + 경고 | ✅ | PR #6 warning-msg |
| FR-22 | Enter 키 검색 | ✅ | PR #6 keydown 이벤트 |
| FR-23 | 대소문자/전반각 무시 검색 | ✅ | PR #6 normalize() |
| FR-24 | 폐지 행 스타일 구분 | ✅ | PR #6 row-abolished |
| FR-25 | 검색어 하이라이트 | ✅ | PR #6 highlightMatch() |

## 데이터 정합성

| 항목 | 상태 | 비고 |
|------|------|------|
| SIDO_CODE_SNAPSHOTS 시도코드 | ✅ | 행정안전부 기준 17개 코드 정확 |
| 강원특별자치도 시군구 매핑 (19건) | ✅ | GANGWON_SIGUNGU_MAPPING |
| 군위군 행정동 매핑 (9건) | ✅ | GUNWI_ADM_MAPPING |
| 전북특별자치도 시군구 매핑 (19건) | ✅ | JEONBUK_SIGUNGU_MAPPING |
| 부천시 시군구/행정동 매핑 | ✅ | BUCHEON_SIGUNGU/ADM_MAPPING |
| 화성시 행정동 매핑 (29건) | ✅ | HWASEONG_ADM_MAPPING (행정동 기준) |
| getSidoCodesAt 경계값 | ✅ | 202307(강원), 202401(전북) |
