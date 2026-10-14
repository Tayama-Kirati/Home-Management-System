import { useState } from "react";
import { P, COLORS } from '../../constants/palette';
import { inp, btn, danBtn, sucBtn } from '../../constants/styles';
import { genId } from '../../utils/helpers';
import { todayLocal, shiftMonths, fmtShort, fmtMonthYear } from '../../utils/dates';
import { calcEmi, loanStatus, schedule, prepaymentImpact, npr } from '../../utils/loanMath';
import { Card, Sec, FL, G2, G3, Badge } from '../ui';
import { ProgressBar, PieChart, Legend, ChartRow } from '../charts';

const LOAN_TYPES = [
  { id:"Home",       icon:"🏠" },
  { id:"Vehicle",    icon:"🛵" },
  { id:"Personal",   icon:"💳" },
  { id:"Education",  icon:"🎓" },
  { id:"Gold",       icon:"🪙" },
  { id:"Business",   icon:"🏪" },
  { id:"Cooperative",icon:"🏦" },
  { id:"Gadget EMI", icon:"📱" },
  { id:"Family / Friends", icon:"🤝" },
];
const typeIcon = t => LOAN_TYPES.find(x=>x.id===t)?.icon || "💰";

const blank = { name:"", type:"Home", lender:"", principal:"", rate:"", tenure:"", tenureUnit:"years", startDate:todayLocal(), emi:"", alreadyPaid:"", borrower:"", notes:"" };

