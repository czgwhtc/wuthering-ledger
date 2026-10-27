'use strict';

/* ==================== 常量与分类 ==================== */
const STORAGE_KEY = 'ledger.data.v1';
const PROFILE_KEY = 'ledger.profiles.v1';

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
    { key: 'bonus',   name: '奖金', icon: '🎁', color: '#eab308', chara: '锁暝',     avatar: 'assets/chara/av-bonus.png' },
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

/* ==================== 背景图（39 位五星限定角色官方海报，随机展示） ==================== */
const BACKGROUNDS = [
  { file: 'assets/bg-01.jpg', pos: '50% 30%' }, // 忌炎
  { file: 'assets/bg-02.jpg', pos: '50% 30%' }, // 吟霖
  { file: 'assets/bg-03.jpg', pos: '50% 30%' }, // 今汐
  { file: 'assets/bg-04.jpg', pos: '50% 30%' }, // 长离
  { file: 'assets/bg-05.jpg', pos: '50% 30%' }, // 折枝
  { file: 'assets/bg-06.jpg', pos: '50% 30%' }, // 相里要
  { file: 'assets/bg-07.jpg', pos: '50% 30%' }, // 椿
  { file: 'assets/bg-08.jpg', pos: '50% 30%' }, // 守岸人
  { file: 'assets/bg-09.jpg', pos: '50% 30%' }, // 珂莱塔
  { file: 'assets/bg-10.jpg', pos: '50% 30%' }, // 洛可可
  { file: 'assets/bg-11.jpg', pos: '50% 30%' }, // 菲比
  { file: 'assets/bg-12.jpg', pos: '50% 30%' }, // 布兰特
  { file: 'assets/bg-13.jpg', pos: '50% 30%' }, // 坎特蕾拉
  { file: 'assets/bg-14.webp', pos: '50% 30%' }, // 赞妮
  { file: 'assets/bg-15.webp', pos: '50% 30%' }, // 夏空
  { file: 'assets/bg-16.webp', pos: '50% 30%' }, // 卡提希娅
  { file: 'assets/bg-17.webp', pos: '50% 30%' }, // 露帕
  { file: 'assets/bg-18.webp', pos: '50% 30%' }, // 弗洛洛
  { file: 'assets/bg-19.webp', pos: '50% 30%' }, // 奥古斯塔
  { file: 'assets/bg-20.webp', pos: '50% 30%' }, // 尤诺
  { file: 'assets/bg-21.webp', pos: '50% 30%' }, // 嘉贝莉娜
  { file: 'assets/bg-22.webp', pos: '50% 30%' }, // 仇远
  { file: 'assets/bg-23.webp', pos: '50% 30%' }, // 千咲
  { file: 'assets/bg-24.webp', pos: '50% 30%' }, // 琳奈
  { file: 'assets/bg-25.webp', pos: '50% 30%' }, // 莫宁
  { file: 'assets/bg-26.webp', pos: '50% 30%' }, // 爱弥斯
  { file: 'assets/bg-27.webp', pos: '50% 30%' }, // 陆赫斯
  { file: 'assets/bg-28.webp', pos: '50% 30%' }, // 西格莉卡
  { file: 'assets/bg-29.webp', pos: '50% 30%' }, // 绯雪
  { file: 'assets/bg-30.webp', pos: '50% 30%' }, // 达妮娅
  { file: 'assets/bg-31.webp', pos: '50% 30%' }, // 丽贝卡
  { file: 'assets/bg-32.webp', pos: '50% 30%' }, // 露西
  { file: 'assets/bg-33.webp', pos: '50% 30%' }, // 洛瑟菈
  { file: 'assets/bg-34.webp', pos: '50% 30%' }, // 穗穗
  { file: 'assets/bg-35.webp', pos: '50% 30%' }, // 清宵
  { file: 'assets/bg-36.webp', pos: '50% 30%' }, // 景燃
  { file: 'assets/bg-37.webp', pos: '50% 30%' }, // 心
  { file: 'assets/bg-38.webp', pos: '50% 30%' }, // 秧秧·玄翎
  { file: 'assets/bg-39.webp', pos: '50% 30%' }, // 锁暝
];

function applyRandomBackground() {
  const first = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
  showBackground(first);
  startBackgroundRotation();
}

let bgCurrentFile = null;
let bgFrontIsLayerA = true;

function showBackground(bg) {
  const layerA = document.getElementById('bg-layer');
  const layerB = document.getElementById('bg-alt');
  if (!layerA || !layerB) return;
  const front = bgFrontIsLayerA ? layerA : layerB;
  const back = bgFrontIsLayerA ? layerB : layerA;
  const img = new Image();
  img.onload = () => {
    back.style.backgroundImage = `url("${bg.file}")`;
    back.style.backgroundPosition = bg.pos;
    back.classList.add('show');
    front.classList.remove('show');
    bgFrontIsLayerA = !bgFrontIsLayerA;
    bgCurrentFile = bg.file;
  };
  img.src = bg.file;
}

/* 每 BG_ROTATE_MS 自动换一张；页面切到后台时暂停，回来继续 */
const BG_ROTATE_MS = 10000;

function startBackgroundRotation() {
  const next = () => {
    let bg;
    do {
      bg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
    } while (BACKGROUNDS.length > 1 && bg.file === bgCurrentFile);
    showBackground(bg);
  };
  let timer = setInterval(next, BG_ROTATE_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(timer);
      timer = null;
    } else if (!timer) {
      timer = setInterval(next, BG_ROTATE_MS);
    }
  });
}

/* ==================== 状态 ==================== */
const state = {
  tab: 'day',
  viewDate: todayStr(),
  viewMonth: todayStr().slice(0, 7),
  editingId: null,   // 正在编辑的记录 id，null 表示新增
  sheetType: 'expense',
  sheetCat: null,
  storageOk: true,
  profileName: '默认',
  profiles: null,    // { current, names: [] }
  manageMode: false, // 批量管理模式
  selectedIds: new Set(),
  sheetFromTab: 'day',  // 记一笔是从哪个页面打开的，保存后回去
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

/* ==================== 账期（可配置起始日） ==================== */
function periodStartDay() {
  const s = state.data.settings;
  return (s.monthStartOn === true && s.monthStartDay >= 1 && s.monthStartDay <= 28)
    ? s.monthStartDay : 1;
}

/* 日期 → 所属账期（用起始月 YYYY-MM 表示） */
function periodOfDate(dateStr) {
  const d0 = periodStartDay();
  if (d0 === 1) return dateStr.slice(0, 7);
  return +dateStr.slice(8, 10) >= d0 ? dateStr.slice(0, 7) : monthAdd(dateStr.slice(0, 7), -1);
}

function currentPeriodKey() { return periodOfDate(todayStr()); }

/* 期 → [起始日, 结束日] */
function periodRange(pk) {
  const d0 = periodStartDay();
  const start = `${pk}-${pad(d0)}`;
  const end = dayAdd(`${monthAdd(pk, 1)}-${pad(d0)}`, -1);
  return [start, end];
}

function periodLabel(pk) {
  const d0 = periodStartDay();
  if (d0 === 1) return `${+pk.slice(0, 4)}年${+pk.slice(5, 7)}月`;
  const [s, e] = periodRange(pk);
  return `${s.slice(0, 4)}.${+s.slice(5, 7)}.${+s.slice(8, 10)}–${+e.slice(5, 7)}.${+e.slice(8, 10)}`;
}

/* 图表用的短标签：自然月 "10月"，自定义 "9.15" */
function periodBarLabel(pk) {
  const d0 = periodStartDay();
  return d0 === 1 ? `${+pk.slice(5, 7)}月` : `${+pk.slice(5, 7)}.${d0}`;
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

/* ==================== 多账本（每人数据独立） ==================== */
function dataKey(name) { return STORAGE_KEY + '::' + (name || state.profileName); }

function loadProfiles() {
  let p = null;
  try {
    p = JSON.parse(localStorage.getItem(PROFILE_KEY));
  } catch (e) { /* ignore */ }
  if (p && Array.isArray(p.names) && p.names.length && p.names.includes(p.current)) {
    state.profiles = p;
  } else {
    // 首次升级：把旧的单账本数据迁移到「默认」账本
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { localStorage.setItem(STORAGE_KEY + '::默认', raw); } catch (e) { /* ignore */ }
    }
    state.profiles = { current: '默认', names: ['默认'] };
    saveProfiles();
  }
  state.profileName = state.profiles.current;
}

function saveProfiles() {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profiles)); }
  catch (e) { state.storageOk = false; }
}

function switchProfile(name) {
  saveData();  // 保存当前账本
  state.profileName = name;
  state.profiles.current = name;
  saveProfiles();
  loadData();
  state.viewMonth = todayStr().slice(0, 7);
  state.viewDate = todayStr();
  closeSheet();
  switchTab('day');
  renderAll();
  toast(`已切换到「${name}」账本`);
}

function createProfile(name) {
  name = name.trim().slice(0, 12);
  if (!name) { toast('请输入账本名字'); return; }
  if (state.profiles.names.includes(name)) { toast('这个名字已存在'); return; }
  state.profiles.names.push(name);
  saveProfiles();
  switchProfile(name);
  toast(`已创建「${name}」账本`);
}

