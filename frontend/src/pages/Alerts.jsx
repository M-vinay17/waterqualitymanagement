import React, { useEffect, useState } from "react";
import AlertFlashGrid from "../components/alerts/AlertFlashGrid";
import AlertTable from "../components/alerts/AlertTable";
import "../components/alerts/alertStyles.css";

export default function Alerts() {

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/alerts")
      .then(res => res.json())
      .then(data => {

        // 🔥 MAP BACKEND → FRONTEND FORMAT
        const formatted = data.map(item => {

          let severity = "medium";

          if (item.type === "contamination") severity = "critical";
          if (item.type === "boil_notice") severity = "high";
          if (item.type === "outage") severity = "medium";

          return {
            id: item.id,
            station: item.location,             // mapping
            parameter: item.type.replace("_"," "),               // mapping
            value: item.message.slice(0, 16) + "...",                      // backend doesn’t have value
            severity: severity,
            status: "active",
            time: new Date(item.issued_at).toLocaleString(),
            description: item.message
          };
        });

        setAlerts(formatted);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="alerts-page">

      <h2 className="alerts-title">🚨 Active Water Alerts</h2>

      <AlertFlashGrid alerts={alerts} />

      <h3 className="alerts-log">Alert Log</h3>

      <AlertTable alerts={alerts} />

    </div>
  );
}