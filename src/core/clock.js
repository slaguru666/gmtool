export function initialClock() {
  return { startedAt: null, pausedAt: null, pausedAccumMs: 0 };
}

export function start(state, now) {
  if (state.startedAt != null) return state;
  return { startedAt: now, pausedAt: null, pausedAccumMs: 0 };
}

export function pause(state, now) {
  if (state.startedAt == null || state.pausedAt != null) return state;
  return { ...state, pausedAt: now };
}

export function resume(state, now) {
  if (state.pausedAt == null) return state;
  return { ...state, pausedAt: null, pausedAccumMs: state.pausedAccumMs + (now - state.pausedAt) };
}

export function elapsedMs(state, now) {
  if (state.startedAt == null) return 0;
  const end = state.pausedAt != null ? state.pausedAt : now;
  return Math.max(0, end - state.startedAt - state.pausedAccumMs);
}

export function isRunning(state) { return state.startedAt != null && state.pausedAt == null; }

export function isPaused(state) { return state.pausedAt != null; }
