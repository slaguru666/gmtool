# The Director — Slice 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the offline-first shell + always-on Director Rail + scenario data model + one animated dice engine (Year-Zero rule-pack), proven end-to-end against the AFTERIMAGE pilot scenario.

**Architecture:** Vanilla ES-module Web Components over a thin core of pure-logic modules (persistence, session clock, timeline/drift, dice). Components are dumb renderers that emit events; all testable logic lives in `src/core` and `src/dice` with injected `now`/`rng` for determinism. Vite builds a static PWA; a hand-written service worker precaches the shell for offline launch.

**Tech Stack:** JavaScript (ES modules, no TypeScript), Web Components (custom elements, light DOM), Vite (dev/build), Vitest + jsdom (tests), hand-written service worker + web manifest for PWA/offline.

## Global Constraints

- **Offline-first:** app must fully function with no server and no network. Network features are out of Slice 1.
- **No runtime framework:** custom elements only; the only deps are dev tools (vite, vitest, jsdom).
- **Determinism in logic:** no `Date.now()` / `Math.random()` inside core logic — callers inject `now` (ms) and `rng` (`() => [0,1)`).
- **Persistence namespace:** all localStorage keys are `gmd.<namespace>.<key>`; scenario state uses namespace = `meta.id`.
- **Timeline units:** `targetMin` is minutes after the GM taps Start. Drift is `stamp − targetMin`; positive = behind.
- **Test env:** Vitest `environment: 'jsdom'`. Custom elements use light DOM (no shadow root) for styling and test simplicity.
- **Node:** ≥ 18.

---

### Task 1: Project scaffold + test harness

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`
- Create: `tests/smoke.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `npm test`, `npm run dev`, `npm run build` scripts; jsdom test environment.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "gm-director",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "jsdom": "^24.0.0",
    "vite": "^5.2.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Write `vite.config.js`**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
  },
});
```

- [ ] **Step 3: Write `index.html` (mount point)**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>The Director</title>
  </head>
  <body>
    <gm-shell></gm-shell>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Write `src/main.js` (placeholder boot)**

```js
// Boot entry. Component registration is added in later tasks.
export const APP = 'the-director';
```

- [ ] **Step 5: Write the smoke test**

```js
// tests/smoke.test.js
import { describe, it, expect } from 'vitest';
import { APP } from '../src/main.js';

describe('scaffold', () => {
  it('boots and exposes the app id', () => {
    expect(APP).toBe('the-director');
  });
  it('has a working DOM environment', () => {
    document.body.innerHTML = '<div id="x">hi</div>';
    expect(document.getElementById('x').textContent).toBe('hi');
  });
});
```

- [ ] **Step 6: Install and run**

Run: `npm install && npm test`
Expected: 2 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json vite.config.js index.html src/main.js tests/smoke.test.js
git commit -m "chore: scaffold Vite + Vitest PWA project"
```

---

### Task 2: Persistence store

**Files:**
- Create: `src/core/store.js`
- Test: `tests/core/store.test.js`

**Interfaces:**
- Produces: `createStore(namespace, storage = globalThis.localStorage)` → `{ get(key, fallback), set(key, value), remove(key), exportAll(), importAll(obj) }`. Keys are namespaced `gmd.<namespace>.<key>`; values are JSON-encoded.

- [ ] **Step 1: Write the failing test**

```js
// tests/core/store.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from '../../src/core/store.js';

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
    get length() { return map.size; },
  };
}

describe('createStore', () => {
  let s, storage;
  beforeEach(() => { storage = fakeStorage(); s = createStore('afterimage', storage); });

  it('round-trips JSON values under a namespaced key', () => {
    s.set('clock', { startedAt: 5 });
    expect(storage.getItem('gmd.afterimage.clock')).toBe('{"startedAt":5}');
    expect(s.get('clock')).toEqual({ startedAt: 5 });
  });

  it('returns fallback for missing/corrupt keys', () => {
    expect(s.get('missing', 42)).toBe(42);
    storage.setItem('gmd.afterimage.bad', '{not json');
    expect(s.get('bad', 'fb')).toBe('fb');
  });

  it('exports only its namespace and imports back', () => {
    s.set('a', 1);
    storage.setItem('gmd.other.z', '9');
    const dump = s.exportAll();
    expect(Object.keys(dump)).toEqual(['gmd.afterimage.a']);
    const s2 = createStore('afterimage', fakeStorage());
    s2.importAll(dump);
    expect(s2.get('a')).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/core/store.test.js`
Expected: FAIL — cannot find module `src/core/store.js`.

- [ ] **Step 3: Write minimal implementation**

