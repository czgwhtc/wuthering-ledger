const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const scope = 'https://example.test/wuthering-ledger/';
const keyOf = input => new URL(typeof input === 'string' ? input : input.url, scope).href;

class Events {
  constructor() { this.listeners = {}; }
  addEventListener(type, handler) { (this.listeners[type] ||= []).push(handler); }
  emit(type, event = {}) { for (const handler of this.listeners[type] || []) handler(event); }
}

function response(body, ok = true) {
  return { body, ok, clone() { return response(body, ok); } };
}

function serviceWorker({ names = [], fail = [], quota = false, version = 'ledger-v48' } = {}) {
  const self = new Events();
  const storage = new Map(names.map(name => [name, new Map()]));
  const requests = [];
  const deleted = [];
  let skipped = 0;
  let claimed = 0;
  let network = async () => response('network');
  self.registration = { scope };
  self.skipWaiting = async () => { skipped++; };
  self.clients = { claim: async () => { claimed++; } };
  const caches = {
    keys: async () => [...storage.keys()],
    delete: async name => { deleted.push(name); return storage.delete(name); },
    open: async name => {
      if (!storage.has(name)) storage.set(name, new Map());
      const entries = storage.get(name);
      const cache = {
        add: async request => {
          requests.push(request);
          if (fail.some(suffix => request.url.endsWith(suffix))) throw new Error('download failed');
          entries.set(keyOf(request), response('precache:' + request.url));
        },
        addAll: async requests => { await Promise.all(requests.map(request => cache.add(request))); },
        match: async (request, options = {}) => {
          const wanted = new URL(keyOf(request));
          for (const [key, value] of entries) {
            const actual = new URL(key);
            if (options.ignoreSearch) { wanted.search = ''; actual.search = ''; }
            if (wanted.href === actual.href) return value;
          }
        },
        put: async (request, value) => {
          if (quota) throw new Error('quota exceeded');
          entries.set(keyOf(request), value);
        }
      };
      return cache;
    }
  };
  class Request {
    constructor(url, options) { this.url = keyOf(url); Object.assign(this, options); }
  }
  vm.runInNewContext(source('sw.js').replace("const CACHE = 'ledger-v48'", `const CACHE = '${version}'`), {
    self, caches, Request, URL, location: { origin: 'https://example.test' },
    fetch: request => network(request)
  });
  return {
    storage, requests, deleted,
    get skipped() { return skipped; }, get claimed() { return claimed; },
    setNetwork(handler) { network = handler; },
    async lifecycle(type, data) {
      const pending = [];
      self.emit(type, { data, waitUntil: promise => pending.push(promise) });
      await Promise.all(pending);
    },
    fetch(url, { method = 'GET', mode = 'cors' } = {}) {
      let result;
      self.emit('fetch', {
        request: { url: new URL(url, scope).href, method, mode },
        respondWith: promise => { result = promise; }
      });
      return result;
    }
  };
}

test('install precaches the complete app shell with fresh HTTP requests and waits for consent', async () => {
  const sw = serviceWorker({ names: ['ledger-v48'], version: 'ledger-v49' });
  await sw.lifecycle('install');
  assert.equal(sw.skipped, 0);
  assert.ok(sw.requests.some(req => req.url.endsWith('/updates.js')));
  assert.ok(sw.requests.every(req => req.cache === 'reload'));
  await sw.lifecycle('message', { type: 'UNRELATED' });
  assert.equal(sw.skipped, 0);
  await sw.lifecycle('message', { type: 'SKIP_WAITING' });
  assert.equal(sw.skipped, 1);
});

test('legacy-only migration activates once; leftover legacy cache never bypasses later consent', async () => {
  const legacy = serviceWorker({ names: ['ledger-v40', 'another-app-v5'] });
  await legacy.lifecycle('install');
  assert.equal(legacy.skipped, 1);
  const modern = serviceWorker({ names: ['ledger-v40', 'ledger-v48'], version: 'ledger-v49' });
  await modern.lifecycle('install');
  assert.equal(modern.skipped, 0);
  const first = serviceWorker();
  await first.lifecycle('install');
  assert.equal(first.skipped, 0);
});

test('optional art failure preserves offline shell; missing application JS rejects installation', async () => {
  const optional = serviceWorker({ fail: ['/bgm.mp3', '/art-7.webp'] });
  await optional.lifecycle('install');
  assert.ok(optional.storage.get('ledger-v48').has(scope + 'index.html'));
  const critical = serviceWorker({ fail: ['/app.js'] });
  await assert.rejects(critical.lifecycle('install'), /download failed/);
  assert.equal(critical.skipped, 0);
});

test('activation deletes only this application namespace', async () => {
  const sw = serviceWorker({ names: ['ledger-v39', 'ledger-v40', 'ledger-v48', 'another-app-v5'] });
  await sw.lifecycle('activate');
  assert.deepEqual(sw.deleted.sort(), ['ledger-v39', 'ledger-v40']);
  assert.ok(sw.storage.has('ledger-v48'));
  assert.ok(sw.storage.has('another-app-v5'));
  assert.equal(sw.claimed, 1);
});

