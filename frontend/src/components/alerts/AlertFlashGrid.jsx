import React from "react";
import AlertFlashCard from "./AlertFlashCard";

function AlertFlashGrid({ alerts }) {
  return (
    <div className="flash-grid">
      {alerts.map((alert) => (
        <AlertFlashCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
}

export default AlertFlashGrid;
