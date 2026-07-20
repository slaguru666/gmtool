// Screen Wake Lock controller. Keeps the tablet awake while enabled and
// re-acquires the lock when the tab returns to the foreground (browsers drop it
// on hide). Degrades gracefully: on platforms without the API, `supported` is
// false and enable() is a no-op, so the toggle never makes a false promise.
// navigator/document are injectable for testing.
export function createWakeLock({
  navigator: nav = (typeof navigator !== 'undefined' ? navigator : undefined),
  documentRef = (typeof document !== 'undefined' ? document : undefined),
} = {}) {
  let sentinel = null;
  let wanted = false;
  const supported = !!(nav && nav.wakeLock && typeof nav.wakeLock.request === 'function');

  async function acquire() {
    if (!supported || !wanted || sentinel) return;
    try {
      sentinel = await nav.wakeLock.request('screen');
      sentinel.addEventListener?.('release', () => { sentinel = null; });
    } catch { sentinel = null; }
  }
  async function release() {
    if (!sentinel) return;
    try { await sentinel.release(); } catch { /* already gone */ }
    sentinel = null;
  }
  if (documentRef?.addEventListener) {
    documentRef.addEventListener('visibilitychange', () => {
      if (wanted && documentRef.visibilityState === 'visible') acquire();
    });
  }

  return {
    supported,
    isActive: () => wanted,
    async enable() { if (!supported) return; wanted = true; await acquire(); },
    async disable() { wanted = false; await release(); },
    async toggle() { if (wanted) await this.disable(); else await this.enable(); return wanted; },
  };
}
