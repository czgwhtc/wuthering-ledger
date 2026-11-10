const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

function setup({ splash = false, readyState = 'complete' } = {}) {
  const elements = new Map(), storage = new Map(), listeners = {}, timers = new Map();
  let nextTimer = 0;
  function element(id) {
    if (id === 'splash' && !splash) return null;
    if (!elements.has(id)) {
      const classes = new Set();
      elements.set(id, { id, value: '', innerHTML: '', textContent: '', options: [],
        classList: { add: x => classes.add(x), remove: x => classes.delete(x),
          contains: x => classes.has(x), toggle: (x, on) => on ? classes.add(x) : classes.delete(x) },
        addEventListener() {}, focus() {}, remove() { this.removed = true; },
      });
    }
    return elements.get(id);
  }
  const sandbox = {
    document: { readyState, getElementById: element, querySelectorAll: () => [],
      querySelector: element, addEventListener: (type, fn) => (listeners[type] ||= []).push(fn) },
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) },
    setTimeout: (fn, delay) => { const id = ++nextTimer; timers.set(id, { fn, delay }); return id; },
    clearTimeout: id => timers.delete(id), setInterval: () => 0,
    window: { addEventListener() {}, innerWidth: 390 },
    confirm: () => true,
    FileReader: class { readAsText(file) { this.result = file.text; this.onload(); } },
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  const run = code => vm.runInContext(code, sandbox);
  run("todayStr = () => '2026-11-10'; state.data = defaultData(); state.profiles = { current: '默认', names: ['默认'] };");
  return { sandbox, run, element, storage, listeners, timers };
}
function record(id, date, cents = 1000, type = 'expense') {
  return { id, date, amountCents: cents, type, category: 'other', note: '', createdAt: 1, updatedAt: 1 };
}
function test(name, fn) { fn(); console.log('PASS ' + name); }

test('daily budget excludes today and future records; today reduces daily remainder', () => {
  const c = setup();
  c.sandbox.records = [record('past', '2026-11-09', 90000), record('today', '2026-11-10', 1000),
    record('future', '2026-11-11', 50000), record('income', '2026-11-08', 100000, 'income')];
  c.run("state.data.records = records; state.data.settings.monthlyBudget = 300000; state.viewDate = '2026-11-10'; renderDay();");
  assert.ok(c.element('day-summary-card').innerHTML.includes('日预算 ¥70.00 · 已用 14% · 剩余 ¥60.00'));
});

test('saving a record selects its custom billing period', () => {
  for (const [start, date, expected] of [[1, '2026-11-01', '2026-11'], [15, '2026-11-10', '2026-10'], [28, '2027-01-01', '2026-12']]) {
    const c = setup();
    c.run(`state.data.settings.monthStartOn = true; state.data.settings.monthStartDay = ${start}; state.sheetCat = 'food'; renderAll = () => {};`);
    c.element('amount-input').value = '12.50'; c.element('date-input').value = date;
    c.run('saveSheet();');
    assert.equal(c.run('state.viewMonth'), expected);
    assert.equal(c.run('state.data.records[0].amountCents'), 1250);
  }
});

test('initializing, switching and importing use the active account billing period', () => {
  const c = setup();
  const data = { records: [], settings: { monthlyBudget: 200000, monthStartOn: true, monthStartDay: 15 } };
  c.storage.set('ledger.profiles.v1', JSON.stringify({ current: '默认', names: ['默认', '旅行'] }));
  c.storage.set('ledger.data.v1::默认', JSON.stringify(data));
  c.storage.set('ledger.data.v1::旅行', JSON.stringify(data));
  c.run('applyRandomBackground = initMusic = renderAll = renderSyncCard = initAutoSync = () => {}; init();');
  assert.equal(c.run('state.viewMonth'), '2026-10');
  c.run("state.viewMonth = '2030-01'; switchProfile('旅行');");
  assert.equal(c.run('state.viewMonth'), '2026-10');
  c.sandbox.backupEvent = { target: { value: 'file', files: [{ text: JSON.stringify(data) }] } };
  c.run("state.viewMonth = '2030-01'; importJSON(backupEvent);");
  assert.equal(c.run('state.viewMonth'), '2026-10');
  c.run("state.viewMonth = '2030-01'; deleteProfile('旅行');");
  assert.equal(c.run('state.viewMonth'), '2026-10');
});

test('batch deletion cannot delete selected records outside the visible period', () => {
  const c = setup();
  c.sandbox.records = [record('oct', '2026-10-20'), record('nov', '2026-11-10')];
  c.run("state.tab = 'list'; state.data.records = records; state.viewMonth = '2026-11'; state.manageMode = true; state.selectedIds = new Set(['oct', 'nov']); batchDeleteArmed = true; renderAll = () => {}; onBatchDeleteClick();");
  assert.equal(c.run('state.data.records.length'), 1);
  assert.equal(c.run('state.data.records[0].id'), 'oct');
  assert.equal(c.run('state.data.deleted.oct'), undefined);
  assert.equal(c.run('state.selectedIds.size'), 0);
});

