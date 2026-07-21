import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/run-board.js';

const SCENARIO = {
  meta: { title: 'DEMO', slot: 'Fri · Slot 1', playMinutes: 210 },
  timeline: [
    { id: 'a', label: 'Opening', targetMin: 0 },
    { id: 'b', label: 'The market breaks', targetMin: 60, hardTrigger: true, cutHint: 'skip the tea' },
    { id: 'c', label: 'The reveal', targetMin: 120, hardTrigger: true },
    { id: 'd', label: 'Epilogue', targetMin: 200 },
  ],
};

describe('<run-board>', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('run-board');
    document.body.appendChild(el);
  });

  it('renders nothing without a scenario', () => {
    expect(el.innerHTML.trim()).toBe('');
  });

  it('renders a row per beat with target times and the scenario header', () => {
    el.update({ scenario: SCENARIO, elapsedMs: 0, stamps: {} });
    expect(el.querySelectorAll('[data-beat-id]').length).toBe(4);
    expect(el.querySelector('.rb-title').textContent).toBe('DEMO');
    expect(el.querySelector('[data-beat-id="b"] .rb-time').textContent).toBe('1:00');
    expect(el.querySelector('[data-beat-id="b"] .rb-hard')).not.toBe(null);
    expect(el.querySelector('[data-beat-id="b"] .rb-cut').textContent).toContain('skip the tea');
  });

  it('marks done beats with their stamped time and dims them', () => {
    el.update({ scenario: SCENARIO, elapsedMs: 90 * 60000, stamps: { a: 2, b: 58 } });
    const b = el.querySelector('[data-beat-id="b"]');
    expect(b.classList.contains('done')).toBe(true);
    expect(b.querySelector('.rb-mark').textContent).toContain('0:58');
  });

  it('highlights the next unreached beat as "next"', () => {
    el.update({ scenario: SCENARIO, elapsedMs: 90 * 60000, stamps: { a: 2, b: 58 } });
    const current = el.querySelector('.rb-beat.current');
    expect(current.dataset.beatId).toBe('c');           // first without a stamp
    expect(current.querySelector('.rb-mark').textContent).toContain('next');
    expect(el.querySelector('[data-beat-id="a"].current')).toBe(null);
  });

  it('shows drift in the header when behind/ahead', () => {
    // reached the opening 6 min late → behind
    el.update({ scenario: SCENARIO, elapsedMs: 6 * 60000, stamps: { a: 6 } });
    expect(el.querySelector('.rb-drift')).not.toBe(null);
  });

  it('escapes author text in labels', () => {
    el.update({ scenario: { meta: { title: 'x' }, timeline: [{ id: 'x', label: 'evil <b>', targetMin: 0 }] }, elapsedMs: 0, stamps: {} });
    expect(el.querySelector('[data-beat-id="x"]').innerHTML).not.toContain('<b>');
  });
});
