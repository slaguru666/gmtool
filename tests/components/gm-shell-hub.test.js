import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/gm-shell.js';
import continuum from '../../src/con/continuum-2026.js';

describe('<gm-shell> convention hub', () => {
  let el;
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    el = document.createElement('gm-shell');
    el.now = () => 0;
    document.body.appendChild(el);
    el.loadCon(continuum);
  });

  it('boots into the hub with the rail and stage hidden', () => {
    expect(el.querySelector('con-hub').hidden).toBe(false);
    expect(el.querySelector('director-rail').hidden).toBe(true);
    expect(el.querySelector('.stage').hidden).toBe(true);
    expect(el.querySelector('con-hub').con).toBe(continuum);
  });

  it('deep-links a ported slot into a session and hides the hub', () => {
    el.dispatchEvent(new CustomEvent('open-scenario', { detail: { scenarioId: 'afterimage' }, bubbles: true }));
    expect(el.scenario.meta.id).toBe('afterimage');
    expect(el.querySelector('con-hub').hidden).toBe(true);
    expect(el.querySelector('director-rail').hidden).toBe(false);
    expect(el.querySelector('.stage').hidden).toBe(false);
    expect(el.querySelector('director-rail [data-role=here]').textContent).toContain('The pier');
  });

  it('ignores open-scenario for an unknown / unported slot', () => {
    el.dispatchEvent(new CustomEvent('open-scenario', { detail: { scenarioId: 'not-ported' }, bubbles: true }));
    expect(el.scenario).toBe(null);
    expect(el.querySelector('con-hub').hidden).toBe(false);
  });

  it('the rail hub chip emits open-hub, returning to the hub', () => {
    el.dispatchEvent(new CustomEvent('open-scenario', { detail: { scenarioId: 'afterimage' }, bubbles: true }));
    const rail = el.querySelector('director-rail');
    let fired = 0;
    el.addEventListener('open-hub', () => fired++);
    rail.querySelector('[data-role=open-hub]').click();
    expect(fired).toBe(1);
    expect(el.querySelector('con-hub').hidden).toBe(false);
    expect(rail.hidden).toBe(true);
  });
});
