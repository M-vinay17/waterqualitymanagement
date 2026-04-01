import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  // Get user role safely from localStorage
  const role = localStorage.getItem("user_role") || "user";

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>AquaWatch</h2>

      {/* Add Alert Button (optional - keep if needed) */}
      <button
        onClick={() => navigate("/add-alert")}
        style={styles.button}
      >
        + Add Alert
      </button>

      {/* Navigation Links */}
      <Link style={styles.link} to="/dashboard">🗺️ Map Overview</Link>
      <Link style={styles.link} to="/reports">📋 Reports</Link>
      <Link style={styles.link} to="/alerts">🔔 Alerts</Link>
      <Link style={styles.link} to="/water-stations">💧 Water Stations</Link>
      <Link style={styles.link} to="/alerts/history">📊 Historical Charts</Link>

      {/* NGO Portal - Visible only for NGO or Admin */}
      {(role === "ngo" || role === "admin") && (
        <Link style={styles.link} to="/NgoDashboard">🤝 NGO Portal</Link>
      )}

      {/* Authority Portal - Visible only for Authority or Admin */}
      {(role === "authority" || role === "admin") && (
        <Link style={styles.link} to="/authority/dashboard">🛡️ Authority Portal</Link>
      )}

      <Link style={styles.link} to="/profile">👤 Profile</Link>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    height: "100vh",
    background: "#ffffff",
    color: "#0f172a",
    borderRight: "1px solid #e2eaf4",
    padding: "30px 20px",
    overflowY: "auto",
    boxShadow: "2px 0 8px rgba(0, 0, 0, 0.03)",
  },

  logo: {
    marginBottom: "40px",
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    fontFamily: "'DM Serif Display', serif",
  },

  link: {
    display: "block",
    color: "#334155",
    marginBottom: "16px",
    textDecoration: "none",
    fontSize: "15px",
    padding: "8px 12px",
    borderRadius: "6px",
    transition: "all 0.2s",
    cursor: "pointer",
  },

  button: {
    width: "100%",
    padding: "12px",
    marginBottom: "25px",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
};