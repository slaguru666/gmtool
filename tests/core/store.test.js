import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from '../../src/core/store.js';

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
    get length() { return map.size; },
  };
}

describe('createStore', () => {
  let s, storage;
  beforeEach(() => { storage = fakeStorage(); s = createStore('afterimage', storage); });

  it('round-trips JSON values under a namespaced key', () => {
    s.set('clock', { startedAt: 5 });
    expect(storage.getItem('gmd.afterimage.clock')).toBe('{"startedAt":5}');
    expect(s.get('clock')).toEqual({ startedAt: 5 });
  });

  it('returns fallback for missing/corrupt keys', () => {
    expect(s.get('missing', 42)).toBe(42);
    storage.setItem('gmd.afterimage.bad', '{not json');
    expect(s.get('bad', 'fb')).toBe('fb');
  });

  it('exports only its namespace and imports back', () => {
    s.set('a', 1);
    storage.setItem('gmd.other.z', '9');
    const dump = s.exportAll();
    expect(Object.keys(dump)).toEqual(['gmd.afterimage.a']);
    const s2 = createStore('afterimage', fakeStorage());
    s2.importAll(dump);
    expect(s2.get('a')).toBe(1);
  });
});
