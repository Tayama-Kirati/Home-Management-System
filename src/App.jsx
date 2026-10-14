import { useState } from "react";
import { P } from './constants/palette';
import { NAV_GROUPS } from './constants/navConfig';
import { SEED_USERS, SEED_CONNECTIONS, INITIAL_SHARED_DATA } from './utils/seedData';
import { PasswordInput } from './components/ui';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TodoPage from './pages/TodoPage';
import CalendarPage from './pages/CalendarPage';
import ChoresPage from './pages/ChoresPage';
import ContactsPage from './pages/ContactsPage';
import GroceryPage from './pages/GroceryPage';
import BillsPage from './pages/BillsPage';
import BudgetPage from './pages/BudgetPage';
import ReportPage from './pages/ReportPage';
import SavingsPage from './pages/SavingsPage';
import GasPage from './pages/GasPage';
import WaterPage from './pages/WaterPage';
import MaintenancePage from './pages/MaintenancePage';
import MedicinePage from './pages/MedicinePage';
import FamilyPage from './pages/FamilyPage';

const inputSt = {
  border:"1px solid #e2e8f0",borderRadius:12,padding:"10px 14px",fontSize:13,
  background:"#fff",color:P.navy,outline:"none",width:"100%",boxSizing:"border-box",
  boxShadow:"0 1px 3px rgba(0,0,0,.04)",
};

