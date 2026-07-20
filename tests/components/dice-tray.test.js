import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/dice-tray.js';

function seq(values) { let i = 0; return () => values[i++ % values.length]; }

describe('<dice-tray>', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('dice-tray');
    el.systemId = 'year-zero';
    document.body.appendChild(el);
  });

  it('renders the polyhedral picker', () => {
    expect(el.querySelector('[data-sides="20"]')).not.toBe(null);
    expect(el.querySelector('[data-sides="4"]')).not.toBe(null);
  });

  it('rolls, interprets via the rule-pack, and reports successes', () => {
    el.sides = 8; el.count = 3;
    el.rng = seq([0.9, 0.0, 0.7]); // d8 -> 8, 1, 6  => 2 successes, 1 one
    let detail = null;
    el.addEventListener('rolled', (e) => { detail = e.detail; });
    el.roll();
    expect(el.last.verdict.successes).toBe(2);
    expect(el.last.verdict.ones).toBe(1);
    expect(detail.verdict.successes).toBe(2);
    expect(el.querySelector('[data-role=verdict]').textContent).toContain('2 success');
  });

  it('changes die type when a picker button is clicked', () => {
    el.querySelector('[data-sides="20"]').click();
    expect(el.sides).toBe(20);
  });
});
