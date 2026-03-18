// ============================================================
// app.js - 메인 로직
// ============================================================

// ---- 탭 네비게이션 ----
function initTabs() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.section');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      navBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });
}

// ---- 섹션 1: 변경 이력 타임라인 ----
function renderTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  container.innerHTML = CHANGE_EVENTS.map((ev, i) => {
    const impactParts = [];
    if (ev.impact.sido) impactParts.push(`시도 ${ev.impact.sido}개`);
    if (ev.impact.sigungu) impactParts.push(`시군구 ${ev.impact.sigungu}개`);
    if (ev.impact.eupmyeondong) impactParts.push(`읍면동 ${ev.impact.eupmyeondong}개`);

    const tagsHtml = ev.tags.map(t => `<span class="tag">${t}</span>`).join('');

    const codeChangeHtml = ev.sidoChange
      ? `<div class="code-change">
           <span class="code-badge old">${ev.sidoChange.before} ${ev.sidoChange.beforeName}</span>
           <span class="arrow">→</span>
           <span class="code-badge new">${ev.sidoChange.after} ${ev.sidoChange.afterName}</span>
         </div>`
      : '';

    return `
      <div class="timeline-item" style="--i:${i}">
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <div class="timeline-date">${ev.dateLabel}</div>
          <h3 class="timeline-title">${ev.title}</h3>
          <p class="timeline-desc">${ev.description}</p>
          ${codeChangeHtml}
          <div class="timeline-meta">
            <div class="impact-badges">
              ${impactParts.map(p => `<span class="impact-badge">${p}</span>`).join('')}
            </div>
            <div class="tags">${tagsHtml}</div>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ---- 섹션 2: 시도코드 조회 ----
function initSidoSection() {
  const input = document.getElementById('sido-yyyymm');
  const btn = document.getElementById('sido-query-btn');
  const resultDiv = document.getElementById('sido-result');

  // 기본값: 현재 년월
  const now = new Date();
  const defaultYM = String(now.getFullYear()) + String(now.getMonth() + 1).padStart(2, '0');
  input.value = defaultYM;

  const searchInput = document.getElementById('sido-search');

  btn.addEventListener('click', () => {
    querySido(input, resultDiv);
    applySidoFilter();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      querySido(input, resultDiv);
      applySidoFilter();
    }
  });
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        querySido(input, resultDiv);
        applySidoFilter();
      }
    });
  }

  // 초기 렌더링
  querySido(input, resultDiv);
}

// ---- FR-10: 시도코드↔시도명 검색 (조회 버튼 클릭 시 함께 적용) ----
function applySidoFilter() {
  const searchInput = document.getElementById('sido-search');
  if (!searchInput) return;

  const keyword = searchInput.value.trim().toLowerCase();
  const rows = document.querySelectorAll('#sido-result .data-table tbody tr');
  let visibleCount = 0;
  let totalCount = 0;

  rows.forEach(row => {
    totalCount++;
    const code = row.cells[0]?.textContent || '';
    const name = row.cells[1]?.textContent || '';
    const match = !keyword || code.includes(keyword) || name.toLowerCase().includes(keyword);
    row.style.display = match ? '' : 'none';
    if (match) visibleCount++;
  });

  updateSidoFilterCount(totalCount, visibleCount, keyword);
}

function updateSidoFilterCount(total, visible, keyword) {
  const filterInfo = document.getElementById('sido-filter-info');
  if (!filterInfo) return;
  if (!keyword) {
    filterInfo.textContent = '';
  } else {
    filterInfo.textContent = '(' + total + '개 중 ' + visible + '개 표시)';
  }
}

function querySido(input, resultDiv) {
  const raw = input.value.trim().replace(/[^0-9]/g, '');
  if (raw.length !== 6) {
    showError(resultDiv, 'YYYYMM 형식으로 6자리를 입력하세요. (예: 202401)');
    return;
  }
  const year = parseInt(raw.substring(0, 4), 10);
  const month = parseInt(raw.substring(4, 6), 10);
  if (year < 2000 || year > 2100 || month < 1 || month > 12) {
    showError(resultDiv, '유효한 년월을 입력하세요.');
    return;
  }

  const codes = getSidoCodesAt(raw);
  const prevYM = getPrevYM(raw);
  const prevCodes = getSidoCodesAt(prevYM);
  const prevCodeSet = new Set(prevCodes.map(c => c.code + '|' + c.name));

  const rows = codes.map(c => {
    const isNew = !prevCodeSet.has(c.code + '|' + c.name);
    // 이전 시점에 같은 code가 있었지만 이름이 달라진 경우
    const prevEntry = prevCodes.find(p => p.code === c.code);
    const isChanged = prevEntry && prevEntry.name !== c.name;
    let rowClass = '';
    if (isNew && !prevEntry) rowClass = 'row-new';
    else if (isNew || isChanged) rowClass = 'row-changed';

    const changeNote = isNew && !prevEntry
      ? '<span class="change-note new">신규</span>'
      : (isChanged ? `<span class="change-note changed">변경 (이전: ${prevEntry.name})</span>` : '');

    return `<tr class="${rowClass}">
      <td>${c.code}</td>
      <td>${c.name}${changeNote}</td>
    </tr>`;
  }).join('');

  // 폐지된 코드 찾기
  const newCodeSet = new Set(codes.map(c => c.code));
  const abolished = prevCodes.filter(p => !newCodeSet.has(p.code));
  const abolishedRows = abolished.map(c =>
    `<tr class="row-abolished"><td>${c.code}</td><td>${c.name} <span class="change-note abolished">폐지</span></td></tr>`
  ).join('');

  resultDiv.innerHTML = `
    <div class="result-header">
      <strong>${raw.substring(0,4)}년 ${raw.substring(4,6)}월</strong> 기준 시도코드 (총 ${codes.length}개) <span id="sido-filter-info"></span>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>시도코드</th><th>시도명</th></tr></thead>
        <tbody>${rows}${abolishedRows}</tbody>
      </table>
    </div>
    <div class="legend">
      <span class="legend-item new">신규 추가</span>
      <span class="legend-item changed">변경</span>
      <span class="legend-item abolished">폐지</span>
    </div>`;

  // 조회 후 검색 필터 적용
  applySidoFilter();
}

function getPrevYM(yyyymm) {
  const year = parseInt(yyyymm.substring(0, 4), 10);
  const month = parseInt(yyyymm.substring(4, 6), 10);
  if (month === 1) return String(year - 1) + '12';
  return String(year) + String(month - 1).padStart(2, '0');
}

// ---- 섹션 3: 지역코드 변환 ----
function initConvertSection() {
  const fromInput = document.getElementById('convert-from');
  const toInput = document.getElementById('convert-to');
  const btn = document.getElementById('convert-query-btn');

  // 기본값
  fromInput.value = '202306';
  toInput.value = '202602';

  btn.addEventListener('click', () => runConvert(fromInput, toInput));
  fromInput.addEventListener('keydown', e => { if (e.key === 'Enter') runConvert(fromInput, toInput); });
  toInput.addEventListener('keydown', e => { if (e.key === 'Enter') runConvert(fromInput, toInput); });

  // 언어 탭 전환
  document.querySelectorAll('.lang-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderCodeOutput(tab.dataset.lang);
    });
  });

  // 복사 버튼
  document.getElementById('copy-btn').addEventListener('click', copyCode);
}

let currentMappings = [];
let currentTitle = '';

function runConvert(fromInput, toInput) {
  const resultDiv = document.getElementById('convert-result');
  const codeSection = document.getElementById('code-gen-section');

  const from = fromInput.value.trim().replace(/[^0-9]/g, '');
  const to = toInput.value.trim().replace(/[^0-9]/g, '');

  if (from.length !== 6 || to.length !== 6) {
    showError(resultDiv, 'YYYYMM 형식으로 6자리를 입력하세요.');
    codeSection.style.display = 'none';
    return;
  }
  if (parseInt(from) >= parseInt(to)) {
    showError(resultDiv, '기준년월(From)이 목표년월(To)보다 이전이어야 합니다.');
    codeSection.style.display = 'none';
    return;
  }

  const events = getChangesBetween(from, to);

  if (events.length === 0) {
    resultDiv.innerHTML = `<div class="no-change">
      <div class="no-change-icon">✓</div>
      <p><strong>${formatYM(from)}</strong>과 <strong>${formatYM(to)}</strong> 사이에 변경된 행정구역코드가 없습니다.</p>
    </div>`;
    codeSection.style.display = 'none';
    return;
  }

  // 이벤트별 매핑 테이블 렌더링
  let allMappings = [];       // 화면 표시용 (압축)
  let allCodegenMappings = []; // 변환 코드 생성용 (전체)
  let titleParts = [];
  let html = '';

  events.forEach(ev => {
    const mappings = getEventMappings(ev);
    allMappings = allMappings.concat(mappings);
    allCodegenMappings = allCodegenMappings.concat(getCodegenMappings(ev));
    titleParts.push(ev.title);

    const rows = mappings.map(m =>
      `<tr>
        <td><code>${m.before}</code></td>
        <td>${m.beforeName}</td>
        <td class="arrow-cell">→</td>
        <td><code>${m.after}</code></td>
        <td>${m.afterName}</td>
      </tr>`
    ).join('');

    html += `
      <div class="event-block">
        <div class="event-header">
          <span class="event-date">${getEventDateLabel(ev.id)}</span>
          <span class="event-name">${ev.title}</span>
          <span class="event-count">${mappings.length}건</span>
        </div>
        <div class="table-wrap">
          <table class="data-table mapping-table">
            <thead><tr><th>이전 코드</th><th>이전 명칭</th><th></th><th>변경 코드</th><th>변경 명칭</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  });

  currentMappings = allCodegenMappings; // 변환 코드 생성에는 전체 매핑 사용
  currentTitle = titleParts.join(' + ');

  resultDiv.innerHTML = html;
  codeSection.style.display = 'block';

  // 현재 선택된 언어 탭으로 코드 렌더링
  const activeLang = document.querySelector('.lang-tab.active')?.dataset.lang || 'python';
  renderCodeOutput(activeLang);
}

