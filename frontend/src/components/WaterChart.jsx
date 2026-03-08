import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const WaterChart = ({ data }) => {
  return (
    <div style={{
      width: "100%",
      height: "300px",
      background: "white",
      borderRadius: "10px",
      padding: "20px",
      marginTop: "20px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      <h3 style={{ marginBottom: "10px" }}>
        Water Quality Trend (Last 7 Days)
      </h3>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="quality"
            stroke="#0ea5e9"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WaterChart;