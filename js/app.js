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
  let allMappings = [];
  let titleParts = [];
  let html = '';

  events.forEach(ev => {
    const mappings = getEventMappings(ev);
    allMappings = allMappings.concat(mappings);
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

  currentMappings = allMappings;
  currentTitle = titleParts.join(' + ');

  resultDiv.innerHTML = html;
  codeSection.style.display = 'block';

  // 현재 선택된 언어 탭으로 코드 렌더링
  const activeLang = document.querySelector('.lang-tab.active')?.dataset.lang || 'python';
  renderCodeOutput(activeLang);
}

function getEventMappings(ev) {
  // 시도 레벨 변경이면 시군구 매핑 반환
  if (ev.sigunguMapping) return ev.sigunguMapping;
  // 행정동 레벨만 있으면 admMapping 반환
  if (ev.admMapping) return ev.admMapping;
  return [];
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
    const orig = btn.textContent;
    btn.textContent = '복사 완료!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = orig;
      btn.classList.remove('copied');
    }, 2000);
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
});
