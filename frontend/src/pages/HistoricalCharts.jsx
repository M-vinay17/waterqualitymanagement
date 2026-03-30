import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

// ── Theme ─────────────────────────────────────────────────────────────────────
const THEME = {
  boil_notice:   { color: "#f5a623", bg: "rgba(245,166,35,0.08)",  label: "Boil Notice"   },
  contamination: { color: "#ff4757", bg: "rgba(255,71,87,0.08)",   label: "Contamination" },
  outage:        { color: "#00b4ff", bg: "rgba(0,180,255,0.08)",   label: "Outage"        },
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, color }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0d1f33", border: `1px solid ${color}44`,
      borderRadius: "8px", padding: "10px 14px",
      boxShadow: `0 4px 20px ${color}22`,
    }}>
      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#667788", marginBottom: "4px", letterSpacing: "0.1em" }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 700, color }}>
        {payload[0]?.value}
        <span style={{ fontSize: "11px", color: "#667788", marginLeft: "4px" }}>alerts</span>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, bg, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      style={{
        flex: 1, padding: "16px 20px", borderRadius: "8px",
        background: bg, border: `1px solid ${color}33`,
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#667788", letterSpacing: "0.14em", marginBottom: "8px" }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "34px", fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: `${color}88`, marginTop: "4px" }}>
        total this year
      </div>
      <div style={{
        position: "absolute", top: "14px", right: "14px",
        width: "8px", height: "8px", borderRadius: "50%",
        background: color, boxShadow: `0 0 8px ${color}`,
      }} />
    </motion.div>
  );
}

