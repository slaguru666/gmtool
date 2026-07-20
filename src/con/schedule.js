// Pure convention-schedule analysis. Given slots and a wall-clock `nowMs`,
// classify each slot as done | live | next | upcoming and surface the live/up-next.
// Slots carry `startsAt` (ISO string) for timing logic; a null/absent start is
// treated as unscheduled (sorted last, never live/next) so the hub still lists it.
export function slotStartMs(slot) {
  if (typeof slot.startMs === 'number') return slot.startMs;
  if (slot.startsAt) {
    const t = Date.parse(slot.startsAt);
    if (!Number.isNaN(t)) return t;
  }
  return Infinity;
}

export function analyzeSchedule(slots = [], nowMs = 0) {
  const enriched = slots
    .map((s) => {
      const startMs = slotStartMs(s);
      const endMs = startMs === Infinity ? Infinity : startMs + (s.playMinutes ?? 0) * 60000;
      return { ...s, startMs, endMs };
    })
    .sort((a, b) => a.startMs - b.startMs);

  let nextAssigned = false;
  const outSlots = enriched.map((s) => {
    let status;
    if (s.startMs === Infinity) status = 'upcoming';
    else if (nowMs >= s.endMs) status = 'done';
    else if (nowMs >= s.startMs) status = 'live';
    else if (!nextAssigned) { status = 'next'; nextAssigned = true; }
    else status = 'upcoming';
    return { ...s, status };
  });

  return {
    slots: outSlots,
    liveNow: outSlots.find((s) => s.status === 'live') || null,
    upNext: outSlots.find((s) => s.status === 'next') || null,
  };
}
