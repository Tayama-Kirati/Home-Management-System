import { P, COLORS } from '../../constants/palette';

export function Avatar({ member, index=0, size=28 }) {
  return (
    <div title={member?.name} style={{
      width:size,height:size,borderRadius:"50%",background:member?COLORS[index%COLORS.length]:"#cbd5e1",
      color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
      fontWeight:700,fontSize:size*0.38,flexShrink:0,
    }}>{member?.avatar || "?"}</div>
  );
}

export function Chip({ active, onClick, children, color=P.blue }) {
  return (
    <button type="button" onClick={onClick} style={{
      background:active?color:"#fff",color:active?"#fff":P.muted,
      border:`1px solid ${active?color:P.lightBlue}`,borderRadius:20,
      padding:"4px 11px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",
    }}>{children}</button>
  );
}

export function ChipGroup({ options, value, onChange, color, render = o=>o }) {
  const toggle = o => onChange(value.includes(o) ? value.filter(x=>x!==o) : [...value,o]);
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
      {options.map(o => <Chip key={o} active={value.includes(o)} onClick={()=>toggle(o)} color={color}>{render(o)}</Chip>)}
    </div>
  );
}

export function LoadBar({ minutes, fair, color }) {
  const max = Math.max(minutes, fair, 1) * 1.15;
  return (
    <div style={{position:"relative",height:8,background:P.skyBg,borderRadius:6,overflow:"hidden"}}>
      <div style={{width:`${minutes/max*100}%`,height:"100%",background:color,borderRadius:6}}/>
      <div title="Fair share for their age" style={{position:"absolute",left:`${fair/max*100}%`,top:0,bottom:0,width:2,background:P.navy}}/>
    </div>
  );
}

export const Empty = ({ children }) => (
  <div style={{fontSize:13,color:P.muted,textAlign:"center",padding:"28px 0",fontStyle:"italic"}}>{children}</div>
);
