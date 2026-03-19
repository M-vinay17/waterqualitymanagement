import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>WaterWatch</h2>
      <li onClick={() => navigate("/add-alert")}>Add Alert</li>
      <Link style={styles.link} to="/dashboard">Dashboard</Link>
      <Link style={styles.link} to="/reports">Reports</Link>
      <Link style={styles.link} to="/alerts/history">Historical Charts</Link>
      <Link style={styles.link} to="/profile">Profile</Link>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    background: "#111827",
    color: "white",
    padding: "30px",
    position: "fixed"
  },

  logo: {
    marginBottom: "40px"
  },

  link: {
    display: "block",
    color: "white",
    marginBottom: "20px",
    textDecoration: "none"
  }
};