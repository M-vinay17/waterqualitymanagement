import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapContainer, TileLayer, Marker, Popup, useMap,
  LayersControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const { BaseLayer } = LayersControl;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const STATUS = {
  good:     { color: "#00e5a0", bg: "rgba(0,229,160,0.07)",  label: "GOOD"     },
  moderate: { color: "#f5a623", bg: "rgba(245,166,35,0.07)", label: "MODERATE" },
  poor:     { color: "#ff4757", bg: "rgba(255,71,87,0.07)",  label: "POOR"     },
  unknown:  { color: "#2d4a62", bg: "rgba(45,74,98,0.07)",   label: "UNKNOWN"  },
};

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar",
  "Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
  "Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
];

function deriveStatus(params = {}) {
  const ph  = params?.ph?.value;
  const do_ = params?.do?.value;
  const bod = params?.bod?.value;
  if (ph == null && do_ == null && bod == null) return "unknown";
  const phOk  = ph  == null || (ph >= 6.5 && ph <= 8.5);
  const doOk  = do_ == null || do_ >= 5;
  const bodOk = bod == null || bod <= 3;
  const score = [phOk, doOk, bodOk].filter(Boolean).length;
  if (score === 3) return "good";
  if (score === 2) return "moderate";
  return "poor";
}

function makeIcon(status) {
  const col = STATUS[status]?.color || "#2d4a62";
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="34" viewBox="0 0 26 34">
      <ellipse cx="13" cy="31" rx="5" ry="2" fill="rgba(0,0,0,0.3)"/>
      <path d="M13 1C7.48 1 3 5.48 3 11c0 7 10 21 10 21s10-14 10-21C23 5.48 18.52 1 13 1z"
            fill="${col}" stroke="rgba(0,0,0,0.4)" stroke-width="1"/>
      <circle cx="13" cy="11" r="4" fill="rgba(255,255,255,0.25)"/>
      <circle cx="13" cy="11" r="2" fill="rgba(255,255,255,0.5)"/>
    </svg>`);
  return L.icon({ iconUrl: `data:image/svg+xml,${svg}`, iconSize:[26,34], iconAnchor:[13,34], popupAnchor:[0,-34] });
}

function FlyTo({ station }) {
  const map = useMap();
  useEffect(() => {
    if (station?.latitude && station?.longitude)
      map.flyTo([station.latitude, station.longitude], 12, { duration: 1.2 });
  }, [station, map]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function StateSelector({ state, setState }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const filtered = INDIAN_STATES.filter(s => s.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", zIndex: 1000 }}>
      <div onClick={() => { setOpen(o => !o); setQuery(""); }} style={{
        background: "#0a1929", border: "1px solid #1e3a5a",
        color: state ? "#7eb8d4" : "#2d4a62", padding: "8px 14px",
        borderRadius: "6px", fontFamily: "'Space Mono', monospace",
        fontSize: "11px", cursor: "pointer", display: "flex",
        alignItems: "center", gap: "10px", minWidth: "190px",
        justifyContent: "space-between", userSelect: "none",
      }}>
        <span>{state || "SELECT STATE"}</span>
        <span style={{ color: "#2d4a62", fontSize: "9px" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          width: "230px", background: "#070f1c",
          border: "1px solid #1e3a5a", borderRadius: "8px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.9)", overflow: "hidden",
        }}>
          <div style={{ padding: "10px", borderBottom: "1px solid #0d1f35" }}>
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Type to search…"
              style={{
                width: "100%", boxSizing: "border-box", padding: "7px 10px",
                borderRadius: "5px", background: "#0a1929",
                border: "1px solid #1e3a5a", color: "#7eb8d4",
                fontFamily: "'Space Mono', monospace", fontSize: "11px", outline: "none",
              }}
            />
          </div>
          <div style={{ maxHeight: "280px", overflowY: "auto" }}>
            {filtered.length === 0
              ? <div style={{ padding: "12px 16px", color: "#2d4a62", fontFamily: "'Space Mono', monospace", fontSize: "10px" }}>NO MATCH</div>
              : filtered.map(s => (
                <div key={s} onClick={() => { setState(s); setOpen(false); setQuery(""); }}
                  style={{
                    padding: "9px 16px", cursor: "pointer",
                    fontFamily: "'Space Mono', monospace", fontSize: "11px",
                    color: s === state ? "#00c8ff" : "#7eb8d4",
                    background: s === state ? "rgba(0,200,255,0.06)" : "transparent",
                    borderLeft: `2px solid ${s === state ? "#00c8ff" : "transparent"}`,
                  }}
                  onMouseEnter={e => { if (s !== state) e.currentTarget.style.background = "rgba(0,200,255,0.04)"; }}
                  onMouseLeave={e => { if (s !== state) e.currentTarget.style.background = "transparent"; }}
                >{s}</div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

function ParamRow({ label, value, unit, highlight }) {
  if (value == null) return null;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "5px 0", borderBottom: "1px solid #0a1929",
    }}>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "8px", color: "#2d4a62", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: highlight || "#7eb8d4", fontWeight: 700 }}>
        {typeof value === "number" ? value.toFixed(2) : value}
        <span style={{ fontSize: "7px", color: "#1e3a5a", marginLeft: "3px" }}>{unit}</span>
      </span>
    </div>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{
      fontFamily: "'Space Mono', monospace", fontSize: "7px", color: "#00c8ff",
      letterSpacing: "0.2em", marginTop: "12px", marginBottom: "4px",
      display: "flex", alignItems: "center", gap: "6px",
    }}>
      <div style={{ flex: 1, height: "1px", background: "#0d1f35" }} />
      {text}
      <div style={{ flex: 1, height: "1px", background: "#0d1f35" }} />
    </div>
  );
}

function DetailPanel({ station, onClose }) {
  const status = deriveStatus(station.parameters);
  const st = STATUS[status];
  const p  = station.parameters || {};

  return (
    <motion.div
      key={station.external_id || station.name}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.18 }}
      style={{
        width: "310px", flexShrink: 0,
        background: "#070f1c", borderLeft: "1px solid #0d1f35",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #0d1f35", flexShrink: 0, background: "#070f1c" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div style={{ flex: 1, paddingRight: "8px" }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "19px", color: "#e8f4ff", letterSpacing: "0.04em", lineHeight: 1.1 }}>
              {station.name || "UNNAMED"}
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "7px", color: "#1e3a5a", marginTop: "3px", letterSpacing: "0.06em" }}>
              {station.external_id}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "#0a1929", border: "1px solid #1e3a5a",
            color: "#2d4a62", borderRadius: "4px", padding: "4px 9px",
            cursor: "pointer", fontSize: "10px", flexShrink: 0,
          }}>✕</button>
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "3px 10px", borderRadius: "4px",
          background: st.bg, border: `1px solid ${st.color}25`,
        }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: st.color, boxShadow: `0 0 6px ${st.color}` }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", color: st.color, letterSpacing: "0.1em" }}>{st.label}</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>

        {/* Meta */}
        <SectionLabel text="LOCATION" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", marginBottom: "2px" }}>
          {[
            ["STATE",    station.state      || "—"],
            ["DISTRICT", station.district   || "—"],
            ["BASIN",    station.river      || "—"],
            ["AGENCY",   station.managed_by || "—"],
            ["LAT",      station.latitude   ? `${Number(station.latitude).toFixed(3)}°N` : "—"],
            ["LNG",      station.longitude  ? `${Number(station.longitude).toFixed(3)}°E` : "—"],
            ["YEAR",     station.recorded_at ? station.recorded_at.slice(0,4) : "—"],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ padding: "7px 8px", background: "#0a1929", borderRadius: "4px", border: "1px solid #0d1f35" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "6px", color: "#1e3a5a", marginBottom: "3px", letterSpacing: "0.1em" }}>{lbl}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "#7eb8d4", fontWeight: 700, wordBreak: "break-word", lineHeight: 1.2 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Core */}
        <SectionLabel text="CORE QUALITY" />
        <ParamRow label="pH"            value={p.ph?.value}           unit={p.ph?.unit}           highlight={p.ph?.value != null && (p.ph.value<6.5||p.ph.value>8.5) ? "#ff4757" : "#00e5a0"} />
        <ParamRow label="Dissolved O₂"  value={p.do?.value}           unit={p.do?.unit}           highlight={p.do?.value != null && p.do.value<5 ? "#ff4757" : "#00e5a0"} />
        <ParamRow label="BOD"           value={p.bod?.value}          unit={p.bod?.unit}          highlight={p.bod?.value != null && p.bod.value>3 ? "#ff4757" : "#00e5a0"} />
        <ParamRow label="COD"           value={p.cod?.value}          unit={p.cod?.unit}          />
        <ParamRow label="DO Saturation" value={p.do_saturation?.value} unit={p.do_saturation?.unit} />
        <ParamRow label="Temperature"   value={p.temperature?.value}  unit={p.temperature?.unit}  />
        <ParamRow label="Turbidity"     value={p.turbidity?.value}    unit={p.turbidity?.unit}    />
        <ParamRow label="Secchi Depth"  value={p.secchi_depth?.value} unit={p.secchi_depth?.unit} />

        {/* Ions */}
        <SectionLabel text="IONS & SALTS" />
        <ParamRow label="Conductivity"  value={p.conductivity?.value} unit={p.conductivity?.unit} />
        <ParamRow label="TDS"           value={p.tds?.value}          unit={p.tds?.unit}          />
        <ParamRow label="Hardness"      value={p.hardness?.value}     unit={p.hardness?.unit}     />
        <ParamRow label="Alkalinity"    value={p.alkalinity?.value}   unit={p.alkalinity?.unit}   />
        <ParamRow label="Chloride"      value={p.chloride?.value}     unit={p.chloride?.unit}     />
        <ParamRow label="Sulphate"      value={p.sulphate?.value}     unit={p.sulphate?.unit}     />
        <ParamRow label="Calcium"       value={p.calcium?.value}      unit={p.calcium?.unit}      />
        <ParamRow label="Magnesium"     value={p.magnesium?.value}    unit={p.magnesium?.unit}    />
        <ParamRow label="Sodium"        value={p.sodium?.value}       unit={p.sodium?.unit}       />
        <ParamRow label="Potassium"     value={p.potassium?.value}    unit={p.potassium?.unit}    />
        <ParamRow label="Silica"        value={p.silica?.value}       unit={p.silica?.unit}       />

        {/* Nutrients */}
        <SectionLabel text="NUTRIENTS" />
        <ParamRow label="Nitrate"       value={p.nitrate?.value}      unit={p.nitrate?.unit}      />
        <ParamRow label="Nitrite"       value={p.nitrite?.value}      unit={p.nitrite?.unit}      />
        <ParamRow label="Ammonia"       value={p.ammonia?.value}      unit={p.ammonia?.unit}      />
        <ParamRow label="Phosphate"     value={p.phosphate?.value}    unit={p.phosphate?.unit}    />
        <ParamRow label="TOC"           value={p.toc?.value}          unit={p.toc?.unit}          />

        {/* Microbiological */}
        <SectionLabel text="MICROBIOLOGICAL" />
        <ParamRow label="Total Coliform" value={p.total_coliform?.value} unit={p.total_coliform?.unit} highlight={p.total_coliform?.value!=null&&p.total_coliform.value>50?"#ff4757":"#7eb8d4"} />
        <ParamRow label="Fecal Coliform" value={p.fecal_coliform?.value} unit={p.fecal_coliform?.unit} highlight={p.fecal_coliform?.value!=null&&p.fecal_coliform.value>0?"#f5a623":"#7eb8d4"} />

        {/* Heavy metals */}
        <SectionLabel text="HEAVY METALS" />
        <ParamRow label="Arsenic"   value={p.arsenic?.value}   unit={p.arsenic?.unit}   highlight={p.arsenic?.value!=null&&p.arsenic.value>0.01?"#ff4757":"#7eb8d4"} />
        <ParamRow label="Fluoride"  value={p.fluoride?.value}  unit={p.fluoride?.unit}  />
        <ParamRow label="Iron"      value={p.iron?.value}      unit={p.iron?.unit}      />
        <ParamRow label="Manganese" value={p.manganese?.value} unit={p.manganese?.unit} />
        <ParamRow label="Zinc"      value={p.zinc?.value}      unit={p.zinc?.unit}      />
        <ParamRow label="Copper"    value={p.copper?.value}    unit={p.copper?.unit}    />
        <ParamRow label="Lead"      value={p.lead?.value}      unit={p.lead?.unit}      highlight={p.lead?.value!=null&&p.lead.value>0.01?"#ff4757":"#7eb8d4"} />
        <ParamRow label="Chromium"  value={p.chromium?.value}  unit={p.chromium?.unit}  />
        <ParamRow label="Cadmium"   value={p.cadmium?.value}   unit={p.cadmium?.unit}   highlight={p.cadmium?.value!=null&&p.cadmium.value>0?"#ff4757":"#7eb8d4"} />
        <ParamRow label="Mercury"   value={p.mercury?.value}   unit={p.mercury?.unit}   highlight={p.mercury?.value!=null&&p.mercury.value>0?"#ff4757":"#7eb8d4"} />
        <ParamRow label="Nickel"    value={p.nickel?.value}    unit={p.nickel?.unit}    />
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function WaterStation() {
  const [stations, setStations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [state,    setState]    = useState("");

  useEffect(() => {
    if (!state) return;
    (async () => {
      setLoading(true); setError(null); setStations([]); setSelected(null);
      try {
        const res  = await fetch(`http://127.0.0.1:8000/water/india/readings?state=${encodeURIComponent(state)}&limit=100`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStations(data.readings || []);
      } catch (e) {
        setError("Backend connection failed.");
      } finally {
        setLoading(false);
      }
    })();
  }, [state]);

  const filtered = stations.filter(s => {
    const st = deriveStatus(s.parameters);
    const q  = search.toLowerCase();
    return (
      ((s.name||"").toLowerCase().includes(q) ||
       (s.district||"").toLowerCase().includes(q) ||
       (s.river||"").toLowerCase().includes(q)) &&
      (filter === "all" || st === filter)
    );
  });

  const mapCenter = selected?.latitude ? [selected.latitude, selected.longitude] : [20.5937, 78.9629];

  return (
    <div style={{ height: "100vh", background: "#040c16", fontFamily: "'Space Mono', monospace", color: "#7eb8d4", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        .leaflet-container { background: #040c16 !important; }
        .leaflet-tile { filter: brightness(0.55) saturate(0.35) hue-rotate(195deg); }
        .leaflet-popup-content-wrapper {
          background: #0a1929 !important; border: 1px solid #1e3a5a !important;
          border-radius: 6px !important; color: #7eb8d4 !important;
          font-family: 'Space Mono', monospace !important; font-size: 11px !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.9) !important;
        }
        .leaflet-popup-tip { background: #0a1929 !important; }
        .leaflet-control-layers {
          background: #0a1929 !important; border: 1px solid #1e3a5a !important;
          border-radius: 6px !important; color: #7eb8d4 !important;
          font-family: 'Space Mono', monospace !important; font-size: 10px !important;
        }
        .leaflet-control-layers label { color: #7eb8d4 !important; }
        .leaflet-control-layers-separator { border-color: #0d1f35 !important; }
        .leaflet-bar a { background: #0a1929 !important; border-color: #1e3a5a !important; color: #7eb8d4 !important; }
        .leaflet-bar a:hover { background: #0d1f35 !important; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #0d1f35; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "12px 22px", flexShrink: 0, borderBottom: "1px solid #0d1f35", background: "#070f1c", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <div style={{ width: "3px", height: "22px", background: "#00c8ff", borderRadius: "2px" }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "24px", color: "#e8f4ff", letterSpacing: "0.06em", lineHeight: 1 }}>
              WATER STATIONS
            </div>
            <div style={{ fontSize: "7px", color: "#1e3a5a", letterSpacing: "0.2em", marginTop: "2px" }}>
              AQUAWATCH · CPCB MONITORING NETWORK
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {state && !loading && (
            <div style={{ fontSize: "8px", color: "#1e3a5a", letterSpacing: "0.1em" }}>
              {stations.length} STATIONS LOADED
            </div>
          )}
          <StateSelector state={state} setState={s => { setState(s); setSelected(null); }} />
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left panel */}
        <div style={{ width: "280px", flexShrink: 0, background: "#070f1c", borderRight: "1px solid #0d1f35", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px", borderBottom: "1px solid #0d1f35", flexShrink: 0 }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search stations…"
              style={{
                width: "100%", boxSizing: "border-box", padding: "7px 11px",
                borderRadius: "5px", background: "#0a1929", border: "1px solid #0d1f35",
                color: "#7eb8d4", fontSize: "10px", fontFamily: "'Space Mono', monospace",
                outline: "none", marginBottom: "8px",
              }}
            />
            <div style={{ display: "flex", gap: "3px" }}>
              {["all","good","moderate","poor"].map(f => {
                const col = f === "all" ? "#00c8ff" : STATUS[f]?.color;
                const active = filter === f;
                return (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    flex: 1, padding: "5px 0", borderRadius: "4px", cursor: "pointer",
                    fontFamily: "'Space Mono', monospace", fontSize: "7px", letterSpacing: "0.08em",
                    border: `1px solid ${active ? col+"50" : "#0d1f35"}`,
                    background: active ? `${col}12` : "transparent",
                    color: active ? col : "#1e3a5a", transition: "all 0.15s",
                  }}>{f.toUpperCase()}</button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: "5px 12px", fontSize: "7px", color: "#1e3a5a", letterSpacing: "0.1em", borderBottom: "1px solid #0d1f35", flexShrink: 0 }}>
            {loading ? "LOADING…" : !state ? "SELECT A STATE" : `${filtered.length} / ${stations.length} STATIONS`}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "4px 6px" }}>
            {!state && (
              <div style={{ textAlign: "center", padding: "60px 16px", color: "#0d1f35", fontSize: "9px", lineHeight: 2.5 }}>
                ◈<br/>SELECT A STATE<br/>TO BEGIN
              </div>
            )}
            {loading && <div style={{ textAlign: "center", padding: "60px 0", color: "#1e3a5a", fontSize: "9px" }}>FETCHING DATA…</div>}
            {error   && <div style={{ textAlign: "center", padding: "30px 10px", color: "#ff4757", fontSize: "8px", lineHeight: 1.8 }}>{error}</div>}

            {!loading && !error && state && filtered.map((s, i) => {
              const status = deriveStatus(s.parameters);
              const st = STATUS[status];
              const isSel = selected?.external_id === s.external_id;
              return (
                <motion.div key={s.external_id || i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.012 }}
                  onClick={() => setSelected(isSel ? null : s)}
                  style={{
                    padding: "9px 10px", marginBottom: "2px", borderRadius: "5px",
                    cursor: "pointer",
                    border: `1px solid ${isSel ? "#1e3a5a" : "transparent"}`,
                    background: isSel ? "rgba(0,200,255,0.04)" : "transparent",
                    position: "relative", transition: "all 0.12s",
                  }}
                  whileHover={{ backgroundColor: "rgba(0,200,255,0.03)" }}
                >
                  {isSel && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "2px", background: "#00c8ff", borderRadius: "2px 0 0 2px" }} />}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, paddingRight: "6px" }}>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", fontWeight: 700, color: isSel ? "#e8f4ff" : "#7eb8d4", lineHeight: 1.3, marginBottom: "2px" }}>
                        {s.name || "Unnamed"}
                      </div>
                      {s.district && <div style={{ fontSize: "7px", color: "#1e3a5a", letterSpacing: "0.05em" }}>{s.district}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "3px", padding: "2px 6px", borderRadius: "3px", background: st.bg, flexShrink: 0 }}>
                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: st.color, boxShadow: `0 0 4px ${st.color}` }} />
                      <span style={{ fontSize: "6px", color: st.color, letterSpacing: "0.08em" }}>{st.label}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {!loading && !error && state && filtered.length === 0 && stations.length > 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#0d1f35", fontSize: "8px" }}>NO RESULTS</div>
            )}
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <MapContainer center={mapCenter} zoom={6} style={{ width: "100%", height: "100%" }}>
            <LayersControl position="topright">
              <BaseLayer checked name="Street Map">
                <TileLayer attribution="© OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              </BaseLayer>
              <BaseLayer name="Satellite">
                <TileLayer attribution="© Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              </BaseLayer>
              <BaseLayer name="Topographic">
                <TileLayer attribution="© OpenTopoMap" url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
              </BaseLayer>
            </LayersControl>
            <FlyTo station={selected} />
            {stations.map((s, i) => {
              if (!s.latitude || !s.longitude) return null;
              const status = deriveStatus(s.parameters);
              return (
                <Marker key={s.external_id||i} position={[s.latitude,s.longitude]} icon={makeIcon(status)} eventHandlers={{ click: () => setSelected(s) }}>
                  <Popup>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "15px", color: "#e8f4ff", marginBottom: "3px" }}>{s.name||"Station"}</div>
                      {s.district && <div style={{ fontSize: "9px", color: "#2d4a62", marginBottom: "3px" }}>{s.district}</div>}
                      <div style={{ fontSize: "9px", color: STATUS[status].color }}>● {STATUS[status].label}</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Detail panel — outside map, no overlap */}
        <AnimatePresence>
          {selected && (
            <DetailPanel
              key={selected.external_id || selected.name}
              station={selected}
              onClose={() => setSelected(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}