import { useState } from "react";
import { P } from '../../constants/palette';
import { card } from '../../constants/styles';

export function Badge({label,color,bg}) {
  return <span style={{fontSize:10,fontWeight:700,background:bg,color,borderRadius:20,padding:"2px 9px",whiteSpace:"nowrap"}}>{label}</span>;
}

export function Card({children,style}) {
  return <div style={{...card,...style}}>{children}</div>;
}

export function Sec({children}) {
  return <div style={{fontWeight:700,color:P.navy,fontSize:12,marginBottom:12,letterSpacing:"0.8px",textTransform:"uppercase",opacity:.7}}>{children}</div>;
}

export function FL({children}) {
  return <div style={{fontSize:11,color:P.muted,marginBottom:3}}>{children}</div>;
}

export function Row({children,style}) {
  return <div style={{
    display:"flex",alignItems:"center",gap:14,
    padding:"14px 18px",
    background:"#fff",
    borderRadius:18,
    marginBottom:10,
    border:"1px solid rgba(0,0,0,.05)",
    boxShadow:"0 2px 12px rgba(0,0,0,.06)",
    ...style,
  }}>{children}</div>;
}

export function RMain({title,sub,titleStyle}) {
  return <div style={{flex:1,minWidth:0}}>
    <div style={{fontWeight:700,color:"#1a2744",fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",...titleStyle}}>{title}</div>
    {sub && <div style={{fontSize:12,color:"#8a9ab5",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sub}</div>}
  </div>;
}

export function G2({children,style}) {
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10,...style}}>{children}</div>;
}

export function G3({children}) {
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>{children}</div>;
}

export function PasswordInput({ style, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{position:"relative"}}>
      <input {...props} type={show?"text":"password"} style={{...style,paddingRight:40}}/>
      <button
        type="button"
        onClick={()=>setShow(v=>!v)}
        tabIndex={-1}
        style={{
          position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",
          background:"none",border:"none",cursor:"pointer",
          color:"#8a9ab5",padding:4,display:"flex",alignItems:"center",lineHeight:1,
        }}
      >
        {show ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div style={{display:"flex",gap:4,flexWrap:"wrap",background:"#fff",padding:4,borderRadius:14,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,.06)"}}>
      {tabs.map(([id,label]) => (
        <button key={id} onClick={()=>onChange(id)} style={{
          flex:"1 1 auto",background:value===id?"linear-gradient(90deg,#2563a8,#7c3aed)":"transparent",
          color:value===id?"#fff":P.muted,border:"none",borderRadius:10,
          padding:"8px 12px",fontSize:12.5,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",
        }}>{label}</button>
      ))}
    </div>
  );
}
