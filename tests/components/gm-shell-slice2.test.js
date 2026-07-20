import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/gm-shell.js';
import afterimage from '../../src/scenarios/afterimage.js';

describe('<gm-shell> slice 2 tools', () => {
  let el;
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    el = document.createElement('gm-shell');
    el.now = () => 0;
    document.body.appendChild(el);
    el.loadScenario(afterimage);
  });

  it('mounts the npc, art, and prop-viewer elements (trays hidden)', () => {
    expect(el.querySelector('npc-tray').hidden).toBe(true);
    expect(el.querySelector('art-tray').hidden).toBe(true);
    expect(el.querySelector('prop-viewer')).not.toBe(null);
  });

  it('open-tool reveals one tray and hides the others', () => {
    el.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'npc' }, bubbles: true }));
    expect(el.querySelector('npc-tray').hidden).toBe(false);
    expect(el.querySelector('dice-tray').hidden).toBe(true);
    el.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'art' }, bubbles: true }));
    expect(el.querySelector('art-tray').hidden).toBe(false);
    expect(el.querySelector('npc-tray').hidden).toBe(true);
  });

  it('keep-npc appends to cast and persists under the scenario namespace', () => {
    const npc = { name: 'Otto Brandt', genre: 'Noir', seed: 'foreman', look: 'x', manner: 'y', wants: 'z', secret: 's', voice: 'v' };
    el.dispatchEvent(new CustomEvent('keep-npc', { detail: npc, bubbles: true }));
    expect(el.cast).toHaveLength(1);
    expect(el.cast[0].name).toBe('Otto Brandt');
    const persisted = JSON.parse(localStorage.getItem('gmd.afterimage.cast'));
    expect(persisted[0].name).toBe('Otto Brandt');
  });

  it('show-prop opens the prop-viewer with the given image', () => {
    el.dispatchEvent(new CustomEvent('show-prop', { detail: { src: '/art/rain-pier.png', label: 'Pier' }, bubbles: true }));
    const viewer = el.querySelector('prop-viewer');
    expect(viewer.isOpen()).toBe(true);
    expect(viewer.querySelector('[data-role=prop-img]').getAttribute('src')).toBe('/art/rain-pier.png');
  });

  it('the rail exposes npc and art chips that emit open-tool', () => {
    const rail = el.querySelector('director-rail');
    let tool = null;
    el.addEventListener('open-tool', (e) => { tool = e.detail.tool; });
    rail.querySelector('[data-role=open-npc]').click();
    expect(tool).toBe('npc');
    rail.querySelector('[data-role=open-art]').click();
    expect(tool).toBe('art');
  });
});
