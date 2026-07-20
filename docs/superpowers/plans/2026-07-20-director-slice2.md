# The Director — Slice 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two offline tray tools to the shell — an NPC generator (genre tables) and a pencil-art library (search + fullscreen prop) — wired into the Director Rail's tray alongside dice.

**Architecture:** Same vanilla ES-module Web Components over pure-logic cores. NPC generation is a pure function over a genre "table pack" with an injected `rng`; art search is a pure ranking function over a tagged manifest. Two new tray components (`<npc-tray>`, `<art-tray>`) plus a fullscreen `<prop-viewer>` overlay, all mounted and coordinated by `<gm-shell>`; the Rail gains NPC and Art tray chips.

**Tech Stack:** JavaScript (ES modules, no TypeScript), Web Components (light DOM), Vite, Vitest + jsdom. No new dependencies. Fully offline — no network features in this slice.

## Global Constraints

- **Offline-first:** every feature in this slice works with no server and no network. The online art "Generate" and online NPC "polish" are explicitly OUT of this slice.
- **No runtime framework:** custom elements only; only dev deps (vite, vitest, jsdom).
- **Determinism in logic:** no `Math.random()` / `Date.now()` inside `src/npc` or `src/art` — callers inject `rng` (`() => [0,1)`).
- **Persistence namespace:** scenario state uses namespace = `meta.id`; keys are `gmd.<namespace>.<key>`. This slice adds the key `cast` (kept NPCs).
- **Web Components use light DOM (no shadow root).** Tray components are hidden by default (`hidden` attribute), toggled by `<gm-shell>` on the Rail's `open-tool` event.
- **Tray tool events bubble to the shell:** `<gm-shell>` already listens for `open-tool` (detail `{ tool }`). This slice adds tools `'npc'` and `'art'` and new bubbling events `keep-npc` and `show-prop`.
- **Test env:** Vitest `environment: 'jsdom'`; a jsdom-backed `localStorage` shim is already installed via `tests/setup.js`.
- **Node:** ≥ 18.

**Existing interfaces this slice builds on (from Slice 1):**
- `src/core/store.js` → `createStore(namespace)` → `{ get(key, fallback), set, remove, exportAll, importAll }`.
- `src/components/gm-shell.js` → `<gm-shell>`: has `this.store`, `this.scenario`, `loadScenario(scenario)`, a `<main class="stage">` region, listens for `open-tool` (currently toggles `<dice-tray>.hidden` when `tool==='dice'`).
- `src/components/director-rail.js` → `<director-rail>`: renders a `.rail` with cells + a `data-role="open-dice"` chip that emits `open-tool` `{ tool:'dice' }`.
- `src/scenarios/afterimage.js` → `meta.system==='year-zero'`, `meta.id==='afterimage'`.

---

### Task 1: NPC genre table pack (Noir) + registry

**Files:**
- Create: `src/npc/packs/noir.js`
- Create: `src/npc/packs/index.js`
- Test: `tests/npc/packs.test.js`

**Interfaces:**
- Produces:
  - `noir` — `{ id: 'noir', label: 'Noir / Blade Runner', tables }` where `tables` has arrays: `firstNames`, `surnames`, `looks`, `manners`, `wants`, `secrets`, `voices` (each a non-empty array of strings).
  - `getGenrePack(id)` → pack or `null`; `listGenrePacks()` → array of `{ id, label }`.

- [ ] **Step 1: Write the failing test**

```js
// tests/npc/packs.test.js
import { describe, it, expect } from 'vitest';
import { noir } from '../../src/npc/packs/noir.js';
import { getGenrePack, listGenrePacks } from '../../src/npc/packs/index.js';

const FIELDS = ['firstNames', 'surnames', 'looks', 'manners', 'wants', 'secrets', 'voices'];

describe('noir genre pack', () => {
  it('has an id, label, and all non-empty tables', () => {
    expect(noir.id).toBe('noir');
    expect(noir.label).toMatch(/noir/i);
    for (const f of FIELDS) {
      expect(Array.isArray(noir.tables[f]), `${f} is array`).toBe(true);
      expect(noir.tables[f].length, `${f} non-empty`).toBeGreaterThanOrEqual(6);
      expect(noir.tables[f].every((x) => typeof x === 'string' && x.length > 0)).toBe(true);
    }
  });

  it('is resolvable from the registry', () => {
    expect(getGenrePack('noir')).toBe(noir);
    expect(getGenrePack('missing')).toBe(null);
    expect(listGenrePacks()).toEqual([{ id: 'noir', label: noir.label }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/npc/packs.test.js`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the noir pack**

