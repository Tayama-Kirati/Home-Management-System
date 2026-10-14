import { DAYS, ageCapacity } from '../constants/chores';
import { isoLocal, parseLocal, shiftDays, fmtShort } from './dates';

export { isoLocal, parseLocal, shiftDays, fmtShort };

export const weekStart = (s = isoLocal(new Date())) => {
  const d = parseLocal(s);
  const dow = (d.getDay()+6)%7; // Monday = 0
  d.setDate(d.getDate()-dow);
  return isoLocal(d);
};
export const weekDates = week => DAYS.map((day,i) => ({ day, date: shiftDays(week,i) }));
const weekIndex = week => Math.round(parseLocal(week).getTime() / (7*864e5));

export const choreWeight = c => (Number(c.minutes)||15) * (1 + ((Number(c.effort)||1)-1)*0.5);

// Every household member (accounts + members without a login) merged with their chore profile.
export function getMembers(users, sharedData) {
  const profiles = sharedData.choreProfiles || {};
  const extras = sharedData.choreExtraMembers || [];
  const base = [
    ...users.map(u => ({ id:u.id, name:u.name, avatar:u.avatar, role:u.role, hasAccount:true })),
    ...extras.map(m => ({ ...m, hasAccount:false })),
  ];
  return base.map(m => {
    const p = profiles[m.id] || {};
    const ageSet = p.age !== undefined && p.age !== "";
    // Unknown age: assume a child is 10 and everyone else an adult, and flag it in the UI.
    const age = ageSet ? Number(p.age) : (m.role==="Child" ? 10 : 30);
    return {
      ...m,
      age, ageSet,
      likes: p.likes || [],
      dislikes: p.dislikes || [],
      availableDays: p.availableDays?.length ? p.availableDays : DAYS,
      maxMinutesPerDay: p.maxMinutesPerDay ? Number(p.maxMinutesPerDay) : null,
      participates: p.participates !== false,
      capacity: ageCapacity(age),
    };
  });
}

// Expand the chore list + routines into concrete chore occurrences for one week.
export function buildOccurrences(library, routines, week) {
  const byId = Object.fromEntries(library.map(c => [c.id, c]));
  const activeRoutines = routines.filter(r => r.active !== false);
  const inRoutine = new Set(activeRoutines.flatMap(r => r.choreIds));
  const dates = weekDates(week);
  const occ = [];

  for (const r of activeRoutines) {
    for (const { day, date } of dates) {
      if (!r.days.includes(day)) continue;
      for (const cid of r.choreIds) {
        const c = byId[cid];
        if (!c || c.active === false) continue;
        occ.push({ chore:c, day, date, timeOfDay:r.timeOfDay, routineId:r.id, routineName:r.name, ownerId:r.ownerId||null });
      }
    }
  }

  const evenWeek = weekIndex(week) % 2 === 0;
  for (const c of library) {
    if (c.active === false || inRoutine.has(c.id)) continue;
    if (c.frequency === "Bi-weekly" && !evenWeek) continue;
    for (const { day, date } of dates) {
      if (!(c.days||[]).includes(day)) continue;
      if (c.frequency === "Monthly" && parseLocal(date).getDate() > 7) continue;
      occ.push({ chore:c, day, date, timeOfDay:c.timeOfDay || "Anytime", routineId:null, routineName:null, ownerId:null });
    }
  }
  return occ;
}

/**
 * Smart assignment. Greedy, most-constrained-first: each occurrence goes to the eligible
 * member with the lowest cost, where cost blends
 *   - workload relative to age-based capacity (fairness),
 *   - liked / disliked categories,
 *   - rotation (who did this chore last week),
 *   - how much they already have that day.
 * Eligibility = old enough, available that day, under their daily minute limit.
 */
