import React from "react";
import { Link, useNavigate } from "react-router-dom";
import WaterMap from "../components/WaterMap";
import "./Dashboard.css";
import AlertBadge from "../components/alerts/AlertBadge";


import alerts from "../utils/mockAlerts";
const alertCount = alerts.length;

export default function Dashboard() {

  const navigate = useNavigate();

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="logo">WaterWatch</h2>

        <ul>
          <li><Link to="/dashboard">Map</Link></li>
          <li><Link to="/reports">Reports</Link></li>
        <li> <Link to="/alerts">
  Alerts <AlertBadge count={alertCount}  />
</Link> </li>
          <li><Link to="/stations">Stations</Link></li>
          <li><Link to="/analytics">Analytics</Link></li>
        </ul>
      </div>


      {/* Main Dashboard */}
      <div className="main-content">

        {/* Profile icon */}
        <div style={{display:"flex", justifyContent:"flex-end", marginBottom:"10px"}}>
          <div
            onClick={() => navigate("/profile")}
            style={{
              width:"40px",
              height:"40px",
              borderRadius:"50%",
              background:"#0f1f38",
              color:"white",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              cursor:"pointer",
              fontSize:"18px"
            }}
          >
            👤
          </div>
        </div>

        <h2>Dashboard Overview</h2>

        <div className="dashboard-grid">

          {/* Map */}
          <div className="map-section">
            <WaterMap />
          </div>

          {/* Right Cards */}
          <div className="right-cards">

            <div className="card">
              <h4>Active Alerts</h4>
              <p>5</p>
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
              <p style={{color:"green"}}>Good (7.8)</p>
            </div>

            <button className="report-btn">
              Submit Quick Report
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}