import { useState } from "react";
import { P } from '../constants/palette';
import { inp, btn } from '../constants/styles';
import { FL, G2 } from '../components/ui';
import { supabase } from '../lib/supabase';
import { INITIAL_BLANK_DATA } from '../utils/seedData';

export default function OnboardingPage({ user, onComplete }) {
  const [name,setName]     = useState("");
  const [role,setRole]     = useState("Parent");
  const [code,setCode]     = useState("");
  const [mode,setMode]     = useState("create"); // "create" | "join"
  const [err,setErr]       = useState("");
  const [busy,setBusy]     = useState(false);

  const avatar = name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "U";

  const submit = async () => {
    if (!name.trim()) { setErr("Please enter your full name."); return; }
    if (mode==="join" && !code.trim()) { setErr("Enter the household invite code."); return; }
    setBusy(true); setErr("");

    let householdId;

    if (mode === "join") {
      const { data: hh, error } = await supabase
        .from('households').select('id').eq('invite_code', code.trim().toUpperCase()).single();
      if (error || !hh) { setErr("Invite code not found. Check with your family."); setBusy(false); return; }
      householdId = hh.id;

      // Update profile with household + name
      await supabase.from('profiles').update({ name:name.trim(), avatar, role, household_id:householdId }).eq('id', user.id);

      // Add member to household_data
      const { data: hhRow } = await supabase
        .from('household_data').select('data').eq('household_id', householdId).single();
      const existing = hhRow?.data || INITIAL_BLANK_DATA;
      const members = [...(existing.members || []).filter(m=>m.id!==user.id), { id:user.id, name:name.trim(), avatar, role }];
      await supabase.from('household_data')
        .update({ data:{ ...existing, members }, updated_at:new Date().toISOString() })
        .eq('household_id', householdId);

    } else {
      // Create new household
      const { data: hh, error: hhErr } = await supabase
        .from('households').insert({}).select().single();
      if (hhErr) { setErr(hhErr.message); setBusy(false); return; }
      householdId = hh.id;

      // Update profile with household + name
      await supabase.from('profiles').update({ name:name.trim(), avatar, role, household_id:householdId }).eq('id', user.id);

      // Insert initial household data with this member
      await supabase.from('household_data').insert({
        household_id: householdId,
        data: { ...INITIAL_BLANK_DATA, members: [{ id:user.id, name:name.trim(), avatar, role }] },
      });
    }

    await onComplete();
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a3a5c 0%,#2563a8 50%,#b8d4f0 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"rgba(255,255,255,.97)",borderRadius:20,padding:"36px 32px",width:"100%",maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:32,marginBottom:4}}>👋</div>
          <h1 style={{color:P.navy,fontFamily:"Georgia,serif",fontSize:24,marginBottom:4}}>Welcome!</h1>
          <p style={{color:P.muted,fontSize:13}}>Let's set up your profile and household.</p>
        </div>

        {err && <div style={{background:"#fff5f5",border:"1px solid #f0a0a0",borderRadius:8,padding:"8px 12px",fontSize:12,color:P.danger,marginBottom:14}}>{err}</div>}

        <G2>
          <div>
            <FL>Full Name</FL>
            <input style={inp} placeholder="Aarav Sharma" value={name}
              onChange={e=>{setName(e.target.value);setErr("");}}/>
          </div>
          <div>
            <FL>Role</FL>
            <select style={inp} value={role} onChange={e=>setRole(e.target.value)}>
              <option>Parent</option><option>Child</option><option>Other</option>
            </select>
          </div>
        </G2>

        <div style={{marginTop:18,marginBottom:14}}>
          <FL>Household</FL>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {["create","join"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{
                flex:1,padding:"9px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",
                border:`2px solid ${mode===m?P.blue:P.lightBlue}`,
                background:mode===m?P.blue:"#fff",
                color:mode===m?"#fff":P.navy,
              }}>
                {m==="create" ? "🏠 Create Household" : "🔑 Join Household"}
              </button>
            ))}
          </div>

          {mode==="join" && (
            <div>
              <FL>Invite Code</FL>
              <input style={inp} placeholder="e.g. A3F7K2M9" value={code}
                onChange={e=>{setCode(e.target.value.toUpperCase());setErr("");}}
                onKeyDown={e=>e.key==="Enter"&&submit()}/>
              <div style={{fontSize:10,color:P.muted,marginTop:4}}>Ask a family member for the 8-letter code from their Family page.</div>
            </div>
          )}
          {mode==="create" && (
            <div style={{fontSize:12,color:P.muted,padding:"8px 10px",background:P.skyBg,borderRadius:8}}>
              A new household will be created and you'll get an invite code to share with family members.
            </div>
          )}
        </div>

        {/* Preview avatar */}
        {name.trim() && (
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,padding:"10px 12px",background:"#eef2ff",borderRadius:10}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#2563a8,#7c3aed)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14}}>
              {avatar}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:P.navy}}>{name.trim()}</div>
              <div style={{fontSize:11,color:P.muted}}>{role}</div>
            </div>
          </div>
        )}

        <button style={{...btn,width:"100%",padding:"11px",fontSize:14,marginTop:4,opacity:busy?.6:1}} onClick={submit} disabled={busy}>
          {busy ? "Setting up…" : mode==="create" ? "Create Household & Continue" : "Join Household & Continue"}
        </button>
      </div>
    </div>
  );
}
