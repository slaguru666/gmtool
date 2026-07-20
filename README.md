# The Director

An offline-first tablet app for running tabletop RPG sessions at conventions.

Its permanent feature is the **Director Rail** — an always-on pacing co-pilot that keeps a
hard-clocked slot on time — sitting above a pluggable shell that hosts any game system and any
scenario. Built for face-to-face play: no server, no wifi, no install ceremony. Open it on the
tablet and it works.

> Working name "The Director". Repo `gmtool`. First deployment: Continuum 2026 — but built as a
> reusable product for any convention, not one con's materials.

## Status

**Slice 1 — complete.** Proven end-to-end against the AFTERIMAGE pilot scenario:

- **`<gm-shell>`** — root: owns the session clock, scenario, beat stamps, and persistence.
- **Director Rail** — session clock, "you are here" vs target with a live **drift** badge, next
  hard trigger countdown, and one-tap **"Reached it"** stamping (no mental arithmetic mid-scene).
- **Dice engine** — one seedable core (any die: d4–d100, dF, pools, modifiers) plus pluggable
  **system rule-packs** that interpret a roll. Ships with **Year-Zero** (6–9 = success, 10+ = two).
- **Scenario data model** — one structured file per scenario; the source of truth (see below).
- **Persistence** — namespaced `localStorage` with JSON export/import for backup and device swap.
- **Installable PWA** — a service worker precaches the shell so it launches offline.

Deferred to later slices: NPC generator, art generator, the rest of the tray tools, more
rule-packs and scenarios, and the clue safety-net. See the roadmap below.

## Quick start

```bash
npm install
npm run dev       # local dev server
npm test          # Vitest suite (jsdom)
npm run build     # static production build → dist/
npm run preview   # serve the production build
```

Requires Node ≥ 18. No runtime framework — the only dependencies are dev tools (Vite, Vitest, jsdom).

## Architecture

Vanilla ES modules and **Web Components** (light DOM) over a thin core of pure, deterministic
logic. All testable logic lives in `src/core` and `src/dice` and takes an injected `now` (ms) or
`rng` (`() => [0,1)`) — no `Date.now()` / `Math.random()` inside — so tests are fully deterministic.
Components are dumb renderers that emit events; the shell wires them together.

| Unit | Responsibility |
|---|---|
| `src/core/store.js` | Namespaced `localStorage` (`gmd.<namespace>.<key>`) + export/import |
| `src/core/clock.js` | Pure session clock: start / pause / resume / elapsed |
| `src/core/timeline.js` | Drift + next-hard-trigger analysis from the scenario timeline |
| `src/core/scenario.js` | Scenario validator |
| `src/core/format.js` | Elapsed + drift display formatting |
| `src/dice/roller.js` | Seedable dice core (pools, modifiers) |
| `src/dice/rulepacks/` | System interpreters (Year-Zero, CoC d100, BRP d100, VANITY d6, Panic & Glory, Dee Sanction) + registry |
| `src/npc/` | NPC generator (`generator.js`) + genre table packs (`packs/noir.js`) |
| `src/art/` | Pencil-art library search (`search.js`) + tagged manifest; online `generate.js` (configurable endpoint) + `library.js` (persisted, capped generated-art cache) |
| `src/clues/safety-net.js` | Clue safety-net engine (essential-gap + solvability) |
| `src/con/schedule.js` | Pure convention-schedule analysis (live / up-next / done / upcoming) |
| `src/components/con-hub.js` | `<con-hub>` — the convention landing screen; deep-links into a scenario |
| `src/scenarios/index.js` | Scenario registry (`getScenario(id)`) the hub deep-links through |
| `src/con/` | Convention data (`continuum-2026.js`; `example-con.js` is a fully-timed template) |
| `src/components/director-rail.js` | `<director-rail>` — the always-on pacing bar (🏠 🎲 👤 ✏️ 🔍 👥 ☕ chips; ☕ shows an on-break badge) |
| `src/components/dice-tray.js` | `<dice-tray>` — pack selector + die picker + roll + verdict |
| `src/components/npc-tray.js` · `art-tray.js` · `prop-viewer.js` · `clue-net.js` · `cast-tray.js` · `break-timer.js` · `parking-lot.js` | The tray tools (`cast-tray` = roster w/ tap-to-reveal secrets; `break-timer` pauses the clock so breaks never poison drift; `parking-lot` = timestamped thread capture) |
| `src/core/wake-lock.js` | Screen Wake Lock controller (keep the tablet awake; re-acquires on foreground; graceful no-op where unsupported) |
| `src/components/gm-shell.js` | `<gm-shell>` — root wiring + persistence |
| `src/scenarios/` | Scenario data files (six Continuum slots: `afterimage`, `day-one`, `vain-crown`, `silvery-moon`, `chopper`, `princes-bride`; `example-with-clues.js` is a template); `index.js` is the registry |
| `public/` | `manifest.webmanifest`, `sw.js` (offline service worker) |

