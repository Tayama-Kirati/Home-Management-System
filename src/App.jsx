import { useState, useEffect, useRef, useCallback } from "react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  navy: "#1a3a5c", blue: "#2563a8", lightBlue: "#b8d4f0",
  skyBg: "#eaf3fb", surface: "#f0f7ff", white: "#fff",
  muted: "#6b8aa8", success: "#1a7a4a", danger: "#c0392b",
  amber: "#c47d10", purple: "#7c3aed", teal: "#0891b2",
};
const COLORS = ["#2563a8","#1a7a4a","#c47d10","#7c3aed","#c0392b","#0891b2","#b45309","#0f766e","#be185d","#0369a1"];

// ─── Shared Styles ───────────────────────────────────────────────────────────
const inp = { border:`1px solid ${P.lightBlue}`,borderRadius:8,padding:"8px 11px",fontSize:13,background:P.skyBg,color:P.navy,outline:"none",width:"100%",boxSizing:"border-box" };
const btn = { background:P.blue,color:"#fff",border:"none",borderRadius:8,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:"pointer" };
const danBtn = { ...btn, background:P.danger, padding:"5px 11px" };
const sucBtn = { ...btn, background:P.success, padding:"5px 11px" };
const card = { background:P.white,borderRadius:14,padding:"16px 18px",marginBottom:14,border:`1px solid ${P.lightBlue}` };

// ─── Helpers ─────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0,10);
const addDays = (d,n) => { const x=new Date(d+"T00:00:00"); x.setDate(x.getDate()+n); return x.toISOString().slice(0,10); };
const fmt = d => d ? new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";
const fmtMonth = d => d ? new Date(d+"-01").toLocaleDateString("en-US",{month:"long",year:"numeric"}) : "";
const mk = d => d ? d.slice(0,7) : "";
const genId = () => Date.now() + Math.random().toString(36).slice(2,6);

// ─── Mini Components ─────────────────────────────────────────────────────────
function Badge({label,color,bg}) {
  return <span style={{fontSize:10,fontWeight:700,background:bg,color,borderRadius:20,padding:"2px 9px",whiteSpace:"nowrap"}}>{label}</span>;
}
function Card({children,style}) {
  return <div style={{...card,...style}}>{children}</div>;
}
function Sec({children}) {
  return <div style={{fontWeight:700,color:P.navy,fontSize:13,marginBottom:10}}>{children}</div>;
}
function FL({children}) {
  return <div style={{fontSize:11,color:P.muted,marginBottom:3}}>{children}</div>;
}
function Row({children,style}) {
  return <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 13px",background:P.white,borderRadius:10,marginBottom:7,border:`1px solid ${P.lightBlue}`,...style}}>{children}</div>;
}
function RMain({title,sub,titleStyle}) {
  return <div style={{flex:1,minWidth:0}}>
    <div style={{fontWeight:600,color:P.navy,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",...titleStyle}}>{title}</div>
    {sub && <div style={{fontSize:11,color:P.muted,marginTop:2}}>{sub}</div>}
  </div>;
}
function G2({children,style}) {
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10,...style}}>{children}</div>;
}
function G3({children}) {
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>{children}</div>;
}

// ─── SVG Pie Chart ────────────────────────────────────────────────────────────
function PieChart({data, size=150}) {
  if(!data||!data.length||data.every(d=>d.value===0)) return <div style={{width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center",color:P.muted,fontSize:12}}>No data</div>;
  const total = data.reduce((s,d)=>s+d.value,0);
  let angle = -Math.PI/2;
  const cx=size/2, cy=size/2, r=size/2-8;
  const slices = data.filter(d=>d.value>0).map(d => {
    const a = (d.value/total)*2*Math.PI;
    const x1=cx+r*Math.cos(angle), y1=cy+r*Math.sin(angle);
    angle+=a;
    const x2=cx+r*Math.cos(angle), y2=cy+r*Math.sin(angle);
    const large=a>Math.PI?1:0;
    return {path:`M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2}Z`, color:d.color, label:d.label, pct:Math.round(d.value/total*100)};
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s,i)=><path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth={2}/>)}
      <circle cx={cx} cy={cy} r={r*0.42} fill="#fff"/>
    </svg>
  );
}

function Legend({data}) {
  const total = data.reduce((s,d)=>s+d.value,0);
  return <div style={{display:"flex",flexDirection:"column",gap:5,flex:1,justifyContent:"center"}}>
    {data.filter(d=>d.value>0).map((d,i)=>(
      <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:P.navy}}>
        <div style={{width:10,height:10,borderRadius:"50%",background:d.color,flexShrink:0}}/>
        <span><b>{d.label}</b> — {total?Math.round(d.value/total*100):0}%</span>
      </div>
    ))}
  </div>;
}

function ChartRow({pie,legend}) {
  return <div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
    {pie}
    {legend}
  </div>;
}

// ─── Donut for Todo ───────────────────────────────────────────────────────────
function Donut({done,total,size=100}) {
  const pct = total ? done/total : 0;
  const r=38,cx=50,cy=50,sw=10,circ=2*Math.PI*r;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{flexShrink:0}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={P.lightBlue} strokeWidth={sw}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={P.blue} strokeWidth={sw}
        strokeDasharray={`${pct*circ} ${circ}`} strokeDashoffset={circ/4} strokeLinecap="round"/>
      <text x={cx} y={cy-4} textAnchor="middle" fontSize="14" fontWeight="700" fill={P.navy}>{Math.round(pct*100)}%</text>
      <text x={cx} y={cy+12} textAnchor="middle" fontSize="9" fill={P.muted}>{done}/{total}</text>
    </svg>
  );
}

// ─── MiniBar ─────────────────────────────────────────────────────────────────
function MiniBar({label,value,max,color,showAmt=true}) {
  const pct = max ? Math.min(100,Math.round(value/max*100)) : 0;
  return <div style={{marginBottom:8}}>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:P.muted,marginBottom:3}}>
      <span>{label}</span>{showAmt&&<span style={{fontWeight:600,color:P.navy}}>NPR {value.toLocaleString()}</span>}
    </div>
    <div style={{background:P.lightBlue,borderRadius:4,height:7}}>
      <div style={{width:`${pct}%`,background:color||P.blue,borderRadius:4,height:7,transition:"width .4s"}}/>
    </div>
  </div>;
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({pct,color,height=10}) {
  return <div style={{background:P.lightBlue,borderRadius:6,height}}>
    <div style={{width:`${Math.min(100,pct)}%`,background:color||P.blue,borderRadius:6,height,transition:"width .5s"}}/>
  </div>;
}

// ─── SAMPLE DATA SEEDS ────────────────────────────────────────────────────────
const SEED_USERS = [
  { id:"u1", name:"Aarav Sharma", email:"aarav@family.com", password:"1234", avatar:"AS", role:"Parent" },
  { id:"u2", name:"Priya Sharma", email:"priya@family.com", password:"1234", avatar:"PS", role:"Parent" },
  { id:"u3", name:"Riya Sharma",  email:"riya@family.com",  password:"1234", avatar:"RS", role:"Child" },
];

const SEED_CONNECTIONS = [
  { id:"c1", from:"u1", to:"u2", status:"accepted" },
  { id:"c2", from:"u1", to:"u3", status:"accepted" },
  { id:"c3", from:"u2", to:"u3", status:"accepted" },
];

// ─── ALL PAGES IMPORT ────────────────────────────────────────────────────────
// (pages defined below in same file for single-file artifact)

// ═══════════════════════════════════════════════════════════════════════════

export default   
function CalendarPage({user,sharedData,setSharedData}) {
  const events = sharedData.events||[];
  const setEvents = fn => setSharedData(d=>({...d,events:typeof fn==="function"?fn(d.events||[]):fn}));
  const [form,setForm]=useState({title:"",date:today(),time:"10:00",type:"Event",notes:"",assignedTo:""});
  const [selDate,setSelDate]=useState(today());

  const addEvent = () => {
    if(!form.title||!form.date) return;
    setEvents(e=>[...e,{id:genId(),...form,createdBy:user.id,createdByName:user.name}]);
    setForm({title:"",date:today(),time:"10:00",type:"Event",notes:"",assignedTo:""});
  };
  const remove = id => setEvents(e=>e.filter(x=>x.id!==id));

  const today7 = Array.from({length:7},(_,i)=>addDays(today(),i-1));
  const todayEvents = events.filter(e=>e.date===selDate).sort((a,b)=>a.time>b.time?1:-1);
  const upcomingBills = (sharedData.bills||[]).filter(b=>!b.paidDate&&b.dueDate>=today()).sort((a,b)=>a.dueDate>b.dueDate?1:-1).slice(0,3);
  const upcomingMaint = (sharedData.maintenance||[]).filter(m=>m.nextDate>=today()).sort((a,b)=>a.nextDate>b.nextDate?1:-1).slice(0,3);

  const typeColor={Event:P.blue,Chore:P.success,Birthday:"#c0392b",Bill:P.amber,Medical:P.purple,Other:P.muted};

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>📅 Household Calendar</h2>

      {/* Week strip */}
      <Card>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
          {today7.map(d=>{
            const hasEv=events.some(e=>e.date===d);
            const isToday=d===today();
            return <div key={d} onClick={()=>setSelDate(d)} style={{textAlign:"center",padding:"8px 10px",borderRadius:10,cursor:"pointer",minWidth:52,background:selDate===d?P.blue:isToday?"#e6f0fb":P.skyBg,border:`1px solid ${selDate===d?"transparent":P.lightBlue}`,color:selDate===d?"#fff":P.navy,flexShrink:0}}>
              <div style={{fontSize:10,opacity:.8}}>{new Date(d+"T00:00").toLocaleDateString("en-US",{weekday:"short"})}</div>
              <div style={{fontSize:16,fontWeight:700}}>{new Date(d+"T00:00").getDate()}</div>
              {hasEv&&<div style={{width:6,height:6,borderRadius:"50%",background:selDate===d?"#fff":P.blue,margin:"3px auto 0"}}/>}
            </div>;
          })}
        </div>
        <div style={{marginTop:12,fontWeight:700,color:P.navy,fontSize:12}}>{fmt(selDate)}</div>
        {todayEvents.length===0 ? <div style={{fontSize:12,color:P.muted,marginTop:6}}>No events. Add one below.</div>
          : todayEvents.map(e=>(
          <Row key={e.id} style={{marginTop:6}}>
            <div style={{width:4,borderRadius:4,height:36,background:typeColor[e.type]||P.blue,flexShrink:0}}/>
            <RMain title={`${e.time} — ${e.title}`} sub={`${e.type} · ${e.createdByName}`}/>
            <Badge label={e.type} color={typeColor[e.type]||P.blue} bg={P.skyBg}/>
            <button style={danBtn} onClick={()=>remove(e.id)}>✕</button>
          </Row>
        ))}
      </Card>

      {/* Upcoming reminders */}
      {(upcomingBills.length>0||upcomingMaint.length>0)&&(
        <Card style={{background:"#fffbe6",border:"1.5px solid #f0c050"}}>
          <Sec>⚠️ Upcoming Reminders</Sec>
          {upcomingBills.map(b=><Row key={b.id} style={{background:"#fff8dc"}}><span>💡</span><RMain title={`${b.type} Bill Due`} sub={fmt(b.dueDate)}/><div style={{fontWeight:700,color:P.amber}}>NPR {b.amount?.toLocaleString()}</div></Row>)}
          {upcomingMaint.map(m=><Row key={m.id} style={{background:"#fff8dc"}}><span>🔧</span><RMain title={m.name} sub={`Due: ${fmt(m.nextDate)}`}/></Row>)}
        </Card>
      )}

      {/* Add Event */}
      <Card>
        <Sec>+ Add Event</Sec>
        <G2>
          <div><FL>Title</FL><input style={inp} placeholder="Event name…" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
          <div><FL>Type</FL><select style={inp} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option>Event</option><option>Chore</option><option>Birthday</option><option>Bill</option><option>Medical</option><option>Other</option></select></div>
          <div><FL>Date</FL><input type="date" style={inp} value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
          <div><FL>Time</FL><input type="time" style={inp} value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))}/></div>
        </G2>
        <input style={{...inp,marginBottom:10}} placeholder="Notes (optional)…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
        <button style={btn} onClick={addEvent}>Add Event</button>
      </Card>

      {/* All Events */}
      <Sec>All Events</Sec>
      {events.slice().sort((a,b)=>a.date>b.date?1:-1).map(e=>(
        <Row key={e.id}>
          <div style={{width:4,borderRadius:4,height:36,background:typeColor[e.type]||P.blue,flexShrink:0}}/>
          <RMain title={`${e.title}`} sub={`${fmt(e.date)} ${e.time} · ${e.type} · ${e.createdByName}`}/>
          <Badge label={e.type} color={typeColor[e.type]||P.blue} bg={P.skyBg}/>
          <button style={danBtn} onClick={()=>remove(e.id)}>✕</button>
        </Row>
      ))}
    </div>
  );
}

// AUTH PAGES
// ═══════════════════════════════════════════════════════════════════════════
function LoginPage({users, onLogin, onGo}) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const submit = () => {
    const u = users.find(u=>u.email===email&&u.password===pass);
    if(u) onLogin(u);
    else setErr("Invalid email or password");
  };
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a3a5c 0%,#2563a8 50%,#b8d4f0 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      {/* Left deco */}
     <div
  style={{
    position: "absolute",
    left: -60,
    top: -60,
    width: 300,
    height: 300,
    borderRadius: "50%",
    border: "60px solid rgba(255,255,255,.08)",
    transform: "rotate(45deg)"
  }}
/>


      <div style={{background:"rgba(255,255,255,.97)",borderRadius:20,padding:"36px 32px",width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:32,marginBottom:4}}>🏠</div>
          <h1 style={{color:P.navy,fontFamily:"Georgia,serif",fontSize:24,marginBottom:4}}>Welcome Back</h1>
          <p style={{color:P.muted,fontSize:13}}>Sign in to your HomeHub account</p>
        </div>
        {err && <div style={{background:"#fff5f5",border:"1px solid #f0a0a0",borderRadius:8,padding:"8px 12px",fontSize:12,color:P.danger,marginBottom:14}}>{err}</div>}
        <div style={{marginBottom:12}}>
          <FL>Email Address</FL>
          <input style={inp} type="email" placeholder="you@example.com" value={email} onChange={e=>{setEmail(e.target.value);setErr("")}} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>
        <div style={{marginBottom:18}}>
          <FL>Password</FL>
          <input style={inp} type="password" placeholder="••••••••" value={pass} onChange={e=>{setPass(e.target.value);setErr("")}} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>
        <button style={{...btn,width:"100%",padding:"11px",fontSize:14}} onClick={submit}>Log In</button>
        <div style={{textAlign:"center",marginTop:16,fontSize:12,color:P.muted}}>
          Don't have an account? <span style={{color:P.blue,cursor:"pointer",fontWeight:700}} onClick={()=>onGo("signup")}>Sign Up</span>
        </div>
        <div style={{marginTop:18,padding:"12px",background:P.skyBg,borderRadius:8,fontSize:11,color:P.muted}}>
          <b>Demo accounts:</b> aarav@family.com / priya@family.com / riya@family.com — all password: <b>1234</b>
        </div>
      </div>
    </div>
  );
}

function SignupPage({onSignup, onGo}) {
  const [form,setForm]=useState({name:"",email:"",password:"",confirm:"",role:"Parent"});
  const [err,setErr]=useState("");
  const submit = () => {
    if(!form.name||!form.email||!form.password){setErr("All fields required");return;}
    if(form.password!==form.confirm){setErr("Passwords do not match");return;}
    onSignup({id:genId(),name:form.name,email:form.email,password:form.password,avatar:form.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),role:form.role});
  };
  const f = k => v => setForm(p=>({...p,[k]:v}));
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a3a5c 0%,#2563a8 50%,#b8d4f0 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"rgba(255,255,255,.97)",borderRadius:20,padding:"36px 32px",width:"100%",maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:32,marginBottom:4}}>🏠</div>
          <h1 style={{color:P.navy,fontFamily:"Georgia,serif",fontSize:24,marginBottom:4}}>Create Account</h1>
          <p style={{color:P.muted,fontSize:13}}>Join HomeHub and manage your home together</p>
        </div>
        {err && <div style={{background:"#fff5f5",border:"1px solid #f0a0a0",borderRadius:8,padding:"8px 12px",fontSize:12,color:P.danger,marginBottom:14}}>{err}</div>}
        <G2>
          <div><FL>Full Name</FL><input style={inp} placeholder="Aarav Sharma" value={form.name} onChange={e=>f("name")(e.target.value)}/></div>
          <div><FL>Role</FL><select style={inp} value={form.role} onChange={e=>f("role")(e.target.value)}><option>Parent</option><option>Child</option><option>Other</option></select></div>
        </G2>
        <div style={{marginBottom:10}}><FL>Email Address</FL><input style={inp} type="email" placeholder="you@example.com" value={form.email} onChange={e=>f("email")(e.target.value)}/></div>
        <G2>
          <div><FL>Password</FL><input style={inp} type="password" placeholder="••••••••" value={form.password} onChange={e=>f("password")(e.target.value)}/></div>
          <div><FL>Confirm Password</FL><input style={inp} type="password" placeholder="••••••••" value={form.confirm} onChange={e=>f("confirm")(e.target.value)}/></div>
        </G2>
        <button style={{...btn,width:"100%",padding:"11px",fontSize:14,marginTop:6}} onClick={submit}>Create Account</button>
        <div style={{textAlign:"center",marginTop:14,fontSize:12,color:P.muted}}>
          Already have an account? <span style={{color:P.blue,cursor:"pointer",fontWeight:700}} onClick={()=>onGo("login")}>Log In</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FAMILY PAGE
// ═══════════════════════════════════════════════════════════════════════════
function FamilyPage({user, users, connections, setConnections, sharedData, onViewMember}) {
  const [searchEmail,setSearchEmail]=useState("");
  const [searchResult,setSearchResult]=useState(null);
  const [searchErr,setSearchErr]=useState("");

  const myConnections = connections.filter(c=>(c.from===user.id||c.to===user.id)&&c.status==="accepted");
  const pending = connections.filter(c=>c.to===user.id&&c.status==="pending");
  const sent = connections.filter(c=>c.from===user.id&&c.status==="pending");

  const connectedIds = myConnections.map(c=>c.from===user.id?c.to:c.from);
  const connectedUsers = connectedIds.map(id=>users.find(u=>u.id===id)).filter(Boolean);

  const search = () => {
    setSearchResult(null); setSearchErr("");
    if(!searchEmail.trim()){setSearchErr("Enter an email");return;}
    const found = users.find(u=>u.email===searchEmail.trim()&&u.id!==user.id);
    if(!found){setSearchErr("No user found with that email");return;}
    if(connectedIds.includes(found.id)){setSearchErr("Already connected");return;}
    const alreadySent = connections.find(c=>c.from===user.id&&c.to===found.id);
    if(alreadySent){setSearchErr("Request already sent");return;}
    setSearchResult(found);
  };
  const sendRequest = (toId) => {
    setConnections(c=>[...c,{id:genId(),from:user.id,to:toId,status:"pending"}]);
    setSearchResult(null); setSearchEmail(""); setSearchErr("Request sent!");
  };
  const accept = (cid) => setConnections(c=>c.map(x=>x.id===cid?{...x,status:"accepted"}:x));
  const decline = (cid) => setConnections(c=>c.filter(x=>x.id!==cid));
  const disconnect = (cid) => setConnections(c=>c.filter(x=>x.id!==cid));

  const avatarStyle = (color="#2563a8") => ({
    width:42,height:42,borderRadius:"50%",background:color,color:"#fff",
    display:"flex",alignItems:"center",justifyContent:"center",
    fontWeight:700,fontSize:14,flexShrink:0
  });

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:16}}>👨‍👩‍👧 Family & Connections</h2>

      {/* Connected Family */}
      <Card>
        <Sec>Connected Family Members ({connectedUsers.length})</Sec>
        {connectedUsers.length===0 && <div style={{fontSize:12,color:P.muted}}>No connections yet. Search below to add family members.</div>}
        {connectedUsers.map((u,i)=>(
          <Row key={u.id}>
            <div style={avatarStyle(COLORS[i%COLORS.length])}>{u.avatar}</div>
            <RMain title={u.name} sub={`${u.role} · ${u.email}`}/>
            <Badge label="Connected" color={P.success} bg="#e2f5eb"/>
            <button style={{...btn,padding:"5px 12px",fontSize:11}} onClick={()=>onViewMember(u)}>View</button>
            <button style={danBtn} onClick={()=>disconnect(connections.find(c=>(c.from===user.id&&c.to===u.id)||(c.to===user.id&&c.from===u.id))?.id)}>✕</button>
          </Row>
        ))}
      </Card>

      {/* Pending Requests */}
      {pending.length>0 && (
        <Card style={{border:"1.5px solid #7bb8e8",background:"#e8f4fd"}}>
          <Sec>📬 Incoming Requests ({pending.length})</Sec>
          {pending.map(c=>{
            const from=users.find(u=>u.id===c.from);
            return from ? (
              <Row key={c.id}>
                <div style={avatarStyle(P.amber)}>{from.avatar}</div>
                <RMain title={from.name} sub={`${from.role} · ${from.email}`}/>
                <button style={{...sucBtn,fontSize:11}} onClick={()=>accept(c.id)}>Accept</button>
                <button style={{...danBtn,fontSize:11}} onClick={()=>decline(c.id)}>Decline</button>
              </Row>
            ) : null;
          })}
        </Card>
      )}

      {/* Sent Requests */}
      {sent.length>0 && (
        <Card>
          <Sec>📤 Sent Requests</Sec>
          {sent.map(c=>{
            const to=users.find(u=>u.id===c.to);
            return to ? (
              <Row key={c.id}>
                <div style={avatarStyle(P.muted)}>{to.avatar}</div>
                <RMain title={to.name} sub={`${to.role} · ${to.email}`}/>
                <Badge label="Pending" color={P.amber} bg="#fef3e2"/>
                <button style={danBtn} onClick={()=>decline(c.id)}>Cancel</button>
              </Row>
            ) : null;
          })}
        </Card>
      )}

      {/* Search & Add */}
      <Card>
        <Sec>🔍 Add Family Member</Sec>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <input style={inp} placeholder="Enter their email address…" value={searchEmail} onChange={e=>{setSearchEmail(e.target.value);setSearchErr("");}} onKeyDown={e=>e.key==="Enter"&&search()}/>
          <button style={btn} onClick={search}>Search</button>
        </div>
        {searchErr && <div style={{fontSize:12,color:searchErr.includes("sent")?P.success:P.danger,marginTop:4}}>{searchErr}</div>}
        {searchResult && (
          <Row style={{marginTop:10,background:"#e8f4fd",border:"1.5px solid #7bb8e8"}}>
            <div style={avatarStyle(P.blue)}>{searchResult.avatar}</div>
            <RMain title={searchResult.name} sub={`${searchResult.role} · ${searchResult.email}`}/>
            <button style={btn} onClick={()=>sendRequest(searchResult.id)}>Send Request</button>
          </Row>
        )}
      </Card>

      {/* Shared Activity Feed */}
      <Card>
        <Sec>📰 Family Activity Feed</Sec>
        {sharedData.feed && sharedData.feed.length>0 ? sharedData.feed.slice(-8).reverse().map((item,i)=>(
          <div key={i} style={{display:"flex",gap:8,padding:"8px 0",borderBottom:i<Math.min(7,sharedData.feed.length-1)?`1px solid ${P.lightBlue}`:"none"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:P.blue,flexShrink:0,marginTop:5}}/>
            <div>
              <div style={{fontSize:12,color:P.navy,fontWeight:600}}>{item.user}</div>
              <div style={{fontSize:11,color:P.muted}}>{item.action} · {item.time}</div>
            </div>
          </div>
        )) : <div style={{fontSize:12,color:P.muted}}>No family activity yet.</div>}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TODO PAGE
