import React, { useEffect, useState } from "react";
import AlertChart from "../components/AlertChart";

function HistoricalCharts() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/alerts")
      .then(res => res.json())
      .then(alerts => {

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

        const formatted = months.map((month, index) => {
          const monthAlerts = alerts.filter(a =>
            new Date(a.issued_at).getMonth() === index
          );

          return {
            month,
            boil_notice: monthAlerts.filter(a => a.type === "boil_notice").length,
            contamination: monthAlerts.filter(a => a.type === "contamination").length,
            outage: monthAlerts.filter(a => a.type === "outage").length
          };
        });

        setData(formatted);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading charts...</p>;
  }

  return (
    <div style={{ padding: "30px" }}>
      
      <h2>📊 Historical Alerts Trends</h2>

      <p style={{ marginBottom: "20px" }}>
        This dashboard shows monthly trends of water-related alerts including boil notices,
        contamination, and outages.
      </p>

      <AlertChart title="Boil Notice Trend" dataKey="boil_notice" data={data} />

      <hr style={{ margin: "30px 0" }} />

      <AlertChart title="Contamination Trend" dataKey="contamination" data={data} />

      <hr style={{ margin: "30px 0" }} />

      <AlertChart title="Outage Trend" dataKey="outage" data={data} />

    </div>
  );
}

export default HistoricalCharts;