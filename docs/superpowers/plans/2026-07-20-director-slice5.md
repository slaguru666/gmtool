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

## Deferred (backlog, not this slice)

- Real slot **start times** for Continuum 2026 (add each `startsAt` to light up live/up-next).
- Porting the four remaining scenarios (Day One, Vain Crown, Another Fine Mess, Prince's Bride) into
  scenario modules + registering them (then flip each slot's `scenarioId`).
