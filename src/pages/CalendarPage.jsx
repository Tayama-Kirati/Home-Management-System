import { useState } from "react";
import { P } from '../constants/palette';
import { inp, btn, danBtn } from '../constants/styles';
import { today, addDays, fmt, genId } from '../utils/helpers';
import { Card, Sec, FL, Row, RMain, G2, Badge } from '../components/ui';

export default function CalendarPage({user,sharedData,setSharedData}) {
  const events = sharedData.events||[];
  const setEvents = fn => setSharedData(d=>({...d,events:typeof fn==="function"?fn(d.events||[]):fn}));
  const [form,setForm]=useState({title:"",date:today(),time:"10:00",type:"Event",notes:"",assignedTo:""});
  const [selDate,setSelDate]=useState(today());

  const addEvent = () => {
    if(!form.title||!form.date) return;
    setEvents(e=>[...e,{id:genId(),...form,createdBy:user.id,createdByName:user.name}]);
    setForm({title:"",date:today(),time:"10:00",type:"Event",notes:"",assignedTo:""});
  };
  const remove = id => setEvents(e=>e.filter(x=>x.id!==id));

  const today7 = Array.from({length:7},(_,i)=>addDays(today(),i-1));
  const todayEvents = events.filter(e=>e.date===selDate).sort((a,b)=>a.time>b.time?1:-1);
  const upcomingBills = (sharedData.bills||[]).filter(b=>!b.paidDate&&b.dueDate>=today()).sort((a,b)=>a.dueDate>b.dueDate?1:-1).slice(0,3);
  const upcomingMaint = (sharedData.maintenance||[]).filter(m=>m.nextDate>=today()).sort((a,b)=>a.nextDate>b.nextDate?1:-1).slice(0,3);
  const typeColor={Event:P.blue,Chore:P.success,Birthday:"#c0392b",Bill:P.amber,Medical:P.purple,Other:P.muted};

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>📅 Household Calendar</h2>

      <Card>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
          {today7.map(d=>{
            const hasEv=events.some(e=>e.date===d);
            const isToday=d===today();
            return <div key={d} onClick={()=>setSelDate(d)} style={{textAlign:"center",padding:"8px 10px",borderRadius:10,cursor:"pointer",minWidth:52,background:selDate===d?P.blue:isToday?"#e6f0fb":P.skyBg,border:`1px solid ${selDate===d?"transparent":P.lightBlue}`,color:selDate===d?"#fff":P.navy,flexShrink:0}}>
              <div style={{fontSize:10,opacity:.8}}>{new Date(d+"T00:00").toLocaleDateString("en-US",{weekday:"short"})}</div>
              <div style={{fontSize:16,fontWeight:700}}>{new Date(d+"T00:00").getDate()}</div>
              {hasEv&&<div style={{width:6,height:6,borderRadius:"50%",background:selDate===d?"#fff":P.blue,margin:"3px auto 0"}}/>}
            </div>;
          })}
        </div>
        <div style={{marginTop:12,fontWeight:700,color:P.navy,fontSize:12}}>{fmt(selDate)}</div>
        {todayEvents.length===0 ? <div style={{fontSize:12,color:P.muted,marginTop:6}}>No events. Add one below.</div>
          : todayEvents.map(e=>(
          <Row key={e.id} style={{marginTop:6}}>
            <div style={{width:4,borderRadius:4,height:36,background:typeColor[e.type]||P.blue,flexShrink:0}}/>
            <RMain title={`${e.time} — ${e.title}`} sub={`${e.type} · ${e.createdByName}`}/>
            <Badge label={e.type} color={typeColor[e.type]||P.blue} bg={P.skyBg}/>
            <button style={danBtn} onClick={()=>remove(e.id)}>✕</button>
          </Row>
        ))}
      </Card>

      {(upcomingBills.length>0||upcomingMaint.length>0)&&(
        <Card style={{background:"#fffbe6",border:"1.5px solid #f0c050"}}>
          <Sec>⚠️ Upcoming Reminders</Sec>
          {upcomingBills.map(b=><Row key={b.id} style={{background:"#fff8dc"}}><span>💡</span><RMain title={`${b.type} Bill Due`} sub={fmt(b.dueDate)}/><div style={{fontWeight:700,color:P.amber}}>NPR {b.amount?.toLocaleString()}</div></Row>)}
          {upcomingMaint.map(m=><Row key={m.id} style={{background:"#fff8dc"}}><span>🔧</span><RMain title={m.name} sub={`Due: ${fmt(m.nextDate)}`}/></Row>)}
        </Card>
      )}

      <Card>
        <Sec>+ Add Event</Sec>
        <G2>
          <div><FL>Title</FL><input style={inp} placeholder="Event name…" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
          <div><FL>Type</FL><select style={inp} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option>Event</option><option>Chore</option><option>Birthday</option><option>Bill</option><option>Medical</option><option>Other</option></select></div>
          <div><FL>Date</FL><input type="date" style={inp} value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
          <div><FL>Time</FL><input type="time" style={inp} value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))}/></div>
        </G2>
        <input style={{...inp,marginBottom:10}} placeholder="Notes (optional)…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
        <button style={btn} onClick={addEvent}>Add Event</button>
      </Card>

      <Sec>All Events</Sec>
      {events.slice().sort((a,b)=>a.date>b.date?1:-1).map(e=>(
        <Row key={e.id}>
          <div style={{width:4,borderRadius:4,height:36,background:typeColor[e.type]||P.blue,flexShrink:0}}/>
          <RMain title={e.title} sub={`${fmt(e.date)} ${e.time} · ${e.type} · ${e.createdByName}`}/>
          <Badge label={e.type} color={typeColor[e.type]||P.blue} bg={P.skyBg}/>
          <button style={danBtn} onClick={()=>remove(e.id)}>✕</button>
        </Row>
      ))}
    </div>
  );
}
