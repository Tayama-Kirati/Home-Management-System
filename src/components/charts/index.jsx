import { P } from '../../constants/palette';

export function PieChart({data, size=150}) {
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
    return {path:`M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2}Z`, color:d.color};
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s,i)=><path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth={2}/>)}
      <circle cx={cx} cy={cy} r={r*0.42} fill="#fff"/>
    </svg>
  );
}

export function Legend({data}) {
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

export function ChartRow({pie,legend}) {
  return <div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
    {pie}
    {legend}
  </div>;
}

export function Donut({done,total,size=100}) {
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

export function MiniBar({label,value,max,color,showAmt=true}) {
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

export function ProgressBar({pct,color,height=10}) {
  return <div style={{background:P.lightBlue,borderRadius:6,height}}>
    <div style={{width:`${Math.min(100,pct)}%`,background:color||P.blue,borderRadius:6,height,transition:"width .5s"}}/>
  </div>;
}
