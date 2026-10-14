import { useState } from "react";
import { P } from '../constants/palette';
import { inp, btn, danBtn, sucBtn } from '../constants/styles';
import { today, fmt, genId } from '../utils/helpers';
import { Card, Sec, FL, G2, Badge } from '../components/ui';
import PhotoStore from '../components/ui/PhotoStore';

export default function MedicinePage({user,users,sharedData,setSharedData,connections}) {
  const meds = sharedData.medicines||[];
  const setMeds = fn => setSharedData(d=>({...d,medicines:typeof fn==="function"?fn(d.medicines||[]):fn}));
  const [form,setForm]=useState({name:"",dosage:"",frequency:"Daily",assignedTo:user.id,startDate:today(),endDate:"",notes:"",stock:""});

  const records = sharedData.medicalRecords||[];
  const setRecords = fn => setSharedData(d=>({...d,medicalRecords:typeof fn==="function"?fn(d.medicalRecords||[]):fn}));
  const recTypes = ["Checkup","Prescription","Lab Report","X-Ray / Scan","Vaccination","Other"];
  const [recForm,setRecForm]=useState({title:"",type:"Checkup",doctor:"",hospital:"",date:today(),notes:"",assignedTo:user.id,photos:[]});
  const [showRecForm,setShowRecForm]=useState(false);

  const addRecord=()=>{
    if(!recForm.title&&!recForm.doctor)return;
    setRecords(r=>[...r,{id:genId(),...recForm,addedBy:user.name}]);
    setRecForm({title:"",type:"Checkup",doctor:"",hospital:"",date:today(),notes:"",assignedTo:user.id,photos:[]});
    setShowRecForm(false);
  };
  const removeRecord=id=>setRecords(r=>r.filter(x=>x.id!==id));

  const myConns=connections.filter(c=>(c.from===user.id||c.to===user.id)&&c.status==="accepted");
  const familyIds=[user.id,...myConns.map(c=>c.from===user.id?c.to:c.from)];
  const familyUsers=familyIds.map(id=>users.find(u=>u.id===id)).filter(Boolean);

  const addMed=()=>{
    if(!form.name)return;
    setMeds(m=>[...m,{id:genId(),...form,stock:parseInt(form.stock)||0,taken:[],addedBy:user.name}]);
    setForm({name:"",dosage:"",frequency:"Daily",assignedTo:user.id,startDate:today(),endDate:"",notes:"",stock:""});
  };
  const markTaken=(id)=>{
    setMeds(m=>m.map(x=>x.id===id?{...x,taken:[...(x.taken||[]),{date:today(),time:new Date().toLocaleTimeString(),by:user.name}],stock:Math.max(0,(x.stock||0)-1)}:x));
  };
  const remove=id=>setMeds(m=>m.filter(x=>x.id!==id));
  const freqC={Daily:P.blue,Weekly:P.success,"Twice daily":P.amber,"As needed":P.muted};
  const takenToday=id=>meds.find(m=>m.id===id)?.taken?.some(t=>t.date===today())||false;

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>💊 Medicine Tracker</h2>
      <Card>
        <Sec>+ Add Medicine</Sec>
        <G2>
          <div><FL>Medicine Name</FL><input style={inp} placeholder="Paracetamol…" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div><FL>Dosage</FL><input style={inp} placeholder="500mg…" value={form.dosage} onChange={e=>setForm(f=>({...f,dosage:e.target.value}))}/></div>
          <div><FL>Frequency</FL><select style={inp} value={form.frequency} onChange={e=>setForm(f=>({...f,frequency:e.target.value}))}><option>Daily</option><option>Twice daily</option><option>Weekly</option><option>As needed</option></select></div>
          <div><FL>For</FL><select style={inp} value={form.assignedTo} onChange={e=>setForm(f=>({...f,assignedTo:e.target.value}))}>{familyUsers.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
          <div><FL>Start Date</FL><input type="date" style={inp} value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))}/></div>
          <div><FL>End Date (optional)</FL><input type="date" style={inp} value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))}/></div>
          <div><FL>Stock (tablets)</FL><input type="number" style={inp} placeholder="30" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))}/></div>
          <div><FL>Notes</FL><input style={inp} placeholder="After food…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
        </G2>
        <button style={btn} onClick={addMed}>Add Medicine</button>
      </Card>

      {familyUsers.map(u=>{
        const uMeds=meds.filter(m=>m.assignedTo===u.id);
        if(!uMeds.length)return null;
        return <div key={u.id}>
          <Sec>👤 {u.name}</Sec>
          {uMeds.map(m=>{
            const taken=takenToday(m.id);
            const lowStock=(m.stock||0)<=5;
            return <Card key={m.id} style={{border:lowStock?"1.5px solid #f0a0a0":"1px solid "+P.lightBlue,background:lowStock?"#fff8f8":P.white}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:P.navy,fontSize:14}}>{m.name}</div>
                  <div style={{fontSize:11,color:P.muted,marginTop:2}}>{m.dosage} · {m.frequency} · Stock: <b style={{color:lowStock?P.danger:P.success}}>{m.stock||0} left</b></div>
                  {m.notes&&<div style={{fontSize:11,color:P.muted}}>{m.notes}</div>}
                  {lowStock&&<div style={{fontSize:11,color:P.danger,fontWeight:700}}>⚠️ Low stock! Refill soon.</div>}
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <Badge label={m.frequency} color={freqC[m.frequency]||P.muted} bg={P.skyBg}/>
                  {taken?<Badge label="✓ Taken today" color={P.success} bg="#e2f5eb"/>
                  :<button style={{...sucBtn,fontSize:11}} onClick={()=>markTaken(m.id)}>Mark Taken</button>}
                  <button style={danBtn} onClick={()=>remove(m.id)}>✕</button>
                </div>
              </div>
              {(m.taken||[]).length>0&&<div style={{marginTop:8,fontSize:11,color:P.muted}}>Last taken: {m.taken[m.taken.length-1].date} at {m.taken[m.taken.length-1].time}</div>}
            </Card>;
          })}
        </div>;
      })}

      {/* ── Medical Records ── */}
      <div style={{marginTop:8}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <h3 style={{color:P.navy,fontFamily:"Georgia,serif",fontSize:16,margin:0}}>🏥 Medical Records</h3>
          <button style={{...btn,padding:"6px 16px",fontSize:12}} onClick={()=>setShowRecForm(v=>!v)}>
            {showRecForm?"Cancel":"+ Add Record"}
          </button>
        </div>

        {showRecForm&&(
          <Card>
            <Sec>New Medical Record</Sec>
            <G2>
              <div><FL>Title / Visit Reason</FL><input style={inp} placeholder="Annual checkup…" value={recForm.title} onChange={e=>setRecForm(f=>({...f,title:e.target.value}))}/></div>
              <div><FL>Record Type</FL><select style={inp} value={recForm.type} onChange={e=>setRecForm(f=>({...f,type:e.target.value}))}>{recTypes.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><FL>Doctor Name</FL><input style={inp} placeholder="Dr. Poudel…" value={recForm.doctor} onChange={e=>setRecForm(f=>({...f,doctor:e.target.value}))}/></div>
              <div><FL>Hospital / Clinic</FL><input style={inp} placeholder="Bir Hospital…" value={recForm.hospital} onChange={e=>setRecForm(f=>({...f,hospital:e.target.value}))}/></div>
              <div><FL>Date</FL><input type="date" style={inp} value={recForm.date} onChange={e=>setRecForm(f=>({...f,date:e.target.value}))}/></div>
              <div><FL>For</FL><select style={inp} value={recForm.assignedTo} onChange={e=>setRecForm(f=>({...f,assignedTo:e.target.value}))}>{familyUsers.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
            </G2>
            <div style={{marginBottom:10}}><FL>Notes</FL><input style={inp} placeholder="Diagnosis, prescriptions, follow-up…" value={recForm.notes} onChange={e=>setRecForm(f=>({...f,notes:e.target.value}))}/></div>
            <PhotoStore photos={recForm.photos} onChange={photos=>setRecForm(f=>({...f,photos}))} title="📋 Reports & Scans"/>
            <button style={{...btn,marginTop:12}} onClick={addRecord}>Save Record</button>
          </Card>
        )}

        {records.length===0&&!showRecForm&&(
          <div style={{fontSize:12,color:P.muted,fontStyle:"italic",padding:"10px 0"}}>No medical records yet. Click "+ Add Record" to store reports, prescriptions, or visit notes.</div>
        )}

        {records.slice().sort((a,b)=>a.date>b.date?-1:1).map(r=>{
          const forUser=users.find(u=>u.id===r.assignedTo);
          return <Card key={r.id}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:P.navy,fontSize:14}}>{r.title||r.type}</div>
                <div style={{fontSize:11,color:P.muted,marginTop:2}}>
                  {r.doctor&&<span>👨‍⚕️ {r.doctor} · </span>}
                  {r.hospital&&<span>🏥 {r.hospital} · </span>}
                  <span>📅 {fmt(r.date)}</span>
                  {forUser&&<span> · 👤 {forUser.name}</span>}
                </div>
                {r.notes&&<div style={{fontSize:11,color:P.muted,marginTop:4}}>{r.notes}</div>}
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <Badge label={r.type} color={P.blue} bg={P.skyBg}/>
                <button style={danBtn} onClick={()=>removeRecord(r.id)}>✕</button>
              </div>
            </div>
            {r.photos&&r.photos.length>0&&(
              <div style={{marginTop:10}}>
                <PhotoStore photos={r.photos} onChange={photos=>setRecords(rs=>rs.map(x=>x.id===r.id?{...x,photos}:x))} title="📋 Attached Reports"/>
              </div>
            )}
          </Card>;
        })}
      </div>
    </div>
  );
}
