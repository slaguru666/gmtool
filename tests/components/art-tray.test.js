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

  it('escapes a query containing a quote (input does not break)', () => {
    const input = el.querySelector('[data-role=art-query]');
    input.value = 'rain " <x>';
    input.dispatchEvent(new Event('input'));
    expect(el.querySelector('[data-role=art-query]').value).toBe('rain " <x>');
  });
});
