// tests/components/director-rail.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/director-rail.js';
import afterimage from '../../src/scenarios/afterimage.js';

describe('<director-rail>', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('director-rail');
    document.body.appendChild(el);
  });

  it('shows the first beat and no drift before any stamp', () => {
    el.update({ scenario: afterimage, elapsedMs: 0, stamps: {} });
    expect(el.querySelector('[data-role=here]').textContent).toContain('The pier');
    expect(el.querySelector('.drift')).toBe(null);
    expect(el.querySelector('[data-role=clock]').textContent).toBe('0:00');
  });

  it('shows drift and the next hard trigger after a late stamp', () => {
    el.update({ scenario: afterimage, elapsedMs: 40 * 60000, stamps: { 'a1-open': 6 } });
    expect(el.querySelector('.drift').textContent).toBe('+6 behind');
    expect(el.querySelector('[data-role=next]').textContent).toContain('Door-cam');
  });

  it('emits "reached" when the button is clicked', () => {
    el.update({ scenario: afterimage, elapsedMs: 0, stamps: {} });
    let fired = 0;
    el.addEventListener('reached', () => fired++);
    el.querySelector('[data-role=reached]').click();
    expect(fired).toBe(1);
  });
});
