// Builds the microSD content for the Director Tab5 firmware (format 1).
// Returns a Map of path (relative to director/) → JSON-serialisable value.
import { SCENARIOS } from '../src/scenarios/index.js';
import { listGenrePacks, getGenrePack } from '../src/npc/packs/index.js';
import { listRulePacks, getRulePack } from '../src/dice/rulepacks/index.js';

const D100_VALUES = [1, 2, 3, 4, 5, 10, 11, 24, 25, 26, 49, 50, 51, 95, 96, 99, 100];
const D100_TARGETS = [0, 1, 19, 20, 21, 49, 50, 51, 99];
const YZ_POOLS = [[1], [6], [10], [1, 1, 5], [6, 10, 1], [12, 12], []];
const VANITY_POOLS = [[5], [1], [1, 1], [1, 1, 4], [5, 6, 1], [6, 6, 6], []];

function goldenInputs() {
  const cases = [];
  for (const sides of [6, 8, 10, 12]) {
    for (const pool of YZ_POOLS) cases.push({ pack: 'year-zero', sides, values: pool.map((v) => Math.min(v, sides)), params: {} });
  }
  for (const pack of ['coc-d100', 'brp-d100']) {
    for (const value of D100_VALUES) for (const target of D100_TARGETS) {
      cases.push({ pack, sides: 100, values: [value], params: { target } });
    }
  }
  for (const sides of [4, 6, 8, 10, 12]) {
    for (let value = 1; value <= sides; value++) cases.push({ pack: 'dee-sanction', sides, values: [value], params: {} });
  }
  for (let value = 1; value <= 6; value++) for (const san of [0, 5, 10, 15, 20, 25]) {
    cases.push({ pack: 'panic-glory', sides: 6, values: [value], params: { san } });
  }
  for (const pool of VANITY_POOLS) for (const difficulty of [0, 1, 2, 3]) {
    cases.push({ pack: 'vanity-d6', sides: 6, values: pool, params: { difficulty } });
  }
  return cases;
}

function successOf(packId, v) {
  if (packId === 'vanity-d6') return v.isSuccess;
  if (packId === 'year-zero') return null;
  return typeof v.success === 'boolean' ? v.success : null;
}

export function buildGoldenCases() {
  return goldenInputs().map((c) => {
    const pack = getRulePack(c.pack);
    const results = c.values.map((value) => ({ sides: c.sides, value }));
    const v = pack.interpret(results, c.params);
    return {
      ...c,
      summary: pack.summary(v),
      success: successOf(c.pack, v),
      canPush: !!v.canPush,
      detail: c.pack === 'panic-glory' ? v.band.effect : '',
    };
  });
}

export function buildTab5Export(now = new Date()) {
  const out = new Map();
  const scenarios = [];
  for (const [id, mod] of Object.entries(SCENARIOS)) {
    out.set(`scenarios/${id}.json`, JSON.parse(JSON.stringify(mod)));
    scenarios.push(`${id}.json`);
  }
  const tables = [];
  for (const { id } of listGenrePacks()) {
    out.set(`tables/${id}.json`, JSON.parse(JSON.stringify(getGenrePack(id))));
    tables.push(`${id}.json`);
  }
  const golden = buildGoldenCases();
  const covered = new Set(golden.map((c) => c.pack));
  for (const p of listRulePacks()) {
    if (!covered.has(p.id)) throw new Error(`no golden cases for rule pack ${p.id}`);
  }
  out.set('dice-golden.json', golden);
  out.set('manifest.json', { format: 1, exportedAt: now.toISOString(), scenarios, tables });
  return out;
}
