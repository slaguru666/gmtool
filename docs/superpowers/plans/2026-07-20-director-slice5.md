# The Director — Slice 5 Implementation Plan

**Goal:** Add the convention **hub** — a landing screen listing every slot of a convention with
live **"live now / up next / done / upcoming"** status, that deep-links into each ported scenario
and lets the GM return to the hub from a running session.

**Architecture:** Same pattern as the other slices — a pure engine (`analyzeSchedule`) that classifies
slots from a wall-clock `now`, a `<con-hub>` light-DOM component that renders the slot list + summary
and emits `open-scenario`, a scenario **registry** (`src/scenarios/index.js`) resolving a slot's
`scenarioId` to its module, and shell routing that switches between the hub and a session (hiding the
Rail/stage in hub mode) plus a 🏠 rail chip to return. No fabricated content: only AFTERIMAGE is
ported, so `continuum-2026.js` marks the other four slots `scenarioId: null` ("Not yet ported") with
`startsAt: null` (times TBC, not invented); a clearly-labelled `example-con.js` provides fully-timed
slots as the demo/test fixture.

**Tech Stack:** JavaScript (ES modules, no TypeScript), Web Components (light DOM), Vite, Vitest +
jsdom. No new dependencies. Fully offline.

## Global Constraints

- **Offline-first, no runtime framework, light DOM, no TypeScript.**
- **Con model:** `{ meta: { id, title }, slots: [ { id, scenarioId, title, slot, system?, players?, playMinutes?, startsAt? } ] }`.
  `slot` is the display label; `startsAt` (ISO) drives timing; `scenarioId` deep-links via the registry
  (null ⇒ not yet ported). A null/absent `startsAt` ⇒ unscheduled: listed, never live/next.
- **Determinism:** `analyzeSchedule(slots, nowMs)` is pure; `<con-hub>` takes an injected `now()` like the shell.
- **Escaping:** all author text (titles, slot labels, systems) via `escapeHtml`.
- **Rail invariant preserved:** the hub is a *pre-session* screen; the Rail is hidden in hub mode and
  restored (never removed) when a session is open.

## Tasks (all complete)

1. **Schedule engine** — `src/con/schedule.js` (`analyzeSchedule`, `slotStartMs`) + `tests/con/schedule.test.js` (6).
2. **Scenario registry** — `src/scenarios/index.js` (`SCENARIOS`, `getScenario`) + `tests/scenarios/registry.test.js` (2).
3. **`<con-hub>` component** — `src/components/con-hub.js` + `tests/components/con-hub.test.js` (6).
4. **Con data** — `src/con/continuum-2026.js` (real slate, honest placeholders) + `src/con/example-con.js` (template/fixture).
5. **Shell + rail wiring** — `gm-shell.js` (`loadCon`/`showHub`/`showSession`/`onOpenScenario`, `open-hub`),
   `director-rail.js` (🏠 chip), `styles.css`, boot in `main.js` → `loadCon(continuum2026)` +
   `tests/components/gm-shell-hub.test.js` (4).

## Validation

- `npm test` → 122 passing (34 files); build succeeds (35 modules). Manual: hub renders the Continuum
  slate, "Open" deep-links AFTERIMAGE into a live Rail session, 🏠 returns to the hub. Console clean.

## Follow-up (completed after the slice)

- **All six Continuum 2026 slots ported + scheduled.** `continuum-2026.js` rewritten from the
  authoritative `con-desk.html` SLOTS array (real days/times/systems), every `startsAt` set so
  live/up-next is live. Five new scenario modules (`day-one`, `vain-crown`, `silvery-moon`,
  `chopper`, `princes-bride`) transcribe their timelines from the existing gm-utility consoles and
  are registered; `tests/con/continuum-2026.test.js` guards resolvability + schedule.
  - Correction found while porting: the real slate is **six** slots (Slot 5 *Silvery Moon* was
    missing from the first hub draft), and "Another Fine Mess" is *Get to the Chopper — Another Fine Mess*.

- **All six scenarios' clue trails ported** into the data model (transcribed from the console
  `CLUES`/`gbclue`/module sources via `extract-clues.mjs`), so the Slice 4 safety-net now works
  against real content. `tests/scenarios/clues.test.js` guards shape + solvability. The four
  GM-brief-sourced trails (afterimage, vain-crown, silvery-moon, chopper) mark every tracked
  clue `essential: true` (their source is a single curated spine); day-one and princes-bride carry
  the source's own essential/optional split.

- **All six scenarios' cast rosters ported** (NPCs, `kind: 'npc'`) via `extract-cast.mjs`, normalising
  the two source schemas (`{id,name,ess,sec}` consoles and `{name,tag,secret}` modules) to
  `{ id, name, kind, note, secret? }`. `tests/scenarios/cast.test.js` guards shape + unique ids.
  Note: the `cast` field has no UI consumer yet (the design reserves it for a future cast dashboard) —
  this is a data-model port. Pregens/PCs are intentionally excluded (separate character-sheet/handout system).

- **Cast tray built.** `<cast-tray>` (`src/components/cast-tray.js`) renders `scenario.cast` — name +
  one-line note, each secret behind a tap-to-reveal — wired into the shell (`cast` tool key) with a
  👥 rail chip. Reveal state is ephemeral component state. `tests/components/cast-tray.test.js` +
  `gm-shell-cast.test.js` cover it.

- **BRP dice pack built.** `brp-d100` (`src/dice/rulepacks/brp-d100.js`) — fumble on 100, critical
  ≤ skill/20, special ≤ skill/5, success ≤ skill (bands transcribed from the Day One console). Day
  One's `meta.system` switched from `coc-d100` to `brp-d100`. `tests/dice/brp-d100.test.js` covers it.

- **Break timer built.** `<break-timer>` pauses the session clock for a break (reusing the clock's
  existing `pause`/`resume`), so break time never poisons drift. Shell owns the pause/resume +
  persistence (`break` store key); the rail shows a ☕ on-break badge; `fmtCountdown` (M:SS) added to
  `format.js`. Tests: `break-timer.test.js`, `gm-shell-break.test.js` (incl. the drift-honesty case).

- **Parking-lot note + wake-lock built.** `<parking-lot>` captures timestamped threads (session-time
  stamp, persisted under `parkingLot`, 📝 chip). `src/core/wake-lock.js` is an injectable Screen Wake
  Lock controller (re-acquires on foreground, graceful no-op where unsupported), toggled by a 💡 rail
  chip that lights when active. Tests: `parking-lot.test.js`, `wake-lock.test.js`, `gm-shell-parking.test.js`,
  `gm-shell-wake.test.js`. This completes every design §5 tray tool.

- **Markdown → scenario-data generator built.** `tools/scenario-md.js` (pure parse + emit) +
  `tools/md-to-scenario.mjs` (CLI, `npm run gen:scenario`) turn a structured scenario markdown file
  into a validated scenario module. Deterministic parser over a defined format (frontmatter + Timeline
  / Clues / Cast lists) — not freeform-prose scraping. `tests/tools/scenario-md.test.js` (round-trip
  + validation); `tools/` is dev-only, never bundled.

## Still deferred (backlog)

- Online art "Generate" (needs wifi + a gen backend); native iPad wrapper.
