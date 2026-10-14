import { useState } from "react";
import { P } from '../constants/palette';
import { inp } from '../constants/styles';
import { today, mk, fmtMonth } from '../utils/helpers';
import { Card, Sec } from '../components/ui';
import { PieChart, Legend, ChartRow, MiniBar } from '../components/charts';

export default function ReportPage({sharedData}) {
  const [selMonth,setSelMonth]=useState(mk(today()));
  const months=[...new Set([...(sharedData.groceryItems||[]).map(i=>mk(i.date)),...(sharedData.bills||[]).map(b=>mk(b.paidDate)).filter(Boolean),...(sharedData.gasRecs||[]).map(r=>r.end?mk(r.end):"").filter(Boolean)])].filter(Boolean).sort().reverse();

  const grocery=(sharedData.groceryItems||[]).filter(i=>mk(i.date)===selMonth).reduce((s,i)=>s+i.price*i.qty,0);
  const bills=(sharedData.bills||[]).filter(b=>b.paidDate&&mk(b.paidDate)===selMonth).reduce((s,b)=>s+b.amount,0);
  const gas=(sharedData.gasRecs||[]).filter(r=>r.end&&mk(r.end)===selMonth).reduce((s,r)=>s+r.cost,0);
  const emi=(sharedData.loans||[]).flatMap(l=>l.payments||[]).filter(p=>mk(p.date)===selMonth).reduce((s,p)=>s+p.amount,0);
  const total=grocery+bills+gas+emi;
  const pieData=[{label:"Grocery",value:grocery,color:P.success},{label:"Bills",value:bills,color:P.amber},{label:"Gas",value:gas,color:P.blue},{label:"Loans & EMI",value:emi,color:P.purple}].filter(d=>d.value>0);
  const maxBar=Math.max(grocery,bills,gas,emi,1);

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>📈 Monthly Report</h2>
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        <select style={{...inp,width:"auto"}} value={selMonth} onChange={e=>setSelMonth(e.target.value)}>
          {(months.length?months:[mk(today())]).map(m=><option key={m} value={m}>{fmtMonth(m)}</option>)}
        </select>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[["🛒 Grocery",grocery,P.success],["💡 Bills",bills,P.amber],["⛽ Gas",gas,P.blue],["🏦 EMI",emi,P.purple]].map(([l,v,c])=>(
          <div key={l} style={{background:P.skyBg,borderRadius:12,padding:"14px 12px",textAlign:"center",border:`1px solid ${P.lightBlue}`}}>
            <div style={{fontSize:11,color:P.muted,marginBottom:4}}>{l}</div>
            <div style={{fontSize:18,fontWeight:700,color:c}}>NPR {v.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <Card style={{textAlign:"center",background:"linear-gradient(135deg,#eaf3fb,#d6e8f7)",border:"1.5px solid #7bb8e8"}}>
        <div style={{fontSize:13,color:P.muted}}>Total Expenses — {fmtMonth(selMonth)}</div>
        <div style={{fontSize:28,fontWeight:700,color:P.navy,margin:"6px 0"}}>NPR {total.toLocaleString()}</div>
      </Card>

      {pieData.length>0 && (
        <Card>
          <Sec>Spending breakdown</Sec>
          <ChartRow pie={<PieChart data={pieData} size={140}/>} legend={<Legend data={pieData}/>}/>
        </Card>
      )}

      <Card>
        <Sec>Category comparison</Sec>
        <MiniBar label="Grocery" value={grocery} max={maxBar} color={P.success}/>
        <MiniBar label="Bills" value={bills} max={maxBar} color={P.amber}/>
        <MiniBar label="Gas" value={gas} max={maxBar} color={P.blue}/>
        <MiniBar label="Loans & EMI" value={emi} max={maxBar} color={P.purple}/>
      </Card>
    </div>
  );
}