```js
// src/npc/packs/noir.js
export const noir = {
  id: 'noir',
  label: 'Noir / Blade Runner',
  tables: {
    firstNames: ['Otto', 'Mara', 'Cyrus', 'Dita', 'Lev', 'Priya', 'Sol', 'Neena', 'Bram', 'Vesna'],
    surnames: ['Brandt', 'Okoye', 'Vance', 'Marlow', 'Sato', 'Kessler', 'Reyes', 'Dahl', 'Cole', 'Nyx'],
    looks: [
      'Heavyset, oil-stained cuffs, a rosary they keep touching',
      'Rail-thin, chrome tooth, coat two sizes too big',
      'Ex-military posture gone to seed, nicotine-yellow fingers',
      'Immaculate suit, one cracked lens in their glasses',
      'Burn scar down one wrist, always half in shadow',
      'Too-bright dye job, roots showing, tired eyes',
      'Synthetic-smooth skin that never quite reads as alive',
      'Missing a fingertip, hides the hand when they notice you looking',
    ],
    manners: [
      'Over-friendly, laughs a beat too late',
      'Answers questions with questions',
      'Won’t sit with their back to the door',
      'Counts their words like they cost money',
      'Flatters you, then watches to see if it landed',
      'Keeps checking a watch that isn’t there',
      'Talks fast when lying, slow when it’s worse',
    ],
    wants: [
      'The debt gone before their shift ends',
      'A name — someone else to take the fall',
      'Out of the city on the last transport',
      'To be believed, just once',
      'The photograph back before anyone else sees it',
      'Protection they’re too proud to ask for',
    ],
    secrets: [
      'Signed off the container they never inspected',
      'Is already talking to the other side',
      'The person you’re looking for is family',
      'Sold the access codes months ago',
      'Isn’t who their papers say they are',
      'Watched it happen and did nothing',
    ],
    voices: [
      'Says “you understand me?” after everything',
      'Never finishes the last word of a sentence',
      'Drops into a second language when rattled',
      'Calls everyone “friend” like a threat',
      'Over-enunciates, like reciting',
      'Laughs at their own lines before they land',
    ],
  },
};
```

- [ ] **Step 4: Write the registry**

```js
// src/npc/packs/index.js
import { noir } from './noir.js';

const packs = new Map([[noir.id, noir]]);

export function getGenrePack(id) { return packs.get(id) || null; }
export function registerGenrePack(pack) { packs.set(pack.id, pack); }
export function listGenrePacks() {
  return [...packs.values()].map((p) => ({ id: p.id, label: p.label }));
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/npc/packs.test.js`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/npc/packs/ tests/npc/packs.test.js
git commit -m "feat: NPC noir genre table pack + genre registry"
```

---

### Task 2: NPC generator (pure)

**Files:**
- Create: `src/npc/generator.js`
- Test: `tests/npc/generator.test.js`

**Interfaces:**
- Consumes: a genre pack `{ id, label, tables }` (Task 1).
- Produces: `generateNpc(pack, seed, rng)` → `{ genre, seed, name, look, manner, wants, secret, voice }`. `seed` is a freeform string echoed back verbatim (trimmed). Each of `look/manner/wants/secret/voice` is one entry picked from the matching table via `rng`; `name` is `"<firstName> <surname>"`. Picking uses `pick(arr, rng) = arr[Math.floor(rng() * arr.length)]`.

- [ ] **Step 1: Write the failing test**

```js
// tests/npc/generator.test.js
import { describe, it, expect } from 'vitest';
import { generateNpc } from '../../src/npc/generator.js';

const pack = {
  id: 'test', label: 'Test',
  tables: {
    firstNames: ['A', 'B'], surnames: ['X', 'Y'],
    looks: ['look0', 'look1'], manners: ['man0', 'man1'],
    wants: ['want0', 'want1'], secrets: ['sec0', 'sec1'], voices: ['voi0', 'voi1'],
  },
};
// deterministic rng replaying a fixed sequence
function seq(values) { let i = 0; return () => values[i++ % values.length]; }

