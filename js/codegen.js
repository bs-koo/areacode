// ============================================================
// codegen.js - 변환 코드 생성 (Python / JavaScript / SQL)
// ============================================================

/**
 * 변환 매핑 배열로부터 각 언어 코드를 생성합니다.
 * @param {Array} mappings - [{before, beforeName, after, afterName}, ...]
 * @param {string} eventTitle - 변경 이벤트 제목
 */
function generatePythonCode(mappings, eventTitle, fromYM, toYM) {
  const lines = [];
  lines.push('# ' + eventTitle + ' 행정구역코드 변환');
  lines.push('# 생성일: ' + new Date().toLocaleDateString('ko-KR'));
  if (fromYM && toYM) {
    lines.push('# 변환 기간: ' + fromYM + ' → ' + toYM);
  }
  lines.push('');
  lines.push('CODE_MAPPING = {');
  mappings.forEach(m => {
    lines.push(`    "${m.before}": "${m.after}",  # ${m.beforeName} → ${m.afterName}`);
  });
  lines.push('}');
  lines.push('');
  lines.push('def convert_code(old_code):');
  lines.push('    """행정구역코드를 새 코드로 변환합니다."""');
  lines.push('    return CODE_MAPPING.get(old_code, old_code)');
  lines.push('');
  lines.push('# 사용 예시');
  if (mappings.length > 0) {
    const ex = mappings[0];
    lines.push(`# convert_code("${ex.before}")  # → "${ex.after}"`);
  }
  return lines.join('\n');
}

function generateJavaScriptCode(mappings, eventTitle, fromYM, toYM) {
  const lines = [];
  lines.push('// ' + eventTitle + ' 행정구역코드 변환');
  lines.push('// 생성일: ' + new Date().toLocaleDateString('ko-KR'));
  if (fromYM && toYM) {
    lines.push('// 변환 기간: ' + fromYM + ' → ' + toYM);
  }
  lines.push('');
  lines.push('const CODE_MAPPING = {');
  mappings.forEach(m => {
    lines.push(`  "${m.before}": "${m.after}",  // ${m.beforeName} → ${m.afterName}`);
  });
  lines.push('};');
  lines.push('');
  lines.push('function convertCode(oldCode) {');
  lines.push('  return CODE_MAPPING[oldCode] ?? oldCode;');
  lines.push('}');
  lines.push('');
  lines.push('// 사용 예시');
  if (mappings.length > 0) {
    const ex = mappings[0];
    lines.push(`// convertCode("${ex.before}");  // → "${ex.after}"`);
  }
  return lines.join('\n');
}

function generateSQLCode(mappings, eventTitle, fromYM, toYM) {
  const lines = [];
  lines.push('-- ' + eventTitle + ' 행정구역코드 변환');
  lines.push('-- 생성일: ' + new Date().toLocaleDateString('ko-KR'));
  if (fromYM && toYM) {
    lines.push('-- 변환 기간: ' + fromYM + ' → ' + toYM);
  }
  lines.push('');
  lines.push('-- CASE WHEN 방식');
  lines.push('UPDATE your_table');
  lines.push('SET area_code = CASE area_code');
  mappings.forEach(m => {
    lines.push(`  WHEN '${m.before}' THEN '${m.after}'  -- ${m.beforeName} → ${m.afterName}`);
  });
  lines.push('  ELSE area_code');
  lines.push('END');
  lines.push('WHERE area_code IN (');
  const codes = mappings.map(m => `  '${m.before}'`).join(',\n');
  lines.push(codes);
  lines.push(');');
  lines.push('');
  lines.push('-- 매핑 테이블 방식 (임시 테이블)');
  lines.push('CREATE TEMP TABLE code_mapping (old_code VARCHAR(20), new_code VARCHAR(20), description VARCHAR(100));');
  lines.push('INSERT INTO code_mapping VALUES');
  const inserts = mappings.map(m =>
    `  ('${m.before}', '${m.after}', '${m.beforeName} → ${m.afterName}')`
  ).join(',\n');
  lines.push(inserts + ';');
  return lines.join('\n');
}

function generateCode(mappings, eventTitle, lang, fromYM, toYM) {
  switch (lang) {
    case 'python': return generatePythonCode(mappings, eventTitle, fromYM, toYM);
    case 'javascript': return generateJavaScriptCode(mappings, eventTitle, fromYM, toYM);
    case 'sql': return generateSQLCode(mappings, eventTitle, fromYM, toYM);
    default: return '';
  }
}
