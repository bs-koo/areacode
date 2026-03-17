// CSV → JS 변환 스크립트
// 국토교통부 전국 법정동 CSV를 js/bjd.js로 변환

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '..', 'requirements', '국토교통부_전국 법정동_20250807.csv');
const OUT_PATH = path.join(__dirname, '..', 'js', 'bjd.js');

// CSV 읽기 (UTF-8 BOM 제거)
let raw = fs.readFileSync(CSV_PATH, 'utf-8');
if (raw.charCodeAt(0) === 0xFEFF) {
  raw = raw.substring(1);
}

const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');

// 헤더 스킵, 데이터 행 파싱
// CSV 컬럼: 법정동코드(0), 시도명(1), 시군구명(2), 읍면동명(3), 리명(4), 순위(5), 생성일자(6), 삭제일자(7), 과거법정동코드(8)
// 추출: [코드, 시도명, 시군구명, 읍면동명, 리명, 삭제일자]
const rows = [];
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(',');
  if (cols.length < 8) continue;

  const code = cols[0].trim();
  const sido = cols[1].trim();
  const sigungu = cols[2].trim();
  const eupmyeondong = cols[3].trim();
  const ri = cols[4].trim();
  const deletedDate = cols[7].trim();

  rows.push([code, sido, sigungu, eupmyeondong, ri, deletedDate]);
}

// JS 파일 출력
const jsRows = rows.map(r =>
  '[' + r.map(v => JSON.stringify(v)).join(',') + ']'
).join(',\n  ');

const output = `// 국토교통부 전국 법정동 데이터 (자동 생성 - scripts/csv-to-js.js)
// 컬럼: [법정동코드, 시도명, 시군구명, 읍면동명, 리명, 삭제일자]
const BJD_DATA = [
  ${jsRows}
];
`;

fs.writeFileSync(OUT_PATH, output, 'utf-8');
console.log(`변환 완료: ${rows.length}건 → ${OUT_PATH}`);
