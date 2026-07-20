# The Director — Slice 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the clue safety-net — a tray tool that, from a scenario's `clues[]`, shows at a glance which **essential** clues are still missing to reach an ending and which fallback delivers each, so the mystery never becomes unsolvable at the table.

**Architecture:** Same pattern as the other tools — a pure engine (`analyzeClues`) that computes solvability from clues + a revealed-id set, a `<clue-net>` light-DOM component that renders the solvability banner + toggleable clue list + fallbacks, and shell/rail wiring that persists the revealed set and adds a 🔍 chip. No real convention clue content is fabricated: the engine reads `scenario.clues` (empty for shipped scenarios), and a clearly-labelled example scenario file provides a template + test fixture.

**Tech Stack:** JavaScript (ES modules, no TypeScript), Web Components (light DOM), Vite, Vitest + jsdom. No new dependencies. Fully offline.

## Global Constraints

- **Offline-first, no runtime framework, light DOM, no TypeScript.**
- **Clue model:** a clue is `{ id, label, essential (bool), act? (string), routes? ([string]), fallback? (string) }`. `essential` marks clues required to reach an ending; `fallback` is how to deliver it if missed.
- **Determinism:** the engine is pure — it takes `(clues, revealed)` and returns a result; no globals.
- **Persistence:** the revealed-clue id list persists under store key `revealedClues` (namespace = `meta.id`), consistent with `stamps`/`cast`.
- **Escaping:** clue `label`/`fallback`/`act` are interpolated via the shared `escapeHtml` (`src/core/escape-html.js`) — they may be author free text.
- **Tray integration:** `<clue-net>` is a tray tool, hidden by default, toggled by the shell on `open-tool` with `tool: 'clues'`; the Rail gains a `data-role="open-clues"` chip.
- **No fabricated content:** shipped scenarios keep `clues: []`; the example lives in a file named to make clear it is a template, not a convention scenario.
- **Test env:** Vitest `environment: 'jsdom'`; `tests/setup.js` shim present. **Node ≥ 18.**

**Existing interfaces this slice builds on:**
- `src/core/store.js` → `createStore(namespace)`.
- `src/core/escape-html.js` → `escapeHtml(s)`.
- `src/components/gm-shell.js` → `<gm-shell>`: `this.store`, `this.scenario`, `loadScenario`, `<main class="stage">`, `onOpenTool` toggles trays via a `{dice,npc,art}` map; listens for `open-tool`; persists `stamps`/`cast`.
- `src/components/director-rail.js` → renders tool chips `open-dice`/`open-npc`/`open-art` emitting `open-tool`.
- `src/scenarios/afterimage.js` → default export with `clues: []`.

---

### Task 1: Clue safety-net engine (pure)

**Files:**
- Create: `src/clues/safety-net.js`
- Test: `tests/clues/safety-net.test.js`

**Interfaces:**
- Produces: `analyzeClues(clues = [], revealed = [])` → `{ total, revealedCount, essentialTotal, essentialRevealed, missingEssential, solvable }`. `revealed` is an array of clue ids. `missingEssential` is the array of essential clue objects not in `revealed` (each still carrying its `fallback`). `solvable` is `missingEssential.length === 0`.

- [ ] **Step 1: Write the failing test**

