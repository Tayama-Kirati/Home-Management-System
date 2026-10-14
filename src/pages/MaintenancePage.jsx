import { useState } from "react";
import { P } from '../constants/palette';
import { inp, btn, danBtn, sucBtn } from '../constants/styles';
import { today, addDays, fmt, genId } from '../utils/helpers';
import { Card, Sec, FL, G2, Badge } from '../components/ui';
import PhotoStore from '../components/ui/PhotoStore';
import { ProgressBar } from '../components/charts';

export default function MaintenancePage({user,sharedData,setSharedData}) {
  const maint=sharedData.maintenance||[];
  const setMaint=fn=>setSharedData(d=>({...d,maintenance:typeof fn==="function"?fn(d.maintenance||[]):fn}));
  const [form,setForm]=useState({name:"",category:"Appliance",intervalDays:90,lastDate:today(),notes:"",cost:""});

  const add=()=>{
    if(!form.name)return;
    setMaint(m=>[...m,{id:genId(),...form,intervalDays:parseInt(form.intervalDays)||90,cost:parseFloat(form.cost)||0,nextDate:addDays(form.lastDate,parseInt(form.intervalDays)||90),addedBy:user.name,history:[]}]);
    setForm({name:"",category:"Appliance",intervalDays:90,lastDate:today(),notes:"",cost:""});
  };
  const markDone=id=>{
    setMaint(m=>m.map(x=>x.id===id?{...x,lastDate:today(),nextDate:addDays(today(),x.intervalDays),history:[...(x.history||[]),{date:today(),by:user.name}]}:x));
  };
  const remove=id=>setMaint(m=>m.filter(x=>x.id!==id));

  const sorted=maint.slice().sort((a,b)=>a.nextDate>b.nextDate?1:-1);
  const catColor={Appliance:P.blue,Plumbing:P.teal,Electrical:P.amber,Pest:P.success,HVAC:P.purple,Other:P.muted};
  const overdue=maint.filter(m=>m.nextDate<today()).length;
  const soon=maint.filter(m=>m.nextDate>=today()&&m.nextDate<=addDays(today(),14)).length;

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>🔧 Maintenance Scheduler</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[["Overdue",overdue,P.danger],["Due Soon",soon,P.amber],["Total",maint.length,P.blue]].map(([l,v,c])=>(
          <div key={l} style={{background:P.skyBg,borderRadius:10,padding:"12px",textAlign:"center",border:`1px solid ${P.lightBlue}`}}>
            <div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:11,color:P.muted}}>{l}</div>
          </div>
        ))}
      </div>
      <Card>
        <Sec>+ Add Task</Sec>
        <G2>
          <div><FL>Task Name</FL><input style={inp} placeholder="AC Servicing…" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div><FL>Category</FL><select style={inp} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}><option>Appliance</option><option>Plumbing</option><option>Electrical</option><option>Pest</option><option>HVAC</option><option>Other</option></select></div>
          <div><FL>Interval (days)</FL><input type="number" style={inp} value={form.intervalDays} onChange={e=>setForm(f=>({...f,intervalDays:e.target.value}))}/></div>
          <div><FL>Last Done</FL><input type="date" style={inp} value={form.lastDate} onChange={e=>setForm(f=>({...f,lastDate:e.target.value}))}/></div>
          <div><FL>Est. Cost (NPR)</FL><input type="number" style={inp} value={form.cost} onChange={e=>setForm(f=>({...f,cost:e.target.value}))}/></div>
          <div><FL>Notes</FL><input style={inp} placeholder="Notes…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
        </G2>
        <button style={btn} onClick={add}>Add Task</button>
      </Card>

      {sorted.map(m=>{
        const daysLeft=Math.ceil((new Date(m.nextDate)-new Date(today()))/86400000);
        const status=daysLeft<0?"overdue":daysLeft<=14?"soon":"ok";
        const statusColor={overdue:P.danger,soon:P.amber,ok:P.success};
        return <Card key={m.id} style={{border:`1.5px solid ${status==="overdue"?"#f0a0a0":status==="soon"?"#f0d080":P.lightBlue}`,background:status==="overdue"?"#fff8f8":P.white}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:P.navy,fontSize:14}}>{m.name}</div>
              <div style={{fontSize:11,color:P.muted,marginTop:2}}>{m.category} · Every {m.intervalDays} days{m.cost?` · NPR ${m.cost.toLocaleString()}`:""}</div>
              <div style={{fontSize:11,marginTop:3,fontWeight:700,color:statusColor[status]}}>
                {status==="overdue"?`⚠️ ${Math.abs(daysLeft)} days overdue`:status==="soon"?`⏰ Due in ${daysLeft} days`:`✅ Next: ${fmt(m.nextDate)}`}
              </div>
              {m.notes&&<div style={{fontSize:11,color:P.muted}}>{m.notes}</div>}
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <Badge label={m.category} color={catColor[m.category]||P.muted} bg={P.skyBg}/>
              <button style={{...sucBtn,fontSize:11}} onClick={()=>markDone(m.id)}>Done ✓</button>
              <button style={danBtn} onClick={()=>remove(m.id)}>✕</button>
            </div>
          </div>
          <div style={{marginTop:8}}>
            <div style={{fontSize:10,color:P.muted,marginBottom:3}}>Last done: {fmt(m.lastDate)}</div>
            <ProgressBar pct={Math.min(100,Math.round((1-daysLeft/m.intervalDays)*100))} color={statusColor[status]} height={6}/>
          </div>
        </Card>;
      })}
      <Card style={{marginTop:12}}>
        <PhotoStore
          photos={sharedData.maintenancePhotos||[]}
          onChange={photos=>setSharedData(d=>({...d,maintenancePhotos:photos}))}
          title="📷 Maintenance Receipts & Photos"
        />
      </Card>
    </div>
  );
}
