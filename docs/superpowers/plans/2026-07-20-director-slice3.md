# The Director — Slice 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the dice engine from one rule-pack (Year-Zero) to five, and let the GM pick the active system's dice in the tray — adding CoC d100, VANITY d6-pool, Panic & Glory, and the Dee Sanction Challenge/Verdict die, each grounded in the Continuum 2026 source rules.

**Architecture:** Same one-dice-core + pluggable rule-packs. Extend the pack contract so `interpret(results, params)` accepts an optional params object (skill target, difficulty, SAN), and each pack declares the numeric `params` inputs it needs plus a `summary(verdict)` string. The `<dice-tray>` gains a rule-pack selector + auto-generated param inputs and renders `pack.summary(...)`.

**Tech Stack:** JavaScript (ES modules, no TypeScript), Web Components (light DOM), Vite, Vitest + jsdom. No new dependencies. Fully offline.

## Global Constraints

- **Rule-pack contract (v2):** a pack is `{ id, label, params, interpret(results, params), summary(verdict) }`. `results` is `[{ sides, value }]` (from `rollPool`). `params` (on the pack) is an array of `{ key, label, default }` describing numeric inputs; `interpret`'s second arg is a `{ key: value }` object (defaults applied by the caller). `summary(verdict)` returns a short display string.
- **Determinism:** rule-packs are pure — no `Math.random()`/`Date.now()`. They read only `results` and `params`.
- **Backward compatibility:** the existing `year-zero` pack and its tests must keep passing. `interpret(results)` called with no params must still work (params defaults to `{}`).
- **No TypeScript, no runtime framework, light DOM, fully offline.**
- **Rule fidelity:** each pack's rules are transcribed from the cited Continuum 2026 source and MUST match it. Tests use values derived from those rules.
- **Test env:** Vitest `environment: 'jsdom'`; `tests/setup.js` localStorage shim already present. **Node ≥ 18.**

**Existing interfaces this slice builds on:**
- `src/dice/roller.js` → `rollPool(diceSpecs, rng)` → `{ results:[{sides,value}], total }`.
- `src/dice/rulepacks/index.js` → `getRulePack(id)`, `registerRulePack(pack)`.
- `src/dice/rulepacks/year-zero.js` → `yearZero = { id:'year-zero', label, interpret(results) }`.
- `src/components/dice-tray.js` → `<dice-tray>` with `systemId`, `sides`, `count`, `rng`, `roll()`, `last`; currently calls `getRulePack(this._systemId).interpret(results)` and renders a hardcoded verdict string.

---

### Task 1: Extend the rule-pack contract (params + summary) + registry listing

**Files:**
- Modify: `src/dice/rulepacks/year-zero.js`
- Modify: `src/dice/rulepacks/index.js`
- Modify: `src/components/dice-tray.js`
- Test: `tests/dice/year-zero.test.js` (add cases), `tests/dice/rulepacks-registry.test.js` (new)

**Interfaces:**
- Consumes: existing `rollPool`, `getRulePack`.
- Produces:
  - `yearZero` gains `params: []` and `summary(verdict)` → `` `${successes} success(es)` `` plus `` ` · ${ones} stress` `` when `ones>0`. `interpret(results, params = {})` (params ignored).
  - `listRulePacks()` in the registry → array of `{ id, label }` for all registered packs.
  - `<dice-tray>` gains `this.params = {}`; `roll()` calls `pack.interpret(results, this.params)`; verdict rendering uses `pack.summary(verdict)` when present.

- [ ] **Step 1: Write the failing tests**

Add to `tests/dice/year-zero.test.js` (new `describe` block at the end):

```js
describe('year-zero contract v2', () => {
  it('exposes an empty params list and a summary string', () => {
    expect(yearZero.params).toEqual([]);
    expect(yearZero.summary({ successes: 2, ones: 1 })).toBe('2 successes · 1 stress');
    expect(yearZero.summary({ successes: 1, ones: 0 })).toBe('1 success');
  });
  it('interpret ignores a params argument', () => {
    const v = yearZero.interpret([{ sides: 8, value: 8 }], { anything: true });
    expect(v.successes).toBe(1);
  });
});
```