function getEventMappings(ev) {
  // FR-11: displayLevel 기반 코드 자릿수 조정
  // 시도 승격: 시도코드 2자리만 표시
  if (ev.displayLevel === 'sido' && ev.sidoMapping) {
    return ev.sidoMapping;
  }
  // 구 신설/재신설: 읍면동 10자리 전체 표시 (1:N 관계)
  if (ev.displayLevel === 'adm') {
    const mapping = ev.admMapping || [];
    return mapping.map(m => ({
      before: m.before,
      beforeName: m.gu ? (ev.parentName || '') + ' ' + m.beforeName : m.beforeName,
      after: m.after,
      afterName: m.gu ? (ev.parentName || '') + ' ' + m.gu + ' ' + m.afterName : m.afterName
    }));
  }
  // 시군구 편입: 시군구코드 5자리만 표시 (중복 제거)
  if (ev.displayLevel === 'sigungu') {
    const mapping = ev.sigunguMapping || ev.admMapping || [];
    const seen = new Map();
    mapping.forEach(m => {
      const beforeCode5 = m.before.substring(0, 5);
      const afterCode5 = m.after.substring(0, 5);
      const key = beforeCode5 + '\u2192' + afterCode5;
      if (!seen.has(key)) {
        const parentName = ev.parentName || '';
        seen.set(key, {
          before: beforeCode5,
          beforeName: m.gu && parentName ? parentName : m.beforeName,
          after: afterCode5,
          afterName: m.gu && parentName ? (parentName + ' ' + m.gu).trim() : m.afterName
        });
      }
    });
    return Array.from(seen.values());
  }
  return [];
}

