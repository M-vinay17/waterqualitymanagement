import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Fix Leaflet default icon ─────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  good:     { color: "#00e5a0", bg: "rgba(0,229,160,0.1)",  label: "GOOD"     },
  moderate: { color: "#f5a623", bg: "rgba(245,166,35,0.1)", label: "MODERATE" },
  poor:     { color: "#ff4757", bg: "rgba(255,71,87,0.1)",  label: "POOR"     },
  unknown:  { color: "#667788", bg: "rgba(100,120,140,0.1)",label: "UNKNOWN"  },
};

// ─── All 28 Indian States ─────────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

// ─── Derive status from parameters ───────────────────────────────────────────
function deriveStatus(params = {}) {
  const ph  = params?.ph?.value;
  const do_ = params?.do?.value;
  const bod = params?.bod?.value;
  if (ph == null && do_ == null && bod == null) return "unknown";
  const phOk  = ph  == null || (ph  >= 6.5 && ph  <= 8.5);
  const doOk  = do_ == null || do_  >= 5;
  const bodOk = bod == null || bod  <= 3;
  const score = [phOk, doOk, bodOk].filter(Boolean).length;
  if (score === 3) return "good";
  if (score === 2) return "moderate";
  return "poor";
}

// ─── Custom Leaflet icon per status ──────────────────────────────────────────
function makeIcon(status) {
  const col = STATUS[status]?.color || "#667788";
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <ellipse cx="14" cy="33" rx="6" ry="2.5" fill="rgba(0,0,0,0.25)"/>
      <path d="M14 2C8.48 2 4 6.48 4 12c0 7.5 10 22 10 22s10-14.5 10-22c0-5.52-4.48-10-10-10z"
            fill="${col}" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
      <circle cx="14" cy="12" r="4" fill="rgba(255,255,255,0.35)"/>
    </svg>`);
  return L.icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

// ─── Map fly-to helper ────────────────────────────────────────────────────────
function FlyTo({ station }) {
  const map = useMap();
  useEffect(() => {
    if (station?.latitude && station?.longitude) {
      map.flyTo([station.latitude, station.longitude], 12, { duration: 1.2 });
    }
  }, [station]);
  return null;
}

// ─── Param row ────────────────────────────────────────────────────────────────
function ParamRow({ label, value, unit }) {
  if (value == null) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#667788", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "12px", color: "#aac8e0", fontWeight: 700 }}>
        {value} <span style={{ fontSize: "9px", color: "#445566" }}>{unit}</span>
      </span>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function DetailPanel({ station, onClose }) {
  const status = deriveStatus(station.parameters);
  const st     = STATUS[status];
  const params = station.parameters || {};

  return (
    <motion.div
      key={station.external_id || station.name}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.22 }}
      style={{
        position: "absolute", top: 0, right: 0, bottom: 0,
        width: "300px", zIndex: 10,
        background: "linear-gradient(160deg, #07131f 0%, #0a1c2e 100%)",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, paddingRight: "8px" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "17px", fontWeight: 700, color: "#e8f4ff", lineHeight: 1.2 }}>
              {station.name || "Unnamed Station"}
            </div>
            {station.external_id && (
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#00b4ff", marginTop: "3px" }}>
                {station.external_id}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#8899aa", borderRadius: "4px", padding: "3px 9px",
            cursor: "pointer", fontSize: "12px", flexShrink: 0,
          }}>✕</button>
        </div>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "4px 10px", borderRadius: "4px", marginTop: "10px",
          background: st.bg, border: `1px solid ${st.color}44`,
        }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: st.color, boxShadow: `0 0 5px ${st.color}` }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", color: st.color, letterSpacing: "0.1em", fontWeight: 600 }}>
            {st.label}
          </span>
        </div>
      </div>

      {/* Location */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#00b4ff", letterSpacing: "0.12em", marginBottom: "10px" }}>
          ◈ LOCATION
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            ["MANAGED BY", station.managed_by || "CPCB India"],
            ["DISTRICT",   station.district   || "—"],
            ["RIVER",      station.river       || "—"],
            ["RECORDED",   station.recorded_at ? station.recorded_at.slice(0, 10) : "—"],
            ["LAT",        station.latitude    ? `${Number(station.latitude).toFixed(4)}° N` : "—"],
            ["LNG",        station.longitude   ? `${Number(station.longitude).toFixed(4)}° E` : "—"],
          ].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "8px", color: "#334455", marginBottom: "2px" }}>{label}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", color: "#aac8e0", fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Parameters */}
      <div style={{ padding: "14px 20px", flex: 1 }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#00b4ff", letterSpacing: "0.12em", marginBottom: "10px" }}>
          ◈ WATER QUALITY PARAMETERS
        </div>
        {Object.keys(params).length === 0 ? (
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", color: "#334455", textAlign: "center", padding: "20px 0" }}>
            NO PARAMETER DATA
          </div>
        ) : (
          <>
            <ParamRow label="pH"             value={params.ph?.value}             unit={params.ph?.unit}             />
            <ParamRow label="DO"             value={params.do?.value}             unit={params.do?.unit}             />
            <ParamRow label="BOD"            value={params.bod?.value}            unit={params.bod?.unit}            />
            <ParamRow label="CONDUCTIVITY"   value={params.conductivity?.value}   unit={params.conductivity?.unit}   />
            <ParamRow label="NITRATE"        value={params.nitrate?.value}        unit={params.nitrate?.unit}        />
            <ParamRow label="TURBIDITY"      value={params.turbidity?.value}      unit={params.turbidity?.unit}      />
            <ParamRow label="TOTAL COLIFORM" value={params.total_coliform?.value} unit={params.total_coliform?.unit} />
            <ParamRow label="ARSENIC"        value={params.arsenic?.value}        unit={params.arsenic?.unit}        />
            <ParamRow label="FLUORIDE"       value={params.fluoride?.value}       unit={params.fluoride?.unit}       />
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WaterStation() {
  const [stations, setStations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [state,    setState]    = useState("Andhra Pradesh");

  // ── Fetch readings from API ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchReadings = async () => {
      setLoading(true);
      setError(null);
      setStations([]);
      try {
        const url = `http://127.0.0.1:8000/water/india/readings?state=${encodeURIComponent(state)}&limit=100`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStations(data.readings || []);
      } catch (err) {
        setError("Failed to load readings. Is the backend running?");
        console.error("[WaterStation] fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReadings();
  }, [state]);

  // ── Filter + search ─────────────────────────────────────────────────────────
  const filtered = stations.filter(s => {
    const status = deriveStatus(s.parameters);
    const matchSearch =
      (s.name        || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.district    || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.river       || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.external_id || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || status === filter;
    return matchSearch && matchFilter;
  });

  const mapCenter = selected?.latitude
    ? [selected.latitude, selected.longitude]
    : [20.5937, 78.9629]; // India center

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #050d1a 0%, #0a1628 60%, #060e1c 100%)",
      fontFamily: "'Barlow Condensed', sans-serif",
      color: "#c0d8f0",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Share+Tech+Mono&display=swap');
        .leaflet-container { background: #060e1c !important; }
        .leaflet-tile { filter: brightness(0.75) saturate(0.6) hue-rotate(180deg); }
        .leaflet-popup-content-wrapper {
          background: #0a1c2e !important; border: 1px solid rgba(0,180,255,0.2) !important;
          border-radius: 6px !important; color: #aac8e0 !important;
          font-family: 'Share Tech Mono', monospace; font-size: 11px;
        }
        .leaflet-popup-tip { background: #0a1c2e !important; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,180,255,0.2); border-radius: 2px; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "3px", height: "26px", background: "linear-gradient(180deg, #00b4ff, #0044cc)" }} />
            <div>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700, letterSpacing: "0.06em", color: "#e8f4ff" }}>
                WATER STATIONS
              </h1>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#334455", letterSpacing: "0.12em" }}>
                AQUAWATCH · CPCB MONITORING NETWORK
              </div>
            </div>
          </div>

          {/* State selector — all 28 Indian states */}
          <select
            value={state}
            onChange={e => { setState(e.target.value); setSelected(null); }}
            style={{
              background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,180,255,0.2)",
              color: "#aac8e0", padding: "6px 12px", borderRadius: "4px",
              fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", cursor: "pointer",
            }}
          >
            {INDIAN_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Body: Map + List ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left: List panel */}
        <div style={{
          width: "300px", flexShrink: 0,
          background: "rgba(8,20,38,0.85)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Search + filter */}
          <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, district, ID…"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "7px 10px", borderRadius: "4px",
                background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.07)",
                color: "#c0d8f0", fontSize: "12px",
                fontFamily: "'Share Tech Mono', monospace",
                outline: "none", marginBottom: "8px",
              }}
            />
            <div style={{ display: "flex", gap: "5px" }}>
              {["all", "good", "moderate", "poor"].map(f => {
                const col = f === "all" ? "#00b4ff" : STATUS[f]?.color;
                const active = filter === f;
                return (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    flex: 1, padding: "4px 0", borderRadius: "3px", cursor: "pointer",
                    fontFamily: "'Share Tech Mono', monospace", fontSize: "8px", letterSpacing: "0.08em",
                    border: `1px solid ${active ? col : "rgba(255,255,255,0.06)"}`,
                    background: active ? `${col}18` : "transparent",
                    color: active ? col : "#334455",
                  }}>
                    {f.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Count */}
          <div style={{ padding: "6px 12px", fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#334455", letterSpacing: "0.08em" }}>
            {loading ? "LOADING…" : `${filtered.length} READING${filtered.length !== 1 ? "S" : ""}`}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 12px" }}>
            {loading && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#334455", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px" }}>
                FETCHING DATA…
              </div>
            )}
            {error && (
              <div style={{ textAlign: "center", padding: "30px 10px", color: "#ff4757", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", lineHeight: 1.6 }}>
                {error}
              </div>
            )}
            {!loading && !error && filtered.map((s, i) => {
              const status = deriveStatus(s.parameters);
              const st = STATUS[status];
              const isSelected = selected?.external_id === s.external_id;
              return (
                <motion.div
                  key={s.external_id || i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => setSelected(isSelected ? null : s)}
                  whileHover={{ x: 3 }}
                  style={{
                    padding: "10px 12px", marginBottom: "6px", borderRadius: "5px",
                    cursor: "pointer",
                    border: `1px solid ${isSelected ? "rgba(0,180,255,0.35)" : "rgba(255,255,255,0.04)"}`,
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(0,180,255,0.08), rgba(0,80,160,0.06))"
                      : "rgba(255,255,255,0.02)",
                    position: "relative", overflow: "hidden",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                >
                  {isSelected && (
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: "linear-gradient(180deg, #00b4ff, #0066cc)" }} />
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, paddingRight: "6px" }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 600, color: "#d0e4f7", lineHeight: 1.2 }}>
                        {s.name || "Unnamed Station"}
                      </div>
                      {s.district && (
                        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "9px", color: "#445566", marginTop: "2px" }}>
                          {s.district}
                        </div>
                      )}
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      padding: "2px 7px", borderRadius: "3px", flexShrink: 0,
                      background: st.bg, border: `1px solid ${st.color}33`,
                    }}>
                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: st.color }} />
                      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "8px", color: st.color, letterSpacing: "0.08em" }}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {!loading && !error && filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#334455", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px" }}>
                NO READINGS FOUND
              </div>
            )}
          </div>
        </div>

        {/* Right: Map + Detail panel */}
        <div style={{ flex: 1, position: "relative" }}>
          <MapContainer
            center={mapCenter}
            zoom={6}
            style={{ width: "100%", height: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <FlyTo station={selected} />
            {stations.map((s, i) => {
              if (!s.latitude || !s.longitude) return null;
              const status = deriveStatus(s.parameters);
              return (
                <Marker
                  key={s.external_id || i}
                  position={[s.latitude, s.longitude]}
                  icon={makeIcon(status)}
                  eventHandlers={{ click: () => setSelected(s) }}
                >
                  <Popup>
                    <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", color: "#aac8e0" }}>
                      <strong style={{ color: "#e8f4ff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px" }}>
                        {s.name || "Station"}
                      </strong><br />
                      {s.district && <>{s.district}<br /></>}
                      <span style={{ color: STATUS[status].color }}>{STATUS[status].label}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Detail panel overlay */}
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
    </div>
  );
}