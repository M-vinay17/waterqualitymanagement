import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();
  const role = localStorage.getItem("user_role");

  return (
    <div style={styles.sidebar}>

      <h2 style={styles.logo}>WaterWatch</h2>

      {/* Add Alert Button */}
      <button
        onClick={() => navigate("/add-alert")}
        style={styles.button}
      >
        Add Alert
      </button>

      {/* Navigation Links */}
      <Link style={styles.link} to="/dashboard">
        Map Overview
      </Link>

      <Link style={styles.link} to="/reports">
        Reports
      </Link>

      <Link style={styles.link} to="/alerts">
        Alerts
      </Link>

      <Link style={styles.link} to="/water-stations">
        Water Stations
      </Link>

      <Link style={styles.link} to="/alerts/history">
        Historical Charts
      </Link>

      {/* NGO Portal (role based) */}
      {role === "ngo" && (
        <Link style={styles.link} to="/NgoDashboard">
          NGO Portal
        </Link>
      )}

      <Link style={styles.link} to="/profile">
        Profile
      </Link>

    </div>
  );
}

export default Sidebar;


const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    background: "#111827",
    color: "white",
    padding: "30px",
    position: "fixed",
    top: 0,
    left: 0
  },

  logo: {
    marginBottom: "40px",
    fontSize: "22px",
    fontWeight: "bold"
  },

  link: {
    display: "block",
    color: "white",
    marginBottom: "20px",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: "15px"
  },

  button: {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "600"
  }
};