// FR-12: 변환 코드 생성용 매핑 (화면 표시와 동일 + 뒷자리 변경 예외 포함)
function getCodegenMappings(ev) {
  // 구 신설/재신설: 표시와 동일 (읍면동 10자리 전체)
  if (ev.displayLevel === 'adm') {
    return getEventMappings(ev);
  }
  // 기본: 화면 표시와 동일한 압축 매핑
  const displayMappings = getEventMappings(ev);

  // 뒷자리까지 변경되는 예외 항목 탐색
  const mapping = ev.sigunguMapping || ev.admMapping || [];
  const exceptions = [];

  if (ev.displayLevel === 'sido') {
    // 시도 승격: 앞 2자리 교체 후 나머지가 다른 항목
    mapping.forEach(m => {
      const expectedAfter = ev.sidoMapping[0].after + m.before.substring(2);
      if (m.after !== expectedAfter) {
        exceptions.push(m);
      }
    });
  } else if (ev.displayLevel === 'sigungu') {
    // 시군구 편입/신설: 앞 5자리 교체 후 나머지가 다른 항목
    mapping.forEach(m => {
      const beforeTail = m.before.substring(5);
      const afterTail = m.after.substring(5);
      if (beforeTail !== afterTail) {
        exceptions.push(m);
      }
    });
  }

  return displayMappings.concat(exceptions);
}

