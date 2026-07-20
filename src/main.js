// Boot entry.
import './components/gm-shell.js';
import continuum2026 from './con/continuum-2026.js';

export const APP = 'the-director';

if (typeof document !== 'undefined' && document.querySelector('gm-shell')) {
  customElements.whenDefined('gm-shell').then(() => {
    const shell = document.querySelector('gm-shell');
    shell.loadCon(continuum2026);
  });
}

// Register the service worker for the browser PWA. Skipped inside the native
// iOS wrapper (Capacitor), where assets are already bundled locally and a SW
// under the capacitor:// scheme is unnecessary and can conflict.
const inCapacitor = typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();
if (!inCapacitor && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
