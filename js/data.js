// ============================================================
// data.js - 행정구역코드 변환 데이터
// ============================================================

// 변경 이벤트 목록
const CHANGE_EVENTS = [
  {
    id: 'gangwon',
    date: '2023-06-11',
    dateLabel: '2023.06.11',
    title: '강원도 → 강원특별자치도',
    description: '강원도가 강원특별자치도로 승격되면서 시도코드가 42에서 51로 변경되었습니다.',
    impact: { sido: 1, sigungu: 18, eupmyeondong: null },
    tags: ['시도코드 변경', '특별자치도 승격'],
    sidoChange: { before: '42', beforeName: '강원도', after: '51', afterName: '강원특별자치도' }
  },
  {
    id: 'gunwi',
    date: '2023-07-01',
    dateLabel: '2023.07.01',
    title: '군위군 경북 → 대구 편입',
    description: '경상북도 군위군이 대구광역시로 편입되면서 시군구코드가 47720에서 27720으로 변경되었습니다.',
    impact: { sido: null, sigungu: 1, eupmyeondong: 9 },
    tags: ['시군구 편입', '시도 간 이관'],
    sidoChange: null
  },
  {
    id: 'bucheon',
    date: '2024-01-01',
    dateLabel: '2024.01.01',
    title: '부천시 구(區) 재신설',
    description: '부천시에 원미구·소사구·오정구 3개 일반구가 재신설되어 행정동 코드가 재편되었습니다.',
    impact: { sido: null, sigungu: 3, eupmyeondong: null },
    tags: ['구 신설', '행정동 재편'],
    sidoChange: null
  },
  {
    id: 'jeonbuk',
    date: '2024-01-18',
    dateLabel: '2024.01.18',
    title: '전라북도 → 전북특별자치도',
    description: '전라북도가 전북특별자치도로 승격되면서 시도코드가 45에서 52로 변경되었습니다.',
    impact: { sido: 1, sigungu: 14, eupmyeondong: null },
    tags: ['시도코드 변경', '특별자치도 승격'],
    sidoChange: { before: '45', beforeName: '전라북도', after: '52', afterName: '전북특별자치도' }
  },
  {
    id: 'hwaseong',
    date: '2026-02-01',
    dateLabel: '2026.02.01',
    title: '화성시 4개 일반구 신설',
    description: '화성시에 만세구·효행구·병점구·동탄구 4개 일반구가 신설되어 행정동 코드가 재편되었습니다.',
    impact: { sido: null, sigungu: 4, eupmyeondong: null },
    tags: ['구 신설', '행정동 재편'],
    sidoChange: null
  }
];

// ============================================================
// 시도코드 스냅샷 (시행일 기준)
// ============================================================
const SIDO_SNAPSHOTS = [
  {
    validFrom: '0000-00-00',
    validTo: '2023-06-10',
    label: '~ 2023.06.10',
    codes: [
      { code: '11', name: '서울특별시' },
      { code: '21', name: '부산광역시' },
      { code: '22', name: '대구광역시' },
      { code: '23', name: '인천광역시' },
      { code: '24', name: '광주광역시' },
      { code: '25', name: '대전광역시' },
      { code: '26', name: '울산광역시' },
      { code: '29', name: '세종특별자치시' },
      { code: '31', name: '경기도' },
      { code: '32', name: '강원도' },  // 구 강원도 → 나중에 42로 변경 예정이었으나 실제 코드는 42
      { code: '33', name: '충청북도' },
      { code: '34', name: '충청남도' },
      { code: '35', name: '전라북도' },  // 구 전라북도 → 나중에 45로
      { code: '36', name: '전라남도' },
      { code: '37', name: '경상북도' },
      { code: '38', name: '경상남도' },
      { code: '39', name: '제주특별자치도' },
    ]
  }
];

