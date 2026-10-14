import { useState } from "react";
import { P } from '../constants/palette';
import { inp, btn, danBtn } from '../constants/styles';
import { today, fmt, genId } from '../utils/helpers';
import { Card, Sec, FL, Row, RMain, G2, Badge } from '../components/ui';
import PhotoStore from '../components/ui/PhotoStore';
import { PieChart } from '../components/charts';

export default function WaterPage({user,sharedData,setSharedData}) {
  const logs=sharedData.waterLogs||[];
  const setLogs=fn=>setSharedData(d=>({...d,waterLogs:typeof fn==="function"?fn(d.waterLogs||[]):fn}));
  const [form,setForm]=useState({date:today(),level:"Full",liters:"",notes:"",cost:""});
  const [tankSize,setTankSize]=useState(sharedData.tankSize||1000);

  const add=()=>{
    setLogs(l=>[...l,{id:genId(),...form,liters:parseFloat(form.liters)||0,cost:parseFloat(form.cost)||0,loggedBy:user.name}]);
    setSharedData(d=>({...d,tankSize}));
    setForm({date:today(),level:"Full",liters:"",notes:"",cost:""});
  };
  const remove=id=>setLogs(l=>l.filter(x=>x.id!==id));
  const last=logs.slice().sort((a,b)=>a.date>b.date?-1:1)[0];
  const avgDailyUse=logs.length>1?Math.round(logs.filter(l=>l.liters).reduce((s,l)=>s+l.liters,0)/logs.filter(l=>l.liters).length):0;
  const levelPct={Full:100,75:75,Half:50,25:25,Low:10,Empty:0};
  const lastPct=last?levelPct[last.level]??50:100;
  const daysLeft=avgDailyUse>0?Math.round(tankSize*lastPct/100/avgDailyUse):null;
  const pieData=[{label:"Used",value:100-lastPct,color:P.blue},{label:"Remaining",value:lastPct,color:P.lightBlue}].filter(d=>d.value>0);

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>💧 Water Tracker</h2>
      <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
        <div>
          <PieChart data={pieData} size={130}/>
          <div style={{textAlign:"center",fontSize:12,color:P.navy,fontWeight:700,marginTop:4}}>{lastPct}% Full</div>
        </div>
        <div style={{flex:1}}>
          <Card style={{margin:0}}>
            <div style={{fontSize:12,color:P.muted}}>Tank Size</div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <input type="number" style={{...inp,width:90}} value={tankSize} onChange={e=>setTankSize(parseInt(e.target.value)||1000)}/>
              <span style={{fontSize:12,color:P.muted}}>liters</span>
            </div>
            {daysLeft!==null&&<div style={{fontSize:12,color:P.navy}}>Est. <b style={{color:daysLeft<3?P.danger:P.success}}>{daysLeft} days</b> of water left</div>}
            {avgDailyUse>0&&<div style={{fontSize:11,color:P.muted}}>Avg daily use: {avgDailyUse}L</div>}
          </Card>
        </div>
      </div>
      {last&&last.level==="Low"&&<div style={{background:"#fff5f5",border:"1.5px solid #f0a0a0",borderRadius:10,padding:"10px 14px",fontSize:12,color:P.danger,fontWeight:700,marginBottom:12}}>⚠️ Tank level is LOW! Arrange water refill soon.</div>}
      <Card>
        <Sec>Log Water Level</Sec>
        <G2>
          <div><FL>Date</FL><input type="date" style={inp} value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
          <div><FL>Tank Level</FL><select style={inp} value={form.level} onChange={e=>setForm(f=>({...f,level:e.target.value}))}><option>Full</option><option>75</option><option>Half</option><option>25</option><option>Low</option><option>Empty</option></select></div>
          <div><FL>Liters Used (optional)</FL><input type="number" style={inp} value={form.liters} onChange={e=>setForm(f=>({...f,liters:e.target.value}))}/></div>
          <div><FL>Refill Cost (NPR)</FL><input type="number" style={inp} value={form.cost} onChange={e=>setForm(f=>({...f,cost:e.target.value}))}/></div>
        </G2>
        <input style={{...inp,marginBottom:10}} placeholder="Notes…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
        <button style={btn} onClick={add}>Log</button>
      </Card>
      <Sec>Water Log History</Sec>
      {logs.slice().sort((a,b)=>a.date>b.date?-1:1).map(l=>(
        <Row key={l.id}>
          <span style={{fontSize:20}}>💧</span>
          <RMain title={`${fmt(l.date)} — ${l.level} tank`} sub={`${l.liters?l.liters+"L used · ":""}{l.cost?"NPR "+l.cost+" refill · ":""}{l.loggedBy}`}/>
          <Badge label={l.level} color={P.blue} bg={P.skyBg}/>
          <button style={danBtn} onClick={()=>remove(l.id)}>✕</button>
        </Row>
      ))}
      <Card style={{marginTop:12}}>
        <PhotoStore
          photos={sharedData.waterPhotos||[]}
          onChange={photos=>setSharedData(d=>({...d,waterPhotos:photos}))}
          title="📷 Water Bills & Documents"
        />
      </Card>
    </div>
  );
}
