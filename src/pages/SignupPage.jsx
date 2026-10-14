import { useState } from "react";
import { P } from '../constants/palette';
import { inp, btn } from '../constants/styles';
import { genId } from '../utils/helpers';
import { FL, G2, PasswordInput } from '../components/ui';

export default function SignupPage({onSignup, onGo}) {
  const [form,setForm]=useState({name:"",email:"",password:"",confirm:"",role:"Parent"});
  const [err,setErr]=useState("");

  const submit = () => {
    if(!form.name||!form.email||!form.password){setErr("All fields are required.");return;}
    if(form.password.length<4){setErr("Password must be at least 4 characters.");return;}
    if(form.password!==form.confirm){setErr("Passwords do not match.");return;}
    onSignup({
      id:genId(),name:form.name,email:form.email,password:form.password,
      avatar:form.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),
      role:form.role,
    });
  };
  const f = k => v => setForm(p=>({...p,[k]:v}));

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a3a5c 0%,#2563a8 50%,#b8d4f0 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"rgba(255,255,255,.97)",borderRadius:20,padding:"36px 32px",width:"100%",maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:32,marginBottom:4}}>🏠</div>
          <h1 style={{color:P.navy,fontFamily:"Georgia,serif",fontSize:24,marginBottom:4}}>Create Account</h1>
          <p style={{color:P.muted,fontSize:13}}>Join KiratiKhim and manage your home together</p>
        </div>
        {err&&<div style={{background:"#fff5f5",border:"1px solid #f0a0a0",borderRadius:8,padding:"8px 12px",fontSize:12,color:P.danger,marginBottom:14}}>{err}</div>}
        <G2>
          <div><FL>Full Name</FL><input style={inp} placeholder="Aarav Sharma" value={form.name} onChange={e=>f("name")(e.target.value)}/></div>
          <div><FL>Role</FL><select style={inp} value={form.role} onChange={e=>f("role")(e.target.value)}><option>Parent</option><option>Child</option><option>Other</option></select></div>
        </G2>
        <div style={{marginBottom:10}}><FL>Email Address</FL><input style={inp} type="email" placeholder="you@example.com" value={form.email} onChange={e=>f("email")(e.target.value)}/></div>
        <G2>
          <div><FL>Password</FL><PasswordInput style={inp} placeholder="Min. 4 characters" value={form.password} onChange={e=>f("password")(e.target.value)}/></div>
          <div><FL>Confirm Password</FL><PasswordInput style={inp} placeholder="Repeat password" value={form.confirm} onChange={e=>f("confirm")(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
        </G2>
        <button style={{...btn,width:"100%",padding:"11px",fontSize:14,marginTop:6}} onClick={submit}>Create Account</button>
        <div style={{textAlign:"center",marginTop:14,fontSize:12,color:P.muted}}>
          Already have an account?{" "}
          <span style={{color:P.blue,cursor:"pointer",fontWeight:700}} onClick={()=>onGo("login")}>Log In</span>
        </div>
        <div style={{textAlign:"center",marginTop:10,fontSize:12,color:P.muted}}>
          <span style={{cursor:"pointer"}} onClick={()=>onGo("landing")}>← Back to Home</span>
        </div>
      </div>
    </div>
  );
}
