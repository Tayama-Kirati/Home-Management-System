import { useState } from "react";
import { P, COLORS } from '../constants/palette';
import { inp, btn, danBtn, sucBtn, card } from '../constants/styles';
import { today, addDays, fmt, mk, genId } from '../utils/helpers';
import { Card, Sec, FL, Row, RMain, G2 } from '../components/ui';
import PhotoStore from '../components/ui/PhotoStore';
import { MiniBar } from '../components/charts';

export default function GasPage({user,sharedData,setSharedData}) {
  const gasRecs=sharedData.gasRecs||[];
  const setGas=fn=>setSharedData(d=>({...d,gasRecs:typeof fn==="function"?fn(d.gasRecs||[]):fn}));
  const [form,setForm]=useState({start:today(),end:"",kg:"14.2",cost:"2200"});

  const completed=gasRecs.filter(r=>r.end);
  const avgDays=completed.length?Math.round(completed.reduce((s,r)=>(s+(new Date(r.end)-new Date(r.start))/86400000),0)/completed.length):30;
  const active=gasRecs.find(r=>!r.end);

  const add=()=>{
    if(!form.start)return;
    setGas(g=>[...g,{id:genId(),start:form.start,end:form.end||null,kg:parseFloat(form.kg)||14.2,cost:parseFloat(form.cost)||0,addedBy:user.name}]);
    setForm({start:today(),end:"",kg:"14.2",cost:"2200"});
  };
  const markDone=id=>setGas(g=>g.map(x=>x.id===id?{...x,end:today()}:x));
  const remove=id=>setGas(g=>g.filter(x=>x.id!==id));

  const monthMap={};
  gasRecs.filter(r=>r.end).forEach(r=>{const m=mk(r.end);monthMap[m]=(monthMap[m]||0)+r.cost;});
  const mKeys=Object.keys(monthMap).sort();

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>⛽ Gas Tracker</h2>
      {active&&<div style={{...card,border:"1.5px solid #7bb8e8",background:"#e8f4fd"}}>
        <div style={{fontWeight:700,color:P.navy,fontSize:13,marginBottom:4}}>🔵 Cylinder Active</div>
        <div style={{fontSize:12,color:P.muted}}>Started: {fmt(active.start)} · Est. empty: <b style={{color:P.danger}}>{fmt(addDays(active.start,avgDays))}</b> (~{avgDays}d avg)</div>
        <button style={{...sucBtn,marginTop:8,fontSize:11}} onClick={()=>markDone(active.id)}>Mark Empty</button>
      </div>}
      <Card>
        <Sec>Add Record</Sec>
        <G2>
          <div><FL>Start Date</FL><input type="date" style={inp} value={form.start} onChange={e=>setForm(f=>({...f,start:e.target.value}))}/></div>
          <div><FL>End Date</FL><input type="date" style={inp} value={form.end} onChange={e=>setForm(f=>({...f,end:e.target.value}))}/></div>
          <div><FL>kg</FL><input type="number" style={inp} value={form.kg} onChange={e=>setForm(f=>({...f,kg:e.target.value}))}/></div>
          <div><FL>Cost (NPR)</FL><input type="number" style={inp} value={form.cost} onChange={e=>setForm(f=>({...f,cost:e.target.value}))}/></div>
        </G2>
        <button style={btn} onClick={add}>Add</button>
      </Card>
      {gasRecs.slice().reverse().map(r=>(
        <Row key={r.id}>
          <span style={{fontSize:18}}>{r.end?"✅":"🔵"}</span>
          <RMain title={`${r.kg}kg — NPR ${r.cost.toLocaleString()}`} sub={`${fmt(r.start)} ${r.end?"→ "+fmt(r.end):"→ In use"} · ${r.addedBy||""}`}/>
          {!r.end&&<button style={{...sucBtn,fontSize:11}} onClick={()=>markDone(r.id)}>Done</button>}
          <button style={danBtn} onClick={()=>remove(r.id)}>✕</button>
        </Row>
      ))}
      {mKeys.length>0&&<Card style={{marginTop:12}}>
        <Sec>Monthly Gas Cost</Sec>
        {mKeys.map((m,i)=><MiniBar key={m} label={new Date(m+"-01").toLocaleDateString("en-US",{month:"short",year:"2-digit"})} value={monthMap[m]} max={Math.max(...mKeys.map(k=>monthMap[k]))} color={COLORS[i%COLORS.length]}/>)}
      </Card>}
      <Card style={{marginTop:12}}>
        <PhotoStore
          photos={sharedData.gasPhotos||[]}
          onChange={photos=>setSharedData(d=>({...d,gasPhotos:photos}))}
          title="📷 Gas Bills & Documents"
        />
      </Card>
    </div>
  );
}
