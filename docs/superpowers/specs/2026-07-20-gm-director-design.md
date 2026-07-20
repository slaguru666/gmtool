# The Director — Convention GM Shell

**Design doc · 2026-07-20 · working name "The Director" (repo `gm-director`)**

A reusable, offline-first tablet app for running tabletop RPG sessions at conventions.
Its permanent feature is the **Director Rail** — an always-on pacing co-pilot — over a
pluggable shell that hosts any game system and any scenario. First deployment: Continuum
2026 (six slots, six systems). Continuum is a *tenant*, not the product.

---

## 1. Goals & non-goals

**Goals**
- Keep a hard-clocked convention slot (typically 3h30) on time without the GM doing mental arithmetic mid-scene.
- One consistent app across every system, so muscle memory carries from Friday to Sunday.
- Genuinely useful *generic* GM tools (dice, NPCs, art) available in any game.
- A single per-scenario data file as the source of truth, so content never drifts from the app.
- Reusable across future conventions and systems with no code changes — only new data/rule-packs.

**Non-goals (this project)**
- Not an online/VTT tool. No multiplayer, no accounts, no server-side anything.
- Not an at-the-table AI improv engine (rejected: unreliable on con wifi, breaks table presence).
- Not a rules engine that adjudicates outcomes — it rolls and *reports*; the GM decides.
- Not a character-builder or campaign manager.

## 2. Non-negotiable constraints

1. **Runs with no server, no wifi, no install ceremony.** Open it on the tablet and it works. Con networks are unreliable; a dead app mid-session is unacceptable.
2. **State survives reload and device swap.** Autosave to `localStorage`; export/import as JSON.
3. **Fast and reliable on an iPad.** Snappy touch targets, light animation, screen wake-lock.
4. **Degrade gracefully.** Any feature that *can* use the network (art generate, NPC polish) must remain fully functional without it. Network is a bonus, never load-bearing.
5. **The Rail never disappears.** Opening a tool must not hide the clock/drift/next-trigger.

## 3. Platform & architecture

- **Offline-first PWA.** Static files, service worker caches the whole app + assets for offline use, installable to the iPad home screen (also the on-ramp to a future native wrapper).
- **Framework-light, Web Components.** Custom elements give clean boundaries (shell / rail / engine / module) without a heavy framework. Minimal build step (bundle + service-worker asset manifest); no runtime framework dependency.
- **No mixed systems.** A scenario declares exactly one system; `meta.system` selects the dice rule-pack.

**Component model**

| Unit | Responsibility | Depends on |
|---|---|---|
| **Shell** | App frame, routing between scenarios, persistence, service worker, wake-lock, JSON export/import | localStorage |
| **Director Rail** | Always-on top bar: session clock, you-are-here + drift, next hard trigger, "Reached it", tray launcher | active Scenario (timeline) |
| **Tray tools** | Generic, system-agnostic drawers: Dice, NPC, Art, Break timer, Parking-lot note, Jump/correct beat, Wake-lock | Dice engine (for Dice); nothing else |
| **Dice engine** | One animated dice *core* (roll any dice) + pluggable **rule-packs** that interpret a roll (Year-Zero, d100-push, d6-pool, Panic&Glory, Verdict Die…) | — |
| **Scenario module** | A single data file describing one scenario (see §4). Later gains cast/clues/props behaviour. | Dice engine rule-pack id |
| **Clue safety-net** *(later spec)* | Reads scenario `clues[]`, shows which essential clues are still missing to reach an ending + which fallback delivers each | Scenario module |

Interfaces are narrow: the Rail reads a Scenario's `timeline`; the Dice tray asks the active rule-pack to interpret a roll; a scenario module is pure data plus (later) small hooks. Each unit is understandable and testable alone.

## 4. Scenario data model (the source of truth)

One structured JS module per scenario, hand-authored now, machine-generated from the scenario
markdown later (its own spec). Timeline authored in **relative minutes from Start**, never
wall-clock — con slots start late, and relative timing keeps drift honest.

```js
export default {
  meta: {
    id: "afterimage",
    title: "AFTERIMAGE",
    system: "year-zero",      // selects the dice rule-pack
    players: 4,
    playMinutes: 210,
    slot: "Fri · Slot 2",
  },
  timeline: [
    // targetMin = minutes after the GM taps Start
    { id: "a1-open",  act: 1, label: "The pier — the case lands", targetMin: 0,   hardTrigger: true },
    { id: "a1-parlor",act: 1, label: "Parlor 88 interview",       targetMin: 35,  cutHint: "Summarise the ledger; skip the tea ritual" },
    { id: "a2-market",act: 2, label: "The Market",                targetMin: 90,  hardTrigger: false },
    { id: "a2-doorcam",act:2, label: "Door-cam reveal",           targetMin: 120, hardTrigger: true, notes: "The pivot — do not let this slip past 2:15" },
    { id: "a3-pier",  act: 3, label: "Pier confrontation",        targetMin: 175, hardTrigger: true },
    { id: "epilogue", act: 4, label: "Baseline / ambiguous end",  targetMin: 200 },
  ],

  // Reserved — later specs consume these; the model has room now so we never repaint.
  clues: [],   // { id, label, essential, gatesBeat, routes:[…], fallback }
  cast:  [],   // { id, name, kind:"pc"|"npc", … }
  props: [],   // { id, label, kind:"image"|"text", src }
}
```

- `hardTrigger`: an immovable beat. The Rail counts down to the next one and flags it if it's slipping.
- `cutHint`: what to compress/drop if you reach this beat behind schedule — surfaced by the Rail when drift is negative.
- `players`, `playMinutes`, `slot`: metadata for the (future) con hub and for sizing the timeline.

