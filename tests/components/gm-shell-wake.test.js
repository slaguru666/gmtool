import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/gm-shell.js';
import { createWakeLock } from '../../src/core/wake-lock.js';
import afterimage from '../../src/scenarios/afterimage.js';

function mockNav() {
  const requests = [];
  return {
    requests,
    wakeLock: { request: async () => { const s = { release: async () => {}, addEventListener() {} }; requests.push(s); return s; } },
  };
}

describe('<gm-shell> wake-lock', () => {
  let el, nav;
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    el = document.createElement('gm-shell');
    el.now = () => 0;
    document.body.appendChild(el);
    nav = mockNav();
    el.wakeLock = createWakeLock({ navigator: nav, documentRef: { visibilityState: 'visible', addEventListener() {} } });
    el.loadScenario(afterimage);
  });

  it('toggling the wake chip acquires the lock and lights the chip', async () => {
    const rail = el.querySelector('director-rail');
    expect(rail.querySelector('[data-role=toggle-wake]').classList.contains('on')).toBe(false);

    await el.onToggleWake();  // await the full async toggle + refresh

    expect(nav.requests.length).toBe(1);
    expect(el.wakeLock.isActive()).toBe(true);
    expect(el.querySelector('director-rail [data-role=toggle-wake]').getAttribute('aria-pressed')).toBe('true');
  });

  it('toggling again releases the lock and unlights the chip', async () => {
    await el.onToggleWake();
    await el.onToggleWake();
    expect(el.wakeLock.isActive()).toBe(false);
    expect(el.querySelector('director-rail [data-role=toggle-wake]').classList.contains('on')).toBe(false);
  });

  it('the rail exposes a wake chip that emits toggle-wake', () => {
    const rail = el.querySelector('director-rail');
    let fired = 0;
    el.addEventListener('toggle-wake', () => fired++);
    rail.querySelector('[data-role=toggle-wake]').click();
    expect(fired).toBe(1);
  });
});
