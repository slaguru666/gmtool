// DAY ONE — "London Falls" · Continuum 2026 · Fri Slot 1.
// Timeline transcribed from gm-utility/day-one-console.html (SCHED array).
// System is BRP; mapped to the d100 roller pack (no dedicated BRP pack yet).
export default {
  meta: { id: 'day-one', title: 'DAY ONE — London Falls', system: 'coc-d100', players: 6, playMinutes: 210, slot: 'Fri · Slot 1' },
  timeline: [
    { id: 'intro',  label: 'Intro done — six placed, alert fired, players converging', targetMin: 15 },
    { id: 'market', label: 'MARKET BREAKS — vendor bitten in full view, stampede (force it now if not yet)', targetMin: 60, hardTrigger: true },
    { id: 'act1',   label: 'Act One done — first infected met, group formed', targetMin: 75 },
    { id: 'cordon', label: 'CORDON FRAGMENT — "hold the north bank line — do not cross" (force by now)', targetMin: 150, hardTrigger: true },
    { id: 'act2',   label: 'Act Two done — pub resolved, reanimation witnessed, route chosen', targetMin: 165 },
    { id: 'cost',   label: 'THE COST — someone does not make it. Force it. Do not soften it', targetMin: 185, hardTrigger: true },
    { id: 'reach',  label: 'Bridge or boat reached', targetMin: 190 },
    { id: 'act3',   label: 'Act Three done — cost paid', targetMin: 195 },
    { id: 'epi',    label: 'Epilogue + debrief done — tangent seeded', targetMin: 210 },
  ],
  clues: [
    { id: 'c1', label: 'High-vis man was mid-breakfast when he stopped — onset is rapid, no warning stage.', essential: true, act: 'Act One' },
    { id: 'c2', label: 'Callum’s radio: "first reports… Elephant… 07:14" — more than three hours before the alert. The government knew.', essential: true, act: 'Act One', fallback: 'as the Market breaks, his radio crackles and he repeats the fragment aloud.' },
    { id: 'c3', label: 'Drone stream on social media — north bank panicking too; not localised.', essential: false, act: 'Act One' },
    { id: 'c4', label: 'BBC on the stall radio: "health emergency — do not approach persons showing disorientation." Evasive language.', essential: false, act: 'Act One' },
    { id: 'c5', label: 'Danny’s bite in the Blue Anchor — infection is already inside the "safe" space.', essential: true, act: 'Act Two', fallback: 'if nobody checks him, he turns in front of the group.' },
    { id: 'c6', label: 'Marcus’s drone stream — aerial London. City-wide. Much worse than they thought.', essential: true, act: 'Act Two' },
    { id: 'c7', label: 'Radio: "cordon… north bank… all units hold position" — south of the river is written off.', essential: true, act: 'Act Two', fallback: 'Marcus’s chat — "military on Embankment going NORTH not south — wtf".' },
    { id: 'c8', label: 'Helen is ex-Cabinet Office. "There’s a protocol for this. If they haven’t activated it, something went wrong before the alert." Names Meridian.', essential: false, act: 'Act Two' },
    { id: 'c9', label: 'Priya’s editor had Meridian whistleblower documents 48 hours ago. He didn’t run the story.', essential: false, act: 'Act Two' },
    { id: 'c10', label: 'Ryan’s bite in the pharmacy — post-alert bites already symptomatic. It is accelerating.', essential: false, act: 'Act Two' },
    { id: 'c11', label: 'Pete’s radio confirms the north-bank cordon — closes the loop.', essential: false, act: 'Act Three' },
    { id: 'c12', label: 'The RIB’s fuel gauge — check it before trusting the escape route.', essential: false, act: 'Act Three' },
  ],
  cast: [
    { id: 'fatima', name: 'FATIMA BALOGUN', kind: 'npc', note: 'Market stall owner — first competent adult voice' },
    { id: 'callum', name: 'PC CALLUM FRASER', kind: 'npc', note: 'Met constable, 28 — institution failing around him', secret: 'Heard "first reports… Elephant… 07:14" before comms went patchy. Hasn’t told anyone. When the cordon fragment lands, play his face first.' },
    { id: 'sharif', name: 'DR YASMIN SHARIF', kind: 'npc', note: 'Off-duty A&E consultant — will name what this is', secret: 'She wants to reach St Thomas’ — 2.5 km west. She is wrong. The state of Guy’s (visible from the car park) is the counter-argument. Losing her costs the group its best medic.' },
    { id: 'marcus', name: 'MARCUS', kind: 'npc', note: '19, livestreaming to 41,000 — walking liability', secret: 'Phone at 31%. When it dies, he’s just a scared 19-year-old — that’s a beat, not a punishment. Chat reports military massing at London Bridge north approach.' },
    { id: 'helen', name: 'HELEN', kind: 'npc', note: '"I’m sure it’s a gas leak." The bravest person here', secret: 'Thirty years Cabinet Office. "There’s a protocol for this. If they haven’t activated it, something went wrong before the alert." Names Meridian if trusted. THE MOMENT: once, she steps into danger for someone else. Play it straight. Recommended reanimation victim.' },
    { id: 'pete', name: 'PETE', kind: 'npc', note: 'Bridge Group foreman — triage with no good options', secret: 'Knows the cordon is real (someone in his group has a radio). Hasn’t told his people. Has already turned away two infected and dealt with the consequences — he is broken, not cruel.' },
    { id: 'minors', name: 'MINORS — Gordon · Danny · Declan & Ryan · Bridge Group', kind: 'npc', note: 'Stat as minors', secret: 'DANNY: bitten 40 min before the pub; jacket over the arm; turns if the group stays ~30 min — Sharif spots him in 5. RYAN is also bitten (blood on sleeve) — post-alert bites already symptomatic.' },
  ],
  props: [],
};
