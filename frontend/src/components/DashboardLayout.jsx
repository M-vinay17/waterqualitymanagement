import React from "react";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div style={styles.container}>
      {/* Main Content */}
      <div style={styles.content}>
        <Outlet />
      </div>

    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#f4f6f9"
  },

  content: {
    marginLeft: "220px",
    padding: "30px",
    width: "100%"
  }
};

export default DashboardLayout;