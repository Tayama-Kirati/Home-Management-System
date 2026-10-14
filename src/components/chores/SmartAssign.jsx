import { useState } from "react";
import { P, COLORS } from '../../constants/palette';
import { inp, btn } from '../../constants/styles';
import { catOf, slotOf } from '../../constants/chores';
import { genId } from '../../utils/helpers';
import { buildOccurrences, smartAssign, workloadSummary, weekStart, weekDates, shiftDays, fmtShort } from '../../utils/choreAI';
import { Card, Sec } from '../ui';
import { Avatar, LoadBar, Empty } from './shared';

const keyOf = x => `${x.choreId ?? x.chore?.id}|${x.date}|${x.routineId||""}`;

export default function SmartAssign({ library, routines, members, chores, setChores, onApplied }) {
  const thisWeek = weekStart();
  const [week,setWeek] = useState(thisWeek);
  const [usePrefs,setUsePrefs] = useState(true);
  const [rotate,setRotate] = useState(true);
  const [plan,setPlan] = useState(null);

  const doneKeys = new Set(chores.filter(c=>c.week===week && c.done).map(keyOf));

  const generate = () => {
    const occ = buildOccurrences(library, routines, week).filter(o => !doneKeys.has(keyOf(o)));
    const previous = chores.filter(c=>c.week===shiftDays(week,-7) && c.source==="plan").map(c=>({choreId:c.choreId,assignedTo:c.assignedTo}));
    setPlan(smartAssign(occ, members, { usePrefs, rotate, previous }));
  };

  const reassign = (i, id) => setPlan(p => p.map((a,j) => j===i ? { ...a, assignedTo:id||null, reason:"chosen by you" } : a));

  const apply = () => {
    const fresh = plan.map(a => ({
      id:genId(), source:"plan", week, date:a.date, day:a.day,
      choreId:a.chore.id, name:a.chore.name, category:a.chore.category, effort:a.chore.effort, minutes:a.chore.minutes,
      frequency:a.chore.frequency, timeOfDay:a.timeOfDay, routineId:a.routineId, routineName:a.routineName,
      assignedTo:a.assignedTo, reason:a.reason, done:false, doneBy:null, doneAt:null,
    }));
    // Replace this week's unfinished planned chores; keep manual and completed ones.
    setChores(cs => [...cs.filter(c => !(c.week===week && c.source==="plan" && !c.done)), ...fresh]);
    setPlan(null);
    onApplied(week, fresh.length);
  };

  const summary = plan ? workloadSummary(plan, members) : [];
  const unassigned = plan ? plan.filter(a=>!a.assignedTo).length : 0;
  const participants = members.filter(m=>m.participates);
  const existing = chores.filter(c=>c.week===week && c.source==="plan").length;

  return (
    <div>
      <Card>
        <Sec>🤖 Smart Assign</Sec>
        <p style={{fontSize:12.5,color:P.muted,margin:"0 0 14px",lineHeight:1.6}}>
          Builds the week from your <b>chore list</b> and <b>routines</b>, then shares the work out fairly.
          Each person gets a share that suits their age, chores they like are preferred, chores they dislike are avoided,
          nobody gets a chore they're too young for or on a day they're busy, and chores rotate from week to week.
          You can review and change anything before applying.
        </p>
        <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap",marginBottom:14}}>
          <select style={{...inp,width:"auto"}} value={week} onChange={e=>{setWeek(e.target.value);setPlan(null);}}>
            <option value={thisWeek}>This week ({fmtShort(thisWeek)} – {fmtShort(shiftDays(thisWeek,6))})</option>
            <option value={shiftDays(thisWeek,7)}>Next week ({fmtShort(shiftDays(thisWeek,7))} – {fmtShort(shiftDays(thisWeek,13))})</option>
          </select>
          <label style={{fontSize:12.5,color:P.navy,display:"flex",gap:6,alignItems:"center",cursor:"pointer"}}>
            <input type="checkbox" checked={usePrefs} onChange={e=>setUsePrefs(e.target.checked)} style={{accentColor:P.blue}}/> Use likes & dislikes
          </label>
          <label style={{fontSize:12.5,color:P.navy,display:"flex",gap:6,alignItems:"center",cursor:"pointer"}}>
            <input type="checkbox" checked={rotate} onChange={e=>setRotate(e.target.checked)} style={{accentColor:P.blue}}/> Rotate chores from last week
          </label>
        </div>
        <button style={{...btn,background:"linear-gradient(90deg,#2563a8,#7c3aed)"}} onClick={generate}
          disabled={!library.length || !participants.length}>
          ✨ {plan ? "Regenerate" : "Generate plan"}
        </button>
        {!library.length && <span style={{fontSize:12,color:P.muted,marginLeft:10}}>Add chores in the Chore List tab first.</span>}
        {existing>0 && !plan && <span style={{fontSize:12,color:P.muted,marginLeft:10}}>This week already has {existing} planned chores. Applying a new plan replaces the unfinished ones.</span>}
      </Card>

      {plan && !plan.length && <Empty>No chores fall in this week. Check the chores' days and frequency, or your routines.</Empty>}

      {plan && plan.length>0 && (
        <>
          <Card>
            <Sec>⚖️ Workload balance</Sec>
            {summary.map(s => {
              const i = members.indexOf(s.member);
              return (
                <div key={s.member.id} style={{display:"grid",gridTemplateColumns:"150px 1fr 150px",gap:12,alignItems:"center",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Avatar member={s.member} index={i} size={26}/>
                    <span style={{fontSize:12.5,fontWeight:700,color:P.navy}}>{s.member.name.split(" ")[0]} <span style={{color:P.muted,fontWeight:400}}>({s.member.age})</span></span>
                  </div>
                  <LoadBar minutes={s.minutes} fair={s.fair} color={COLORS[i%COLORS.length]}/>
                  <span style={{fontSize:11.5,color:P.muted}}>{s.count} chores · {Math.round(s.minutes/60*10)/10} h <span title="fair share for their age">(fair ≈ {Math.round(s.fair/60*10)/10} h)</span></span>
                </div>
              );
            })}
            <div style={{fontSize:11,color:P.muted,marginTop:4}}>The dark line on each bar marks that person's fair share for their age.</div>
            {unassigned>0 && <div style={{marginTop:10,fontSize:12,color:P.danger,fontWeight:600}}>⚠️ {unassigned} chore{unassigned>1?"s":""} couldn't be assigned. See the red rows below.</div>}
          </Card>

          {weekDates(week).map(({day,date}) => {
            const rows = plan.map((a,i)=>({a,i})).filter(x=>x.a.date===date);
            if (!rows.length) return null;
            return (
              <Card key={date}>
                <Sec>{day} · {fmtShort(date)}</Sec>
                {rows.map(({a,i}) => (
                  <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 190px",gap:10,alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${P.skyBg}`,background:a.assignedTo?"transparent":"#fff5f5"}}>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:P.navy}}>
                        {catOf(a.chore.category).icon} {a.chore.name}
                        <span style={{fontWeight:400,color:P.muted,fontSize:11}}> · {slotOf(a.timeOfDay).icon} {a.timeOfDay} · {a.chore.minutes}m{a.routineName?` · ${a.routineName}`:""}</span>
                      </div>
                      <div style={{fontSize:11,color:a.assignedTo?P.purple:P.danger,marginTop:2}}>💡 {a.reason}</div>
                    </div>
                    <select style={{...inp,padding:"6px 10px",fontSize:12}} value={a.assignedTo||""} onChange={e=>reassign(i,e.target.value)}>
                      <option value="">Unassigned</option>
                      {participants.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                ))}
              </Card>
            );
          })}

          <div style={{position:"sticky",bottom:0,padding:"10px 0",display:"flex",gap:10}}>
            <button style={{...btn,background:P.success,flex:1,padding:"12px"}} onClick={apply}>✅ Apply plan ({plan.length} chores)</button>
            <button style={{...btn,background:"#fff",color:P.navy,border:`1px solid ${P.lightBlue}`}} onClick={()=>setPlan(null)}>Discard</button>
          </div>
        </>
      )}
    </div>
  );
}
