import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const BASE = "http://localhost:8000";

/**
 * Creates a blue teardrop divIcon — matching your existing station markers
 * but in a distinct teal/blue so NGO stations are visually separate.
 */
function makeBlueIcon(L) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:26px; height:26px;
      background: linear-gradient(135deg,#0e74bd,#38bdf8);
      border: 2.5px solid #fff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 10px rgba(14,116,189,0.45);
    "></div>`,
    iconSize:   [26, 26],
    iconAnchor: [13, 26],
    popupAnchor:[0, -28],
  });
}

function buildLoadingPopup(station) {
  return `
    <div style="font-family:'DM Sans',sans-serif;min-width:190px;padding:4px 0">
      <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:3px">
        ${station.name || "NGO Station"}
      </div>
      <div style="font-size:11px;color:#64748b;margin-bottom:8px">
        Managed by: <strong>${station.managed_by || "NGO"}</strong>
      </div>
      <div id="readings-${station.id}" style="font-size:11px;color:#94a3b8;font-style:italic">
        Loading readings…
      </div>
    </div>`;
}

function buildReadingsHtml(readings) {
  if (!readings?.length) {
    return `<em style="color:#94a3b8;font-size:11px">No readings available</em>`;
  }
  return readings.map(r => `
    <div style="
      display:flex; justify-content:space-between; align-items:center;
      padding:4px 0; border-bottom:1px solid #f1f5f9;
      font-family:'DM Sans',sans-serif;
    ">
      <span style="font-size:11px;color:#64748b">${r.parameter ?? r.name ?? "Value"}</span>
      <span style="font-size:11px;font-weight:700;color:#0e74bd;font-family:monospace">
        ${r.value} ${r.unit ?? ""}
      </span>
    </div>
  `).join("");
}

/**
 * NgoStationsLayer
 *
 * Attaches a toggleable layer to the EXISTING Leaflet map instance.
 * Do NOT create a new map — pass the existing one via props.
 *
 * Props:
 *   map      {L.Map}   — existing Leaflet map instance (from your WaterMap ref/context)
 *   stations {array}   — [{ id, name, managed_by, lat, lng }]
 */
export default function NgoStationsLayer({ map, stations = [] }) {
  const [visible, setVisible] = useState(true);
  const groupRef = useRef(null);

  useEffect(() => {
    // Leaflet is already loaded globally by your existing map setup
    const L = window.L;
    if (!map || !L) return;

    const icon  = makeBlueIcon(L);
    const group = L.layerGroup();

    stations.forEach(station => {
      const marker = L.marker([station.lat, station.lng], { icon })
        .bindPopup(buildLoadingPopup(station), {
          maxWidth: 240,
          className: "ngo-popup",
        });

      marker.on("popupopen", async () => {
        const el = document.getElementById(`readings-${station.id}`);
        try {
          const token = localStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const res = await fetch(
            `${BASE}/stations/${station.id}/readings?limit=3`,
            { headers }
          );
          if (!res.ok) throw new Error(res.status);
          const data = await res.json();
          if (el) el.innerHTML = buildReadingsHtml(data?.data ?? data);
        } catch {
          if (el) el.innerHTML = `<em style="color:#dc2626;font-size:11px">Failed to load readings</em>`;
        }
      });

      group.addLayer(marker);
    });

    groupRef.current = group;
    if (visible) group.addTo(map);

    return () => { group.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, stations]);

  // Toggle without re-mounting
  useEffect(() => {
    const L = window.L;
    if (!map || !L || !groupRef.current) return;
    if (visible) groupRef.current.addTo(map);
    else         groupRef.current.remove();
  }, [visible, map]);

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => setVisible(v => !v)}
      style={{
        display: "inline-flex", alignItems: "center", gap: "7px",
        padding: "7px 14px", borderRadius: "8px",
        border: `1px solid ${visible ? "rgba(14,116,189,0.3)" : "#e2eaf4"}`,
        background: visible ? "rgba(14,116,189,0.08)" : "#fff",
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "12px", fontWeight: 600,
        color: visible ? "#0e74bd" : "#64748b",
        transition: "all 0.15s",
        boxShadow: "0 1px 4px rgba(14,116,189,0.07)",
      }}
    >
      <span style={{
        width: "8px", height: "8px", borderRadius: "50%",
        background: visible ? "#0e74bd" : "#cbd5e1",
        boxShadow: visible ? "0 0 6px rgba(14,116,189,0.5)" : "none",
        flexShrink: 0,
        transition: "all 0.15s",
      }} />
      NGO Stations
      <span style={{ fontSize: "10px", opacity: 0.7 }}>
        {visible ? "●" : "○"}
      </span>
    </motion.button>
  );
}
