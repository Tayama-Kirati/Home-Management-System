import { useState } from "react";
import { P, COLORS } from '../constants/palette';
import { inp, btn, danBtn } from '../constants/styles';
import { today, fmt, mk, fmtMonth, genId } from '../utils/helpers';
import { Card, Sec, Row, RMain, G2 } from '../components/ui';
import { PieChart, Legend, ChartRow } from '../components/charts';

export default function GroceryPage({user,sharedData,setSharedData}) {
  const items=sharedData.groceryItems||[];
  const setItems=fn=>setSharedData(d=>({...d,groceryItems:typeof fn==="function"?fn(d.groceryItems||[]):fn}));
  const [form,setForm]=useState({name:"",price:"",qty:"1",date:today(),category:"Staples"});

  const months=[...new Set(items.map(i=>mk(i.date)))].filter(Boolean).sort().reverse();
  const [selMonth,setSelMonth]=useState(months[0]||mk(today()));
  const monthItems=items.filter(i=>mk(i.date)===(selMonth||mk(today())));
  const total=monthItems.reduce((s,i)=>s+i.price*i.qty,0);
  const catTotals={};
  monthItems.forEach(i=>{catTotals[i.category]=(catTotals[i.category]||0)+i.price*i.qty;});
  const pieData=Object.entries(catTotals).map(([k,v],idx)=>({label:k,value:v,color:COLORS[idx%COLORS.length]}));

  const add=()=>{
    if(!form.name||!form.price)return;
    setItems(it=>[...it,{id:genId(),...form,price:parseFloat(form.price),qty:parseInt(form.qty)||1,addedBy:user.name}]);
    setForm({name:"",price:"",qty:"1",date:today(),category:"Staples"});
  };
  const remove=id=>setItems(it=>it.filter(x=>x.id!==id));

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>🛒 Grocery</h2>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12,flexWrap:"wrap"}}>
        <select style={{...inp,width:"auto"}} value={selMonth} onChange={e=>setSelMonth(e.target.value)}>
          {(months.length?months:[mk(today())]).map(m=><option key={m} value={m}>{fmtMonth(m)}</option>)}
        </select>
        <div style={{background:P.blue,color:"#fff",borderRadius:10,padding:"7px 16px",fontWeight:700,fontSize:13}}>Total: NPR {total.toLocaleString()}</div>
      </div>
      {pieData.length>0&&<Card><Sec>By category</Sec><ChartRow pie={<PieChart data={pieData} size={130}/>} legend={<Legend data={pieData}/>}/></Card>}
      <Card>
        <Sec>+ Add Item</Sec>
        <G2>
          <input style={inp} placeholder="Item name…" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <input style={inp} type="number" placeholder="Price (NPR)" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))}/>
          <input style={inp} type="number" placeholder="Qty" value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))}/>
          <select style={inp} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}><option>Staples</option><option>Dairy</option><option>Vegetables</option><option>Fruits</option><option>Meat</option><option>Bakery</option><option>Snacks</option><option>Other</option></select>
          <input type="date" style={inp} value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
        </G2>
        <button style={btn} onClick={add}>Add</button>
      </Card>
      {monthItems.slice().reverse().map(i=>(
        <Row key={i.id}>
          <RMain title={i.name} sub={`${fmt(i.date)} · ${i.category} · Qty: ${i.qty} · ${i.addedBy||""}`}/>
          <div style={{fontWeight:700,color:P.blue}}>NPR {(i.price*i.qty).toLocaleString()}</div>
          <button style={danBtn} onClick={()=>remove(i.id)}>✕</button>
        </Row>
      ))}
    </div>
  );
}
