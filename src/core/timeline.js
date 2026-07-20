export function sortedTimeline(timeline) {
  return [...timeline].sort((a, b) => a.targetMin - b.targetMin);
}

export function nextUnreachedBeat(timeline, stamps) {
  const t = sortedTimeline(timeline);
  return t.find((b) => !(b.id in stamps)) || null;
}

export function analyze(timeline, elapsedMin, stamps) {
  const t = sortedTimeline(timeline);
  const reached = t.filter((b) => b.id in stamps);
  const currentBeat = reached.length ? reached[reached.length - 1] : null;
  const currentIndex = currentBeat ? t.findIndex((b) => b.id === currentBeat.id) : -1;
  const nextBeat = t[currentIndex + 1] || null;
  const nextHardTrigger = t.slice(currentIndex + 1).find((b) => b.hardTrigger) || null;
  const minutesToNextHard = nextHardTrigger ? nextHardTrigger.targetMin - elapsedMin : null;
  const driftMin = currentBeat ? stamps[currentBeat.id] - currentBeat.targetMin : null;
  return { currentBeat, nextBeat, nextHardTrigger, minutesToNextHard, driftMin, cutHint: nextBeat?.cutHint ?? null };
}
