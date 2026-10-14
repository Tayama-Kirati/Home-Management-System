import { useState } from "react";
import { P, COLORS } from '../constants/palette';
import { inp, btn, danBtn } from '../constants/styles';
import { today, fmt, genId } from '../utils/helpers';
import { Card, Sec, FL, G2, G3 } from '../components/ui';
import { PieChart, Legend, ChartRow, ProgressBar } from '../components/charts';

export default function SavingsPage({user,sharedData,setSharedData}) {
  const goals=sharedData.savings||[];
  const setGoals=fn=>setSharedData(d=>({...d,savings:typeof fn==="function"?fn(d.savings||[]):fn}));
  const [form,setForm]=useState({name:"",target:"",saved:"",deadline:"",category:"Festival",notes:""});
  const [contrib,setContrib]=useState({goalId:"",amount:""});

  const add=()=>{
    if(!form.name||!form.target)return;
    setGoals(g=>[...g,{id:genId(),...form,target:parseFloat(form.target),saved:parseFloat(form.saved)||0,history:[{date:today(),amount:parseFloat(form.saved)||0,by:user.name}],addedBy:user.name}]);
    setForm({name:"",target:"",saved:"",deadline:"",category:"Festival",notes:""});
  };
  const addContrib=()=>{
    if(!contrib.goalId||!contrib.amount)return;
    setGoals(g=>g.map(x=>x.id===contrib.goalId?{...x,saved:x.saved+parseFloat(contrib.amount),history:[...(x.history||[]),{date:today(),amount:parseFloat(contrib.amount),by:user.name}]}:x));
    setContrib({goalId:"",amount:""});
  };
  const remove=id=>setGoals(g=>g.filter(x=>x.id!==id));
  const pieData=goals.map((g,i)=>({label:g.name,value:g.target,color:COLORS[i%COLORS.length]}));

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>🎯 Savings Goals</h2>

      {goals.length>0&&<Card><Sec>Goals overview</Sec><ChartRow pie={<PieChart data={pieData} size={130}/>} legend={<Legend data={pieData}/>}/></Card>}

      {goals.map((g,i)=>{
        const pct=Math.min(100,Math.round(g.saved/g.target*100));
        const done=g.saved>=g.target;
        const daysLeft=g.deadline?Math.ceil((new Date(g.deadline)-new Date(today()))/86400000):null;
        return <Card key={g.id} style={{border:done?"1.5px solid #1a7a4a":"1px solid "+P.lightBlue}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:8}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:P.navy,fontSize:14}}>{done?"🎉 ":""}{g.name}</div>
              <div style={{fontSize:11,color:P.muted}}>{g.category}{g.deadline?` · Deadline: ${fmt(g.deadline)}`:""}</div>
              {g.notes&&<div style={{fontSize:11,color:P.muted}}>{g.notes}</div>}
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontWeight:700,color:P.blue,fontSize:14}}>NPR {g.saved.toLocaleString()} / {g.target.toLocaleString()}</div>
              <div style={{fontSize:11,color:pct>=100?P.success:P.muted}}>{pct}% reached</div>
            </div>
            <button style={danBtn} onClick={()=>remove(g.id)}>✕</button>
          </div>
          <ProgressBar pct={pct} color={done?P.success:COLORS[i%COLORS.length]} height={10}/>
          {daysLeft!==null&&<div style={{fontSize:10,color:P.muted,marginTop:3}}>{daysLeft>0?`${daysLeft} days left`:daysLeft===0?"Due today!":"Deadline passed"}</div>}
        </Card>;
      })}

      <Card>
        <Sec>+ New Goal</Sec>
        <G2>
          <div><FL>Goal Name</FL><input style={inp} placeholder="Festival fund…" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div><FL>Category</FL><select style={inp} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}><option>Festival</option><option>Appliance</option><option>Travel</option><option>Education</option><option>Emergency</option><option>Other</option></select></div>
          <div><FL>Target (NPR)</FL><input type="number" style={inp} placeholder="50000" value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))}/></div>
          <div><FL>Already Saved (NPR)</FL><input type="number" style={inp} placeholder="10000" value={form.saved} onChange={e=>setForm(f=>({...f,saved:e.target.value}))}/></div>
          <div><FL>Deadline (optional)</FL><input type="date" style={inp} value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))}/></div>
          <div><FL>Notes</FL><input style={inp} placeholder="Notes…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
        </G2>
        <button style={btn} onClick={add}>Create Goal</button>
      </Card>

      {goals.length>0&&<Card>
        <Sec>Add Contribution</Sec>
        <G3>
          <div><FL>Goal</FL><select style={inp} value={contrib.goalId} onChange={e=>setContrib(c=>({...c,goalId:e.target.value}))}><option value="">Select…</option>{goals.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
          <div><FL>Amount (NPR)</FL><input type="number" style={inp} placeholder="500" value={contrib.amount} onChange={e=>setContrib(c=>({...c,amount:e.target.value}))}/></div>
          <div style={{display:"flex",alignItems:"flex-end"}}><button style={btn} onClick={addContrib}>Add</button></div>
        </G3>
      </Card>}
    </div>
  );
}