// 실제 행정안전부 기준 시도코드 스냅샷
const SIDO_CODE_SNAPSHOTS = {
  // 2023.06.10 이전 (강원도=42, 전라북도=45)
  '202306': [
    { code: '11', name: '서울특별시' },
    { code: '21', name: '부산광역시' },
    { code: '22', name: '대구광역시' },
    { code: '23', name: '인천광역시' },
    { code: '24', name: '광주광역시' },
    { code: '25', name: '대전광역시' },
    { code: '26', name: '울산광역시' },
    { code: '29', name: '세종특별자치시' },
    { code: '31', name: '경기도' },
    { code: '42', name: '강원도' },
    { code: '43', name: '충청북도' },
    { code: '44', name: '충청남도' },
    { code: '45', name: '전라북도' },
    { code: '46', name: '전라남도' },
    { code: '47', name: '경상북도' },
    { code: '48', name: '경상남도' },
    { code: '50', name: '제주특별자치도' }
  ],
  // 2023.06.11 이후 (강원특별자치도=51)
  '202307': [
    { code: '11', name: '서울특별시' },
    { code: '21', name: '부산광역시' },
    { code: '22', name: '대구광역시' },
    { code: '23', name: '인천광역시' },
    { code: '24', name: '광주광역시' },
    { code: '25', name: '대전광역시' },
    { code: '26', name: '울산광역시' },
    { code: '29', name: '세종특별자치시' },
    { code: '31', name: '경기도' },
    { code: '43', name: '충청북도' },
    { code: '44', name: '충청남도' },
    { code: '45', name: '전라북도' },
    { code: '46', name: '전라남도' },
    { code: '47', name: '경상북도' },
    { code: '48', name: '경상남도' },
    { code: '50', name: '제주특별자치도' },
    { code: '51', name: '강원특별자치도' }
  ],
  // 2024.01.18 이후 (전북특별자치도=52)
  '202402': [
    { code: '11', name: '서울특별시' },
    { code: '21', name: '부산광역시' },
    { code: '22', name: '대구광역시' },
    { code: '23', name: '인천광역시' },
    { code: '24', name: '광주광역시' },
    { code: '25', name: '대전광역시' },
    { code: '26', name: '울산광역시' },
    { code: '29', name: '세종특별자치시' },
    { code: '31', name: '경기도' },
    { code: '43', name: '충청북도' },
    { code: '44', name: '충청남도' },
    { code: '46', name: '전라남도' },
    { code: '47', name: '경상북도' },
    { code: '48', name: '경상남도' },
    { code: '50', name: '제주특별자치도' },
    { code: '51', name: '강원특별자치도' },
    { code: '52', name: '전북특별자치도' }
  ]
};

// 시점에 따른 시도코드 목록 반환 함수
function getSidoCodesAt(yyyymm) {
  const n = parseInt(yyyymm, 10);
  if (n < 202307) {
    // 2023.06 이전: 강원도=42, 전라북도=45
    return SIDO_CODE_SNAPSHOTS['202306'];
  } else if (n < 202402) {
    // 2023.07 ~ 2024.01: 강원특별자치도=51, 전라북도=45
    return SIDO_CODE_SNAPSHOTS['202307'];
  } else {
    // 2024.02 이후: 강원특별자치도=51, 전북특별자치도=52
    return SIDO_CODE_SNAPSHOTS['202402'];
  }
}

// ============================================================
// 시군구 코드 매핑 데이터
// ============================================================