export default function LoansSection({ user, users, sharedData, setSharedData }) {
  const loans = sharedData.loans || [];
  const setLoans = fn => setSharedData(d=>({...d,loans:typeof fn==="function"?fn(d.loans||[]):fn}));
  const income = Number(sharedData.monthlyIncome)||0;
  const [form,setForm] = useState(blank);
  const [showForm,setShowForm] = useState(false);
  const [open,setOpen] = useState(null);
  const [prepay,setPrepay] = useState({});
  const [extra,setExtra] = useState({});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const addFeed = action => setSharedData(d=>({...d,feed:[...(d.feed||[]),{user:user.name,action,time:new Date().toLocaleTimeString()}]}));

  const months = (Number(form.tenure)||0) * (form.tenureUnit==="years" ? 12 : 1);
  const autoEmi = calcEmi(form.principal, form.rate, months);
  const previewEmi = Number(form.emi) || autoEmi;
  const previewInterest = form.principal && months ? schedule(Number(form.principal), form.rate, previewEmi, form.startDate).reduce((s,x)=>s+x.interest,0) : 0;

  const addLoan = () => {
    if (!form.name.trim() || !Number(form.principal) || !months) return;
    const emi = Math.round(previewEmi);
    // Backfill EMIs paid before the loan was added to the app.
    const backfill = Array.from({ length: Math.min(Number(form.alreadyPaid)||0, months) }, (_,i) => ({
      id:genId(), date:shiftMonths(form.startDate,i), amount:emi, kind:"emi", by:"(before app)",
    }));
    setLoans(l => [...l, {
      id:genId(), name:form.name.trim(), type:form.type, lender:form.lender.trim(), principal:Number(form.principal),
      rate:Number(form.rate)||0, tenure:months, startDate:form.startDate, emi, borrower:form.borrower, notes:form.notes,
      payments:backfill, addedBy:user.name,
    }]);
    addFeed(`added loan '${form.name.trim()}' (EMI ${npr(emi)})`);
    setForm(blank); setShowForm(false);
  };

  const pay = (loan, s, kind, amount) => {
    if (!(amount > 0)) return;
    setLoans(l => l.map(x => x.id===loan.id ? { ...x, payments:[...(x.payments||[]), { id:genId(), date:todayLocal(), amount, kind, by:user.name, forDue: kind==="emi" ? s.nextDue : null }] } : x));
    addFeed(kind==="emi" ? `paid ${npr(amount)} EMI for '${loan.name}'` : `prepaid ${npr(amount)} on '${loan.name}'`);
  };
  const undoPayment = (loanId, pid) => setLoans(l => l.map(x => x.id===loanId ? { ...x, payments:x.payments.filter(p=>p.id!==pid) } : x));
  const remove = id => setLoans(l => l.filter(x=>x.id!==id));

  const rows = loans.map(l => ({ loan:l, s:loanStatus(l) }));
  const active = rows.filter(r=>!r.s.closed);
  const totalOutstanding = active.reduce((s,r)=>s+r.s.balance,0);
  const totalEmi = active.reduce((s,r)=>s+r.s.emi,0);
  const dueSoon = active.filter(r=>r.s.daysToDue<=7);
  const ratio = income ? totalEmi/income*100 : null;
  const ratioColor = ratio==null ? P.muted : ratio>50 ? P.danger : ratio>35 ? P.amber : P.success;
  const pieData = active.map((r,i)=>({ label:r.loan.name, value:Math.round(r.s.balance), color:COLORS[i%COLORS.length] }));

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:14}}>
        {[
          ["Outstanding", npr(totalOutstanding), P.navy, `${active.length} active loan${active.length===1?"":"s"}`],
          ["Monthly EMI", npr(totalEmi), P.blue, "all loans combined"],
          ["Due in 7 days", dueSoon.length, dueSoon.some(r=>r.s.daysToDue<0)?P.danger:P.amber, dueSoon.some(r=>r.s.daysToDue<0)?"includes overdue!":"upcoming EMIs"],
          ["EMI / income", ratio==null?"—":`${Math.round(ratio)}%`, ratioColor, ratio==null?"set income below":ratio>50?"too high: risky":ratio>35?"getting heavy":"healthy"],
        ].map(([l,v,c,sub]) => (
          <div key={l} style={{background:"#fff",borderRadius:12,padding:"14px 12px",textAlign:"center",border:`1px solid ${P.lightBlue}`,boxShadow:"0 2px 8px rgba(37,99,168,.07)"}}>
            <div style={{fontSize:11,color:P.muted,marginBottom:4}}>{l}</div>
            <div style={{fontSize:19,fontWeight:800,color:c}}>{v}</div>
            <div style={{fontSize:10.5,color:P.muted,marginTop:2}}>{sub}</div>
          </div>
        ))}
      </div>

      <Card>
        <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
          <div style={{flex:"1 1 200px"}}>
            <FL>Household monthly income (NPR), used to check whether EMIs are affordable</FL>
            <input style={inp} type="number" placeholder="e.g. 120000" value={sharedData.monthlyIncome||""} onChange={e=>setSharedData(d=>({...d,monthlyIncome:e.target.value}))}/>
          </div>
          {income>0 && <div style={{fontSize:12,color:P.muted,flex:"1 1 200px"}}>After EMIs: <b style={{color:P.navy}}>{npr(income-totalEmi)}</b> left each month. Banks usually prefer total EMIs under 40–50% of income.</div>}
        </div>
      </Card>

      {pieData.length>1 && <Card><Sec>Where the debt is</Sec><ChartRow pie={<PieChart data={pieData} size={130}/>} legend={<Legend data={pieData}/>}/></Card>}

      {rows.sort((a,b)=>a.s.closed-b.s.closed || a.s.nextDue.localeCompare(b.s.nextDue)).map(({loan,s}) => {
        const overdue = !s.closed && s.daysToDue < 0;
        const soon = !s.closed && s.daysToDue >= 0 && s.daysToDue <= 7;
        const isOpen = open===loan.id;
        const ex = Number(extra[loan.id])||0;
        const impact = ex>0 && !s.closed ? prepaymentImpact(s.balance, loan.rate, s.emi, s.nextDue, ex) : null;
        const borrower = users.find(u=>u.id===loan.borrower);
        return (
          <Card key={loan.id} style={{border:overdue?"1.5px solid #f0a0a0":s.closed?"1.5px solid #b6e4cc":`1px solid ${P.lightBlue}`,background:overdue?"#fff8f8":"#fff"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10,flexWrap:"wrap"}}>
              <div style={{fontSize:26}}>{typeIcon(loan.type)}</div>
              <div style={{flex:1,minWidth:160}}>
                <div style={{fontWeight:800,color:P.navy,fontSize:15}}>{s.closed?"🎉 ":""}{loan.name}</div>
                <div style={{fontSize:11.5,color:P.muted}}>
                  {loan.type}{loan.lender?` · ${loan.lender}`:""} · {loan.rate}% p.a. · {loan.tenure} months{borrower?` · in ${borrower.name.split(" ")[0]}'s name`:""}
                </div>
              </div>
              {s.closed ? <Badge label="Paid off" color="#fff" bg={P.success}/>
                : overdue ? <Badge label={`Overdue ${-s.daysToDue}d`} color="#fff" bg={P.danger}/>
                : soon ? <Badge label={s.daysToDue===0?"Due today":`Due in ${s.daysToDue}d`} color="#fff" bg={P.amber}/>
                : <Badge label={`Next: ${fmtShort(s.nextDue)}`} color={P.blue} bg={P.skyBg}/>}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginBottom:10}}>
              {[["EMI",npr(s.emi)],["Outstanding",npr(s.balance)],["Interest paid",npr(s.interestPaid)],["Interest left",npr(s.remainingInterest)],["EMIs paid",`${s.emiCount} / ${loan.tenure}`],["Debt-free by",s.payoffDate?fmtMonthYear(s.payoffDate):s.closed?"Done":"—"]].map(([l,v])=>(
                <div key={l} style={{background:P.skyBg,borderRadius:10,padding:"8px 10px"}}>
                  <div style={{fontSize:10.5,color:P.muted}}>{l}</div>
                  <div style={{fontSize:13.5,fontWeight:700,color:P.navy}}>{v}</div>
                </div>
              ))}
            </div>
            <ProgressBar pct={s.paidPct} color={s.closed?P.success:P.blue} height={8}/>
            <div style={{fontSize:10.5,color:P.muted,margin:"3px 0 12px"}}>{Math.round(s.paidPct)}% of principal repaid · {npr(s.principalPaid)} of {npr(loan.principal)}</div>

            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              {!s.closed && <button style={sucBtn} onClick={()=>pay(loan,s,"emi",Math.min(s.emi, s.balance*(1+loan.rate/1200)))}>✓ Mark EMI paid ({fmtShort(s.nextDue)})</button>}
              {!s.closed && <>
                <input style={{...inp,width:130,padding:"6px 10px"}} type="number" placeholder="Prepay amount" value={prepay[loan.id]||""} onChange={e=>setPrepay(p=>({...p,[loan.id]:e.target.value}))}/>
                <button style={{...sucBtn,background:P.purple}} onClick={()=>{pay(loan,s,"prepayment",Number(prepay[loan.id]));setPrepay(p=>({...p,[loan.id]:""}));}}>Prepay</button>
              </>}
              <button style={{...danBtn,background:P.blue}} onClick={()=>setOpen(isOpen?null:loan.id)}>{isOpen?"Hide details":"Details & schedule"}</button>
              <button style={{...danBtn,marginLeft:"auto"}} onClick={()=>remove(loan.id)}>Delete</button>
            </div>

            {isOpen && (
              <div style={{marginTop:14,borderTop:`1px solid ${P.lightBlue}`,paddingTop:14}}>
                {!s.closed && (
                  <div style={{background:"#f5f0ff",borderRadius:12,padding:"12px 14px",marginBottom:14}}>
                    <div style={{fontWeight:700,color:P.purple,fontSize:12.5,marginBottom:6}}>💡 What if we paid a bit extra each month?</div>
                    <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{fontSize:12,color:P.navy}}>Extra NPR</span>
                      <input style={{...inp,width:120,padding:"6px 10px"}} type="number" placeholder="2000" value={extra[loan.id]||""} onChange={e=>setExtra(x=>({...x,[loan.id]:e.target.value}))}/>
                      {impact && <span style={{fontSize:12.5,color:P.navy}}>
                        Saves <b style={{color:P.success}}>{npr(impact.interestSaved)}</b> in interest and finishes <b>{impact.monthsSaved} month{impact.monthsSaved===1?"":"s"}</b> early{impact.newPayoff?` (by ${fmtMonthYear(impact.newPayoff)})`:""}.
                      </span>}
                    </div>
                  </div>
                )}

                {!s.closed && <>
                  <Sec>Upcoming 12 months</Sec>
                  <div style={{overflowX:"auto",marginBottom:14}}>
                    <table style={{width:"100%",fontSize:12,borderCollapse:"collapse",color:P.navy}}>
                      <thead><tr style={{color:P.muted,textAlign:"right"}}>
                        <th style={{textAlign:"left",padding:"4px 6px"}}>Due</th><th style={{padding:"4px 6px"}}>EMI</th><th style={{padding:"4px 6px"}}>Interest</th><th style={{padding:"4px 6px"}}>Principal</th><th style={{padding:"4px 6px"}}>Balance after</th>
                      </tr></thead>
                      <tbody>
                        {schedule(s.balance, loan.rate, s.emi, s.nextDue).slice(0,12).map(r=>(
                          <tr key={r.n} style={{textAlign:"right",borderTop:`1px solid ${P.skyBg}`}}>
                            <td style={{textAlign:"left",padding:"4px 6px"}}>{fmtShort(r.date)} {r.date.slice(0,4)}</td>
                            <td style={{padding:"4px 6px"}}>{npr(r.payment)}</td>
                            <td style={{padding:"4px 6px",color:P.danger}}>{npr(r.interest)}</td>
                            <td style={{padding:"4px 6px",color:P.success}}>{npr(r.principal)}</td>
                            <td style={{padding:"4px 6px"}}>{npr(r.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>}

                <Sec>Payment history ({(loan.payments||[]).length})</Sec>
                {[...(loan.payments||[])].reverse().slice(0,24).map(p=>(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,padding:"5px 0",borderBottom:`1px solid ${P.skyBg}`}}>
                    <span style={{width:90,color:P.muted}}>{fmtShort(p.date)} {p.date.slice(0,4)}</span>
                    <Badge label={p.kind==="prepayment"?"Prepayment":"EMI"} color={p.kind==="prepayment"?P.purple:P.blue} bg={P.skyBg}/>
                    <span style={{flex:1,fontWeight:700,color:P.navy}}>{npr(p.amount)}</span>
                    <span style={{color:P.muted}}>{p.by}</span>
                    <button style={{...danBtn,padding:"2px 8px",fontSize:10}} onClick={()=>undoPayment(loan.id,p.id)}>Undo</button>
                  </div>
                ))}
                {!(loan.payments||[]).length && <div style={{fontSize:12,color:P.muted,fontStyle:"italic"}}>No payments recorded yet.</div>}
                {loan.notes && <div style={{fontSize:12,color:P.muted,marginTop:10}}>📝 {loan.notes}</div>}
              </div>
            )}
          </Card>
        );
      })}

      {!loans.length && !showForm && (
        <div style={{fontSize:13,color:P.muted,textAlign:"center",padding:"20px 0",fontStyle:"italic"}}>No loans tracked yet. Add your home loan, bike EMI, or money borrowed from family to keep every due date in view.</div>
      )}

      {!showForm ? (
        <button style={{...btn,width:"100%",background:"linear-gradient(90deg,#2563a8,#7c3aed)"}} onClick={()=>setShowForm(true)}>+ Add a loan / EMI</button>
      ) : (
        <Card>
          <Sec>+ Add Loan / EMI</Sec>
          <G3>
            <div><FL>Name</FL><input style={inp} placeholder="Home loan, Scooter EMI…" value={form.name} onChange={e=>set("name",e.target.value)}/></div>
            <div><FL>Type</FL><select style={inp} value={form.type} onChange={e=>set("type",e.target.value)}>{LOAN_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.id}</option>)}</select></div>
            <div><FL>Lender (bank, cooperative, person)</FL><input style={inp} placeholder="Nabil Bank" value={form.lender} onChange={e=>set("lender",e.target.value)}/></div>
          </G3>
          <G3>
            <div><FL>Loan amount (NPR)</FL><input style={inp} type="number" placeholder="2500000" value={form.principal} onChange={e=>set("principal",e.target.value)}/></div>
            <div><FL>Interest rate (% per year)</FL><input style={inp} type="number" step="0.01" placeholder="11.5" value={form.rate} onChange={e=>set("rate",e.target.value)}/></div>
            <div><FL>Tenure</FL>
              <div style={{display:"flex",gap:6}}>
                <input style={inp} type="number" placeholder="15" value={form.tenure} onChange={e=>set("tenure",e.target.value)}/>
                <select style={{...inp,width:100}} value={form.tenureUnit} onChange={e=>set("tenureUnit",e.target.value)}><option value="years">years</option><option value="months">months</option></select>
              </div>
            </div>
          </G3>
          <G3>
            <div><FL>First EMI date</FL><input style={inp} type="date" value={form.startDate} onChange={e=>set("startDate",e.target.value)}/></div>
            <div><FL>EMIs already paid</FL><input style={inp} type="number" min="0" placeholder="0" value={form.alreadyPaid} onChange={e=>set("alreadyPaid",e.target.value)}/></div>
            <div><FL>EMI (leave blank to calculate)</FL><input style={inp} type="number" placeholder={autoEmi?Math.round(autoEmi):"auto"} value={form.emi} onChange={e=>set("emi",e.target.value)}/></div>
          </G3>
          <G2>
            <div><FL>In whose name</FL><select style={inp} value={form.borrower} onChange={e=>set("borrower",e.target.value)}><option value="">Household</option>{users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
            <div><FL>Notes</FL><input style={inp} placeholder="Account no. last 4, collateral, etc." value={form.notes} onChange={e=>set("notes",e.target.value)}/></div>
          </G2>
          {previewEmi>0 && (
            <div style={{background:P.skyBg,borderRadius:10,padding:"10px 14px",fontSize:12.5,color:P.navy,marginBottom:12}}>
              Monthly EMI <b>{npr(previewEmi)}</b> · total interest <b style={{color:P.danger}}>{npr(previewInterest)}</b> · total repayment <b>{npr(Number(form.principal)+previewInterest)}</b>
              {income>0 && <> · would bring EMIs to <b>{Math.round((totalEmi+previewEmi)/income*100)}%</b> of income</>}
            </div>
          )}
          <div style={{display:"flex",gap:8}}>
            <button style={btn} onClick={addLoan}>Add Loan</button>
            <button style={{...btn,background:P.skyBg,color:P.navy}} onClick={()=>{setForm(blank);setShowForm(false);}}>Cancel</button>
          </div>
        </Card>
      )}
    </div>
  );
}
