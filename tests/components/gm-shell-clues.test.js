import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/gm-shell.js';
import example from '../../src/scenarios/example-with-clues.js';

describe('<gm-shell> clue safety-net', () => {
  let el;
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    el = document.createElement('gm-shell');
    el.now = () => 0;
    document.body.appendChild(el);
    el.loadScenario(example);
  });

  it('mounts a hidden clue-net fed from the scenario clues', () => {
    const net = el.querySelector('clue-net');
    expect(net).not.toBe(null);
    expect(net.hidden).toBe(true);
    expect(net.clues.length).toBe(example.clues.length);
  });

  it('open-tool clues reveals the clue-net', () => {
    el.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'clues' }, bubbles: true }));
    expect(el.querySelector('clue-net').hidden).toBe(false);
  });

  it('toggle-clue records the id, persists it, and updates the net', () => {
    const id = example.clues[0].id;
    el.dispatchEvent(new CustomEvent('toggle-clue', { detail: { id }, bubbles: true }));
    expect(el.revealedClues).toContain(id);
    const persisted = JSON.parse(localStorage.getItem('gmd.' + example.meta.id + '.revealedClues'));
    expect(persisted).toContain(id);
    expect(el.querySelector('clue-net').revealed).toContain(id);
    // toggling again removes it
    el.dispatchEvent(new CustomEvent('toggle-clue', { detail: { id }, bubbles: true }));
    expect(el.revealedClues).not.toContain(id);
  });

  it('the rail exposes a clues chip that emits open-tool', () => {
    const rail = el.querySelector('director-rail');
    let tool = null;
    el.addEventListener('open-tool', (e) => { tool = e.detail.tool; });
    rail.querySelector('[data-role=open-clues]').click();
    expect(tool).toBe('clues');
  });
});