export default function App() {
  const [authPage,setAuthPage]     = useState("landing");
  const [users,setUsers]           = useState(SEED_USERS);
  const [connections,setConnections] = useState(SEED_CONNECTIONS);
  const [currentUser,setCurrentUser] = useState(null);
  const [activePage,setActivePage] = useState("todo");
  const [openGroups,setOpenGroups] = useState({Home:true,Finance:true,Utilities:true,Health:true,Family:true});
  const [showAbout,setShowAbout]   = useState(false);
  const [showLogoutModal,setShowLogoutModal] = useState(false);
  const [showAccountModal,setShowAccountModal] = useState(false);
  const [accountForm,setAccountForm] = useState(null);
  const [accountErr,setAccountErr] = useState("");
  const [sharedData,setSharedData] = useState(INITIAL_SHARED_DATA);

  const appTitle = sharedData?.appTitle || "KiratiKhim";

  const handleLogin  = u => setCurrentUser(u);
  const handleSignup = u => { setUsers(us=>[...us,u]); setCurrentUser(u); };

  const logout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    setCurrentUser(null); setAuthPage("landing"); setActivePage("todo");
    setShowLogoutModal(false);
  };

  const openAccount = () => {
    setAccountErr("");
    setAccountForm({ name:currentUser.name, avatar:currentUser.avatar, role:currentUser.role, appTitle, password:"", confirm:"" });
    setShowAccountModal(true);
  };

  const saveAccount = () => {
    if (!accountForm.name.trim()) { setAccountErr("Name is required."); return; }
    if (accountForm.password && accountForm.password !== accountForm.confirm) { setAccountErr("Passwords do not match."); return; }
    const av = accountForm.avatar.trim() || accountForm.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    const updated = {
      ...currentUser,
      name: accountForm.name.trim(),
      avatar: av,
      role: accountForm.role,
      ...(accountForm.password ? { password: accountForm.password } : {}),
    };
    setUsers(us => us.map(u => u.id===currentUser.id ? updated : u));
    setCurrentUser(updated);
    setSharedData(d => ({ ...d, appTitle: accountForm.appTitle?.trim() || "KiratiKhim" }));
    setShowAccountModal(false);
  };

  if (!currentUser) {
    if (authPage==="landing") return <LandingPage onGo={setAuthPage}/>;
    if (authPage==="login")   return <LoginPage users={users} onLogin={handleLogin} onGo={setAuthPage}/>;
    return <SignupPage onSignup={handleSignup} onGo={setAuthPage}/>;
  }

  const toggleGroup = label => setOpenGroups(g => ({ ...g, [label]:!g[label] }));
  const pageProps = { user:currentUser, users, sharedData, setSharedData, connections, setConnections };

  const renderPage = () => {
    const p = activePage;
    if (p==="todo")        return <TodoPage {...pageProps}/>;
    if (p==="calendar")    return <CalendarPage {...pageProps}/>;
    if (p==="chores")      return <ChoresPage {...pageProps}/>;
    if (p==="contacts")    return <ContactsPage {...pageProps}/>;
    if (p==="grocery")     return <GroceryPage {...pageProps}/>;
    if (p==="bills")       return <BillsPage {...pageProps}/>;
    if (p==="budget")      return <BudgetPage {...pageProps}/>;
    if (p==="report")      return <ReportPage sharedData={sharedData}/>;
    if (p==="savings")     return <SavingsPage {...pageProps}/>;
    if (p==="gas")         return <GasPage {...pageProps}/>;
    if (p==="water")       return <WaterPage {...pageProps}/>;
    if (p==="maintenance") return <MaintenancePage {...pageProps}/>;
    if (p==="medicine")    return <MedicinePage {...pageProps}/>;
    if (p==="family")      return <FamilyPage {...pageProps}/>;
    return <div>Page not found</div>;
  };

  const nb = {background:"transparent",color:"#9bbddd",border:"none",padding:"8px 14px",fontSize:13,fontWeight:500,cursor:"pointer",borderRadius:6,whiteSpace:"nowrap"};

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>

      {/* ── Top Navbar ── */}
      <nav style={{
        background:"linear-gradient(90deg,#0d1f38 0%,#1a3a5c 55%,#1e4370 100%)",
        display:"flex",alignItems:"center",padding:"0 20px",height:52,flexShrink:0,
        boxShadow:"0 2px 14px rgba(0,0,0,.35)",zIndex:200,
      }}>
        <span style={{color:"#7bc8f0",fontWeight:900,fontSize:19,fontFamily:"Georgia,serif",marginRight:20,cursor:"pointer",letterSpacing:"0.4px"}}
          onClick={()=>setActivePage("todo")}>
          🏠 {appTitle}
        </span>
        <button style={nb} onClick={()=>setActivePage("todo")}>Home</button>
        <button style={nb} onClick={()=>setShowAbout(true)}>About</button>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
          <span style={{color:"#9bbddd",fontSize:12,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{currentUser.name}</span>
          <div onClick={openAccount} title="Account settings" style={{
            width:34,height:34,borderRadius:"50%",cursor:"pointer",flexShrink:0,
            background:"linear-gradient(135deg,#2563a8 0%,#7c3aed 100%)",
            color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
            fontWeight:700,fontSize:12,border:"2px solid #7bc8f0",
            boxShadow:"0 2px 8px rgba(124,58,237,.4)",
          }}>
            {currentUser.avatar}
          </div>
          <button onClick={logout} style={{background:"rgba(255,255,255,.08)",color:"#9bbddd",border:"1px solid rgba(255,255,255,.15)",borderRadius:6,padding:"5px 12px",fontSize:12,cursor:"pointer"}}>
            Logout
          </button>
        </div>
      </nav>

      {/* ── Body ── */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* ── Sidebar ── */}
        <aside style={{
          width:220,
          background:"linear-gradient(180deg,#0b1d36 0%,#0f2744 50%,#122d52 100%)",
          display:"flex",flexDirection:"column",overflowY:"auto",flexShrink:0,
          boxShadow:"3px 0 12px rgba(0,0,0,.25)",
        }}>
          <div style={{padding:"10px 0 14px"}}>
            {NAV_GROUPS.map(group=>(
              <div key={group.label}>
                <div onClick={()=>toggleGroup(group.label)} style={{
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"9px 16px",cursor:"pointer",userSelect:"none",
                  color:"#5a9fd4",fontSize:10,fontWeight:700,letterSpacing:"1.2px",textTransform:"uppercase",
                }}>
                  <span>{group.label}</span>
                  <span style={{fontSize:11,color:"#3a6a90",transition:"transform .2s",transform:openGroups[group.label]?"rotate(0deg)":"rotate(-90deg)"}}>▾</span>
                </div>
                {openGroups[group.label] && group.items.map(item=>(
                  <div key={item.id} onClick={()=>setActivePage(item.id)} style={{
                    display:"flex",alignItems:"center",gap:9,
                    padding:"8px 16px 8px 26px",cursor:"pointer",
                    color:activePage===item.id?"#fff":"#9bbddd",
                    background:activePage===item.id?"linear-gradient(90deg,rgba(37,99,168,.55),rgba(124,58,237,.25))":"transparent",
                    borderLeft:`3px solid ${activePage===item.id?"#7bc8f0":"transparent"}`,
                    fontSize:12.5,fontWeight:activePage===item.id?700:400,
                    transition:"all .12s",
                  }}>
                    <span style={{fontSize:15,width:18,textAlign:"center",flexShrink:0}}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main style={{
          flex:1,overflowY:"auto",padding:"24px 28px",
          background:"linear-gradient(150deg,#e8f4fd 0%,#eef2ff 45%,#f5f0ff 100%)",
        }}>
          {renderPage()}
        </main>
      </div>

      {/* ── About Modal ── */}
      {showAbout&&(
        <Modal onClose={()=>setShowAbout(false)}>
          <div style={{fontSize:36,marginBottom:10,textAlign:"center"}}>🏠</div>
          <h2 style={{fontFamily:"Georgia,serif",color:P.navy,fontSize:22,textAlign:"center",marginBottom:16}}>About {appTitle}</h2>
          <p style={{fontSize:13.5,color:P.muted,lineHeight:1.8,marginBottom:12}}>
            {appTitle} is a family home management app built for Nepali households. It brings all household tasks under one roof — bills, chores, groceries, medicines, savings, and more.
          </p>
          <p style={{fontSize:13.5,color:P.muted,lineHeight:1.8,marginBottom:20}}>
            Every family member has their own account and sees the same shared data. All amounts are in <strong style={{color:P.navy}}>NPR</strong>. The app works offline in your browser — no subscription needed.
          </p>
          <button onClick={()=>setShowAbout(false)} style={{background:P.blue,color:"#fff",border:"none",borderRadius:9,padding:"10px 28px",fontWeight:700,fontSize:13,cursor:"pointer",width:"100%"}}>
            Close
          </button>
        </Modal>
      )}

      {/* ── Logout Confirmation ── */}
      {showLogoutModal&&(
        <Modal onClose={()=>setShowLogoutModal(false)} maxWidth={360}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:14}}>👋</div>
            <h2 style={{fontFamily:"Georgia,serif",color:P.navy,fontSize:20,marginBottom:10}}>Log Out?</h2>
            <p style={{fontSize:13.5,color:P.muted,marginBottom:26,lineHeight:1.6}}>
              Are you sure you want to log out of <strong style={{color:P.navy}}>{appTitle}</strong>?
            </p>
            <div style={{display:"flex",gap:12}}>
              <button onClick={()=>setShowLogoutModal(false)} style={{flex:1,background:P.skyBg,color:P.navy,border:`1px solid ${P.lightBlue}`,borderRadius:9,padding:"11px",fontWeight:600,fontSize:13,cursor:"pointer"}}>
                Stay
              </button>
              <button onClick={confirmLogout} style={{flex:1,background:"#c0392b",color:"#fff",border:"none",borderRadius:9,padding:"11px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                Yes, Log Out
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Account Modal ── */}
      {showAccountModal&&accountForm&&(
        <Modal onClose={()=>setShowAccountModal(false)} maxWidth={460}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:22}}>
            <div style={{
              width:54,height:54,borderRadius:"50%",flexShrink:0,
              background:"linear-gradient(135deg,#2563a8,#7c3aed)",
              color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
              fontWeight:700,fontSize:18,border:"3px solid #b8d4f0",
            }}>
              {accountForm.avatar||currentUser.avatar}
            </div>
            <div>
              <h2 style={{fontFamily:"Georgia,serif",color:P.navy,fontSize:20,margin:0}}>My Account</h2>
              <div style={{fontSize:12,color:P.muted,marginTop:2}}>{currentUser.email}</div>
            </div>
          </div>

          <FieldLabel>App Name</FieldLabel>
          <input style={{...inputSt,marginBottom:4}} placeholder="KiratiKhim" value={accountForm.appTitle||""} onChange={e=>setAccountForm(f=>({...f,appTitle:e.target.value}))}/>
          <div style={{fontSize:10,color:P.muted,marginBottom:14}}>Changes the title shown in the navbar.</div>

          <div style={{borderTop:`1px solid ${P.lightBlue}`,marginBottom:14}}/>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div>
              <FieldLabel>Full Name</FieldLabel>
              <input style={inputSt} value={accountForm.name}
                onChange={e=>{
                  const n=e.target.value;
                  setAccountForm(f=>({...f,name:n,avatar:n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||f.avatar}));
                }}/>
            </div>
            <div>
              <FieldLabel>Avatar (2 letters)</FieldLabel>
              <input style={inputSt} maxLength={2} value={accountForm.avatar}
                onChange={e=>setAccountForm(f=>({...f,avatar:e.target.value.toUpperCase()}))}/>
            </div>
          </div>

          <div style={{marginBottom:14}}>
            <FieldLabel>Role</FieldLabel>
            <select style={inputSt} value={accountForm.role} onChange={e=>setAccountForm(f=>({...f,role:e.target.value}))}>
              <option>Parent</option><option>Child</option><option>Other</option>
            </select>
          </div>

          <div style={{borderTop:`1px solid ${P.lightBlue}`,marginBottom:14}}/>
          <div style={{fontSize:12,color:P.muted,marginBottom:10,fontWeight:600}}>Change Password (leave blank to keep current)</div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:6}}>
            <div>
              <FieldLabel>New Password</FieldLabel>
              <PasswordInput style={inputSt} placeholder="New password" value={accountForm.password} onChange={e=>setAccountForm(f=>({...f,password:e.target.value}))}/>
            </div>
            <div>
              <FieldLabel>Confirm Password</FieldLabel>
              <PasswordInput style={inputSt} placeholder="Repeat" value={accountForm.confirm} onChange={e=>setAccountForm(f=>({...f,confirm:e.target.value}))}/>
            </div>
          </div>

          {accountErr&&<div style={{fontSize:11,color:P.danger,marginBottom:10}}>{accountErr}</div>}

          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button onClick={()=>setShowAccountModal(false)} style={{flex:1,background:P.skyBg,color:P.navy,border:`1px solid ${P.lightBlue}`,borderRadius:9,padding:"10px",fontWeight:600,fontSize:13,cursor:"pointer"}}>
              Cancel
            </button>
            <button onClick={saveAccount} style={{flex:1,background:"linear-gradient(90deg,#2563a8,#7c3aed)",color:"#fff",border:"none",borderRadius:9,padding:"10px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
              Save Changes
            </button>
          </div>

          <div style={{borderTop:`1px solid ${P.lightBlue}`,marginTop:16,paddingTop:14}}>
            <button onClick={()=>{setShowAccountModal(false);logout();}} style={{width:"100%",background:"#fff5f5",color:P.danger,border:`1px solid #f0a0a0`,borderRadius:9,padding:"10px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
              Log Out
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({children, onClose, maxWidth=500}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(10,20,40,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#fff",borderRadius:20,padding:"32px 28px",maxWidth,width:"100%",boxShadow:"0 24px 64px rgba(0,0,0,.3)",margin:"auto"}}>
        {children}
      </div>
    </div>
  );
}

function FieldLabel({children}) {
  return <label style={{fontSize:11,fontWeight:700,color:P.navy,display:"block",marginBottom:4,letterSpacing:"0.3px"}}>{children}</label>;
}