describe('generateNpc', () => {
  it('assembles a character by picking from tables with the injected rng', () => {
    // order of picks: firstName, surname, look, manner, wants, secret, voice
    const rng = seq([0.0, 0.9, 0.9, 0.0, 0.9, 0.0, 0.9]);
    const npc = generateNpc(pack, '  nervous foreman  ', rng);
    expect(npc.name).toBe('A Y');       // 0.0->A, 0.9->Y
    expect(npc.look).toBe('look1');     // 0.9
    expect(npc.manner).toBe('man0');    // 0.0
    expect(npc.wants).toBe('want1');    // 0.9
    expect(npc.secret).toBe('sec0');    // 0.0
    expect(npc.voice).toBe('voi1');     // 0.9
    expect(npc.seed).toBe('nervous foreman'); // trimmed, echoed
    expect(npc.genre).toBe('Test');
  });

  it('is fully determined by the rng (same sequence -> same npc)', () => {
    const a = generateNpc(pack, 's', seq([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]));
    const b = generateNpc(pack, 's', seq([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]));
    expect(a).toEqual(b);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/npc/generator.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the generator**

```js
// src/npc/generator.js
function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

export function generateNpc(pack, seed, rng) {
  const t = pack.tables;
  const name = `${pick(t.firstNames, rng)} ${pick(t.surnames, rng)}`;
  return {
    genre: pack.label,
    seed: String(seed ?? '').trim(),
    name,
    look: pick(t.looks, rng),
    manner: pick(t.manners, rng),
    wants: pick(t.wants, rng),
    secret: pick(t.secrets, rng),
    voice: pick(t.voices, rng),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/npc/generator.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/npc/generator.js tests/npc/generator.test.js
git commit -m "feat: pure NPC generator over genre tables"
```

---

### Task 3: `<npc-tray>` component

**Files:**
- Create: `src/components/npc-tray.js`
- Test: `tests/components/npc-tray.test.js`

**Interfaces:**
- Consumes: `generateNpc` (Task 2), `getGenrePack`/`listGenrePacks` (Task 1).
- Produces: custom element `<npc-tray>` with settable `rng` (default `Math.random`) and `genreId` (default `'noir'`). Method `generate()` reads the seed input value, calls `generateNpc(getGenrePack(this.genreId), seed, this.rng)`, stores `this.last`, and re-renders. Elements: seed input `[data-role="seed"]`, generate button `[data-role="generate"]`, reroll button `[data-role="reroll"]` (also calls `generate()`), keep button `[data-role="keep"]`, and the rendered card in `[data-role="card"]` containing the npc name in `[data-role="npc-name"]`. Clicking keep emits bubbling `CustomEvent('keep-npc', { detail: this.last })`.

- [ ] **Step 1: Write the failing test**

```js
// tests/components/npc-tray.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/npc-tray.js';

function seq(values) { let i = 0; return () => values[i++ % values.length]; }

describe('<npc-tray>', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('npc-tray');
    document.body.appendChild(el);
  });

  it('renders a seed input and a generate button', () => {
    expect(el.querySelector('[data-role=seed]')).not.toBe(null);
    expect(el.querySelector('[data-role=generate]')).not.toBe(null);
  });

  it('generates an NPC card from the seed using the noir pack', () => {
    el.rng = seq([0.0]); // every pick -> index 0
    el.querySelector('[data-role=seed]').value = 'dock foreman';
    el.querySelector('[data-role=generate]').click();
    expect(el.last.seed).toBe('dock foreman');
    expect(el.last.genre).toMatch(/noir/i);
    expect(el.querySelector('[data-role=card]')).not.toBe(null);
    expect(el.querySelector('[data-role=npc-name]').textContent.length).toBeGreaterThan(0);
  });

  it('emits keep-npc with the generated npc when Keep is clicked', () => {
    el.rng = seq([0.0]);
    el.querySelector('[data-role=seed]').value = 'x';
    el.querySelector('[data-role=generate]').click();
    let detail = null;
    el.addEventListener('keep-npc', (e) => { detail = e.detail; });
    el.querySelector('[data-role=keep]').click();
    expect(detail).not.toBe(null);
    expect(detail.name).toBe(el.last.name);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/npc-tray.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the component**

```js
// src/components/npc-tray.js
import { generateNpc } from '../npc/generator.js';
import { getGenrePack, listGenrePacks } from '../npc/packs/index.js';

export class NpcTray extends HTMLElement {
  constructor() {
    super();
    this.rng = Math.random;
    this.genreId = 'noir';
    this.last = null;
    this._seedValue = '';
  }
  connectedCallback() { this.render(); }

  generate() {
    const input = this.querySelector('[data-role=seed]');
    this._seedValue = input ? input.value : '';
    const pack = getGenrePack(this.genreId);
    this.last = generateNpc(pack, this._seedValue, this.rng);
    this.render();
  }

  render() {
    const pills = listGenrePacks().map((p) =>
      `<button class="pill ${p.id === this.genreId ? 'on' : ''}" data-genre="${p.id}">${p.label}</button>`).join('');
    const n = this.last;
    const card = n ? `
      <div class="npc-card" data-role="card">
        <div class="npc-name" data-role="npc-name">${n.name}</div>
        <div class="npc-seed">${n.seed}</div>
        <dl>
          <dt>Look</dt><dd>${n.look}</dd>
          <dt>Manner</dt><dd>${n.manner}</dd>
          <dt>Wants</dt><dd>${n.wants}</dd>
          <dt>Secret</dt><dd class="secret">${n.secret}</dd>
          <dt>Voice</dt><dd>${n.voice}</dd>
        </dl>
        <div class="npc-actions">
          <button class="npc-btn" data-role="reroll">↻ Reroll</button>
          <button class="npc-btn keep" data-role="keep">＋ Keep in cast</button>
        </div>
      </div>` : '';

    this.innerHTML = `
      <div class="npc-tray">
        <div class="pills">${pills}</div>
        <input class="seed" data-role="seed" placeholder="a little info — e.g. nervous dock foreman" value="${this._seedValue}" />
        <button class="generate" data-role="generate">✦ Generate NPC</button>
        ${card}
      </div>`;

    this.querySelectorAll('[data-genre]').forEach((b) =>
      b.addEventListener('click', () => { this.genreId = b.dataset.genre; this.render(); }));
    this.querySelector('[data-role=generate]').addEventListener('click', () => this.generate());
    this.querySelector('[data-role=reroll]')?.addEventListener('click', () => this.generate());
    this.querySelector('[data-role=keep]')?.addEventListener('click', () => {
      if (this.last) this.dispatchEvent(new CustomEvent('keep-npc', { detail: this.last, bubbles: true }));
    });
  }
}
customElements.define('npc-tray', NpcTray);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/npc-tray.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/npc-tray.js tests/components/npc-tray.test.js
git commit -m "feat: <npc-tray> seed-to-character generator UI"
```

---

### Task 4: Art library search (pure)

**Files:**
- Create: `src/art/search.js`
- Test: `tests/art/search.test.js`

**Interfaces:**
- Produces: `searchArt(manifest, query)` → array of matching assets, ranked by number of query terms matched (descending), ties broken by the asset's original manifest order. `manifest` is `[{ id, src, tags: [string], label }]`. A `query` is split on whitespace into lowercased terms; an asset matches a term if the term is a substring of any of its `tags` or its `label` (case-insensitive). An empty/blank query returns the full manifest in original order.

- [ ] **Step 1: Write the failing test**

```js
// tests/art/search.test.js
import { describe, it, expect } from 'vitest';
import { searchArt } from '../../src/art/search.js';

const M = [
  { id: 'a', src: 'a.png', label: 'Detective in alley', tags: ['detective', 'alley', 'rain'] },
  { id: 'b', src: 'b.png', label: 'Neon street', tags: ['street', 'neon', 'rain'] },
  { id: 'c', src: 'c.png', label: 'Worn portrait', tags: ['portrait', 'face'] },
];

describe('searchArt', () => {
  it('returns the whole manifest for a blank query, in order', () => {
    expect(searchArt(M, '').map((x) => x.id)).toEqual(['a', 'b', 'c']);
    expect(searchArt(M, '   ').map((x) => x.id)).toEqual(['a', 'b', 'c']);
  });

  it('ranks by number of matched terms', () => {
    // "rain alley" -> a matches both (2), b matches rain (1), c matches none
    expect(searchArt(M, 'rain alley').map((x) => x.id)).toEqual(['a', 'b']);
  });

  it('matches substrings in tags or label, case-insensitive', () => {
    expect(searchArt(M, 'DETECT').map((x) => x.id)).toEqual(['a']);
    expect(searchArt(M, 'portrait').map((x) => x.id)).toEqual(['c']);
  });

  it('breaks rank ties by original manifest order', () => {
    // "rain" -> a and b both match once; a comes first in manifest
    expect(searchArt(M, 'rain').map((x) => x.id)).toEqual(['a', 'b']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/art/search.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the search**

```js
// src/art/search.js
export function searchArt(manifest, query) {
  const terms = String(query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [...manifest];

  const scored = manifest.map((asset, index) => {
    const hay = [asset.label, ...(asset.tags || [])].join(' ').toLowerCase();
    const score = terms.reduce((s, term) => s + (hay.includes(term) ? 1 : 0), 0);
    return { asset, index, score };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((r) => r.asset);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/art/search.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/art/search.js tests/art/search.test.js
git commit -m "feat: pure tag-ranked art library search"
```

---

### Task 5: Art manifest (seed data) + validator

**Files:**
- Create: `src/art/manifest.js`
- Test: `tests/art/manifest.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `artManifest` — default export, an array of `{ id, src, label, tags: [string] }` (a small seed set of placeholder pencil assets; `src` paths under `/art/`).
  - `validateArtManifest(m)` → array of error strings (empty = valid): each entry needs a non-empty `id`, a non-empty `src`, and a `tags` array.

- [ ] **Step 1: Write the failing test**

```js
// tests/art/manifest.test.js
import { describe, it, expect } from 'vitest';
import artManifest, { validateArtManifest } from '../../src/art/manifest.js';

describe('art manifest', () => {
  it('flags malformed entries', () => {
    expect(validateArtManifest([{ id: '', src: 'x', tags: [] }])).toContain('entry[0].id required');
    expect(validateArtManifest([{ id: 'a', src: '', tags: [] }])).toContain('entry[0].src required');
    expect(validateArtManifest([{ id: 'a', src: 'x' }])).toContain('entry[0].tags must be an array');
  });

  it('ships a valid, non-empty seed manifest with unique ids', () => {
    expect(validateArtManifest(artManifest)).toEqual([]);
    expect(artManifest.length).toBeGreaterThanOrEqual(3);
    const ids = artManifest.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(artManifest.every((a) => a.src.startsWith('/art/'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/art/manifest.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the manifest + validator**

```js
// src/art/manifest.js
export function validateArtManifest(m) {
  if (!Array.isArray(m)) return ['manifest must be an array'];
  const errors = [];
  m.forEach((a, i) => {
    if (!a || typeof a !== 'object') { errors.push(`entry[${i}] must be an object`); return; }
    if (!a.id) errors.push(`entry[${i}].id required`);
    if (!a.src) errors.push(`entry[${i}].src required`);
    if (!Array.isArray(a.tags)) errors.push(`entry[${i}].tags must be an array`);
  });
  return errors;
}

// Seed set of placeholder pencil assets. Real convention art is added here as data.
export default [
  { id: 'detective-alley', src: '/art/detective-alley.png', label: 'Detective in alley', tags: ['detective', 'alley', 'rain', 'coat', 'tired'] },
  { id: 'neon-street', src: '/art/neon-street.png', label: 'Neon street', tags: ['street', 'neon', 'rain', 'city', 'night'] },
  { id: 'worn-portrait', src: '/art/worn-portrait.png', label: 'Worn portrait', tags: ['portrait', 'face', 'worn', 'close-up'] },
  { id: 'doorway-figure', src: '/art/doorway-figure.png', label: 'Figure in a doorway', tags: ['doorway', 'figure', 'shadow', 'coat'] },
  { id: 'rain-pier', src: '/art/rain-pier.png', label: 'Pier in the rain', tags: ['pier', 'rain', 'water', 'night', 'wide'] },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/art/manifest.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/art/manifest.js tests/art/manifest.test.js
git commit -m "feat: seed pencil-art manifest + validator"
```

---

### Task 6: `<prop-viewer>` fullscreen overlay

**Files:**
- Create: `src/components/prop-viewer.js`
- Test: `tests/components/prop-viewer.test.js`

**Interfaces:**
- Produces: custom element `<prop-viewer>` with methods `show(src, label)` (renders a fullscreen overlay with an `<img>` at `data-role="prop-img"`, removes `hidden`) and `dismiss()` (adds `hidden`). Starts hidden. Clicking the overlay root (`[data-role="overlay"]`) calls `dismiss()`. Exposes `isOpen()` → boolean (`!hidden`).

- [ ] **Step 1: Write the failing test**

```js
// tests/components/prop-viewer.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/prop-viewer.js';

describe('<prop-viewer>', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('prop-viewer');
    document.body.appendChild(el);
  });

  it('starts hidden', () => {
    expect(el.isOpen()).toBe(false);
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('shows an image when show() is called', () => {
    el.show('/art/rain-pier.png', 'Pier in the rain');
    expect(el.isOpen()).toBe(true);
    const img = el.querySelector('[data-role=prop-img]');
    expect(img.getAttribute('src')).toBe('/art/rain-pier.png');
  });

  it('dismisses when the overlay is clicked', () => {
    el.show('/art/x.png', 'x');
    el.querySelector('[data-role=overlay]').click();
    expect(el.isOpen()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/prop-viewer.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the component**

```js
// src/components/prop-viewer.js
export class PropViewer extends HTMLElement {
  constructor() { super(); this._src = ''; this._label = ''; }
  connectedCallback() { if (!this.hasAttribute('hidden')) this.setAttribute('hidden', ''); this.render(); }

  isOpen() { return !this.hasAttribute('hidden'); }

  show(src, label = '') {
    this._src = src; this._label = label;
    this.removeAttribute('hidden');
    this.render();
  }
  dismiss() { this.setAttribute('hidden', ''); }

  render() {
    this.innerHTML = `
      <div class="prop-overlay" data-role="overlay">
        <img class="prop-img" data-role="prop-img" src="${this._src}" alt="${this._label}" />
      </div>`;
    this.querySelector('[data-role=overlay]').addEventListener('click', () => this.dismiss());
  }
}
customElements.define('prop-viewer', PropViewer);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/prop-viewer.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/prop-viewer.js tests/components/prop-viewer.test.js
git commit -m "feat: <prop-viewer> fullscreen prop overlay"
```

---

### Task 7: `<art-tray>` component

**Files:**
- Create: `src/components/art-tray.js`
- Test: `tests/components/art-tray.test.js`

**Interfaces:**
- Consumes: `searchArt` (Task 4), `artManifest` (Task 5).
- Produces: custom element `<art-tray>` with settable `manifest` (default `artManifest`). Renders a search input `[data-role="art-query"]` and a results grid `[data-role="art-results"]` of thumbnails, each a `[data-art-id]` element. Typing in the input (an `input` event) re-renders results via `searchArt(this.manifest, query)`. Clicking a thumbnail emits bubbling `CustomEvent('show-prop', { detail: { src, label } })`. Initial render (blank query) shows the full manifest.

- [ ] **Step 1: Write the failing test**

```js
// tests/components/art-tray.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/art-tray.js';

const M = [
  { id: 'a', src: '/art/a.png', label: 'Detective in alley', tags: ['detective', 'alley'] },
  { id: 'b', src: '/art/b.png', label: 'Neon street', tags: ['street', 'neon'] },
];

describe('<art-tray>', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('art-tray');
    el.manifest = M;
    document.body.appendChild(el);
  });

  it('shows the whole manifest before any search', () => {
    expect(el.querySelectorAll('[data-art-id]').length).toBe(2);
  });

  it('filters results as the query changes', () => {
    const input = el.querySelector('[data-role=art-query]');
    input.value = 'detective';
    input.dispatchEvent(new Event('input'));
    const ids = [...el.querySelectorAll('[data-art-id]')].map((n) => n.dataset.artId);
    expect(ids).toEqual(['a']);
  });

  it('emits show-prop when a thumbnail is clicked', () => {
    let detail = null;
    el.addEventListener('show-prop', (e) => { detail = e.detail; });
    el.querySelector('[data-art-id="b"]').click();
    expect(detail).toEqual({ src: '/art/b.png', label: 'Neon street' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/art-tray.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the component**

```js
// src/components/art-tray.js
import { searchArt } from '../art/search.js';
import artManifest from '../art/manifest.js';

export class ArtTray extends HTMLElement {
  constructor() {
    super();
    this.manifest = artManifest;
    this._query = '';
  }
  connectedCallback() { this.render(); }

  render() {
    const results = searchArt(this.manifest, this._query);
    const grid = results.map((a) => `
      <button class="thumb" data-art-id="${a.id}" title="${a.label}">
        <img src="${a.src}" alt="${a.label}" loading="lazy" />
        <span class="thumb-cap">${a.label}</span>
      </button>`).join('');

    this.innerHTML = `
      <div class="art-tray">
        <input class="art-query" data-role="art-query" placeholder="search pencil art — e.g. rain, detective" value="${this._query}" />
        <div class="art-results" data-role="art-results">${grid || '<div class="art-empty">No matches</div>'}</div>
      </div>`;

    const input = this.querySelector('[data-role=art-query]');
    input.addEventListener('input', () => { this._query = input.value; this.renderResults(); });
    this.bindThumbs();
  }

  // Re-render only the results (keeps input focus/caret stable while typing).
  renderResults() {
    const results = searchArt(this.manifest, this._query);
    const container = this.querySelector('[data-role=art-results]');
    container.innerHTML = results.map((a) => `
      <button class="thumb" data-art-id="${a.id}" title="${a.label}">
        <img src="${a.src}" alt="${a.label}" loading="lazy" />
        <span class="thumb-cap">${a.label}</span>
      </button>`).join('') || '<div class="art-empty">No matches</div>';
    this.bindThumbs();
  }

  bindThumbs() {
    this.querySelectorAll('[data-art-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const asset = this.manifest.find((a) => a.id === btn.dataset.artId);
        if (asset) this.dispatchEvent(new CustomEvent('show-prop', { detail: { src: asset.src, label: asset.label }, bubbles: true }));
      });
    });
  }
}
customElements.define('art-tray', ArtTray);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/art-tray.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/art-tray.js tests/components/art-tray.test.js
git commit -m "feat: <art-tray> pencil-art library search UI"
```

---

### Task 8: Wire NPC + Art into `<gm-shell>` and the Rail

**Files:**
- Modify: `src/components/gm-shell.js`
- Modify: `src/components/director-rail.js`
- Modify: `src/styles.css`
- Test: `tests/components/gm-shell-slice2.test.js`

**Interfaces:**
- Consumes: `<npc-tray>` (Task 3), `<art-tray>` (Task 7), `<prop-viewer>` (Task 6), existing `createStore`.
- Produces: `<gm-shell>` mounts `<npc-tray hidden>`, `<art-tray hidden>`, and `<prop-viewer>`; on `open-tool` toggles the matching tray (`'dice' | 'npc' | 'art'`) and hides the others; on `keep-npc` appends the npc to `this.cast` and persists it under store key `cast`; on `show-prop` calls the prop-viewer's `show(src, label)`. Adds `loadScenario` initialization of `this.cast` from the store. `<director-rail>` renders two more chips: `data-role="open-npc"` and `data-role="open-art"`, each emitting `open-tool` with the matching tool.

- [ ] **Step 1: Write the failing test**

```js
// tests/components/gm-shell-slice2.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/gm-shell.js';
import afterimage from '../../src/scenarios/afterimage.js';

describe('<gm-shell> slice 2 tools', () => {
  let el;
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    el = document.createElement('gm-shell');
    el.now = () => 0;
    document.body.appendChild(el);
    el.loadScenario(afterimage);
  });

  it('mounts the npc, art, and prop-viewer elements (trays hidden)', () => {
    expect(el.querySelector('npc-tray').hidden).toBe(true);
    expect(el.querySelector('art-tray').hidden).toBe(true);
    expect(el.querySelector('prop-viewer')).not.toBe(null);
  });

  it('open-tool reveals one tray and hides the others', () => {
    el.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'npc' }, bubbles: true }));
    expect(el.querySelector('npc-tray').hidden).toBe(false);
    expect(el.querySelector('dice-tray').hidden).toBe(true);
    el.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'art' }, bubbles: true }));
    expect(el.querySelector('art-tray').hidden).toBe(false);
    expect(el.querySelector('npc-tray').hidden).toBe(true);
  });

  it('keep-npc appends to cast and persists under the scenario namespace', () => {
    const npc = { name: 'Otto Brandt', genre: 'Noir', seed: 'foreman', look: 'x', manner: 'y', wants: 'z', secret: 's', voice: 'v' };
    el.dispatchEvent(new CustomEvent('keep-npc', { detail: npc, bubbles: true }));
    expect(el.cast).toHaveLength(1);
    expect(el.cast[0].name).toBe('Otto Brandt');
    const persisted = JSON.parse(localStorage.getItem('gmd.afterimage.cast'));
    expect(persisted[0].name).toBe('Otto Brandt');
  });

  it('show-prop opens the prop-viewer with the given image', () => {
    el.dispatchEvent(new CustomEvent('show-prop', { detail: { src: '/art/rain-pier.png', label: 'Pier' }, bubbles: true }));
    const viewer = el.querySelector('prop-viewer');
    expect(viewer.isOpen()).toBe(true);
    expect(viewer.querySelector('[data-role=prop-img]').getAttribute('src')).toBe('/art/rain-pier.png');
  });

  it('the rail exposes npc and art chips that emit open-tool', () => {
    const rail = el.querySelector('director-rail');
    let tool = null;
    el.addEventListener('open-tool', (e) => { tool = e.detail.tool; });
    rail.querySelector('[data-role=open-npc]').click();
    expect(tool).toBe('npc');
    rail.querySelector('[data-role=open-art]').click();
    expect(tool).toBe('art');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/gm-shell-slice2.test.js`
Expected: FAIL — new elements/handlers/chips not present.

- [ ] **Step 3: Add the Rail chips**

In `src/components/director-rail.js`, inside the `.rail` template string, replace the single dice chip button:

```js
        <button class="tray-btn" data-role="open-dice" aria-label="Dice">🎲</button>
```

with the three tool chips:

```js
        <button class="tray-btn" data-role="open-dice" aria-label="Dice">🎲</button>
        <button class="tray-btn" data-role="open-npc" aria-label="NPC">👤</button>
        <button class="tray-btn" data-role="open-art" aria-label="Art">✏️</button>
```

Then, after the existing `open-dice` listener block, add listeners for the two new chips:

```js
    this.querySelector('[data-role=open-npc]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'npc' }, bubbles: true }));
    });
    this.querySelector('[data-role=open-art]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'art' }, bubbles: true }));
    });
```

- [ ] **Step 4: Wire the shell**

In `src/components/gm-shell.js`, add imports at the top (after the existing component imports):

```js
import './npc-tray.js';
import './art-tray.js';
import './prop-viewer.js';
```

In the constructor, add cast state:

```js
    this.cast = [];
```

Replace the `connectedCallback` `innerHTML` assignment so the stage hosts all trays + the prop viewer:

```js
    this.innerHTML = `
      <director-rail></director-rail>
      <main class="stage">
        <dice-tray hidden></dice-tray>
        <npc-tray hidden></npc-tray>
        <art-tray hidden></art-tray>
      </main>
      <prop-viewer></prop-viewer>`;
    this.addEventListener('reached', () => this.onReached());
    this.addEventListener('open-tool', (e) => this.onOpenTool(e));
    this.addEventListener('keep-npc', (e) => this.onKeepNpc(e));
    this.addEventListener('show-prop', (e) => this.onShowProp(e));
```

In `loadScenario`, after `this.stamps = this.store.get('stamps', {});`, add:

```js
    this.cast = this.store.get('cast', []);
```

Replace `onOpenTool` so it toggles one tray and hides the others:

```js
  onOpenTool(e) {
    const tool = e.detail?.tool;
    const trays = { dice: 'dice-tray', npc: 'npc-tray', art: 'art-tray' };
    if (!(tool in trays)) return;
    const target = this.querySelector(trays[tool]);
    const willShow = target.hidden;
    for (const sel of Object.values(trays)) this.querySelector(sel).hidden = true;
    target.hidden = !willShow;
  }
```

Add the two new handlers (near `onReached`):

```js
  onKeepNpc(e) {
    this.cast = [...this.cast, e.detail];
    this.store.set('cast', this.cast);
  }

  onShowProp(e) {
    this.querySelector('prop-viewer').show(e.detail.src, e.detail.label);
  }
```

- [ ] **Step 5: Add styles**

Append to `src/styles.css`:

```css
/* Slice 2 tray tools */
.npc-tray, .art-tray { position: absolute; top: 0; left: 0; right: 0; background: #0f141b;
  border-bottom: 1px solid #2b3644; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.npc-tray[hidden], .art-tray[hidden] { display: none; }
.pills { display: flex; gap: 6px; flex-wrap: wrap; }
.pill { font-size: 12px; padding: 5px 11px; border-radius: 20px; border: 1px solid #2b3644; background: #161d27; color: #9fb0c2; }
.pill.on { background: #1e3a52; border-color: #3f7fb0; color: #dcefff; }
.seed, .art-query { background: #161d27; border: 1px solid #2a3542; border-radius: 8px; padding: 9px 11px; color: #e7eef6; font-size: 13px; }
.generate { border: none; padding: 10px; border-radius: 9px; background: #1c8a5a; color: #eafff4; font-weight: 700; }
.npc-card { background: #12171f; border: 1px solid #263041; border-radius: 10px; padding: 12px; }
.npc-name { font-size: 15px; font-weight: 700; } .npc-seed { font-size: 11px; color: #8fa1b4; margin-bottom: 8px; }
.npc-card dl { margin: 0; display: grid; grid-template-columns: 64px 1fr; gap: 4px 10px; font-size: 12px; }
.npc-card dt { color: #6b7a8d; text-transform: uppercase; font-size: 9px; letter-spacing: .1em; padding-top: 2px; }
.npc-card dd { margin: 0; color: #d6e0ea; } .npc-card dd.secret { color: #ff9c9c; }
.npc-actions { display: flex; gap: 8px; margin-top: 10px; } .npc-btn { flex: 1; padding: 9px; border: none; border-radius: 8px; background: #212a35; color: #aebccb; font-weight: 700; }
.npc-btn.keep { background: #1c8a5a; color: #eafff4; }
.art-results { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.thumb { border: 1px solid #2a3542; border-radius: 8px; background: #141b24; padding: 0; overflow: hidden; position: relative; }
.thumb img { width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block; }
.thumb-cap { position: absolute; bottom: 0; left: 0; right: 0; font-size: 9px; background: #0d1117cc; color: #cfe0f0; padding: 2px 4px; }
.art-empty { color: #6b7a8d; font-size: 12px; padding: 10px; }
.prop-overlay { position: fixed; inset: 0; background: #000000ee; display: flex; align-items: center; justify-content: center; z-index: 100; }
.prop-img { max-width: 96vw; max-height: 96vh; object-fit: contain; }
prop-viewer[hidden] { display: none; }
```

- [ ] **Step 6: Run tests + build**

Run: `npx vitest run tests/components/gm-shell-slice2.test.js`
Expected: PASS (5 tests).

Then run the full suite and build:
Run: `npm test`
Expected: all tests PASS (Slice 1 + Slice 2).
Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Manual visual check**

Run `npm run dev`, open the served URL, and confirm:
- the rail now shows three tool chips (🎲 👤 ✏️);
- tapping 👤 opens the NPC tray; typing a seed + Generate produces a character card; Keep persists it;
- tapping ✏️ opens the art library; typing filters thumbnails; tapping a thumbnail shows it fullscreen; tapping the overlay dismisses it.
Note: the seed pencil images under `/art/*.png` are placeholders and may 404 until real assets are added — layout and interactions still work (broken-image icons are expected).

- [ ] **Step 8: Commit**

```bash
git add src/components/gm-shell.js src/components/director-rail.js src/styles.css tests/components/gm-shell-slice2.test.js
git commit -m "feat: wire NPC + art trays and prop viewer into the shell"
```

---

## Self-Review

**Spec coverage (design doc → task):**
- §7 NPC generator (genre pack, seed → name/look/manner/wants/secret/voice, offline tables, Reroll, Keep-in-cast) → Tasks 1 (noir pack + registry), 2 (generator), 3 (`<npc-tray>` incl. reroll + keep), 8 (keep persists to `cast`). Online LLM polish is correctly deferred (Global Constraints).
- §8 Art generator — offline library backbone (tagged bank, search, tap-to-show-fullscreen) → Tasks 4 (search), 5 (manifest), 6 (`<prop-viewer>`), 7 (`<art-tray>`), 8 (show-prop wiring). Online "Generate" is correctly deferred per the user's Slice 2 decision.
- §5 tray (tools work with zero scenario config) → NPC and art trays need no scenario data; both mount and function against the empty pilot `cast`.
- §9 persistence (kept NPCs survive) → Task 8 persists `cast` under `gmd.<meta.id>.cast`; loaded on `loadScenario`.

**Deferred by design (not gaps):** online art Generate, online NPC polish, additional genre packs, real pencil-art assets (placeholder manifest ships; real art is data), the other tray tools (break timer, parking-lot note, jump/correct beat, wake-lock), and the clue safety-net remain out of this slice.

**Placeholder scan:** the only placeholders are the seed art PNGs (documented in Task 5 + Task 7 Step 7 as data-added-later; layout works without them). No code steps are left unspecified.

**Type consistency:** `generateNpc(pack, seed, rng)` → object shape (`genre/seed/name/look/manner/wants/secret/voice`) is produced in Task 2 and consumed identically in Tasks 3 (render) and 8 (keep/persist). `searchArt(manifest, query)` → asset array is produced in Task 4 and consumed in Task 7. Asset shape `{ id, src, label, tags }` is defined in Task 5 and used in Tasks 4, 7. `<prop-viewer>.show(src, label)` / `isOpen()` defined in Task 6, called in Task 8. `open-tool` tool ids `'dice'|'npc'|'art'` match between Task 3/7 chips (Task 8 rail edit) and the shell's `onOpenTool` map. Events `keep-npc` / `show-prop` dispatched in Tasks 3 / 7 and handled in Task 8.
