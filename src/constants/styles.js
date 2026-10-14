import { P } from './palette';

export const inp = {
  border:"1px solid #e2e8f0",borderRadius:12,padding:"10px 14px",fontSize:13,
  background:"#fff",color:P.navy,outline:"none",width:"100%",boxSizing:"border-box",
  boxShadow:"0 1px 3px rgba(0,0,0,.04)",transition:"border-color .15s",
};
export const btn = {
  background:P.blue,color:"#fff",border:"none",borderRadius:12,
  padding:"10px 22px",fontWeight:700,fontSize:13,cursor:"pointer",
};
export const danBtn = { ...btn, background:P.danger, padding:"6px 13px", borderRadius:10 };
export const sucBtn = { ...btn, background:P.success, padding:"6px 13px", borderRadius:10 };
export const card = {
  background:"#fff",borderRadius:18,padding:"18px 20px",marginBottom:14,
  border:"1px solid rgba(0,0,0,.05)",boxShadow:"0 2px 12px rgba(0,0,0,.06)",
};
