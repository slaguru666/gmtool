import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/parking-lot.js';

describe('<parking-lot>', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('parking-lot');
    document.body.appendChild(el);
  });

  it('shows an empty state with no notes', () => {
    expect(el.querySelector('[data-role=empty]')).not.toBe(null);
  });

  it('renders a note with its session timestamp', () => {
    el.notes = [{ at: 83 * 60000, text: 'circle back to the ledger' }];
    const note = el.querySelector('.pl-note');
    expect(note.querySelector('.pl-at').textContent).toBe('1:23');
    expect(note.querySelector('.pl-text').textContent).toBe('circle back to the ledger');
  });

  it('emits add-note with the trimmed text and clears on empty', () => {
    let detail = null;
    el.addEventListener('add-note', (e) => { detail = e.detail; });
    const input = el.querySelector('[data-role=input]');
    input.value = '   ask Priya about the editor  ';
    el.querySelector('[data-role=add]').click();
    expect(detail).toEqual({ text: 'ask Priya about the editor' });

    // empty / whitespace does not emit
    detail = null;
    input.value = '   ';
    el.querySelector('[data-role=add]').click();
    expect(detail).toBe(null);
  });

  it('adds on Enter', () => {
    let fired = 0;
    el.addEventListener('add-note', () => fired++);
    const input = el.querySelector('[data-role=input]');
    input.value = 'x';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(fired).toBe(1);
  });

  it('emits remove-note with the note index', () => {
    el.notes = [{ at: 0, text: 'a' }, { at: 0, text: 'b' }];
    let detail = null;
    el.addEventListener('remove-note', (e) => { detail = e.detail; });
    el.querySelectorAll('[data-role=del]')[1].click();
    expect(detail).toEqual({ index: 1 });
  });

  it('escapes author text', () => {
    el.notes = [{ at: 0, text: 'evil <b>tag</b>' }];
    expect(el.querySelector('.pl-note').innerHTML).not.toContain('<b>');
  });
});
