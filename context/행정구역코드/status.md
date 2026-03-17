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
| FR-11 | 코드 표시 자릿수 조정 (시도 2자리, 시군구 5자리) | ⬜ | |
| FR-12 | 변환 코드 생성도 자릿수 기준 적용 | ⬜ | |

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
