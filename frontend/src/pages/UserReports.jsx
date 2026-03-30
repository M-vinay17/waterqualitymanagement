import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api"; // ✅ shared instance — JWT auto-attached

const API = "http://localhost:8000";

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:  { color: "#b45309", bg: "#fef3c7", border: "#fcd34d", dot: "#f59e0b", label: "Pending Review" },
  verified: { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", dot: "#10b981", label: "Verified"       },
  rejected: { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5", dot: "#ef4444", label: "Rejected"       },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Map Location Picker Modal ──────────────────────────────────────────────────
function MapPickerModal({ onConfirm, onClose, initialCoords }) {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  const [pickedCoords, setPickedCoords] = useState(initialCoords || null);
  const [reverseLabel, setReverseLabel] = useState("");
  const [loadingLabel, setLoadingLabel] = useState(false);

  // Reverse geocode using Nominatim
  const reverseGeocode = async (lat, lng) => {
    setLoadingLabel(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const addr = data.address || {};
      const parts = [
        addr.village || addr.suburb || addr.neighbourhood || addr.hamlet,
        addr.city || addr.town || addr.county,
        addr.state,
      ].filter(Boolean);
      setReverseLabel(parts.join(", ") || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch {
      setReverseLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setLoadingLabel(false);
    }
  };

  useEffect(() => {
    // Dynamically load Leaflet CSS + JS if not already loaded
    const loadLeaflet = () =>
      new Promise((resolve) => {
        if (window.L) { resolve(); return; }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = resolve;
        document.head.appendChild(script);
      });

    loadLeaflet().then(() => {
      if (!mapRef.current || leafletMapRef.current) return;

      const L = window.L;
      const defaultCenter = initialCoords
        ? [initialCoords.lat, initialCoords.lng]
        : [15.9129, 79.74]; // Andhra Pradesh center

      const map = L.map(mapRef.current, {
        center: defaultCenter,
        zoom: initialCoords ? 14 : 7,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Custom teal marker icon
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:32px;height:40px;position:relative;
        ">
          <div style="
            width:32px;height:32px;border-radius:50% 50% 50% 0;
            background:linear-gradient(135deg,#0d9488,#0891b2);
            transform:rotate(-45deg);
            border:3px solid #fff;
            box-shadow:0 3px 12px rgba(13,148,136,0.5);
          "></div>
          <div style="
            position:absolute;top:8px;left:8px;
            width:16px;height:16px;border-radius:50%;
            background:#fff;opacity:0.9;
          "></div>
        </div>`,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
      });

      // Place initial marker if coords given
      if (initialCoords) {
        markerRef.current = L.marker([initialCoords.lat, initialCoords.lng], { icon }).addTo(map);
        reverseGeocode(initialCoords.lat, initialCoords.lng);
      }

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        setPickedCoords({ lat, lng });
        reverseGeocode(lat, lng);

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
        }
      });

      leafletMapRef.current = map;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = () => {
    if (!pickedCoords) return;
    // Pass coords + human-readable label
    onConfirm({
      coords: pickedCoords,
      label: reverseLabel || `${pickedCoords.lat.toFixed(5)}, ${pickedCoords.lng.toFixed(5)}`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 350 }}
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1.5px solid #e2e8f0",
          overflow: "hidden",
          width: "100%",
          maxWidth: "680px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1.5px solid #f1f5f9",
          background: "linear-gradient(135deg, #f0fdfa, #f0f9ff)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "18px", color: "#0f172a", marginBottom: "2px",
            }}>
              Pick Location on Map
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "9px", color: "#64748b", letterSpacing: "0.1em",
            }}>
              CLICK ANYWHERE ON THE MAP TO DROP A PIN
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "#f1f5f9", border: "1px solid #e2e8f0",
              cursor: "pointer", color: "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", fontFamily: "monospace",
              transition: "all 0.15s",
            }}
          >
            ✕
          </button>
        </div>

        {/* Map */}
        <div
          ref={mapRef}
          style={{ width: "100%", height: "380px", background: "#e2e8f0" }}
        />

        {/* Footer */}
        <div style={{
          padding: "14px 20px",
          borderTop: "1.5px solid #f1f5f9",
          display: "flex", alignItems: "center", gap: "12px",
          background: "#fafafa",
        }}>
          {/* Picked location display */}
          <div style={{ flex: 1 }}>
            {pickedCoords ? (
              <div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "10px", color: "#0f172a", fontWeight: 600,
                  marginBottom: "2px",
                }}>
                  {loadingLabel ? "Resolving address…" : reverseLabel}
                </div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "8px", color: "#94a3b8", letterSpacing: "0.08em",
                }}>
                  {pickedCoords.lat.toFixed(6)}, {pickedCoords.lng.toFixed(6)}
                </div>
              </div>
            ) : (
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "9px", color: "#94a3b8", letterSpacing: "0.08em",
              }}>
                📍 No location selected yet
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              padding: "9px 16px", borderRadius: "8px",
              background: "#f1f5f9", border: "1.5px solid #e2e8f0",
              cursor: "pointer", color: "#475569",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "9px", letterSpacing: "0.1em",
              transition: "all 0.15s",
            }}
          >
            CANCEL
          </button>

          <button
            onClick={handleConfirm}
            disabled={!pickedCoords}
            style={{
              padding: "9px 20px", borderRadius: "8px",
              background: pickedCoords
                ? "linear-gradient(135deg, #0d9488, #0891b2)"
                : "#cbd5e1",
              border: "none",
              cursor: pickedCoords ? "pointer" : "not-allowed",
              color: "#fff",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "9px", letterSpacing: "0.1em", fontWeight: 700,
              boxShadow: pickedCoords ? "0 4px 12px rgba(13,148,136,0.3)" : "none",
              transition: "all 0.2s",
            }}
          >
            CONFIRM LOCATION →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Field wrapper ──────────────────────────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "10px", letterSpacing: "0.12em",
        color: "#94a3b8", textTransform: "uppercase",
        display: "flex", alignItems: "center", gap: "4px",
      }}>
        {label}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
      {hint && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#64748b" }}>{hint}</span>}
    </div>
  );
}

const inputStyle = (focused) => ({
  width: "100%", boxSizing: "border-box",
  padding: "10px 14px",
  borderRadius: "8px",
  background: focused ? "#fff" : "#f8fafc",
  border: `1.5px solid ${focused ? "#0d9488" : "#e2e8f0"}`,
  color: "#0f172a",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: "12px",
  outline: "none",
  transition: "all 0.15s",
  boxShadow: focused ? "0 0 0 3px rgba(13,148,136,0.1)" : "none",
});

function InputField({ name, value, onChange, placeholder, required, type = "text" }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
      style={inputStyle(focused)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function SelectField({ name, value, onChange, required, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      name={name} value={value} onChange={onChange} required={required}
      style={{ ...inputStyle(focused), cursor: "pointer", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
        paddingRight: "36px",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <option value="">Select source type</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function TextareaField({ name, value, onChange, placeholder, required, rows = 4 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      name={name} value={value} onChange={onChange}
      placeholder={placeholder} required={required} rows={rows}
      style={{ ...inputStyle(focused), resize: "vertical", minHeight: "96px" }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

// ── Photo uploader ─────────────────────────────────────────────────────────────
function PhotoUploader({ photo, onChange }) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onChange(file);
  };

  return (
    <div>
      <div
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? "#0d9488" : photo ? "#0d9488" : "#cbd5e1"}`,
          borderRadius: "10px", padding: "20px", textAlign: "center",
          cursor: "pointer",
          background: dragging ? "rgba(13,148,136,0.04)" : photo ? "rgba(13,148,136,0.02)" : "#f8fafc",
          transition: "all 0.15s", position: "relative",
        }}
      >
        <input
          ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={e => onChange(e.target.files[0])}
        />
        {photo ? (
          <div>
            <img
              src={URL.createObjectURL(photo)} alt="Preview"
              style={{ maxHeight: "120px", borderRadius: "8px", marginBottom: "8px", objectFit: "cover", maxWidth: "100%" }}
            />
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#0d9488" }}>
              {photo.name} · {(photo.size / 1024).toFixed(0)} KB
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#94a3b8", marginTop: "4px" }}>
              Click to replace
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>📷</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#64748b", letterSpacing: "0.06em" }}>
              DROP IMAGE HERE or <span style={{ color: "#0d9488" }}>BROWSE</span>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#94a3b8", marginTop: "4px" }}>
              JPG, PNG, WEBP · Max 5MB
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Report card ────────────────────────────────────────────────────────────────
function ReportCard({ report, index }) {
  const st = STATUS_CONFIG[report.status] || { color: "#475569", bg: "#f1f5f9", border: "#cbd5e1", dot: "#94a3b8", label: report.status };
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      style={{
        background: "#fff", border: "1.5px solid #e2e8f0",
        borderRadius: "12px", overflow: "hidden",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)", transition: "box-shadow 0.15s",
      }}
      whileHover={{ boxShadow: "0 4px 18px rgba(0,0,0,0.09)" }}
    >
      <div style={{ height: "3px", background: `linear-gradient(90deg, ${st.dot}, transparent)` }} />

      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "16px", fontWeight: 400, color: "#0f172a" }}>
                {report.water_source}
              </span>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px",
                letterSpacing: "0.1em", color: "#94a3b8",
                background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px",
              }}>
                #{report.id}
              </span>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#64748b", letterSpacing: "0.04em" }}>
              📍 {report.location}
            </div>
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "4px 10px", borderRadius: "6px",
            background: st.bg, border: `1px solid ${st.border}`, flexShrink: 0,
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: st.dot }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: st.color, fontWeight: 700, letterSpacing: "0.08em" }}>
              {st.label.toUpperCase()}
            </span>
          </div>
        </div>

        <p style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#475569",
          lineHeight: 1.7, margin: "0 0 10px",
          display: expanded ? "block" : "-webkit-box",
          WebkitLineClamp: expanded ? "unset" : 2,
          WebkitBoxOrient: "vertical",
          overflow: expanded ? "visible" : "hidden",
        }}>
          {report.description}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#94a3b8" }}>
            {formatDate(report.created_at)}
          </span>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {report.description?.length > 80 && (
              <button onClick={() => setExpanded(e => !e)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px",
                color: "#0d9488", letterSpacing: "0.06em", padding: 0,
              }}>
                {expanded ? "COLLAPSE" : "READ MORE"}
              </button>
            )}
            {report.photo_url && (
              <a href={`${API}${report.photo_url}`} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#0d9488", textDecoration: "none", letterSpacing: "0.06em" }}>
                VIEW PHOTO ↗
              </a>
            )}
          </div>
        </div>

        {report.photo_url && (
          <div style={{ marginTop: "10px" }}>
            <img
              src={`${API}${report.photo_url}`} alt="Report evidence"
              style={{ height: "64px", borderRadius: "6px", objectFit: "cover", border: "1px solid #e2e8f0" }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const UserReports = () => {
  const [reports,      setReports]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState(null);
  const [success,      setSuccess]      = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);

  // Store raw coords separately so we can pass them back into the map picker
  const [pickedCoords, setPickedCoords] = useState(null);

  const [formData, setFormData] = useState({
    water_source: "", description: "", location: "", photo: null,
  });

  useEffect(() => { fetchMyReports(); }, []);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports/me");
      setReports(res.data);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError("Failed to load reports. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleDetectLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setPickedCoords({ lat, lng });
      setFormData(prev => ({
        ...prev,
        location: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      }));
    });
  };

  // Called when user confirms a pin in the map modal
  const handleMapConfirm = ({ coords, label }) => {
    setPickedCoords(coords);
    setFormData(prev => ({ ...prev, location: label }));
    setMapPickerOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(null); setSuccess(false);
    try {
      const payload = new FormData();
      payload.append("water_source",  formData.water_source);
      payload.append("location",      formData.location);
      payload.append("description",   formData.description);
      if (formData.photo) payload.append("photo", formData.photo);

      await api.post("/reports/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchMyReports();
      setFormData({ water_source: "", description: "", location: "", photo: null });
      setPickedCoords(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, k) => {
    acc[k] = reports.filter(r => r.status === k).length;
    return acc;
  }, {});

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0fdfa 0%, #f8fafc 40%, #f0f9ff 100%)",
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Map Picker Modal ── */}
      <AnimatePresence>
        {mapPickerOpen && (
          <MapPickerModal
            onConfirm={handleMapConfirm}
            onClose={() => setMapPickerOpen(false)}
            initialCoords={pickedCoords}
          />
        )}
      </AnimatePresence>

      {/* ── Page header ── */}
      <div style={{
        background: "#fff", borderBottom: "1.5px solid #e2e8f0",
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "linear-gradient(135deg, #0d9488, #0891b2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", boxShadow: "0 2px 10px rgba(13,148,136,0.3)",
          }}>🌊</div>
          <div>
            <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "20px", color: "#0f172a", lineHeight: 1.1 }}>
              Water Quality Reports
            </div>
            <div style={{ fontSize: "8px", color: "#94a3b8", letterSpacing: "0.18em", marginTop: "2px" }}>
              AQUAWATCH · CITIZEN MONITORING PORTAL
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} style={{
              padding: "6px 12px", borderRadius: "8px",
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              display: "flex", flexDirection: "column", alignItems: "center", gap: "1px",
              minWidth: "52px",
            }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: cfg.color, lineHeight: 1 }}>
                {statusCounts[key] || 0}
              </span>
              <span style={{ fontSize: "7px", color: cfg.color, letterSpacing: "0.1em" }}>
                {key.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{
        maxWidth: "1200px", margin: "0 auto",
        padding: "32px 24px",
        display: "grid", gridTemplateColumns: "420px 1fr",
        gap: "28px", alignItems: "start",
      }}>

        {/* ── LEFT: Submit form ── */}
        <div style={{ position: "sticky", top: "90px" }}>
          <div style={{
            background: "#fff", borderRadius: "16px",
            border: "1.5px solid #e2e8f0", overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          }}>
            <div style={{
              padding: "20px 24px 16px", borderBottom: "1.5px solid #f1f5f9",
              background: "linear-gradient(135deg, #f0fdfa, #f0f9ff)",
            }}>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "20px", color: "#0f172a", marginBottom: "4px" }}>
                Submit New Report
              </div>
              <div style={{ fontSize: "9px", color: "#64748b", letterSpacing: "0.08em", lineHeight: 1.6 }}>
                Document water quality issues in your area.<br/>Your report helps protect local water resources.
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  style={{ padding: "12px 24px", background: "#fef2f2", borderBottom: "1px solid #fecaca" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px" }}>⚠️</span>
                    <span style={{ fontSize: "11px", color: "#dc2626" }}>{error}</span>
                    <button onClick={() => setError(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "14px" }}>✕</button>
                  </div>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  style={{ padding: "12px 24px", background: "#f0fdf4", borderBottom: "1px solid #bbf7d0" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px" }}>✅</span>
                    <span style={{ fontSize: "11px", color: "#15803d", fontWeight: 500 }}>Report submitted successfully.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>

              <Field label="Water Source" required>
                <SelectField
                  name="water_source" value={formData.water_source}
                  onChange={handleChange} required
                  options={["River", "Lake", "Pond", "Canal", "Groundwater", "Reservoir", "Coastal"]}
                />
              </Field>

              {/* ── Location field with 3 options ── */}
              <Field label="Location" required hint="Type manually, use GPS, or pick on map">
                <InputField
                  name="location" value={formData.location}
                  onChange={(e) => {
                    handleChange(e);
                    // If user edits manually, clear stored coords
                    setPickedCoords(null);
                  }}
                  placeholder="e.g. Near Krishna Barrage, Vijayawada"
                  required
                />

                {/* Location action buttons row */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {/* GPS detect */}
                  <button
                    type="button" onClick={handleDetectLocation}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      padding: "6px 11px", borderRadius: "6px",
                      background: "rgba(13,148,136,0.06)",
                      border: "1px solid rgba(13,148,136,0.2)",
                      color: "#0d9488", cursor: "pointer",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "9px", letterSpacing: "0.08em", transition: "all 0.15s",
                    }}
                  >
                    📡 GPS DETECT
                  </button>

                  {/* Map picker */}
                  <button
                    type="button" onClick={() => setMapPickerOpen(true)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      padding: "6px 11px", borderRadius: "6px",
                      background: pickedCoords ? "rgba(13,148,136,0.12)" : "rgba(8,145,178,0.06)",
                      border: `1px solid ${pickedCoords ? "rgba(13,148,136,0.4)" : "rgba(8,145,178,0.2)"}`,
                      color: pickedCoords ? "#0d9488" : "#0891b2",
                      cursor: "pointer",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "9px", letterSpacing: "0.08em", transition: "all 0.15s",
                    }}
                  >
                    🗺️ {pickedCoords ? "MAP PIN SET ✓" : "PICK ON MAP"}
                  </button>
                </div>

                {/* Show raw coords if picked from map */}
                {pickedCoords && (
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "8px", color: "#94a3b8", letterSpacing: "0.06em",
                    marginTop: "-2px",
                  }}>
                    📌 {pickedCoords.lat.toFixed(6)}, {pickedCoords.lng.toFixed(6)}
                  </div>
                )}
              </Field>

              <Field label="Photo Evidence" hint="Optional but helps verification">
                <PhotoUploader
                  photo={formData.photo}
                  onChange={file => setFormData(prev => ({ ...prev, photo: file }))}
                />
              </Field>

              <Field label="Description" required hint="Be specific: color, smell, visible contamination, etc.">
                <TextareaField
                  name="description" value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what you observed — water color, odor, floating debris, dead fish, foam, etc."
                  required rows={4}
                />
              </Field>

              <button
                type="submit" disabled={submitting}
                style={{
                  width: "100%", padding: "13px", borderRadius: "10px",
                  background: submitting ? "#94a3b8" : "linear-gradient(135deg, #0d9488, #0891b2)",
                  border: "none", cursor: submitting ? "not-allowed" : "pointer",
                  color: "#fff", fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "11px", letterSpacing: "0.12em", fontWeight: 700,
                  boxShadow: submitting ? "none" : "0 4px 14px rgba(13,148,136,0.35)",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                {submitting ? (
                  <>
                    <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>◌</span>
                    SUBMITTING…
                  </>
                ) : "SUBMIT REPORT →"}
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT: Reports list ── */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "22px", color: "#0f172a", lineHeight: 1 }}>
                My Reports
              </div>
              <div style={{ fontSize: "9px", color: "#94a3b8", letterSpacing: "0.12em", marginTop: "4px" }}>
                {reports.length} TOTAL SUBMISSION{reports.length !== 1 ? "S" : ""}
              </div>
            </div>
            <button onClick={fetchMyReports} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "8px",
              background: "#fff", border: "1.5px solid #e2e8f0",
              cursor: "pointer", color: "#64748b",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px",
              letterSpacing: "0.08em", transition: "all 0.15s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              ↻ REFRESH
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
              <div style={{ fontSize: "9px", color: "#94a3b8", letterSpacing: "0.12em" }}>LOADING REPORTS…</div>
            </div>
          )}

          {!loading && reports.length === 0 && (
            <div style={{
              textAlign: "center", padding: "64px 24px",
              background: "#fff", borderRadius: "16px",
              border: "1.5px dashed #cbd5e1",
            }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>📋</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "18px", color: "#334155", marginBottom: "8px" }}>
                No reports yet
              </div>
              <div style={{ fontSize: "10px", color: "#94a3b8", lineHeight: 1.8 }}>
                Submit your first water quality observation<br/>using the form on the left.
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <AnimatePresence>
              {!loading && reports.map((report, i) => (
                <ReportCard key={report.id} report={report} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserReports;