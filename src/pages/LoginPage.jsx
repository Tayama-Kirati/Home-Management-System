import { useState } from "react";
import { P } from '../constants/palette';
import { inp, btn } from '../constants/styles';
import { FL, PasswordInput } from '../components/ui';

export default function LoginPage({users, onLogin, onGo}) {
  const [email,setEmail] = useState("");
  const [pass,setPass]   = useState("");
  const [err,setErr]     = useState("");

  const submit = () => {
    if (!email || !pass) { setErr("Enter your email and password."); return; }
    const u = users.find(u=>u.email===email.trim()&&u.password===pass);
    if (u) onLogin(u);
    else setErr("Invalid email or password.");
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a3a5c 0%,#2563a8 50%,#b8d4f0 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"rgba(255,255,255,.97)",borderRadius:20,padding:"36px 32px",width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:32,marginBottom:4}}>🏠</div>
          <h1 style={{color:P.navy,fontFamily:"Georgia,serif",fontSize:24,marginBottom:4}}>Welcome Back</h1>
          <p style={{color:P.muted,fontSize:13}}>Sign in to your KiratiKhim account</p>
        </div>
        {err&&<div style={{background:"#fff5f5",border:"1px solid #f0a0a0",borderRadius:8,padding:"8px 12px",fontSize:12,color:P.danger,marginBottom:14}}>{err}</div>}
        <div style={{marginBottom:12}}>
          <FL>Email Address</FL>
          <input style={inp} type="email" placeholder="you@example.com" value={email}
            onChange={e=>{setEmail(e.target.value);setErr("");}}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>
        <div style={{marginBottom:18}}>
          <FL>Password</FL>
          <PasswordInput style={inp} placeholder="••••••••" value={pass}
            onChange={e=>{setPass(e.target.value);setErr("");}}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>
        <button style={{...btn,width:"100%",padding:"11px",fontSize:14}} onClick={submit}>Log In</button>
        <div style={{textAlign:"center",marginTop:16,fontSize:12,color:P.muted}}>
          Don't have an account?{" "}
          <span style={{color:P.blue,cursor:"pointer",fontWeight:700}} onClick={()=>onGo("signup")}>Sign Up</span>
        </div>
        <div style={{textAlign:"center",marginTop:10,fontSize:12,color:P.muted}}>
          <span style={{cursor:"pointer"}} onClick={()=>onGo("landing")}>← Back to Home</span>
        </div>
        <div style={{marginTop:18,padding:"12px",background:P.skyBg,borderRadius:8,fontSize:11,color:P.muted}}>
          <b>Demo:</b> aarav@family.com / priya@family.com / riya@family.com — password: <b>1234</b>
        </div>
      </div>
    </div>
  );
}
