import { useEffect, useState } from "react";
import ReportQueue from "./ReportQueue";
import WaterQualityOverview from "./WaterQualityOverview";
import AlertManagement from "./AlertManagement";
import UserManagement from "./UserManagement";

// --- Internal KPI Card Component (Neon Tech Style) ---
const KpiCard = ({ title, value, loading, icon, trend, variant }) => {
  const variants = {
    primary: "border-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.15)] text-[#d8b4fe]",
    danger: "border-[#f43f5e] shadow-[0_0_15px_rgba(244,63,94,0.15)] text-[#fda4af]",
    warning: "border-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.15)] text-[#fcd34d]",
    success: "border-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.15)] text-[#86efac]",
  };

  if (loading) {
    return (
      <div className="h-32 animate-pulse bg-[#1e1b4b]/50 rounded-[2rem] border border-[#312e81]" />
    );
  }

  return (
    <div className={`bg-[#1e1b4b]/30 border-2 p-6 rounded-[2rem] backdrop-blur-xl transition-all hover:-translate-y-1 ${variants[variant] || 'border-slate-700'}`}>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
          <h3 className="text-4xl font-black text-white italic">{value}</h3>
          {trend && <span className="text-[10px] font-bold opacity-60 uppercase">{trend}</span>}
        </div>
        <div className="text-3xl filter saturate-150 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
          {icon}
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard ---
export default function AuthorityDashboard() {
  const [kpis, setKpis] = useState({
    pendingReports: 0,
    activeAlerts: 0,
    stationsAboveThreshold: 0,
    verifiedThisMonth: 0,
  });

  const [loading, setLoading] = useState(true);
  const userRole = "admin";

  useEffect(() => {
    const timer = setTimeout(() => {
      setKpis({
        pendingReports: 12,
        activeAlerts: 5,
        stationsAboveThreshold: 3,
        verifiedThisMonth: 20,
      });
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0a1e] text-slate-200 p-6 md:p-12 selection:bg-[#a855f7] selection:text-white">
      
      {/* Decorative Neon Orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#6366f1]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#a855f7]/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header with Glass Effect */}
      <header className="mb-12 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <span className="h-1.5 w-10 bg-gradient-to-r from-[#a855f7] to-[#6366f1] rounded-full"></span>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#a855f7]">Verix Systems</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
            Dashboard<span className="text-[#a855f7]">.</span>v2
          </h1>
        </div>

        <div className="flex gap-4">
          <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Operator Role</p>
              <p className="text-sm font-black text-white uppercase">{userRole}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#a855f7] to-[#6366f1] p-[2px]">
               <div className="w-full h-full rounded-full bg-[#0f0a1e] flex items-center justify-center">👤</div>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
        <KpiCard title="Queue Size" value={kpis.pendingReports} loading={loading} icon="💠" trend="Syncing..." variant="primary" />
        <KpiCard title="Breach Alerts" value={kpis.activeAlerts} loading={loading} icon="🔥" trend="Priority High" variant="danger" />
        <KpiCard title="Critical Nodes" value={kpis.stationsAboveThreshold} loading={loading} icon="📡" variant="warning" />
        <KpiCard title="Success Rate" value={`${kpis.verifiedThisMonth}%`} loading={loading} icon="💎" variant="success" />
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        
        {/* Left Column: Data Visuals */}
        <div className="lg:col-span-7 space-y-10">
          <section className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-1 shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black uppercase italic tracking-widest text-white">Spectral Overview</h2>
                <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-[#a855f7] shadow-[0_0_10px_#a855f7]"></div>
                </div>
              </div>
              <WaterQualityOverview />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-[#1e1b4b]/20 border border-white/5 rounded-[2rem] p-8">
                <h3 className="text-[#f43f5e] font-black text-xs uppercase tracking-[0.2em] mb-6 underline decoration-2 underline-offset-8">Incident Logs</h3>
                <AlertManagement />
             </div>
             {userRole === "admin" && (
               <div className="bg-[#1e1b4b]/20 border border-white/5 rounded-[2rem] p-8">
                 <h3 className="text-[#a855f7] font-black text-xs uppercase tracking-[0.2em] mb-6 underline decoration-2 underline-offset-8">Node Access</h3>
                 <UserManagement />
               </div>
             )}
          </div>
        </div>

        {/* Right Sidebar: Feed */}
        <aside className="lg:col-span-5">
           <div className="bg-gradient-to-b from-white/[0.07] to-transparent border-t border-x border-white/10 rounded-t-[3rem] p-10 h-full">
              <div className="flex items-end justify-between mb-10">
                <h2 className="text-3xl font-black italic text-white leading-none">THE<br/><span className="text-[#a855f7]">QUEUE</span></h2>
                <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">Real-time Feed</span>
              </div>
              <ReportQueue />
           </div>
        </aside>

      </div>
    </div>
  );
}