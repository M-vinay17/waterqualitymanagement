import { Link } from "react-router-dom";

export default function Sidebar() {

  const role = localStorage.getItem("user_role");

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>WaterWatch</h2>

      <Link style={styles.link} to="/dashboard">Map Overview</Link>
      <Link style={styles.link} to="/reports">Reports</Link>
      <Link style={styles.link} to="/alerts">Alerts</Link>
      <Link style={styles.link} to="/water-stations">Water Stations</Link>
      <Link style={styles.link} to="/alerts/history">Historical Charts</Link>

      {role === "ngo" && (
        <Link style={styles.link} to="/ngo/dashboard">NGO Portal</Link>
      )}

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