Create `tests/dice/rulepacks-registry.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { getRulePack, listRulePacks } from '../../src/dice/rulepacks/index.js';

describe('rule-pack registry', () => {
  it('lists registered packs as {id,label}', () => {
    const packs = listRulePacks();
    expect(packs.some((p) => p.id === 'year-zero' && typeof p.label === 'string')).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/dice/year-zero.test.js tests/dice/rulepacks-registry.test.js`
Expected: FAIL — `params`/`summary`/`listRulePacks` undefined.

- [ ] **Step 3: Update `year-zero.js`**

```js
// src/dice/rulepacks/year-zero.js
export const yearZero = {
  id: 'year-zero',
  label: 'Year-Zero',
  params: [],
  interpret(results, params = {}) {
    let successes = 0, ones = 0;
    for (const r of results) {
      if (r.value >= 10) successes += 2;
      else if (r.value >= 6) successes += 1;
      if (r.value === 1) ones += 1;
    }
    return { successes, ones, canPush: true, isCritical: successes >= 2 };
  },
  summary(v) {
    const base = `${v.successes} success${v.successes === 1 ? '' : 'es'}`;
    return v.ones ? `${base} · ${v.ones} stress` : base;
  },
};
```

- [ ] **Step 4: Add `listRulePacks` to the registry**

Edit `src/dice/rulepacks/index.js` — keep existing imports/registrations and add:

```js
export function listRulePacks() {
  return [...packs.values()].map((p) => ({ id: p.id, label: p.label }));
}
```

- [ ] **Step 5: Update `<dice-tray>` to pass params + use summary**

In `src/components/dice-tray.js`:
- In the constructor add: `this.params = {};`
- In `roll()`, change `const verdict = pack ? pack.interpret(results) : null;` to `const verdict = pack ? pack.interpret(results, this.params) : null;`
- In `render()`, replace the hardcoded verdict-string expression with:

```js
    const pack = getRulePack(this._systemId);
    const verdict = this.last?.verdict
      ? (pack && pack.summary ? pack.summary(this.last.verdict) : '')
      : '';
```

(Keep everything else — picker, felt, roll button — unchanged. `getRulePack` is already imported.)

- [ ] **Step 6: Run tests**

