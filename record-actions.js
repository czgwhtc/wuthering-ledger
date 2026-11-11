/* 长按账单：删除 / 多选。滚动取消长按，普通轻点仍进入编辑。 */
(function () {
  const menu = document.getElementById('record-menu');
  const remove = document.getElementById('record-menu-delete');
  const multi = document.getElementById('record-menu-multi');
  if (!menu || !remove || !multi) return;
  let press = null, timer = null, recordId = null, armed = false, confirmTimer;
  let suppressId = null, suppressUntil = 0;
  function cancelPress() { clearTimeout(timer); press = null; }
  function closeMenu() {
    menu.hidden = true; recordId = null; armed = false;
    clearTimeout(confirmTimer); remove.textContent = '删除'; remove.classList.remove('armed');
  }
  function openMenu(id, x, y) {
    closeMenu();
    if (!visibleRecords().some(r => r.id === id)) return;
    recordId = id; menu.hidden = false;
    menu.style.left = Math.max(8, Math.min(x, window.innerWidth - 164)) + 'px';
    menu.style.top = Math.max(8, Math.min(y, window.innerHeight - 124)) + 'px';
    suppressId = id; suppressUntil = Date.now() + 1200;
  }
  document.addEventListener('pointerdown', e => {
    if (!menu.hidden && !e.target.closest('#record-menu')) closeMenu();
    const row = e.target.closest('.record-row');
    if (!row || e.button !== 0 || state.manageMode || e.isPrimary === false) return;
    cancelPress();
    press = { id: row.dataset.id, x: e.clientX, y: e.clientY };
    timer = setTimeout(() => {
      if (!press) return;
      openMenu(press.id, press.x, press.y); press = null;
    }, 500);
  });
  document.addEventListener('pointermove', e => {
    if (press && (Math.abs(e.clientX - press.x) > 10 || Math.abs(e.clientY - press.y) > 10)) cancelPress();
  }, { passive: true });
  document.addEventListener('pointerup', cancelPress);
  document.addEventListener('pointercancel', cancelPress);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelPress(); closeMenu(); } });
  window.addEventListener('blur', () => { cancelPress(); closeMenu(); });
  document.addEventListener('scroll', () => { cancelPress(); closeMenu(); }, true);
  window.addEventListener('resize', () => { cancelPress(); closeMenu(); });
  document.addEventListener('contextmenu', e => {
    const row = e.target.closest('.record-row');
    if (!row) return;
    e.preventDefault(); cancelPress();
    if (!state.manageMode) openMenu(row.dataset.id, e.clientX, e.clientY);
  });
  document.addEventListener('click', e => {
    const row = e.target.closest('.record-row');
    const bar = e.target.closest('[data-manage]');
    if (row && row.dataset.id === suppressId && Date.now() < suppressUntil) {
      e.preventDefault(); e.stopImmediatePropagation(); suppressId = null; return;
    }
    if (row && state.manageMode) {
      e.preventDefault(); e.stopImmediatePropagation(); toggleSelect(row.dataset.id); return;
    }
    if (bar && (bar.dataset.manage === 'enter' || state.manageMode)) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (bar.dataset.manage === 'enter') enterManageMode();
      else if (bar.dataset.manage === 'exit') exitManageMode();
      else if (bar.dataset.manage === 'all') toggleSelectAll(visibleRecords());
      else if (bar.dataset.manage === 'delete') onBatchDeleteClick();
      return;
    }
    if (!e.target.closest('#record-menu')) closeMenu();
  }, true);
  remove.addEventListener('click', () => {
    if (!recordId || !visibleRecords().some(r => r.id === recordId)) { closeMenu(); return; }
    if (!armed) {
      armed = true; remove.textContent = '确认删除'; remove.classList.add('armed');
      confirmTimer = setTimeout(() => { armed = false; remove.textContent = '删除'; remove.classList.remove('armed'); }, 2500);
      return;
    }
    const id = recordId;
    closeMenu(); deleteRecordsWithUndo(new Set([id])); renderAll();
  });
  multi.addEventListener('click', () => {
    const id = recordId; closeMenu(); suppressId = null; enterManageMode(id);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { cancelPress(); closeMenu(); if (state.manageMode) exitManageMode(); }
    if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
      const row = e.target.closest('.record-row');
      if (row) { e.preventDefault(); const box = row.getBoundingClientRect(); openMenu(row.dataset.id, box.left + 20, box.bottom); remove.focus(); }
    }
  });
})();
