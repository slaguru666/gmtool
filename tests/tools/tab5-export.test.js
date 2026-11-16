import { describe, it, expect } from 'vitest';
import { buildTab5Export } from '../../tools/tab5-export.js';
import { listRulePacks } from '../../src/dice/rulepacks/index.js';

const out = buildTab5Export();
const golden = out.get('dice-golden.json');
const find = (pack, values, params) =>
  golden.find((c) => c.pack === pack && JSON.stringify(c.values) === JSON.stringify(values)
    && JSON.stringify(c.params) === JSON.stringify(params));

describe('buildTab5Export', () => {
  it('writes a format-1 manifest listing every scenario and table', () => {
    const m = out.get('manifest.json');
    expect(m.format).toBe(1);
    expect(m.scenarios).toContain('afterimage.json');
    expect(m.tables).toContain('noir.json');
    for (const f of m.scenarios) expect(out.has(`scenarios/${f}`)).toBe(true);
    for (const f of m.tables) expect(out.has(`tables/${f}`)).toBe(true);
  });

  it('exports scenarios as JSON', () => {
    const s = out.get('scenarios/afterimage.json');
    expect(s.timeline.length).toBe(6);
    expect(s.meta.system).toBe('year-zero');
  });

  it('covers every rule pack in the golden cases', () => {
    const packs = new Set(golden.map((c) => c.pack));
    for (const p of listRulePacks()) expect(packs.has(p.id)).toBe(true);
  });

  it('records the CoC critical case', () => {
    const c = find('coc-d100', [1], { target: 50 });
    expect(c.summary).toBe('1 vs 50% → CRITICAL');
    expect(c.success).toBe(true);
  });

  it('records the panic-glory band effect as detail', () => {
    const c = find('panic-glory', [6], { san: 0 });
    expect(c.detail.startsWith('−1D10 SAN')).toBe(true);
  });
});

describe('mixed-pool and stress golden cases', () => {
  it('has year-zero cases mixing die sizes', () => {
    const mixed = golden.filter((c) => c.pack === 'year-zero' && c.dice && new Set(c.dice.map((d) => d.sides)).size > 1);
    expect(mixed.length).toBeGreaterThan(0);
    expect(mixed.some((c) => c.dice[0].sides === 10 && c.dice[1].sides === 8)).toBe(true);
  });

  it('has alien cases with a stress 1 (panic) and without', () => {
    const al = golden.filter((c) => c.pack === 'alien');
    expect(al.some((c) => c.dice.some((d) => d.stress && d.value === 1) && c.canPush === false)).toBe(true);
    expect(al.some((c) => c.canPush === true)).toBe(true);
    expect(al.every((c) => !('values' in c))).toBe(true);
  });
});
