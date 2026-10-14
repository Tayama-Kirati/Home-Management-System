import { useState } from "react";
import { P } from '../constants/palette';
import { inp, btn, danBtn } from '../constants/styles';
import { genId } from '../utils/helpers';
import { Card, Sec, FL, Row, RMain, G2, Badge } from '../components/ui';

export default function ContactsPage({user,sharedData,setSharedData}) {
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
