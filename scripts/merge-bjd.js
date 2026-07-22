// 법정동 스냅샷 누적 병합 → js/bjd.js 생성
//
// requirements/ 의 "국토교통부_전국 법정동_YYYYMMDD.csv" 를 전부 찾아
// 기준일 오름차순으로 누적 병합한다. 새 스냅샷을 받으면 파일만 넣고 다시 돌리면 된다.
//
// 왜 병합이 필요한가
//   국토부가 2026년부터 제공 스펙을 줄였다. 예전 파일에는 삭제일자·과거법정동코드가
//   있었지만 최신 파일은 "현존 법정동"만 담고 그 두 컬럼이 없다.
//   최신 파일로 그냥 덮으면 폐지 이력 3만여 건과 과거코드 1.2만 건이 통째로 사라진다.
//   그래서 이전 스냅샷의 이력을 살린 채 최신 스냅샷을 얹는다.
//
// 폐지 판정
//   앞 스냅샷에 현존으로 있던 코드가 다음 스냅샷에서 빠지면 그 사이에 폐지된 것으로 보고,
//   뒤 스냅샷의 기준일을 삭제일자로 기록한다. 국토부가 신규 항목의 생성일자를 스냅샷
//   기준일로 찍기 때문에(예: 전남광주통합특별시 = 2026-06-30) 같은 날짜를 쓰면 짝이 맞는다.
//   CSV가 삭제일자를 직접 주는 경우에는 그 값을 우선한다.

const fs = require('fs');
const path = require('path');

const REQ_DIR = path.join(__dirname, '..', 'requirements');
const OUT_PATH = path.join(__dirname, '..', 'js', 'bjd.js');
const FILE_RE = /^국토교통부_전국 법정동_(\d{8})\.csv$/;

/** 20260630 → 2026-06-30 */
function toIsoDate(yyyymmdd) {
  return yyyymmdd.slice(0, 4) + '-' + yyyymmdd.slice(4, 6) + '-' + yyyymmdd.slice(6, 8);
}

/** 스냅샷 CSV 한 개를 { 법정동코드: row } 로 읽는다 */
function loadSnapshot(filePath) {
  let text = fs.readFileSync(filePath, 'utf-8');
  if (text.charCodeAt(0) === 0xFEFF) text = text.substring(1);

  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  const rows = new Map();

  // 컬럼: 법정동코드(0) 시도명(1) 시군구명(2) 읍면동명(3) 리명(4) 순위(5) 생성일자(6)
  //       [삭제일자(7) 과거법정동코드(8)] ← 구버전에만 존재
  for (let i = 1; i < lines.length; i++) {
    const c = lines[i].split(',');
    if (c.length < 7) continue;
    const code = c[0].trim();
    if (!code) continue;
    rows.set(code, {
      code,
      sido: c[1].trim(),
      sigungu: c[2].trim(),
      emd: c[3].trim(),
      ri: c[4].trim(),
      created: c[6].trim(),
      deleted: (c[7] || '').trim(),
      prev: (c[8] || '').trim(),
    });
  }
  return rows;
}

const files = fs.readdirSync(REQ_DIR)
  .map(name => ({ name, m: name.match(FILE_RE) }))
  .filter(f => f.m)
  .map(f => ({ name: f.name, stamp: f.m[1] }))
  .sort((a, b) => a.stamp.localeCompare(b.stamp));

if (files.length === 0) {
  console.error('requirements/ 에서 "국토교통부_전국 법정동_YYYYMMDD.csv" 를 찾지 못했습니다.');
  process.exit(1);
}

// merged: 지금까지 관측된 모든 법정동 (폐지분 포함)
const merged = new Map();
const report = [];

files.forEach((file, idx) => {
  const snapshot = loadSnapshot(path.join(REQ_DIR, file.name));
  const snapDate = toIsoDate(file.stamp);
  let added = 0, revived = 0, delisted = 0, carried = 0;

  snapshot.forEach((row, code) => {
    const known = merged.get(code);
    if (!known) {
      merged.set(code, { ...row });
      added++;
      return;
    }
    // 이미 아는 코드: 최신 스냅샷의 명칭·생성일자를 반영하고 현존으로 되돌린다.
    // 과거법정동코드는 최신 파일이 제공하지 않으므로 기존 값을 승계한다.
    if (known.deleted && !row.deleted) revived++;
    known.sido = row.sido;
    known.sigungu = row.sigungu;
    known.emd = row.emd;
    known.ri = row.ri;
    known.created = row.created || known.created;
    known.deleted = row.deleted;
    if (row.prev) known.prev = row.prev;
    else if (known.prev) carried++;
  });

  // 첫 스냅샷에는 "직전"이 없으므로 폐지 판정을 하지 않는다.
  if (idx > 0) {
    merged.forEach(row => {
      if (!row.deleted && !snapshot.has(row.code)) {
        row.deleted = snapDate;   // 이 스냅샷 시점엔 이미 빠져 있었다
        delisted++;
      }
    });
  }

  report.push({ file: file.name, date: snapDate, size: snapshot.size, added, revived, delisted, carried });
});

// 법정동코드 오름차순으로 안정 정렬
const rows = Array.from(merged.values()).sort((a, b) => a.code.localeCompare(b.code));

// 출력 스키마(기존 bjd.js와 동일):
// [법정동코드, 시도명, 시군구명, 읍면동명, 리명, 삭제일자, 생성일자, 과거법정동코드]
const jsRows = rows
  .map(r => '[' + [r.code, r.sido, r.sigungu, r.emd, r.ri, r.deleted, r.created, r.prev]
    .map(v => JSON.stringify(v)).join(',') + ']')
  .join(',\n  ');

const sourceList = files.map(f => '//   - ' + f.name).join('\n');
const latest = files[files.length - 1];

const output = `// 국토교통부 전국 법정동 데이터 (자동 생성 - scripts/merge-bjd.js)
// 컬럼: [법정동코드, 시도명, 시군구명, 읍면동명, 리명, 삭제일자, 생성일자, 과거법정동코드]
//
// 아래 스냅샷을 기준일 순으로 누적 병합한 결과다.
${sourceList}
//
// 최신 기준일: ${toIsoDate(latest.stamp)}
// 삭제일자가 있는 행은 폐지된 법정동이다. 최신 국토부 파일은 현존분만 제공하므로,
// 이전 스냅샷에 있다가 사라진 코드는 사라진 시점의 스냅샷 기준일로 폐지 처리한다.
const BJD_DATA = [
  ${jsRows}
];
`;

fs.writeFileSync(OUT_PATH, output, 'utf-8');

const alive = rows.filter(r => !r.deleted).length;
console.log('스냅샷 병합 결과');
report.forEach(r => {
  console.log(`  ${r.date}  ${String(r.size).padStart(6)}건  ` +
    `신규 +${r.added}  폐지 +${r.delisted}` +
    (r.revived ? `  부활 ${r.revived}` : '') +
    (r.carried ? `  과거코드승계 ${r.carried}` : ''));
});
console.log('');
console.log(`총 ${rows.length}건  (현존 ${alive} / 폐지 ${rows.length - alive})`);
console.log(`과거법정동코드 보유: ${rows.filter(r => r.prev).length}건`);
console.log(`→ ${OUT_PATH}`);
