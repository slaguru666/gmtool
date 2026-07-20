// Markdown → scenario-data generator (pure). Parses a structured scenario
// markdown file into the scenario model and emits a matching JS module.
//
// Format (see tools/example-scenario.md):
//   ---                              ← frontmatter → meta
//   id: example
//   title: EXAMPLE
//   system: year-zero
//   players: 4
//   playMinutes: 210
//   slot: Fri · Slot 2
//   ---
//   ## Timeline
//   - [0] The opening beat {hard} #a1-open
//   - [35] Parlor interview | cut: summarise the ledger
//   ## Clues
//   - The door-cam face {essential} {act: Act One} | fallback: the monologue cards
//   ## Cast
//   - MARY FLETCHER — Innkeeper; saw the watchers | secret: she saw Crowe sew
//
// Trailing tokens on any list item: `{flag}`, `{key: value}`, `| key: value`,
// and `#explicit-id`. IDs are auto-slugged from the label/name when not given.
import { validateScenario } from '../src/core/scenario.js';

// ---- parsing helpers ------------------------------------------------------
function slugify(s) {
  return String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function takeTrailingId(s) {
  const m = s.match(/\s+#([\w-]+)\s*$/);
  return m ? { id: m[1], rest: s.slice(0, m.index).trim() } : { id: null, rest: s };
}
function takeFlag(s, flag) {
  const re = new RegExp(`\\s*\\{${flag}\\}\\s*`);
  return re.test(s) ? { present: true, rest: s.replace(re, ' ').trim() } : { present: false, rest: s };
}
function takeBraceField(s, key) {
  const m = s.match(new RegExp(`\\{${key}:\\s*([^}]*)\\}`));
  return m ? { value: m[1].trim(), rest: s.replace(m[0], ' ').replace(/\s+/g, ' ').trim() } : { value: null, rest: s };
}
function takePipeField(s, key) {
  const idx = s.indexOf(`| ${key}:`);
  if (idx === -1) return { value: null, rest: s };
  return { value: s.slice(idx + `| ${key}:`.length).trim(), rest: s.slice(0, idx).trim() };
}

function parseFrontmatter(md) {
  const m = md.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) throw new Error('missing "---" frontmatter block at the top of the file');
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([\w-]+):\s*(.*)$/);
    if (mm) meta[mm[1]] = mm[2].trim();
  }
  for (const k of ['players', 'playMinutes']) {
    if (meta[k] != null && meta[k] !== '') {
      const n = Number(meta[k]);
      meta[k] = Number.isFinite(n) ? n : meta[k];   // keep e.g. "5–6" as a string
    }
  }
  return { meta, body: md.slice(m[0].length) };
}

function sections(body) {
  const out = {};
  let cur = null;
  for (const line of body.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) { cur = h[1].trim().toLowerCase(); out[cur] = out[cur] || []; continue; }
    if (cur && /^\s*-\s+/.test(line)) out[cur].push(line.replace(/^\s*-\s+/, '').trim());
  }
  return out;
}

function parseTimeline(items) {
  return items.map((raw) => {
    const t = takeTrailingId(raw);
    const cut = takePipeField(t.rest, 'cut');
    const mm = cut.rest.match(/^\[(\d+)\]\s*(.*)$/);
    if (!mm) throw new Error(`timeline beat needs a [minutes] prefix: "${raw}"`);
    const hard = takeFlag(mm[2], 'hard');
    const beat = { label: hard.rest.trim(), targetMin: Number(mm[1]) };
    if (t.id) beat.id = t.id;
    if (hard.present) beat.hardTrigger = true;
    if (cut.value) beat.cutHint = cut.value;
    return beat;
  });
}

function parseClues(items) {
  return items.map((raw) => {
    const t = takeTrailingId(raw);
    const fb = takePipeField(t.rest, 'fallback');
    const ess = takeFlag(fb.rest, 'essential');
    const act = takeBraceField(ess.rest, 'act');
    const clue = { label: act.rest.trim(), essential: ess.present };
    if (t.id) clue.id = t.id;
    if (act.value) clue.act = act.value;
    if (fb.value) clue.fallback = fb.value;
    return clue;
  });
}

