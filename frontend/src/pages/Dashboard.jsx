import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ── Recharts ──────────────────────────────────────────────────────────────────
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from "recharts";

// ── Fonts & global styles injected once ───────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #f0f4f8;
    --surface:  #ffffff;
    --surfaceB: #e8edf4;
    --border:   #dde4ef;
    --text:     #0d1b2a;
    --muted:    #64748b;
    --accent:   #0ea5e9;
    --teal:     #0d9488;
    --safe:     #10b981;
    --warn:     #f59e0b;
    --danger:   #ef4444;
    --grad1:    #0ea5e9;
    --grad2:    #0d9488;
    --shadow:   0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04);
    --shadowMd: 0 4px 24px rgba(14,165,233,.12);
  }

  [data-theme="dark"] {
    --bg:       #070e1a;
    --surface:  #0d1829;
    --surfaceB: #111f35;
    --border:   #1a2d47;
    --text:     #e2eaf4;
    --muted:    #5a7898;
    --shadow:   0 1px 3px rgba(0,0,0,.3), 0 4px 16px rgba(0,0,0,.2);
    --shadowMd: 0 4px 24px rgba(14,165,233,.18);
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; transition: background .3s, color .3s; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: .4; }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes ripple {
    0%   { transform: scale(1);   opacity: .7; }
    100% { transform: scale(2.8); opacity: 0; }
  }

  .anim-card { animation: fadeUp .5s ease both; }
  .anim-card:nth-child(1) { animation-delay: .05s; }
  .anim-card:nth-child(2) { animation-delay: .1s; }
  .anim-card:nth-child(3) { animation-delay: .15s; }
  .anim-card:nth-child(4) { animation-delay: .2s; }
