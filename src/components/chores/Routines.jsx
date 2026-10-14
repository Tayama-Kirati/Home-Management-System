import { useState } from "react";
import { P } from '../../constants/palette';
import { inp, btn, danBtn } from '../../constants/styles';
import { DAYS, WEEKEND, TIME_SLOTS, CHORE_TEMPLATES, ROUTINE_TEMPLATES, catOf, slotOf } from '../../constants/chores';
import { genId } from '../../utils/helpers';
import { Card, Sec, FL, G3 } from '../ui';
import { ChipGroup, Chip, Empty, Avatar } from './shared';

const blank = { name:"", icon:"🔁", timeOfDay:"Morning", days:DAYS, choreIds:[], ownerId:"" };
const WEEKDAYS = DAYS.filter(d=>!WEEKEND.includes(d));

export default function Routines({ routines, setRoutines, library, setLibrary, members }) {
  const [form,setForm] = useState(blank);
  const [editing,setEditing] = useState(null);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const byId = Object.fromEntries(library.map(c=>[c.id,c]));

  const save = () => {
    if (!form.name.trim() || !form.days.length || !form.choreIds.length) return;
    const clean = { ...form, name:form.name.trim() };
    if (editing) setRoutines(r => r.map(x => x.id===editing ? { ...x, ...clean } : x));
    else setRoutines(r => [...r, { id:genId(), active:true, ...clean }]);
    setForm(blank); setEditing(null);
  };

  // Loads the starter routines, adding any chores they need to the chore list first.
  const loadTemplates = () => {
    const lib = [...library];
    const findOrAdd = name => {
      let c = lib.find(x=>x.name.toLowerCase()===name.toLowerCase());
      if (!c) { c = { id:genId(), active:true, timeOfDay:"Anytime", notes:"", ...CHORE_TEMPLATES.find(t=>t.name===name) }; lib.push(c); }
      return c.id;
    };
    const have = new Set(routines.map(r=>r.name));
    const added = ROUTINE_TEMPLATES.filter(t=>!have.has(t.name)).map(({choreNames,...t}) => ({
      id:genId(), active:true, ownerId:"", ...t, choreIds: choreNames.map(findOrAdd),
    }));
    setLibrary(lib);
    setRoutines(r => [...r, ...added]);
  };

  const totalMin = r => r.choreIds.reduce((s,id)=>s+(Number(byId[id]?.minutes)||0),0);
  const daysLabel = d => d.length===7 ? "Every day" : d.length===5 && WEEKDAYS.every(x=>d.includes(x)) ? "Weekdays" : d.length===2 && WEEKEND.every(x=>d.includes(x)) ? "Weekends" : d.map(x=>x.slice(0,3)).join(", ");

  return (
    <div>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <Sec>{editing ? "✏️ Edit Routine" : "+ New Routine"}</Sec>
          {!editing && <button onClick={loadTemplates} style={{...btn,background:P.skyBg,color:P.blue,padding:"6px 14px",fontSize:12,border:`1px solid ${P.lightBlue}`}}>✨ Add example routines</button>}
        </div>
        <p style={{fontSize:12,color:P.muted,margin:"0 0 12px",lineHeight:1.5}}>
          A routine groups chores that happen together, e.g. a morning routine or a weekend deep clean.
          Chores in a routine follow the routine's days instead of their own schedule.
        </p>
        <G3>
          <div><FL>Routine name</FL><input style={inp} placeholder="Morning Routine" value={form.name} onChange={e=>set("name",e.target.value)}/></div>
          <div><FL>Time of day</FL>
            <select style={inp} value={form.timeOfDay} onChange={e=>set("timeOfDay",e.target.value)}>
              {TIME_SLOTS.map(s=><option key={s.id} value={s.id}>{s.icon} {s.id}</option>)}
            </select>
          </div>
          <div><FL>Who does it</FL>
            <select style={inp} value={form.ownerId} onChange={e=>set("ownerId",e.target.value)}>
              <option value="">🤖 Shared: Smart Assign splits it</option>
              {members.map(m=><option key={m.id} value={m.id}>👤 Always {m.name}</option>)}
            </select>
          </div>
        </G3>
        <div style={{marginBottom:10}}>
          <FL>Days</FL>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <ChipGroup options={DAYS} value={form.days} onChange={v=>set("days",v)} render={d=>d.slice(0,3)}/>
            <span style={{fontSize:11,color:P.muted}}>Quick:</span>
            <Chip onClick={()=>set("days",DAYS)}>Every day</Chip>
            <Chip onClick={()=>set("days",WEEKDAYS)}>Weekdays</Chip>
            <Chip onClick={()=>set("days",WEEKEND)}>Weekends</Chip>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <FL>Chores in this routine ({form.choreIds.length})</FL>
          {library.length
            ? <ChipGroup options={library.map(c=>c.id)} value={form.choreIds} onChange={v=>set("choreIds",v)} color={P.purple} render={id=>`${catOf(byId[id].category).icon} ${byId[id].name}`}/>
            : <div style={{fontSize:12,color:P.muted,fontStyle:"italic"}}>Add chores in the Chore List tab first.</div>}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={btn} onClick={save}>{editing ? "Save Routine" : "Create Routine"}</button>
          {editing && <button style={{...btn,background:P.skyBg,color:P.navy}} onClick={()=>{setForm(blank);setEditing(null);}}>Cancel</button>}
        </div>
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {routines.map(r => {
          const owner = members.find(m=>m.id===r.ownerId);
          return (
            <Card key={r.id} style={{margin:0,opacity:r.active===false?.55:1,borderTop:`4px solid ${r.active===false?P.lightBlue:P.purple}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:22}}>{r.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,color:P.navy,fontSize:14}}>{r.name}</div>
                  <div style={{fontSize:11,color:P.muted}}>{slotOf(r.timeOfDay).icon} {r.timeOfDay} · {daysLabel(r.days)} · ~{totalMin(r)} min</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:P.muted,marginBottom:8}}>
                {owner ? <><Avatar member={owner} index={members.indexOf(owner)} size={20}/> Always {owner.name}</> : <>🤖 Shared by the household</>}
              </div>
              <ul style={{margin:"0 0 10px",paddingLeft:18,fontSize:12.5,color:P.navy,lineHeight:1.7}}>
                {r.choreIds.map(id => byId[id] && <li key={id}>{byId[id].name} <span style={{color:P.muted}}>· {byId[id].minutes}m</span></li>)}
              </ul>
              <div style={{display:"flex",gap:6}}>
                <Chip active={r.active!==false} color={P.success} onClick={()=>setRoutines(rs=>rs.map(x=>x.id===r.id?{...x,active:x.active===false}:x))}>{r.active===false?"Paused":"Active"}</Chip>
                <button style={{...danBtn,background:P.blue,padding:"4px 11px",fontSize:11}} onClick={()=>{setForm({...blank,...r,ownerId:r.ownerId||""});setEditing(r.id);}}>Edit</button>
                <button style={{...danBtn,padding:"4px 11px",fontSize:11}} onClick={()=>setRoutines(rs=>rs.filter(x=>x.id!==r.id))}>Delete</button>
              </div>
            </Card>
          );
        })}
      </div>
      {!routines.length && <Empty>No routines yet. Create one above or add the example routines.</Empty>}
    </div>
  );
}
