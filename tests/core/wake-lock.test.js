import { describe, it, expect } from 'vitest';
import { createWakeLock } from '../../src/core/wake-lock.js';

function mockNav() {
  const requests = [];
  return {
    requests,
    wakeLock: {
      request: async () => {
        let onRelease = null;
        const s = {
          released: false,
          release: async () => { s.released = true; onRelease?.(); },
          addEventListener: (ev, h) => { if (ev === 'release') onRelease = h; },
        };
        requests.push(s);
        return s;
      },
    },
  };
}
const mockDoc = () => ({ visibilityState: 'visible', addEventListener() {} });

describe('createWakeLock', () => {
  it('reports supported when the API is present', () => {
    expect(createWakeLock({ navigator: mockNav(), documentRef: mockDoc() }).supported).toBe(true);
    expect(createWakeLock({ navigator: {}, documentRef: mockDoc() }).supported).toBe(false);
  });

  it('acquires a lock on enable and releases it on disable', async () => {
    const nav = mockNav();
    const wl = createWakeLock({ navigator: nav, documentRef: mockDoc() });
    await wl.enable();
    expect(wl.isActive()).toBe(true);
    expect(nav.requests.length).toBe(1);
    await wl.disable();
    expect(wl.isActive()).toBe(false);
    expect(nav.requests[0].released).toBe(true);
  });

  it('toggles between states and returns the new state', async () => {
    const wl = createWakeLock({ navigator: mockNav(), documentRef: mockDoc() });
    expect(await wl.toggle()).toBe(true);
    expect(await wl.toggle()).toBe(false);
  });

  it('does not double-acquire while already held', async () => {
    const nav = mockNav();
    const wl = createWakeLock({ navigator: nav, documentRef: mockDoc() });
    await wl.enable();
    await wl.enable();
    expect(nav.requests.length).toBe(1);
  });

  it('is a graceful no-op when unsupported', async () => {
    const wl = createWakeLock({ navigator: {}, documentRef: mockDoc() });
    await wl.enable();
    expect(wl.isActive()).toBe(false);
    expect(await wl.toggle()).toBe(false);
  });

  it('re-acquires when the tab becomes visible again after the lock dropped', async () => {
    const nav = mockNav();
    let handler = null;
    const doc = { visibilityState: 'visible', addEventListener: (_e, h) => { handler = h; } };
    const wl = createWakeLock({ navigator: nav, documentRef: doc });
    await wl.enable();
    expect(nav.requests.length).toBe(1);
    await nav.requests[0].release();   // browser drops the lock on hide → sentinel cleared
    handler();                          // visibilitychange back to visible
    await Promise.resolve();            // let the async acquire settle
    expect(nav.requests.length).toBe(2);
    expect(wl.isActive()).toBe(true);
  });
});
