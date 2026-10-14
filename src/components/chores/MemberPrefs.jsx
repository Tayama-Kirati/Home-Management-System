import { useState } from "react";
import { P } from '../../constants/palette';
import { inp, btn, danBtn } from '../../constants/styles';
import { DAYS, CATEGORIES, catOf } from '../../constants/chores';
import { genId } from '../../utils/helpers';
import { Card, Sec, FL, Badge } from '../ui';
import { ChipGroup, Chip, Avatar } from './shared';

const catIds = CATEGORIES.map(c=>c.id);
const catLabel = id => `${catOf(id).icon} ${id}`;

export default function MemberPrefs({ members, setSharedData }) {
  const [newMember,setNewMember] = useState({ name:"", age:"" });

  const patchProfile = (id, patch) => setSharedData(d => {
    const profiles = d.choreProfiles || {};
    return { ...d, choreProfiles: { ...profiles, [id]: { ...profiles[id], ...patch } } };
  });

  // Liking a category removes it from dislikes and vice versa.
  const setLikes = (m, likes) => patchProfile(m.id, { likes, dislikes: m.dislikes.filter(c=>!likes.includes(c)) });
  const setDislikes = (m, dislikes) => patchProfile(m.id, { dislikes, likes: m.likes.filter(c=>!dislikes.includes(c)) });

  const addMember = () => {
    const name = newMember.name.trim();
    if (!name) return;
    const id = "x" + genId();
    const avatar = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    setSharedData(d => ({
      ...d,
      choreExtraMembers: [...(d.choreExtraMembers||[]), { id, name, avatar, role:"Child" }],
      choreProfiles: { ...(d.choreProfiles||{}), [id]: { age:newMember.age } },
    }));
    setNewMember({ name:"", age:"" });
  };
  const removeMember = id => setSharedData(d => ({ ...d, choreExtraMembers:(d.choreExtraMembers||[]).filter(m=>m.id!==id) }));

  return (
    <div>
      <Card>
        <Sec>👪 Who helps around the house?</Sec>
        <p style={{fontSize:12,color:P.muted,margin:"0 0 12px",lineHeight:1.6}}>
          Smart Assign uses each person's <b>age</b> (to skip chores they're too young for and to give younger children a lighter share),
          the <b>chore types they like or dislike</b>, the <b>days they're free</b>, and an optional <b>daily time limit</b>, for example during exams.
        </p>
        <div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
          <div style={{flex:"2 1 180px"}}><FL>Add a member without an account (e.g. a young child)</FL><input style={inp} placeholder="Name" value={newMember.name} onChange={e=>setNewMember(f=>({...f,name:e.target.value}))}/></div>
          <div style={{flex:"1 1 80px"}}><FL>Age</FL><input style={inp} type="number" min="0" value={newMember.age} onChange={e=>setNewMember(f=>({...f,age:e.target.value}))}/></div>
          <button style={btn} onClick={addMember}>Add</button>
        </div>
      </Card>

      {members.map((m,i) => (
        <Card key={m.id} style={{opacity:m.participates?1:.6}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
            <Avatar member={m} index={i} size={40}/>
            <div style={{flex:1,minWidth:140}}>
              <div style={{fontWeight:800,color:P.navy,fontSize:15}}>{m.name}</div>
              <div style={{fontSize:11,color:P.muted}}>{m.role || "Member"} · {m.hasAccount ? "has an account" : "no account"} · takes {Math.round(m.capacity*100)}% of a full share</div>
            </div>
            {!m.ageSet && <Badge label="Set age for better results" color={P.amber} bg="#fff6e6"/>}
            <Chip active={m.participates} color={P.success} onClick={()=>patchProfile(m.id,{participates:!m.participates})}>{m.participates?"Doing chores":"Excluded"}</Chip>
            {!m.hasAccount && <button style={{...danBtn,padding:"4px 10px",fontSize:11}} onClick={()=>removeMember(m.id)}>Remove</button>}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"100px 160px 1fr",gap:12,marginBottom:12,alignItems:"end"}}>
            <div><FL>Age</FL><input style={inp} type="number" min="0" placeholder={m.ageSet?"":"?"} value={m.ageSet?m.age:""} onChange={e=>patchProfile(m.id,{age:e.target.value})}/></div>
            <div><FL>Max minutes per day</FL><input style={inp} type="number" min="0" placeholder="No limit" value={m.maxMinutesPerDay||""} onChange={e=>patchProfile(m.id,{maxMinutesPerDay:e.target.value})}/></div>
            <div><FL>Available days</FL><ChipGroup options={DAYS} value={m.availableDays} onChange={v=>patchProfile(m.id,{availableDays:v})} render={d=>d.slice(0,3)}/></div>
          </div>
          <div style={{marginBottom:10}}>
            <FL>👍 Likes doing</FL>
            <ChipGroup options={catIds} value={m.likes} onChange={v=>setLikes(m,v)} color={P.success} render={catLabel}/>
          </div>
          <div>
            <FL>👎 Prefers to avoid</FL>
            <ChipGroup options={catIds} value={m.dislikes} onChange={v=>setDislikes(m,v)} color={P.danger} render={catLabel}/>
          </div>
        </Card>
      ))}
    </div>
  );
}
