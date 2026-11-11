/* 记账本 Service Worker：缓存全部静态资源，装成 App 后离线可用
   注意：改动静态文件后请把 CACHE 版本号 +1，用户端才会更新 */
const CACHE = 'ledger-v45';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './record-actions.js',
  './updates.js',
  './manifest.webmanifest',
];
const CORE = [
  ...APP_SHELL,
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './assets/music/bgm.mp3',
  './assets/chara/art-7.webp', './assets/chara/art-8.webp', './assets/chara/art-9.webp',
  './assets/chara/art-10.webp',
  './assets/chara/av-food.png', './assets/chara/av-transport.png', './assets/chara/av-shopping.png',
  './assets/chara/av-housing.png', './assets/chara/av-fun.png', './assets/chara/av-medical.png',
  './assets/chara/av-study.png', './assets/chara/av-other.png', './assets/chara/av-salary.png',
  './assets/chara/av-bonus.png', './assets/chara/av-invest.png', './assets/chara/av-sidejob.png',
  './assets/chara/av-income-other.png',
  './assets/chara/me-av-profiles.png', './assets/chara/me-av-sync.png',
  './assets/chara/me-av-budget.png', './assets/chara/me-av-data.png',
  './assets/chara/me-av-settings.png', './assets/chara/me-av-about.png',
  './assets/chara/pixel-aimisi.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const legacy = new Set(['ledger-v38', 'ledger-v39', 'ledger-v40']);
      const migrateLegacy = keys.some(key => legacy.has(key)) &&
        keys.every(key => !key.startsWith('ledger-') || legacy.has(key) || key === CACHE);
      const cache = await caches.open(CACHE);
      // 绕过 HTTP 旧缓存，确保新版本的页面、脚本和样式一起更新。
      const freshRequest = url => new Request(url, { cache: 'reload' });
      await cache.addAll(APP_SHELL.map(freshRequest));
      // 图片和音乐暂时不可用时，也允许安装可离线使用的记账页面。
      await Promise.all(CORE.filter(url => !APP_SHELL.includes(url)).map(url =>
        cache.add(freshRequest(url)).catch(() => {})
      ));
      // 更新留在 waiting，等用户保存当前记账并点击更新后再启用。
      // v38-v40 没有更新横幅：仅这一次直接激活，但不刷新旧页面，保留输入。
      // 若已有其他新版本缓存，禁止再走兼容迁移，以后统一由用户确认更新。
      if (migrateLegacy) await self.skipWaiting();
    })()
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('ledger-') && k !== CACHE)
        .map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // 仅接管本应用范围内的 GET；同步请求和同域其他项目直接访问网络。
  if (e.request.method !== 'GET' || url.origin !== location.origin ||
      !url.href.startsWith(self.registration.scope)) return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(e.request, { ignoreSearch: true });
      if (hit) return hit;
      try {
        const res = await fetch(e.request);
        if (res.ok) {
          // 容量不足等缓存失败不应影响已成功下载的页面或图片。
          await cache.put(e.request, res.clone()).catch(() => {});
        }
        return res;
      } catch (error) {
        if (e.request.mode === 'navigate') {
          const fallback = await cache.match('./index.html');
          if (fallback) return fallback;
        }
        throw error;
      }
    })
  );
});

