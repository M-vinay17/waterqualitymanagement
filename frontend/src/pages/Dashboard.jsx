import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import PredictiveAlertBanner from "../components/PredictiveAlertBanner";
import Sidebar from "../components/Sidebar";
import WaterMap from "../components/WaterMap";
import AlertBadge from "../components/alerts/AlertBadge";
import Profile from "./Profile";


// ─── Status helpers ─────────────────────────────────────────
function deriveStatus(params = {}) {
  const ph  = params?.ph?.value;
  const do_ = params?.do?.value;
  const bod = params?.bod?.value;

  if (ph == null && do_ == null && bod == null) return "unknown";

  const ok = [
    ph  == null || (ph >= 6.5 && ph <= 8.5),
    do_ == null || do_ >= 5,
    bod == null || bod <= 3,
  ].filter(Boolean).length;

  if (ok === 3) return "good";
  if (ok === 2) return "moderate";
  return "poor";
}

function StatusDot({ status }) {
  const colors = {
    good: "#0ea472",
    moderate: "#d97706",
    poor: "#dc2626",
    unknown: "#94a3b8"
  };

  const c = colors[status] || colors.unknown;

  return (
    <span
      style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: c,
        display: "inline-block",
        marginRight: "6px"
      }}
    />
  );
}


// ─── Live clock ─────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#94a3b8" }}>
      {time.toLocaleTimeString("en-IN")}
    </span>
  );
}


// ─── Water quality helpers ──────────────────────────────────
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


// ─── Main Dashboard ─────────────────────────────────────────
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


  useEffect(() => {

    const fetchAlerts = () => {
      fetch("http://localhost:8000/alerts")
        .then(r => r.json())
        .then(data => setAlertCount(Array.isArray(data) ? data.length : 0))
        .catch(() => {});
    };

    fetchAlerts();
    const alertInterval = setInterval(fetchAlerts, 10000);

    fetch("http://localhost:8000/reports")
      .then(r => r.json())
      .then(data =>
        setReportCount(Array.isArray(data) ? data.length : (data.total ?? 0))
      )
      .finally(() => setLoadingReports(false));

    fetch("http://localhost:8000/water-stations?state=Andhra Pradesh")
      .then(r => r.json())
      .then(data => setStationCount(Array.isArray(data) ? data.length : 0))
      .finally(() => setLoadingStations(false));

    fetch("http://localhost:8000/water-quality")
      .then(r => r.json())
      .then(data => setWaterQuality(data))
      .finally(() => setLoadingQuality(false));

    return () => clearInterval(alertInterval);

  }, []);


  const wqStatus = waterQuality?.status || waterQuality?.quality || null;
  const wqPh = waterQuality?.ph ?? null;
  const wqSub = wqPh ? `pH ${wqPh} · Safe range` : "pH 7.8 · Safe range";


  return (
    <>
      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

          {/* Top Bar */}
          <div style={{
            background: "#fff",
            padding: "15px 25px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h2>Dashboard Overview</h2>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                AquaWatch Water Monitoring
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <LiveClock />

              <div
                onClick={() => setProfileOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer"
                }}
              >
                👤 Profile
              </div>
            </div>
          </div>


          {/* Page Content */}
          <div style={{ padding: "20px" }}>

            <PredictiveAlertBanner />

            {/* Stat cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "15px",
              marginBottom: "20px"
            }}>

              <StatCard
                title="Active Alerts"
                value={alertCount}
                icon="🔔"
                onClick={() => navigate("/alerts")}
              />

              <StatCard
                title="Reports"
                value={reportCount}
                icon="📋"
                loading={loadingReports}
                onClick={() => navigate("/reports")}
              />

              <StatCard
                title="Stations Online"
                value={stationCount}
                icon="📡"
                loading={loadingStations}
              />

              <StatCard
                title="Water Quality"
                value={
                  <span style={{ color: qualityColor(wqStatus) }}>
                    {qualityLabel(wqStatus)}
                  </span>
                }
                sub={wqSub}
                loading={loadingQuality}
              />

            </div>


            {/* Map */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                overflow: "hidden"
              }}
            >
              <div style={{ padding: "12px 15px", borderBottom: "1px solid #eee" }}>
                🗺️ Live Water Quality Map
              </div>

              <div style={{ height: "420px" }}>
                <WaterMap />
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      <Profile
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}



// ─── Stat card component ───────────────────────────────────
function StatCard({ title, value, icon, sub, onClick, loading }) {

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: "10px",
        padding: "16px",
        border: "1px solid #e5e7eb",
        cursor: onClick ? "pointer" : "default"
      }}
    >
      <div style={{ fontSize: "12px", color: "#6b7280" }}>
        {title}
      </div>

      <div style={{ fontSize: "26px", marginTop: "5px" }}>
        {icon} {loading ? "..." : value}
      </div>

      {sub && (
        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
          {sub}
        </div>
      )}
    </div>
  );
}