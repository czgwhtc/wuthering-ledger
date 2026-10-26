'use strict';

/* ==================== 常量与分类 ==================== */
const STORAGE_KEY = 'ledger.data.v1';

/* 分类配置：icon 是图片缺失时的 emoji 兜底；chara/avatar 是角色头像 */
const CATEGORIES = {
  expense: [
    { key: 'food',      name: '餐饮', icon: '🍜', color: '#f97316', chara: '爱弥斯',   avatar: 'assets/chara/av-food.png' },
    { key: 'transport', name: '交通', icon: '🚗', color: '#3b82f6', chara: '绯雪',     avatar: 'assets/chara/av-transport.png' },
    { key: 'shopping',  name: '购物', icon: '🛒', color: '#ec4899', chara: '卡提希娅', avatar: 'assets/chara/av-shopping.png' },
    { key: 'housing',   name: '居住', icon: '🏠', color: '#8b5cf6', chara: '守岸人',   avatar: 'assets/chara/av-housing.png' },
    { key: 'fun',       name: '娱乐', icon: '🎮', color: '#14b8a6', chara: '心',       avatar: 'assets/chara/av-fun.png' },
    { key: 'medical',   name: '医疗', icon: '💊', color: '#ef4444', chara: '莫宁',     avatar: 'assets/chara/av-medical.png' },
    { key: 'study',     name: '学习', icon: '📚', color: '#6366f1', chara: '弗洛洛',   avatar: 'assets/chara/av-study.png' },
    { key: 'other',     name: '其他', icon: '📦', color: '#94a3b8', chara: '嘉贝莉娜', avatar: 'assets/chara/av-other.png' },
  ],
  income: [
    { key: 'salary',  name: '工资', icon: '💰', color: '#22c55e', chara: '景燃',     avatar: 'assets/chara/av-salary.png' },
    { key: 'bonus',   name: '奖金', icon: '🎁', color: '#eab308', chara: '今汐',     avatar: 'assets/chara/av-bonus.png' },
    { key: 'invest',  name: '理财', icon: '📈', color: '#06b6d4', chara: '坎特蕾拉', avatar: 'assets/chara/av-invest.png' },
    { key: 'sidejob', name: '兼职', icon: '💼', color: '#a855f7', chara: '清宵',     avatar: 'assets/chara/av-sidejob.png' },
    { key: 'other',   name: '其他', icon: '📥', color: '#94a3b8', chara: '尤诺',     avatar: 'assets/chara/av-income-other.png' },
  ],
};

/* 记一笔弹层的角色立绘池，每次打开随机展示一张 */
const CHARA_ARTS = [
  { file: 'assets/chara/art-1.png', name: '守岸人' },
  { file: 'assets/chara/art-2.png', name: '长离' },
  { file: 'assets/chara/art-3.png', name: '珂莱塔' },
  { file: 'assets/chara/art-4.png', name: '今汐' },
  { file: 'assets/chara/art-5.png', name: '坎特蕾拉' },
  { file: 'assets/chara/art-6.png', name: '椿' },
  { file: 'assets/chara/art-7.png', name: '爱弥斯' },
  { file: 'assets/chara/art-8.png', name: '心' },
  { file: 'assets/chara/art-9.png', name: '尤诺' },
  { file: 'assets/chara/art-10.png', name: '弗洛洛' },
];

function catOf(type, key) {
  return (CATEGORIES[type] || []).find(c => c.key === key) ||
    { key: 'other', name: '未知', icon: '❔', color: '#94a3b8' };
}

/* ==================== 背景图（鸣潮官方壁纸，随机展示） ==================== */
const BACKGROUNDS = [
  { file: 'assets/bg-1.jpg', pos: '42% 40%' },  // 三人合影，主体偏左
  { file: 'assets/bg-2.jpg', pos: '58% 45%' },  // 双人暖黄，主体偏右
  { file: 'assets/bg-3.jpg', pos: '50% 40%' },  // 水下场景，主体居中
  { file: 'assets/bg-4.jpg', pos: '55% 45%' },  // 红黑对峙，主体略偏右
  { file: 'assets/bg-5.jpg', pos: '50% 40%' },  // 单人紫发，主体居中
];

