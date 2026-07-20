import { describe, it, expect } from 'vitest';
import { analyzeSchedule, slotStartMs } from '../../src/con/schedule.js';

const at = (iso) => Date.parse(iso);

const SLOTS = [
  { id: 's1', title: 'Morning',   playMinutes: 60, startsAt: '2026-07-24T09:00:00Z' },
  { id: 's2', title: 'Midday',    playMinutes: 60, startsAt: '2026-07-24T12:00:00Z' },
  { id: 's3', title: 'Afternoon', playMinutes: 60, startsAt: '2026-07-24T15:00:00Z' },
  { id: 's4', title: 'Untimed',   playMinutes: 60 },
];

describe('analyzeSchedule', () => {
  it('classifies done / live / next / upcoming around now', () => {
    const r = analyzeSchedule(SLOTS, at('2026-07-24T12:30:00Z'));
    const byId = Object.fromEntries(r.slots.map((s) => [s.id, s.status]));
    expect(byId.s1).toBe('done');      // ended 10:00
    expect(byId.s2).toBe('live');      // 12:00–13:00
    expect(byId.s3).toBe('next');      // first future timed slot
    expect(byId.s4).toBe('upcoming');  // untimed, never next
    expect(r.liveNow.id).toBe('s2');
    expect(r.upNext.id).toBe('s3');
  });

  it('before the con: nothing live, earliest is next', () => {
    const r = analyzeSchedule(SLOTS, at('2026-07-24T06:00:00Z'));
    expect(r.liveNow).toBe(null);
    expect(r.upNext.id).toBe('s1');
    expect(r.slots.find((s) => s.id === 's2').status).toBe('upcoming');
  });

  it('after the con: everything done except the untimed slot', () => {
    const r = analyzeSchedule(SLOTS, at('2026-07-25T00:00:00Z'));
    expect(r.liveNow).toBe(null);
    expect(r.upNext).toBe(null);
    expect(r.slots.find((s) => s.id === 's1').status).toBe('done');
    expect(r.slots.find((s) => s.id === 's4').status).toBe('upcoming');
  });

  it('sorts slots by start time, untimed last', () => {
    const r = analyzeSchedule(SLOTS, 0);
    expect(r.slots.map((s) => s.id)).toEqual(['s1', 's2', 's3', 's4']);
  });

  it('treats an empty schedule as idle', () => {
    const r = analyzeSchedule([], 0);
    expect(r.slots).toEqual([]);
    expect(r.liveNow).toBe(null);
    expect(r.upNext).toBe(null);
  });

  it('slotStartMs falls back to Infinity when unscheduled', () => {
    expect(slotStartMs({})).toBe(Infinity);
    expect(slotStartMs({ startMs: 5 })).toBe(5);
    expect(slotStartMs({ startsAt: '2026-07-24T09:00:00Z' })).toBe(at('2026-07-24T09:00:00Z'));
  });
});
