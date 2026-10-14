import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = { success:"#1a7a4a", error:"#c0392b", info:"#2563a8" }[type] || "#2563a8";
  const icon = { success:"✓", error:"✕", info:"ℹ" }[type] || "ℹ";

  return (
    <div style={{
      position:"fixed", bottom:26, right:26, zIndex:9999,
      background:bg, color:"#fff", borderRadius:12,
      padding:"13px 18px", fontSize:13, fontWeight:600,
      boxShadow:"0 6px 28px rgba(0,0,0,.3)",
      display:"flex", alignItems:"center", gap:10,
      maxWidth:340, animation:"fadeSlideIn .2s ease",
    }}>
      <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
      <span style={{flex:1}}>{message}</span>
      <button onClick={onClose} style={{
        background:"rgba(255,255,255,.25)", border:"none", color:"#fff",
        cursor:"pointer", borderRadius:"50%", width:22, height:22,
        fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
      }}>×</button>
      <style>{`@keyframes fadeSlideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