`;

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 16, r = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "linear-gradient(90deg,var(--surfaceB) 25%,var(--border) 50%,var(--surfaceB) 75%)",
      backgroundSize: "800px 100%",
      animation: "shimmer 1.6s infinite linear",
    }} />
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function Badge({ status }) {
  const cfg = {
    safe:     { bg: "#10b98120", color: "#10b981", label: "Safe" },
    moderate: { bg: "#f59e0b20", color: "#f59e0b", label: "Moderate" },
    unsafe:   { bg: "#ef444420", color: "#ef4444", label: "Unsafe" },
  }[status] || { bg: "#64748b20", color: "#64748b", label: "Unknown" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tip({ children, label }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: "50%",
          transform: "translateX(-50%)", whiteSpace: "nowrap",
          background: "#0d1829", color: "#e2eaf4",
          padding: "4px 10px", borderRadius: 6, fontSize: 11,
          pointerEvents: "none", zIndex: 999,
        }}>{label}</span>
      )}
    </span>
  );
}

// ── Icon set (SVG inline) ─────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    station: <><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></>,
    reports: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></>,
    alerts: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    analytics: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    moon: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
    sun: <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    drop: <><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></>,
    chevronL: <><polyline points="15 18 9 12 15 6"/></>,
    chevronR: <><polyline points="9 18 15 12 9 6"/></>,
    menu: <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ── Chart data ────────────────────────────────────────────────────────────────
const trendData = [
  { t: "Jan", ph: 7.2, do: 6.8, bod: 2.1 },
  { t: "Feb", ph: 7.4, do: 7.1, bod: 1.8 },
  { t: "Mar", ph: 6.9, do: 5.9, bod: 3.2 },
  { t: "Apr", ph: 7.6, do: 6.5, bod: 2.4 },
  { t: "May", ph: 7.8, do: 7.4, bod: 1.5 },
  { t: "Jun", ph: 7.1, do: 6.2, bod: 2.8 },
  { t: "Jul", ph: 6.8, do: 5.4, bod: 3.8 },
  { t: "Aug", ph: 7.3, do: 6.9, bod: 2.0 },
];

const stateData = [
  { state: "AP",  safe: 72, unsafe: 28 },
  { state: "TN",  safe: 61, unsafe: 39 },
  { state: "KA",  safe: 80, unsafe: 20 },
  { state: "MH",  safe: 55, unsafe: 45 },
  { state: "UP",  safe: 43, unsafe: 57 },
  { state: "WB",  safe: 67, unsafe: 33 },
];

const pieData = [
  { name: "Safe",     value: 64, color: "#10b981" },
  { name: "Moderate", value: 22, color: "#f59e0b" },
  { name: "Unsafe",   value: 14, color: "#ef4444" },
];

const recentAlerts = [
  { id: 1, station: "Godavari — Rajahmundry", param: "BOD exceeded 5.2 mg/L", time: "2 min ago",  status: "unsafe"   },
  { id: 2, station: "Krishna — Vijayawada",   param: "pH dropped to 5.8",      time: "18 min ago", status: "moderate" },
  { id: 3, station: "Tungabhadra — Hospet",   param: "DO below threshold",     time: "1 hr ago",   status: "moderate" },
  { id: 4, station: "Cauvery — Mysuru",       param: "All parameters normal",  time: "2 hr ago",   status: "safe"     },
  { id: 5, station: "Mahanadi — Cuttack",     param: "Turbidity high: 12 NTU", time: "3 hr ago",   status: "unsafe"   },
];

const recentReports = [
  { id: 1, title: "Q1 Water Quality Summary",  author: "Dr. Rao",    date: "Mar 15" },
  { id: 2, title: "Godavari Basin Analysis",   author: "Priya S.",   date: "Mar 12" },
  { id: 3, title: "Urban Contamination Study", author: "Arun K.",    date: "Mar 08" },
  { id: 4, title: "Monthly Compliance Report", author: "Team Lead",  date: "Mar 01" },
];

// ── Station dots for pseudo-map ───────────────────────────────────────────────
const stations = [
  { name: "Rajahmundry",  x: 64, y: 44, status: "unsafe"   },
  { name: "Vijayawada",   x: 57, y: 55, status: "moderate" },
  { name: "Guntur",       x: 54, y: 60, status: "safe"     },
  { name: "Kurnool",      x: 45, y: 58, status: "safe"     },
  { name: "Tirupati",     x: 50, y: 74, status: "safe"     },
  { name: "Nellore",      x: 55, y: 68, status: "moderate" },
  { name: "Visakhapatnam",x: 70, y: 38, status: "safe"     },
  { name: "Kakinada",     x: 68, y: 46, status: "unsafe"   },
];

// ── Custom tooltip for recharts ───────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "10px 14px", fontSize: 12,
      boxShadow: "0 8px 24px rgba(0,0,0,.12)",
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function WaterDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [dark, setDark]       = useState(true);
  const [sideOpen, setSide]   = useState(true);
  const [loading, setLoading] = useState(true);

  // Derive active tab from URL so browser back/forward works too
  const active = (() => {
    const p = location.pathname;
    if (p.includes("water-stations")) return "stations";
    if (p.includes("reports"))        return "reports";
    if (p.includes("alerts"))         return "alerts";
    if (p.includes("analytics"))      return "analytics";
    return "dashboard";
  })();
  const [hovered, setHovered] = useState(null);
  const [search, setSearch]   = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [tick, setTick]       = useState(0);

  // Inject global CSS once
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // Theme sync
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  // Simulate loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // "Real-time" counter tick
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const kpis = [
    { label: "Total Stations", value: loading ? null : 142,  sub: "+3 this week",        icon: "station",  accent: "#0ea5e9", bg: "linear-gradient(135deg,#0ea5e940,#0ea5e910)", route: "/water-stations" },
    { label: "Active Alerts",  value: loading ? null : 8,    sub: "↑ 2 since 6h",        icon: "alerts",   accent: "#ef4444", bg: "linear-gradient(135deg,#ef444440,#ef444410)", route: "/alerts"         },
    { label: "Safe Water %",   value: loading ? null : "64%",sub: "↓ 1.2% vs last week", icon: "drop",     accent: "#10b981", bg: "linear-gradient(135deg,#10b98140,#10b98110)", route: "/analytics"      },
    { label: "Contaminated",   value: loading ? null : 19,   sub: "3 critical",           icon: "reports",  accent: "#f59e0b", bg: "linear-gradient(135deg,#f59e0b40,#f59e0b10)", route: "/alerts"         },
  ];

  const navItems = [
    { id: "dashboard", icon: "dashboard", label: "Dashboard",      route: "/dashboard"      },
    { id: "stations",  icon: "station",   label: "Water Stations", route: "/water-stations" },
    { id: "reports",   icon: "reports",   label: "Reports",        route: "/reports"        },
    { id: "alerts",    icon: "alerts",    label: "Alerts",         route: "/alerts", badge: 8 },
    { id: "analytics", icon: "analytics", label: "Analytics",      route: "/analytics"      },
  ];

  const C = {
    sidebar: {
      width: sideOpen ? 220 : 68,
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      transition: "width .25s cubic-bezier(.4,0,.2,1)",
      overflow: "hidden", flexShrink: 0,
      position: "relative", zIndex: 10,
    },
    card: {
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "20px 22px",
      boxShadow: "var(--shadow)",
      transition: "box-shadow .2s, transform .2s",
    },
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside style={C.sidebar}>
        {/* Logo */}
        <div style={{
          padding: "22px 20px 18px",
          display: "flex", alignItems: "center", gap: 10,
          borderBottom: "1px solid var(--border)",
          cursor: "pointer",
        }}
          onClick={() => navigate("/dashboard")}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg,#0ea5e9,#0d9488)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="drop" size={16} color="#fff" />
          </div>
          {sideOpen && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: -.3, color: "var(--text)", whiteSpace: "nowrap" }}>WaterWatch</div>
              <div style={{ fontSize: 10, color: "var(--muted)", whiteSpace: "nowrap" }}>Quality Monitor</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {navItems.map(n => {
            const isActive = active === n.id;
            return (
              <div key={n.id}
                onClick={() => navigate(n.route)}
                title={!sideOpen ? n.label : ""}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 10px", borderRadius: 10, marginBottom: 2,
                  cursor: "pointer", position: "relative",
                  background: isActive ? "linear-gradient(135deg,#0ea5e920,#0d948820)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--muted)",
                  fontWeight: isActive ? 600 : 400,
                  transition: "all .18s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--surfaceB)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ flexShrink: 0, position: "relative" }}>
                  <Icon name={n.icon} size={18} color={isActive ? "#0ea5e9" : "var(--muted)"} />
                  {n.badge && (
                    <span style={{
                      position: "absolute", top: -5, right: -5,
                      width: 14, height: 14, borderRadius: "50%",
                      background: "#ef4444", color: "#fff",
                      fontSize: 8, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{n.badge}</span>
                  )}
                </div>
                {sideOpen && <span style={{ whiteSpace: "nowrap", fontSize: 13 }}>{n.label}</span>}
                {isActive && <div style={{
                  position: "absolute", right: 0, top: "20%", height: "60%",
                  width: 3, borderRadius: "3px 0 0 3px",
                  background: "linear-gradient(180deg,#0ea5e9,#0d9488)",
                }} />}
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div style={{
          padding: "12px 10px",
          borderTop: "1px solid var(--border)",
        }}>
          <div
            onClick={() => setSide(x => !x)}
            style={{
              display: "flex", alignItems: "center", justifyContent: sideOpen ? "flex-end" : "center",
              padding: "8px", borderRadius: 8, cursor: "pointer",
              color: "var(--muted)",
              transition: "background .18s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--surfaceB)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <Icon name={sideOpen ? "chevronL" : "chevronR"} size={16} />
          </div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* TOPBAR */}
        <header style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "0 24px",
          height: 60, flexShrink: 0,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          position: "relative", zIndex: 5,
        }}>
          {/* Hamburger mobile */}
          <div onClick={() => setSide(x => !x)} style={{ cursor: "pointer", color: "var(--muted)", display: "flex" }}>
            <Icon name="menu" size={18} />
          </div>

          {/* Search */}
          <div style={{
            flex: 1, maxWidth: 380,
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--surfaceB)",
            border: "1px solid var(--border)",
            borderRadius: 10, padding: "7px 12px",
          }}>
            <Icon name="search" size={15} color="var(--muted)" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search stations, reports…"
              style={{
                flex: 1, border: "none", background: "transparent",
                color: "var(--text)", fontSize: 13, outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Live indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 99,
            background: "#10b98115", border: "1px solid #10b98130",
            fontSize: 11, color: "#10b981", fontWeight: 600,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "pulse 1.5s infinite" }} />
            Live
          </div>

          <div style={{ flex: 1 }} />

          {/* Dark toggle */}
          <Tip label={dark ? "Light mode" : "Dark mode"}>
            <button
              onClick={() => setDark(x => !x)}
              style={{
                width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border)",
                background: "var(--surfaceB)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--muted)", transition: "all .18s",
              }}
            >
              <Icon name={dark ? "sun" : "moon"} size={15} />
            </button>
          </Tip>

          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setNotifOpen(x => !x); setProfileOpen(false); }}
              style={{
                width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border)",
                background: "var(--surfaceB)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--muted)", position: "relative",
              }}
            >
              <Icon name="bell" size={15} />
              <span style={{
                position: "absolute", top: 6, right: 6,
                width: 7, height: 7, borderRadius: "50%",
                background: "#ef4444", border: "1.5px solid var(--surface)",
              }} />
            </button>
            {notifOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0, width: 300,
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,.18)",
                zIndex: 100, overflow: "hidden",
              }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 13 }}>
                  Notifications
                </div>
                {recentAlerts.slice(0, 3).map(a => (
                  <div key={a.id} style={{
                    padding: "12px 16px", borderBottom: "1px solid var(--border)",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 4, flexShrink: 0,
                      background: a.status === "unsafe" ? "#ef4444" : a.status === "moderate" ? "#f59e0b" : "#10b981" }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", marginBottom: 2 }}>{a.station}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{a.param}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{a.time}</div>
                    </div>
                  </div>
                ))}
                <div onClick={() => { navigate("/alerts"); setNotifOpen(false); }} style={{ padding: "10px 16px", textAlign: "center", fontSize: 12, color: "var(--accent)", cursor: "pointer" }}>
                  View all alerts →
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div style={{ position: "relative" }}>
            <div
              onClick={() => { setProfileOpen(x => !x); setNotifOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                padding: "4px 4px 4px 4px",
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg,#0ea5e9,#0d9488)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>A</div>
            </div>
            {profileOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0, width: 200,
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,.18)", zIndex: 100, overflow: "hidden",
              }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Admin User</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>admin@waterwatch.in</div>
                </div>
                {[
                  {icon:"user",   label:"Profile",   route:"/profile"  },
                  {icon:"reports",label:"Settings",   route:"/settings" },
                  {icon:"logout", label:"Sign out",   route:"/login"    },
                ].map(item => (
                  <div key={item.label}
                    onClick={() => { navigate(item.route); setProfileOpen(false); }}
                    style={{
                    padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
                    fontSize: 13, cursor: "pointer", color: item.label === "Sign out" ? "#ef4444" : "var(--text)",
                    transition: "background .15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--surfaceB)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <Icon name={item.icon} size={14} color={item.label === "Sign out" ? "#ef4444" : "var(--muted)"} />
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <main style={{ flex: 1, overflow: "auto", padding: "24px" }}
          onClick={() => { setProfileOpen(false); setNotifOpen(false); }}>

          {/* Page title */}
          <div style={{ marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: -.5, color: "var(--text)", marginBottom: 3 }}>
                Dashboard Overview
              </h1>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                Andhra Pradesh · Updated {tick === 0 ? "just now" : `${tick * 5}s ago`}
              </p>
            </div>
            <button onClick={() => window.location.reload()} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              borderRadius: 9, border: "1px solid var(--border)",
              background: "var(--surfaceB)", color: "var(--muted)",
              cursor: "pointer", fontSize: 12, fontFamily: "inherit",
            }}>
              <Icon name="refresh" size={13} />
              Refresh
            </button>
          </div>

          {/* ── KPI CARDS ─────────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16, marginBottom: 22 }}>
            {kpis.map((k, i) => (
              <div key={k.label} className="anim-card"
                onClick={() => navigate(k.route)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  ...C.card,
                  boxShadow: hovered === i ? `0 8px 32px ${k.accent}25` : "var(--shadow)",
                  transform: hovered === i ? "translateY(-2px)" : "none",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: k.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name={k.icon} size={18} color={k.accent} />
                  </div>
                  <span style={{ fontSize: 10, color: "var(--muted)", background: "var(--surfaceB)", padding: "3px 8px", borderRadius: 99 }}>
                    ↗ Live
                  </span>
                </div>
                {loading ? (
                  <><Skeleton w="50%" h={28} r={6} /><div style={{ height: 8 }} /><Skeleton w="70%" h={12} r={4} /></>
                ) : (
                  <>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text)", letterSpacing: -1, marginBottom: 4 }}>
                      {k.value}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>{k.label}</div>
                    <div style={{ fontSize: 11, color: k.accent }}>{k.sub}</div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* ── CHARTS + MAP ──────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, marginBottom: 22 }}>

            {/* Line chart */}
            <div style={{ ...C.card }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>Water Quality Trends</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>pH · Dissolved Oxygen · BOD (2024)</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["pH","#0ea5e9"],["DO","#0d9488"],["BOD","#f59e0b"]].map(([l,c]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10 }}>
                      <div style={{ width: 10, height: 3, borderRadius: 9, background: c }} />
                      <span style={{ color: "var(--muted)" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
              {loading ? <Skeleton w="100%" h={200} r={10} /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Line type="monotone" dataKey="ph"  stroke="#0ea5e9" strokeWidth={2} dot={false} name="pH" />
                    <Line type="monotone" dataKey="do"  stroke="#0d9488" strokeWidth={2} dot={false} name="DO" />
                    <Line type="monotone" dataKey="bod" stroke="#f59e0b" strokeWidth={2} dot={false} name="BOD" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie chart */}
            <div style={{ ...C.card }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>Water Safety Ratio</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 14 }}>Across all monitored stations</div>
              {loading ? <Skeleton w="100%" h={200} r={10} /> : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                        dataKey="value" paddingAngle={3} stroke="none">
                        {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v}%`]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 6 }}>
                    {pieData.map(d => (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>{d.name}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── BAR CHART + MAP ───────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }}>

            {/* Bar chart */}
            <div style={{ ...C.card }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>State-wise Comparison</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 14 }}>Safe vs Unsafe (%)</div>
              {loading ? <Skeleton w="100%" h={180} r={10} /> : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stateData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="state" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Bar dataKey="safe"   fill="#10b981" radius={[4,4,0,0]} name="Safe"   maxBarSize={24} />
                    <Bar dataKey="unsafe" fill="#ef4444" radius={[4,4,0,0]} name="Unsafe" maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Map section */}
            <div style={{ ...C.card }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>Station Map</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Andhra Pradesh — live markers</div>
                </div>
                <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
                  {[["#10b981","Safe"],["#f59e0b","Mod"],["#ef4444","Unsafe"]].map(([c,l]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />{l}
                    </div>
                  ))}
                </div>
              </div>
              {loading ? <Skeleton w="100%" h={200} r={10} /> : (
                <div style={{
                  width: "100%", height: 200, borderRadius: 10,
                  background: dark
                    ? "linear-gradient(160deg,#0a1929 0%,#0d2340 40%,#0a2e1e 100%)"
                    : "linear-gradient(160deg,#dbeafe 0%,#e0f2fe 40%,#dcfce7 100%)",
                  position: "relative", overflow: "hidden",
                  border: "1px solid var(--border)",
                }}>
                  {/* Decorative grid lines */}
                  {[...Array(5)].map((_,i) => (
                    <div key={i} style={{
                      position: "absolute", left: 0, right: 0, top: `${20 * i}%`,
                      borderBottom: "1px solid var(--border)", opacity: .4,
                    }} />
                  ))}
                  {[...Array(6)].map((_,i) => (
                    <div key={i} style={{
                      position: "absolute", top: 0, bottom: 0, left: `${16.6 * i}%`,
                      borderRight: "1px solid var(--border)", opacity: .4,
                    }} />
                  ))}

                  {/* Coast line decoration */}
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .15 }} viewBox="0 0 200 100" preserveAspectRatio="none">
                    <path d="M100,10 C110,20 130,30 140,50 C150,70 145,80 140,90 L80,90 C70,80 60,70 55,55 C50,40 60,25 70,15 Z" fill={dark ? "#0ea5e9" : "#0369a1"} />
                  </svg>

                  {/* Station markers */}
                  {stations.map((s, i) => {
                    const col = { safe: "#10b981", moderate: "#f59e0b", unsafe: "#ef4444" }[s.status];
                    return (
                      <div key={i}
                        onClick={() => navigate("/water-stations")}
                        style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, transform: "translate(-50%,-50%)", cursor: "pointer" }}
                        title={`${s.name} · ${s.status}`}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: col, border: "2px solid var(--surface)", position: "relative", zIndex: 2, boxShadow: `0 0 6px ${col}` }} />
                        <div style={{
                          position: "absolute", inset: -3, borderRadius: "50%", background: col, opacity: .25,
                          animation: s.status !== "safe" ? "ripple 2s infinite" : "none",
                        }} />
                      </div>
                    );
                  })}

                  {/* Legend hint */}
                  <div style={{
                    position: "absolute", bottom: 8, left: 8,
                    background: "var(--surface)", borderRadius: 6, padding: "4px 8px",
                    fontSize: 9, color: "var(--muted)", border: "1px solid var(--border)",
                  }}>
                    {stations.length} stations plotted
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RECENT ACTIVITY ───────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Alerts log */}
            <div style={{ ...C.card }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>Alert Log</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 16 }}>Latest water quality warnings</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {loading ? [...Array(4)].map((_,i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Skeleton w={30} h={30} r={8} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                      <Skeleton w="60%" h={11} r={4} />
                      <Skeleton w="40%" h={9} r={4} />
                    </div>
                  </div>
                )) : recentAlerts.map(a => (
                  <div key={a.id}
                    onClick={() => navigate("/alerts")}
                    style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "10px 12px", borderRadius: 10,
                    background: "var(--surfaceB)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "box-shadow .18s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadowMd)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: a.status === "unsafe" ? "#ef444420" : a.status === "moderate" ? "#f59e0b20" : "#10b98120",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon name="drop" size={13}
                        color={a.status === "unsafe" ? "#ef4444" : a.status === "moderate" ? "#f59e0b" : "#10b981"} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.station}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{a.param}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <Badge status={a.status} />
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>{a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reports */}
            <div style={{ ...C.card }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>Recent Reports</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 16 }}>Latest submitted documents</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {loading ? [...Array(4)].map((_,i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Skeleton w={30} h={30} r={8} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                      <Skeleton w="70%" h={11} r={4} />
                      <Skeleton w="40%" h={9} r={4} />
                    </div>
                  </div>
                )) : recentReports.map(r => (
                  <div key={r.id}
                    onClick={() => navigate("/reports")}
                    style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 10,
                    background: "var(--surfaceB)", border: "1px solid var(--border)",
                    cursor: "pointer", transition: "box-shadow .18s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadowMd)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: "linear-gradient(135deg,#0ea5e920,#0d948820)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon name="reports" size={13} color="#0ea5e9" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>By {r.author}</div>
                    </div>
                    <span style={{
                      fontSize: 10, color: "var(--muted)",
                      background: "var(--border)", padding: "3px 8px", borderRadius: 99,
                    }}>{r.date}</span>
                  </div>
                ))}

                {/* Quick submit */}
                <button onClick={() => navigate("/reports")} style={{
                  marginTop: 4, padding: "10px 0", borderRadius: 10,
                  border: "1.5px dashed var(--border)",
                  background: "transparent", color: "var(--accent)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  fontFamily: "inherit", transition: "background .18s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--surfaceB)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  + Submit New Report
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}