import { useState } from "react";
import { P, COLORS } from '../constants/palette';
import { inp, btn, danBtn } from '../constants/styles';
import { CATEGORIES, catOf, slotOf, TIME_SLOTS } from '../constants/chores';
import { genId } from '../utils/helpers';
import { getMembers, weekStart, weekDates, shiftDays, fmtShort, isoLocal } from '../utils/choreAI';
import { Card, Sec, FL, Badge, Tabs } from '../components/ui';
import { PieChart } from '../components/charts';
import { Chip, Avatar, Empty } from '../components/chores/shared';
import ChoreLibrary from '../components/chores/ChoreLibrary';
import Routines from '../components/chores/Routines';
import MemberPrefs from '../components/chores/MemberPrefs';
import SmartAssign from '../components/chores/SmartAssign';

const TABS = [["board","📋 This Week"],["assign","🤖 Smart Assign"],["library","📝 Chore List"],["routines","🔁 Routines"],["members","👪 Members"]];

export default function ChoresPage({ user, users, sharedData, setSharedData }) {
  const [tab,setTab] = useState("board");
  const [week,setWeek] = useState(weekStart());
  const [view,setView] = useState("day");
  const [form,setForm] = useState({ name:"", assignedTo:user.id, date:isoLocal(new Date()), category:"Cleaning", minutes:15, timeOfDay:"Anytime" });

  const slice = key => [sharedData[key] || [], fn => setSharedData(d => ({ ...d, [key]: typeof fn==="function" ? fn(d[key]||[]) : fn }))];
  const [chores,setChores] = slice("chores");
  const [library,setLibrary] = slice("choreLibrary");
  const [routines,setRoutines] = slice("choreRoutines");
  const members = getMembers(users, sharedData);
  const memberIdx = id => members.findIndex(m=>m.id===id);
  const memberOf = id => members.find(m=>m.id===id);

  const addFeed = action => setSharedData(d => ({ ...d, feed:[...(d.feed||[]), { user:user.name, action, time:new Date().toLocaleTimeString() }] }));

  const dates = weekDates(week);
  // Older chores saved before weekly plans existed have no week; show them every week on their day.
  const weekChores = chores.filter(c => c.week===week || !c.week);
  const visible = view==="mine" ? weekChores.filter(c=>c.assignedTo===user.id) : weekChores;
  const dateFor = c => c.date || dates.find(d=>d.day===c.day)?.date;

  const toggle = c => {
    setChores(cs => cs.map(x => x.id===c.id ? { ...x, done:!x.done, doneBy:!x.done?user.name:null, doneAt:!x.done?new Date().toLocaleDateString():null } : x));
    if (!c.done) addFeed(`completed chore '${c.name}'`);
  };
  const reassign = (id, to) => setChores(cs => cs.map(x => x.id===id ? { ...x, assignedTo:to, reason:"reassigned manually" } : x));
  const remove = id => setChores(cs => cs.filter(x => x.id!==id));

  const addOneOff = () => {
    if (!form.name.trim()) return;
    const day = dates.find(d=>d.date===form.date)?.day || new Date(form.date+"T00:00").toLocaleDateString("en-US",{weekday:"long"});
    setChores(cs => [...cs, { id:genId(), source:"manual", week:weekStart(form.date), date:form.date, day, name:form.name.trim(),
      category:form.category, minutes:Number(form.minutes)||0, effort:1, frequency:"Once", timeOfDay:form.timeOfDay,
      assignedTo:form.assignedTo, done:false, doneBy:null, doneAt:null }]);
    addFeed(`added chore '${form.name.trim()}'`);
    setForm(f => ({ ...f, name:"" }));
  };

  const done = visible.filter(c=>c.done).length;
  const mins = list => list.reduce((s,c)=>s+(Number(c.minutes)||0),0);
  const todayIso = isoLocal(new Date());

  const pie = pred => members.map((m,i) => ({ label:m.name.split(" ")[0], value:mins(weekChores.filter(c=>c.assignedTo===m.id && pred(c))), color:COLORS[i%COLORS.length] })).filter(d=>d.value>0);
  const assignedPie = pie(()=>true), donePie = pie(c=>c.done);

  const choreItem = (c, showWho=true) => {
    const cat = catOf(c.category);
    return (
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",marginBottom:5,borderRadius:10,
        background:c.done?"#f0faf5":"#fff",border:`1px solid ${c.done?"#b6e4cc":P.lightBlue}`}}>
        <input type="checkbox" checked={c.done} onChange={()=>toggle(c)} style={{width:15,height:15,accentColor:P.blue,cursor:"pointer",flexShrink:0}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12.5,fontWeight:700,color:c.done?P.muted:P.navy,textDecoration:c.done?"line-through":"none"}}>{cat.icon} {c.name}</div>
          <div style={{fontSize:10.5,color:P.muted}}>
            {slotOf(c.timeOfDay).icon} {c.timeOfDay||"Anytime"}{c.minutes?` · ${c.minutes}m`:""}{c.routineName?` · ${c.routineName}`:""}{c.doneBy?` · ✓ ${c.doneBy}`:""}
          </div>
          {c.reason && !c.done && <div style={{fontSize:10.5,color:P.purple}} title="Why Smart Assign picked this person">💡 {c.reason}</div>}
        </div>
        {showWho && (
          <select value={c.assignedTo||""} onChange={e=>reassign(c.id,e.target.value)} title="Reassign"
            style={{...inp,width:"auto",padding:"3px 6px",fontSize:11,borderRadius:8}}>
            <option value="">Unassigned</option>
            {members.map(m=><option key={m.id} value={m.id}>{m.name.split(" ")[0]}</option>)}
          </select>
        )}
        <button style={{...danBtn,padding:"3px 8px",fontSize:11}} onClick={()=>remove(c.id)}>✕</button>
      </div>
    );
  };

  const board = (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <button style={{...btn,padding:"6px 12px",background:"#fff",color:P.navy,border:`1px solid ${P.lightBlue}`}} onClick={()=>setWeek(w=>shiftDays(w,-7))}>‹</button>
        <div style={{fontWeight:800,color:P.navy,fontSize:14,minWidth:150,textAlign:"center"}}>
          {week===weekStart() ? "This week" : `Week of ${fmtShort(week)}`}<div style={{fontSize:11,color:P.muted,fontWeight:500}}>{fmtShort(week)} – {fmtShort(shiftDays(week,6))}</div>
        </div>
        <button style={{...btn,padding:"6px 12px",background:"#fff",color:P.navy,border:`1px solid ${P.lightBlue}`}} onClick={()=>setWeek(w=>shiftDays(w,7))}>›</button>
        <div style={{marginLeft:"auto",display:"flex",gap:5}}>
          {[["day","By day"],["person","By person"],["mine","My chores"]].map(([id,l]) => <Chip key={id} active={view===id} onClick={()=>setView(id)}>{l}</Chip>)}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {[["Chores",visible.length,P.blue],["Done",done,P.success],["Pending",visible.length-done,P.amber],["Progress",`${visible.length?Math.round(done/visible.length*100):0}%`,P.purple]].map(([l,v,c])=>(
          <div key={l} style={{background:"#fff",borderRadius:12,padding:"14px 12px",textAlign:"center",border:`1px solid ${P.lightBlue}`,boxShadow:"0 2px 8px rgba(37,99,168,.07)"}}>
            <div style={{fontSize:26,fontWeight:800,color:c}}>{v}</div>
            <div style={{fontSize:11,color:P.muted,marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>

      {!weekChores.length && (
        <Card style={{textAlign:"center",padding:"28px 20px"}}>
          <div style={{fontSize:34,marginBottom:6}}>🧹</div>
          <div style={{fontWeight:700,color:P.navy,marginBottom:4}}>No chores planned for this week yet</div>
          <div style={{fontSize:12.5,color:P.muted,marginBottom:14}}>Build your chore list and routines, set everyone's age and preferences, then let Smart Assign share the work out.</div>
          <button style={{...btn,background:"linear-gradient(90deg,#2563a8,#7c3aed)"}} onClick={()=>setTab("assign")}>🤖 Plan this week</button>
        </Card>
      )}

      {view!=="person" && dates.map(({day,date}) => {
        const list = visible.filter(c=>dateFor(c)===date).sort((a,b)=>TIME_SLOTS.findIndex(s=>s.id===a.timeOfDay)-TIME_SLOTS.findIndex(s=>s.id===b.timeOfDay));
        if (!list.length) return null;
        const isToday = date===todayIso;
        return (
          <Card key={date} style={isToday?{border:`2px solid ${P.blue}`}:{}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <Sec>{day} · {fmtShort(date)}</Sec>
              {isToday && <Badge label="Today" color="#fff" bg={P.blue}/>}
              <span style={{marginLeft:"auto",fontSize:11,color:P.muted}}>{list.filter(c=>c.done).length}/{list.length} done · {mins(list)} min</span>
            </div>
            {list.map(c => (
              <div key={c.id} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                {view==="day" && <div style={{paddingTop:6}}><Avatar member={memberOf(c.assignedTo)} index={memberIdx(c.assignedTo)} size={26}/></div>}
                <div style={{flex:1}}>{choreItem(c, view==="day")}</div>
              </div>
            ))}
          </Card>
        );
      })}

      {view==="person" && [...members, null].map((m,i) => {
        const list = weekChores.filter(c => m ? c.assignedTo===m.id : !c.assignedTo || !memberOf(c.assignedTo));
        if (!list.length) return null;
        const d = list.filter(c=>c.done).length;
        return (
          <Card key={m?.id||"none"}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <Avatar member={m} index={i} size={32}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,color:P.navy}}>{m ? m.name : "Unassigned"}</div>
                <div style={{fontSize:11,color:P.muted}}>{d}/{list.length} done · {mins(list)} min this week</div>
              </div>
              <div style={{width:120,height:8,background:P.skyBg,borderRadius:6,overflow:"hidden"}}>
                <div style={{width:`${d/list.length*100}%`,height:"100%",background:COLORS[i%COLORS.length]}}/>
              </div>
            </div>
            {list.sort((a,b)=>(dateFor(a)||"").localeCompare(dateFor(b)||"")).map(c => (
              <div key={c.id} style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:11,color:P.muted,width:32,flexShrink:0}}>{(c.day||"").slice(0,3)}</span>
                <div style={{flex:1}}>{choreItem(c)}</div>
              </div>
            ))}
          </Card>
        );
      })}

      {view==="mine" && weekChores.length>0 && !visible.length && <Empty>You have no chores this week 🎉</Empty>}

      {assignedPie.length>0 && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          {[["📊 Time assigned",assignedPie],["✅ Time completed",donePie]].map(([title,data]) => {
            const total = data.reduce((s,d)=>s+d.value,0);
            return (
              <Card key={title} style={{margin:0}}>
                <Sec>{title}</Sec>
                {total ? (
                  <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
                    <PieChart data={data} size={110}/>
                    <div style={{flex:1,minWidth:100}}>
                      {data.map(d=>(
                        <div key={d.label} style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                          <div style={{width:10,height:10,borderRadius:"50%",background:d.color,flexShrink:0}}/>
                          <span style={{fontSize:12,color:P.navy,fontWeight:600,flex:1}}>{d.label}</span>
                          <span style={{fontSize:12,color:P.muted}}>{d.value}m</span>
                          <span style={{fontSize:11,fontWeight:700,color:d.color,minWidth:34,textAlign:"right"}}>{Math.round(d.value/total*100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <div style={{fontSize:12,color:P.muted,fontStyle:"italic"}}>Nothing completed yet.</div>}
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <Sec>+ Quick one-off chore</Sec>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:8,marginBottom:10}}>
          <div><FL>Chore</FL><input style={inp} placeholder="Clean the fridge…" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div><FL>Who</FL><select style={inp} value={form.assignedTo} onChange={e=>setForm(f=>({...f,assignedTo:e.target.value}))}>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          <div><FL>Date</FL><input style={inp} type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
          <div><FL>Category</FL><select style={inp} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.id}</option>)}</select></div>
        </div>
        <button style={btn} onClick={addOneOff}>Add</button>
      </Card>
    </div>
  );

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>🧹 Household Chores</h2>
      <Tabs tabs={TABS} value={tab} onChange={setTab}/>
      {tab==="board" && board}
      {tab==="assign" && <SmartAssign library={library} routines={routines} members={members} chores={chores} setChores={setChores}
        onApplied={(w,n)=>{ addFeed(`planned ${n} chores with Smart Assign`); setWeek(w); setTab("board"); }}/>}
      {tab==="library" && <ChoreLibrary library={library} setLibrary={setLibrary} routines={routines}/>}
      {tab==="routines" && <Routines routines={routines} setRoutines={setRoutines} library={library} setLibrary={setLibrary} members={members}/>}
      {tab==="members" && <MemberPrefs members={members} setSharedData={setSharedData}/>}
    </div>
  );
}
