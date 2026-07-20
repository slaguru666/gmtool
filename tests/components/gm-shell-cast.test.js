import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/gm-shell.js';
import afterimage from '../../src/scenarios/afterimage.js';

describe('<gm-shell> cast tray', () => {
  let el;
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    el = document.createElement('gm-shell');
    el.now = () => 0;
    document.body.appendChild(el);
    el.loadScenario(afterimage);
  });

  it('mounts a hidden cast-tray fed from the scenario cast', () => {
    const tray = el.querySelector('cast-tray');
    expect(tray).not.toBe(null);
    expect(tray.hidden).toBe(true);
    expect(tray.cast.length).toBe(afterimage.cast.length);
  });

  it('open-tool cast reveals the cast-tray', () => {
    el.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'cast' }, bubbles: true }));
    expect(el.querySelector('cast-tray').hidden).toBe(false);
  });

  it('opening the cast tray hides the other trays', () => {
    el.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'clues' }, bubbles: true }));
    el.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'cast' }, bubbles: true }));
    expect(el.querySelector('clue-net').hidden).toBe(true);
    expect(el.querySelector('cast-tray').hidden).toBe(false);
  });

  it('the rail exposes a cast chip that emits open-tool', () => {
    const rail = el.querySelector('director-rail');
    let tool = null;
    el.addEventListener('open-tool', (e) => { tool = e.detail.tool; });
    rail.querySelector('[data-role=open-cast]').click();
    expect(tool).toBe('cast');
  });
});