## 5. The Director Rail

Permanent bar across the **top** (validated: most glanceable with the tablet flat on the table).

**Always-visible core**
- **Session clock** — elapsed since Start + wall-clock time.
- **You are here** — current beat label vs its `targetMin`, with a colour-coded **drift badge** (`+6 behind` / `−3 ahead`).
- **Next hard trigger** — label + live countdown.
- **"Reached it"** — the single primary action; stamps the actual time you hit the next beat, which recomputes drift. When you're behind, the current beat's `cutHint` is surfaced here.

**Tap-to-expand tray** (a drawer that drops from the rail over the dimmed console; the rail stays pinned)
- **Dice** — see §6.
- **NPC** — see §7.
- **Art** — see §8.
- **Break timer** — pauses the session clock ("back in 10") so meal breaks don't poison drift.
- **Parking-lot note** — one-tap, timestamped line to capture a thread to return to.
- **Jump / correct beat** — fix the tracker if the table skipped or reordered scenes.
- **Wake-lock toggle** — keep the screen alive.

Every tray tool works with **zero scenario config**, so the Rail is useful even before a scenario loads — that is what makes it a generic helper, not just a pacer.

## 6. Dice engine — one core, many rule-packs

- **Core** rolls arbitrary dice: d4, d6, d8, d10, d12, d20, d100, dF, plus pools, per-die modifiers, and custom sets. Dice render as their **polyhedral silhouettes**; each die in a pool takes a distinct muted colour (bone / slate / amber / rose / sage) for identity; light CSS/canvas tumble animation settles each die on its face.
- **Rule-packs** are interpreters layered on the same physical roll. `meta.system` loads one:
  - *Year-Zero* (Blade Runner): 6+ = success, 10+ = two, push adds stress on 1s.
  - *d100-push* (CoC/Pulp): success bands, bonus/penalty dice, push gating.
  - *d6-pool* (VANITY): Stumble/lone-1 verdicts, Push, Reckoning.
  - *Panic & Glory*, *Verdict Die*, etc. as each game is ported.
- **Success indication is independent of die colour** — a gold ring + 👁, so identity colour and outcome never clash.
- **Mode pills**: the loaded system's pack, or **"Any die"** for an off-book ruling. Same core, different reading.

This replaces the six separate dice implementations in the current per-game consoles with one engine + small packs.

## 7. NPC generator — offline tables, optional polish

- Pick a **genre pack** (Noir/Blade Runner, Folk-horror, Pulp, Western, Fantasy…), type a **seed** ("nervous dock foreman, owes money"), get a **stat-free but table-ready NPC**: name, look, manner, wants, a secret, a voice tic.
- Fully **offline** via curated per-genre weighted tables. Instant, no network.
- **Reroll** for variety; **Keep in cast** saves it into the session so it persists and appears in the (future) cast dashboard.
- **Optional online polish**: when connected, an LLM pass can smooth the prose. Never required — the table version is the backbone.

## 8. Art generator — hybrid, offline-first

- **Library (offline backbone).** In prep (online, via existing gen scripts), build a tagged **B&W pencil** asset bank. At the table you search ("rain-soaked detective, tired") and get instant matches; tap one to show **fullscreen to players**.
- **Generate (online bonus).** When there's wifi, type a prompt → new pencil image in seconds → **cached back into the library** so it's offline thereafter.
- The tool **degrades gracefully**: no wifi → library search only, clearly indicated; generate resumes when connected. Never load-bearing on the network.

## 9. Persistence, reliability, failure modes

- **State**: per-scenario `localStorage` key holds clock, checkpoint stamps, drift, tray state, kept NPCs, notes. **Export/import** the whole session as JSON for backup and device swap.
- **Service worker** precaches the app shell + bundled scenario assets so a cold, offline launch works.
- **Failure modes**: network down → art/NPC-polish degrade, everything else unaffected. localStorage cleared → session resets (mitigated by pre-con JSON export). Animation jank on old hardware → animation is cosmetic and skippable; results are always correct without it.

## 10. Pilot & roadmap (slices)

Each slice is its own spec → plan → build cycle.

- **Slice 1 (this build): the vertical proof.** Shell + service worker/PWA install + Director Rail (core + tray shell) + scenario data model + Dice engine (core + **Year-Zero** rule-pack) + Break timer / Parking-lot / Jump-beat / Wake-lock, proven end-to-end against the **AFTERIMAGE** pilot (most mature scenario, already has a module pattern to learn from).
- **Slice 2:** NPC generator (table-packs) + Art generator (library + online generate).
- **Slice 3:** additional rule-packs + port the remaining five scenarios (d100-push, d6-pool, Panic&Glory, Verdict Die, BRP).
- **Slice 4:** the Clue **safety-net** (project #2) — essential-clue gap tracker + fallbacks.
- **Slice 5:** the con **hub** (successor to `con-desk.html`) — all slots, live "up next / live now", deep-links into each scenario.
- **Later:** markdown → scenario-data generator; native iPad app wrapper (side project).

## 11. Open questions / deferred decisions

- Exact bundling/build tool (candidates: esbuild/Vite for a thin bundle + a small SW manifest step) — decide at plan time; must preserve `file://`-like reliability.
- NPC genre-pack table depth for Slice 2 (how many entries per field before it feels non-repetitive).
- Art prep-bank tagging scheme and how search matches tags (keyword vs simple fuzzy).
- Whether a "spotlight / quiet-player" nudge earns a place in the tray later (flagged, not scoped).
