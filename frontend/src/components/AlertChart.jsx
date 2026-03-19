import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";

function AlertChart({ title, dataKey, data }) {
  const navigate = useNavigate();

  // ✅ Extract values for min/max
  const values = data.map(d => d[dataKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  // ✅ Handle no data case
  if (data.every(d => d[dataKey] === 0)) {
    return (
      <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "25px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
      }}>
        <h3>{title}</h3>
        <p>No alerts recorded for this category</p>
      </div>
    );
  }

  // ✅ Dynamic color based on alert type
  const getColor = () => {
    if (dataKey === "boil_notice") return "#ff7300";     // orange
    if (dataKey === "contamination") return "#ff0000";   // red
    if (dataKey === "outage") return "#8884d8";          // purple
    return "#007bff";                                   // default blue
  };

  return (
    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      marginBottom: "25px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      <h3>{title}</h3>

      {/* 📊 Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />

          {/* ✅ Tooltip improved */}
          <Tooltip formatter={(value) => `${value} alerts`} />

          {/* ✅ Clickable line */}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={getColor()}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{
              r: 6,
              onClick: () => {
                navigate("/alerts/1"); // demo navigation
              }
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* ✅ Min / Max */}
      <div style={{ marginTop: "10px" }}>
        <p><b>Min:</b> {min}</p>
        <p><b>Max:</b> {max}</p>
      </div>
    </div>
  );
}

export default AlertChart;