## Scenario data model

A scenario is one JS module — the single source of truth the Rail reads. The timeline is authored
in **relative minutes from Start** (con slots begin late; relative timing keeps drift honest).

```js
export default {
  meta: { id: 'afterimage', title: 'AFTERIMAGE', system: 'year-zero', players: 4, playMinutes: 210, slot: 'Fri · Slot 2' },
  timeline: [
    // targetMin = minutes after the GM taps Start
    { id: 'a1-open',    label: 'The pier — the case lands', targetMin: 0,   hardTrigger: true },
    { id: 'a1-parlor',  label: 'Parlor 88 interview',       targetMin: 35,  cutHint: 'Summarise the ledger; skip the tea ritual' },
    { id: 'a2-doorcam', label: 'Door-cam reveal',           targetMin: 120, hardTrigger: true },
    // …
  ],
  clues: [], cast: [], props: [],   // reserved for later slices
}
```

`meta.system` selects the dice rule-pack. `hardTrigger` marks immovable beats; `cutHint` is what to
compress if you reach a beat behind schedule.

### Generating a scenario from markdown

Instead of hand-writing the module, author a scenario in a structured markdown file and generate it:

```bash
npm run gen:scenario -- input.md src/scenarios/my-scenario.js   # or omit the output path to print
```

The tool (`tools/scenario-md.js`, wrapped by `tools/md-to-scenario.mjs`) is a deterministic parser —
frontmatter → `meta`, and `## Timeline` / `## Clues` / `## Cast` lists → the arrays. See
[`tools/example-scenario.md`](tools/example-scenario.md) for the full format; in short:

```markdown
---
id: my-scenario
system: year-zero
players: 4
playMinutes: 210
---
## Timeline
- [0] The opening beat {hard} #a1-open        ← [minutes] label, {hard}, optional #id
- [35] Interview | cut: skip the tea ritual   ← | cut: … → cutHint
## Clues
- The door-cam face {essential} {act: Act One} | fallback: the monologue cards
## Cast
- MARY FLETCHER — Innkeeper; saw the watchers | secret: she saw Crowe sew
```

IDs are auto-slugged from the label/name when not pinned with `#id`. The output is validated against
`validateScenario` before it is written. It emits app data only, not prose — freeform con docs are
not parsed; you write the structured markdown. The `tools/` directory is dev-only (never bundled).

## Roadmap

1. **Slice 1** — shell + Director Rail + data model + dice engine (Year-Zero). ✅
2. **Slice 2** — NPC generator (offline genre tables) + art generator (offline pencil-art library). ✅
3. **Slice 3** — dice rule-packs (CoC d100, VANITY d6-pool, Panic & Glory, Dee Sanction) + tray pack selector. ✅
4. **Slice 4** — the clue **safety-net** (essential-clue gap tracker + fallbacks). ✅
5. **Slice 5** — the convention **hub** (all slots, live "live now / up next / done", deep-links into each scenario). ✅ All **six** Continuum 2026 slots ported and scheduled with real times.
6. **Later** — native iPad wrapper. (Everything else in the design is built: all §5 tray tools — dice, NPC, art with online Generate, clue-net, cast, break timer, parking-lot, wake-lock — plus the con hub, six ported scenarios, and the markdown → scenario-data generator.)

### Online art "Generate"

The art tray can generate new pencil art at the table and cache it into the searchable library (offline
thereafter). It needs a **GM-configured** image-gen endpoint — nothing is hardcoded and no key is baked
in. Paste your endpoint URL into the tray's ⚙ field (persisted). The endpoint receives `POST { prompt }`
and must reply JSON with an image under `image` | `src` | `url` | `dataUrl` (a `data:` URL makes the
result offline-cacheable), plus optional `label` / `tags`. With no endpoint or no network the Generate
button is disabled and the library stays fully searchable — the network is never load-bearing.

## Docs

- Design: [`docs/superpowers/specs/2026-07-20-gm-director-design.md`](docs/superpowers/specs/2026-07-20-gm-director-design.md)
- Slice 1 plan: [`docs/superpowers/plans/2026-07-20-director-slice1.md`](docs/superpowers/plans/2026-07-20-director-slice1.md)

---

*Personal convention-play tooling. System rule-references paraphrase their respective rulebooks for
private table use.*
