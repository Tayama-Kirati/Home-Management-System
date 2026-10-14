import { useState } from "react";
import { P, COLORS } from '../constants/palette';
import { Card, Sec, Row, RMain, Badge } from '../components/ui';

export default function FamilyPage({ user, users, sharedData }) {
  const [copied, setCopied] = useState(false);

  const inviteCode = user.inviteCode || "—";
  const members    = users || [];

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const avatarStyle = (color="#2563a8") => ({
    width:42,height:42,borderRadius:"50%",background:color,color:"#fff",
    display:"flex",alignItems:"center",justifyContent:"center",
    fontWeight:700,fontSize:14,flexShrink:0,
  });

  return (
    <div>
      <h2 style={{color:P.navy,fontFamily:"Georgia,serif",marginBottom:16}}>👨‍👩‍👧 Family</h2>

      {/* Invite code */}
      <Card>
        <Sec>🔑 Household Invite Code</Sec>
        <p style={{fontSize:12.5,color:P.muted,marginBottom:12,lineHeight:1.6}}>
          Share this code with family members when they sign up. They'll enter it during onboarding to join your household and see all shared data.
        </p>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{
            flex:1,background:P.skyBg,border:`1.5px solid ${P.lightBlue}`,
            borderRadius:10,padding:"12px 16px",
            fontFamily:"monospace",fontSize:22,fontWeight:800,letterSpacing:"0.25em",color:P.navy,
          }}>
            {inviteCode}
          </div>
          <button onClick={copyCode} style={{
            background:copied?"#2ecc71":P.blue,color:"#fff",border:"none",
            borderRadius:9,padding:"12px 20px",fontWeight:700,fontSize:13,cursor:"pointer",
            whiteSpace:"nowrap",transition:"background .2s",
          }}>
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
      </Card>

      {/* Members */}
      <Card>
        <Sec>Members ({members.length})</Sec>
        {members.length === 0 && (
          <div style={{fontSize:12,color:P.muted}}>No members yet. Share your invite code above.</div>
        )}
        {members.map((m,i) => (
          <Row key={m.id}>
            <div style={avatarStyle(COLORS[i % COLORS.length])}>{m.avatar}</div>
            <RMain title={m.name} sub={m.role}/>
            {m.id === user.id && <Badge label="You" color={P.blue} bg="#e8f0fd"/>}
          </Row>
        ))}
      </Card>

      {/* Activity feed */}
      <Card>
        <Sec>📰 Family Activity</Sec>
        {sharedData?.feed?.length > 0 ? sharedData.feed.slice(-8).reverse().map((item,i) => (
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