function deleteProfile(name) {
  if (state.profiles.names.length <= 1) { toast('至少保留一个账本'); return; }
  state.profiles.names = state.profiles.names.filter(n => n !== name);
  try { localStorage.removeItem(dataKey(name)); } catch (e) { /* ignore */ }
  if (state.profileName === name) {
    state.profileName = state.profiles.names[0];
    state.profiles.current = state.profileName;
    saveProfiles();
    loadData();
  } else {
    saveProfiles();
  }
  renderAll();
  toast(`已删除「${name}」账本`);
}

/* ==================== 存储层（按账本分键） ==================== */
function defaultData() {
  return {
    version: 1, records: [], deleted: {},
    settings: { monthlyBudget: 0, recurring: [], recurringOn: true, rolloverOn: true },
  };
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
      updatedAt: +r.updatedAt || +r.createdAt || Date.now(),
      recurringId: r.recurringId ? String(r.recurringId) : undefined,
      extId: r.extId ? String(r.extId).slice(0, 64) : undefined,  // 微信/支付宝交易单号，用于导入去重
    }));
  }
  if (obj && obj.settings && isFinite(+obj.settings.monthlyBudget)) {
    data.settings.monthlyBudget = Math.max(0, Math.round(+obj.settings.monthlyBudget));
    data.settings.budgetUpdatedAt = +obj.settings.budgetUpdatedAt || 0;
    data.settings.recurringOn = obj.settings.recurringOn !== false;
    data.settings.rolloverOn = obj.settings.rolloverOn !== false;
    data.settings.monthStartOn = obj.settings.monthStartOn === true;
    data.settings.monthStartDay = Math.min(28, Math.max(1, +obj.settings.monthStartDay || 1));
    if (Array.isArray(obj.settings.recurring)) {
      data.settings.recurring = obj.settings.recurring
        .filter(b => b && +b.amountCents > 0 && +b.day >= 1 && +b.day <= 28)
        .map(b => ({
          id: String(b.id || uid()),
          name: String(b.name || '周期账单').slice(0, 12),
          amountCents: Math.round(+b.amountCents),
          category: String(b.category || 'other'),
          day: Math.round(+b.day),
          lastGen: b.lastGen || null,
        }));
    }
  }
  if (obj && obj.deleted && typeof obj.deleted === 'object') {
    data.deleted = {};
    for (const [id, t] of Object.entries(obj.deleted)) {
      if (+t) data.deleted[id] = +t;
    }
  }
  return data;
}

function loadData() {
  try {
    const raw = localStorage.getItem(dataKey());
    state.data = raw ? normalizeData(JSON.parse(raw)) : defaultData();
  } catch (e) {
    state.storageOk = false;
    state.data = defaultData();
  }
}

function saveData() {
  try {
    localStorage.setItem(dataKey(), JSON.stringify(state.data));
    scheduleAutoSync();
  } catch (e) {
    state.storageOk = false;
  }
}

/* ==================== 查询 ==================== */
function recordsOfMonth(pk) {
  return state.data.records
    .filter(r => periodOfDate(r.date) === pk)
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
function dayAdd(dateStr, delta) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + delta);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

/* ==================== 每日明细（今日页） ==================== */
/* ==================== 周期账单 ==================== */
function initRecurring() {
  const s = state.data.settings;
  if (!s.recurringOn || !Array.isArray(s.recurring) || !s.recurring.length) return;
  const today = todayStr();
  const pk = currentPeriodKey();
  const d0 = periodStartDay();
  let added = 0;
  for (const b of s.recurring) {
    if (!(+b.day >= 1 && +b.day <= 28) || !+b.amountCents) continue;
    // 账单日落在本期内的具体日期：日 ≥ 起始日 → 本月，否则 → 下月
    const occur = +b.day >= d0 ? `${pk}-${pad(+b.day)}` : `${monthAdd(pk, 1)}-${pad(+b.day)}`;
    if (occur > today) continue;          // 本期还没到日子
    if (b.lastGen === pk) continue;       // 本期已生成过
    const exists = state.data.records.some(r => r.recurringId === b.id && periodOfDate(r.date) === pk);
    if (!exists) {
      state.data.records.push({
        id: uid(), type: 'expense', amountCents: b.amountCents, category: b.category,
        date: occur, note: b.name,
        createdAt: Date.now(), updatedAt: Date.now(), recurringId: b.id,
      });
      added++;
    }
    b.lastGen = pk;
  }
  if (added) { saveData(); toast(`周期账单已自动记入 ${added} 笔`); }
}

/* ==================== 设置页 ==================== */
let recDeleteArmed = null;
let recDeleteTimer = null;

function updateSettingsUI() {
  const s = state.data.settings;
  const swR = document.getElementById('sw-recurring');
  const swO = document.getElementById('sw-rollover');
  const swM = document.getElementById('sw-monthstart');
  if (swR) swR.classList.toggle('on', s.recurringOn !== false);
  if (swO) swO.classList.toggle('on', s.rolloverOn !== false);
  if (swM) swM.classList.toggle('on', s.monthStartOn === true);
  const msInput = document.getElementById('ms-day');
  if (msInput && document.activeElement !== msInput) {
    msInput.value = s.monthStartOn === true ? (s.monthStartDay || 1) : '';
  }
  renderRecurringList();
  fillRecCatOptions();
}

function fillRecCatOptions() {
  const sel = document.getElementById('rec-cat');
  if (!sel || sel.options.length) return;
  sel.innerHTML = CATEGORIES.expense.map(c => `<option value="${c.key}">${c.icon} ${c.name}</option>`).join('');
}

function renderRecurringList() {
  const box = document.getElementById('recurring-list');
  if (!box) return;
  const list = state.data.settings.recurring || [];
  if (!list.length) {
    box.innerHTML = `<div class="set-desc" style="padding:8px 0 2px">还没有周期账单，用下面一行添加</div>`;
    return;
  }
  box.innerHTML = list.map(b => {
    const c = catOf('expense', b.category);
    const armed = recDeleteArmed === b.id;
    return `
    <div class="rec-row">
      <div class="cat-badge" style="--c:${c.color}">${catAvatarHTML(c)}</div>
      <div class="rec-info">
        <div class="rec-title-line">${esc(b.name)}</div>
        <div class="rec-sub-line">每月 ${b.day} 号 · ${fmtYuan(b.amountCents)}</div>
      </div>
      <button class="profile-btn danger ${armed ? 'armed' : ''}" data-rec="${b.id}">${armed ? '确认' : '删除'}</button>
    </div>`;
  }).join('');
}

function addRecurring() {
  const name = document.getElementById('rec-name').value.trim();
  const cents = parseYuanToCents(document.getElementById('rec-amount').value.trim());
  const day = Math.round(+document.getElementById('rec-day').value);
  const category = document.getElementById('rec-cat').value;
  if (!name) { toast('请填名称'); return; }
  if (!cents) { toast('请填正确的金额'); return; }
  if (!(day >= 1 && day <= 28)) { toast('日期请填 1-28 号'); return; }
  const s = state.data.settings;
  s.recurring = s.recurring || [];
  s.recurring.push({ id: uid(), name, amountCents: cents, category, day, lastGen: null });
  s.recurringOn = true;
  saveData();
  document.getElementById('rec-name').value = '';
  document.getElementById('rec-amount').value = '';
  document.getElementById('rec-day').value = '';
  initRecurring();
  updateSettingsUI();
  renderAll();
  toast('已添加周期账单');
}

function onRecDeleteClick(btn) {
  const id = btn.dataset.rec;
  if (recDeleteArmed !== id) {
    recDeleteArmed = id;
    clearTimeout(recDeleteTimer);
    recDeleteTimer = setTimeout(() => { recDeleteArmed = null; renderRecurringList(); }, 2500);
    renderRecurringList();
  } else {
    recDeleteArmed = null;
    clearTimeout(recDeleteTimer);
    const s = state.data.settings;
    s.recurring = (s.recurring || []).filter(b => b.id !== id);
    saveData();
    renderRecurringList();
    renderAll();
    toast('已删除周期账单（已生成的历史账单保留）');
  }
}

