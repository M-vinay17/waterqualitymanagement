import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer
} from "recharts";

export default function WaterQualityOverview() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/v1/stations/readings/aggregate?days=30")
      .then(res => res.json())
      .then(d => {
        console.log("Chart API:", d);

        if (!d || d.length === 0) {
          setData(generate30DaysMock());
        } else {
          const formatted = d.map(item => ({
            date: new Date(item.date).toLocaleDateString(),
            ph: item.ph_avg,
            turbidity: item.turbidity_avg,
            DO: item.do_avg,
            lead: item.lead_avg,
            arsenic: item.arsenic_avg
          }));

          setData(formatted);
        }
      })
      .catch(() => {
        setData(generate30DaysMock());
      });
  }, []);

  // ✅ MOCK DATA (CLEAN VALUES)
  function generate30DaysMock() {
    const days = [];

    for (let i = 1; i <= 30; i++) {
      days.push({
        date: `Day${i}`,
        ph: +(6.5 + Math.random() * 2).toFixed(2),
        turbidity: +(2 + Math.random() * 3).toFixed(2),
        DO: +(5 + Math.random() * 2).toFixed(2),
        lead: +(Math.random() * 0.01).toFixed(4),
        arsenic: +(Math.random() * 0.01).toFixed(4)
      });
    }

    return days;
  }

  const renderChart = (key, threshold) => {
    const titles = {
      ph: "pH Level",
      turbidity: "Turbidity (NTU)",
      DO: "Dissolved Oxygen (mg/L)",
      lead: "Lead (mg/L)",
      arsenic: "Arsenic (mg/L)"
    };

    const units = {
      ph: "",
      turbidity: " NTU",
      DO: " mg/L",
      lead: " mg/L",
      arsenic: " mg/L"
    };

    return (
      <div className="bg-white/10 backdrop-blur p-3 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-2 text-white">{titles[key]}</h3>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              
              {/* ✅ SOFT GRID */}
              <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.2} />

              {/* ✅ AXIS FIX */}
              <XAxis dataKey="date" interval={4} stroke="#ffffff" />
              <YAxis stroke="#f1f5f9" />

              {/* ✅ TOOLTIP */}
              <Tooltip
                formatter={(value) => `${value}${units[key]}`}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff"
                }}
              />

              {/* ✅ LINE COLORS */}
              <Line
                type="monotone"
                dataKey={key}
                stroke={
                  {
                    ph: "#ffffff",
                    turbidity: "#90cdf4",
                    DO: "#68d391",
                    lead: "#f6ad55",
                    arsenic: "#fc8181"
                  }[key]
                }
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
              />

              {/* ✅ CLEAN LABEL POSITION */}
              {key === "ph" ? (
                <>
                  <ReferenceLine
                    y={6.5}
                    stroke="#ffd166"
                    label={{ value: "Min", position: "right", fill: "#ffd166" }}
                  />
                  <ReferenceLine
                    y={8.5}
                    stroke="#ffd166"
                    label={{ value: "Max", position: "right", fill: "#ffd166" }}
                  />
                </>
              ) : (
                <ReferenceLine
                  y={threshold}
                  stroke="#ffd166"
                  label={{ value: "Limit", position: "right", fill: "#ffd166" }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // ✅ LOADING STATE (BONUS)
  if (data.length === 0) {
    return <p className="text-white p-4">Loading charts...</p>;
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-semibold mb-4 text-white">
        Water Quality Overview
      </h2>

      {renderChart("ph", 8.5)}
      {renderChart("turbidity", 4)}
      {renderChart("DO", 6)}
      {renderChart("lead", 0.01)}
      {renderChart("arsenic", 0.01)}
    </div>
  );
}