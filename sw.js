/* 记账本 Service Worker：缓存全部静态资源，装成 App 后离线可用
   注意：改动静态文件后请把 CACHE 版本号 +1，用户端才会更新 */
const CACHE = 'ledger-v34';
const CORE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
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
    caches.open(CACHE)
      .then(c => c.addAll(CORE).catch(() => c.addAll(CORE.slice(0, 8))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;  // 云同步等跨域请求直连
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));  // 看过即缓存，离线可轮换
        }
        return res;
      });
    })
  );
});