function renderDay() {
  const sw = document.getElementById('day-switcher');
  const records = state.data.records
    .filter(r => r.date === state.viewDate)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const isToday = state.viewDate === todayStr();

  sw.innerHTML = `
    <button class="ms-btn" data-act="dprev" aria-label="前一天">‹</button>
    <div class="ms-label">${dayLabel(state.viewDate).replace(' · 今天', '')}
      <input type="date" id="day-jump" value="${state.viewDate}" aria-label="选择日期">
      ${isToday ? '' : '<button class="ms-now" data-act="dnow">回今天</button>'}
    </div>
    <button class="ms-btn" data-act="dnext" aria-label="后一天">›</button>`;

  const { income, expense } = sumsOf(records);

  // 日预算：月预算均摊到当月每天；开启结转后按当月累计盈亏滚动
  let dayBudgetHTML = '';
  const budget = state.data.settings.monthlyBudget;
  if (budget > 0) {
    const pk = periodOfDate(state.viewDate);
    const [ps, pe] = periodRange(pk);
    const days = Math.round((new Date(pe) - new Date(ps)) / 86400000) + 1;
    const base = Math.round(budget / days);
    const rolloverOn = state.data.settings.rolloverOn !== false;
    let dayBudget = base, carry = 0, carryText = '';
    if (rolloverOn) {
      const cumSpentBefore = state.data.records.reduce((sum, r) =>
        sum + (r.type === 'expense' && r.date >= ps && r.date < state.viewDate ? r.amountCents : 0), 0);
      const daysBefore = Math.round((new Date(state.viewDate) - new Date(ps)) / 86400000);
      carry = base * daysBefore - cumSpentBefore;
      dayBudget = Math.max(0, base + carry);
      if (carry !== 0) carryText = `（含结转 ${carry > 0 ? '+' : '-'}${fmtYuan(Math.abs(carry), false)}）`;
    }
    const pct = dayBudget > 0 ? Math.min(999, Math.round(expense / dayBudget * 100)) : 999;
    const cls = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok';
    const remain = dayBudget - expense;
    const txt = remain >= 0
      ? `日预算 ${fmtYuan(dayBudget)}${carryText} · 已用 ${pct}% · 剩余 ${fmtYuan(remain)}`
      : `日预算 ${fmtYuan(dayBudget)}${carryText} · 已超支 ${fmtYuan(-remain)}`;
    dayBudgetHTML = `
      <div class="budget">
        <div class="budget-text ${cls}">${txt}</div>
        <div class="bbar"><div class="bfill ${cls}" style="width:${Math.min(100, pct)}%"></div></div>
        <div class="budget-sub">按月预算 ${fmtYuan(budget)} ÷ 账期 ${days} 天均摊${rolloverOn ? '，盈亏自动结转' : ''}</div>
      </div>`;
  }

  document.getElementById('day-summary-card').innerHTML = `
    <div class="summary-grid">
      <div class="sum-item"><span class="sum-label">支出</span><span class="sum-val c-expense">${fmtYuan(expense)}</span></div>
      <div class="sum-item"><span class="sum-label">收入</span><span class="sum-val c-income">${fmtYuan(income)}</span></div>
      <div class="sum-item"><span class="sum-label">结余</span><span class="sum-val ${income - expense >= 0 ? '' : 'c-expense'}">${fmtYuan(income - expense)}</span></div>
    </div>${dayBudgetHTML}
    <div class="day-count">${records.length ? `共 ${records.length} 笔` : ''}</div>`;

  const box = document.getElementById('day-record-list');
  box.innerHTML = records.length
    ? records.map(rowHTML).join('')
    : `<div class="empty"><div class="empty-icon">🌤️</div><div>${isToday ? '今天还没有账单' : '这一天没有账单'}</div><div class="empty-hint">点击下方 ＋ 记一笔吧</div></div>`;
}

function renderAll() {
  renderDay();
  renderMonthSwitchers();
  renderList();
  renderCharts();
  renderMe();
  renderProfiles();
  updateSettingsUI();
}

function monthSwitcherHTML() {
  const custom = periodStartDay() !== 1;
  const isNow = state.viewMonth === currentPeriodKey();
  return `
    <button class="ms-btn" data-act="prev" aria-label="上一期">‹</button>
    <div class="ms-label">${periodLabel(state.viewMonth)}
      ${isNow ? '' : `<button class="ms-now" data-act="now">${custom ? '回本期' : '回本月'}</button>`}
    </div>
    <button class="ms-btn" data-act="next" aria-label="下一期">›</button>`;
}

function renderMonthSwitchers() {
  document.querySelectorAll('.month-switcher:not(.day-switcher)')
    .forEach(el => { el.innerHTML = monthSwitcherHTML(); });
}

/* ==================== 批量删除 ==================== */
let batchDeleteArmed = false;
let batchDeleteTimer = null;

function enterManageMode() {
  state.manageMode = true;
  state.selectedIds.clear();
  resetBatchDelete();
  document.getElementById('fab-add').classList.add('hidden');
  renderList();
}

function exitManageMode() {
  if (!state.manageMode) return;
  state.manageMode = false;
  state.selectedIds.clear();
  resetBatchDelete();
  document.getElementById('fab-add').classList.remove('hidden');
  renderList();
}

function resetBatchDelete() {
  batchDeleteArmed = false;
  clearTimeout(batchDeleteTimer);
}

function toggleSelect(id) {
  if (state.selectedIds.has(id)) state.selectedIds.delete(id);
  else state.selectedIds.add(id);
  resetBatchDelete();
  renderList();
}

function toggleSelectAll(records) {
  const allSel = records.every(r => state.selectedIds.has(r.id));
  if (allSel) records.forEach(r => state.selectedIds.delete(r.id));
  else records.forEach(r => state.selectedIds.add(r.id));
  resetBatchDelete();
  renderList();
}

function onBatchDeleteClick() {
  const n = state.selectedIds.size;
  if (!n) { toast('请先选择要删除的账单'); return; }
  if (!batchDeleteArmed) {
    batchDeleteArmed = true;
    clearTimeout(batchDeleteTimer);
    batchDeleteTimer = setTimeout(() => { batchDeleteArmed = false; renderList(); }, 2500);
    renderList();
    return;
  }
  state.data.deleted = state.data.deleted || {};
  for (const id of state.selectedIds) state.data.deleted[id] = Date.now();
  state.data.records = state.data.records.filter(r => !state.selectedIds.has(r.id));
  saveData();
  exitManageMode();
  renderAll();
  toast(`已删除 ${n} 笔账单`);
}

