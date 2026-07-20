import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/con-hub.js';

const CON = {
  meta: { id: 'demo', title: 'Demo Con' },
  slots: [
    { id: 's1', scenarioId: 'a',  title: 'Past Game', slot: 'Fri · S1', system: 'year-zero', players: 4, playMinutes: 60, startsAt: '2026-07-24T09:00:00Z' },
    { id: 's2', scenarioId: 'b',  title: 'Now Game',  slot: 'Fri · S2', system: 'coc-d100',  players: 5, playMinutes: 60, startsAt: '2026-07-24T12:00:00Z' },
    { id: 's3', scenarioId: null, title: 'Unported',  slot: 'Sat · S4', playMinutes: 60, startsAt: '2026-07-25T09:00:00Z' },
  ],
};

describe('<con-hub>', () => {
  let el;
  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('con-hub');
    el.now = () => Date.parse('2026-07-24T12:30:00Z');
    document.body.appendChild(el);
  });

  it('shows an empty state with no con', () => {
    expect(el.querySelector('[data-role=empty]')).not.toBe(null);
  });

  it('renders a card per slot with its status', () => {
    el.con = CON;
    expect(el.querySelectorAll('[data-slot-id]').length).toBe(3);
    expect(el.querySelector('[data-slot-id=s1]').dataset.status).toBe('done');
    expect(el.querySelector('[data-slot-id=s2]').dataset.status).toBe('live');
    expect(el.querySelector('[data-slot-id=s3]').dataset.status).toBe('next');
  });

  it('summarises the live session', () => {
    el.con = CON;
    expect(el.querySelector('[data-role=summary]').textContent).toContain('Now Game');
  });

  it('emits open-scenario for a ported slot', () => {
    el.con = CON;
    let detail = null;
    el.addEventListener('open-scenario', (e) => { detail = e.detail; });
    el.querySelector('[data-slot-id=s2] [data-role=open]').click();
    expect(detail).toEqual({ scenarioId: 'b' });
  });

  it('shows "not yet ported" and no open button for an unported slot', () => {
    el.con = CON;
    expect(el.querySelector('[data-slot-id=s3] [data-role=not-ready]')).not.toBe(null);
    expect(el.querySelector('[data-slot-id=s3] [data-role=open]')).toBe(null);
  });

  it('escapes author text', () => {
    el.con = { meta: { title: 'x' }, slots: [{ id: 'x', scenarioId: null, title: 'evil <b>', slot: 'a" <i>', playMinutes: 60 }] };
    expect(el.querySelector('[data-slot-id=x]').innerHTML).not.toContain('<b>');
  });
});