function parseCast(items) {
  return items.map((raw) => {
    const t = takeTrailingId(raw);
    const sec = takePipeField(t.rest, 'secret');
    const pc = takeFlag(sec.rest, 'pc');
    const npc = takeFlag(pc.rest, 'npc');
    let name = npc.rest, note = null;
    const sep = npc.rest.match(/\s+[—–-]\s+/);
    if (sep) { name = npc.rest.slice(0, sep.index).trim(); note = npc.rest.slice(sep.index + sep[0].length).trim(); }
    const member = { name: name.trim(), kind: pc.present ? 'pc' : 'npc' };
    if (t.id) member.id = t.id;
    if (note) member.note = note;
    if (sec.value) member.secret = sec.value;
    return member;
  });
}

function assignIds(arr, keyField) {
  const used = new Set();
  for (const item of arr) {
    let id = item.id || slugify(item[keyField] || '') || 'x';
    const base = id;
    let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    item.id = id;
  }
}

export function parseScenarioMarkdown(md) {
  const { meta, body } = parseFrontmatter(md);
  const secs = sections(body);
  const timeline = parseTimeline(secs.timeline || []);
  const clues = parseClues(secs.clues || []);
  const cast = parseCast(secs.cast || []);
  assignIds(timeline, 'label');
  assignIds(clues, 'label');
  assignIds(cast, 'name');
  const scenario = { meta, timeline, clues, cast, props: [] };
  const errors = validateScenario(scenario);
  if (errors.length) throw new Error('invalid scenario: ' + errors.join('; '));
  return scenario;
}

// ---- emitting -------------------------------------------------------------
const q = (v) => "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";

export function emitScenarioModule(s) {
  const meta = [`id: ${q(s.meta.id)}`, `title: ${q(s.meta.title ?? s.meta.id)}`, `system: ${q(s.meta.system)}`];
  if (s.meta.players != null) meta.push(`players: ${typeof s.meta.players === 'number' ? s.meta.players : q(s.meta.players)}`);
  if (s.meta.playMinutes != null) meta.push(`playMinutes: ${typeof s.meta.playMinutes === 'number' ? s.meta.playMinutes : q(s.meta.playMinutes)}`);
  if (s.meta.slot != null) meta.push(`slot: ${q(s.meta.slot)}`);

  const rows = (arr, fn) => arr.map((x) => '    { ' + fn(x).join(', ') + ' },').join('\n');
  const timeline = rows(s.timeline, (b) => {
    const p = [`id: ${q(b.id)}`, `label: ${q(b.label)}`, `targetMin: ${b.targetMin}`];
    if (b.hardTrigger) p.push('hardTrigger: true');
    if (b.cutHint) p.push(`cutHint: ${q(b.cutHint)}`);
    return p;
  });
  const clues = rows(s.clues, (c) => {
    const p = [`id: ${q(c.id)}`, `label: ${q(c.label)}`, `essential: ${!!c.essential}`];
    if (c.act) p.push(`act: ${q(c.act)}`);
    if (c.fallback) p.push(`fallback: ${q(c.fallback)}`);
    return p;
  });
  const cast = rows(s.cast, (c) => {
    const p = [`id: ${q(c.id)}`, `name: ${q(c.name)}`, `kind: ${q(c.kind || 'npc')}`];
    if (c.note) p.push(`note: ${q(c.note)}`);
    if (c.secret) p.push(`secret: ${q(c.secret)}`);
    return p;
  });
  const block = (label, body) => `  ${label}: [${body ? '\n' + body + '\n  ' : ''}],`;

  return `export default {
  meta: { ${meta.join(', ')} },
  timeline: [
${timeline}
  ],
${block('clues', clues)}
${block('cast', cast)}
  props: [],
};
`;
}