function manageBarHTML(records) {
  if (!state.manageMode) {
    return `<div class="manage-bar">
      <span class="manage-hint">本月共 ${records.length} 笔</span>
      <button class="manage-btn" id="btn-enter-manage">批量删除</button>
    </div>`;
  }
  const n = records.filter(r => state.selectedIds.has(r.id)).length;
  const allSel = n === records.length && n > 0;
  return `<div class="manage-bar managing">
    <button class="manage-btn" id="btn-select-all">${allSel ? '取消全选' : '全选'}</button>
    <span class="manage-hint">已选 ${n} 笔</span>
    <span class="manage-group">
      <button class="manage-btn danger ${batchDeleteArmed ? 'armed' : ''}" id="btn-batch-del" ${n ? '' : 'disabled'}>${batchDeleteArmed ? '确认删除' : '删除'}</button>
      <button class="manage-btn" id="btn-exit-manage">完成</button>
    </span>
  </div>`;
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
  listBox.innerHTML = manageBarHTML(records) + groups.map(g => {
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
  const checked = state.manageMode && state.selectedIds.has(r.id);
  const check = state.manageMode
    ? `<div class="sel-check ${checked ? 'on' : ''}">${checked ? '✓' : ''}</div>` : '';
  return `
    <div class="record-row ${state.manageMode ? 'selectable' : ''}" data-id="${r.id}" role="button" tabindex="0">
      ${check}
      <div class="cat-badge" style="--c:${c.color}" title="${c.chara}">${catAvatarHTML(c)}</div>
      <div class="rec-main">
        <div class="rec-title">${r.recurringId ? '<span class="rec-flag" title="周期账单">🔁</span>' : ''}${title}</div>
        ${sub ? `<div class="rec-sub">${sub}</div>` : ''}
      </div>
      <div class="rec-amount ${r.type === 'income' ? 'c-income' : 'c-expense'}">${sign}${fmtYuan(r.amountCents)}</div>
    </div>`;
}

function renderCharts() {
  renderYbBanner();
  const records = recordsOfMonth(state.viewMonth);
  const expense = sumsOf(records).expense;
  const donutTitle = periodBarLabel(state.viewMonth);

  // 分类占比环形图
  const byCat = {};
  for (const r of records) {
    if (r.type === 'expense') byCat[r.category] = (byCat[r.category] || 0) + r.amountCents;
  }
  const items = Object.entries(byCat)
    .map(([key, cents]) => ({ ...catOf('expense', key), cents }))
    .sort((a, b) => b.cents - a.cents);

  document.getElementById('donut-card').innerHTML = `
    <div class="card-title">支出分类 · ${donutTitle}</div>
    ${donutSVG(items, expense, donutTitle)}
    <div class="legend">${items.map(it => `
      <div class="legend-row">
        <span class="dot" style="background:${it.color}"></span>
        <img class="legend-ava" src="${it.avatar}" alt="" loading="lazy" onerror="this.remove()">
        <span class="legend-name">${it.name}</span>
        <span class="legend-val">${fmtYuan(it.cents)}</span>
        <span class="legend-pct">${expense ? Math.round(it.cents / expense * 100) : 0}%</span>
      </div>`).join('')}
    </div>`;

  // 近 6 期收支趋势
  const rows = [];
  for (let i = 5; i >= 0; i--) {
    const pk = monthAdd(state.viewMonth, -i);
    const s = sumsOf(recordsOfMonth(pk));
    rows.push({ m: pk, label: periodBarLabel(pk), income: s.income, expense: s.expense });
  }
  document.getElementById('bars-card').innerHTML = `
    <div class="card-title">${periodStartDay() === 1 ? '近 6 个月' : '近 6 期'}收支趋势</div>
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
    const mLabel = r.label || (+r.m.slice(5, 7) + '月');
    out += `
      <rect x="${(cx - groupW / 2).toFixed(1)}" y="${(yBase - hIn).toFixed(1)}" width="${barW}" height="${hIn.toFixed(1)}" rx="3" class="bar-income"><title>${mLabel}收入 ${fmtYuan(r.income)}</title></rect>
      <rect x="${(cx - groupW / 2 + barW + gap).toFixed(1)}" y="${(yBase - hEx).toFixed(1)}" width="${barW}" height="${hEx.toFixed(1)}" rx="3" class="bar-expense"><title>${mLabel}支出 ${fmtYuan(r.expense)}</title></rect>
      <text x="${cx.toFixed(1)}" y="${yBase + 16}" text-anchor="middle" class="svg-month">${mLabel}</text>`;
  });
  return `<svg class="bars" viewBox="0 0 ${W} ${H}" role="img" aria-label="近6期收支趋势">${out}</svg>`;
}

function renderMe() {
  const input = document.getElementById('budget-input');
  if (document.activeElement !== input) {
    const b = state.data.settings.monthlyBudget;
    input.value = b ? (b / 100) : '';
  }
  const dates = state.data.records.map(r => r.date).sort();
  document.getElementById('me-stats').textContent = dates.length
    ? `账本「${state.profileName}」· 共 ${dates.length} 笔 · ${dates[0]} ~ ${dates[dates.length - 1]}`
    : `账本「${state.profileName}」· 还没有任何账单`;
  document.getElementById('storage-warn').classList.toggle('hidden', state.storageOk);
}

/* ==================== 账单导入（微信 / 支付宝 CSV） ==================== */
/* 关键词 → 分类规则，按顺序匹配，先命中先得（交通/居住等具体词放前面，餐饮这类泛词放最后） */
const BILL_RULES = [
  { cat: 'transport', words: ['美团单车', '哈啰', '哈罗单车', '青桔', '共享单车', '滴滴', '高德', '出租车', '网约车', '花小猪', 't3出行', '曹操出行', '地铁', '公交', '一卡通', '交通卡', '12306', '铁路', '航空', '机票', '南方航空', '东方航空', '国航', '携程', '去哪儿', '同程', '加油', '中国石化', '中国石油', '壳牌', '停车'] },
  { cat: 'housing', words: ['房租', '租房', '物业', '水费', '电费', '燃气', '水电', '宽带', '供暖', '热力', '中国移动', '中国联通', '中国电信', '话费', '充电桩', '自如', '贝壳'] },
  { cat: 'fun', words: ['腾讯视频', '爱奇艺', '优酷', '芒果tv', '哔哩哔哩', 'bilibili', 'b站', '大会员', 'steam', '游戏', '米哈游', '库洛', '鸣潮', '原神', '崩坏', '网易', '猫眼', '淘票票', '电影', '影院', 'ktv', '网吧', '网咖', '密室', '剧本杀', '网易云', 'qq音乐', '酷狗', '抖音', '快手', '喜马拉雅'] },
  { cat: 'study', words: ['当当', '书店', '孔夫子', '新华书店', '学校', '大学', '学费', '住宿费', '考试', '报名费', '网课', '慕课', 'mooc', '得到', '知乎', '樊登', '培训', '文具', '打印', '复印', '知网', '百度文库', 'wps会员', '中国教育考试网'] },
  { cat: 'medical', words: ['医院', '药房', '药店', '诊所', '医药', '药品', '挂号', '体检', '牙科', '口腔', '眼镜', '爱尔', '京东健康', '阿里健康', '口罩'] },
  { cat: 'shopping', words: ['淘宝', '天猫', '京东', '拼多多', '唯品会', '苏宁', '得物', '闲鱼', '小米', '华为商城', '苹果', 'apple', 'app store', '超市', '沃尔玛', '永辉', '盒马', '大润发', '华润万家', '便利店', '名创优品', '优衣库', 'zara', '无印良品', '百货', '商城', '旗舰店', '快递', '顺丰', '圆通', '中通', '韵达', '邮政'] },
  { cat: 'food', words: ['美团', '饿了么', '外卖', '肯德基', '麦当劳', '必胜客', '星巴克', '瑞幸', '库迪', '蜜雪冰城', '喜茶', '古茗', '茶百道', '沪上阿姨', '书亦', '益禾堂', '海底捞', '呷哺', '火锅', '烤肉', '烧烤', '串串', '餐厅', '饭店', '餐馆', '餐饮', '食堂', '咖啡', '奶茶', '饮品', '汉堡', '披萨', '沙县', '兰州', '拉面', '米线', '面条', '快餐', '小吃', '夜宵', '美食', '大众点评'] },
  { cat: 'salary', type: 'income', words: ['工资', '薪资', '薪水', '代发'] },
  { cat: 'bonus', type: 'income', words: ['奖金', '年终奖', '绩效奖'] },
  { cat: 'invest', type: 'income', words: ['余额宝', '零钱通', '理财', '基金', '利息', '收益', '黄金', '股票', '分红'] },
  { cat: 'sidejob', type: 'income', words: ['兼职', '稿费', '稿酬', '劳务', '实习补贴'] },
];

function guessBillCategory(rec) {
  const text = `${rec.counterparty} ${rec.goods} ${rec.rawType}`.toLowerCase();
  for (const rule of BILL_RULES) {
    if (rule.type && rule.type !== rec.type) continue;
    if (rule.words.some(w => text.includes(w))) return rule.cat;
  }
  return 'other';
}

/* 带引号的 CSV 行解析（备注里可能有逗号） */
function parseCSVLine(line) {
  const out = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map(s => s.trim());
}

/* 微信导出的 CSV 可能是 UTF-8 也可能是 GBK：先用 UTF-8 解，表头特征不对再换 GBK。
   特征检测直接内联（不依赖外部函数），避免任何加载时序差异 */
function decodeBillText(buf) {
  const stripBOM = s => (s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s);
  const looksLikeBill = s => {
    if (!s) return false;
    for (const line of s.split('\n').slice(0, 40)) {
      if (line.includes('交易时间') || line.includes('付款时间') || line.includes('交易创建时间')) return true;
    }
    return false;
  };
  let text = stripBOM(new TextDecoder('utf-8').decode(buf));
  if (!looksLikeBill(text)) {
    try { text = stripBOM(new TextDecoder('gbk').decode(buf)); } catch (e) { /* 浏览器不支持就按 UTF-8 走 */ }
  }
  return text;
}

function findBillHeaderLine(text) {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < Math.min(lines.length, 40); i++) {
    const cells = parseCSVLine(lines[i]);
    const hasTime = cells.some(c => ['交易时间', '付款时间', '交易创建时间'].includes(c));
    const hasDir = cells.some(c => c === '收/支');
    const hasAmt = cells.some(c => ['金额(元)', '金额（元）', '金额'].includes(c));
    if (hasTime && hasDir && hasAmt) return i;
  }
  return -1;
}

function parseBillCSV(text) {
  const lines = text.split(/\r?\n/);
  const headIdx = findBillHeaderLine(text);
  if (headIdx < 0) return { error: '没认出这是微信/支付宝账单，请选择解压后的 CSV 文件' };
  let cols = parseCSVLine(lines[headIdx]);
  // 微信导出的表头行以 "---------" 分隔线单元格开头，而数据行没有这一列，去掉才对得齐
  if (/^-+$/.test(cols[0] || '')) cols = cols.slice(1);
  const pick = (...names) => { for (const n of names) { const i = cols.indexOf(n); if (i >= 0) return i; } return -1; };
  const iTime = pick('交易时间', '付款时间', '交易创建时间');
  const iType = pick('交易类型', '类型');
  const iWho = pick('交易对方');
  const iGoods = pick('商品', '商品名称');
  const iDir = pick('收/支');
  const iAmt = pick('金额(元)', '金额（元）', '金额');
  const iStatus = pick('当前状态', '交易状态');
  const iTid = pick('交易单号', '支付宝交易号', '交易号', '微信支付单号');
  const iNote = pick('备注');

  const rows = [];
  const skipped = { neutral: 0, refunded: 0, bad: 0 };
  for (let i = headIdx + 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cells = parseCSVLine(lines[i]);
    const dir = (cells[iDir] || '').trim();
    const cents = Math.round(parseFloat((cells[iAmt] || '').replace(/[^\d.]/g, '')) * 100);
    const date = (cells[iTime] || '').slice(0, 10);
    if (!dir || !cents || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      if (cells.some(c => c)) skipped.bad++;  // 尾部汇总行等
      continue;
    }
    const status = (iStatus >= 0 ? cells[iStatus] : '') || '';
    if (/退款|失败|关闭|处理中/.test(status)) { skipped.refunded++; continue; }
    let type = null;
    if (dir === '支出') type = 'expense';
    else if (dir === '收入') type = 'income';
    else { skipped.neutral++; continue; }   // "/" 或 不计收支：转账、零钱通等
    rows.push({
      type, amountCents: cents, date,
      counterparty: (iWho >= 0 ? cells[iWho] : '').replace(/^\/$/, '').trim(),
      goods: (iGoods >= 0 ? cells[iGoods] : '').replace(/^\/$/, '').trim(),
      rawType: (iType >= 0 ? cells[iType] : '').trim(),
      tid: (iTid >= 0 ? cells[iTid] : '').trim(),
      note: (iNote >= 0 ? cells[iNote] : '').replace(/^\/$/, '').trim(),
    });
  }
  return { rows, skipped };
}

let billImport = null;  // { items: [{key, rec, dup, cat}], skipped }

function onBillFile(e) {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const res = parseBillCSV(decodeBillText(reader.result));
      if (res.error) { toast(res.error); return; }
      if (!res.rows.length) { toast('没有可导入的记录（转账/退款类流水已自动跳过）'); return; }
      const existIds = new Set(state.data.records.map(r => r.extId).filter(Boolean));
      const seen = new Set();
      billImport = {
        items: res.rows.map((rec, i) => {
          const dup = rec.tid && (existIds.has(rec.tid) || seen.has(rec.tid));
          if (rec.tid) seen.add(rec.tid);
          return { key: rec.tid || 'w' + i, rec, dup, cat: guessBillCategory(rec) };
        }),
        skipped: res.skipped,
      };
      renderBillPreview();
    } catch (err) {
      toast('解析失败：' + (err.message || '文件格式不正确'));
    }
  };
  reader.readAsArrayBuffer(file);
}

function renderBillPreview() {
  const box = document.getElementById('bill-preview');
  if (!billImport) { box.innerHTML = ''; return; }
  const fresh = billImport.items.filter(it => !it.dup);
  const dups = billImport.items.length - fresh.length;
  const { neutral, refunded } = billImport.skipped;
  if (!fresh.length) {
    box.innerHTML = `<div class="imp-summary">这批账单以前都导入过了，<b>${dups}</b> 笔重复自动跳过</div>`;
    return;
  }
  const skipTxt = (dups ? `重复 ${dups} 笔跳过` : '') +
    (neutral + refunded ? `${dups ? '，' : ''}转账/退款等 ${neutral + refunded} 笔不计` : '');
  box.innerHTML = `
    <div class="imp-summary">解析出 <b>${fresh.length}</b> 笔${skipTxt ? '（' + skipTxt + '）' : ''}，分类可逐笔调整</div>
    <div class="imp-list">${fresh.map(it => {
      const rec = it.rec;
      const cats = CATEGORIES[rec.type];
      if (!cats.some(c => c.key === it.cat)) it.cat = cats[cats.length - 1].key;
      return `
      <div class="imp-row">
        <div class="imp-info">
          <div class="imp-title">${esc(rec.goods || rec.counterparty || rec.rawType || '账单')}</div>
          <div class="imp-sub">${rec.date}${rec.counterparty && rec.goods ? ' · ' + esc(rec.counterparty) : ''}</div>
        </div>
        <span class="imp-amt ${rec.type === 'income' ? 'c-income' : 'c-expense'}">${rec.type === 'income' ? '+' : '-'}${fmtYuan(rec.amountCents, false)}</span>
        <select class="imp-cat" data-k="${esc(it.key)}">${cats.map(c =>
          `<option value="${c.key}" ${c.key === it.cat ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
      </div>`;
    }).join('')}</div>
    <div class="imp-actions">
      <button class="manage-btn" id="btn-bill-cancel">取消</button>
      <button class="btn-mini" id="btn-bill-go">导入 ${fresh.length} 笔</button>
    </div>`;
}

function doBillImport() {
  if (!billImport) return;
  const items = billImport.items.filter(it => !it.dup);
  let n = 0;
  for (const it of items) {
    const rec = it.rec;
    state.data.records.push({
      id: uid(), type: rec.type, amountCents: rec.amountCents, category: it.cat,
      date: rec.date, note: (rec.goods || rec.counterparty || rec.rawType || '').slice(0, 50),
      createdAt: Date.now(), updatedAt: Date.now(),
      extId: rec.tid || undefined,
    });
    n++;
  }
  saveData();
  billImport = null;
  renderBillPreview();
  renderAll();
  toast(`已导入 ${n} 笔账单`);
}

/* ==================== 年度账单 ==================== */
const yb = { year: null, page: 0, stats: null, pages: 7 };

function yearsWithData() {
  const ys = new Set(state.data.records.map(r => r.date.slice(0, 4)));
  return [...ys].sort().reverse();
}

function yearStats(year) {
  const recs = state.data.records.filter(r => r.date.startsWith(year));
  const s = {
    year, count: recs.length, expense: 0, income: 0,
    days: new Set(recs.map(r => r.date)).size,
    byCat: {}, catCount: {}, maxExpense: null, monthExp: Array(12).fill(0),
  };
  for (const r of recs) {
    if (r.type === 'income') { s.income += r.amountCents; continue; }
    s.expense += r.amountCents;
    s.byCat[r.category] = (s.byCat[r.category] || 0) + r.amountCents;
    s.catCount[r.category] = (s.catCount[r.category] || 0) + 1;
    s.monthExp[+r.date.slice(5, 7) - 1] += r.amountCents;
    if (!s.maxExpense || r.amountCents > s.maxExpense.amountCents) s.maxExpense = r;
  }
  s.topCats = Object.entries(s.byCat)
    .map(([key, cents]) => ({ ...catOf('expense', key), cents, n: s.catCount[key] }))
    .sort((a, b) => b.cents - a.cents).slice(0, 3);
  let mi = 0;
  s.monthExp.forEach((v, i) => { if (v > s.monthExp[mi]) mi = i; });
  s.maxMonth = s.monthExp[mi] > 0 ? { m: mi + 1, cents: s.monthExp[mi] } : null;
  const ds = [...new Set(recs.map(r => r.date))].sort();
  let streak = 0, best = 0;
  for (let i = 0; i < ds.length; i++) {
    streak = i && dayAdd(ds[i - 1], 1) === ds[i] ? streak + 1 : 1;
    best = Math.max(best, streak);
  }
  s.bestStreak = best;
  return s;
}

function renderYbBanner() {
  const el = document.getElementById('yb-banner');
  if (!el) return;
  const ys = yearsWithData();
  if (!ys.length) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="yb-banner-inner">
      <div>
        <div class="yb-banner-title">🏆 ${ys[0]} 年度账单</div>
        <div class="yb-banner-sub">全年收支回顾 · 一页页翻给你看</div>
      </div>
      <span class="yb-banner-go">查看 ›</span>
    </div>`;
}

function openYearBill(year) {
  yb.year = year || yearsWithData()[0];
  if (!yb.year) { toast('还没有账单，先记几笔再来吧'); return; }
  yb.stats = yearStats(yb.year);
  yb.page = 0;
  renderYearBill();
  renderYbYearSel();
  document.getElementById('yb-wrap').classList.add('open');
}

function closeYearBill() {
  document.getElementById('yb-wrap').classList.remove('open');
}

function renderYbYearSel() {
  const box = document.getElementById('yb-yearsel');
  const ys = yearsWithData();
  box.innerHTML = ys.length > 1
    ? ys.map(y => `<button class="yb-ychip ${y === yb.year ? 'on' : ''}" data-ybyear="${y}">${y}</button>`).join('')
    : '';
}

function ybPageHTML(i) {
  const s = yb.stats;
  const art = CHARA_ARTS[(i * 3 + 1) % CHARA_ARTS.length];
  const bal = s.income - s.expense;
  const pct = c => s.expense ? Math.round(c / s.expense * 100) + '%' : '0%';
  const artHTML = `<img class="yb-art ${i % 2 ? 'left' : ''}" src="${art.file}" alt="">`;
  switch (i) {
    case 0: return `
      ${artHTML}
      <div class="yb-kicker">· 年 度 账 单 ·</div>
      <div class="yb-year">${s.year}</div>
      <div class="yb-line">这一年，你在「${esc(state.profileName)}」账本里留下了痕迹</div>
      <div class="yb-line dim">轻触屏幕或按 › 翻页</div>`;
    case 1: return `
      ${artHTML}
      <div class="yb-kicker">记账足迹</div>
      <div class="yb-big">${s.count}<span class="yb-unit">笔</span></div>
      <div class="yb-line">覆盖了 <b>${s.days}</b> 个日子，最长连续记账 <b>${s.bestStreak}</b> 天</div>
      ${s.bestStreak >= 7 ? '<div class="yb-quote">坚持，是最酷的事</div>' : ''}`;
    case 2: return `
      ${artHTML}
      <div class="yb-kicker">全年支出</div>
      <div class="yb-big c-expense">${fmtYuan(s.expense)}</div>
      ${s.maxMonth ? `<div class="yb-line">最「豪」的是 <b>${s.maxMonth.m} 月</b>，花了 <b>${fmtYuan(s.maxMonth.cents)}</b></div>` : ''}
      <div class="yb-line dim">平均每天约 ${fmtYuan(Math.round(s.expense / 365))}</div>`;
    case 3: return `
      ${artHTML}
      <div class="yb-kicker">全年收入</div>
      <div class="yb-big c-income">${fmtYuan(s.income)}</div>
      <div class="yb-line">收支相抵，结余 <b class="${bal >= 0 ? 'c-income' : 'c-expense'}">${fmtYuan(bal)}</b></div>
      <div class="yb-quote">${bal >= 0 ? '守岸人为你守住了钱包 🌊' : '新的一年，一起把钱包填满'}</div>`;
    case 4: {
      if (!s.maxExpense) return `
        ${artHTML}
        <div class="yb-kicker">最大的一笔</div>
        <div class="yb-line">这一年没有支出记录</div>`;
      const r = s.maxExpense, c = catOf('expense', r.category);
      return `
      ${artHTML}
      <div class="yb-kicker">最大的一笔支出</div>
      <div class="yb-big">${fmtYuan(r.amountCents)}</div>
      <div class="yb-line">${r.date} · ${c.name}${r.note ? ' · ' + esc(r.note) : ''}</div>
      <div class="yb-line dim">占全年支出 ${pct(r.amountCents)}</div>`;
    }
    case 5: {
      if (!s.topCats.length) return `
        ${artHTML}
        <div class="yb-kicker">支出排行榜</div>
        <div class="yb-line">这一年没有支出记录</div>`;
      return `
      ${artHTML}
      <div class="yb-kicker">支出排行榜 TOP3</div>
      <div class="yb-rank">${s.topCats.map((c, idx) => `
        <div class="yb-rank-row">
          <span class="yb-rank-no">${idx + 1}</span>
          <img src="${c.avatar}" alt="${c.name}" onerror="this.style.display='none'">
          <div class="yb-rank-main">
            <div class="yb-rank-name">${c.name} · ${c.n} 笔</div>
            <div class="yb-rank-bar"><div class="yb-rank-fill" style="width:${s.expense ? Math.round(c.cents / s.expense * 100) : 0}%;background:${c.color}"></div></div>
          </div>
          <span class="yb-rank-val">${fmtYuan(c.cents)}<span class="yb-rank-pct">${pct(c.cents)}</span></span>
        </div>`).join('')}</div>`;
    }
    default: return `
      ${artHTML}
      <div class="yb-kicker">${s.year}，辛苦啦</div>
      <div class="yb-line" style="font-size:19px;font-weight:700">${+s.year + 1} 年，继续一起记账吧</div>
      <div class="yb-quote">每一笔认真记下的账，都是在认真生活</div>
      <div>
        <button class="yb-btn" data-ybreplay>再看一遍</button>
        <button class="yb-btn" data-ybclose>完成</button>
      </div>`;
  }
}

function renderYearBill() {
  document.getElementById('yb-stage').innerHTML = `<div class="yb-page">${ybPageHTML(yb.page)}</div>`;
  document.getElementById('yb-dots').innerHTML =
    Array.from({ length: yb.pages }, (_, i) => `<span class="yb-dot ${i === yb.page ? 'on' : ''}"></span>`).join('');
  document.getElementById('yb-prev').disabled = yb.page === 0;
  document.getElementById('yb-next').disabled = yb.page === yb.pages - 1;
}

function ybGo(delta) {
  const next = Math.min(yb.pages - 1, Math.max(0, yb.page + delta));
  if (next !== yb.page) { yb.page = next; renderYearBill(); }
}

/* ==================== 记一笔弹层 ==================== */
let deleteArmed = false;
let deleteTimer = null;

function openSheet(record) {
  state.editingId = record ? record.id : null;
  state.sheetFromTab = state.tab;
  state.sheetType = record ? record.type : 'expense';
  document.getElementById('sheet-title').textContent = record ? '编辑账单' : '记一笔';
  document.getElementById('amount-input').value = record ? record.amountCents / 100 : '';
  // 今日页打开时，默认日期跟随当前查看的日期
  document.getElementById('date-input').value = record ? record.date
    : (state.tab === 'day' ? state.viewDate : todayStr());
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
    if (r) Object.assign(r, { type: state.sheetType, amountCents: cents, category: state.sheetCat, date, note, updatedAt: Date.now() });
  } else {
    state.data.records.push({
      id: uid(), type: state.sheetType, amountCents: cents,
      category: state.sheetCat, date, note, createdAt: Date.now(), updatedAt: Date.now(),
    });
  }
  saveData();
  state.viewMonth = date.slice(0, 7);
  state.viewDate = date;
  switchTab(state.sheetFromTab || 'day');
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
  state.data.deleted = state.data.deleted || {};
  state.data.deleted[state.editingId] = Date.now();
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
  downloadFile(`记账备份_${state.profileName}_${stamp()}.json`, JSON.stringify(state.data, null, 2), 'application/json');
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

/* ==================== 云同步（GitHub 私密 Gist + 端到端加密） ==================== */
const SYNC_KEY = 'ledger.sync.v1';
const GIST_DESC = 'ledger-sync-store';

function loadSyncStore() {
  try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || {}; } catch (e) { return {}; }
}
function saveSyncStore(s) { localStorage.setItem(SYNC_KEY, JSON.stringify(s)); }

function b64(u8) { return btoa(String.fromCharCode(...u8)); }
function ub64(s) { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }

async function ghGist(method, path, token, body) {
  const s = loadSyncStore();
  const provider = s.provider || 'github';
  let url, init;
  if (provider === 'gitee') {
    const sep = path.includes('?') ? '&' : '?';
    url = 'https://gitee.com/api/v5' + path + sep + 'access_token=' + encodeURIComponent(token);
    if (method === 'GET') {
      init = { method };
    } else {
      init = { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) };
    }
  } else {
    url = 'https://api.github.com' + path;
    init = { method, headers: { Authorization: 'token ' + token, Accept: 'application/vnd.github+json' } };
    if (body) init.body = JSON.stringify(body);
  }
  const r = await fetch(url, init);
  if (!r.ok) {
    let msg = 'HTTP ' + r.status;
    try { const d = await r.json(); msg = d.message || msg; } catch (e) { /* ignore */ }
    if (r.status === 401) msg = '令牌无效或已过期';
    else if (r.status === 403) msg = '令牌权限不足（' + (provider === 'gitee' ? 'Gitee 令牌需勾选 gists 权限' : '需要 gist 权限，请用软件里的链接重新生成') + '）';
    else if (r.status === 404 && method === 'GET') msg = '云端还没有同步数据（先在一台设备上上传）';
    else if (r.status === 404) msg = '云端拒绝写入（令牌可能没有 gist/代码片段权限，请重新生成）';
    throw new Error(msg);
  }
  return r.json();
}

function gistFileContent(gist, name) {
  const f = (gist.files || {})[name];
  return f ? (f.content != null ? f.content : f.text) : null;
}

async function deriveKey(pass, salt) {
  const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function encryptForSync(pass, text) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pass, salt);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
  return { v: 1, salt: b64(salt), iv: b64(iv), ct: b64(new Uint8Array(ct)) };
}

async function decryptForSync(pass, env) {
  const key = await deriveKey(pass, ub64(env.salt));
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ub64(env.iv) }, key, ub64(env.ct));
  return new TextDecoder().decode(pt);
}

async function findSyncGist(token) {
  const store = loadSyncStore();
  if (store.gistId) {
    try { return await ghGist('GET', '/gists/' + store.gistId, token); }
    catch (e) { if (!String(e.message).includes('还没有同步数据')) throw e; }
  }
  const gists = await ghGist('GET', '/gists?per_page=100', token);
  const hit = gists.find(g => g.description === GIST_DESC);
  if (hit) { store.gistId = hit.id; saveSyncStore(store); }
  return hit || null;
}

function buildSyncPayload() {
  const payload = { time: Date.now(), profiles: {}, deletedProfiles: state.profiles.deletedProfiles || {} };
  for (const name of state.profiles.names) {
    const raw = name === state.profileName
      ? state.data
      : JSON.parse(localStorage.getItem(dataKey(name)) || 'null');
    if (raw) payload.profiles[name] = raw;
  }
  return payload;
}

/* ---------- 合并：并集 + 新者胜 + 墓碑 ---------- */
const recTime = r => +r.updatedAt || +r.createdAt || 0;
const TOMBSTONE_TTL = 90 * 24 * 3600 * 1000;

function mergeProfileData(local, remote) {
  if (!remote) return local;
  if (!local) return remote;
  const deleted = {};
  for (const [id, t] of Object.entries({ ...(local.deleted || {}), ...(remote.deleted || {}) })) {
    if (+t && Date.now() - +t < TOMBSTONE_TTL) deleted[id] = +t;
  }
  const map = new Map();
  for (const r of [...(local.records || []), ...(remote.records || [])]) {
    const prev = map.get(r.id);
    if (!prev || recTime(r) >= recTime(prev)) map.set(r.id, r);
  }
  const records = [...map.values()].filter(r => {
    const t = deleted[r.id];
    return !(t && t >= recTime(r));
  });
  const lt = +(local.settings || {}).budgetUpdatedAt || 0;
  const rt = +(remote.settings || {}).budgetUpdatedAt || 0;
  const settings = rt > lt ? { ...(remote.settings || {}) } : { ...(local.settings || {}) };
  return { version: 1, records, settings, deleted };
}

let syncBusy = false, syncQueued = false, syncDebounceTimer = null, syncLastError = '';

async function pushPayload() {
  const s = loadSyncStore();
  const env = await encryptForSync(s.pass, JSON.stringify(buildSyncPayload()));
  const files = {
    'ledger.enc': { content: JSON.stringify(env) },
    'ledger.meta': { content: JSON.stringify({ app: 'ledger', v: 1, time: Date.now() }) },
  };
  const existing = await findSyncGist(s.token);
  if (existing) {
    await ghGist('PATCH', '/gists/' + existing.id, s.token, { files });
  } else {
    const g = await ghGist('POST', '/gists', s.token, { description: GIST_DESC, public: false, files });
    const st = loadSyncStore(); st.gistId = g.id; saveSyncStore(st);
  }
}

async function runSync(manual) {
  const s = loadSyncStore();
  if (!s.token || !s.pass) return;
  if (syncBusy) { syncQueued = true; return; }
  syncBusy = true;
  try {
    // 拉取远端 → 合并 → 回写本地 → 推送合并结果
    let payload = null;
    try { payload = await fetchCloudPayload(); }
    catch (e) {
      if (!String(e.message).includes('还没有同步数据')) throw e;
    }
    if (payload) {
      const names = new Set(state.profiles.names);
      const delProfiles = { ...(state.profiles.deletedProfiles || {}), ...(payload.deletedProfiles || {}) };
      for (const [name, remote] of Object.entries(payload.profiles)) {
        const local = name === state.profileName
          ? state.data
          : normalizeData(JSON.parse(localStorage.getItem(dataKey(name)) || 'null') || defaultData());
        const merged = mergeProfileData(local, remote);
        if (name === state.profileName && merged !== state.data) {
          localStorage.setItem(dataKey(name), JSON.stringify(merged));
        } else {
          localStorage.setItem(dataKey(name), JSON.stringify(merged));
        }
        names.add(name);
      }
      state.profiles.names = [...names].filter(n => !delProfiles[n]);
      state.profiles.deletedProfiles = delProfiles;
      saveProfiles();
      loadData();
      renderAll();
    }
    await pushPayload();
    s.lastSync = Date.now();
    syncLastError = '';
    saveSyncStore(s);
    renderSyncCard();
    if (manual) toast('同步完成 ✓');
  } catch (e) {
    let msg = e.message || String(e);
    if (/failed to fetch|networkerror|load failed/i.test(msg)) msg = '网络连不上 api.github.com（手机在大陆网络可能需要代理）';
    syncLastError = msg;
    renderSyncCard();
    if (manual) toast('同步失败：' + msg);
  } finally {
    syncBusy = false;
    if (syncQueued) { syncQueued = false; scheduleAutoSync(800); }
  }
}

function scheduleAutoSync(delay) {
  const s = loadSyncStore();
  if (!s.token || !s.pass || s.auto === false) return;
  clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => runSync(false), delay || 4000);
}

function initAutoSync() {  const s = loadSyncStore();
  if (!s.token || !s.pass) return;
  if (s.auto === false) return;
  scheduleAutoSync(1500);                 // 启动后先同步一次
  setInterval(() => scheduleAutoSync(10), 5 * 60 * 1000);  // 每 5 分钟
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) scheduleAutoSync(500);
  });
}

async function fetchCloudPayload() {
  const s = loadSyncStore();
  const gist = await findSyncGist(s.token);
  if (!gist) throw new Error('云端还没有同步数据（先在一台设备上上传）');
  const content = gistFileContent(gist, 'ledger.enc');
  if (content == null) throw new Error('云端还没有同步数据（先在一台设备上上传）');
  const env = JSON.parse(content);
  let payload;
  try {
    payload = JSON.parse(await decryptForSync(s.pass, env));
  } catch (e) {
    throw new Error('解密失败，同步密码不对');
  }
  if (!payload || !payload.profiles) throw new Error('云端数据格式不正确');
  return payload;
}

function renderSyncCard() {
  const box = document.getElementById('sync-body');
  if (!box) return;
  const s = loadSyncStore();
  const provider = s.provider || 'github';
  const configured = !!(s.token && s.pass);
  const autoOn = s.auto !== false;
  const fmtT = t => t ? new Date(t).toLocaleString('zh-CN', { hour12: false }) : '从未';
  const tokenLink = provider === 'gitee'
    ? '<a href="https://gitee.com/profile/personal_access_tokens" target="_blank" rel="noopener">去 Gitee 生成令牌（只勾选 gists/代码片段 权限）</a>'
    : '<a href="https://github.com/settings/tokens/new?scopes=gist&description=ledger-sync" target="_blank" rel="noopener">点这里（已预选 gist 权限）</a>';
  box.innerHTML = `
    <div class="profile-form sync-provider-row">
      <label class="sync-label">同步到</label>
      <select id="sync-provider" class="sync-select">
        <option value="github" ${provider === 'github' ? 'selected' : ''}>GitHub</option>
        <option value="gitee" ${provider === 'gitee' ? 'selected' : ''}>Gitee（国内直连，推荐）</option>
      </select>
    </div>
    <div class="profile-form">
      <input id="sync-token" type="password" placeholder="${provider === 'gitee' ? 'Gitee 私人令牌（勾选 gists 权限）' : 'GitHub 令牌（只需 gist 权限）'}" value="${esc(s.token || '')}" autocomplete="off">
      <input id="sync-pass" type="password" placeholder="同步密码（两端一致）" value="${esc(s.pass || '')}" autocomplete="off">
      <button id="btn-sync-save" class="btn-mini">保存</button>
    </div>
    ${configured ? `
    <div class="sync-status">${provider === 'gitee' ? 'Gitee' : 'GitHub'} · ${autoOn ? '🔄 自动同步已开启' : '⏸ 自动同步已暂停'} · 上次同步 ${fmtT(s.lastSync)}${syncLastError ? ' · <b style="color:var(--expense)">失败：' + esc(syncLastError) + '</b>' : ''}</div>
    <div class="sync-actions">
      <button class="manage-btn" id="btn-sync-now">立即同步</button>
      <button class="manage-btn" id="btn-sync-auto">${autoOn ? '暂停自动' : '开启自动'}</button>
      <button class="manage-btn" id="btn-sync-reset">断开</button>
    </div>` : `
    <div class="sync-status">填好令牌和密码并保存后自动开始同步。令牌生成：${tokenLink}</div>`}
    <div class="card-hint">多设备同时记账会自动合并：新增合并、编辑取较新、删除保留。数据加密后存你的私密 Gist，令牌密码只存本机。两台设备要选同一个服务商。</div>`;
}

/* ==================== 背景音乐 ==================== */
const MUSIC = { file: 'assets/music/bgm.mp3', title: '繁星，新生，与你 Astrum Unicum' };

function initMusic() {
  const btn = document.getElementById('music-btn');
  const audio = new Audio(MUSIC.file);
  audio.loop = true;
  audio.volume = 0.55;

  audio.addEventListener('error', () => btn.classList.add('hidden'), { once: true });

  let started = false;
  let wantMusic = localStorage.getItem('ledger.music') !== 'off';

  const render = () => {
    btn.classList.toggle('playing', !audio.paused);
    btn.classList.toggle('paused', audio.paused);
  };

  const tryPlay = () => {
    audio.play().then(() => {
      render();
      if (!started) { started = true; toast('♪ ' + MUSIC.title); }
    }).catch(() => {});
  };

  // 浏览器要求用户交互后才能出声：首次任意点击开始播放
  document.addEventListener('pointerdown', () => {
    if (!started && wantMusic) tryPlay();
  }, { once: true });

  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (audio.paused) {
      wantMusic = true;
      localStorage.setItem('ledger.music', 'on');
      tryPlay();
    } else {
      wantMusic = false;
      localStorage.setItem('ledger.music', 'off');
      audio.pause();
      render();
    }
  });
  audio.addEventListener('play', render);
  audio.addEventListener('pause', render);
  render();
}

let profileDeleteArmed = null;
let profileDeleteTimer = null;

function renderProfiles() {
  const box = document.getElementById('profile-list');
  if (!box || !state.profiles) return;
  box.innerHTML = state.profiles.names.map(n => {
    const cur = n === state.profileName;
    const armed = profileDeleteArmed === n;
    return `
    <div class="profile-row ${cur ? 'current' : ''}">
      <span class="profile-name">${cur ? '📍 ' : ''}${esc(n)}</span>
      <span class="profile-actions">
        ${cur ? '<span class="profile-cur">当前</span>'
              : `<button class="profile-btn" data-act="use" data-name="${esc(n)}">切换</button>`}
        ${state.profiles.names.length > 1
          ? `<button class="profile-btn danger ${armed ? 'armed' : ''}" data-act="del" data-name="${esc(n)}">${armed ? '确认' : '删除'}</button>` : ''}
      </span>
    </div>`;
  }).join('');
}

function onProfileAction(btn) {
  const act = btn.dataset.act;
  const name = btn.dataset.name;
  if (act === 'use') {
    profileDeleteArmed = null;
    clearTimeout(profileDeleteTimer);
    switchProfile(name);
  } else if (act === 'del') {
    if (profileDeleteArmed !== name) {
      profileDeleteArmed = name;
      clearTimeout(profileDeleteTimer);
      profileDeleteTimer = setTimeout(() => { profileDeleteArmed = null; renderProfiles(); }, 2500);
      renderProfiles();
    } else {
      profileDeleteArmed = null;
      clearTimeout(profileDeleteTimer);
      deleteProfile(name);
    }
  }
}

/* ==================== 交互与初始化 ==================== */
function switchTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.tab-btn')
    .forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.view')
    .forEach(v => v.classList.toggle('active', v.id === 'view-' + tab));
  closeSub();  // 切换主页面时收起子页
}

/* 子页（账本/云同步/预算/数据管理/设置，都从「我的」进入，导航栏仍高亮「我的」） */
let openSubId = null;

function openSub(id) {
  switchTab('me');
  document.getElementById('view-me').classList.remove('active');
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    openSubId = id;
  }
}

function closeSub() {
  if (!openSubId) return;
  const el = document.getElementById(openSubId);
  if (el) el.classList.remove('active');
  openSubId = null;
  if (state.tab === 'me') document.getElementById('view-me').classList.add('active');
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
  loadProfiles();
  loadData();
  initRecurring();
  applyRandomBackground();
  initMusic();

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

  // 日期切换（今日页）与月份切换（两处开关共用，事件委托）
  document.addEventListener('click', e => {
    const dsw = e.target.closest('[data-act="dprev"], [data-act="dnext"], [data-act="dnow"]');
    if (dsw) {
      const act = dsw.dataset.act;
      state.viewDate = act === 'dnow' ? todayStr() : dayAdd(state.viewDate, act === 'dprev' ? -1 : 1);
      renderDay();
      return;
    }
    const ms = e.target.closest('.ms-btn, .ms-now');
    if (ms) {
      const act = ms.dataset.act;
      state.viewMonth = act === 'now' ? currentPeriodKey() : monthAdd(state.viewMonth, act === 'prev' ? -1 : 1);
      renderAll();
    }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'day-jump' && /^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) {
      state.viewDate = e.target.value;
      renderDay();
    }
  });

  // 今日页账单行 → 编辑
  document.getElementById('day-record-list').addEventListener('click', e => {
    if (state.manageMode) return;
    const row = e.target.closest('.record-row');
    if (!row) return;
    const rec = state.data.records.find(r => r.id === row.dataset.id);
    if (rec) openSheet(rec);
  });

  // 点击账单行 → 批量模式下选择，普通模式下编辑；管理条按钮
  document.getElementById('record-list').addEventListener('click', e => {
    const barBtn = e.target.closest('.manage-btn');
    if (barBtn) {
      if (barBtn.id === 'btn-enter-manage') enterManageMode();
      else if (barBtn.id === 'btn-exit-manage') exitManageMode();
      else if (barBtn.id === 'btn-select-all') toggleSelectAll(recordsOfMonth(state.viewMonth));
      else if (barBtn.id === 'btn-batch-del') onBatchDeleteClick();
      return;
    }
    const row = e.target.closest('.record-row');
    if (!row) return;
    if (state.manageMode) { toggleSelect(row.dataset.id); return; }
    const rec = state.data.records.find(r => r.id === row.dataset.id);
    if (rec) openSheet(rec);
  });

  document.getElementById('btn-budget').addEventListener('click', () => {
    const raw = document.getElementById('budget-input').value.trim();
    const cents = raw === '' ? 0 : parseYuanToCents(raw);
    if (raw !== '' && cents === null) { toast('预算金额不正确'); return; }
    state.data.settings.monthlyBudget = cents || 0;
    state.data.settings.budgetUpdatedAt = Date.now();
    saveData();
    renderAll();
    toast(cents ? '预算已保存' : '已关闭预算提醒');
  });

  document.getElementById('btn-export-json').addEventListener('click', exportJSON);
  document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
  document.getElementById('btn-import').addEventListener('click', () =>
    document.getElementById('import-file').click());
  document.getElementById('import-file').addEventListener('change', importJSON);

  // 账本管理
  document.getElementById('profile-list').addEventListener('click', e => {
    const btn = e.target.closest('.profile-btn');
    if (btn) onProfileAction(btn);
  });
  const addProfile = () => {
    const input = document.getElementById('profile-input');
    createProfile(input.value);
    input.value = '';
  };
  document.getElementById('btn-profile-add').addEventListener('click', addProfile);
  document.getElementById('profile-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addProfile();
  });

  // 云同步
  renderSyncCard();
  document.getElementById('sync-body').addEventListener('click', async e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.id === 'btn-sync-save') {
      const s = loadSyncStore();
      const newProvider = document.getElementById('sync-provider').value;
      if ((s.provider || 'github') !== newProvider) s.gistId = null;  // 换服务商后重新发现
      s.provider = newProvider;
      s.token = document.getElementById('sync-token').value.trim();
      s.pass = document.getElementById('sync-pass').value;
      if (!s.token || !s.pass) { toast('令牌和密码都要填'); return; }
      saveSyncStore(s);
      renderSyncCard();
      toast('已保存，自动同步将开始');
      scheduleAutoSync(1500);
    } else if (btn.id === 'btn-sync-now') {
      await runSync(true);
    } else if (btn.id === 'btn-sync-auto') {
      const s = loadSyncStore();
      s.auto = s.auto === false;
      saveSyncStore(s);
      renderSyncCard();
      if (s.auto === false) { clearTimeout(syncDebounceTimer); toast('已暂停自动同步'); }
      else { toast('已开启自动同步'); scheduleAutoSync(500); }
    } else if (btn.id === 'btn-sync-reset') {
      localStorage.removeItem(SYNC_KEY);
      clearTimeout(syncDebounceTimer);
      renderSyncCard();
      toast('已断开（本机令牌已清除，云端数据保留）');
    }
  });

  // 设置页：开关与周期账单
  document.getElementById('sw-recurring').addEventListener('click', () => {
    const s = state.data.settings;
    s.recurringOn = s.recurringOn === false;
    saveData();
    updateSettingsUI();
    if (s.recurringOn !== false) { initRecurring(); renderAll(); }
    toast(s.recurringOn !== false ? '周期账单已开启' : '周期账单已暂停');
  });
  document.getElementById('sw-rollover').addEventListener('click', () => {
    const s = state.data.settings;
    s.rolloverOn = s.rolloverOn === false;
    saveData();
    updateSettingsUI();
    renderDay();
    toast(s.rolloverOn !== false ? '日预算结转已开启' : '日预算结转已关闭');
  });
  document.getElementById('btn-rec-add').addEventListener('click', addRecurring);
  document.getElementById('recurring-list').addEventListener('click', e => {
    const btn = e.target.closest('[data-rec]');
    if (btn) onRecDeleteClick(btn);
  });
  // 账期起始日
  document.getElementById('sw-monthstart').addEventListener('click', () => {
    const s = state.data.settings;
    s.monthStartOn = s.monthStartOn !== true;
    if (s.monthStartOn === true && !(s.monthStartDay >= 1 && s.monthStartDay <= 28)) s.monthStartDay = 15;
    saveData();
    state.viewMonth = currentPeriodKey();
    updateSettingsUI();
    renderAll();
    toast(s.monthStartOn === true ? `账期已按每月 ${s.monthStartDay} 号开始` : '已恢复自然月');
  });
  document.getElementById('btn-ms-save').addEventListener('click', () => {
    const day = Math.round(+document.getElementById('ms-day').value);
    if (!(day >= 1 && day <= 28)) { toast('起始日请填 1-28'); return; }
    const s = state.data.settings;
    s.monthStartDay = day;
    s.monthStartOn = true;
    saveData();
    state.viewMonth = currentPeriodKey();
    updateSettingsUI();
    renderAll();
    toast(`账期已设为每月 ${day} 号开始`);
  });

  // 账单导入（微信/支付宝 CSV）
  document.getElementById('btn-bill-import').addEventListener('click', () =>
    document.getElementById('bill-file').click());
  document.getElementById('bill-file').addEventListener('change', onBillFile);
  document.getElementById('bill-preview').addEventListener('click', e => {
    if (e.target.id === 'btn-bill-cancel') { billImport = null; renderBillPreview(); }
    else if (e.target.id === 'btn-bill-go') doBillImport();
  });
  document.getElementById('bill-preview').addEventListener('change', e => {
    const sel = e.target.closest('.imp-cat');
    if (!sel || !billImport) return;
    const it = billImport.items.find(x => x.key === sel.dataset.k);
    if (it) it.cat = sel.value;
  });

  // 年度账单
  document.getElementById('yb-banner').addEventListener('click', () => openYearBill());
  document.getElementById('yb-close').addEventListener('click', closeYearBill);
  document.getElementById('yb-overlay').addEventListener('click', () => ybGo(1));
  document.getElementById('yb-prev').addEventListener('click', () => ybGo(-1));
  document.getElementById('yb-next').addEventListener('click', () => ybGo(1));
  document.getElementById('yb-yearsel').addEventListener('click', e => {
    const b = e.target.closest('[data-ybyear]');
    if (!b) return;
    yb.year = b.dataset.ybyear;
    yb.stats = yearStats(yb.year);
    yb.page = 0;
    renderYearBill();
    renderYbYearSel();
  });
  const ybStage = document.getElementById('yb-stage');
  ybStage.addEventListener('click', e => {
    if (e.target.closest('[data-ybreplay]')) { yb.page = 0; renderYearBill(); }
    else if (e.target.closest('[data-ybclose]')) closeYearBill();
    else if (!e.target.closest('.yb-btn')) ybGo(1);   // 点内容区空白处翻下一页
  });
  let ybTouchX = null;
  document.getElementById('yb-wrap').addEventListener('touchstart', e => { ybTouchX = e.touches[0].clientX; }, { passive: true });
  document.getElementById('yb-wrap').addEventListener('touchend', e => {
    if (ybTouchX == null) return;
    const dx = e.changedTouches[0].clientX - ybTouchX;
    if (Math.abs(dx) > 40) ybGo(dx < 0 ? 1 : -1);
    ybTouchX = null;
  }, { passive: true });
  document.addEventListener('keydown', e => {
    if (!document.getElementById('yb-wrap').classList.contains('open')) return;
    if (e.key === 'ArrowRight') ybGo(1);
    else if (e.key === 'ArrowLeft') ybGo(-1);
    else if (e.key === 'Escape') closeYearBill();
  });

  // 子页入口与返回（账本/云同步/预算/数据管理/设置）
  document.querySelectorAll('.sub-entry').forEach(el =>
    el.addEventListener('click', () => openSub(el.dataset.sub)));
  document.querySelectorAll('.back-btn').forEach(el =>
    el.addEventListener('click', closeSub));

  switchTab('day');
  renderAll();
  initAutoSync();
  // PWA：注册 Service Worker（https / localhost 下生效，本地 file:// 无需）
  if ('serviceWorker' in navigator &&
      (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  if (!state.storageOk) toast('注意：当前浏览器无法保存数据');
}

document.addEventListener('DOMContentLoaded', init);
