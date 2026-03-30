import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardCards          from "../components/DashboardCards";
import CollaborationsList      from "../components/CollaborationsList";
import SubmitCollaborationForm from "../components/SubmitCollaborationForm";
// NgoStationsLayer: import and use near your existing WaterMap if you have a map ref
// import NgoStationsLayer from "../components/NgoStationsLayer";

// ─── Reuse same NavItem as Dashboard.jsx ─────────────────────────────────────
function NavItem({ to, icon, label, badge, active }) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "9px 12px", borderRadius: "8px", marginBottom: "2px",
          background: active ? "rgba(14,116,189,0.1)" : "transparent",
          borderLeft: `3px solid ${active ? "#0e74bd" : "transparent"}`,
          transition: "all 0.15s", cursor: "pointer",
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(14,116,189,0.05)"; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ fontSize: "15px" }}>{icon}</span>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
          fontWeight: active ? 600 : 400,
          color: active ? "#0e74bd" : "#64748b",
        }}>{label}</span>
        {badge > 0 && (
          <span style={{
            marginLeft: "auto", background: "#ef4444", color: "#fff",
            borderRadius: "10px", padding: "1px 6px",
            fontSize: "9px", fontFamily: "monospace", fontWeight: 700,
          }}>{badge}</span>
        )}
      </div>
    </Link>
  );
}