// ═══════════════════════════════════════════════════════════════════════════
function TodoPage({user,sharedData,setSharedData}) {
  const tasks = sharedData.tasks||[];
  const setTasks = fn => setSharedData(d=>({...d,tasks:typeof fn==="function"?fn(d.tasks||[]):fn}));
  const [text,setText]=useState("");
  const [priority,setPriority]=useState("Medium");
  const [due,setDue]=useState(today());
  const [filter,setFilter]=useState("All");
  const [assignTo,setAssignTo]=useState(user.id);

  const addTask = () => {
    if(!text.trim()) return;
    setTasks(t=>[...t,{id:genId(),text:text.trim(),done:false,priority,due,assignedTo:assignTo,createdBy:user.id,createdByName:user.name}]);
    addFeed(`added task "${text.trim()}"`,user.name);
    setText("");
  };
  const addFeed = (action,name) => setSharedData(d=>({...d,feed:[...(d.feed||[]),{user:name,action,time:new Date().toLocaleTimeString()}]}));
  const toggle = id => { setTasks(t=>t.map(x=>x.id===id?{...x,done:!x.done}:x)); };
  const remove = id => setTasks(t=>t.filter(x=>x.id!==id));

  const shown = tasks.filter(t=>filter==="All"?true:filter==="Mine"?t.assignedTo===user.id:filter==="Pending"?!t.done:t.done);
  const done = tasks.filter(t=>t.done).length;
  const pc={High:["#c0392b","#fde8e6"],Medium:["#c47d10","#fef3e2"],Low:["#1a7a4a","#e2f5eb"]};
  const pieData=Object.entries({High:tasks.filter(t=>t.priority==="High").length,Medium:tasks.filter(t=>t.priority==="Medium").length,Low:tasks.filter(t=>t.priority==="Low").length}).filter(([,v])=>v>0).map(([k,v],i)=>({label:k,value:v,color:{"High":"#c0392b","Medium":"#c47d10","Low":"#1a7a4a"}[k]}));

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>✅ To-Do List</h2>
      <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}>
        <Donut done={done} total={tasks.length}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,flex:1}}>
          {["All","Mine","Pending","Done"].map(f=>(
            <div key={f} onClick={()=>setFilter(f)} style={{textAlign:"center",padding:"8px 4px",borderRadius:10,cursor:"pointer",background:filter===f?P.blue:P.skyBg,color:filter===f?"#fff":P.navy,fontWeight:600,fontSize:12,border:`1px solid ${P.lightBlue}`}}>
              <div style={{fontSize:18,fontWeight:700}}>{f==="All"?tasks.length:f==="Mine"?tasks.filter(t=>t.assignedTo===user.id).length:f==="Pending"?tasks.filter(t=>!t.done).length:done}</div>
              <div style={{fontSize:10,opacity:.8}}>{f}</div>
            </div>
          ))}
        </div>
      </div>
      <Card>
        <Sec>+ Add Task</Sec>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:7,marginBottom:8}}>
          <input style={inp} placeholder="Task…" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()}/>
          <select style={{...inp,width:"auto"}} value={priority} onChange={e=>setPriority(e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select>
          <input type="date" style={{...inp,width:"auto"}} value={due} onChange={e=>setDue(e.target.value)}/>
          <button style={btn} onClick={addTask}>Add</button>
        </div>
      </Card>
      {shown.map(t=>{
        const[tc,bg]=pc[t.priority]||["#888","#eee"];
        return <Row key={t.id} style={{background:t.done?P.skyBg:P.white,opacity:t.done?.8:1}}>
          <input type="checkbox" checked={t.done} onChange={()=>toggle(t.id)} style={{width:15,height:15,accentColor:P.blue,cursor:"pointer",flexShrink:0}}/>
          <RMain title={t.text} sub={`Due: ${fmt(t.due)} · by ${t.createdByName||"?"}`} titleStyle={t.done?{textDecoration:"line-through",color:P.muted}:{}}/>
          <Badge label={t.priority} color={tc} bg={bg}/>
          <button style={danBtn} onClick={()=>remove(t.id)}>✕</button>
        </Row>;
      })}
      {tasks.length>0 && (
        <Card style={{marginTop:14}}>
          <Sec>Priority breakdown</Sec>
          <ChartRow pie={<PieChart data={pieData} size={130}/>} legend={<Legend data={pieData}/>}/>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CALENDAR PAGE
// ═══════════════════════════════════════════════════════════════════════════
 
// ═══════════════════════════════════════════════════════════════════════════
// CHORE SCHEDULE
// ═══════════════════════════════════════════════════════════════════════════
function ChoresPage({user,users,sharedData,setSharedData,connections}) {
  const chores = sharedData.chores||[];
  const setChores = fn => setSharedData(d=>({...d,chores:typeof fn==="function"?fn(d.chores||[]):fn}));
  const [form,setForm]=useState({name:"",frequency:"Daily",assignedTo:user.id,day:"Monday",notes:""});

  const myConns = connections.filter(c=>(c.from===user.id||c.to===user.id)&&c.status==="accepted");
  const familyIds=[user.id,...myConns.map(c=>c.from===user.id?c.to:c.from)];
  const familyUsers=familyIds.map(id=>users.find(u=>u.id===id)).filter(Boolean);

  const addChore=()=>{
    if(!form.name)return;
    setChores(c=>[...c,{id:genId(),...form,done:false,doneBy:null,doneAt:null,createdBy:user.id}]);
    setForm({name:"",frequency:"Daily",assignedTo:user.id,day:"Monday",notes:""});
  };
  const toggleChore=id=>{
    setChores(c=>c.map(x=>x.id===id?{...x,done:!x.done,doneBy:!x.done?user.name:null,doneAt:!x.done?new Date().toLocaleDateString():null}:x));
  };
  const remove=id=>setChores(c=>c.filter(x=>x.id!==id));

  const freqColor={Daily:P.blue,Weekly:P.success,"Bi-weekly":P.amber,Monthly:P.purple};
  const byAssignee={};
  chores.forEach(c=>{byAssignee[c.assignedTo]=(byAssignee[c.assignedTo]||[]).concat(c)});
  const doneCount=chores.filter(c=>c.done).length;
  const pieData=familyUsers.map((u,i)=>({label:u.name.split(" ")[0],value:(byAssignee[u.id]||[]).length,color:COLORS[i%COLORS.length]})).filter(d=>d.value>0);

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>🧹 Chore Schedule</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[["Total",chores.length,P.blue],["Done",doneCount,P.success],["Pending",chores.length-doneCount,P.danger]].map(([l,v,c])=>(
          <div key={l} style={{background:P.skyBg,borderRadius:10,padding:"12px",textAlign:"center",border:`1px solid ${P.lightBlue}`}}>
            <div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:11,color:P.muted}}>{l}</div>
          </div>
        ))}
      </div>

      {pieData.length>0&&<Card><Sec>Chores by member</Sec><ChartRow pie={<PieChart data={pieData} size={130}/>} legend={<Legend data={pieData}/>}/></Card>}

      <Card>
        <Sec>+ Add Chore</Sec>
        <G2>
          <div><FL>Chore Name</FL><input style={inp} placeholder="Clean kitchen…" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div><FL>Frequency</FL><select style={inp} value={form.frequency} onChange={e=>setForm(f=>({...f,frequency:e.target.value}))}><option>Daily</option><option>Weekly</option><option>Bi-weekly</option><option>Monthly</option></select></div>
          <div><FL>Assign To</FL><select style={inp} value={form.assignedTo} onChange={e=>setForm(f=>({...f,assignedTo:e.target.value}))}>{familyUsers.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
          <div><FL>Day</FL><select style={inp} value={form.day} onChange={e=>setForm(f=>({...f,day:e.target.value}))}>{["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d=><option key={d}>{d}</option>)}</select></div>
        </G2>
        <button style={btn} onClick={addChore}>Add Chore</button>
      </Card>

      {familyUsers.map(u=>{
        const uChores=chores.filter(c=>c.assignedTo===u.id);
        if(!uChores.length) return null;
        return <div key={u.id}>
          <Sec>👤 {u.name}</Sec>
          {uChores.map(c=>(
            <Row key={c.id} style={{background:c.done?P.skyBg:P.white,opacity:c.done?.8:1}}>
              <input type="checkbox" checked={c.done} onChange={()=>toggleChore(c.id)} style={{width:15,height:15,accentColor:P.blue,cursor:"pointer",flexShrink:0}}/>
              <RMain title={c.name} sub={`${c.frequency} · ${c.day}${c.done?` · Done by ${c.doneBy}`:""}`} titleStyle={c.done?{textDecoration:"line-through",color:P.muted}:{}}/>
              <Badge label={c.frequency} color={freqColor[c.frequency]||P.muted} bg={P.skyBg}/>
              <button style={danBtn} onClick={()=>remove(c.id)}>✕</button>
            </Row>
          ))}
        </div>;
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTACTS PAGE
// ═══════════════════════════════════════════════════════════════════════════
function ContactsPage({user,sharedData,setSharedData}) {
  const contacts = sharedData.contacts||[];
  const setContacts = fn => setSharedData(d=>({...d,contacts:typeof fn==="function"?fn(d.contacts||[]):fn}));
  const [form,setForm]=useState({name:"",phone:"",category:"Service",notes:""});
  const [search,setSearch]=useState("");

  const cats=["Service","Medical","Emergency","Landlord","Neighbor","Other"];
  const catColor={Service:P.blue,Medical:P.purple,Emergency:P.danger,Landlord:P.amber,Neighbor:P.success,Other:P.muted};

  const add=()=>{
    if(!form.name||!form.phone)return;
    setContacts(c=>[...c,{id:genId(),...form,addedBy:user.name}]);
    setForm({name:"",phone:"",category:"Service",notes:""});
  };
  const remove=id=>setContacts(c=>c.filter(x=>x.id!==id));

  const filtered=contacts.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search)||c.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>📞 Emergency Contacts</h2>
      <input style={{...inp,marginBottom:14}} placeholder="Search contacts…" value={search} onChange={e=>setSearch(e.target.value)}/>
      <Card>
        <Sec>+ Add Contact</Sec>
        <G2>
          <div><FL>Name</FL><input style={inp} placeholder="Dr. Sharma…" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div><FL>Phone</FL><input style={inp} placeholder="+977-…" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
          <div><FL>Category</FL><select style={inp} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
          <div><FL>Notes</FL><input style={inp} placeholder="Notes…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
        </G2>
        <button style={btn} onClick={add}>Add Contact</button>
      </Card>
      {cats.map(cat=>{
        const catContacts=filtered.filter(c=>c.category===cat);
        if(!catContacts.length)return null;
        return <div key={cat}>
          <Sec style={{color:catColor[cat]||P.navy}}>{cat}</Sec>
          {catContacts.map(c=>(
            <Row key={c.id}>
              <div style={{width:38,height:38,borderRadius:"50%",background:catColor[c.category]||P.muted,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,flexShrink:0}}>{c.name.slice(0,2).toUpperCase()}</div>
              <RMain title={c.name} sub={`${c.phone}${c.notes?" · "+c.notes:""}`}/>
              <Badge label={c.category} color={catColor[c.category]||P.muted} bg={P.skyBg}/>
              <button style={danBtn} onClick={()=>remove(c.id)}>✕</button>
            </Row>
          ))}
        </div>;
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BUDGET PLANNER
// ═══════════════════════════════════════════════════════════════════════════
function BudgetPage({user,sharedData,setSharedData}) {
  const budgets = sharedData.budgets||[];
  const setBudgets = fn => setSharedData(d=>({...d,budgets:typeof fn==="function"?fn(d.budgets||[]):fn}));
  const [form,setForm]=useState({category:"Grocery",limit:"",month:mk(today())});

  const grocerySpend = (sharedData.groceryItems||[]).filter(i=>mk(i.date)===form.month).reduce((s,i)=>s+i.price*i.qty,0);
  const billSpend = (sharedData.bills||[]).filter(b=>b.paidDate&&mk(b.paidDate)===form.month).reduce((s,b)=>s+b.amount,0);
  const gasSpend = (sharedData.gasRecs||[]).filter(r=>r.end&&mk(r.end)===form.month).reduce((s,r)=>s+r.cost,0);
  const spendMap={Grocery:grocerySpend,Bills:billSpend,Gas:gasSpend};
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
  const remove=id=>setBudgets(b=>b.filter(x=>x.id!==id));
  const monthBudgets=budgets.filter(b=>b.month===selMonth);

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>📊 Budget Planner</h2>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <select style={{...inp,width:"auto"}} value={selMonth} onChange={e=>setForm(f=>({...f,month:e.target.value}))}>
          {(months.length?months:[mk(today())]).map(m=><option key={m} value={m}>{fmtMonth(m)}</option>)}
        </select>
        <div style={{background:P.blue,color:"#fff",borderRadius:10,padding:"7px 16px",fontWeight:700,fontSize:13}}>
          {fmtMonth(selMonth)||"Budget"}
        </div>
      </div>

      {["Grocery","Bills","Gas","Other"].map(cat=>{
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
          <div><FL>Category</FL><select style={inp} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}><option>Grocery</option><option>Bills</option><option>Gas</option><option>Other</option></select></div>
          <div><FL>Monthly Limit (NPR)</FL><input style={inp} type="number" placeholder="5000" value={form.limit} onChange={e=>setForm(f=>({...f,limit:e.target.value}))}/></div>
          <div style={{display:"flex",alignItems:"flex-end"}}><button style={btn} onClick={add}>Set</button></div>
        </G3>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MONTHLY REPORT
// ═══════════════════════════════════════════════════════════════════════════
function ReportPage({sharedData}) {
  const [selMonth,setSelMonth]=useState(mk(today()));
  const months=[...new Set([...(sharedData.groceryItems||[]).map(i=>mk(i.date)),...(sharedData.bills||[]).map(b=>mk(b.paidDate)).filter(Boolean),...(sharedData.gasRecs||[]).map(r=>r.end?mk(r.end):"").filter(Boolean)])].filter(Boolean).sort().reverse();

  const grocery=(sharedData.groceryItems||[]).filter(i=>mk(i.date)===selMonth).reduce((s,i)=>s+i.price*i.qty,0);
  const bills=(sharedData.bills||[]).filter(b=>b.paidDate&&mk(b.paidDate)===selMonth).reduce((s,b)=>s+b.amount,0);
  const gas=(sharedData.gasRecs||[]).filter(r=>r.end&&mk(r.end)===selMonth).reduce((s,r)=>s+r.cost,0);
  const total=grocery+bills+gas;

  const pieData=[{label:"Grocery",value:grocery,color:P.success},{label:"Bills",value:bills,color:P.amber},{label:"Gas",value:gas,color:P.blue}].filter(d=>d.value>0);
  const maxBar=Math.max(grocery,bills,gas,1);

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>📈 Monthly Report</h2>
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        <select style={{...inp,width:"auto"}} value={selMonth} onChange={e=>setSelMonth(e.target.value)}>
          {(months.length?months:[mk(today())]).map(m=><option key={m} value={m}>{fmtMonth(m)}</option>)}
        </select>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[["🛒 Grocery",grocery,P.success],["💡 Bills",bills,P.amber],["⛽ Gas",gas,P.blue]].map(([l,v,c])=>(
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
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICINE TRACKER
// ═══════════════════════════════════════════════════════════════════════════
function MedicinePage({user,users,sharedData,setSharedData,connections}) {
  const meds = sharedData.medicines||[];
  const setMeds = fn => setSharedData(d=>({...d,medicines:typeof fn==="function"?fn(d.medicines||[]):fn}));
  const [form,setForm]=useState({name:"",dosage:"",frequency:"Daily",assignedTo:user.id,startDate:today(),endDate:"",notes:"",stock:""});
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
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE SCHEDULER
// ═══════════════════════════════════════════════════════════════════════════
function MaintenancePage({user,sharedData,setSharedData}) {
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
              <div style={{fontSize:11,color:P.muted,marginTop:2}}>{m.category} · Every {m.intervalDays} days{m.cost?` · NPR ${m.cost.toLocaleString()}`:""}
              </div>
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
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WATER TRACKER
// ═══════════════════════════════════════════════════════════════════════════
function WaterPage({user,sharedData,setSharedData}) {
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
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SAVINGS GOALS
// ═══════════════════════════════════════════════════════════════════════════
function SavingsPage({user,sharedData,setSharedData}) {
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
  const catColor={Festival:P.amber,Appliance:P.blue,Travel:P.teal,Education:P.purple,Emergency:P.danger,Other:P.muted};
  const pieData=goals.map((g,i)=>({label:g.name,value:g.target,color:COLORS[i%COLORS.length]}));

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:14}}>🎯 Savings Goals</h2>

      {goals.length>0&&<Card><Sec>Goals overview</Sec><ChartRow pie={<PieChart data={pieData} size={130}/>} legend={<Legend data={pieData}/>}/></Card>}

      {goals.map((g,i)=>{
        const pct=Math.min(100,Math.round(g.saved/g.target*100));
        const done=g.saved>=g.target;
        const daysLeft=g.deadline?Math.ceil((new Date(g.deadline)-new Date(today()))/86400000):null;
        return <Card key={g.id} style={{border:done?"1.5px solid #1a7a4a":i===0?"1px solid "+P.lightBlue:"1px solid "+P.lightBlue}}>
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

// ═══════════════════════════════════════════════════════════════════════════
// GAS + GROCERY + BILLS (reused from before, shared data)
// ═══════════════════════════════════════════════════════════════════════════
function GasPage({user,sharedData,setSharedData}) {
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
        <Row key={r.id}><span style={{fontSize:18}}>{r.end?"✅":"🔵"}</span>
          <RMain title={`${r.kg}kg — NPR ${r.cost.toLocaleString()}`} sub={`${fmt(r.start)} ${r.end?"→ "+fmt(r.end):"→ In use"} · ${r.addedBy||""}`}/>
          {!r.end&&<button style={{...sucBtn,fontSize:11}} onClick={()=>markDone(r.id)}>Done</button>}
          <button style={danBtn} onClick={()=>remove(r.id)}>✕</button>
        </Row>
      ))}
      {mKeys.length>0&&<Card style={{marginTop:12}}>
        <Sec>Monthly Gas Cost</Sec>
        {mKeys.map((m,i)=><MiniBar key={m} label={new Date(m+"-01").toLocaleDateString("en-US",{month:"short",year:"2-digit"})} value={monthMap[m]} max={Math.max(...mKeys.map(k=>monthMap[k]))} color={COLORS[i%COLORS.length]}/>)}
      </Card>}
    </div>
  );
}

function GroceryPage({user,sharedData,setSharedData}) {
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

function BillsPage({user,sharedData,setSharedData}) {
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
      {pending.length>0&&<><Sec style={{color:P.danger}}>⚠️ Pending</Sec>{pending.map(b=>{const ov=b.dueDate<today();return(<Row key={b.id} style={{background:ov?"#fff5f5":P.white,border:ov?"1.5px solid #f0a0a0":"1px solid "+P.lightBlue}}><RMain title={`${b.type}${b.period?" — "+b.period:""}`} sub={`Due: ${fmt(b.dueDate)}${ov?" · OVERDUE":""}`} titleStyle={ov?{color:P.danger}:{}}/><div style={{fontWeight:700,color:P.navy,fontSize:13}}>NPR {b.amount.toLocaleString()}</div><button style={{...sucBtn,fontSize:11}} onClick={()=>markPaid(b.id)}>Paid</button><button style={danBtn} onClick={()=>remove(b.id)}>✕</button></Row>);})}</>}
      {paid.length>0&&<><Sec style={{color:P.success,marginTop:10}}>✅ Paid</Sec>{paid.slice().reverse().map(b=><Row key={b.id} style={{background:P.skyBg,opacity:.8}}><RMain title={`${b.type}${b.period?" — "+b.period:""}`} sub={`Paid: ${fmt(b.paidDate)}`}/><div style={{fontWeight:700,color:P.muted}}>NPR {b.amount.toLocaleString()}</div><button style={danBtn} onClick={()=>remove(b.id)}>✕</button></Row>)}</>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NAV CONFIG
// ═══════════════════════════════════════════════════════════════════════════
const NAV_GROUPS = [
  { label:"Home", items:[{id:"todo",icon:"✅",label:"Todo"},{id:"calendar",icon:"📅",label:"Calendar"},{id:"chores",icon:"🧹",label:"Chores"},{id:"contacts",icon:"📞",label:"Contacts"}]},
  { label:"Finance", items:[{id:"grocery",icon:"🛒",label:"Grocery"},{id:"bills",icon:"💡",label:"Bills"},{id:"budget",icon:"📊",label:"Budget"},{id:"report",icon:"📈",label:"Report"},{id:"savings",icon:"🎯",label:"Savings"}]},
  { label:"Utilities", items:[{id:"gas",icon:"⛽",label:"Gas"},{id:"water",icon:"💧",label:"Water"},{id:"maintenance",icon:"🔧",label:"Maint."}]},
  { label:"Health", items:[{id:"medicine",icon:"💊",label:"Medicine"}]},
  { label:"Family", items:[{id:"family",icon:"👨‍👩‍👧",label:"Family"}]},
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [authPage,setAuthPage]=useState("login");
  const [users,setUsers]=useState(SEED_USERS);
  const [connections,setConnections]=useState(SEED_CONNECTIONS);
  const [currentUser,setCurrentUser]=useState(null);
  const [activePage,setActivePage]=useState("todo");
  const [viewingMember,setViewingMember]=useState(null);
  const [menuOpen,setMenuOpen]=useState(false);

  // Shared data: all family-visible data lives here
  const [sharedData,setSharedData]=useState({
    tasks:[
      {id:"t1",text:"Buy groceries",done:false,priority:"High",due:today(),assignedTo:"u1",createdBy:"u1",createdByName:"Aarav Sharma"},
      {id:"t2",text:"Pay electricity bill",done:false,priority:"High",due:today(),assignedTo:"u2",createdBy:"u2",createdByName:"Priya Sharma"},
      {id:"t3",text:"Riya's school fees",done:true,priority:"Medium",due:addDays(today(),-2),assignedTo:"u1",createdBy:"u1",createdByName:"Aarav Sharma"},
    ],
    events:[
      {id:"e1",title:"Tihar celebration",date:addDays(today(),7),time:"06:00",type:"Event",notes:"",createdBy:"u1",createdByName:"Aarav"},
      {id:"e2",title:"Doctor appointment",date:addDays(today(),3),time:"10:30",type:"Medical",notes:"",createdBy:"u2",createdByName:"Priya"},
    ],
    chores:[
      {id:"ch1",name:"Wash dishes",frequency:"Daily",assignedTo:"u3",day:"Monday",done:false,doneBy:null,createdBy:"u1"},
      {id:"ch2",name:"Mop floors",frequency:"Weekly",assignedTo:"u2",day:"Saturday",done:false,doneBy:null,createdBy:"u1"},
    ],
    contacts:[
      {id:"co1",name:"Dr. Poudel",phone:"+977-9841234567",category:"Medical",notes:"Family doctor",addedBy:"Aarav"},
      {id:"co2",name:"Hari Electrician",phone:"+977-9851234567",category:"Service",notes:"",addedBy:"Priya"},
    ],
    bills:[
      {id:"b1",type:"Electricity",amount:1850,dueDate:addDays(today(),5),paidDate:null,period:"May 2026",addedBy:"Aarav"},
      {id:"b2",type:"Waste Management",amount:300,dueDate:addDays(today(),10),paidDate:null,period:"May 2026",addedBy:"Priya"},
      {id:"b3",type:"Electricity",amount:1620,dueDate:addDays(today(),-30),paidDate:addDays(today(),-28),period:"Apr 2026",addedBy:"Aarav"},
    ],
    groceryItems:[
      {id:"g1",name:"Rice (5kg)",price:650,qty:1,date:today(),category:"Staples",addedBy:"Priya"},
      {id:"g2",name:"Milk (1L)",price:100,qty:4,date:today(),category:"Dairy",addedBy:"Priya"},
      {id:"g3",name:"Lentils",price:200,qty:2,date:addDays(today(),-32),category:"Staples",addedBy:"Priya"},
    ],
    gasRecs:[
      {id:"gas1",start:addDays(today(),-35),end:addDays(today(),-5),kg:14.2,cost:2200,addedBy:"Aarav"},
      {id:"gas2",start:addDays(today(),-5),end:null,kg:14.2,cost:2200,addedBy:"Aarav"},
    ],
    medicines:[
      {id:"m1",name:"Vitamin D",dosage:"1 tablet",frequency:"Daily",assignedTo:"u1",startDate:today(),endDate:"",notes:"After breakfast",stock:28,taken:[],addedBy:"Priya"},
    ],
    maintenance:[
      {id:"mn1",name:"AC Servicing",category:"HVAC",intervalDays:90,lastDate:addDays(today(),-80),nextDate:addDays(today(),10),cost:1500,notes:"",addedBy:"Aarav",history:[]},
      {id:"mn2",name:"Pest Control",category:"Pest",intervalDays:180,lastDate:addDays(today(),-20),nextDate:addDays(today(),160),cost:2000,notes:"",addedBy:"Aarav",history:[]},
    ],
    waterLogs:[
      {id:"w1",date:today(),level:"75",liters:50,cost:0,notes:"",loggedBy:"Aarav"},
    ],
    savings:[
      {id:"s1",name:"Dashain Fund",target:50000,saved:18000,deadline:addDays(today(),60),category:"Festival",notes:"",addedBy:"Aarav",history:[]},
    ],
    budgets:[],
    feed:[
      {user:"Aarav",action:"added task 'Buy groceries'",time:"9:30 AM"},
      {user:"Priya",action:"marked electricity bill as paid",time:"Yesterday"},
    ],
    tankSize:1000,
  });

  const handleLogin=u=>{setCurrentUser(u);};
  const handleSignup=u=>{setUsers(us=>[...us,u]);setCurrentUser(u);};
  const logout=()=>{setCurrentUser(null);setAuthPage("login");setActivePage("todo");};

  if(!currentUser) {
    return authPage==="login"
      ? <LoginPage users={users} onLogin={handleLogin} onGo={setAuthPage}/>
      : <SignupPage onSignup={handleSignup} onGo={setAuthPage}/>;
  }

  const pageProps={user:currentUser,users,sharedData,setSharedData,connections,setConnections};

  const renderPage=()=>{
    const p=activePage;
    if(p==="todo") return <TodoPage {...pageProps}/>;
    if(p==="calendar") return <CalendarPage {...pageProps}/>;
    if(p==="chores") return <ChoresPage {...pageProps}/>;
    if(p==="contacts") return <ContactsPage {...pageProps}/>;
    if(p==="grocery") return <GroceryPage {...pageProps}/>;
    if(p==="bills") return <BillsPage {...pageProps}/>;
    if(p==="budget") return <BudgetPage {...pageProps}/>;
    if(p==="report") return <ReportPage sharedData={sharedData}/>;
    if(p==="savings") return <SavingsPage {...pageProps}/>;
    if(p==="gas") return <GasPage {...pageProps}/>;
    if(p==="water") return <WaterPage {...pageProps}/>;
    if(p==="maintenance") return <MaintenancePage {...pageProps}/>;
    if(p==="medicine") return <MedicinePage {...pageProps}/>;
    if(p==="family") return <FamilyPage {...pageProps} onViewMember={u=>{setViewingMember(u);}} />;
    return <div>Page not found</div>;
  };

  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:P.skyBg,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* Top Nav */}
      <div style={{background:P.navy,display:"flex",alignItems:"center",padding:"0 14px",position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 12px rgba(0,0,0,.25)"}}>
        <div style={{color:"#7bc8f0",fontWeight:900,fontSize:17,fontFamily:"Georgia,serif",marginRight:14,padding:"13px 0",whiteSpace:"nowrap"}}>🏠 HomeHub</div>
        <div style={{flex:1,display:"flex",gap:1,overflowX:"auto"}}>
          {NAV_GROUPS.map(g=>g.items.map(item=>(
            <button key={item.id} onClick={()=>setActivePage(item.id)} style={{background:activePage===item.id?"#2563a8":"transparent",color:activePage===item.id?"#fff":"#9bbddd",border:"none",borderBottom:`3px solid ${activePage===item.id?"#7bc8f0":"transparent"}`,padding:"12px 10px",fontWeight:activePage===item.id?700:400,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",transition:"all .15s"}}>
              {item.icon} {item.label}
            </button>
          )))}
        </div>
        {/* User avatar */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:10,flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"#2563a8",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,border:"2px solid #7bc8f0",cursor:"pointer"}} title={currentUser.name}>{currentUser.avatar}</div>
          <button onClick={logout} style={{background:"transparent",color:"#9bbddd",border:"1px solid #2563a8",borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer"}}>Logout</button>
        </div>
      </div>

      {/* Page content */}
      <div style={{maxWidth:760,margin:"0 auto",padding:"22px 16px 80px",width:"100%"}}>
        {renderPage()}
      </div>
    </div>
  );
}