// Local-date helpers. Unlike toISOString(), these don't shift the date in UTC+ timezones (e.g. Nepal, UTC+5:45).
const pad = n => String(n).padStart(2,"0");
export const isoLocal = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
export const todayLocal = () => isoLocal(new Date());
export const parseLocal = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y,m-1,d); };
export const shiftDays = (s,n) => { const d = parseLocal(s); d.setDate(d.getDate()+n); return isoLocal(d); };
// Adds months, clamping the day so Jan 31 + 1 month = Feb 28/29.
export const shiftMonths = (s,n) => {
  const d = parseLocal(s), day = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth()+n);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()));
  return isoLocal(d);
};
export const daysBetween = (a,b) => Math.round((parseLocal(b)-parseLocal(a))/864e5);
export const fmtShort = s => parseLocal(s).toLocaleDateString("en-US",{month:"short",day:"numeric"});
export const fmtMonthYear = s => parseLocal(s).toLocaleDateString("en-US",{month:"short",year:"numeric"});
