import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  // ✅ TEMP ROLE (same like RoleGuard)
  const userRole = "authority"; // change to "user" to test

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>WaterWatch</h2>

      {/* Section Title */}
      <p style={styles.section}>NAVIGATION</p>

      {/* Navigation Links */}
      <Link style={styles.link} to="/dashboard">🗺️ Map Overview</Link>
      <Link style={styles.link} to="/reports">📋 Reports</Link>
      <Link style={styles.link} to="/alerts">🔔 Alerts</Link>
      <Link style={styles.link} to="/water-stations">💧 Water Stations</Link>
      <Link style={styles.link} to="/alerts/history">📊 Historical Charts</Link>

      {/* ✅ YOUR FEATURE (kept) */}
      {(userRole === "authority" || userRole === "admin") && (
        <Link style={styles.link} to="/authority/dashboard">
          🛡️ Authority Portal
        </Link>
      )}

    </div>
  );
}

export default Sidebar;

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    background: "#ffffff",
    color: "#0f172a",
    borderRight: "1px solid #e2eaf4",
    padding: "20px"
  },

  logo: {
    marginBottom: "20px",
    fontWeight: "bold",
    color: "#0f172a"
  },

  section: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "15px"
  },

  link: {
    display: "block",
    color: "#334155",
    marginBottom: "15px",
    textDecoration: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "8px"
  }
};