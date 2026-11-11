const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../record-actions.js'), 'utf8');
function setup() {
  const handlers = {}, timers = new Map(), elements = {}, selected = [], deleted = [];
  let counter = 0;
  function el(id) {
    return elements[id] ||= { hidden: true, style: {}, textContent: '', events: {},
      classList: { add() {}, remove() {} }, addEventListener(name, fn) { this.events[name] = fn; }, focus() {} };
  }
  const state = { manageMode: false, data: { records: [{ id: 'a' }, { id: 'b' }], deleted: {} } };
  const sandbox = { state,
    document: { getElementById: el, addEventListener(name, fn) { (handlers[name] ||= []).push(fn); } },
    window: { innerWidth: 390, innerHeight: 844, addEventListener() {} },
    setTimeout(fn, delay) { const id = ++counter; timers.set(id, { fn, delay }); return id; }, clearTimeout(id) { timers.delete(id); },
    visibleRecords: () => state.data.records, enterManageMode: id => { state.manageMode = true; selected.push(id); },
    exitManageMode: () => { state.manageMode = false; }, toggleSelect: id => selected.push(id), toggleSelectAll() {},
    onBatchDeleteClick() {}, saveData: () => deleted.push('save'), renderAll() {}, toast() {},
    deleteRecordsWithUndo(ids) {
      for (const id of ids) state.data.deleted[id] = Date.now();
      state.data.records = state.data.records.filter(r => !ids.has(r.id)); deleted.push('save');
    },
  };
  vm.runInNewContext(code, sandbox);
  const row = { dataset: { id: 'a' }, closest: selector => selector === '.record-row' ? row : null };
  function event(target = row, extra = {}) { return { target, button: 0, clientX: 380, clientY: 830,
    preventDefault() { this.prevented = true; }, stopImmediatePropagation() { this.stopped = true; }, ...extra }; }
  const emit = (name, e) => { (handlers[name] || []).forEach(fn => fn(e)); return e; };
  const hold = () => { emit('pointerdown', event()); [...timers.values()].find(t => t.delay === 500).fn(); };
  return { emit, event, hold, el, timers, state, selected, deleted };
}
let c = setup(); c.hold();
assert.equal(c.el('record-menu').hidden, false);
assert.equal(c.el('record-menu').style.left, '226px');
assert.equal(c.el('record-menu').style.top, '720px');
assert.equal(c.emit('click', c.event()).stopped, true);
c.el('record-menu-multi').events.click();
assert.equal(c.selected[0], 'a');
assert.equal(c.el('record-menu').hidden, true);
assert.equal(c.emit('click', c.event()).stopped, true);
assert.equal(c.selected.length, 2);
console.log('PASS long press opens bounded menu, suppresses click, and selects record');
for (const action of ['pointermove', 'pointercancel', 'pointerup', 'scroll']) {
  c = setup(); c.emit('pointerdown', c.event());
  c.emit(action, c.event(undefined, { clientX: 100, clientY: 100 }));
  assert.ok(![...c.timers.values()].some(t => t.delay === 500));
  assert.equal(c.el('record-menu').hidden, true);
}
console.log('PASS movement, cancellation, release and scroll cancel long press');
c = setup(); c.emit('contextmenu', c.event());
c.el('record-menu-delete').events.click();
assert.equal(c.state.data.records.length, 2);
assert.equal(c.el('record-menu-delete').textContent, '确认删除');
c.el('record-menu-delete').events.click();
assert.equal(c.state.data.records.length, 1);
assert.equal(c.state.data.records[0].id, 'b');
assert.ok(c.state.data.deleted.a);
assert.equal(c.deleted.length, 1);
console.log('PASS context menu deletion requires confirmation and records tombstone');
c = setup(); c.hold(); c.emit('keydown', c.event(undefined, { key: 'Escape' }));
assert.equal(c.el('record-menu').hidden, true);
console.log('PASS Escape closes menu');
