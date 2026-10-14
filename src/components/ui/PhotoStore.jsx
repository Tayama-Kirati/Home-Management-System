import { useRef } from "react";
import { P } from '../../constants/palette';
import { btn } from '../../constants/styles';
import { today, fmt, genId } from '../../utils/helpers';

export default function PhotoStore({ photos = [], onChange, title = "📷 Documents & Photos" }) {
  const ref = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert("File too large. Max 8MB."); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      onChange([...photos, { id: genId(), name: file.name, url: ev.target.result, date: today() }]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const remove = (id) => onChange(photos.filter(p => p.id !== id));

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <div style={{ fontWeight:700, color:P.navy, fontSize:13 }}>{title}</div>
        <button style={{ ...btn, padding:"5px 14px", fontSize:12 }} onClick={() => ref.current.click()}>
          + Add Photo
        </button>
        <input ref={ref} type="file" accept="image/*,application/pdf" style={{ display:"none" }} onChange={handleFile}/>
      </div>
      {photos.length === 0
        ? <div style={{ fontSize:12, color:P.muted, fontStyle:"italic" }}>No photos or documents stored yet.</div>
        : <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
            {photos.map(p => (
              <div key={p.id} style={{
                position:"relative", borderRadius:10, overflow:"hidden",
                border:`1px solid ${P.lightBlue}`, background:P.white, width:140,
              }}>
                {p.url.startsWith("data:image")
                  ? <img src={p.url} alt={p.name} style={{ width:140, height:105, objectFit:"cover", display:"block" }}/>
                  : <div style={{ width:140, height:105, display:"flex", alignItems:"center", justifyContent:"center", background:P.skyBg, fontSize:32 }}>📄</div>
                }
                <div style={{ padding:"5px 8px", fontSize:10, color:P.muted, background:P.white }}>
                  <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                  <div>{fmt(p.date)}</div>
                </div>
                <button onClick={() => remove(p.id)} style={{
                  position:"absolute", top:5, right:5,
                  background:"rgba(0,0,0,.6)", color:"#fff", border:"none",
                  borderRadius:"50%", width:20, height:20, cursor:"pointer",
                  fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", padding:0,
                }}>✕</button>
              </div>
            ))}
          </div>
      }
    </div>
  );
}
