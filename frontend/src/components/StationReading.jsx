import React from "react";

export default function StationReading({ station, ph, turbidity, color }) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        borderTop: `6px solid ${color}`,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
      }}
    >
      <h3>{station}</h3>
      <p>pH Level: {ph}</p>
      <p>Turbidity: {turbidity}</p>
    </div>
  );
}