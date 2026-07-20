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

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
