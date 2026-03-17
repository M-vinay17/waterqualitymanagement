import React, { useState } from "react";
import "./alertStyles.css";

function AlertFlashCard({ alert }) {
  const [flip, setFlip] = useState(false);

  return (
    <div
      className={`flash-card ${flip ? "flipped" : ""}`}
      onClick={() => setFlip(!flip)}
    >
      <div className="flash-inner">

        {/* FRONT */}
        <div className={`flash-front ${alert.severity}`}>

          <div className="card-glow"></div>

          <h3>{alert.station}</h3>
          <p className="param">{alert.parameter}</p>

          <div className="alert-value">{alert.value}</div>

          <span className="alert-severity">
            {alert.severity.toUpperCase()}
          </span>

          <p className="hint">Click for details</p>

        </div>

        {/* BACK */}
        <div className="flash-back">

          <h4>Alert Details</h4>

          <p className="desc">{alert.description}</p>

          <div className="meta">
            <p><b>Status:</b> {alert.status}</p>
            <p><b>Time:</b> {alert.time}</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AlertFlashCard;
