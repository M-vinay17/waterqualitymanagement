import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import WaterMap from "../components/WaterMap";
import "./Dashboard.css";
import AlertBadge from "../components/alerts/AlertBadge";
import Profile from "./Profile"; // ✅ CHANGE 1

// ─── Mini station status badge ────────────────────────────────────────────────
function StatusDot({ status }) {
  const colors = {
    good:     "#00e5a0",
    moderate: "#f5a623",
    poor:     "#ff4757",
    unknown:  "#667788",
  };
  return (
    <span style={{
      display: "inline-block",
      width: "7px", height: "7px",
      borderRadius: "50%",
      background: colors[status] || colors.unknown,
      boxShadow: `0 0 5px ${colors[status] || colors.unknown}`,
      marginRight: "6px",
      flexShrink: 0,
    }} />
  );
}

// ─── Derive status from CPCB parameters ──────────────────────────────────────
function deriveStatus(params = {}) {
  const ph  = params?.ph?.value;
  const do_ = params?.do?.value;
  const bod = params?.bod?.value;
  if (ph == null && do_ == null && bod == null) return "unknown";
  const ok = [
    ph  == null || (ph  >= 6.5 && ph  <= 8.5),
    do_ == null || do_  >= 5,
    bod == null || bod  <= 3,
  ].filter(Boolean).length;
  if (ok === 3) return "good";
  if (ok === 2) return "moderate";
  return "poor";
}

// ─── WaterStation Mini Card ───────────────────────────────────────────────────
function WaterStationCard({ navigate }) {
  const [stations, setStations] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [summary,  setSummary]  = useState({ good: 0, moderate: 0, poor: 0, unknown: 0 });

  useEffect(() => {
    fetch("http://localhost:8000/water-stations?state=Andhra Pradesh")
      .then(res => res.json())
      .then(data => {
        setStations(data);
        const counts = { good: 0, moderate: 0, poor: 0, unknown: 0 };
        data.forEach(s => {
          const st = deriveStatus(s.parameters);
          counts[st] = (counts[st] || 0) + 1;
        });
        setSummary(counts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = stations.length;

  return (
    <div
      className="card"
      onClick={() => navigate("/water-stations")}
      style={{ cursor: "pointer", padding: "14px 16px", userSelect: "none" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h4 style={{ margin: 0, fontSize: "13px" }}>Water Stations</h4>
        <span style={{
          fontFamily: "monospace", fontSize: "10px",
          color: "#00b4ff", background: "rgba(0,180,255,0.1)",
          padding: "2px 7px", borderRadius: "3px", border: "1px solid rgba(0,180,255,0.2)",
        }}>
          {loading ? "…" : `${total} total`}
        </span>
      </div>

      {loading ? (
        <p style={{ margin: 0, fontSize: "12px", color: "#445566" }}>Loading…</p>
      ) : total === 0 ? (
        <p style={{ margin: 0, fontSize: "12px", color: "#445566" }}>No stations found</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
            {[
              { key: "good",     label: "Good",     color: "#00e5a0" },
              { key: "moderate", label: "Moderate", color: "#f5a623" },
              { key: "poor",     label: "Poor",     color: "#ff4757" },
            ].map(({ key, label, color }) => summary[key] > 0 && (
              <div key={key} style={{
                display: "flex", alignItems: "center", gap: "4px",
                padding: "3px 8px", borderRadius: "3px",
                background: `${color}12`, border: `1px solid ${color}30`,
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, display: "inline-block" }} />
                <span style={{ fontFamily: "monospace", fontSize: "10px", color }}>{summary[key]} {label}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px" }}>
            {stations.slice(0, 3).map((s, i) => {
              const st = deriveStatus(s.parameters);
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center",
                  padding: "4px 0",
                  borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.03)" : "none",
                }}>
                  <StatusDot status={st} />
                  <span style={{
                    fontFamily: "monospace", fontSize: "10px",
                    color: "#aac8e0", overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                  }}>
                    {s.name || "Unnamed Station"}
                  </span>
                  {s.river && (
                    <span style={{ fontFamily: "monospace", fontSize: "9px", color: "#445566", marginLeft: "6px", flexShrink: 0 }}>
                      {s.river.length > 12 ? s.river.slice(0, 12) + "…" : s.river}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "8px", textAlign: "right", fontFamily: "monospace", fontSize: "10px", color: "#00b4ff", opacity: 0.7 }}>
            View all →
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {

  const navigate = useNavigate();
  const [alertCount,  setAlertCount]  = useState(0);
  const [profileOpen, setProfileOpen] = useState(false); // ✅ CHANGE 2

  useEffect(() => {
    const fetchAlerts = () => {
      fetch("http://localhost:8000/alerts")
        .then(res => res.json())
        .then(data => setAlertCount(data.length))
        .catch(err => console.error("Error fetching alerts:", err));
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="logo">WaterWatch</h2>
        <ul>
          <li><Link to="/dashboard">Map</Link></li>
          <li><Link to="/reports">Reports</Link></li>
          <li>
            <Link to="/alerts">
              Alerts <AlertBadge count={alertCount} />
            </Link>
          </li>
          <li><Link to="/water-stations">Water Stations</Link></li>
          <li><Link to="/analytics">Analytics</Link></li>
        </ul>
      </div>

      {/* Main Dashboard */}
      <div className="main-content">

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
          {/* ✅ CHANGE 3: navigate → setProfileOpen(true) */}
          <div
            onClick={() => setProfileOpen(true)}
            style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: "#0f1f38", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: "18px",
            }}
          >
            👤
          </div>
        </div>

        <h2>Dashboard Overview</h2>

        <div className="dashboard-grid">

          <div className="map-section">
            <WaterMap />
          </div>

          <div className="right-cards">

            <div className="card">
              <h4>Active Alerts</h4>
              <p>{alertCount}</p>
            </div>

            <div className="card">
              <h4>Reports</h4>
              <p>12</p>
            </div>

            <div className="card">
              <h4>Stations Online</h4>
              <p>87</p>
            </div>

            <div className="card">
              <h4>Water Quality</h4>
              <p style={{ color: "green" }}>Good (7.8)</p>
            </div>

            <WaterStationCard navigate={navigate} />

            <button className="report-btn">
              Submit Quick Report
            </button>

          </div>

        </div>

      </div>

      {/* ✅ CHANGE 3 cont: Profile right-side drawer */}
      <Profile
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

    </div>
  );
}