test('leaving details clears selection and restores add button and daily rows', () => {
  const c = setup();
  c.sandbox.records = [record('nov', '2026-11-10')];
  c.run("state.data.records = records; state.viewDate = '2026-11-10'; state.viewMonth = '2026-11'; state.tab = 'list'; enterManageMode(); state.selectedIds.add('nov'); renderAll(); switchTab('day');");
  assert.equal(c.run('state.manageMode'), false);
  assert.equal(c.run('state.selectedIds.size'), 0);
  assert.equal(c.element('fab-add').classList.contains('hidden'), false);
  assert.ok(!c.element('day-record-list').innerHTML.includes('sel-check'));
});

test('month navigation clears selection, including entering an empty month', () => {
  const c = setup();
  c.run('applyRandomBackground = initMusic = initAutoSync = () => {}; init();');
  c.sandbox.records = [record('nov', '2026-11-10')];
  c.run("state.data.records = records; state.viewMonth = '2026-11'; state.tab = 'list'; enterManageMode(); state.selectedIds.add('nov');");
  const button = { dataset: { act: 'next' } };
  const event = { target: { closest: selector => selector === '.ms-btn, .ms-now' ? button : null } };
  c.listeners.click.forEach(fn => fn(event));
  assert.equal(c.run('state.viewMonth'), '2026-12');
  assert.equal(c.run('state.manageMode'), false);
  assert.equal(c.run('state.selectedIds.size'), 0);
  assert.equal(c.element('fab-add').classList.contains('hidden'), false);
});

test('unknown imported categories remain searchable and use a fallback icon', () => {
  const c = setup();
  c.sandbox.records = [{ ...record('old', '2026-11-10', 1250), category: 'legacy', note: 'coffee' }];
  c.run('state.data.records = records;');
  assert.equal(c.run("searchRecords('xyz').length"), 0);
  for (const q of ['coffee', '2026-11', '12.5']) assert.equal(c.run(`searchRecords('${q}').length`), 1);
  assert.ok(!c.run("catAvatarHTML(catOf('expense', 'legacy'))").includes('undefined'));
});

test('multi-select works for a day and across months in search results', () => {
  for (const tab of ['day', 'search']) {
    const c = setup();
    c.sandbox.records = [record('a', '2026-11-10'), record('b', tab === 'day' ? '2026-11-10' : '2026-10-10'), record('hidden', '2026-09-01')];
    c.sandbox.records[0].note = c.sandbox.records[1].note = 'coffee';
    c.element('search-input').value = 'coffee';
    c.run(`state.tab = '${tab}'; state.viewDate = '2026-11-10'; state.data.records = records; enterManageMode('a'); toggleSelect('b');`);
    assert.equal(c.run('state.selectedIds.size'), 2);
    const html = c.element(tab === 'day' ? 'day-record-list' : 'search-results').innerHTML;
    assert.ok(html.includes('已选 2 笔'));
    c.run('onBatchDeleteClick();');
    assert.equal(c.run('state.data.records.length'), 3);
    c.run('onBatchDeleteClick();');
    assert.equal(c.run('state.data.records.length'), 1);
    assert.equal(c.run('state.data.records[0].id'), 'hidden');
  }
});

test('record IDs are escaped in markup and chart period label is not doubled', () => {
  const c = setup();
  c.sandbox.record = record('" onclick="bad', '2026-11-10');
  assert.ok(c.run('rowHTML(record)').includes('data-id="&quot; onclick=&quot;bad"'));
  assert.ok(c.run("donutSVG([], 0, '11月')").includes('11月 · 支出'));
});

(async () => {
  const c = setup({ splash: true, readyState: 'complete' });
  [...c.timers.values()].find(t => t.delay === 650).fn();
  await Promise.resolve(); await Promise.resolve();
  assert.equal(c.element('splash').classList.contains('off'), true);
  assert.ok(![...c.timers.values()].some(t => t.delay === 2500));
  console.log('PASS splash exits after DOM readiness without waiting for images');
  const slow = setup({ splash: true, readyState: 'loading' });
  [...slow.timers.values()].find(t => t.delay === 2500).fn();
  assert.equal(slow.element('splash').classList.contains('off'), true);
  const removals = [...slow.timers.values()].filter(t => t.delay === 650);
  removals.forEach(t => t.fn());
  assert.equal(slow.element('splash').removed, true);
  console.log('PASS splash always exits within bounded fallback');
})().catch(error => { console.error(error); process.exitCode = 1; });
