import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BASE = "http://localhost:8000";

const CARDS = [
  {
    key:     "projects",
    label:   "Active Projects",
    url:     `${BASE}/collaborations?status=active`,
    icon:    "🤝",
    accent:  "linear-gradient(90deg, #0e74bd, #38bdf8)",
    iconBg:  "rgba(14,116,189,0.10)",
  },
  {
    key:     "reports",
    label:   "Reports in Area",
    url:     `${BASE}/reports?area=ngo_scope`,
    icon:    "📋",
    accent:  "linear-gradient(90deg, #0ea472, #34d399)",
    iconBg:  "rgba(14,164,114,0.10)",
  },
  {
    key:     "alerts",
    label:   "Active Alerts",
    url:     `${BASE}/alerts?location=ngo_location`,
    icon:    "🔔",
    accent:  "linear-gradient(90deg, #f59e0b, #fbbf24)",
    iconBg:  "rgba(245,158,11,0.10)",
  },
];

function SkeletonCard() {
  return (
    <div style={{
      background: "#fff", borderRadius: "12px",
      border: "1px solid #e2eaf4", padding: "16px 18px",
      boxShadow: "0 1px 6px rgba(14,116,189,0.06)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: "#f1f5f9", borderRadius: "12px 12px 0 0",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{
            height: "10px", width: "90px", background: "#f1f5f9",
            borderRadius: "5px", marginBottom: "12px",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
          <div style={{
            height: "32px", width: "60px", background: "#f1f5f9",
            borderRadius: "6px", animation: "pulse 1.5s ease-in-out infinite",
          }} />
        </div>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: "#f1f5f9", animation: "pulse 1.5s ease-in-out infinite",
        }} />
      </div>
    </div>
  );
}

export default function DashboardCards() {
  const [counts,  setCounts]  = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.allSettled(
      CARDS.map(c => fetch(c.url, { headers }).then(r => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      }))
    ).then(results => {
      if (cancelled) return;
      const next = {};
      results.forEach((res, i) => {
        const key = CARDS[i].key;
        if (res.status === "fulfilled") {
          const d = res.value;
          next[key] = Array.isArray(d) ? d.length : (d?.total ?? d?.count ?? 0);
        } else {
          next[key] = "—";
        }
      });
      setCounts(next);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
      {CARDS.map((card, i) =>
        loading ? (
          <SkeletonCard key={card.key} />
        ) : (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            style={{
              background: "#fff", borderRadius: "12px",
              border: "1px solid #e2eaf4", padding: "16px 18px",
              boxShadow: "0 1px 6px rgba(14,116,189,0.06)",
              position: "relative", overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "3px",
              background: card.accent, borderRadius: "12px 12px 0 0",
            }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: "10px",
                  color: "#94a3b8", fontWeight: 600, letterSpacing: "0.08em",
                  textTransform: "uppercase", marginBottom: "6px",
                }}>
                  {card.label}
                </div>
                <div style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "30px", color: "#0f172a", lineHeight: 1,
                }}>
                  {counts[card.key] ?? "—"}
                </div>
              </div>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: card.iconBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
              }}>
                {card.icon}
              </div>
            </div>
          </motion.div>
        )
      )}
    </div>
  );
}
