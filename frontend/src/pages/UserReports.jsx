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
  const [reports,    setReports]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);
  const [success,    setSuccess]    = useState(false);

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
      // ✅ 401 → api.js interceptor handles redirect to /login automatically
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
      setFormData(prev => ({
        ...prev,
        location: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
      }));
    });
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

      // ✅ api instance auto-attaches JWT; Content-Type set to multipart manually
      await api.post("/reports/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchMyReports();
      setFormData({ water_source: "", description: "", location: "", photo: null });
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

              <Field label="Location" required hint="Enter address, landmark, or use GPS coordinates">
                <InputField
                  name="location" value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Near Krishna Barrage, Vijayawada"
                  required
                />
                <button
                  type="button" onClick={handleDetectLocation}
                  style={{
                    alignSelf: "flex-start",
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "6px 12px", borderRadius: "6px",
                    background: "rgba(13,148,136,0.06)",
                    border: "1px solid rgba(13,148,136,0.2)",
                    color: "#0d9488", cursor: "pointer",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "9px", letterSpacing: "0.08em", transition: "all 0.15s",
                  }}
                >
                  📡 DETECT GPS LOCATION
                </button>
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