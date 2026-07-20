import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/gm-shell.js';
import afterimage from '../../src/scenarios/afterimage.js';

describe('<gm-shell> parking-lot', () => {
  let el, t;
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    t = 0;
    el = document.createElement('gm-shell');
    el.now = () => t;
    document.body.appendChild(el);
    el.loadScenario(afterimage);
  });

  it('mounts a hidden parking-lot, revealed by open-tool parking', () => {
    expect(el.querySelector('parking-lot').hidden).toBe(true);
    el.dispatchEvent(new CustomEvent('open-tool', { detail: { tool: 'parking' }, bubbles: true }));
    expect(el.querySelector('parking-lot').hidden).toBe(false);
  });

  it('parks a note stamped with the session time and persists it', () => {
    el.startSession();
    t = 83 * 60000; // 1:23 into the session
    el.dispatchEvent(new CustomEvent('add-note', { detail: { text: 'ledger thread' }, bubbles: true }));
    expect(el.parkingLot).toEqual([{ at: 83 * 60000, text: 'ledger thread' }]);
    const persisted = JSON.parse(localStorage.getItem('gmd.afterimage.parkingLot'));
    expect(persisted).toEqual([{ at: 83 * 60000, text: 'ledger thread' }]);
    expect(el.querySelector('parking-lot').notes.length).toBe(1);
  });

  it('removes a note by index and persists the change', () => {
    el.dispatchEvent(new CustomEvent('add-note', { detail: { text: 'a' }, bubbles: true }));
    el.dispatchEvent(new CustomEvent('add-note', { detail: { text: 'b' }, bubbles: true }));
    el.dispatchEvent(new CustomEvent('remove-note', { detail: { index: 0 }, bubbles: true }));
    expect(el.parkingLot.map((n) => n.text)).toEqual(['b']);
    expect(JSON.parse(localStorage.getItem('gmd.afterimage.parkingLot')).map((n) => n.text)).toEqual(['b']);
  });

  it('reloads parked notes from the store', () => {
    localStorage.setItem('gmd.afterimage.parkingLot', JSON.stringify([{ at: 0, text: 'kept' }]));
    document.body.innerHTML = '';
    const el2 = document.createElement('gm-shell');
    el2.now = () => 0;
    document.body.appendChild(el2);
    el2.loadScenario(afterimage);
    expect(el2.querySelector('parking-lot').notes.map((n) => n.text)).toEqual(['kept']);
  });

  it('the rail exposes a parking chip that emits open-tool', () => {
    const rail = el.querySelector('director-rail');
    let tool = null;
    el.addEventListener('open-tool', (e) => { tool = e.detail.tool; });
    rail.querySelector('[data-role=open-parking]').click();
    expect(tool).toBe('parking');
  });
});
