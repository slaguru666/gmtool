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

describe('<dice-tray> and device-only packs', () => {
  it('does not offer the ALIEN pack and reads an alien scenario as year-zero', () => {
    document.body.innerHTML = '';
    const el = document.createElement('dice-tray');
    document.body.appendChild(el);
    expect(el.querySelector('[data-pack-id="alien"]')).toBe(null);
    el.systemId = 'alien';
    el.sides = 10; el.count = 1;
    el.rng = () => 0.95; // d10 -> 10: two Year Zero successes
    el.roll();
    expect(el.last.verdict.successes).toBe(2);
  });
});
