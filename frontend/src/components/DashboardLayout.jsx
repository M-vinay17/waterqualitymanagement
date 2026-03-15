import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div style={{ display: "flex", background: "#f4f6fa", minHeight: "100vh" }}>
      
      <Sidebar />

      <div style={{ marginLeft: "220px", width: "100%" }}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <h2>WaterWatch Dashboard</h2>

          <div style={styles.profile}>
            🔔
            <div style={styles.avatar}>A</div>
          </div>
        </div>

        <div style={{ padding: "30px" }}>
          <Outlet />
        </div>

      </div>

    </div>
  );
}

const styles = {

  header: {
    height: "70px",
    background: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 30px",
    borderBottom: "1px solid #eee"
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "20px"
  },

  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "#3b82f6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }

};