import React from "react";
import AlertFlashGrid from "../components/alerts/AlertFlashGrid";
import AlertTable from "../components/alerts/AlertTable";
import alerts from "../utils/mockAlerts";
import "../components/alerts/alertStyles.css";

export default function Alerts() {
  return (
    <div className="alerts-page">

      <h2 className="alerts-title">🚨 Active Water Alerts</h2>

      <AlertFlashGrid alerts={alerts} />

      <h3 className="alerts-log">Alert Log</h3>

      <AlertTable alerts={alerts} />

    </div>
  );
}