test('fetch uses only the active app cache and leaves other applications and writes alone', async () => {
  const sw = serviceWorker({ names: ['ledger-v40', 'another-app-v5'] });
  sw.storage.get('ledger-v40').set(scope + 'app.js', response('old-js'));
  sw.storage.get('another-app-v5').set(scope + 'app.js', response('foreign-js'));
  assert.equal((await sw.fetch('./app.js')).body, 'network');
  assert.equal(sw.fetch('https://api.example.test/data'), undefined);
  assert.equal(sw.fetch('/another-project/app.js'), undefined);
  assert.equal(sw.fetch('./save', { method: 'POST' }), undefined);
});

test('offline navigation retains the ledger, and cache quota failure does not break a successful response', async () => {
  const sw = serviceWorker();
  await sw.lifecycle('install');
  sw.setNetwork(async () => { throw new Error('offline'); });
  assert.match((await sw.fetch('./?source=homescreen', { mode: 'navigate' })).body, /precache:/);
  assert.match((await sw.fetch('./history', { mode: 'navigate' })).body, /index.html/);
  const quota = serviceWorker({ quota: true });
  assert.equal((await quota.fetch('./new-image.webp')).body, 'network');
});

function worker(state = 'installed') {
  const value = new Events();
  value.state = state;
  value.messages = [];
  value.postMessage = message => value.messages.push(message);
  value.changeState = state => { value.state = state; value.emit('statechange'); };
  return value;
}

async function page({ waiting = null, installing = null, controlled = true } = {}) {
  const serviceWorker = new Events();
  const registration = new Events();
  Object.assign(registration, { waiting, installing, active: controlled ? worker('activated') : null });
  let checks = 0;
  registration.update = async () => { checks++; };
  serviceWorker.controller = controlled ? worker('activated') : null;
  let registerOptions;
  serviceWorker.register = async (url, options) => { registerOptions = options; return registration; };
  const document = new Events();
  const window = new Events();
  const elements = Object.fromEntries(['app-update', 'app-update-message', 'app-update-apply', 'app-update-dismiss']
    .map(id => [id, Object.assign(new Events(), { hidden: id === 'app-update', disabled: false })]));
  document.getElementById = id => elements[id];
  document.visibilityState = 'visible';
  let reloads = 0;
  const location = { protocol: 'https:', hostname: 'example.test', reload: () => { reloads++; } };
  vm.runInNewContext(source('updates.js'), {
    navigator: { serviceWorker, onLine: true }, document, window, location
  });
  await Promise.resolve();
  return {
    serviceWorker, registration, elements, document, window,
    get options() { return registerOptions; }, get reloads() { return reloads; }, get checks() { return checks; }
  };
}

test('existing waiting worker prompts, and only an explicit click permits a single reload', async () => {
  const pending = worker();
  const ui = await page({ waiting: pending });
  assert.equal(ui.options.updateViaCache, 'none');
  assert.equal(ui.elements['app-update'].hidden, false);
  assert.equal(ui.reloads, 0);
  ui.elements['app-update-apply'].emit('click');
  assert.equal(pending.messages[0].type, 'SKIP_WAITING');
  assert.equal(ui.elements['app-update-apply'].disabled, true);
  ui.serviceWorker.emit('controllerchange');
  ui.serviceWorker.emit('controllerchange');
  assert.equal(ui.reloads, 1);
});

test('background activation in another tab never refreshes the current form', async () => {
  const ui = await page({ waiting: worker() });
  ui.serviceWorker.emit('controllerchange');
  assert.equal(ui.reloads, 0);
  assert.equal(ui.elements['app-update'].hidden, true);
});

test('updates found after load prompt when installed, while first installation stays silent', async () => {
  const ui = await page();
  const next = worker('installing');
  ui.registration.installing = next;
  ui.registration.emit('updatefound');
  ui.registration.waiting = next;
  next.changeState('installed');
  assert.equal(ui.elements['app-update'].hidden, false);
  assert.equal(ui.reloads, 0);
  const first = worker('installing');
  const fresh = await page({ installing: first, controlled: false });
  first.changeState('installed');
  fresh.serviceWorker.emit('controllerchange');
  assert.equal(fresh.elements['app-update'].hidden, true);
  assert.equal(fresh.reloads, 0);
});

test('dismissed updates stay dismissed on reconnection and returning to the page', async () => {
  const ui = await page({ waiting: worker() });
  ui.elements['app-update-dismiss'].emit('click');
  ui.window.emit('online');
  ui.document.emit('visibilitychange');
  assert.equal(ui.elements['app-update'].hidden, true);
  assert.equal(ui.checks, 1);
  assert.equal(ui.reloads, 0);
});

test('an activation race or failed update message preserves the current form', async () => {
  const pending = worker();
  const ui = await page({ waiting: pending });
  pending.state = 'activated';
  ui.elements['app-update-apply'].emit('click');
  assert.equal(ui.reloads, 0);
  assert.equal(pending.messages.length, 0);
  const broken = worker();
  broken.postMessage = () => { throw new Error('worker gone'); };
  const failed = await page({ waiting: broken });
  failed.elements['app-update-apply'].emit('click');
  failed.serviceWorker.emit('controllerchange');
  assert.equal(failed.reloads, 0);
  assert.equal(failed.elements['app-update-apply'].disabled, false);
});
