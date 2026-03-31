import React from "react";
import PredictiveAlertBanner from "../components/PredictiveAlertBanner";
import Sidebar from "../components/Sidebar";
import WaterMap from "../components/WaterMap";

function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <PredictiveAlertBanner />
        
        <h2>Dashboard Overview</h2>

        <div style={{ marginTop: "20px" }}>
          <WaterMap />
        </div>
      </div>

    </div>
  );
}

export default Dashboard;