// ─── Live Clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useState(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  });
  return (
    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#94a3b8" }}>
      {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

// ─── Main NGO Dashboard ───────────────────────────────────────────────────────
/**
 * NgoDashboard
 * Props:
 *   user {object}  from localStorage: { name, email, role }
 */
export default function NgoDashboard({ user }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [newRows, setNewRows] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleNewCollaboration = (row) => {
    setNewRows(prev => [{ ...row, _optimistic: true }, ...prev]);
  };

  const navItems = [
    { to: "/dashboard",      icon: "🗺️",  label: "Map Overview"      },
    { to: "/reports",        icon: "📋",  label: "Reports"           },
    { to: "/alerts",         icon: "🔔",  label: "Alerts"            },
    { to: "/water-stations", icon: "💧",  label: "Water Stations"    },
    { to: "/alerts/history", icon: "📊",  label: "Historical Charts" },
    { to: "/ngo/dashboard",  icon: "🤝",  label: "NGO Portal"        },
  ];

  const displayName = user?.name || user?.email || "NGO User";
  const initials    = displayName.slice(0, 1).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin   { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{
        display: "flex", minHeight: "100vh",
        background: "linear-gradient(160deg, #eaf4fd 0%, #f0f7ff 60%, #e8f0fb 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ── Sidebar (identical to Dashboard.jsx) ── */}
        <div style={{
          width: "220px", flexShrink: 0,
          background: "#fff",
          borderRight: "1px solid #e2eaf4",
          display: "flex", flexDirection: "column",
          boxShadow: "2px 0 12px rgba(14,116,189,0.06)",
          position: "sticky", top: 0, height: "100vh",
        }}>
          {/* Logo */}
          <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "linear-gradient(135deg, #0e74bd, #38bdf8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", boxShadow: "0 3px 10px rgba(14,116,189,0.3)",
              }}>🌊</div>
              <div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "17px", color: "#0f172a", lineHeight: 1.1 }}>
                  WaterWatch
                </div>
                <div style={{ fontSize: "9px", color: "#94a3b8", letterSpacing: "0.1em" }}>
                  AQUAWATCH
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: "14px 10px", flex: 1 }}>
            <div style={{ fontSize: "9px", color: "#cbd5e1", letterSpacing: "0.14em", fontWeight: 600, padding: "0 4px", marginBottom: "8px" }}>
              NAVIGATION
            </div>
            {navItems.map(item => (
              <NavItem key={item.to} {...item} active={location.pathname === item.to} />
            ))}
          </nav>

          {/* User card at bottom of sidebar */}
          <div style={{
            padding: "14px 16px",
            borderTop: "1px solid #f1f5f9",
            display: "flex", alignItems: "center", gap: "9px",
          }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: "linear-gradient(135deg, #0e74bd, #38bdf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", color: "#fff", fontWeight: 700, flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </div>
              <div style={{
                fontSize: "9px", fontFamily: "monospace",
                color: "#0ea472", letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                {user?.role || "ngo"}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Top bar */}
          <div style={{
            background: "#fff", borderBottom: "1px solid #e2eaf4",
            padding: "13px 26px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            boxShadow: "0 1px 6px rgba(14,116,189,0.05)",
            position: "sticky", top: 0, zIndex: 10,
          }}>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "19px", color: "#0f172a" }}>
                NGO Portal
              </div>
              <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "1px" }}>
                AquaWatch · Collaboration & NGO Dashboard
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <LiveClock />

              {/* Role badge */}
              <div style={{
                padding: "4px 10px", borderRadius: "5px",
                background: "rgba(14,164,114,0.1)", border: "1px solid rgba(14,164,114,0.25)",
                display: "flex", alignItems: "center", gap: "5px",
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0ea472" }} />
                <span style={{ fontSize: "9px", color: "#0ea472", fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {user?.role || "NGO"}
                </span>
              </div>

              {/* Profile pill */}
              <div
                onClick={() => navigate("/profile")}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "6px 12px 6px 6px",
                  borderRadius: "20px", cursor: "pointer",
                  background: "rgba(14,116,189,0.06)",
                  border: "1px solid rgba(14,116,189,0.15)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(14,116,189,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(14,116,189,0.06)"}
              >
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #0e74bd, #38bdf8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", color: "#fff", fontWeight: 700, flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#0f172a", fontWeight: 600, lineHeight: 1.2 }}>{displayName}</div>
                  <div style={{ fontSize: "9px", color: "#94a3b8" }}>View profile</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px" }}>

            {/* Welcome banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                borderRadius: "14px",
                background: "linear-gradient(135deg, #0e74bd 0%, #38bdf8 100%)",
                padding: "22px 26px", marginBottom: "20px",
                position: "relative", overflow: "hidden",
                boxShadow: "0 4px 18px rgba(14,116,189,0.28)",
              }}
            >
              {/* Decorative circles */}
              <div style={{ position: "absolute", right: "-24px", top: "-24px", width: "130px", height: "130px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              <div style={{ position: "absolute", right: "60px", bottom: "-30px", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontFamily: "monospace", letterSpacing: "0.08em", marginBottom: "5px" }}>
                  WELCOME BACK
                </div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "#fff", marginBottom: "5px" }}>
                  NGO Collaboration Dashboard
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                  Monitor active projects, track water quality reports, and manage NGO partnerships across India.
                </div>
              </div>
            </motion.div>

            {/* KPI Cards */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "9px", color: "#cbd5e1", letterSpacing: "0.14em", fontWeight: 600, marginBottom: "10px" }}>
                OVERVIEW
              </div>
              <DashboardCards />
            </div>

            {/* Collaborations table */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "9px", color: "#cbd5e1", letterSpacing: "0.14em", fontWeight: 600, marginBottom: "10px" }}>
                COLLABORATIONS
              </div>
              <CollaborationsList extraRows={newRows} />
            </div>

            {/* Submit form */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "9px", color: "#cbd5e1", letterSpacing: "0.14em", fontWeight: 600, marginBottom: "10px" }}>
                NEW COLLABORATION
              </div>
              <SubmitCollaborationForm onSuccess={handleNewCollaboration} />
            </div>

            {/*
              ── NgoStationsLayer ──────────────────────────────────────────────
              This button should render NEAR your existing WaterMap component.
              If you have access to the map instance here, uncomment this block:

              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize:"9px", color:"#cbd5e1", letterSpacing:"0.14em", fontWeight:600, marginBottom:"10px" }}>
                  MAP CONTROLS
                </div>
                <div style={{
                  background:"#fff", borderRadius:"12px",
                  border:"1px solid #e2eaf4", padding:"14px 18px",
                  display:"flex", alignItems:"center", gap:"12px",
                }}>
                  <div style={{ fontSize:"12px", color:"#64748b" }}>Toggle NGO-monitored stations:</div>
                  <NgoStationsLayer map={mapInstance} stations={ngoStations} />
                </div>
              </div>
            */}

          </div>
        </div>
      </div>
    </>
  );
}