// 강원도→강원특별자치도 시군구 매핑 (2023.06.11)
const GANGWON_SIGUNGU_MAPPING = [
  { before: '42000', beforeName: '강원도', after: '51000', afterName: '강원특별자치도' },
  { before: '42110', beforeName: '춘천시', after: '51110', afterName: '춘천시' },
  { before: '42130', beforeName: '원주시', after: '51130', afterName: '원주시' },
  { before: '42150', beforeName: '강릉시', after: '51150', afterName: '강릉시' },
  { before: '42170', beforeName: '동해시', after: '51170', afterName: '동해시' },
  { before: '42190', beforeName: '태백시', after: '51190', afterName: '태백시' },
  { before: '42210', beforeName: '속초시', after: '51210', afterName: '속초시' },
  { before: '42230', beforeName: '삼척시', after: '51230', afterName: '삼척시' },
  { before: '42720', beforeName: '홍천군', after: '51720', afterName: '홍천군' },
  { before: '42730', beforeName: '횡성군', after: '51730', afterName: '횡성군' },
  { before: '42750', beforeName: '영월군', after: '51750', afterName: '영월군' },
  { before: '42760', beforeName: '평창군', after: '51760', afterName: '평창군' },
  { before: '42770', beforeName: '정선군', after: '51770', afterName: '정선군' },
  { before: '42780', beforeName: '철원군', after: '51780', afterName: '철원군' },
  { before: '42790', beforeName: '화천군', after: '51790', afterName: '화천군' },
  { before: '42800', beforeName: '양구군', after: '51800', afterName: '양구군' },
  { before: '42810', beforeName: '인제군', after: '51810', afterName: '인제군' },
  { before: '42820', beforeName: '고성군', after: '51820', afterName: '고성군' },
  { before: '42830', beforeName: '양양군', after: '51830', afterName: '양양군' }
];

// 군위군 경북→대구 편입 매핑 (2023.07.01) - 행정동 레벨
const GUNWI_ADM_MAPPING = [
  { before: '4772000000', beforeName: '경상북도 군위군', after: '2772000000', afterName: '대구광역시 군위군' },
  { before: '4772025000', beforeName: '경상북도 군위군 군위읍', after: '2772025000', afterName: '대구광역시 군위군 군위읍' },
  { before: '4772031000', beforeName: '경상북도 군위군 소보면', after: '2772031000', afterName: '대구광역시 군위군 소보면' },
  { before: '4772032000', beforeName: '경상북도 군위군 효령면', after: '2772032000', afterName: '대구광역시 군위군 효령면' },
  { before: '4772033000', beforeName: '경상북도 군위군 부계면', after: '2772033000', afterName: '대구광역시 군위군 부계면' },
  { before: '4772034000', beforeName: '경상북도 군위군 우보면', after: '2772034000', afterName: '대구광역시 군위군 우보면' },
  { before: '4772035000', beforeName: '경상북도 군위군 의흥면', after: '2772035000', afterName: '대구광역시 군위군 의흥면' },
  { before: '4772036000', beforeName: '경상북도 군위군 산성면', after: '2772036000', afterName: '대구광역시 군위군 산성면' },
  { before: '4772038000', beforeName: '경상북도 군위군 삼국유사면', after: '2772037000', afterName: '대구광역시 군위군 삼국유사면' }
];

// 전라북도→전북특별자치도 시군구 매핑 (2024.01.18) - 시군구 레벨만
const JEONBUK_SIGUNGU_MAPPING = [
  { before: '4500000000', beforeName: '전라북도', after: '5200000000', afterName: '전북특별자치도' },
  { before: '4511000000', beforeName: '전주시', after: '5211000000', afterName: '전주시' },
  { before: '4511100000', beforeName: '전주시 완산구', after: '5211100000', afterName: '전주시 완산구' },
  { before: '4511300000', beforeName: '전주시 덕진구', after: '5211300000', afterName: '전주시 덕진구' },
  { before: '4513000000', beforeName: '군산시', after: '5213000000', afterName: '군산시' },
  { before: '4514000000', beforeName: '익산시', after: '5214000000', afterName: '익산시' },
  { before: '4518000000', beforeName: '정읍시', after: '5218000000', afterName: '정읍시' },
  { before: '4519000000', beforeName: '남원시', after: '5219000000', afterName: '남원시' },
  { before: '4521000000', beforeName: '김제시', after: '5221000000', afterName: '김제시' },
  { before: '4571000000', beforeName: '완주군', after: '5271000000', afterName: '완주군' },
  { before: '4572000000', beforeName: '진안군', after: '5272000000', afterName: '진안군' },
  { before: '4573000000', beforeName: '무주군', after: '5273000000', afterName: '무주군' },
  { before: '4574000000', beforeName: '장수군', after: '5274000000', afterName: '장수군' },
  { before: '4575000000', beforeName: '임실군', after: '5275000000', afterName: '임실군' },
  { before: '4577000000', beforeName: '순창군', after: '5277000000', afterName: '순창군' },
  { before: '4579000000', beforeName: '고창군', after: '5279000000', afterName: '고창군' },
  { before: '4580000000', beforeName: '부안군', after: '5280000000', afterName: '부안군' }
];

