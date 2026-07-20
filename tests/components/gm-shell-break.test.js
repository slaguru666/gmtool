import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/gm-shell.js';
import afterimage from '../../src/scenarios/afterimage.js';

describe('<gm-shell> break timer', () => {
  let el, t;
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    t = 0;
    el = document.createElement('gm-shell');
    el.now = () => t;
    document.body.appendChild(el);
    el.loadScenario(afterimage);
  });

  it('mounts a hidden break-timer, revealed by open-tool break', () => {
    expect(el.querySelector('break-timer').hidden).toBe(true);
    el.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'break' }, bubbles: true }));
    expect(el.querySelector('break-timer').hidden).toBe(false);
  });

  it('a break pauses the clock so break time never poisons drift', () => {
    el.startSession();                 // t=0
    t = 30 * 60000;                    // 30 min of play
    expect(Math.round(el.elapsedMs() / 60000)).toBe(30);

    el.dispatchEvent(new CustomEvent('start-break', { detail: { minutes: 10 }, bubbles: true }));
    expect(el.querySelector('director-rail [data-role=break-badge]')).not.toBe(null);
    expect(el.querySelector('break-timer').state.onBreak).toBe(true);

    t = 50 * 60000;                    // 20 min of wall-clock break
    expect(Math.round(el.elapsedMs() / 60000)).toBe(30); // frozen while on break

    el.dispatchEvent(new CustomEvent('end-break', { bubbles: true }));
    expect(el.querySelector('director-rail [data-role=break-badge]')).toBe(null);

    t = 60 * 60000;                    // 10 more min of play after the break
    expect(Math.round(el.elapsedMs() / 60000)).toBe(40); // 40 min play, break excluded
  });

  it('persists the break so the paused clock survives a reload', () => {
    el.startSession();
    t = 10 * 60000;
    el.dispatchEvent(new CustomEvent('start-break', { detail: { minutes: 5 }, bubbles: true }));
    expect(JSON.parse(localStorage.getItem('gmd.afterimage.break'))).toBe(el.breakEndsAt);

    // simulate reload
    document.body.innerHTML = '';
    const el2 = document.createElement('gm-shell');
    el2.now = () => t;
    document.body.appendChild(el2);
    el2.loadScenario(afterimage);
    expect(el2.querySelector('break-timer').state.onBreak).toBe(true);
    expect(el2.querySelector('director-rail [data-role=break-badge]')).not.toBe(null);
  });

  it('ignores a start-break before the session has started', () => {
    el.dispatchEvent(new CustomEvent('start-break', { detail: { minutes: 10 }, bubbles: true }));
    expect(el.querySelector('break-timer').state.onBreak).toBe(false);
    expect(el.breakEndsAt).toBe(null);
  });

  it('the rail exposes a break chip that emits open-tool', () => {
    const rail = el.querySelector('director-rail');
    let tool = null;
    el.addEventListener('open-tool', (e) => { tool = e.detail.tool; });
    rail.querySelector('[data-role=open-break]').click();
    expect(tool).toBe('break');
  });
});
