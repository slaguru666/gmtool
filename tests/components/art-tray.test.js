import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/art-tray.js';

const M = [
  { id: 'a', src: '/art/a.png', label: 'Detective in alley', tags: ['detective', 'alley'] },
  { id: 'b', src: '/art/b.png', label: 'Neon street', tags: ['street', 'neon'] },
];

describe('<art-tray>', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('art-tray');
    el.manifest = M;
    document.body.appendChild(el);
  });

  it('shows the whole manifest before any search', () => {
    expect(el.querySelectorAll('[data-art-id]').length).toBe(2);
  });

  it('filters results as the query changes', () => {
    const input = el.querySelector('[data-role=art-query]');
    input.value = 'detective';
    input.dispatchEvent(new Event('input'));
    const ids = [...el.querySelectorAll('[data-art-id]')].map((n) => n.dataset.artId);
    expect(ids).toEqual(['a']);
  });

  it('emits show-prop when a thumbnail is clicked', () => {
    let detail = null;
    el.addEventListener('show-prop', (e) => { detail = e.detail; });
    el.querySelector('[data-art-id="b"]').click();
    expect(detail).toEqual({ src: '/art/b.png', label: 'Neon street' });
  });

  it('escapes malicious manifest label/src in rendered thumbnails', () => {
    document.body.innerHTML = '';
    const bad = document.createElement('art-tray');
    bad.manifest = [{ id: 'x', src: '/art/x.png', label: 'evil" onerror="boom', tags: ['x'] }];
    document.body.appendChild(bad);
    const img = bad.querySelector('[data-art-id="x"] img');
    expect(img).not.toBe(null);
    expect(img.hasAttribute('onerror')).toBe(false);       // attribute not injected
    expect(img.getAttribute('alt')).toBe('evil" onerror="boom'); // literal value, escaped then parsed back
  });
});