export function smartAssign(occurrences, members, { usePrefs=true, rotate=true, previous=[] } = {}) {
  const people = members.filter(m => m.participates);
  const load = Object.fromEntries(people.map(m => [m.id, 0]));
  const dayLoad = Object.fromEntries(people.map(m => [m.id, {}]));
  // lastWeek[choreId][memberId] = share of that chore the member did last week (0..1)
  const lastWeek = {};
  for (const p of previous) ((lastWeek[p.choreId] ||= {})[p.assignedTo] = (lastWeek[p.choreId][p.assignedTo]||0) + 1);
  for (const c of Object.values(lastWeek)) { const t = Object.values(c).reduce((a,b)=>a+b,0); for (const k in c) c[k] /= t; }
  const repeats = Object.fromEntries(people.map(m => [m.id, {}]));

  const baseEligible = o => people.filter(m =>
    m.age >= (Number(o.chore.minAge)||0) && m.availableDays.includes(o.day));

  const results = new Array(occurrences.length);
  const book = (id, o, w) => {
    load[id] += w;
    dayLoad[id][o.day] = (dayLoad[id][o.day]||0) + (Number(o.chore.minutes)||0);
    repeats[id][o.chore.id] = (repeats[id][o.chore.id]||0) + 1;
  };

  // Routines with a fixed owner aren't up for negotiation, but they still count toward that person's load.
  const free = [];
  occurrences.forEach((o,i) => {
    const owner = o.ownerId && people.find(m=>m.id===o.ownerId);
    if (!owner) return free.push(i);
    book(owner.id, o, choreWeight(o.chore));
    results[i] = { ...o, assignedTo:owner.id, reason:`fixed owner of ${o.routineName}` };
  });

  const order = free
    .map(i => { const o = occurrences[i]; return { o, i, n: baseEligible(o).length, w: choreWeight(o.chore) }; })
    .sort((a,b) => a.n-b.n || b.w-a.w || a.i-b.i);

  for (const { o, i, w } of order) {
    const pool = baseEligible(o);
    if (!pool.length) {
      const tooYoung = people.every(m => m.age < (Number(o.chore.minAge)||0));
      results[i] = { ...o, assignedTo:null, reason: tooYoung
        ? `Nobody meets the minimum age (${o.chore.minAge}+)`
        : `Nobody old enough is available on ${o.day}` };
      continue;
    }
    const underCap = pool.filter(m => !m.maxMinutesPerDay || (dayLoad[m.id][o.day]||0) + (Number(o.chore.minutes)||0) <= m.maxMinutesPerDay);
    const candidates = underCap.length ? underCap : pool;

    const cat = o.chore.category;
    const scored = candidates.map(m => {
      let cost = (load[m.id] + w) / m.capacity;
      const likes = usePrefs && m.likes.includes(cat);
      const dislikes = usePrefs && m.dislikes.includes(cat);
      if (likes) cost *= 0.7;
      if (dislikes) cost *= 1.6;
      const lastShare = rotate ? (lastWeek[o.chore.id]?.[m.id] || 0) : 0;
      const didLast = lastShare > 0;
      cost += w * 4 * lastShare / m.capacity;                        // rotation
      cost += w * 0.5 * (repeats[m.id][o.chore.id]||0) / m.capacity;  // variety within the week
      cost += (dayLoad[m.id][o.day]||0) * 0.4 / m.capacity;
      return { m, cost, likes, dislikes, didLast };
    }).sort((a,b) => a.cost-b.cost || a.m.id.localeCompare(b.m.id));

    const best = scored[0];
    const reasons = [];
    if (pool.length === 1) reasons.push(`only one ${o.chore.minAge ? `aged ${o.chore.minAge}+ and ` : ""}available`);
    if (best.likes) reasons.push(`enjoys ${cat}`);
    if (best.dislikes) reasons.push(`dislikes ${cat} but has the most room`);
    if (rotate && lastWeek[o.chore.id] && !best.didLast) reasons.push("rotated from last week");
    if (!underCap.length && pool.some(m=>m.maxMinutesPerDay)) reasons.push("everyone is over their daily limit");
    if (!reasons.length || (reasons.length===1 && best.likes)) reasons.push("most room left in their fair share");

    book(best.m.id, o, w);
    results[i] = { ...o, assignedTo:best.m.id, reason: reasons.join(" · ") };
  }
  return results;
}

// Per-member totals plus each member's fair share given their capacity.
export function workloadSummary(assignments, members) {
  const people = members.filter(m => m.participates);
  const totalCap = people.reduce((s,m)=>s+m.capacity,0) || 1;
  const totalMin = assignments.reduce((s,a)=>s+(a.assignedTo?Number(a.minutes ?? a.chore?.minutes)||0:0),0);
  return people.map(m => {
    const mine = assignments.filter(a=>a.assignedTo===m.id);
    const minutes = mine.reduce((s,a)=>s+(Number(a.minutes ?? a.chore?.minutes)||0),0);
    return { member:m, count:mine.length, minutes, fair: Math.round(totalMin*m.capacity/totalCap) };
  });
}