// 부천시 구 재신설 (2024.01.01) - 시군구 레벨
const BUCHEON_SIGUNGU_MAPPING = [
  { before: '4119000000', beforeName: '부천시', after: '4119200000', afterName: '부천시 원미구' },
  { before: '4119000000', beforeName: '부천시', after: '4119400000', afterName: '부천시 소사구' },
  { before: '4119000000', beforeName: '부천시', after: '4119600000', afterName: '부천시 오정구' }
];

// 부천시 행정동 매핑 (2024.01.01)
const BUCHEON_ADM_MAPPING = [
  { before: '4119060300', beforeName: '부천시 심곡동', after: '4119200000', afterName: '부천시 원미구' },
  { before: '4119060600', beforeName: '부천시 부천동', after: '4119253000', afterName: '부천시 원미구 심곡3동' },
  { before: '4119061000', beforeName: '부천시 중동', after: '4119257000', afterName: '부천시 원미구 역곡1동' },
  { before: '4119074200', beforeName: '부천시 신중동', after: '4119259000', afterName: '부천시 원미구 춘의동' },
  { before: '4119074400', beforeName: '부천시 상동', after: '4119261000', afterName: '부천시 원미구 약대동' },
  { before: '4119074600', beforeName: '부천시 대산동', after: '4119400000', afterName: '부천시 소사구' },
  { before: '4119075000', beforeName: '부천시 소사본동', after: '4119452000', afterName: '부천시 소사구 심곡본동' },
  { before: '4119079500', beforeName: '부천시 범안동', after: '4119453000', afterName: '부천시 소사구 소사본동' },
  { before: '4119080000', beforeName: '부천시 성곡동', after: '4119600000', afterName: '부천시 오정구' },
  { before: '4119083000', beforeName: '부천시 오정동', after: '4119652000', afterName: '부천시 오정구 원종1동' }
];

