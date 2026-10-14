import { useState } from "react";
import { P } from '../../constants/palette';
import { inp, btn, danBtn } from '../../constants/styles';
import { DAYS, CATEGORIES, FREQUENCIES, TIME_SLOTS, EFFORT, CHORE_TEMPLATES, catOf } from '../../constants/chores';
import { genId } from '../../utils/helpers';
import { Card, Sec, FL, Row, RMain, G2, G3, Badge } from '../ui';
import { ChipGroup, Chip, Empty } from './shared';

const blank = { name:"", category:"Kitchen", effort:1, minutes:15, minAge:0, frequency:"Daily", days:DAYS, timeOfDay:"Anytime", notes:"" };

export default function ChoreLibrary({ library, setLibrary, routines }) {
  const [form,setForm] = useState(blank);
  const [editing,setEditing] = useState(null);
  const [catFilter,setCatFilter] = useState("All");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const setFrequency = f => setForm(x => ({ ...x, frequency:f, days: f==="Daily" ? DAYS : x.days.length===7 ? ["Saturday"] : x.days }));

  const save = () => {
    if (!form.name.trim() || !form.days.length) return;
    const clean = { ...form, name:form.name.trim(), effort:Number(form.effort), minutes:Number(form.minutes)||0, minAge:Number(form.minAge)||0 };
    if (editing) setLibrary(l => l.map(c => c.id===editing ? { ...c, ...clean } : c));
    else setLibrary(l => [...l, { id:genId(), active:true, ...clean }]);
    setForm(blank); setEditing(null);
  };
  const edit = c => { setForm({ ...blank, ...c }); setEditing(c.id); };
  const addStarters = () => {
    const have = new Set(library.map(c=>c.name.toLowerCase()));
    setLibrary(l => [...l, ...CHORE_TEMPLATES.filter(t=>!have.has(t.name.toLowerCase())).map(t => ({ id:genId(), active:true, timeOfDay:"Anytime", notes:"", ...t }))]);
  };
  const routineNames = id => routines.filter(r=>r.active!==false && r.choreIds.includes(id)).map(r=>r.name);

  const shown = catFilter==="All" ? library : library.filter(c=>c.category===catFilter);

  return (
    <div>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <Sec>{editing ? "✏️ Edit Chore" : "+ Add to Chore List"}</Sec>
          {!editing && <button onClick={addStarters} style={{...btn,background:P.skyBg,color:P.blue,padding:"6px 14px",fontSize:12,border:`1px solid ${P.lightBlue}`}}>✨ Add common household chores</button>}
        </div>
        <G2>
          <div><FL>Chore name</FL><input style={inp} placeholder="Wash dishes…" value={form.name} onChange={e=>set("name",e.target.value)}/></div>
          <div><FL>Category</FL>
            <select style={inp} value={form.category} onChange={e=>set("category",e.target.value)}>
              {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.id}</option>)}
            </select>
          </div>
        </G2>
        <G3>
          <div><FL>Effort</FL>
            <select style={inp} value={form.effort} onChange={e=>set("effort",e.target.value)}>
              {Object.entries(EFFORT).map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div><FL>Takes about (minutes)</FL><input style={inp} type="number" min="1" value={form.minutes} onChange={e=>set("minutes",e.target.value)}/></div>
          <div><FL>Minimum age</FL><input style={inp} type="number" min="0" value={form.minAge} onChange={e=>set("minAge",e.target.value)}/></div>
        </G3>
        <G2>
          <div><FL>Frequency</FL>
            <select style={inp} value={form.frequency} onChange={e=>setFrequency(e.target.value)}>
              {FREQUENCIES.map(f=><option key={f}>{f}</option>)}
            </select>
          </div>
          <div><FL>Time of day</FL>
            <select style={inp} value={form.timeOfDay} onChange={e=>set("timeOfDay",e.target.value)}>
              {TIME_SLOTS.map(s=><option key={s.id} value={s.id}>{s.icon} {s.id}</option>)}
            </select>
          </div>
        </G2>
        <div style={{marginBottom:12}}>
          <FL>On which days{form.frequency==="Bi-weekly"?" (every other week)":form.frequency==="Monthly"?" (first week of the month)":""}</FL>
          <ChipGroup options={DAYS} value={form.days} onChange={v=>set("days",v)} render={d=>d.slice(0,3)}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={btn} onClick={save}>{editing ? "Save Changes" : "Add Chore"}</button>
          {editing && <button style={{...btn,background:P.skyBg,color:P.navy}} onClick={()=>{setForm(blank);setEditing(null);}}>Cancel</button>}
        </div>
      </Card>

      <div style={{display:"flex",gap:5,flexWrap:"wrap",margin:"4px 0 12px"}}>
        {["All",...CATEGORIES.map(c=>c.id)].map(c=>(
          <Chip key={c} active={catFilter===c} onClick={()=>setCatFilter(c)}>{c==="All"?"All":`${catOf(c).icon} ${c}`} ({c==="All"?library.length:library.filter(x=>x.category===c).length})</Chip>
        ))}
      </div>

      {shown.map(c => {
        const cat = catOf(c.category);
        const rn = routineNames(c.id);
        return (
          <Row key={c.id} style={{opacity:c.active===false?.5:1}}>
            <div style={{fontSize:22}}>{cat.icon}</div>
            <RMain title={c.name}
              sub={`${EFFORT[c.effort]} · ~${c.minutes} min · ${c.minAge?`ages ${c.minAge}+`:"any age"} · ${rn.length?`via ${rn.join(", ")}`:`${c.frequency}: ${c.days.length===7?"every day":c.days.map(d=>d.slice(0,3)).join(", ")}`}`}/>
            <Badge label={c.category} color={cat.color} bg={P.skyBg}/>
            <Chip active={c.active!==false} color={P.success} onClick={()=>setLibrary(l=>l.map(x=>x.id===c.id?{...x,active:x.active===false}:x))}>{c.active===false?"Paused":"Active"}</Chip>
            <button style={{...danBtn,background:P.blue}} onClick={()=>edit(c)}>Edit</button>
            <button style={danBtn} onClick={()=>setLibrary(l=>l.filter(x=>x.id!==c.id))}>✕</button>
          </Row>
        );
      })}
      {!library.length && <Empty>Your chore list is empty. Add chores above, or load the common household chores to start.</Empty>}
    </div>
  );
}
