import { useState } from "react";
import { P } from '../constants/palette';
import { inp, btn, danBtn } from '../constants/styles';
import { today, fmt, genId } from '../utils/helpers';
import { Card, Sec, Row, RMain, Badge } from '../components/ui';
import { Donut, PieChart, Legend, ChartRow } from '../components/charts';

export default function TodoPage({user,sharedData,setSharedData}) {
  const tasks = sharedData.tasks||[];
  const setTasks = fn => setSharedData(d=>({...d,tasks:typeof fn==="function"?fn(d.tasks||[]):fn}));
  const [text,setText]=useState("");
  const [priority,setPriority]=useState("Medium");
  const [due,setDue]=useState(today());
  const [filter,setFilter]=useState("All");

  const addFeed = (action,name) => setSharedData(d=>({...d,feed:[...(d.feed||[]),{user:name,action,time:new Date().toLocaleTimeString()}]}));

  const addTask = () => {
    if(!text.trim()) return;
    setTasks(t=>[...t,{id:genId(),text:text.trim(),done:false,priority,due,assignedTo:user.id,createdBy:user.id,createdByName:user.name}]);
    addFeed(`added task "${text.trim()}"`,user.name);
    setText("");
  };
  const toggle = id => setTasks(t=>t.map(x=>x.id===id?{...x,done:!x.done}:x));
  const remove = id => setTasks(t=>t.filter(x=>x.id!==id));

  const shown = tasks.filter(t=>filter==="All"?true:filter==="Mine"?t.assignedTo===user.id:filter==="Pending"?!t.done:t.done);
  const done = tasks.filter(t=>t.done).length;
  const pc={High:["#c0392b","#fde8e6"],Medium:["#c47d10","#fef3e2"],Low:["#1a7a4a","#e2f5eb"]};
  const pieData=Object.entries({High:tasks.filter(t=>t.priority==="High").length,Medium:tasks.filter(t=>t.priority==="Medium").length,Low:tasks.filter(t=>t.priority==="Low").length}).filter(([,v])=>v>0).map(([k,v])=>({label:k,value:v,color:{"High":"#c0392b","Medium":"#c47d10","Low":"#1a7a4a"}[k]}));

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
