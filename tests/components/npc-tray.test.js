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
