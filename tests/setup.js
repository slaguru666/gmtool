// Workaround: Node's own experimental global `localStorage` (added in recent
// Node versions) shadows jsdom's per-window localStorage before vitest's
// jsdom environment can install it, leaving `localStorage`/`window.localStorage`
// undefined in tests. Replace it with a real jsdom-backed Storage instance.
import { JSDOM } from 'jsdom';

if (typeof localStorage === 'undefined' || typeof localStorage.setItem !== 'function') {
  const { window } = new JSDOM('', { url: 'http://localhost/' });
  Object.defineProperty(globalThis, 'localStorage', {
    value: window.localStorage,
    configurable: true,
    writable: true,
  });
}
