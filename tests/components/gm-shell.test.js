import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/gm-shell.js';
import afterimage from '../../src/scenarios/afterimage.js';

describe('<gm-shell>', () => {
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

  it('mounts a director-rail for the loaded scenario', () => {
    expect(el.querySelector('director-rail')).not.toBe(null);
    expect(el.querySelector('director-rail [data-role=here]').textContent).toContain('The pier');
  });

  it('stamps the next beat on "reached" and persists it', () => {
    el.startSession();          // start at t=0
    t = 6 * 60000;              // 6 minutes later
    el.querySelector('[data-role=reached]').dispatchEvent(new CustomEvent('reached', { bubbles: true }));
    expect(el.stamps['a1-open']).toBeCloseTo(6, 5);
    const persisted = JSON.parse(localStorage.getItem('gmd.afterimage.stamps'));
    expect(persisted['a1-open']).toBeCloseTo(6, 5);
    // rail now shows the reached beat as current
    expect(el.querySelector('director-rail [data-role=here]').textContent).toContain('The pier');
  });

  it('reveals the dice tray on open-tool', () => {
    expect(el.querySelector('dice-tray').hidden).toBe(true);
    el.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'dice' }, bubbles: true }));
    expect(el.querySelector('dice-tray').hidden).toBe(false);
  });
});
