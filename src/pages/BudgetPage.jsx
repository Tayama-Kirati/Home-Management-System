import { useState } from "react";
import { P } from '../constants/palette';
import { inp, btn } from '../constants/styles';
import { today, mk, fmtMonth, genId } from '../utils/helpers';
import { Card, Sec, FL, G3, Tabs } from '../components/ui';
import { ProgressBar } from '../components/charts';
import LoansSection from '../components/finance/LoansSection';

const CATS = ["Grocery","Bills","Gas","Loans & EMI","Other"];

export default function BudgetPage({user,users,sharedData,setSharedData}) {
  const [tab,setTab]=useState("budget");
  const budgets = sharedData.budgets||[];
  const setBudgets = fn => setSharedData(d=>({...d,budgets:typeof fn==="function"?fn(d.budgets||[]):fn}));
  const [form,setForm]=useState({category:"Grocery",limit:"",month:mk(today())});

  const grocerySpend = (sharedData.groceryItems||[]).filter(i=>mk(i.date)===form.month).reduce((s,i)=>s+i.price*i.qty,0);
  const billSpend = (sharedData.bills||[]).filter(b=>b.paidDate&&mk(b.paidDate)===form.month).reduce((s,b)=>s+b.amount,0);
  const gasSpend = (sharedData.gasRecs||[]).filter(r=>r.end&&mk(r.end)===form.month).reduce((s,r)=>s+r.cost,0);
  const emiSpend = (sharedData.loans||[]).flatMap(l=>l.payments||[]).filter(p=>mk(p.date)===form.month).reduce((s,p)=>s+p.amount,0);
  const spendMap={Grocery:grocerySpend,Bills:billSpend,Gas:gasSpend,"Loans & EMI":emiSpend};
  const months=[...new Set([...(sharedData.groceryItems||[]).map(i=>mk(i.date)),...(sharedData.bills||[]).map(b=>mk(b.paidDate)).filter(Boolean)])].filter(Boolean).sort().reverse();
  const selMonth=form.month;

  const add=()=>{
    if(!form.category||!form.limit)return;
    setBudgets(b=>{const existing=b.find(x=>x.category===form.category&&x.month===form.month);
      if(existing)return b.map(x=>x.category===form.category&&x.month===form.month?{...x,limit:parseFloat(form.limit)}:x);
      return[...b,{id:genId(),...form,limit:parseFloat(form.limit)}];
    });
    setForm(f=>({...f,limit:""}));
  };
  const monthBudgets=budgets.filter(b=>b.month===selMonth);

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>📊 Budget Planner</h2>
      <Tabs tabs={[["budget","📊 Monthly Budget"],["loans","🏦 Loans & EMI"]]} value={tab} onChange={setTab}/>
      {tab==="loans" ? <LoansSection user={user} users={users} sharedData={sharedData} setSharedData={setSharedData}/> : <>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <select style={{...inp,width:"auto"}} value={selMonth} onChange={e=>setForm(f=>({...f,month:e.target.value}))}>
          {(months.length?months:[mk(today())]).map(m=><option key={m} value={m}>{fmtMonth(m)}</option>)}
        </select>
        <div style={{background:P.blue,color:"#fff",borderRadius:10,padding:"7px 16px",fontWeight:700,fontSize:13}}>
          {fmtMonth(selMonth)||"Budget"}
        </div>
      </div>

      {CATS.map(cat=>{
        const b=monthBudgets.find(x=>x.category===cat);
        const spent=spendMap[cat]||0;
        const pct=b?Math.min(100,Math.round(spent/b.limit*100)):0;
        const over=b&&spent>b.limit;
        return <Card key={cat} style={{border:over?"1.5px solid #f0a0a0":"1px solid "+P.lightBlue,background:over?"#fff8f8":P.white}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontWeight:700,color:P.navy,fontSize:13}}>{cat}</div>
            {b?<div style={{fontSize:12,color:over?P.danger:P.success,fontWeight:700}}>NPR {spent.toLocaleString()} / {b.limit.toLocaleString()}{over?" ⚠️ Over budget!":""}</div>
            :<div style={{fontSize:11,color:P.muted}}>No budget set</div>}
          </div>
          {b&&<><ProgressBar pct={pct} color={over?"#c0392b":pct>80?"#c47d10":P.success} height={8}/><div style={{fontSize:10,color:P.muted,marginTop:3}}>{pct}% used</div></>}
          {!b&&<div style={{fontSize:12,color:P.muted}}>Set a monthly limit for {cat} to track spending.</div>}
        </Card>;
      })}

      <Card>
        <Sec>Set Budget Limit</Sec>
        <G3>
          <div><FL>Category</FL><select style={inp} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
          <div><FL>Monthly Limit (NPR)</FL><input style={inp} type="number" placeholder="5000" value={form.limit} onChange={e=>setForm(f=>({...f,limit:e.target.value}))}/></div>
          <div style={{display:"flex",alignItems:"flex-end"}}><button style={btn} onClick={add}>Set</button></div>
        </G3>
      </Card>
      </>}
    </div>
  );
}
