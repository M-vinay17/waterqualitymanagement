import { useEffect, useState } from "react";
import API from "../services/api";   // ✅ USED NOW
import AlertTypeBadge from "../components/AlertTypeBadge";
import useAlertSocket from "../hooks/useAlertSocket";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useAlertSocket(setAlerts);

  // ✅ REAL API
  useEffect(() => {
    API.get("/api/alerts")   // ✅ correct endpoint
    .then((res) => {
      console.log("API DATA:", res.data);   
      setAlerts(res.data.reverse());
    })
    .catch((err) => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  const filtered = alerts
  .filter((a) => {
    const text = search.toLowerCase();

    return (
      (a.message || "").toLowerCase().includes(text) ||
      (a.location || "").toLowerCase().includes(text)
    );
  })
  .filter((a) => {
    return typeFilter === "all" || a.type === typeFilter;
  });
      return (
    <div style={{ padding: "20px" }}>
    <h2>Alerts</h2>

    {/* SEARCH */}
    <input
      type="text"
      placeholder="Search by message or location..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        padding: "8px",
        marginRight: "10px",
        width: "250px",
        borderRadius: "6px",
      }}
    />

    {/* FILTER */}
    <select
      value={typeFilter}
      onChange={(e) => setTypeFilter(e.target.value)}
      style={{
        padding: "8px",
        borderRadius: "6px",
      }}
    >
      <option value="all">All</option>
      <option value="predictive">Predictive</option>
      <option value="contamination">Contamination</option>
      <option value="boil_notice">Boil Notice</option>
      <option value="outage">Outage</option>
    </select>

    {/* LOADING */}
    {loading && <p>Loading...</p>}

    {/* EMPTY */}
    {!loading && filtered.length === 0 && (
      <p>No alerts found</p>
    )}

    {/* ALERT LIST */}
    {filtered.map((alert) => (
      <div
        key={alert.id}
        style={{
          background: "#ffffff",
          border: "1px solid #ddd",
          padding: "15px",
          marginTop: "15px",
          borderRadius: "8px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        {/* BADGE */}
        <div style={{ marginBottom: "8px" }}>
          <AlertTypeBadge type={alert.type} />
        </div>

        {/* MESSAGE */}
        <p style={{ fontWeight: "500" }}>
          {alert.message}
        </p>

        {/* LOCATION */}
        <p>📍 {alert.location}</p>

        {/* TIME */}
        <p>
          🕒 {new Date(alert.issued_at).toLocaleString()}
        </p>

       <p>
       Source: <strong>{alert.source || "Unknown"}</strong>
       </p>
      </div>
    ))}
  </div>
      );
    }
   