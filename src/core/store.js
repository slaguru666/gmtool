const PREFIX = 'gmd';

export function createStore(namespace, storage = globalThis.localStorage) {
  const full = (key) => `${PREFIX}.${namespace}.${key}`;
  const nsPrefix = `${PREFIX}.${namespace}.`;
  return {
    get(key, fallback = null) {
      const raw = storage.getItem(full(key));
      if (raw == null) return fallback;
      try { return JSON.parse(raw); } catch { return fallback; }
    },
    set(key, value) { storage.setItem(full(key), JSON.stringify(value)); },
    remove(key) { storage.removeItem(full(key)); },
    exportAll() {
      const out = {};
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.startsWith(nsPrefix)) out[k] = storage.getItem(k);
      }
      return out;
    },
    importAll(obj) {
      for (const [k, v] of Object.entries(obj)) {
        if (k.startsWith(nsPrefix)) storage.setItem(k, v);
      }
    },
  };
}