```js
// src/core/store.js
const PREFIX = 'gmd';

export function createStore(namespace, storage = globalThis.localStorage) {
  const full = (key) => `${PREFIX}.${namespace}.${key}`;
  const nsPrefix = `${PREFIX}.${namespace}.`;
  return {
    get(key, fallback = null) {
      const raw = storage.getItem(full(key));
      if (raw == null) return fallback;
      try { return JSON.parse(raw); } catch { return fallback; }
    },
    set(key, value) { storage.setItem(full(key), JSON.stringify(value)); },
    remove(key) { storage.removeItem(full(key)); },
    exportAll() {
      const out = {};
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.startsWith(nsPrefix)) out[k] = storage.getItem(k);
      }
      return out;
    },
    importAll(obj) {
      for (const [k, v] of Object.entries(obj)) {
        if (k.startsWith(nsPrefix)) storage.setItem(k, v);
      }
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/core/store.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/store.js tests/core/store.test.js
git commit -m "feat: namespaced localStorage store with export/import"
```

---

### Task 3: Session clock (pure logic)

**Files:**
- Create: `src/core/clock.js`
- Test: `tests/core/clock.test.js`

**Interfaces:**
- Produces: `initialClock()` → state `{ startedAt, pausedAt, pausedAccumMs }`; `start(state, now)`, `pause(state, now)`, `resume(state, now)` → new state; `elapsedMs(state, now)` → number; `isRunning(state)`, `isPaused(state)` → boolean. `now` is milliseconds injected by the caller.

- [ ] **Step 1: Write the failing test**

```js
// tests/core/clock.test.js
import { describe, it, expect } from 'vitest';
import { initialClock, start, pause, resume, elapsedMs, isRunning, isPaused } from '../../src/core/clock.js';

describe('session clock', () => {
  it('reads zero before start', () => {
    const c = initialClock();
    expect(elapsedMs(c, 1000)).toBe(0);
    expect(isRunning(c)).toBe(false);
  });

  it('measures elapsed from start', () => {
    const c = start(initialClock(), 1000);
    expect(isRunning(c)).toBe(true);
    expect(elapsedMs(c, 61000)).toBe(60000); // 1 minute
  });

  it('freezes while paused and excludes paused time after resume', () => {
    let c = start(initialClock(), 0);
    c = pause(c, 60000);            // paused at 1:00
    expect(isPaused(c)).toBe(true);
    expect(elapsedMs(c, 120000)).toBe(60000); // frozen at 1:00 while paused
    c = resume(c, 180000);         // resumed after 2 min paused
    expect(elapsedMs(c, 240000)).toBe(120000); // 4 min wall − 2 min paused = 2 min
  });

  it('ignores double start', () => {
    const c = start(start(initialClock(), 100), 5000);
    expect(elapsedMs(c, 1100)).toBe(1000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/core/clock.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```js
// src/core/clock.js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/core/clock.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/clock.js tests/core/clock.test.js
git commit -m "feat: pure session clock with pause/resume"
```

---

### Task 4: Timeline analysis (drift + next hard trigger)

**Files:**
- Create: `src/core/timeline.js`
- Test: `tests/core/timeline.test.js`

**Interfaces:**
- Produces:
  - `sortedTimeline(timeline)` → new array sorted by `targetMin`.
  - `nextUnreachedBeat(timeline, stamps)` → first sorted beat whose `id` is not a key in `stamps`, or `null`.
  - `analyze(timeline, elapsedMin, stamps)` → `{ currentBeat, nextBeat, nextHardTrigger, minutesToNextHard, driftMin, cutHint }`. `stamps` maps `beatId → elapsedMinAtStamp`. `currentBeat` = last stamped beat (or `null`). `driftMin` = `stamps[currentBeat.id] − currentBeat.targetMin` (or `null`). `minutesToNextHard` = `nextHardTrigger.targetMin − elapsedMin` (or `null`). `cutHint` = `nextBeat?.cutHint ?? null`.

- [ ] **Step 1: Write the failing test**

```js
// tests/core/timeline.test.js
import { describe, it, expect } from 'vitest';
import { sortedTimeline, nextUnreachedBeat, analyze } from '../../src/core/timeline.js';

const T = [
  { id: 'a', act: 1, label: 'Open', targetMin: 0, hardTrigger: true },
  { id: 'b', act: 1, label: 'Parlor', targetMin: 35, cutHint: 'skip the tea' },
  { id: 'c', act: 2, label: 'Door-cam', targetMin: 120, hardTrigger: true },
];

