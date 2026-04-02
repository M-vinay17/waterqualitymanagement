import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import WaterMap from "../components/WaterMap";
import PredictiveAlertBanner from "../components/PredictiveAlertBanner";
import Profile from "./Profile";


function deriveStatus(params = {}) {
  const ph = params?.ph?.value;
  const do_ = params?.do?.value;
  const bod = params?.bod?.value;

  if (ph == null && do_ == null && bod == null) return "unknown";

  const checks = [
    ph == null || (ph >= 6.5 && ph <= 8.5),
    do_ == null || do_ >= 5,
    bod == null || bod <= 3
  ];

  const okCount = checks.filter(Boolean).length;

  if (okCount === 3) return "good";
  if (okCount === 2) return "moderate";
  return "poor";
}


function qualityColor(status) {
  if (!status) return "#16a34a";

  const s = status.toLowerCase();

  if (s === "good") return "#16a34a";
  if (s === "moderate") return "#f59e0b";

  return "#ef4444";
}


function qualityLabel(status) {
  if (!status) return "Good";
  return status.charAt(0).toUpperCase() + status.slice(1);
}



function StatCard({ title, value, icon, sub, loading, onClick }) {

  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={onClick}
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "18px",
        border: "1px solid #e5e7eb",
        cursor: onClick ? "pointer" : "default",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}
    >

      <div
        style={{
          fontSize: "13px",
          color: "#64748b",
          marginBottom: "5px"
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "26px",
          fontWeight: "600"
        }}
      >
        {icon} {loading ? "..." : value}
      </div>

      {sub && (
        <div
          style={{
            fontSize: "12px",
            color: "#94a3b8",
            marginTop: "4px"
          }}
        >
          {sub}
        </div>
      )}

    </motion.div>
  );
}



export default function Dashboard() {

  const navigate = useNavigate();

  const [alertCount, setAlertCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [stationCount, setStationCount] = useState(0);

  const [waterQuality, setWaterQuality] = useState(null);

  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingQuality, setLoadingQuality] = useState(true);

  const [profileOpen, setProfileOpen] = useState(false);



  useEffect(() => {

    const fetchAlerts = () => {
      fetch("http://localhost:8000/alerts")
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAlertCount(data.length);
          }
        })
        .catch(() => {});
    };

    fetchAlerts();

    const interval = setInterval(fetchAlerts, 10000);



    fetch("http://localhost:8000/reports")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReportCount(data.length);
        }
      })
      .catch(() => setReportCount(0))
      .finally(() => setLoadingReports(false));



    fetch("http://localhost:8000/water-stations")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStationCount(data.length);
        }
      })
      .catch(() => setStationCount(0))
      .finally(() => setLoadingStations(false));



    fetch("http://localhost:8000/water-quality")
      .then(r => r.json())
      .then(data => {
        setWaterQuality(data);
      })
      .catch(() => setWaterQuality(null))
      .finally(() => setLoadingQuality(false));


    return () => clearInterval(interval);

  }, []);



  const wqStatus =
    waterQuality?.status ||
    waterQuality?.quality ||
    deriveStatus(waterQuality?.parameters);

  const wqPh = waterQuality?.ph ?? null;

  const wqSub = wqPh
    ? `pH ${wqPh} • Safe range`
    : "pH 7.8 • Safe range";



  return (
    <>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f8fafc"
        }}
      >

        <Sidebar />



        <div
          style={{
            flex: 1,
            marginLeft: "240px",
            display: "flex",
            flexDirection: "column"
          }}
        >


          <div
            style={{
              background: "#ffffff",
              padding: "18px 25px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >

            <div>

              <h2 style={{ marginBottom: "3px" }}>
                Dashboard Overview
              </h2>

              <span
                style={{
                  fontSize: "12px",
                  color: "#94a3b8"
                }}
              >
                AquaWatch Water Monitoring System
              </span>

            </div>


            <div
              onClick={() => setProfileOpen(true)}
              style={{
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              👤 Profile
            </div>

          </div>



          <div style={{ padding: "25px" }}>


            <PredictiveAlertBanner />


            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: "16px",
                marginBottom: "25px"
              }}
            >

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
                icon="💧"
                loading={loadingQuality}
              />

            </div>



            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                overflow: "hidden"
              }}
            >

              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #e5e7eb",
                  fontWeight: "600"
                }}
              >
                Map Overview
              </div>

              <div style={{ height: "500px" }}>
                <WaterMap />
              </div>

            </motion.div>

          </div>

        </div>

      </div>



      <AnimatePresence>
        {profileOpen && (
          <Profile
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
          />
        )}
      </AnimatePresence>

    </>
  );
}