```js
// tests/clues/safety-net.test.js
import { describe, it, expect } from 'vitest';
import { analyzeClues } from '../../src/clues/safety-net.js';

const CLUES = [
  { id: 'c1', label: 'The door-cam still', essential: true, fallback: 'The radio names the time' },
  { id: 'c2', label: 'Priya’s phone', essential: true, fallback: 'The neighbour saw her leave' },
  { id: 'c3', label: 'A nice-to-have colour detail', essential: false },
];

describe('analyzeClues', () => {
  it('reports counts and solvability from the revealed set', () => {
    const r = analyzeClues(CLUES, ['c1']);
    expect(r.total).toBe(3);
    expect(r.revealedCount).toBe(1);
    expect(r.essentialTotal).toBe(2);
    expect(r.essentialRevealed).toBe(1);
    expect(r.solvable).toBe(false);
    expect(r.missingEssential.map((c) => c.id)).toEqual(['c2']);
    expect(r.missingEssential[0].fallback).toBe('The neighbour saw her leave');
  });

  it('is solvable once every essential clue is revealed', () => {
    const r = analyzeClues(CLUES, ['c1', 'c2']);
    expect(r.solvable).toBe(true);
    expect(r.missingEssential).toEqual([]);
  });

  it('treats an empty clue list as vacuously solvable', () => {
    const r = analyzeClues([], []);
    expect(r.solvable).toBe(true);
    expect(r.essentialTotal).toBe(0);
    expect(r.total).toBe(0);
  });

  it('defaults revealed to empty', () => {
    expect(analyzeClues(CLUES).essentialRevealed).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/clues/safety-net.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the engine**

```js
// src/clues/safety-net.js
export function analyzeClues(clues = [], revealed = []) {
  const seen = new Set(revealed);
  const essential = clues.filter((c) => c.essential);
  const missingEssential = essential.filter((c) => !seen.has(c.id));
  return {
    total: clues.length,
    revealedCount: clues.filter((c) => seen.has(c.id)).length,
    essentialTotal: essential.length,
    essentialRevealed: essential.length - missingEssential.length,
    missingEssential,
    solvable: missingEssential.length === 0,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/clues/safety-net.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/clues/safety-net.js tests/clues/safety-net.test.js
git commit -m "feat: clue safety-net engine (essential-gap + solvability)"
```

---

### Task 2: `<clue-net>` component

**Files:**
- Create: `src/components/clue-net.js`
- Test: `tests/components/clue-net.test.js`

**Interfaces:**
- Consumes: `analyzeClues` (Task 1), `escapeHtml` (`src/core/escape-html.js`).
- Produces: custom element `<clue-net>` with settable `clues` (array, default `[]`) and `revealed` (array of ids, default `[]`), each re-rendering. Renders: a banner `[data-role="solvable"]` (text `Solvable ✓` when solvable, else `N essential clue(s) still needed`), and one row per clue `[data-clue-id="<id>"]` with a reveal toggle button `[data-role="toggle"]`, an essential badge when essential, a lit/`revealed` class when revealed, and — for a *missing essential* — its fallback in a `.clue-fallback`. Empty clues render `[data-role="empty"]`. Clicking a clue's toggle emits bubbling `CustomEvent('toggle-clue', { detail: { id } })`. All author text is escaped.

- [ ] **Step 1: Write the failing test**

```js
// tests/components/clue-net.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/clue-net.js';

const CLUES = [
  { id: 'c1', label: 'Door-cam still', essential: true, fallback: 'Radio names the time' },
  { id: 'c2', label: 'Colour detail', essential: false },
];

describe('<clue-net>', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('clue-net');
    document.body.appendChild(el);
  });

  it('shows an empty state with no clues', () => {
    expect(el.querySelector('[data-role=empty]')).not.toBe(null);
  });

  it('renders a row per clue and a not-yet-solvable banner', () => {
    el.clues = CLUES;
    el.revealed = [];
    expect(el.querySelectorAll('[data-clue-id]').length).toBe(2);
    expect(el.querySelector('[data-role=solvable]').textContent).toContain('1 essential');
    // the missing essential shows its fallback
    expect(el.querySelector('[data-clue-id="c1"] .clue-fallback').textContent).toContain('Radio names the time');
  });

  it('flips to solvable once the essential clue is revealed', () => {
    el.clues = CLUES;
    el.revealed = ['c1'];
    expect(el.querySelector('[data-role=solvable]').textContent).toContain('Solvable');
    // revealed essential no longer shows a fallback prompt
    expect(el.querySelector('[data-clue-id="c1"] .clue-fallback')).toBe(null);
  });

  it('emits toggle-clue when a reveal toggle is clicked', () => {
    el.clues = CLUES; el.revealed = [];
    let detail = null;
    el.addEventListener('toggle-clue', (e) => { detail = e.detail; });
    el.querySelector('[data-clue-id="c1"] [data-role=toggle]').click();
    expect(detail).toEqual({ id: 'c1' });
  });

  it('escapes author text', () => {
    el.clues = [{ id: 'x', label: 'evil" <b>', essential: true, fallback: 'fb" <i>' }];
    el.revealed = [];
    const row = el.querySelector('[data-clue-id="x"]');
    expect(row.innerHTML).not.toContain('<b>');
    expect(row.querySelector('.clue-fallback').innerHTML).not.toContain('<i>');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/clue-net.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the component**

```js
// src/components/clue-net.js
import { analyzeClues } from '../clues/safety-net.js';
import { escapeHtml } from '../core/escape-html.js';

export class ClueNet extends HTMLElement {
  constructor() {
    super();
    this._clues = [];
    this._revealed = [];
  }
  connectedCallback() { this.render(); }

  set clues(v) { this._clues = Array.isArray(v) ? v : []; this.render(); }
  get clues() { return this._clues; }
  set revealed(v) { this._revealed = Array.isArray(v) ? v : []; this.render(); }
  get revealed() { return this._revealed; }

  render() {
    if (this._clues.length === 0) {
      this.innerHTML = `<div class="clue-net"><div class="clue-empty" data-role="empty">No clues configured for this scenario.</div></div>`;
      return;
    }
    const a = analyzeClues(this._clues, this._revealed);
    const seen = new Set(this._revealed);
    const banner = a.solvable
      ? 'Solvable ✓'
      : `${a.missingEssential.length} essential clue${a.missingEssential.length === 1 ? '' : 's'} still needed`;

    const rows = this._clues.map((c) => {
      const revealed = seen.has(c.id);
      const showFallback = c.essential && !revealed && c.fallback;
      return `
        <div class="clue-row ${revealed ? 'revealed' : ''}" data-clue-id="${escapeHtml(c.id)}">
          <button class="clue-toggle" data-role="toggle">${revealed ? '●' : '○'}</button>
          <div class="clue-body">
            <div class="clue-label">${escapeHtml(c.label)}${c.essential ? ' <span class="clue-ess">essential</span>' : ''}${c.act ? ` <span class="clue-act">${escapeHtml(c.act)}</span>` : ''}</div>
            ${showFallback ? `<div class="clue-fallback">Fallback: ${escapeHtml(c.fallback)}</div>` : ''}
          </div>
        </div>`;
    }).join('');

    this.innerHTML = `
      <div class="clue-net">
        <div class="clue-banner ${a.solvable ? 'ok' : 'warn'}" data-role="solvable">${banner}</div>
        <div class="clue-list">${rows}</div>
      </div>`;

    this.querySelectorAll('[data-clue-id]').forEach((row) => {
      row.querySelector('[data-role=toggle]').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('toggle-clue', { detail: { id: row.dataset.clueId }, bubbles: true }));
      });
    });
  }
}
customElements.define('clue-net', ClueNet);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/clue-net.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/clue-net.js tests/components/clue-net.test.js
git commit -m "feat: <clue-net> essential-gap tracker component"
```

---

### Task 3: Wire the clue-net into the shell + rail (+ example scenario)

**Files:**
- Modify: `src/components/gm-shell.js`
- Modify: `src/components/director-rail.js`
- Modify: `src/styles.css`
- Create: `src/scenarios/example-with-clues.js`
- Test: `tests/components/gm-shell-clues.test.js`

**Interfaces:**
- Consumes: `<clue-net>` (Task 2), existing `createStore`.
- Produces: `<gm-shell>` mounts `<clue-net hidden>`; `onOpenTool` handles `tool: 'clues'` (its tray map gains `clues: 'clue-net'`); `loadScenario` loads `this.revealedClues` from store key `revealedClues` and feeds `<clue-net>.clues = scenario.clues || []` and `.revealed = this.revealedClues`; a new `onToggleClue` toggles the id in `this.revealedClues`, persists it, and updates `<clue-net>.revealed`. `<director-rail>` gains a `data-role="open-clues"` chip emitting `open-tool` `{ tool: 'clues' }`. `example-with-clues.js` is a template scenario (default export) with a populated `clues` array.

- [ ] **Step 1: Write the failing test**

```js
// tests/components/gm-shell-clues.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/gm-shell.js';
import example from '../../src/scenarios/example-with-clues.js';

describe('<gm-shell> clue safety-net', () => {
  let el;
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    el = document.createElement('gm-shell');
    el.now = () => 0;
    document.body.appendChild(el);
    el.loadScenario(example);
  });

  it('mounts a hidden clue-net fed from the scenario clues', () => {
    const net = el.querySelector('clue-net');
    expect(net).not.toBe(null);
    expect(net.hidden).toBe(true);
    expect(net.clues.length).toBe(example.clues.length);
  });

  it('open-tool clues reveals the clue-net', () => {
    el.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'clues' }, bubbles: true }));
    expect(el.querySelector('clue-net').hidden).toBe(false);
  });

  it('toggle-clue records the id, persists it, and updates the net', () => {
    const id = example.clues[0].id;
    el.dispatchEvent(new CustomEvent('toggle-clue', { detail: { id }, bubbles: true }));
    expect(el.revealedClues).toContain(id);
    const persisted = JSON.parse(localStorage.getItem('gmd.' + example.meta.id + '.revealedClues'));
    expect(persisted).toContain(id);
    expect(el.querySelector('clue-net').revealed).toContain(id);
    // toggling again removes it
    el.dispatchEvent(new CustomEvent('toggle-clue', { detail: { id }, bubbles: true }));
    expect(el.revealedClues).not.toContain(id);
  });

  it('the rail exposes a clues chip that emits open-tool', () => {
    const rail = el.querySelector('director-rail');
    let tool = null;
    el.addEventListener('open-tool', (e) => { tool = e.detail.tool; });
    rail.querySelector('[data-role=open-clues]').click();
    expect(tool).toBe('clues');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/gm-shell-clues.test.js`
Expected: FAIL — example scenario + wiring missing.

- [ ] **Step 3: Create the example/template scenario**

```js
// src/scenarios/example-with-clues.js
// TEMPLATE / EXAMPLE — not a convention scenario. Demonstrates the clue model
// for the safety-net. Copy this shape into a real scenario's `clues: []`.
export default {
  meta: { id: 'example-clues', title: 'Example — Clue Net', system: 'year-zero', players: 4, playMinutes: 210, slot: 'Example' },
  timeline: [
    { id: 'a1', act: 1, label: 'Opening', targetMin: 0, hardTrigger: true },
    { id: 'a2', act: 2, label: 'The reveal', targetMin: 90, hardTrigger: true },
    { id: 'a3', act: 3, label: 'Resolution', targetMin: 175, hardTrigger: true },
  ],
  clues: [
    { id: 'motive', label: 'The motive', essential: true, act: 'Act 1', fallback: 'The letter spells it out if missed' },
    { id: 'means', label: 'The means', essential: true, act: 'Act 2', fallback: 'The coroner volunteers it at the morgue' },
    { id: 'opportunity', label: 'The opportunity', essential: true, act: 'Act 2', fallback: 'The timetable is pinned to the wall' },
    { id: 'flavour', label: 'A colour detail', essential: false, act: 'Act 1' },
  ],
  cast: [],
  props: [],
};
```

- [ ] **Step 4: Add the Rail chip**

In `src/components/director-rail.js`, after the `data-role="open-art"` chip button, add:

```js
        <button class="tray-btn" data-role="open-clues" aria-label="Clues">🔍</button>
```

and after the existing `open-art` listener, add:

```js
    this.querySelector('[data-role=open-clues]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'clues' }, bubbles: true }));
    });
```

- [ ] **Step 5: Wire the shell**

In `src/components/gm-shell.js`:
- Add the import with the other component imports: `import './clue-net.js';`
- In the constructor, add: `this.revealedClues = [];`
- In `connectedCallback`, add `<clue-net hidden></clue-net>` inside `<main class="stage">` (alongside the other trays), and add the listener `this.addEventListener('toggle-clue', (e) => this.onToggleClue(e));`
- In `onOpenTool`, extend the tray map to include clues: change the map to `const trays = { dice: 'dice-tray', npc: 'npc-tray', art: 'art-tray', clues: 'clue-net' };` (keep the rest of the method identical).
- In `loadScenario`, after loading `cast`, add:

```js
    this.revealedClues = this.store.get('revealedClues', []);
    const net = this.querySelector('clue-net');
    net.clues = this.scenario.clues || [];
    net.revealed = this.revealedClues;
```

- Add the handler (near `onKeepNpc`):

```js
  onToggleClue(e) {
    const id = e.detail.id;
    this.revealedClues = this.revealedClues.includes(id)
      ? this.revealedClues.filter((x) => x !== id)
      : [...this.revealedClues, id];
    this.store.set('revealedClues', this.revealedClues);
    this.querySelector('clue-net').revealed = this.revealedClues;
  }
```

- [ ] **Step 6: Add styles**

Append to `src/styles.css`:

```css
.clue-net { position: absolute; top: 0; left: 0; right: 0; background: #0f141b; border-bottom: 1px solid #2b3644; padding: 14px; display: flex; flex-direction: column; gap: 10px; max-height: 100%; overflow-y: auto; }
clue-net[hidden] { display: none; }
.clue-banner { padding: 8px 12px; border-radius: 8px; font-weight: 700; font-size: 13px; }
.clue-banner.ok { background: #17251c; color: #8ff0b6; }
.clue-banner.warn { background: #2a2013; color: #ffd479; }
.clue-list { display: flex; flex-direction: column; gap: 6px; }
.clue-row { display: flex; gap: 10px; align-items: flex-start; padding: 8px; border: 1px solid #263041; border-radius: 8px; }
.clue-row.revealed { opacity: .6; }
.clue-toggle { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #2a3542; background: #161d27; color: #cfe0f0; font-size: 16px; flex: 0 0 auto; }
.clue-body { flex: 1; }
.clue-label { font-size: 13px; color: #e7eef6; }
.clue-ess { font-size: 9px; text-transform: uppercase; letter-spacing: .08em; color: #ffd479; border: 1px solid #4a3a1f; border-radius: 10px; padding: 1px 6px; }
.clue-act { font-size: 10px; color: #7f8ea0; }
.clue-fallback { margin-top: 4px; font-size: 12px; color: #ff9c9c; }
.clue-empty { color: #6b7a8d; font-size: 12px; }
```

- [ ] **Step 7: Run tests + full suite + build**

Run: `npx vitest run tests/components/gm-shell-clues.test.js`
Expected: PASS (4 tests).
Run: `npm test`
Expected: all tests PASS (Slices 1–4).
Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 8: Manual visual check**

`npm run dev` — the rail shows a 🔍 chip; opening it against AFTERIMAGE (clues `[]`) shows the empty state. (To see it populated, temporarily load `example-with-clues.js`.) Confirm: banner reads the essential-gap count, tapping a clue's ○ toggles it ●, the banner flips to "Solvable ✓" once all essentials are on, and missing essentials show their fallback.

- [ ] **Step 9: Commit**

```bash
git add src/components/gm-shell.js src/components/director-rail.js src/styles.css src/scenarios/example-with-clues.js tests/components/gm-shell-clues.test.js
git commit -m "feat: wire clue safety-net into shell + rail; add example scenario"
```

---

## Self-Review

**Spec coverage (design §10 Slice 4 / #2 safety-net → task):** "reads scenario `clues[]`, shows which essential clues are still missing to reach an ending + which fallback delivers each" → Task 1 (`analyzeClues` → `missingEssential` with fallbacks + `solvable`), Task 2 (`<clue-net>` banner + per-clue fallback), Task 3 (fed from `scenario.clues`, persisted revealed set, rail chip). Works with zero config (empty clues → empty state, vacuously solvable).

**No fabricated content:** shipped scenarios keep `clues: []`; the only populated clue data is `example-with-clues.js`, explicitly headered as a template.

**Placeholder scan:** none — all steps carry complete code.

**Type consistency:** `analyzeClues(clues, revealed)` → `{ total, revealedCount, essentialTotal, essentialRevealed, missingEssential, solvable }` (Task 1) is consumed by `<clue-net>` (Task 2). `<clue-net>` `clues`/`revealed` setters + `toggle-clue` event `{id}` (Task 2) are driven by the shell (Task 3). `open-tool` tool id `'clues'` matches between the rail chip (Task 3 rail edit) and the shell tray map (Task 3). Store key `revealedClues` under namespace `meta.id` is written and read in Task 3. `escapeHtml` (existing) is used for all author text in Task 2.