function applyRandomBackground() {
  const layer = document.getElementById('bg-layer');
  if (!layer) return;
  const bg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
  const img = new Image();
  img.onload = () => {
    layer.style.backgroundImage = `url("${bg.file}")`;
    layer.style.backgroundPosition = bg.pos;
  };
  img.src = bg.file;
}

/* ==================== 状态 ==================== */
const state = {
  tab: 'list',
  viewMonth: todayStr().slice(0, 7),
  editingId: null,   // 正在编辑的记录 id，null 表示新增
  sheetType: 'expense',
  sheetCat: null,
  storageOk: true,
  data: null,
};

/* ==================== 工具函数 ==================== */
function pad(n) { return n < 10 ? '0' + n : '' + n; }

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fmtYuan(cents, withSymbol = true) {
  const neg = cents < 0;
  const yuan = (Math.abs(cents) / 100).toLocaleString('zh-CN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  return (neg ? '-' : '') + (withSymbol ? '¥' + yuan : yuan);
}

function fmtCompact(cents) {
  const yuan = cents / 100;
  if (yuan >= 10000) {
    const w = yuan / 10000;
    return (w >= 10 ? Math.round(w) : Math.round(w * 10) / 10) + '万';
  }
  return Math.round(yuan).toLocaleString('zh-CN');
}

function parseYuanToCents(s) {
  const n = parseFloat(s);
  if (!isFinite(n) || n <= 0 || n >= 1e9) return null;
  return Math.round(n * 100);
}

function monthAdd(m, delta) {
  const d = new Date(+m.slice(0, 4), +m.slice(5, 7) - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
function dayLabel(dateStr) {
  const [y, mo, da] = dateStr.split('-').map(Number);
  const w = new Date(y, mo - 1, da).getDay();
  let s = `${mo}月${da}日 周${WEEK[w]}`;
  if (dateStr === todayStr()) s += ' · 今天';
  return s;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function stamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

/* ==================== 存储层 ==================== */
function defaultData() {
  return { version: 1, records: [], settings: { monthlyBudget: 0 } };
}

function isValidRecord(r) {
  return r && (r.type === 'expense' || r.type === 'income') &&
    isFinite(+r.amountCents) && +r.amountCents > 0 &&
    typeof r.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.date);
}

function normalizeData(obj) {
  const data = defaultData();
  if (obj && Array.isArray(obj.records)) {
    data.records = obj.records.filter(isValidRecord).map(r => ({
      id: String(r.id || uid()),
      type: r.type,
      amountCents: Math.round(+r.amountCents),
      category: String(r.category),
      date: r.date,
      note: String(r.note || '').slice(0, 100),
      createdAt: +r.createdAt || Date.now(),
    }));
  }
  if (obj && obj.settings && isFinite(+obj.settings.monthlyBudget)) {
    data.settings.monthlyBudget = Math.max(0, Math.round(+obj.settings.monthlyBudget));
  }
  return data;
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state.data = raw ? normalizeData(JSON.parse(raw)) : defaultData();
  } catch (e) {
    state.storageOk = false;
    state.data = defaultData();
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  } catch (e) {
    state.storageOk = false;
  }
}

/* ==================== 查询 ==================== */
function recordsOfMonth(m) {
  return state.data.records
    .filter(r => r.date.slice(0, 7) === m)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

function sumsOf(records) {
  let income = 0, expense = 0;
  for (const r of records) {
    if (r.type === 'income') income += r.amountCents;
    else expense += r.amountCents;
  }
  return { income, expense };
}

/* ==================== 渲染 ==================== */
function renderAll() {
  renderMonthSwitchers();
  renderList();
  renderCharts();
  renderMe();
}

function monthSwitcherHTML() {
  const isNow = state.viewMonth === todayStr().slice(0, 7);
  return `
    <button class="ms-btn" data-act="prev" aria-label="上个月">‹</button>
    <div class="ms-label">${+state.viewMonth.slice(0, 4)}年${+state.viewMonth.slice(5, 7)}月
      ${isNow ? '' : '<button class="ms-now" data-act="now">回本月</button>'}
    </div>
    <button class="ms-btn" data-act="next" aria-label="下个月">›</button>`;
}

function renderMonthSwitchers() {
  document.querySelectorAll('.month-switcher')
    .forEach(el => { el.innerHTML = monthSwitcherHTML(); });
}

function renderList() {
  const records = recordsOfMonth(state.viewMonth);
  const { income, expense } = sumsOf(records);
  const budget = state.data.settings.monthlyBudget;

  let budgetHTML = '';
  if (budget > 0) {
    const pct = Math.min(999, Math.round(expense / budget * 100));
    const cls = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok';
    const remain = budget - expense;
    const txt = remain >= 0
      ? `预算 ${fmtYuan(budget)} · 已用 ${pct}% · 剩余 ${fmtYuan(remain)}`
      : `预算 ${fmtYuan(budget)} · 已超支 ${fmtYuan(-remain)}`;
    budgetHTML = `
      <div class="budget">
        <div class="budget-text ${cls}">${txt}</div>
        <div class="bbar"><div class="bfill ${cls}" style="width:${Math.min(100, pct)}%"></div></div>
      </div>`;
  }

  document.getElementById('summary-card').innerHTML = `
    <div class="summary-grid">
      <div class="sum-item"><span class="sum-label">支出</span><span class="sum-val c-expense">${fmtYuan(expense)}</span></div>
      <div class="sum-item"><span class="sum-label">收入</span><span class="sum-val c-income">${fmtYuan(income)}</span></div>
      <div class="sum-item"><span class="sum-label">结余</span><span class="sum-val ${income - expense >= 0 ? '' : 'c-expense'}">${fmtYuan(income - expense)}</span></div>
    </div>${budgetHTML}`;

  const listBox = document.getElementById('record-list');
  if (records.length === 0) {
    listBox.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🧾</div>
        <div>本月还没有账单</div>
        <div class="empty-hint">点击下方 ＋ 记一笔吧</div>
      </div>`;
    return;
  }

  const groups = [];
  let cur = null;
  for (const r of records) {
    if (!cur || cur.date !== r.date) {
      cur = { date: r.date, records: [] };
      groups.push(cur);
    }
    cur.records.push(r);
  }
  listBox.innerHTML = groups.map(g => {
    const dayExpense = sumsOf(g.records).expense;
    return `
      <div class="day-group">
        <div class="day-head"><span>${dayLabel(g.date)}</span><span>支出 ${fmtYuan(dayExpense)}</span></div>
        ${g.records.map(rowHTML).join('')}
      </div>`;
  }).join('');
}

function catAvatarHTML(c) {
  return `<img src="${c.avatar}" alt="${c.name}" title="${c.chara}" loading="lazy" onerror="this.outerHTML='${c.icon}'">`;
}

function rowHTML(r) {
  const c = catOf(r.type, r.category);
  const sign = r.type === 'income' ? '+' : '-';
  const title = r.note ? esc(r.note) : c.name;
  const sub = r.note ? c.name : '';
  return `
    <div class="record-row" data-id="${r.id}" role="button" tabindex="0">
      <div class="cat-badge" style="--c:${c.color}" title="${c.chara}">${catAvatarHTML(c)}</div>
      <div class="rec-main">
        <div class="rec-title">${title}</div>
        ${sub ? `<div class="rec-sub">${sub}</div>` : ''}
      </div>
      <div class="rec-amount ${r.type === 'income' ? 'c-income' : 'c-expense'}">${sign}${fmtYuan(r.amountCents)}</div>
    </div>`;
}

function renderCharts() {
  const records = recordsOfMonth(state.viewMonth);
  const expense = sumsOf(records).expense;
  const monthNum = +state.viewMonth.slice(5, 7);

  // 分类占比环形图
  const byCat = {};
  for (const r of records) {
    if (r.type === 'expense') byCat[r.category] = (byCat[r.category] || 0) + r.amountCents;
  }
  const items = Object.entries(byCat)
    .map(([key, cents]) => ({ ...catOf('expense', key), cents }))
    .sort((a, b) => b.cents - a.cents);

  document.getElementById('donut-card').innerHTML = `
    <div class="card-title">支出分类 · ${monthNum}月</div>
    ${donutSVG(items, expense, monthNum)}
    <div class="legend">${items.map(it => `
      <div class="legend-row">
        <span class="dot" style="background:${it.color}"></span>
        <img class="legend-ava" src="${it.avatar}" alt="" loading="lazy" onerror="this.remove()">
        <span class="legend-name">${it.name}</span>
        <span class="legend-val">${fmtYuan(it.cents)}</span>
        <span class="legend-pct">${expense ? Math.round(it.cents / expense * 100) : 0}%</span>
      </div>`).join('')}
    </div>`;

  // 近 6 个月收支趋势
  const rows = [];
  for (let i = 5; i >= 0; i--) {
    const m = monthAdd(state.viewMonth, -i);
    const s = sumsOf(recordsOfMonth(m));
    rows.push({ m, income: s.income, expense: s.expense });
  }
  document.getElementById('bars-card').innerHTML = `
    <div class="card-title">近 6 个月收支趋势</div>
    ${barsSVG(rows)}
    <div class="chart-legend">
      <span><i class="dot" style="background:var(--income)"></i>收入</span>
      <span><i class="dot" style="background:var(--expense)"></i>支出</span>
    </div>`;
}

function donutSVG(items, totalCents, monthNum) {
  const C = 2 * Math.PI * 78;
  let body = '';
  if (!items.length) {
    body = `<circle cx="100" cy="100" r="78" fill="none" stroke="#edf0f3" stroke-width="30"/>`;
  } else {
    let acc = 0;
    for (const it of items) {
      const len = it.cents / totalCents * C;
      body += `<circle cx="100" cy="100" r="78" fill="none" stroke="${it.color}" stroke-width="30"
        stroke-dasharray="${len} ${C}" stroke-dashoffset="${-acc}" transform="rotate(-90 100 100)"/>`;
      acc += len;
    }
  }
  return `
  <svg class="donut" viewBox="0 0 200 200" role="img" aria-label="支出分类占比">
    ${body}
    <text x="100" y="92" text-anchor="middle" class="svg-label">${monthNum}月支出</text>
    <text x="100" y="116" text-anchor="middle" class="svg-total">${fmtYuan(totalCents)}</text>
  </svg>`;
}

function barsSVG(rows) {
  const W = 344, H = 190, x0 = 44, x1 = 338, yBase = 150, yTop = 14;
  const plotH = yBase - yTop;
  const maxVal = Math.max(0, ...rows.map(r => Math.max(r.income, r.expense)));
  if (maxVal === 0) return `<div class="empty-chart">近 6 个月暂无账单</div>`;

  const slot = (x1 - x0) / rows.length;
  const barW = 14, gap = 4, groupW = barW * 2 + gap;
  let out = '';
  [1, 0.5].forEach(t => {
    const y = yBase - plotH * t;
    out += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" class="grid"/>`;
    out += `<text x="${x0 - 4}" y="${y + 3}" text-anchor="end" class="svg-tick">¥${fmtCompact(maxVal * t)}</text>`;
  });
  out += `<line x1="${x0}" y1="${yBase}" x2="${x1}" y2="${yBase}" class="axis"/>`;

  rows.forEach((r, i) => {
    const cx = x0 + slot * i + slot / 2;
    const hIn = Math.max(r.income > 0 ? 3 : 0, r.income / maxVal * plotH);
    const hEx = Math.max(r.expense > 0 ? 3 : 0, r.expense / maxVal * plotH);
    const mLabel = +r.m.slice(5, 7) + '月';
    out += `
      <rect x="${(cx - groupW / 2).toFixed(1)}" y="${(yBase - hIn).toFixed(1)}" width="${barW}" height="${hIn.toFixed(1)}" rx="3" class="bar-income"><title>${mLabel}收入 ${fmtYuan(r.income)}</title></rect>
      <rect x="${(cx - groupW / 2 + barW + gap).toFixed(1)}" y="${(yBase - hEx).toFixed(1)}" width="${barW}" height="${hEx.toFixed(1)}" rx="3" class="bar-expense"><title>${mLabel}支出 ${fmtYuan(r.expense)}</title></rect>
      <text x="${cx.toFixed(1)}" y="${yBase + 16}" text-anchor="middle" class="svg-month">${mLabel}</text>`;
  });
  return `<svg class="bars" viewBox="0 0 ${W} ${H}" role="img" aria-label="近6个月收支趋势">${out}</svg>`;
}

function renderMe() {
  const input = document.getElementById('budget-input');
  if (document.activeElement !== input) {
    const b = state.data.settings.monthlyBudget;
    input.value = b ? (b / 100) : '';
  }
  const dates = state.data.records.map(r => r.date).sort();
  document.getElementById('me-stats').textContent = dates.length
    ? `共 ${dates.length} 笔账单 · ${dates[0]} ~ ${dates[dates.length - 1]}`
    : '还没有任何账单';
  document.getElementById('storage-warn').classList.toggle('hidden', state.storageOk);
}

/* ==================== 记一笔弹层 ==================== */
let deleteArmed = false;
let deleteTimer = null;

function openSheet(record) {
  state.editingId = record ? record.id : null;
  state.sheetType = record ? record.type : 'expense';
  document.getElementById('sheet-title').textContent = record ? '编辑账单' : '记一笔';
  document.getElementById('amount-input').value = record ? record.amountCents / 100 : '';
  document.getElementById('date-input').value = record ? record.date : todayStr();
  document.getElementById('note-input').value = record ? record.note : '';
  document.getElementById('btn-delete').classList.toggle('hidden', !record);
  resetDeleteBtn();
  renderCatGrid(record ? record.category : null);
  pickRandomCharaArt();
  document.getElementById('sheet-wrap').classList.add('open');
  setTimeout(() => document.getElementById('amount-input').focus(), 260);
}

function pickRandomCharaArt() {
  const art = CHARA_ARTS[Math.floor(Math.random() * CHARA_ARTS.length)];
  document.getElementById('chara-art').src = art.file;
  document.getElementById('chara-name').textContent = art.name;
}

function closeSheet() {
  document.getElementById('sheet-wrap').classList.remove('open');
  state.editingId = null;
  resetDeleteBtn();
}

function renderCatGrid(selectedKey) {
  const cats = CATEGORIES[state.sheetType];
  if (!selectedKey || !cats.some(c => c.key === selectedKey)) selectedKey = cats[0].key;
  state.sheetCat = selectedKey;
  document.getElementById('cat-grid').innerHTML = cats.map(c => `
    <button type="button" class="cat-item ${c.key === selectedKey ? 'selected' : ''}" data-key="${c.key}" style="--c:${c.color}" title="${c.chara}">
      <span class="cat-icon">${catAvatarHTML(c)}</span><span class="cat-name">${c.name}</span>
    </button>`).join('');
  document.querySelectorAll('#sheet-type button')
    .forEach(b => b.classList.toggle('active', b.dataset.type === state.sheetType));
}

function saveSheet() {
  const cents = parseYuanToCents(document.getElementById('amount-input').value.trim());
  if (!cents) { toast('请输入正确的金额'); shake('amount-input'); return; }
  const date = document.getElementById('date-input').value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { toast('请选择日期'); return; }
  const note = document.getElementById('note-input').value.trim();

  if (state.editingId) {
    const r = state.data.records.find(r => r.id === state.editingId);
    if (r) Object.assign(r, { type: state.sheetType, amountCents: cents, category: state.sheetCat, date, note });
  } else {
    state.data.records.push({
      id: uid(), type: state.sheetType, amountCents: cents,
      category: state.sheetCat, date, note, createdAt: Date.now(),
    });
  }
  saveData();
  state.viewMonth = date.slice(0, 7);
  switchTab('list');
  closeSheet();
  renderAll();
  toast('已保存');
}

function resetDeleteBtn() {
  deleteArmed = false;
  clearTimeout(deleteTimer);
  const btn = document.getElementById('btn-delete');
  btn.textContent = '删除';
  btn.classList.remove('armed');
}

function onDeleteClick() {
  if (!state.editingId) return;
  if (!deleteArmed) {
    deleteArmed = true;
    const btn = document.getElementById('btn-delete');
    btn.textContent = '确认删除';
    btn.classList.add('armed');
    deleteTimer = setTimeout(resetDeleteBtn, 2500);
    return;
  }
  state.data.records = state.data.records.filter(r => r.id !== state.editingId);
  saveData();
  closeSheet();
  renderAll();
  toast('已删除');
}

/* ==================== 数据导入导出 ==================== */
function downloadFile(name, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function exportJSON() {
  downloadFile(`记账备份_${stamp()}.json`, JSON.stringify(state.data, null, 2), 'application/json');
  toast('已导出备份文件');
}

function exportCSV() {
  const rows = [['日期', '类型', '分类', '金额(元)', '备注']];
  for (const r of [...state.data.records].sort((a, b) => a.date.localeCompare(b.date))) {
    rows.push([r.date, r.type === 'income' ? '收入' : '支出', catOf(r.type, r.category).name,
      (r.amountCents / 100).toFixed(2), r.note]);
  }
  const csv = '\ufeff' + rows
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  downloadFile(`记账明细_${stamp()}.csv`, csv, 'text/csv;charset=utf-8');
  toast('已导出 CSV 文件');
}

function importJSON(e) {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      if (!obj || !Array.isArray(obj.records)) throw new Error('bad format');
      const normalized = normalizeData(obj);
      if (!confirm(`备份中有 ${normalized.records.length} 笔账单，导入后将覆盖当前全部数据，确定继续吗？`)) return;
      state.data = normalized;
      saveData();
      state.viewMonth = todayStr().slice(0, 7);
      renderAll();
      toast('导入成功');
    } catch (err) {
      alert('导入失败：文件格式不正确');
    }
  };
  reader.readAsText(file);
}

/* ==================== 交互与初始化 ==================== */
function switchTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.tab-btn')
    .forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.view')
    .forEach(v => v.classList.toggle('active', v.id === 'view-' + tab));
}

