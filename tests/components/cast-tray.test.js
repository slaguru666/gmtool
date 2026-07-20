import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/cast-tray.js';

const CAST = [
  { id: 'a', name: 'MARY FLETCHER', kind: 'npc', note: 'Innkeeper; saw the watchers', secret: 'She saw Crowe sew the pendant' },
  { id: 'b', name: 'DANNY TATE', kind: 'npc', note: 'Stable boy, 14' },
];

describe('<cast-tray>', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('cast-tray');
    document.body.appendChild(el);
  });

  it('shows an empty state with no cast', () => {
    expect(el.querySelector('[data-role=empty]')).not.toBe(null);
  });

  it('renders a row per NPC with name and note', () => {
    el.cast = CAST;
    expect(el.querySelectorAll('[data-cast-id]').length).toBe(2);
    const mary = el.querySelector('[data-cast-id="a"]');
    expect(mary.querySelector('.cast-name').textContent).toContain('MARY FLETCHER');
    expect(mary.querySelector('.cast-note').textContent).toContain('Innkeeper');
  });

  it('keeps the secret hidden until revealed, then toggles it', () => {
    el.cast = CAST;
    const mary = () => el.querySelector('[data-cast-id="a"]');
    expect(mary().querySelector('[data-role=secret]')).toBe(null);
    mary().querySelector('[data-role=reveal]').click();
    expect(el.querySelector('[data-cast-id="a"] [data-role=secret]').textContent).toContain('Crowe sew');
    // toggling again hides it
    el.querySelector('[data-cast-id="a"] [data-role=reveal]').click();
    expect(el.querySelector('[data-cast-id="a"] [data-role=secret]')).toBe(null);
  });

  it('shows no reveal button for an NPC without a secret', () => {
    el.cast = CAST;
    expect(el.querySelector('[data-cast-id="b"] [data-role=reveal]')).toBe(null);
  });

  it('resets revealed secrets when the cast changes', () => {
    el.cast = CAST;
    el.querySelector('[data-cast-id="a"] [data-role=reveal]').click();
    el.cast = CAST; // reload
    expect(el.querySelector('[data-cast-id="a"] [data-role=secret]')).toBe(null);
  });

  it('escapes author text', () => {
    el.cast = [{ id: 'x', name: 'evil <b>', kind: 'npc', note: 'n" <i>', secret: 's" <u>' }];
    el.querySelector('[data-cast-id="x"] [data-role=reveal]').click();
    const row = el.querySelector('[data-cast-id="x"]');
    expect(row.innerHTML).not.toContain('<b>');
    expect(row.innerHTML).not.toContain('<i>');
    expect(row.innerHTML).not.toContain('<u>');
  });
});