describe('timeline analysis', () => {
  it('sorts by targetMin without mutating input', () => {
    const shuffled = [T[2], T[0], T[1]];
    expect(sortedTimeline(shuffled).map((b) => b.id)).toEqual(['a', 'b', 'c']);
    expect(shuffled[0].id).toBe('c');
  });

  it('finds the next unreached beat', () => {
    expect(nextUnreachedBeat(T, {}).id).toBe('a');
    expect(nextUnreachedBeat(T, { a: 0 }).id).toBe('b');
  });

  it('before any stamp: no current, next hard is the first hard beat', () => {
    const m = analyze(T, 5, {});
    expect(m.currentBeat).toBe(null);
    expect(m.nextBeat.id).toBe('a');
    expect(m.driftMin).toBe(null);
    expect(m.nextHardTrigger.id).toBe('a');
  });

  it('after stamping "a" late: drift is behind, next hard is "c"', () => {
    const m = analyze(T, 40, { a: 6 }); // reached Open at 6 min (target 0) => 6 behind
    expect(m.currentBeat.id).toBe('a');
    expect(m.driftMin).toBe(6);
    expect(m.nextBeat.id).toBe('b');
    expect(m.cutHint).toBe('skip the tea');
    expect(m.nextHardTrigger.id).toBe('c');
    expect(m.minutesToNextHard).toBe(80); // 120 - 40
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/core/timeline.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```js
// src/core/timeline.js
export function sortedTimeline(timeline) {
  return [...timeline].sort((a, b) => a.targetMin - b.targetMin);
}

export function nextUnreachedBeat(timeline, stamps) {
  const t = sortedTimeline(timeline);
  return t.find((b) => !(b.id in stamps)) || null;
}

export function analyze(timeline, elapsedMin, stamps) {
  const t = sortedTimeline(timeline);
  const reached = t.filter((b) => b.id in stamps);
  const currentBeat = reached.length ? reached[reached.length - 1] : null;
  const currentIndex = currentBeat ? t.findIndex((b) => b.id === currentBeat.id) : -1;
  const nextBeat = t[currentIndex + 1] || null;
  const nextHardTrigger = t.slice(currentIndex + 1).find((b) => b.hardTrigger) || null;
  const minutesToNextHard = nextHardTrigger ? nextHardTrigger.targetMin - elapsedMin : null;
  const driftMin = currentBeat ? stamps[currentBeat.id] - currentBeat.targetMin : null;
  return { currentBeat, nextBeat, nextHardTrigger, minutesToNextHard, driftMin, cutHint: nextBeat?.cutHint ?? null };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/core/timeline.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/timeline.js tests/core/timeline.test.js
git commit -m "feat: timeline drift + next-hard-trigger analysis"
```

---

### Task 5: Dice core (seedable roller)

**Files:**
- Create: `src/dice/roller.js`
- Test: `tests/dice/roller.test.js`

**Interfaces:**
- Produces:
  - `expandDice(diceSpecs)` — `[{ sides, count? }]` → flat `[{ sides }]`.
  - `rollDie(sides, rng)` → integer `1..sides`.
  - `rollPool(diceSpecs, rng)` → `{ results: [{ sides, value }], total }`. `rng` is `() => [0,1)`.

- [ ] **Step 1: Write the failing test**

```js
// tests/dice/roller.test.js
import { describe, it, expect } from 'vitest';
import { expandDice, rollDie, rollPool } from '../../src/dice/roller.js';

// deterministic rng that replays a fixed sequence
function seq(values) { let i = 0; return () => values[i++ % values.length]; }

describe('dice core', () => {
  it('expands count into individual dice', () => {
    expect(expandDice([{ sides: 8, count: 3 }])).toEqual([{ sides: 8 }, { sides: 8 }, { sides: 8 }]);
    expect(expandDice([{ sides: 6 }])).toEqual([{ sides: 6 }]);
  });

  it('maps rng to inclusive 1..sides', () => {
    expect(rollDie(8, () => 0)).toBe(1);
    expect(rollDie(8, () => 0.999)).toBe(8);
    expect(rollDie(6, () => 0.5)).toBe(4);
  });

  it('rolls a pool and totals it', () => {
    const rng = seq([0.9, 0.0, 0.7]); // d8 -> 8, 1, 6
    const { results, total } = rollPool([{ sides: 8, count: 3 }], rng);
    expect(results.map((r) => r.value)).toEqual([8, 1, 6]);
    expect(total).toBe(15);
    expect(results[0]).toEqual({ sides: 8, value: 8 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/dice/roller.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```js
// src/dice/roller.js
export function expandDice(diceSpecs) {
  const out = [];
  for (const d of diceSpecs) {
    const count = d.count ?? 1;
    for (let i = 0; i < count; i++) out.push({ sides: d.sides });
  }
  return out;
}

export function rollDie(sides, rng) {
  return Math.floor(rng() * sides) + 1;
}

export function rollPool(diceSpecs, rng) {
  const results = expandDice(diceSpecs).map((d) => ({ sides: d.sides, value: rollDie(d.sides, rng) }));
  const total = results.reduce((s, r) => s + r.value, 0);
  return { results, total };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/dice/roller.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/dice/roller.js tests/dice/roller.test.js
git commit -m "feat: seedable dice core with pools"
```

---

### Task 6: Year-Zero rule-pack + registry

**Files:**
- Create: `src/dice/rulepacks/year-zero.js`
- Create: `src/dice/rulepacks/index.js`
- Test: `tests/dice/year-zero.test.js`

**Interfaces:**
- Produces:
  - `yearZero` — `{ id: 'year-zero', label: 'Year-Zero', interpret(results) }` where `interpret([{ sides, value }])` → `{ successes, ones, canPush, isCritical }`. Rule: `value >= 10` → +2 successes; `value 6..9` → +1; `value === 1` → +1 one; `isCritical` = `successes >= 2`.
  - `getRulePack(id)` → pack or `null`; `registerRulePack(pack)` → void.

- [ ] **Step 1: Write the failing test**

```js
// tests/dice/year-zero.test.js
import { describe, it, expect } from 'vitest';
import { yearZero } from '../../src/dice/rulepacks/year-zero.js';
import { getRulePack, registerRulePack } from '../../src/dice/rulepacks/index.js';

describe('year-zero rule-pack', () => {
  it('counts 6-9 as one success and 10+ as two', () => {
    const v = yearZero.interpret([{ sides: 8, value: 8 }, { sides: 8, value: 4 }, { sides: 12, value: 11 }]);
    expect(v.successes).toBe(3); // 8 -> 1, 4 -> 0, 11 -> 2
    expect(v.isCritical).toBe(true);
  });

  it('reports ones for stress on a push', () => {
    const v = yearZero.interpret([{ sides: 6, value: 1 }, { sides: 6, value: 1 }, { sides: 6, value: 6 }]);
    expect(v.ones).toBe(2);
    expect(v.successes).toBe(1);
    expect(v.canPush).toBe(true);
  });

  it('is resolvable from the registry by id', () => {
    expect(getRulePack('year-zero')).toBe(yearZero);
    expect(getRulePack('nope')).toBe(null);
    const custom = { id: 'x', label: 'X', interpret: () => ({}) };
    registerRulePack(custom);
    expect(getRulePack('x')).toBe(custom);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/dice/year-zero.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the rule-pack**

```js
// src/dice/rulepacks/year-zero.js
export const yearZero = {
  id: 'year-zero',
  label: 'Year-Zero',
  interpret(results) {
    let successes = 0, ones = 0;
    for (const r of results) {
      if (r.value >= 10) successes += 2;
      else if (r.value >= 6) successes += 1;
      if (r.value === 1) ones += 1;
    }
    return { successes, ones, canPush: true, isCritical: successes >= 2 };
  },
};
```

- [ ] **Step 4: Write the registry**

```js
// src/dice/rulepacks/index.js
import { yearZero } from './year-zero.js';

const packs = new Map([[yearZero.id, yearZero]]);

export function getRulePack(id) { return packs.get(id) || null; }
export function registerRulePack(pack) { packs.set(pack.id, pack); }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/dice/year-zero.test.js`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/dice/rulepacks/ tests/dice/year-zero.test.js
git commit -m "feat: Year-Zero rule-pack + rule-pack registry"
```

---

### Task 7: Scenario validator + AFTERIMAGE pilot data

**Files:**
- Create: `src/core/scenario.js`
- Create: `src/scenarios/afterimage.js`
- Test: `tests/core/scenario.test.js`

**Interfaces:**
- Consumes: rule-pack ids from Task 6 (`meta.system` must resolve).
- Produces:
  - `validateScenario(s)` → array of error strings (empty = valid).
  - `afterimage` default export — the pilot scenario object conforming to the data model (`meta`, `timeline`, empty `clues`/`cast`/`props`).

- [ ] **Step 1: Write the failing test**

```js
// tests/core/scenario.test.js
import { describe, it, expect } from 'vitest';
import { validateScenario } from '../../src/core/scenario.js';
import afterimage from '../../src/scenarios/afterimage.js';
import { getRulePack } from '../../src/dice/rulepacks/index.js';

describe('scenario validation', () => {
  it('flags missing required fields', () => {
    expect(validateScenario(null)).toContain('scenario must be an object');
    const errs = validateScenario({ meta: {}, timeline: [] });
    expect(errs).toContain('meta.id required');
    expect(errs).toContain('meta.system required');
    expect(errs).toContain('timeline must be a non-empty array');
  });

  it('flags a beat missing targetMin', () => {
    const errs = validateScenario({ meta: { id: 'x', system: 'year-zero' }, timeline: [{ id: 'a' }] });
    expect(errs).toContain('timeline[0].targetMin must be a number');
  });

  it('accepts the AFTERIMAGE pilot and its system resolves', () => {
    expect(validateScenario(afterimage)).toEqual([]);
    expect(afterimage.meta.system).toBe('year-zero');
    expect(getRulePack(afterimage.meta.system)).not.toBe(null);
    expect(afterimage.timeline.length).toBeGreaterThan(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/core/scenario.test.js`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the validator**

```js
// src/core/scenario.js
export function validateScenario(s) {
  if (!s || typeof s !== 'object') return ['scenario must be an object'];
  const errors = [];
  if (!s.meta?.id) errors.push('meta.id required');
  if (!s.meta?.system) errors.push('meta.system required');
  if (!Array.isArray(s.timeline) || s.timeline.length === 0) {
    errors.push('timeline must be a non-empty array');
  } else {
    s.timeline.forEach((b, i) => {
      if (!b.id) errors.push(`timeline[${i}].id required`);
      if (typeof b.targetMin !== 'number') errors.push(`timeline[${i}].targetMin must be a number`);
    });
  }
  return errors;
}
```

- [ ] **Step 4: Write the pilot scenario**

```js
// src/scenarios/afterimage.js
export default {
  meta: { id: 'afterimage', title: 'AFTERIMAGE', system: 'year-zero', players: 4, playMinutes: 210, slot: 'Fri · Slot 2' },
  timeline: [
    { id: 'a1-open',    act: 1, label: 'The pier — the case lands', targetMin: 0,   hardTrigger: true },
    { id: 'a1-parlor',  act: 1, label: 'Parlor 88 interview',       targetMin: 35,  cutHint: 'Summarise the ledger; skip the tea ritual' },
    { id: 'a2-market',  act: 2, label: 'The Market',                targetMin: 90 },
    { id: 'a2-doorcam', act: 2, label: 'Door-cam reveal',           targetMin: 120, hardTrigger: true, notes: 'The pivot — do not let this slip past 2:15' },
    { id: 'a3-pier',    act: 3, label: 'Pier confrontation',        targetMin: 175, hardTrigger: true },
    { id: 'epilogue',   act: 4, label: 'Baseline / ambiguous end',  targetMin: 200 },
  ],
  clues: [],
  cast: [],
  props: [],
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/core/scenario.test.js`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/core/scenario.js src/scenarios/afterimage.js tests/core/scenario.test.js
git commit -m "feat: scenario validator + AFTERIMAGE pilot data"
```

---

### Task 8: Formatting helpers

**Files:**
- Create: `src/core/format.js`
- Test: `tests/core/format.test.js`

**Interfaces:**
- Produces: `fmtElapsed(ms)` → `"H:MM"` (or `"0:MM"` under an hour); `fmtDrift(driftMin)` → `''` when null, `'on time'` at 0, `'+N behind'` / `'N ahead'` otherwise (N = rounded absolute minutes).

- [ ] **Step 1: Write the failing test**

```js
// tests/core/format.test.js
import { describe, it, expect } from 'vitest';
import { fmtElapsed, fmtDrift } from '../../src/core/format.js';

describe('formatting', () => {
  it('formats elapsed time', () => {
    expect(fmtElapsed(0)).toBe('0:00');
    expect(fmtElapsed(65 * 1000)).toBe('0:01');
    expect(fmtElapsed(112 * 60 * 1000)).toBe('1:52');
  });
  it('formats drift with direction', () => {
    expect(fmtDrift(null)).toBe('');
    expect(fmtDrift(0)).toBe('on time');
    expect(fmtDrift(6)).toBe('+6 behind');
    expect(fmtDrift(-3)).toBe('3 ahead');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/core/format.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```js
// src/core/format.js
export function fmtElapsed(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

export function fmtDrift(driftMin) {
  if (driftMin == null) return '';
  const r = Math.round(driftMin);
  if (r === 0) return 'on time';
  return r > 0 ? `+${r} behind` : `${Math.abs(r)} ahead`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/core/format.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/format.js tests/core/format.test.js
git commit -m "feat: elapsed + drift formatting helpers"
```

---

### Task 9: `<director-rail>` component

**Files:**
- Create: `src/components/director-rail.js`
- Test: `tests/components/director-rail.test.js`

**Interfaces:**
- Consumes: `analyze` (Task 4), `fmtElapsed`/`fmtDrift` (Task 8).
- Produces: custom element `<director-rail>` with `update(patch)` merging `{ scenario, elapsedMs, stamps }` and re-rendering. Emits bubbling `CustomEvent('reached')` when the "Reached it" button is clicked, and `CustomEvent('open-tool', { detail: { tool: 'dice' } })` when the dice chip is clicked. Renders elements tagged `data-role="clock|here|next|reached|open-dice"`.

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/director-rail.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the component**

```js
// src/components/director-rail.js
import { analyze } from '../core/timeline.js';
import { fmtElapsed, fmtDrift } from '../core/format.js';

export class DirectorRail extends HTMLElement {
  constructor() {
    super();
    this._state = { scenario: null, elapsedMs: 0, stamps: {} };
  }
  connectedCallback() { this.render(); }
  update(patch) { Object.assign(this._state, patch); this.render(); }

  render() {
    const { scenario, elapsedMs, stamps } = this._state;
    if (!scenario) { this.innerHTML = `<div class="rail rail--empty">No scenario loaded</div>`; return; }
    const m = analyze(scenario.timeline, elapsedMs / 60000, stamps);
    const here = m.currentBeat ? m.currentBeat.label : (scenario.timeline[0]?.label ?? '—');
    const drift = fmtDrift(m.driftMin);
    const driftClass = m.driftMin > 0 ? 'behind' : 'ahead';
    const nh = m.nextHardTrigger;
    const nhText = nh ? `${nh.label} · ~${Math.max(0, Math.round(m.minutesToNextHard))}m` : '—';

    this.innerHTML = `
      <div class="rail">
        <div class="cell"><span class="k">Session</span><span class="v" data-role="clock">${fmtElapsed(elapsedMs)}</span></div>
        <div class="cell here"><span class="k">You are here</span>
          <span class="v"><span data-role="here">${here}</span>${drift ? ` <span class="drift ${driftClass}">${drift}</span>` : ''}</span></div>
        <div class="cell trig"><span class="k">Next hard trigger</span><span class="v" data-role="next">${nhText}</span></div>
        <button class="reached" data-role="reached">✓ Reached it</button>
        <button class="tray-btn" data-role="open-dice" aria-label="Dice">🎲</button>
      </div>`;

    this.querySelector('[data-role=reached]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('reached', { bubbles: true }));
    });
    this.querySelector('[data-role=open-dice]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'dice' }, bubbles: true }));
    });
  }
}
customElements.define('director-rail', DirectorRail);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/director-rail.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/director-rail.js tests/components/director-rail.test.js
git commit -m "feat: <director-rail> pacing component"
```

---

### Task 10: `<dice-tray>` component

**Files:**
- Create: `src/components/dice-tray.js`
- Test: `tests/components/dice-tray.test.js`

**Interfaces:**
- Consumes: `rollPool` (Task 5), `getRulePack` (Task 6).
- Produces: custom element `<dice-tray>` with settable props `systemId` (string), `sides` (number, default 8), `count` (number, default 3), `rng` (default `Math.random`). Method `roll()` rolls the pool, interprets via the system's rule-pack, stores `this.last = { results, total, verdict }`, re-renders, and emits `CustomEvent('rolled', { detail: this.last })`. Picker buttons tagged `data-sides="N"` set `sides`; button `data-role="roll"` calls `roll()`. Verdict text is in `[data-role="verdict"]`.

- [ ] **Step 1: Write the failing test**

```js
// tests/components/dice-tray.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/dice-tray.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the component**

```js
// src/components/dice-tray.js
import { rollPool } from '../dice/roller.js';
import { getRulePack } from '../dice/rulepacks/index.js';

const DICE = [4, 6, 8, 10, 12, 20, 100];

export class DiceTray extends HTMLElement {
  constructor() {
    super();
    this._sides = 8;
    this._count = 3;
    this._systemId = 'year-zero';
    this.rng = Math.random;
    this.last = null;
  }
  get sides() { return this._sides; }
  set sides(v) { this._sides = Number(v); this.render(); }
  get count() { return this._count; }
  set count(v) { this._count = Number(v); }
  set systemId(v) { this._systemId = v; }
  get systemId() { return this._systemId; }

  connectedCallback() { this.render(); }

  roll() {
    const { results, total } = rollPool([{ sides: this._sides, count: this._count }], this.rng);
    const pack = getRulePack(this._systemId);
    const verdict = pack ? pack.interpret(results) : null;
    this.last = { results, total, verdict };
    this.render();
    this.dispatchEvent(new CustomEvent('rolled', { detail: this.last, bubbles: true }));
  }

  render() {
    const picker = DICE.map((n) =>
      `<button class="die ${n === this._sides ? 'sel' : ''}" data-sides="${n}">d${n}</button>`).join('');
    const felt = this.last
      ? this.last.results.map((r) => `<span class="rolled" data-value="${r.value}">${r.value}</span>`).join('')
      : '<span class="hint">Tap Roll</span>';
    const verdict = this.last?.verdict
      ? `${this.last.verdict.successes} success${this.last.verdict.successes === 1 ? '' : 'es'}` +
        (this.last.verdict.ones ? ` · ${this.last.verdict.ones} stress` : '')
      : '';

    this.innerHTML = `
      <div class="dice-tray">
        <div class="picker">${picker}</div>
        <div class="felt">${felt}</div>
        <div class="verdict" data-role="verdict">${verdict}</div>
        <button class="roll" data-role="roll">Roll</button>
      </div>`;

    this.querySelectorAll('[data-sides]').forEach((b) =>
      b.addEventListener('click', () => { this.sides = Number(b.dataset.sides); }));
    this.querySelector('[data-role=roll]').addEventListener('click', () => this.roll());
  }
}
customElements.define('dice-tray', DiceTray);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/dice-tray.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/dice-tray.js tests/components/dice-tray.test.js
git commit -m "feat: <dice-tray> roller wired to rule-packs"
```

---

### Task 11: `<gm-shell>` root + wiring + styles

**Files:**
- Create: `src/components/gm-shell.js`
- Create: `src/styles.css`
- Modify: `src/main.js`
- Modify: `index.html`
- Test: `tests/components/gm-shell.test.js`

**Interfaces:**
- Consumes: `createStore` (Task 2), clock fns (Task 3), `nextUnreachedBeat` (Task 4), `<director-rail>` (Task 9), `<dice-tray>` (Task 10), `afterimage` (Task 7).
- Produces: custom element `<gm-shell>` that owns `store`, `clockState`, `stamps`, and `scenario`. Settable `now` provider (default `() => Date.now()`) for tests. Method `loadScenario(scenario)`; `startSession()`; on `reached` event it stamps `nextUnreachedBeat` with the current elapsed minutes, persists `stamps` + `clockState` to the store, and refreshes the rail. On `open-tool` it toggles the dice tray's visibility.

- [ ] **Step 1: Write the failing test**

```js
// tests/components/gm-shell.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/gm-shell.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the shell component**

```js
// src/components/gm-shell.js
import { createStore } from '../core/store.js';
import { initialClock, start, elapsedMs } from '../core/clock.js';
import { nextUnreachedBeat } from '../core/timeline.js';
import './director-rail.js';
import './dice-tray.js';

export class GmShell extends HTMLElement {
  constructor() {
    super();
    this.now = () => Date.now();
    this.scenario = null;
    this.store = null;
    this.clockState = initialClock();
    this.stamps = {};
    this._tick = null;
  }

  connectedCallback() {
    this.innerHTML = `
      <director-rail></director-rail>
      <main class="stage"><dice-tray hidden></dice-tray></main>`;
    this.addEventListener('reached', () => this.onReached());
    this.addEventListener('open-tool', (e) => this.onOpenTool(e));
  }

  loadScenario(scenario) {
    this.scenario = scenario;
    this.store = createStore(scenario.meta.id);
    this.clockState = this.store.get('clock', initialClock());
    this.stamps = this.store.get('stamps', {});
    this.querySelector('dice-tray').systemId = scenario.meta.system;
    this.refresh();
  }

  startSession() {
    this.clockState = start(this.clockState, this.now());
    this.store.set('clock', this.clockState);
    if (!this._tick) this._tick = setInterval(() => this.refresh(), 1000);
    this.refresh();
  }

  elapsedMs() { return elapsedMs(this.clockState, this.now()); }

  onReached() {
    const beat = nextUnreachedBeat(this.scenario.timeline, this.stamps);
    if (!beat) return;
    this.stamps = { ...this.stamps, [beat.id]: this.elapsedMs() / 60000 };
    this.store.set('stamps', this.stamps);
    this.refresh();
  }

  onOpenTool(e) {
    if (e.detail?.tool === 'dice') {
      const tray = this.querySelector('dice-tray');
      tray.hidden = !tray.hidden;
    }
  }

  refresh() {
    this.querySelector('director-rail').update({
      scenario: this.scenario,
      elapsedMs: this.elapsedMs(),
      stamps: this.stamps,
    });
  }
}
customElements.define('gm-shell', GmShell);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/gm-shell.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Write `src/styles.css` (rail + dice visual language from the mockups)**

```css
:root { color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: #0b0e13; color: #e7eef6; }
gm-shell { display: block; }

.rail { display: flex; align-items: stretch; height: 64px; background: linear-gradient(180deg,#12171f,#0d1117);
  border-bottom: 1px solid #263041; }
.rail .cell { padding: 7px 14px; display: flex; flex-direction: column; justify-content: center; border-right: 1px solid #1e2733; }
.rail .here { flex: 1; }
.rail .k { font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: #6b7a8d; }
.rail .v { font-size: 15px; font-weight: 600; }
.rail .trig .v { color: #ffd479; }
.drift { margin-left: 6px; padding: 1px 7px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.drift.behind { background: #4a1f1f; color: #ff9c9c; }
.drift.ahead { background: #1f3a2a; color: #9cffc4; }
.reached { border: none; padding: 0 18px; background: #1c8a5a; color: #eafff4; font-weight: 700; font-size: 14px; }
.tray-btn { border: none; width: 60px; background: #182130; color: #cfe0f0; font-size: 20px; }

.stage { position: relative; min-height: calc(100vh - 64px); }
.dice-tray { position: absolute; top: 0; left: 0; right: 0; background: #0f141b; border-bottom: 1px solid #2b3644;
  padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.dice-tray[hidden] { display: none; }
.picker { display: flex; gap: 8px; flex-wrap: wrap; }
.die { width: 54px; height: 44px; border-radius: 9px; background: #161d27; border: 1px solid #2a3542; color: #c6d5e6; font-weight: 600; }
.die.sel { background: #17251c; border-color: #3aa06a; color: #c9f7dc; }
.felt { min-height: 90px; border-radius: 10px; background: radial-gradient(circle at 50% 40%,#16241c,#0e1712);
  border: 1px solid #24352a; display: flex; align-items: center; justify-content: center; gap: 18px; }
.rolled { width: 52px; height: 52px; border-radius: 10px; background: #e9e1d2; color: #2c2618;
  display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; }
.rolled:nth-child(2) { background: #b7c7d6; } .rolled:nth-child(3) { background: #e7c99a; }
.verdict { font-weight: 700; color: #ffd479; min-height: 20px; }
.roll { border: none; padding: 12px; border-radius: 9px; background: #1c8a5a; color: #eafff4; font-weight: 700; }
```

- [ ] **Step 6: Update `src/main.js` to boot the shell**

```js
// src/main.js
import './components/gm-shell.js';
import afterimage from './scenarios/afterimage.js';

export const APP = 'the-director';

if (typeof document !== 'undefined' && document.querySelector('gm-shell')) {
  customElements.whenDefined('gm-shell').then(() => {
    const shell = document.querySelector('gm-shell');
    shell.loadScenario(afterimage);
  });
}
```

- [ ] **Step 7: Link the stylesheet in `index.html`**

Add inside `<head>`:

```html
    <link rel="stylesheet" href="/src/styles.css" />
```

- [ ] **Step 8: Run the full test suite + manual visual check**

Run: `npm test`
Expected: all tests PASS.

Then run: `npm run dev`, open the served URL, and confirm manually:
- the rail shows Session `0:00`, "You are here: The pier — the case lands", next hard trigger "The pier … ~0m";
- tapping 🎲 reveals the dice tray; picking a die and tapping Roll shows dice + a success verdict.

- [ ] **Step 9: Commit**

```bash
git add src/components/gm-shell.js src/styles.css src/main.js index.html tests/components/gm-shell.test.js
git commit -m "feat: <gm-shell> wiring, styles, and AFTERIMAGE boot"
```

---

### Task 12: PWA — offline install (manifest + service worker)

**Files:**
- Create: `public/manifest.webmanifest`
- Create: `public/sw.js`
- Modify: `index.html`
- Modify: `src/main.js`
- Test: `tests/pwa.test.js`

**Interfaces:**
- Consumes: the built app shell.
- Produces: a linked web manifest + a registered service worker that precaches the shell for offline launch. `src/main.js` registers `/sw.js` when `navigator.serviceWorker` exists.

- [ ] **Step 1: Write the failing test**

```js
// tests/pwa.test.js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('PWA wiring', () => {
  it('links the manifest in index.html', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html).toContain('rel="manifest"');
    expect(html).toContain('manifest.webmanifest');
  });
  it('manifest declares an installable app', () => {
    const m = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
    expect(m.name).toBeTruthy();
    expect(m.display).toBe('standalone');
    expect(Array.isArray(m.icons)).toBe(true);
  });
  it('main.js registers the service worker', () => {
    const js = readFileSync('src/main.js', 'utf8');
    expect(js).toContain('serviceWorker');
    expect(js).toContain("register('/sw.js')");
  });
  it('service worker precaches the shell', () => {
    const sw = readFileSync('public/sw.js', 'utf8');
    expect(sw).toContain('addEventListener');
    expect(sw).toContain('caches');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pwa.test.js`
Expected: FAIL — files missing / strings absent.

- [ ] **Step 3: Write the manifest**

```json
{
  "name": "The Director",
  "short_name": "Director",
  "description": "Offline convention GM shell",
  "start_url": "/",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#0b0e13",
  "theme_color": "#0b0e13",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 4: Write the service worker**

```js
// public/sw.js
const CACHE = 'director-v1';
const SHELL = ['/', '/index.html', '/src/main.js', '/src/styles.css'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match('/index.html')))
  );
});
```

- [ ] **Step 5: Register the SW in `src/main.js`**

Append to `src/main.js`:

```js
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
```

- [ ] **Step 6: Link the manifest in `index.html`**

Add inside `<head>`:

```html
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" content="#0b0e13" />
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run tests/pwa.test.js`
Expected: PASS (4 tests).

- [ ] **Step 8: Manual offline verification**

Run: `npm run build && npm run preview`. In the browser DevTools → Application:
- confirm the manifest is detected and the app is installable;
- confirm the service worker activates;
- tick "Offline" in the Network tab and reload — the app still loads and the rail + dice work.

Note: add real `public/icons/icon-192.png` and `icon-512.png` before a real install (placeholder step — generate via existing art scripts). The app runs without them; only the install icon is affected.

- [ ] **Step 9: Commit**

```bash
git add public/manifest.webmanifest public/sw.js index.html src/main.js tests/pwa.test.js
git commit -m "feat: installable offline PWA (manifest + service worker)"
```

---

## Self-Review

**Spec coverage (§ of design doc → task):**
- §2 offline / no-server → Task 12 (SW + manifest); network features correctly out of Slice 1.
- §3 PWA + Web Components + no runtime framework → Tasks 1, 9–12.
- §3 component model (Shell / Rail / Tray / Dice engine / Scenario) → Tasks 11 / 9 / (10 + break-timer etc. deferred within tray shell) / 5–6 / 7.
- §4 scenario data model (relative-minute timeline, reserved sections, one system) → Tasks 7 (data + validator), 4 (consumes timeline).
- §5 Rail core (clock, you-are-here + drift, next hard trigger, Reached-it) → Tasks 3, 4, 8, 9, 11.
- §6 dice core + rule-packs, shaped/coloured dice, success ≠ colour → Tasks 5, 6, 10, 11 (styles).
- §9 persistence + export/import + SW precache → Tasks 2, 11, 12.

**Deferred by design (not gaps):** NPC generator (§7), Art generator (§8), the remaining tray tools (break timer, parking-lot note, jump/correct beat, wake-lock), additional rule-packs, and the clue safety-net are Slice 2+. The tray in Slice 1 ships with the Dice tool only; the rail exposes one tray chip. This matches design §10.

**Placeholder scan:** the only "placeholder" is the real-PNG icons note in Task 12 Step 8, which is explicitly a manual asset step with a working fallback — not a code placeholder.

**Type consistency:** `analyze` return shape (`currentBeat/nextBeat/nextHardTrigger/minutesToNextHard/driftMin/cutHint`) is used identically in Tasks 4, 9. `rollPool` → `{results,total}` and `interpret(results)` → `{successes,ones,canPush,isCritical}` match across Tasks 5, 6, 10. `createStore` API matches across Tasks 2, 11. `<director-rail>.update({scenario,elapsedMs,stamps})` and its `reached` / `open-tool` events match across Tasks 9, 11. `<dice-tray>` `systemId/sides/count/rng/roll()/last` match across Tasks 10, 11.