let toastTimer = null;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

function shake(id) {
  const el = document.getElementById(id);
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 400);
}

function init() {
  loadData();
  applyRandomBackground();

  document.querySelectorAll('.tab-btn')
    .forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  document.getElementById('fab-add').addEventListener('click', () => openSheet(null));
  document.getElementById('sheet-close').addEventListener('click', closeSheet);
  document.getElementById('overlay').addEventListener('click', closeSheet);

  document.querySelectorAll('#sheet-type button').forEach(b =>
    b.addEventListener('click', () => { state.sheetType = b.dataset.type; renderCatGrid(null); }));
  document.getElementById('cat-grid').addEventListener('click', e => {
    const item = e.target.closest('.cat-item');
    if (item) renderCatGrid(item.dataset.key);
  });
  document.getElementById('btn-save').addEventListener('click', saveSheet);
  document.getElementById('btn-delete').addEventListener('click', onDeleteClick);
  document.getElementById('sheet').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); saveSheet(); }
  });

  // 月份切换（两处开关共用，事件委托）
  document.addEventListener('click', e => {
    const ms = e.target.closest('.ms-btn, .ms-now');
    if (!ms) return;
    state.viewMonth = ms.dataset.act === 'now'
      ? todayStr().slice(0, 7)
      : monthAdd(state.viewMonth, ms.dataset.act === 'prev' ? -1 : 1);
    renderAll();
  });

  // 点击账单行 → 编辑
  document.getElementById('record-list').addEventListener('click', e => {
    const row = e.target.closest('.record-row');
    if (!row) return;
    const rec = state.data.records.find(r => r.id === row.dataset.id);
    if (rec) openSheet(rec);
  });

  document.getElementById('btn-budget').addEventListener('click', () => {
    const raw = document.getElementById('budget-input').value.trim();
    const cents = raw === '' ? 0 : parseYuanToCents(raw);
    if (raw !== '' && cents === null) { toast('预算金额不正确'); return; }
    state.data.settings.monthlyBudget = cents || 0;
    saveData();
    renderAll();
    toast(cents ? '预算已保存' : '已关闭预算提醒');
  });

  document.getElementById('btn-export-json').addEventListener('click', exportJSON);
  document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
  document.getElementById('btn-import').addEventListener('click', () =>
    document.getElementById('import-file').click());
  document.getElementById('import-file').addEventListener('change', importJSON);

  switchTab('list');
  renderAll();
  if (!state.storageOk) toast('注意：当前浏览器无法保存数据');
}

document.addEventListener('DOMContentLoaded', init);
