import { useState } from "react";
import { P, COLORS } from '../constants/palette';
import { inp, btn, danBtn, sucBtn } from '../constants/styles';
import { today, fmt, genId } from '../utils/helpers';
import { Card, Sec, FL, Row, RMain, G2, Badge } from '../components/ui';
import { PieChart, Legend, ChartRow } from '../components/charts';

export default function BillsPage({user,sharedData,setSharedData}) {
  const bills=sharedData.bills||[];
  const setBills=fn=>setSharedData(d=>({...d,bills:typeof fn==="function"?fn(d.bills||[]):fn}));
  const [form,setForm]=useState({type:"Electricity",amount:"",dueDate:today(),period:""});

  const pending=bills.filter(b=>!b.paidDate), paid=bills.filter(b=>b.paidDate);
  const typeTotals={};bills.forEach(b=>{typeTotals[b.type]=(typeTotals[b.type]||0)+b.amount;});
  const pieData=Object.entries(typeTotals).map(([k,v],i)=>({label:k,value:v,color:COLORS[i%COLORS.length]}));

  const add=()=>{
    if(!form.amount)return;
    setBills(b=>[...b,{id:genId(),...form,amount:parseFloat(form.amount),paidDate:null,addedBy:user.name}]);
    setForm({type:"Electricity",amount:"",dueDate:today(),period:""});
  };
  const markPaid=id=>setBills(b=>b.map(x=>x.id===id?{...x,paidDate:today()}:x));
  const remove=id=>setBills(b=>b.filter(x=>x.id!==id));

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>💡 Bills</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[["Pending",pending.length,P.danger],["Paid",paid.length,P.success],["Owed","NPR "+pending.reduce((s,b)=>s+b.amount,0).toLocaleString(),P.amber]].map(([l,v,c])=>(
          <div key={l} style={{background:P.skyBg,borderRadius:10,padding:"10px",textAlign:"center",border:`1px solid ${P.lightBlue}`}}>
            <div style={{fontSize:typeof v==="string"?13:22,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:11,color:P.muted}}>{l}</div>
          </div>
        ))}
      </div>
      {pieData.length>0&&<Card><Sec>Bills by type</Sec><ChartRow pie={<PieChart data={pieData} size={130}/>} legend={<Legend data={pieData}/>}/></Card>}
      <Card>
        <Sec>+ Add Bill</Sec>
        <G2>
          <select style={inp} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option>Electricity</option><option>Waste Management</option><option>Internet</option><option>Water</option><option>Other</option></select>
          <input style={inp} type="number" placeholder="Amount (NPR)" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/>
          <div><FL>Due Date</FL><input type="date" style={inp} value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}/></div>
          <input style={inp} placeholder="Period (May 2026)" value={form.period} onChange={e=>setForm(f=>({...f,period:e.target.value}))}/>
        </G2>
        <button style={btn} onClick={add}>Add Bill</button>
      </Card>
      {pending.length>0&&(
        <>
          <Sec style={{color:P.danger}}>⚠️ Pending</Sec>
          {pending.map(b=>{
            const ov=b.dueDate<today();
            return <Row key={b.id} style={{background:ov?"#fff5f5":P.white,border:ov?"1.5px solid #f0a0a0":"1px solid "+P.lightBlue}}>
              <RMain title={`${b.type}${b.period?" — "+b.period:""}`} sub={`Due: ${fmt(b.dueDate)}${ov?" · OVERDUE":""}`} titleStyle={ov?{color:P.danger}:{}}/>
              <div style={{fontWeight:700,color:P.navy,fontSize:13}}>NPR {b.amount.toLocaleString()}</div>
              <button style={{...sucBtn,fontSize:11}} onClick={()=>markPaid(b.id)}>Paid</button>
              <button style={danBtn} onClick={()=>remove(b.id)}>✕</button>
            </Row>;
          })}
        </>
      )}
      {paid.length>0&&(
        <>
          <Sec style={{color:P.success,marginTop:10}}>✅ Paid</Sec>
          {paid.slice().reverse().map(b=>(
            <Row key={b.id} style={{background:P.skyBg,opacity:.8}}>
              <RMain title={`${b.type}${b.period?" — "+b.period:""}`} sub={`Paid: ${fmt(b.paidDate)}`}/>
              <div style={{fontWeight:700,color:P.muted}}>NPR {b.amount.toLocaleString()}</div>
              <button style={danBtn} onClick={()=>remove(b.id)}>✕</button>
            </Row>
          ))}
        </>
      )}
    </div>
  );
}
