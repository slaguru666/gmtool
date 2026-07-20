// Boot entry.
import './components/gm-shell.js';
import afterimage from './scenarios/afterimage.js';

export const APP = 'the-director';

if (typeof document !== 'undefined' && document.querySelector('gm-shell')) {
  customElements.whenDefined('gm-shell').then(() => {
    const shell = document.querySelector('gm-shell');
    shell.loadScenario(afterimage);
  });
}

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
