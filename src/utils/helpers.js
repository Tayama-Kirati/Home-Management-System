export const today = () => new Date().toISOString().slice(0,10);
export const addDays = (d,n) => { const x=new Date(d+"T00:00:00"); x.setDate(x.getDate()+n); return x.toISOString().slice(0,10); };
export const fmt = d => d ? new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";
export const fmtMonth = d => d ? new Date(d+"-01").toLocaleDateString("en-US",{month:"long",year:"numeric"}) : "";
export const mk = d => d ? d.slice(0,7) : "";
export const genId = () => Date.now() + Math.random().toString(36).slice(2,6);
