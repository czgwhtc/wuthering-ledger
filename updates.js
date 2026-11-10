/* PWA 更新：仅在用户主动点击后切换版本和刷新，保护正在填写的账单。 */
(function () {
  if (!('serviceWorker' in navigator) ||
      !(location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) return;

  const banner = document.getElementById('app-update');
  const message = document.getElementById('app-update-message');
  const apply = document.getElementById('app-update-apply');
  const dismiss = document.getElementById('app-update-dismiss');
  let registration;
  let waitingWorker;
  let dismissedWorker;
  let updateRequested = false;
  let reloaded = false;
  let lastCheck = Date.now();

  function offerUpdate(worker) {
    if (!banner || !apply || !message || !worker ||
        worker.state !== 'installed' || worker === dismissedWorker) return;
    waitingWorker = worker;
    message.textContent = '新版本已就绪，保存当前记账后即可更新。';
    apply.disabled = false;
    banner.hidden = false;
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (updateRequested && !reloaded) {
      reloaded = true;
      location.reload();
    } else if (banner) {
      // 别的标签页启用了更新时，本页继续保留未保存的输入。
      banner.hidden = true;
      waitingWorker = null;
    }
  });

  if (apply) apply.addEventListener('click', () => {
    const worker = registration && registration.waiting || waitingWorker;
    if (!worker || worker.state !== 'installed') {
      if (banner) banner.hidden = true;
      return;
    }
    updateRequested = true;
    apply.disabled = true;
    message.textContent = '正在更新…';
    try {
      worker.postMessage({ type: 'SKIP_WAITING' });
    } catch (_) {
      updateRequested = false;
      apply.disabled = false;
      message.textContent = '暂时无法更新，请稍后重试。';
    }
  });

  if (dismiss) dismiss.addEventListener('click', () => {
    dismissedWorker = waitingWorker;
    banner.hidden = true;
  });

  function watchInstalling(worker) {
    if (!worker) return;
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' &&
          (navigator.serviceWorker.controller || registration.active)) {
        offerUpdate(registration.waiting || worker);
      }
    });
  }

  function checkForUpdates(force) {
    if (!registration || !navigator.onLine ||
        (!force && Date.now() - lastCheck < 30 * 60 * 1000)) return;
    lastCheck = Date.now();
    registration.update().catch(() => {});
    offerUpdate(registration.waiting);
  }

  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
    registration = reg;
    offerUpdate(reg.waiting); // 上一次访问已下载完成的版本也要提示。
    watchInstalling(reg.installing);
    reg.addEventListener('updatefound', () => watchInstalling(reg.installing));
    window.addEventListener('online', () => checkForUpdates(true));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdates(false);
    });
  }).catch(() => {}); // 离线或浏览器禁用 SW 时，继续正常使用页面。
})();
