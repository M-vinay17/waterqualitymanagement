
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../components/Sidebar";
import WaterMap from "../components/WaterMap";
import PredictiveAlertBanner from "../components/PredictiveAlertBanner";
import Profile from "./Profile";           // Make sure path is correct
import AlertBadge from "../components/alerts/AlertBadge"; // if you still need it

// ─── Status Helpers ───────────────────────────────────────────────────────────


import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import WaterMap from "../components/WaterMap";
import AlertBadge from "../components/alerts/AlertBadge";
import Profile from "./Profile";

// ─── Status helpers ───────────────────────────────────────────────────────────
function deriveStatus(params = {}) {
  const ph = params?.ph?.value;
  const do_ = params?.do?.value;
  const bod = params?.bod?.value;

  if (ph == null && do_ == null && bod == null) return "unknown";

  const checks = [
    ph == null || (ph >= 6.5 && ph <= 8.5),
    do_ == null || do_ >= 5,
    bod == null || bod <= 3,
  ];

  const okCount = checks.filter(Boolean).length;

  if (okCount === 3) return "good";
  if (okCount === 2) return "moderate";
  return "poor";
}

function StatusDot({ status }) {
  const colors = {
    good: "#0ea472",
    moderate: "#d97706",
    poor: "#dc2626",
    unknown: "#94a3b8",
  };
  const color = colors[status] || colors.unknown;

  return (
    <span
      style={{
        display: "inline-block",
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 4px ${color}80`,
        marginRight: "6px",
        flexShrink: 0,
      }}
    />
  );
}

// ─── Nav Item ────────────────────────────────────────────────────────────────
function NavItem({ to, icon, label, badge, active }) {
  return (
    <a href={to} style={{ textDecoration: "none" }}>   {/* Changed to <a> for simplicity, or keep Link if you prefer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "9px 12px",
          borderRadius: "8px",
          marginBottom: "2px",
          background: active ? "rgba(14,116,189,0.1)" : "transparent",
          borderLeft: `3px solid ${active ? "#0e74bd" : "transparent"}`,
          transition: "all 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.background = "rgba(14,116,189,0.05)";
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.background = "transparent";
        }}
      >
        <span style={{ fontSize: "15px" }}>{icon}</span>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px",
            fontWeight: active ? 600 : 400,
            color: active ? "#0e74bd" : "#64748b",
          }}
        >
          {label}
        </span>
        {badge > 0 && (
          <span
            style={{
              marginLeft: "auto",
              background: "#ef4444",
              color: "#fff",
              borderRadius: "10px",
              padding: "1px 6px",
              fontSize: "9px",
              fontFamily: "monospace",
              fontWeight: 700,
            }}
          >
            {badge}
          </span>
        )}
      </div>
    </a>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon, accent, index, onClick, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      onClick={onClick}
      whileHover={onClick ? { y: -2, boxShadow: "0 6px 20px rgba(14,116,189,0.14)" } : {}}
      style={{
        background: "#fff",
        borderRadius: "12px",
        border: "1px solid #e2eaf4",
        padding: "16px 18px",
        boxShadow: "0 1px 6px rgba(14,116,189,0.06)",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.15s",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: accent, borderRadius: "12px 12px 0 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
            {title}
          </div>

          {loading ? (
            <div style={{ height: "32px", width: "60px", background: "#f1f5f9", borderRadius: "6px", animation: "pulse 1.5s ease-in-out infinite" }} />
          ) : (
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "30px", color: "#0f172a", lineHeight: 1 }}>
              {value}
            </div>
          )}

          {sub && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#94a3b8", marginTop: "5px" }}>{sub}</div>}
        </div>

        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Water Station Card ───────────────────────────────────────────────────────
function WaterStationCard({ navigate }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ good: 0, moderate: 0, poor: 0, unknown: 0 });

  useEffect(() => {
    fetch("http://localhost:8000/water-stations?state=Andhra Pradesh")
      .then((r) => r.json())
      .then((data) => {
        const stationList = Array.isArray(data) ? data : [];
        setStations(stationList);

        const counts = { good: 0, moderate: 0, poor: 0, unknown: 0 };
        stationList.forEach((s) => {
          const st = deriveStatus(s.parameters);
          counts[st]++;
        });
        setSummary(counts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32, duration: 0.35 }}
      onClick={() => navigate("/water-stations")}
      whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(14,116,189,0.14)" }}
      style={{
        background: "#fff",
        borderRadius: "12px",
        border: "1px solid #e2eaf4",
        padding: "16px 18px",
        boxShadow: "0 1px 6px rgba(14,116,189,0.06)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.15s",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #0e74bd, #38bdf8)", borderRadius: "12px 12px 0 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Water Stations
        </div>
        <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#0e74bd", background: "rgba(14,116,189,0.08)", padding: "2px 8px", borderRadius: "4px", border: "1px solid rgba(14,116,189,0.15)" }}>
          {loading ? "…" : `${stations.length} total`}
        </span>
      </div>

      {loading ? (
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>Loading stations...</div>
      ) : stations.length === 0 ? (
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>No stations found</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "10px" }}>
            {[
              ["good", "#0ea472"],
              ["moderate", "#d97706"],
              ["poor", "#dc2626"],
            ].map(([key, color]) =>
              summary[key] > 0 && (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "4px", background: `${color}10`, border: `1px solid ${color}25` }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: color }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color, fontWeight: 500 }}>{summary[key]}</span>
                </div>
              )
            )}
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
            {stations.slice(0, 3).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "3px 0", borderBottom: i < 2 ? "1px solid #f8fafc" : "none" }}>
                <StatusDot status={deriveStatus(s.parameters)} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#334155", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.name || "Unnamed Station"}
                </span>
                {s.river && (
                  <span style={{ fontFamily: "monospace", fontSize: "9px", color: "#94a3b8", marginLeft: "6px" }}>
                    {s.river.slice(0, 12)}{s.river.length > 12 ? "…" : ""}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "8px", textAlign: "right", fontSize: "10px", color: "#0e74bd", fontWeight: 500 }}>
            View all →
          </div>
        </>
      )}
    </motion.div>
  );
}

// ─── Live Clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#94a3b8" }}>
      {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

// ─── Quality Helpers ──────────────────────────────────────────────────────────
function qualityColor(status) {
  if (!status) return "#0ea472";
  const s = status.toLowerCase();
  if (s === "good") return "#0ea472";
  if (s === "moderate") return "#d97706";
  return "#dc2626";
}

function qualityLabel(status) {
  if (!status) return "Good";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [alertCount, setAlertCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [stationCount, setStationCount] = useState(0);
  const [waterQuality, setWaterQuality] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingQuality, setLoadingQuality] = useState(true);

  // Fetch Data
  useEffect(() => {
    // Alerts
    const fetchAlerts = () => {
      fetch("http://localhost:8000/alerts")
        .then((r) => r.json())
        .then((data) => setAlertCount(Array.isArray(data) ? data.length : 0))
        .catch(() => {});
    };

    fetchAlerts();
    const alertInterval = setInterval(fetchAlerts, 10000);

    // Reports
    fetch("http://localhost:8000/reports")
      .then((r) => r.json())
      .then((data) => setReportCount(Array.isArray(data) ? data.length : (data.total ?? data.count ?? 0)))
      .catch(() => setReportCount(0))
      .finally(() => setLoadingReports(false));

    // Stations
    fetch("http://localhost:8000/water-stations?state=Andhra Pradesh")
      .then((r) => r.json())
      .then((data) => setStationCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setStationCount(0))
      .finally(() => setLoadingStations(false));

    // Water Quality
    fetch("http://localhost:8000/water-quality")
      .then((r) => r.json())
      .then((data) => setWaterQuality(data))
      .catch(() => setWaterQuality(null))
      .finally(() => setLoadingQuality(false));

    return () => clearInterval(alertInterval);
  }, []);

  // Prevent body scroll when profile modal is open
  useEffect(() => {
    document.body.style.overflow = profileOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [profileOpen]);


  //authority
  const userRole = "authority"; // temp (same like RoleGuard)

  // ── Sidebar nav ────────────────────────────────────────────────────────────
  const navItems = [
    { to: "/dashboard",      icon: "🗺️",  label: "Map Overview"      },
    { to: "/reports",        icon: "📋",  label: "Reports"           },
    { to: "/alerts",         icon: "🔔",  label: "Alerts", badge: alertCount },
    { to: "/water-stations", icon: "💧",  label: "Water Stations"    },
    { to: "/alerts/history", icon: "📊",  label: "Historical Charts" },

      ...(userRole === "authority" || userRole === "admin"
    ? [{ to: "/authority/dashboard", icon: "🛡️", label: "Authority Portal" }]
    : []),
  ];

  const wqStatus = waterQuality?.status || waterQuality?.quality || null;
  const wqPh = waterQuality?.ph ?? waterQuality?.pH ?? null;
  const wqSub = wqPh ? `pH ${wqPh} · Safe range` : "pH 7.8 · Safe range";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(160deg, #eaf4fd 0%, #f0f7ff 60%, #e8f0fb 100%)", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          
          {/* Top Bar */}
          <div style={{ background: "#fff", borderBottom: "1px solid #e2eaf4", padding: "13px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 6px rgba(14,116,189,0.05)", position: "sticky", top: 0, zIndex: 10 }}>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "19px", color: "#0f172a" }}>Dashboard Overview</div>
              <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "1px" }}>AquaWatch · Water Quality Monitoring System</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <LiveClock />

              <div style={{ padding: "4px 10px", borderRadius: "5px", background: "rgba(14,164,114,0.1)", border: "1px solid rgba(14,164,114,0.25)", display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0ea472" }} />
                <span style={{ fontSize: "9px", color: "#0ea472", fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.08em" }}>LIVE</span>
              </div>

              {/* Profile Trigger */}
              <div
                onClick={() => setProfileOpen(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "6px 12px 6px 6px", borderRadius: "20px",
                  cursor: "pointer", background: "rgba(14,116,189,0.06)",
                  border: "1px solid rgba(14,116,189,0.15)",
                  transition: "all 0.15s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(14,116,189,0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(14,116,189,0.06)")}
              >
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #0e74bd, #38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>👤</div>
                <div>
                  <div style={{ fontSize: "11px", color: "#0f172a", fontWeight: 600, lineHeight: 1.2 }}>My Profile</div>
                  <div style={{ fontSize: "9px", color: "#94a3b8" }}>View account</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px" }}>
            <PredictiveAlertBanner />

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
              <StatCard index={0} icon="🔔" title="Active Alerts" value={alertCount} sub="Auto-refreshes every 10s" accent="#ef4444" onClick={() => navigate("/alerts")} />
              <StatCard index={1} icon="📋" title="Reports" value={reportCount} sub="Total submissions" accent="#f59e0b" loading={loadingReports} onClick={() => navigate("/reports")} />
              <StatCard index={2} icon="📡" title="Stations Online" value={stationCount} sub="Andhra Pradesh" accent="#0e74bd" loading={loadingStations} />
              <StatCard index={3} icon="💧" title="Water Quality" value={<span style={{ color: qualityColor(wqStatus), fontSize: "26px" }}>{qualityLabel(wqStatus)}</span>} sub={wqSub} accent="#0ea472" loading={loadingQuality} />
            </div>

            {/* Map + Side Panel */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 270px", gap: "16px" }}>
              {/* Live Map */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  border: "1px solid #e2eaf4",
                  overflow: "hidden",
                  boxShadow: "0 1px 8px rgba(14,116,189,0.07)",
                  position: "relative"
                }}
              >
                <div style={{ padding: "13px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>🗺️ Live Water Quality Map</div>
                  <span style={{ fontSize: "10px", color: "#94a3b8", fontFamily: "monospace" }}>Andhra Pradesh · India</span>
                </div>
                <div style={{ height: "420px", position: "relative" }}>
                  <WaterMap />
                </div>
              </motion.div>

              {/* Right Sidebar Panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
                <WaterStationCard navigate={navigate} />

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => navigate("/reports")}
                  whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(14,116,189,0.32)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                    background: "linear-gradient(135deg, #0e74bd 0%, #38bdf8 100%)",
                    color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px", fontWeight: 600, boxShadow: "0 3px 12px rgba(14,116,189,0.28)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                  }}
                >
                  📝 Submit Quick Report
                </motion.button>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.46 }}
                  onClick={() => navigate("/alerts/history")}
                  whileHover={{ y: -2, boxShadow: "0 4px 16px rgba(14,116,189,0.13)" }}
                  style={{
                    background: "#fff", borderRadius: "12px", border: "1px solid #e2eaf4",
                    padding: "14px 16px", cursor: "pointer", boxShadow: "0 1px 6px rgba(14,116,189,0.06)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "rgba(14,116,189,0.08)", border: "1px solid rgba(14,116,189,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📊</div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>Historical Charts</div>
                      <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>Monthly alert trends →</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {profileOpen && (
          <Profile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}