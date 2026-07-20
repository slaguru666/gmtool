// tests/components/clue-net.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/clue-net.js';

const CLUES = [
  { id: 'c1', label: 'Door-cam still', essential: true, fallback: 'Radio names the time' },
  { id: 'c2', label: 'Colour detail', essential: false },
];

describe('<clue-net>', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('clue-net');
    document.body.appendChild(el);
  });

  it('shows an empty state with no clues', () => {
    expect(el.querySelector('[data-role=empty]')).not.toBe(null);
  });

  it('renders a row per clue and a not-yet-solvable banner', () => {
    el.clues = CLUES;
    el.revealed = [];
    expect(el.querySelectorAll('[data-clue-id]').length).toBe(2);
    expect(el.querySelector('[data-role=solvable]').textContent).toContain('1 essential');
    // the missing essential shows its fallback
    expect(el.querySelector('[data-clue-id="c1"] .clue-fallback').textContent).toContain('Radio names the time');
  });

  it('flips to solvable once the essential clue is revealed', () => {
    el.clues = CLUES;
    el.revealed = ['c1'];
    expect(el.querySelector('[data-role=solvable]').textContent).toContain('Solvable');
    // revealed essential no longer shows a fallback prompt
    expect(el.querySelector('[data-clue-id="c1"] .clue-fallback')).toBe(null);
  });

  it('emits toggle-clue when a reveal toggle is clicked', () => {
    el.clues = CLUES; el.revealed = [];
    let detail = null;
    el.addEventListener('toggle-clue', (e) => { detail = e.detail; });
    el.querySelector('[data-clue-id="c1"] [data-role=toggle]').click();
    expect(detail).toEqual({ id: 'c1' });
  });

  it('escapes author text', () => {
    el.clues = [{ id: 'x', label: 'evil" <b>', essential: true, fallback: 'fb" <i>' }];
    el.revealed = [];
    const row = el.querySelector('[data-clue-id="x"]');
    expect(row.innerHTML).not.toContain('<b>');
    expect(row.querySelector('.clue-fallback').innerHTML).not.toContain('<i>');
  });
});