// ── Chart Panel ───────────────────────────────────────────────────────────────
function ChartPanel({ dataKey, data, color, bg, index, chartType }) {
  const { label } = THEME[dataKey];
  const total = data.reduce((s, d) => s + (d[dataKey] || 0), 0);
  const peak  = Math.max(...data.map(d => d[dataKey] || 0));

  const tooltipWithColor = (props) => <CustomTooltip {...props} color={color} />;

  const commonProps = {
    data,
    margin: { top: 4, right: 8, left: -20, bottom: 0 },
  };

  const axisProps = {
    tick: { fontFamily: "'Share Tech Mono', monospace", fontSize: 10, fill: "#445566" },
    axisLine: false,
    tickLine: false,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 + 0.2, duration: 0.5 }}
      style={{
        background: "rgba(8,20,38,0.8)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "10px", overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      <div style={{ height: "3px", background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div style={{
        padding: "16px 24px 12px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 700, color: "#e8f4ff", letterSpacing: "0.04em" }}>
            {label} Trend
          </div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#445566", letterSpacing: "0.12em", marginTop: "2px" }}>
            MONTHLY DISTRIBUTION · {new Date().getFullYear()}
          </div>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          {[["TOTAL", total], ["PEAK", peak]].map(([l, v]) => (
            <div key={l} style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "8px", color: "#445566", letterSpacing: "0.12em" }}>{l}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "24px", fontWeight: 700, color, lineHeight: 1 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 16px 16px" }}>
        <ResponsiveContainer width="100%" height={200}>
          {chartType === "bar" ? (
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} allowDecimals={false} />
              <Tooltip content={tooltipWithColor} />
              <Bar dataKey={dataKey} fill={color} fillOpacity={0.8} radius={[4,4,0,0]} />
            </BarChart>
          ) : chartType === "line" ? (
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} allowDecimals={false} />
              <Tooltip content={tooltipWithColor} />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5}
                dot={{ fill: color, r: 4, strokeWidth: 0 }}
                activeDot={{ fill: color, r: 6, filter: `drop-shadow(0 0 5px ${color})` }} />
            </LineChart>
          ) : (
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} allowDecimals={false} />
              <Tooltip content={tooltipWithColor} />
              <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
                fill={`url(#g-${dataKey})`}
                dot={{ fill: color, r: 3, strokeWidth: 0 }}
                activeDot={{ fill: color, r: 5, filter: `drop-shadow(0 0 4px ${color})` }} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HistoricalCharts() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [view,    setView]    = useState("area");

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    setLoading(true); setError(null);
    try {
      const res    = await api.get("/alerts");
      const alerts = res.data;
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const formatted = months.map((month, i) => {
        const ma = alerts.filter(a => new Date(a.issued_at).getMonth() === i);
        return {
          month,
          boil_notice:   ma.filter(a => a.type === "boil_notice").length,
          contamination: ma.filter(a => a.type === "contamination").length,
          outage:        ma.filter(a => a.type === "outage").length,
        };
      });
      const active = formatted.filter(m => m.boil_notice + m.contamination + m.outage > 0);
      setData(active.length > 0 ? active : formatted.slice(0, 6));
    } catch (err) {
      console.error("[HistoricalCharts]", err);
      setError("Failed to load alert data.");
    } finally {
      setLoading(false);
    }
  };

  const total = (key) => data.reduce((s, d) => s + (d[key] || 0), 0);

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          style={{ width: "32px", height: "32px", border: "2px solid #1a3050", borderTop: "2px solid #00b4ff", borderRadius: "50%", margin: "0 auto 14px" }}
        />
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#445566", letterSpacing: "0.14em" }}>
          LOADING ALERT DATA…
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "32px", background: "rgba(255,71,87,0.06)", border: "1px solid rgba(255,71,87,0.2)", borderRadius: "10px" }}>
        <div style={{ fontSize: "28px", marginBottom: "10px" }}>⚠</div>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", color: "#ff4757", marginBottom: "14px" }}>{error}</div>
        <button onClick={fetchAlerts} style={{
          padding: "7px 18px", borderRadius: "5px", cursor: "pointer",
          background: "transparent", border: "1px solid #ff4757",
          color: "#ff4757", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", letterSpacing: "0.08em",
        }}>RETRY</button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #050d1a 0%, #0a1628 60%, #060e1c 100%)",
      padding: "28px 32px",
      fontFamily: "'Barlow Condensed', sans-serif",
      color: "#c0d8f0",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Share+Tech+Mono&display=swap');`}</style>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "3px", height: "28px", background: "linear-gradient(180deg, #00b4ff, #0044cc)" }} />
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 700, color: "#e8f4ff", letterSpacing: "0.05em" }}>
              HISTORICAL ALERTS
            </h1>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#334455", letterSpacing: "0.14em", marginTop: "2px" }}>
              AQUAWATCH · MONTHLY TREND ANALYSIS
            </div>
          </div>
        </div>

        {/* Chart type toggle */}
        <div style={{ display: "flex", gap: "6px" }}>
          {[["area","AREA"], ["bar","BAR"], ["line","LINE"]].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "6px 14px", borderRadius: "4px", cursor: "pointer",
              fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", letterSpacing: "0.1em",
              border: `1px solid ${view === v ? "#00b4ff" : "rgba(255,255,255,0.08)"}`,
              background: view === v ? "rgba(0,180,255,0.12)" : "transparent",
              color: view === v ? "#00b4ff" : "#445566",
              transition: "all 0.15s",
            }}>{l}</button>
          ))}
        </div>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "28px" }}>
        <StatCard index={0} label="Boil Notice"   value={total("boil_notice")}   color="#f5a623" bg="rgba(245,166,35,0.08)" />
        <StatCard index={1} label="Contamination" value={total("contamination")} color="#ff4757" bg="rgba(255,71,87,0.08)"  />
        <StatCard index={2} label="Outage"        value={total("outage")}        color="#00b4ff" bg="rgba(0,180,255,0.08)"  />
        <StatCard index={3} label="Total Alerts"
          value={total("boil_notice") + total("contamination") + total("outage")}
          color="#00e5a0" bg="rgba(0,229,160,0.08)"
        />
      </div>

      {/* Charts */}
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <ChartPanel index={0} dataKey="boil_notice"   data={data} color="#f5a623" bg="rgba(245,166,35,0.08)" chartType={view} />
          <ChartPanel index={1} dataKey="contamination" data={data} color="#ff4757" bg="rgba(255,71,87,0.08)"  chartType={view} />
          <ChartPanel index={2} dataKey="outage"        data={data} color="#00b4ff" bg="rgba(0,180,255,0.08)"  chartType={view} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}