function getEventDateLabel(id) {
  const ev = CHANGE_EVENTS.find(e => e.id === id);
  return ev ? ev.dateLabel : '';
}

function renderCodeOutput(lang) {
  const pre = document.getElementById('code-output');
  if (!pre) return;
  const fromVal = document.getElementById('convert-from')?.value || '';
  const toVal = document.getElementById('convert-to')?.value || '';
  const code = generateCode(currentMappings, currentTitle, lang, fromVal, toVal);
  pre.textContent = code;
}

function copyCode() {
  const pre = document.getElementById('code-output');
  if (!pre) return;
  navigator.clipboard.writeText(pre.textContent).then(() => {
    const btn = document.getElementById('copy-btn');
    const label = btn.querySelector('.copy-label');
    if (label) {
      label.textContent = '복사 완료!';
    }
    btn.classList.add('copied');
    setTimeout(() => {
      if (label) label.textContent = '복사';
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ---- 섹션 4: 법정동 검색 ----
let bjdCurrentPage = 1;
let bjdPageSize = 50;
let bjdFilteredData = [];
let bjdKeyword = '';

function initBjdSection() {
  const keywordInput = document.getElementById('bjd-keyword');
  const searchBtn = document.getElementById('bjd-search-btn');
  const checkbox = document.getElementById('bjd-include-abolished');
  const filterSelect = document.getElementById('bjd-filter');
  const yyyymmInput = document.getElementById('bjd-yyyymm');
  const resultDiv = document.getElementById('bjd-result');

  searchBtn.addEventListener('click', () => searchBjd(keywordInput, checkbox, filterSelect, yyyymmInput, resultDiv));
  keywordInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchBjd(keywordInput, checkbox, filterSelect, yyyymmInput, resultDiv);
  });
  yyyymmInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchBjd(keywordInput, checkbox, filterSelect, yyyymmInput, resultDiv);
  });
}

function normalize(str) {
  return str.toLowerCase().replace(/[\uFF01-\uFF5E]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
  );
}

function getYYYYMMLastDay(yyyymm) {
  const year = parseInt(yyyymm.substring(0, 4), 10);
  const month = parseInt(yyyymm.substring(4, 6), 10);
  const lastDay = new Date(year, month, 0).getDate();
  return yyyymm.substring(0, 4) + '-' + yyyymm.substring(4, 6) + '-' + String(lastDay).padStart(2, '0');
}

function getYYYYMMFirstDay(yyyymm) {
  return yyyymm.substring(0, 4) + '-' + yyyymm.substring(4, 6) + '-01';
}

function searchBjd(keywordInput, checkbox, filterSelect, yyyymmInput, resultDiv) {
  const keyword = keywordInput.value.trim();
  const filterType = filterSelect.value;
  const yyyymm = yyyymmInput.value.trim().replace(/[^0-9]/g, '');
  const includeAbolished = checkbox.checked;

  if (!keyword && !yyyymm) {
    showError(resultDiv, '검색어 또는 기준년월을 입력하세요.');
    return;
  }

  // 기준년월 유효성 검사
  if (yyyymm && yyyymm.length !== 6) {
    showError(resultDiv, '기준년월은 YYYYMM 형식으로 6자리를 입력하세요. (예: 202501)');
    return;
  }
  if (yyyymm) {
    const y = parseInt(yyyymm.substring(0, 4), 10);
    const m = parseInt(yyyymm.substring(4, 6), 10);
    if (y < 1900 || y > 2100 || m < 1 || m > 12) {
      showError(resultDiv, '유효한 기준년월을 입력하세요.');
      return;
    }
  }

  const normalizedKeyword = keyword ? normalize(keyword) : '';
  const refLastDay = yyyymm ? getYYYYMMLastDay(yyyymm) : '';
  const refFirstDay = yyyymm ? getYYYYMMFirstDay(yyyymm) : '';

  const filtered = BJD_DATA.filter(row => {
    const createdDate = row[6] || '';
    const deletedDate = row[5] || '';

    if (yyyymm && includeAbolished) {
      // 기준년월 + 폐지포함: 해당 시점에 유효했던 전부 (현재 폐지 포함)
      if (createdDate && createdDate > refLastDay) return false;
      if (deletedDate && deletedDate <= refLastDay) return false;
    } else if (yyyymm && !includeAbolished) {
      // 기준년월 + 폐지포함 OFF: 해당 시점 유효 + 현재도 현존
      if (createdDate && createdDate > refLastDay) return false;
      if (deletedDate !== '') return false;
    } else if (!yyyymm && includeAbolished) {
      // 기준년월 없음 + 폐지포함: 현존 + 폐지 전부
      // 필터 없음 (모두 통과)
    } else {
      // 기준년월 없음 + 폐지포함 OFF: 현재 현존만
      if (deletedDate !== '') return false;
    }

    // 검색어가 없으면 기준년월 필터만 적용
    if (!normalizedKeyword) return true;

    // 검색 대상 필터
    switch (filterType) {
      case 'code':
        return normalize(row[0]).includes(normalizedKeyword);
      case 'sido':
        return normalize(row[1]).includes(normalizedKeyword);
      case 'sigungu':
        return normalize(row[2]).includes(normalizedKeyword);
      case 'eupmyeondong':
        return normalize(row[3]).includes(normalizedKeyword);
      case 'ri':
        return normalize(row[4]).includes(normalizedKeyword);
      default: // all
        return normalize(row[0]).includes(normalizedKeyword) ||
               normalize(row[1]).includes(normalizedKeyword) ||
               normalize(row[2]).includes(normalizedKeyword) ||
               normalize(row[3]).includes(normalizedKeyword) ||
               normalize(row[4]).includes(normalizedKeyword);
    }
  });

  if (filtered.length === 0) {
    bjdFilteredData = [];
    showError(resultDiv, '검색 결과가 없습니다.');
    return;
  }

  bjdFilteredData = filtered;
  bjdKeyword = keyword;
  bjdCurrentPage = 1;
  renderBjdPage(resultDiv);
}

function highlightMatch(text, keyword) {
  // HTML escape 먼저
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (!keyword) return escaped;

  const normalizedEscaped = normalize(escaped);
  const normalizedKeyword = normalize(keyword);

  let result = '';
  let i = 0;
  while (i < escaped.length) {
    const pos = normalizedEscaped.indexOf(normalizedKeyword, i);
    if (pos === -1) {
      result += escaped.substring(i);
      break;
    }
    result += escaped.substring(i, pos);
    result += '<mark>' + escaped.substring(pos, pos + normalizedKeyword.length) + '</mark>';
    i = pos + normalizedKeyword.length;
  }

  return result;
}

function renderBjdPage(resultDiv) {
  const totalCount = bjdFilteredData.length;
  const totalPages = Math.ceil(totalCount / bjdPageSize);
  if (bjdCurrentPage > totalPages) bjdCurrentPage = totalPages;
  if (bjdCurrentPage < 1) bjdCurrentPage = 1;

  const startIdx = (bjdCurrentPage - 1) * bjdPageSize;
  const endIdx = Math.min(startIdx + bjdPageSize, totalCount);
  const pageData = bjdFilteredData.slice(startIdx, endIdx);

  const rows = pageData.map(row => {
    const rowClass = row[5] !== '' ? ' class="row-abolished"' : '';
    return '<tr' + rowClass + '>' +
      '<td><code>' + row[0] + '</code></td>' +
      '<td>' + highlightMatch(row[1], bjdKeyword) + '</td>' +
      '<td>' + highlightMatch(row[2], bjdKeyword) + '</td>' +
      '<td>' + highlightMatch(row[3], bjdKeyword) + '</td>' +
      '<td>' + highlightMatch(row[4], bjdKeyword) + '</td>' +
      '<td>' + (row[6] || '') + '</td>' +
      '<td>' + (row[5] || '') + '</td>' +
      '<td>' + (row[7] ? '<code>' + row[7] + '</code>' : '') + '</td>' +
      '</tr>';
  }).join('');

  // 페이징 컨트롤 HTML
  let paginationHtml = '';
  if (totalCount > 0) {
    const showNav = totalPages > 1;
    const isFirst = bjdCurrentPage === 1;
    const isLast = bjdCurrentPage === totalPages;

    paginationHtml = '<div class="bjd-pagination">' +
      '<div class="bjd-pagination-info">' +
        '<span>총 <strong>' + totalCount + '</strong>건</span>' +
        '<select class="bjd-page-size-select" id="bjd-page-size">' +
          '<option value="50"' + (bjdPageSize === 50 ? ' selected' : '') + '>50건</option>' +
          '<option value="100"' + (bjdPageSize === 100 ? ' selected' : '') + '>100건</option>' +
        '</select>' +
      '</div>' +
      (showNav ? '<div class="bjd-pagination-nav">' +
        '<button class="bjd-page-btn" data-action="first"' + (isFirst ? ' disabled' : '') + '>&laquo;</button>' +
        '<button class="bjd-page-btn" data-action="prev"' + (isFirst ? ' disabled' : '') + '>&lsaquo;</button>' +
        '<span class="bjd-page-indicator">' + bjdCurrentPage + ' / ' + totalPages + '</span>' +
        '<button class="bjd-page-btn" data-action="next"' + (isLast ? ' disabled' : '') + '>&rsaquo;</button>' +
        '<button class="bjd-page-btn" data-action="last"' + (isLast ? ' disabled' : '') + '>&raquo;</button>' +
      '</div>' : '') +
    '</div>';
  }

  resultDiv.innerHTML =
    '<div class="result-header"><strong>' + totalCount + '건 검색됨</strong></div>' +
    '<div class="table-wrap">' +
      '<table class="data-table">' +
        '<thead><tr><th>법정동코드</th><th>시도명</th><th>시군구명</th><th>읍면동명</th><th>리명</th><th>생성일</th><th>삭제일</th><th>과거법정동코드</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>' +
    '</div>' +
    paginationHtml;

  // 이벤트 바인딩: 페이지 크기 변경
  const pageSizeSelect = document.getElementById('bjd-page-size');
  if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', e => {
      bjdPageSize = parseInt(e.target.value, 10);
      bjdCurrentPage = 1;
      renderBjdPage(resultDiv);
    });
  }

  // 이벤트 바인딩: 네비게이션 버튼
  resultDiv.querySelectorAll('.bjd-page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'first') bjdCurrentPage = 1;
      else if (action === 'prev') bjdCurrentPage = Math.max(1, bjdCurrentPage - 1);
      else if (action === 'next') bjdCurrentPage = Math.min(totalPages, bjdCurrentPage + 1);
      else if (action === 'last') bjdCurrentPage = totalPages;
      renderBjdPage(resultDiv);
    });
  });
}

// ---- 공통 유틸 ----
function formatYM(yyyymm) {
  return yyyymm.substring(0, 4) + '년 ' + yyyymm.substring(4, 6) + '월';
}

function showError(container, msg) {
  container.innerHTML = `<div class="error-msg">${msg}</div>`;
}

// ---- 초기화 ----
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderTimeline();
  initSidoSection();
  initConvertSection();
  initBjdSection();
});