// 화성시 4개 구 신설 (2026.02.01) - 행정동 매핑
const HWASEONG_ADM_MAPPING = [
  // 만세구
  { before: '4159025600', beforeName: '우정읍', after: '4159125000', afterName: '우정읍', gu: '만세구' },
  { before: '4159025900', beforeName: '향남읍', after: '4159125300', afterName: '향남읍', gu: '만세구' },
  { before: '4159026200', beforeName: '남양읍', after: '4159125600', afterName: '남양읍', gu: '만세구' },
  { before: '4159033000', beforeName: '마도면', after: '4159131000', afterName: '마도면', gu: '만세구' },
  { before: '4159034000', beforeName: '송산면', after: '4159132000', afterName: '송산면', gu: '만세구' },
  { before: '4159035000', beforeName: '서신면', after: '4159133000', afterName: '서신면', gu: '만세구' },
  { before: '4159036000', beforeName: '팔탄면', after: '4159134000', afterName: '팔탄면', gu: '만세구' },
  { before: '4159037000', beforeName: '장안면', after: '4159135000', afterName: '장안면', gu: '만세구' },
  { before: '4159040000', beforeName: '양감면', after: '4159136000', afterName: '양감면', gu: '만세구' },
  { before: '4159051500', beforeName: '새솔동', after: '4159151000', afterName: '새솔동', gu: '만세구' },
  // 효행구
  { before: '4159025300', beforeName: '봉담읍', after: '4159325000', afterName: '봉담읍', gu: '효행구' },
  { before: '4159031000', beforeName: '매송면', after: '4159331000', afterName: '매송면', gu: '효행구' },
  { before: '4159032000', beforeName: '비봉면', after: '4159332000', afterName: '비봉면', gu: '효행구' },
  { before: '4159041000', beforeName: '정남면', after: '4159333000', afterName: '정남면', gu: '효행구' },
  { before: '4159056000', beforeName: '기배동', after: '4159351000', afterName: '기배동', gu: '효행구' },
  // 병점구
  { before: '4159052000', beforeName: '진안동', after: '4159551000', afterName: '진안동', gu: '병점구' },
  { before: '4159053000', beforeName: '병점1동', after: '4159552000', afterName: '병점1동', gu: '병점구' },
  { before: '4159054000', beforeName: '병점2동', after: '4159553000', afterName: '병점2동', gu: '병점구' },
  { before: '4159055000', beforeName: '반월동', after: '4159554000', afterName: '반월동', gu: '병점구' },
  { before: '4159057000', beforeName: '화산동', after: '4159555000', afterName: '화산동', gu: '병점구' },
  // 동탄구
  { before: '4159058500', beforeName: '동탄1동', after: '4159751000', afterName: '동탄1동', gu: '동탄구' },
  { before: '4159058600', beforeName: '동탄2동', after: '4159752000', afterName: '동탄2동', gu: '동탄구' },
  { before: '4159058700', beforeName: '동탄3동', after: '4159753000', afterName: '동탄3동', gu: '동탄구' },
  { before: '4159058800', beforeName: '동탄4동', after: '4159754000', afterName: '동탄4동', gu: '동탄구' },
  { before: '4159059000', beforeName: '동탄5동', after: '4159755000', afterName: '동탄5동', gu: '동탄구' },
  { before: '4159060000', beforeName: '동탄6동', after: '4159756000', afterName: '동탄6동', gu: '동탄구' },
  { before: '4159061000', beforeName: '동탄7동', after: '4159757000', afterName: '동탄7동', gu: '동탄구' },
  { before: '4159062000', beforeName: '동탄8동', after: '4159758000', afterName: '동탄8동', gu: '동탄구' },
  { before: '4159063000', beforeName: '동탄9동', after: '4159759000', afterName: '동탄9동', gu: '동탄구' }
];

// ============================================================
// 변환 이벤트 매핑 정보 (두 시점 사이 변경 계산용)
// ============================================================
const CODE_CHANGE_EVENTS = [
  {
    id: 'gangwon',
    effectiveDate: '20230611',
    yyyymm: '202307', // 06.11 시행, 202306 이후(202307 이상) 조회 시 반영
    type: 'sido',
    title: '강원특별자치도 승격',
    sigunguMapping: GANGWON_SIGUNGU_MAPPING
  },
  {
    id: 'gunwi',
    effectiveDate: '20230701',
    yyyymm: '202307',
    type: 'sigungu',
    title: '군위군 대구 편입',
    admMapping: GUNWI_ADM_MAPPING
  },
  {
    id: 'bucheon',
    effectiveDate: '20240101',
    yyyymm: '202401',
    type: 'sigungu',
    title: '부천시 구 재신설',
    sigunguMapping: BUCHEON_SIGUNGU_MAPPING,
    admMapping: BUCHEON_ADM_MAPPING
  },
  {
    id: 'jeonbuk',
    effectiveDate: '20240118',
    yyyymm: '202401',
    type: 'sido',
    title: '전북특별자치도 승격',
    sigunguMapping: JEONBUK_SIGUNGU_MAPPING
  },
  {
    id: 'hwaseong',
    effectiveDate: '20260201',
    yyyymm: '202602',
    type: 'sigungu',
    title: '화성시 구 신설',
    admMapping: HWASEONG_ADM_MAPPING
  }
];

// 두 YYYYMM 사이에 적용되는 변경 이벤트 목록 반환
function getChangesBetween(fromYYYYMM, toYYYYMM) {
  const from = parseInt(fromYYYYMM, 10);
  const to = parseInt(toYYYYMM, 10);
  if (from >= to) return [];
  return CODE_CHANGE_EVENTS.filter(e => {
    const em = parseInt(e.yyyymm, 10);
    return em > from && em <= to;
  });
}
