import { useNavigate } from "react-router-dom";
export default function Forbidden() {
  const nav = useNavigate();
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",
      background:"linear-gradient(160deg,#eaf4fd,#f0f7ff)"
    }}>
      <div style={{fontSize:"48px",marginBottom:"16px"}}>🚫</div>
      <div style={{fontSize:"22px",fontWeight:700,color:"#0f172a"}}>Access Denied</div>
      <div style={{fontSize:"13px",color:"#64748b",margin:"8px 0 24px"}}>You don't have permission to view this page.</div>
      <button onClick={()=>nav("/dashboard")} style={{padding:"10px 24px",
        background:"linear-gradient(135deg,#0e74bd,#38bdf8)",color:"#fff",
        border:"none",borderRadius:"8px",cursor:"pointer",fontSize:"13px",fontWeight:600
      }}>← Back to Dashboard</button>
    </div>
  );
}