import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/break-timer.js';

describe('<break-timer>', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('break-timer');
    document.body.appendChild(el);
  });

  it('offers duration pills and a start button when not on break', () => {
    expect(el.querySelector('[data-role=durs]')).not.toBe(null);
    expect(el.querySelector('[data-role=start]')).not.toBe(null);
    expect(el.querySelector('[data-role=end]')).toBe(null);
  });

  it('emits start-break with the selected duration', () => {
    let detail = null;
    el.addEventListener('start-break', (e) => { detail = e.detail; });
    el.querySelector('[data-min="15"]').click();  // select 15m
    el.querySelector('[data-role=start]').click();
    expect(detail).toEqual({ minutes: 15 });
  });

  it('defaults to a 10-minute break', () => {
    let detail = null;
    el.addEventListener('start-break', (e) => { detail = e.detail; });
    el.querySelector('[data-role=start]').click();
    expect(detail).toEqual({ minutes: 10 });
  });

  it('shows the countdown and an end button while on break', () => {
    el.state = { onBreak: true, remainingMs: 7 * 60000 + 5 * 1000 };
    expect(el.querySelector('[data-role=durs]')).toBe(null);
    expect(el.querySelector('[data-role=status]').textContent).toBe('Back in 7:05');
    expect(el.querySelector('[data-role=end]')).not.toBe(null);
  });

  it('shows an overrun once the break runs over', () => {
    el.state = { onBreak: true, remainingMs: -90 * 1000 };
    const status = el.querySelector('[data-role=status]');
    expect(status.classList.contains('over')).toBe(true);
    expect(status.textContent).toContain('Over by 1:30');
  });

  it('emits end-break when ending', () => {
    el.state = { onBreak: true, remainingMs: 60000 };
    let fired = 0;
    el.addEventListener('end-break', () => fired++);
    el.querySelector('[data-role=end]').click();
    expect(fired).toBe(1);
  });
});