Run: `npx vitest run tests/dice/ tests/components/dice-tray.test.js`
Expected: PASS (existing dice-tray test's `2 success` assertion still satisfied by `yearZero.summary`).

- [ ] **Step 7: Commit**

```bash
git add src/dice/rulepacks/year-zero.js src/dice/rulepacks/index.js src/components/dice-tray.js tests/dice/year-zero.test.js tests/dice/rulepacks-registry.test.js
git commit -m "feat: rule-pack contract v2 (params + summary) and registry listing"
```

---

### Task 2: CoC d100 rule-pack

Source (Call of Cthulhu 7e, standard): roll a d100 against a skill %. `01` = critical; `≤ floor(skill/5)` = extreme; `≤ floor(skill/2)` = hard; `≤ skill` = success; fumble = `skill < 50 ? roll ≥ 96 : roll = 100`; else failure.

**Files:**
- Create: `src/dice/rulepacks/coc-d100.js`
- Modify: `src/dice/rulepacks/index.js`
- Test: `tests/dice/coc-d100.test.js`

**Interfaces:**
- Produces: `cocD100 = { id:'coc-d100', label:'d100 (Call of Cthulhu)', params:[{key:'target',label:'Skill %',default:50}], interpret(results, params), summary(v) }`. `interpret` reads `results[0].value` (the d100) and `params.target`; returns `{ value, target, level, success }` where `level ∈ {'critical','extreme','hard','success','failure','fumble'}` and `success` is true for the first four.

- [ ] **Step 1: Write the failing test**

```js
// tests/dice/coc-d100.test.js
import { describe, it, expect } from 'vitest';
import { cocD100 } from '../../src/dice/rulepacks/coc-d100.js';
import { getRulePack } from '../../src/dice/rulepacks/index.js';

const roll = (v) => [{ sides: 100, value: v }];

describe('coc-d100 rule-pack', () => {
  it('grades a roll against a 50% skill', () => {
    expect(cocD100.interpret(roll(1), { target: 50 }).level).toBe('critical');
    expect(cocD100.interpret(roll(10), { target: 50 }).level).toBe('extreme');  // <= 10
    expect(cocD100.interpret(roll(25), { target: 50 }).level).toBe('hard');     // <= 25
    expect(cocD100.interpret(roll(50), { target: 50 }).level).toBe('success');
    expect(cocD100.interpret(roll(51), { target: 50 }).level).toBe('failure');
    expect(cocD100.interpret(roll(100), { target: 50 }).level).toBe('fumble');
  });
  it('fumbles on 96+ when the skill is under 50', () => {
    expect(cocD100.interpret(roll(96), { target: 40 }).level).toBe('fumble');
    expect(cocD100.interpret(roll(41), { target: 40 }).level).toBe('failure');
  });
  it('marks the four passing bands as success', () => {
    expect(cocD100.interpret(roll(10), { target: 50 }).success).toBe(true);
    expect(cocD100.interpret(roll(51), { target: 50 }).success).toBe(false);
  });
  it('defaults target to 50 and summarises', () => {
    const v = cocD100.interpret(roll(5));
    expect(v.target).toBe(50);
    expect(cocD100.summary(v)).toBe('5 vs 50% → EXTREME');
  });
  it('is registered', () => {
    expect(getRulePack('coc-d100')).toBe(cocD100);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/dice/coc-d100.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the pack**

```js
// src/dice/rulepacks/coc-d100.js
// Call of Cthulhu 7e success ladder vs a skill %.
export const cocD100 = {
  id: 'coc-d100',
  label: 'd100 (Call of Cthulhu)',
  params: [{ key: 'target', label: 'Skill %', default: 50 }],
  interpret(results, params = {}) {
    const value = results[0]?.value ?? 0;
    const target = params.target ?? 50;
    let level;
    if (value === 1) level = 'critical';
    else if (value <= Math.floor(target / 5)) level = 'extreme';
    else if (value <= Math.floor(target / 2)) level = 'hard';
    else if (value <= target) level = 'success';
    else if ((target < 50 && value >= 96) || value === 100) level = 'fumble';
    else level = 'failure';
    const success = ['critical', 'extreme', 'hard', 'success'].includes(level);
    return { value, target, level, success };
  },
  summary(v) {
    return `${v.value} vs ${v.target}% → ${v.level.toUpperCase()}`;
  },
};
```

- [ ] **Step 4: Register it**

In `src/dice/rulepacks/index.js`, add the import and registration alongside the existing ones:

```js
import { cocD100 } from './coc-d100.js';
```
and add `[cocD100.id, cocD100]` to the `packs` Map initializer (or `packs.set(cocD100.id, cocD100)` after construction — match the file's existing style).

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/dice/coc-d100.test.js`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src/dice/rulepacks/coc-d100.js src/dice/rulepacks/index.js tests/dice/coc-d100.test.js
git commit -m "feat: CoC 7e d100 rule-pack"
```

---

### Task 3: VANITY d6-pool rule-pack

Source (`Continuum2026/reference/vanity-convention-rules.html`, §0–§1): pool of d6; **5–6 = Success**; one Success succeeds, extras succeed better; **0 Successes = failure**; **Stumble** = fail (0 successes) with **two or more 1s** (banks a Bane); a lone 1 lets the GM twist; difficulty = Successes needed (default 1, Hard 2, Daunting 3); Push rerolls non-successes for +1 Bane.

**Files:**
- Create: `src/dice/rulepacks/vanity-d6.js`
- Modify: `src/dice/rulepacks/index.js`
- Test: `tests/dice/vanity-d6.test.js`

**Interfaces:**
- Produces: `vanityD6 = { id:'vanity-d6', label:'d6 Pool (VANITY)', params:[{key:'difficulty',label:'Successes needed',default:1}], interpret(results, params), summary(v) }`. Returns `{ successes, ones, difficulty, isSuccess, stumble, twist, style, canPush }`.

- [ ] **Step 1: Write the failing test**

```js
// tests/dice/vanity-d6.test.js
import { describe, it, expect } from 'vitest';
import { vanityD6 } from '../../src/dice/rulepacks/vanity-d6.js';
import { getRulePack } from '../../src/dice/rulepacks/index.js';

const pool = (...vals) => vals.map((v) => ({ sides: 6, value: v }));

describe('vanity-d6 rule-pack', () => {
  it('counts 5s and 6s as successes', () => {
    const v = vanityD6.interpret(pool(6, 5, 2), { difficulty: 1 });
    expect(v.successes).toBe(2);
    expect(v.isSuccess).toBe(true);
    expect(v.style).toBe(true); // more successes than needed
  });
  it('stumbles on zero successes with two or more 1s', () => {
    const v = vanityD6.interpret(pool(1, 1, 3), { difficulty: 1 });
    expect(v.successes).toBe(0);
    expect(v.ones).toBe(2);
    expect(v.stumble).toBe(true);
    expect(v.isSuccess).toBe(false);
  });
  it('a lone 1 is a GM twist, not a stumble', () => {
    const v = vanityD6.interpret(pool(1, 4, 4), { difficulty: 1 });
    expect(v.twist).toBe(true);
    expect(v.stumble).toBe(false);
  });
  it('respects the difficulty (successes needed)', () => {
    const v = vanityD6.interpret(pool(6, 2, 2), { difficulty: 2 });
    expect(v.successes).toBe(1);
    expect(v.isSuccess).toBe(false);
  });
  it('defaults difficulty to 1, summarises, and is registered', () => {
    const v = vanityD6.interpret(pool(5, 3));
    expect(v.difficulty).toBe(1);
    expect(vanityD6.summary(v)).toContain('1 success');
    expect(getRulePack('vanity-d6')).toBe(vanityD6);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/dice/vanity-d6.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the pack**

```js
// src/dice/rulepacks/vanity-d6.js
// VANITY (Draft 13) core roll: 5-6 = Success; Stumble = 0 successes with 2+ ones.
export const vanityD6 = {
  id: 'vanity-d6',
  label: 'd6 Pool (VANITY)',
  params: [{ key: 'difficulty', label: 'Successes needed', default: 1 }],
  interpret(results, params = {}) {
    let successes = 0, ones = 0;
    for (const r of results) {
      if (r.value >= 5) successes += 1;
      if (r.value === 1) ones += 1;
    }
    const difficulty = params.difficulty ?? 1;
    const isSuccess = successes >= difficulty;
    return {
      successes,
      ones,
      difficulty,
      isSuccess,
      stumble: successes === 0 && ones >= 2,
      twist: ones >= 1,
      style: successes > difficulty,
      canPush: true,
    };
  },
  summary(v) {
    const base = `${v.successes} success${v.successes === 1 ? '' : 'es'}`;
    const verdict = v.isSuccess ? '' : ' — fail';
    const stumble = v.stumble ? ' · STUMBLE (+1 Bane)' : (v.twist ? ' · a 1 (GM twist)' : '');
    return `${base}${verdict}${stumble}`;
  },
};
```

- [ ] **Step 4: Register it**

In `src/dice/rulepacks/index.js`, add `import { vanityD6 } from './vanity-d6.js';` and register `vanityD6` in the `packs` Map (match existing style).

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/dice/vanity-d6.test.js`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src/dice/rulepacks/vanity-d6.js src/dice/rulepacks/index.js tests/dice/vanity-d6.test.js
git commit -m "feat: VANITY d6-pool rule-pack"
```

---

### Task 4: Panic & Glory rule-pack

Source (`Continuum2026` chopper scenario + console): roll **1d6 + (20 − current SAN)**; bands by total — **≤6** GLORY UNLEASHED · **7–9** HEROIC SURGE · **10–13** FOCUSED FURY · **14–16** WAVERING RESOLVE · **17–19** DESPERATE FLINCH · **20+** FULL PANIC. Glory Points come from the top two bands (total ≤ 9).

**Files:**
- Create: `src/dice/rulepacks/panic-glory.js`
- Modify: `src/dice/rulepacks/index.js`
- Test: `tests/dice/panic-glory.test.js`

**Interfaces:**
- Produces: `panicGlory = { id:'panic-glory', label:'Panic & Glory', params:[{key:'san',label:'Current SAN',default:20}], interpret(results, params), summary(v) }`. Returns `{ d6, san, total, band:{key,label,effect}, gloryPoint }`.

- [ ] **Step 1: Write the failing test**

```js
// tests/dice/panic-glory.test.js
import { describe, it, expect } from 'vitest';
import { panicGlory } from '../../src/dice/rulepacks/panic-glory.js';
import { getRulePack } from '../../src/dice/rulepacks/index.js';

const d6 = (v) => [{ sides: 6, value: v }];

describe('panic-glory rule-pack', () => {
  it('adds (20 - SAN) to the d6', () => {
    const v = panicGlory.interpret(d6(3), { san: 20 });
    expect(v.total).toBe(3);
    expect(v.band.key).toBe('glory-unleashed');
    expect(v.gloryPoint).toBe(true);
  });
  it('bands a mid result correctly', () => {
    const v = panicGlory.interpret(d6(4), { san: 10 }); // 4 + 10 = 14
    expect(v.total).toBe(14);
    expect(v.band.key).toBe('wavering-resolve');
    expect(v.gloryPoint).toBe(false);
  });
  it('caps into full panic at 20+', () => {
    const v = panicGlory.interpret(d6(5), { san: 5 }); // 5 + 15 = 20
    expect(v.band.key).toBe('full-panic');
  });
  it('defaults SAN to 20, summarises, and is registered', () => {
    const v = panicGlory.interpret(d6(6));
    expect(v.total).toBe(6);
    expect(panicGlory.summary(v)).toBe('6 → GLORY UNLEASHED');
    expect(getRulePack('panic-glory')).toBe(panicGlory);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/dice/panic-glory.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the pack**

```js
// src/dice/rulepacks/panic-glory.js
// Continuum house mechanic: 1d6 + (20 - current SAN), six bands.
const BANDS = [
  { max: 6,  key: 'glory-unleashed',  label: 'GLORY UNLEASHED',  effect: '2D10 temp HP · ignore SAN loss 3 rounds · auto-succeed one pulp feat · +1 Glory' },
  { max: 9,  key: 'heroic-surge',     label: 'HEROIC SURGE',     effect: '1D6 temp HP · +20% next 2 rolls · +1 Glory' },
  { max: 13, key: 'focused-fury',     label: 'FOCUSED FURY',     effect: 'reroll next fail, then −1D3 SAN' },
  { max: 16, key: 'wavering-resolve', label: 'WAVERING RESOLVE', effect: '−20% next action · POW×5 or panic' },
  { max: 19, key: 'desperate-flinch', label: 'DESPERATE FLINCH', effect: 'drop weapon / freeze · lose action' },
  { max: Infinity, key: 'full-panic', label: 'FULL PANIC',       effect: '−1D10 SAN · flee, freeze, or act irrationally' },
];

export const panicGlory = {
  id: 'panic-glory',
  label: 'Panic & Glory',
  params: [{ key: 'san', label: 'Current SAN', default: 20 }],
  interpret(results, params = {}) {
    const roll = results[0]?.value ?? 0;
    const san = params.san ?? 20;
    const total = roll + (20 - san);
    const band = BANDS.find((b) => total <= b.max);
    return { d6: roll, san, total, band, gloryPoint: total <= 9 };
  },
  summary(v) {
    return `${v.total} → ${v.band.label}`;
  },
};
```

- [ ] **Step 4: Register it**

In `src/dice/rulepacks/index.js`, add `import { panicGlory } from './panic-glory.js';` and register `panicGlory` (match existing style).

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/dice/panic-glory.test.js`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/dice/rulepacks/panic-glory.js src/dice/rulepacks/index.js tests/dice/panic-glory.test.js
git commit -m "feat: Panic & Glory rule-pack"
```

---

### Task 5: Dee Sanction Challenge / Verdict rule-pack

Source (`Continuum2026/scenarios/sun-slot7-dee-sanction-princes-bride.md`): only players roll their Ability die (d4–d12); **3+ = success, 1–2 = Falter** (carries forward with a cost). The Verdict Die uses the same threshold. Step Up/Down changes which die size is rolled (a setup concern, not interpretation).

**Files:**
- Create: `src/dice/rulepacks/dee-sanction.js`
- Modify: `src/dice/rulepacks/index.js`
- Test: `tests/dice/dee-sanction.test.js`

**Interfaces:**
- Produces: `deeSanction = { id:'dee-sanction', label:'Dee Sanction (Challenge/Verdict)', params:[], interpret(results), summary(v) }`. Returns `{ value, sides, success, falter }`.

- [ ] **Step 1: Write the failing test**

```js
// tests/dice/dee-sanction.test.js
import { describe, it, expect } from 'vitest';
import { deeSanction } from '../../src/dice/rulepacks/dee-sanction.js';
import { getRulePack } from '../../src/dice/rulepacks/index.js';

const die = (sides, value) => [{ sides, value }];

describe('dee-sanction rule-pack', () => {
  it('treats 3+ as success on any ability die', () => {
    expect(deeSanction.interpret(die(8, 3)).success).toBe(true);
    expect(deeSanction.interpret(die(12, 12)).success).toBe(true);
  });
  it('treats 1-2 as a Falter', () => {
    expect(deeSanction.interpret(die(8, 2)).falter).toBe(true);
    expect(deeSanction.interpret(die(4, 1)).falter).toBe(true);
    expect(deeSanction.interpret(die(8, 2)).success).toBe(false);
  });
  it('summarises and is registered', () => {
    expect(deeSanction.summary(deeSanction.interpret(die(6, 5)))).toBe('5 → success');
    expect(deeSanction.summary(deeSanction.interpret(die(6, 2)))).toBe('2 → FALTER');
    expect(getRulePack('dee-sanction')).toBe(deeSanction);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/dice/dee-sanction.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the pack**

```js
// src/dice/rulepacks/dee-sanction.js
// The Dee Sanction: roll one Ability die (d4-d12). 3+ = success, 1-2 = Falter.
export const deeSanction = {
  id: 'dee-sanction',
  label: 'Dee Sanction (Challenge/Verdict)',
  params: [],
  interpret(results, params = {}) {
    const value = results[0]?.value ?? 0;
    const sides = results[0]?.sides ?? 0;
    return { value, sides, success: value >= 3, falter: value <= 2 };
  },
  summary(v) {
    return v.success ? `${v.value} → success` : `${v.value} → FALTER`;
  },
};
```

- [ ] **Step 4: Register it**

In `src/dice/rulepacks/index.js`, add `import { deeSanction } from './dee-sanction.js';` and register `deeSanction` (match existing style).

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/dice/dee-sanction.test.js`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/dice/rulepacks/dee-sanction.js src/dice/rulepacks/index.js tests/dice/dee-sanction.test.js
git commit -m "feat: Dee Sanction challenge/verdict rule-pack"
```

---

### Task 6: `<dice-tray>` rule-pack selector + param inputs

**Files:**
- Modify: `src/components/dice-tray.js`
- Modify: `src/styles.css`
- Test: `tests/components/dice-tray-packs.test.js`

**Interfaces:**
- Consumes: `listRulePacks`, `getRulePack` (registry), the packs' `params` descriptors and `summary`.
- Produces: `<dice-tray>` renders a pack selector (`[data-role="pack"]` buttons, one per `listRulePacks()` entry plus an `Any die` button with `data-pack-id=""`) that sets `this.systemId`; and renders one number input per active pack `params` entry (`[data-param="<key>"]`), whose values populate `this.params` (numbers) before `interpret`. Selecting a pack or editing a param updates state and re-renders. `Any die` (empty id) → no rule-pack, verdict blank.

- [ ] **Step 1: Write the failing test**

```js
// tests/components/dice-tray-packs.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/dice-tray.js';

const seq = (vals) => { let i = 0; return () => vals[i++ % vals.length]; };

describe('<dice-tray> pack selector + params', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('dice-tray');
    document.body.appendChild(el);
  });

  it('renders a button for each registered pack plus Any die', () => {
    expect(el.querySelector('[data-pack-id="coc-coc-d100"]') || el.querySelector('[data-pack-id="coc-d100"]')).not.toBe(null);
    expect(el.querySelector('[data-pack-id="vanity-d6"]')).not.toBe(null);
    expect(el.querySelector('[data-pack-id=""]')).not.toBe(null); // Any die
  });

  it('selecting a pack updates systemId and shows its param inputs', () => {
    el.querySelector('[data-pack-id="coc-d100"]').click();
    expect(el.systemId).toBe('coc-d100');
    expect(el.querySelector('[data-param="target"]')).not.toBe(null);
  });

  it('feeds param inputs into interpret and renders the pack summary', () => {
    el.querySelector('[data-pack-id="coc-d100"]').click();
    el.sides = 100; el.count = 1;
    el.querySelector('[data-param="target"]').value = '40';
    el.querySelector('[data-param="target"]').dispatchEvent(new Event('input'));
    el.rng = seq([0.95]); // d100 -> floor(0.95*100)+1 = 96
    el.roll();
    expect(el.last.verdict.target).toBe(40);
    expect(el.last.verdict.level).toBe('fumble'); // 96 with target 40
    expect(el.querySelector('[data-role=verdict]').textContent).toContain('FUMBLE');
  });

  it('Any die selection clears the rule-pack (blank verdict)', () => {
    el.querySelector('[data-pack-id=""]').click();
    expect(el.systemId).toBe('');
    el.sides = 20; el.count = 1; el.rng = seq([0.5]);
    el.roll();
    expect(el.last.verdict).toBe(null);
    expect(el.querySelector('[data-role=verdict]').textContent).toBe('');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/dice-tray-packs.test.js`
Expected: FAIL — no pack selector / param inputs.

- [ ] **Step 3: Update `<dice-tray>`**

In `src/components/dice-tray.js`:
- Add the import: `import { getRulePack, listRulePacks } from '../dice/rulepacks/index.js';` (replace the existing `getRulePack`-only import).
- Ensure the constructor has `this.params = {};` (added in Task 1). Keep `this._systemId = 'year-zero'` default.
- Add a helper to read the active pack's params from inputs and coerce to numbers:

```js
  syncParams() {
    const pack = getRulePack(this._systemId);
    const next = {};
    if (pack && pack.params) {
      for (const p of pack.params) {
        const input = this.querySelector(`[data-param="${p.key}"]`);
        const raw = input ? input.value : '';
        next[p.key] = raw === '' ? p.default : Number(raw);
      }
    }
    this.params = next;
  }
```

- In `render()`, build a pack selector and param inputs. Add, before the picker markup, a pack bar; and after the picker, the param inputs for the active pack. Concretely, compute:

```js
    const packs = listRulePacks();
    const packBar = [{ id: '', label: 'Any die' }, ...packs].map((p) =>
      `<button class="pack ${p.id === this._systemId ? 'on' : ''}" data-pack-id="${p.id}">${p.label}</button>`).join('');
    const active = getRulePack(this._systemId);
    const paramInputs = (active && active.params ? active.params : []).map((p) =>
      `<label class="param">${p.label}<input type="number" data-param="${p.key}" value="${this.params[p.key] ?? p.default}" /></label>`).join('');
```

and include `<div class="pack-bar">${packBar}</div>` above the die picker and `<div class="params">${paramInputs}</div>` below it in the `.dice-tray` template.

- After setting `innerHTML`, wire the new controls (alongside the existing picker/roll bindings):

```js
    this.querySelectorAll('[data-pack-id]').forEach((b) =>
      b.addEventListener('click', () => { this._systemId = b.dataset.packId; this.syncParams(); this.render(); }));
    this.querySelectorAll('[data-param]').forEach((inp) =>
      inp.addEventListener('input', () => this.syncParams()));
```

- Make `set systemId(v)` (add a setter if not present) assign `this._systemId = v` and `this.render()`; keep the existing `get systemId`. If a `systemId` setter already exists, ensure it still calls `render()`. Ensure `syncParams()` is also called once in `connectedCallback()` after the first render so defaults populate `this.params`.

- Keep `roll()` using `pack.interpret(results, this.params)` and the `pack.summary` verdict rendering from Task 1.

- [ ] **Step 4: Add styles**

Append to `src/styles.css`:

```css
.pack-bar { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.pack { font-size: 11px; padding: 5px 10px; border-radius: 20px; border: 1px solid #2b3644; background: #161d27; color: #9fb0c2; }
.pack.on { background: #1e3a52; border-color: #3f7fb0; color: #dcefff; }
.params { display: flex; gap: 10px; flex-wrap: wrap; margin: 8px 0; }
.param { font-size: 11px; color: #9fb0c2; display: flex; flex-direction: column; gap: 3px; }
.param input { width: 80px; background: #161d27; border: 1px solid #2a3542; border-radius: 6px; padding: 6px 8px; color: #e7eef6; }
```

- [ ] **Step 5: Run tests + full suite + build**

Run: `npx vitest run tests/components/dice-tray-packs.test.js`
Expected: PASS (4 tests).
Run: `npm test`
Expected: all tests PASS (Slice 1–3).
Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Manual visual check**

`npm run dev`, open the tray via 🎲: confirm the pack bar (Any die + 5 systems), that picking CoC shows a "Skill %" input, VANITY shows "Successes needed", Panic & Glory shows "Current SAN"; roll and see the pack-appropriate verdict.

- [ ] **Step 7: Commit**

```bash
git add src/components/dice-tray.js src/styles.css tests/components/dice-tray-packs.test.js
git commit -m "feat: dice-tray rule-pack selector + per-pack param inputs"
```

---

## Self-Review

**Spec coverage (design §6 → task):** one dice core + system rule-packs → Tasks 1 (contract v2), 2 (CoC d100), 3 (VANITY d6), 4 (Panic & Glory), 5 (Dee Sanction), 6 (tray selector + params). "Any die" mode → Task 6. Each pack's rules are transcribed from the cited Continuum source; tests derive from those rules.

**Deferred by design (not gaps):** CoC bonus/penalty dice, VANITY Reckoning 2d6 table / Vanity-Karma piles, the Verdict Die step-up/down auto-acquit-at-d10 UI, and per-scenario `meta.system` defaulting (packs are selectable in the tray now; scenario porting is a later slice). Real convention scenario data is NOT fabricated here.

**Placeholder scan:** none. Every step has complete code.

**Type consistency:** the pack contract `{ id, label, params:[{key,label,default}], interpret(results, params)→verdict, summary(verdict)→string }` is defined in Task 1 and honoured identically by Tasks 2–5; `listRulePacks()`→`[{id,label}]` (Task 1) is consumed in Task 6; `<dice-tray>.params` object and `interpret(results, this.params)` are consistent across Tasks 1 and 6; each pack registers itself in `rulepacks/index.js` and a test asserts `getRulePack(id)` resolves.
