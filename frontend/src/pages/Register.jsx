import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";

// ── Role options ───────────────────────────────────────────────────────────────
const ROLES = [
  { value: "citizen",   label: "Citizen",              icon: "👤", desc: "Report local water issues" },
  { value: "ngo",       label: "NGO / Organization",   icon: "🏢", desc: "Coordinate field surveys"  },
  { value: "authority", label: "Government Authority", icon: "🏛️", desc: "Manage & verify reports"   },
];

// ── Reusable input ─────────────────────────────────────────────────────────────
function FormInput({ label, name, type = "text", value, onChange, placeholder, required, error }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow]       = useState(false);
  const isPassword = type === "password";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase",
        color: error ? "#dc2626" : focused ? "#0d9488" : "#64748b",
        transition: "color 0.15s",
      }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <input
          name={name}
          type={isPassword ? (show ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "11px 14px",
            paddingRight: isPassword ? "42px" : "14px",
            borderRadius: "9px",
            background: focused ? "#fff" : "#f8fafc",
            border: `1.5px solid ${error ? "#fca5a5" : focused ? "#0d9488" : "#e2e8f0"}`,
            color: "#0f172a",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "12px",
            outline: "none",
            transition: "all 0.15s",
            boxShadow: focused ? "0 0 0 3px rgba(13,148,136,0.1)" : error ? "0 0 0 3px rgba(220,38,38,0.08)" : "none",
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{
              position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "#94a3b8", fontSize: "14px", padding: 0, lineHeight: 1,
            }}
          >{show ? "🙈" : "👁️"}</button>
        )}
      </div>
      {error && (
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#dc2626" }}>
          {error}
        </span>
      )}
    </div>
  );
}

// ── Role selector card ─────────────────────────────────────────────────────────
function RoleCard({ role, selected, onSelect }) {
  const active = selected === role.value;
  return (
    <div
      onClick={() => onSelect(role.value)}
      style={{
        flex: 1, padding: "10px 10px", borderRadius: "9px", cursor: "pointer",
        border: `1.5px solid ${active ? "#0d9488" : "#e2e8f0"}`,
        background: active ? "rgba(13,148,136,0.06)" : "#f8fafc",
        transition: "all 0.15s",
        boxShadow: active ? "0 0 0 3px rgba(13,148,136,0.1)" : "none",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "20px", marginBottom: "4px" }}>{role.icon}</div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px",
        fontWeight: 700, letterSpacing: "0.06em",
        color: active ? "#0d9488" : "#475569",
        marginBottom: "2px",
      }}>{role.label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#94a3b8", lineHeight: 1.4 }}>
        {role.desc}
      </div>
    </div>
  );
}

// ── Left panel — animated water SVG ───────────────────────────────────────────
function WaterPanel() {
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      background: "linear-gradient(160deg, #0f766e 0%, #0891b2 50%, #1d4ed8 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "48px 40px", color: "#fff",
    }}>
      <style>{`
        @keyframes wave1 { 0%,100%{d:path("M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,200 L0,200 Z")} 50%{d:path("M0,40 C240,20 480,80 720,40 C960,0 1200,80 1440,40 L1440,200 L0,200 Z")} }
        @keyframes wave2 { 0%,100%{d:path("M0,80 C200,40 400,120 600,80 C800,40 1000,120 1200,80 L1200,200 L0,200 Z")} 50%{d:path("M0,100 C200,130 400,60 600,100 C800,130 1000,60 1200,100 L1200,200 L0,200 Z")} }
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes ripple { 0%{transform:scale(1);opacity:0.4} 100%{transform:scale(2.5);opacity:0} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .stat-chip { animation: fadeSlide 0.6s ease forwards; }
      `}</style>

      {/* Background circles */}
      <div style={{ position: "absolute", top: "10%", right: "10%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
      <div style={{ position: "absolute", bottom: "20%", left: "5%", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />

      {/* Drop icon with ripple */}
      <div style={{ position: "relative", marginBottom: "28px", animation: "floatUp 3s ease-in-out infinite" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
          border: "1.5px solid rgba(255,255,255,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "36px", position: "relative", zIndex: 1,
        }}>💧</div>
        {[1,2].map(i => (
          <div key={i} style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: "80px", height: "80px", borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.3)",
            animation: `ripple 2s ease-out ${i * 0.7}s infinite`,
          }} />
        ))}
      </div>

      {/* Heading */}
      <div style={{
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontSize: "32px", color: "#fff",
        textAlign: "center", lineHeight: 1.15,
        marginBottom: "14px", letterSpacing: "-0.01em",
      }}>
        Clean Water<br/>Starts Here
      </div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px",
        color: "rgba(255,255,255,0.7)", textAlign: "center",
        lineHeight: 1.8, letterSpacing: "0.04em", maxWidth: "260px",
        marginBottom: "36px",
      }}>
        Join citizens, NGOs, and authorities monitoring water quality across India in real time.
      </div>

      {/* Stat chips */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "280px" }}>
        {[
          { icon: "🗺️", label: "STATIONS MONITORED", value: "2,400+" },
          { icon: "📋", label: "REPORTS SUBMITTED",  value: "18,000+" },
          { icon: "✅", label: "ISSUES RESOLVED",    value: "94%" },
        ].map((stat, i) => (
          <div key={i} className="stat-chip" style={{
            animationDelay: `${i * 0.12 + 0.3}s`, opacity: 0,
            display: "flex", alignItems: "center", gap: "12px",
            padding: "10px 14px", borderRadius: "10px",
            background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}>
            <span style={{ fontSize: "18px" }}>{stat.icon}</span>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em" }}>{stat.label}</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "18px", color: "#fff", lineHeight: 1.2 }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Wave SVG at bottom */}
      <svg viewBox="0 0 1440 80" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.15 }}>
        <path fill="white" d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z" />
      </svg>
    </div>
  );
}

// ── Main Register component ────────────────────────────────────────────────────
const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", confirmPassword: "", role: "citizen",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: "" }));
    setError("");
  };

  const validate = () => {
    const errs = {};
    if (formData.fullName.trim().length < 2) errs.fullName = "Name must be at least 2 characters";
    if (!/\S+@\S+\.\S+/.test(formData.email))  errs.email = "Enter a valid email address";
    if (formData.password.length < 6)           errs.password = "Minimum 6 characters required";
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true); setError(""); setSuccess("");
    try {
      const payload = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };
      const res = await API.post("/auth/register", payload);
      if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token);
        if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
        API.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`;
        setSuccess("Account created! Redirecting to dashboard…");
        setTimeout(() => navigate("/dashboard"), 1800);
      } else {
        setSuccess("Account created! Please sign in.");
        setTimeout(() => navigate("/login"), 2200);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg || d.message || JSON.stringify(d)).join(" • "));
      } else {
        setError(typeof detail === "string" ? detail : "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    // Redirect to your backend's Google OAuth initiation endpoint
    window.location.href = `${API.defaults.baseURL}/auth/google`;
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "'IBM Plex Mono', monospace",
      background: "#f0fdfa",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

        @media (max-width: 768px) {
          .register-left  { display: none !important; }
          .register-right { width: 100% !important; }
        }
      `}</style>

      {/* ── Left panel ── */}
      <div className="register-left" style={{ width: "45%", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <WaterPanel />
      </div>

      {/* ── Right panel ── */}
      <div className="register-right" style={{
        flex: 1, overflowY: "auto",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "40px 24px",
        background: "linear-gradient(160deg, #f0fdfa 0%, #f8fafc 60%, #f0f9ff 100%)",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: "100%", maxWidth: "460px" }}
        >
          {/* Card */}
          <div style={{
            background: "#fff",
            borderRadius: "18px",
            border: "1.5px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          }}>

            {/* Card header */}
            <div style={{
              padding: "24px 28px 20px",
              borderBottom: "1.5px solid #f1f5f9",
              background: "linear-gradient(135deg, #f0fdfa, #f0f9ff)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "9px",
                  background: "linear-gradient(135deg, #0d9488, #0891b2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", boxShadow: "0 2px 8px rgba(13,148,136,0.3)",
                }}>🌊</div>
                <div>
                  <div style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: "20px", color: "#0f172a", lineHeight: 1,
                  }}>Create Account</div>
                  <div style={{ fontSize: "8px", color: "#94a3b8", letterSpacing: "0.15em", marginTop: "2px" }}>
                    AQUAWATCH · WATER QUALITY MONITOR
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* ── Alerts ── */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    style={{ padding: "11px 14px", background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: "9px" }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <span>⚠️</span>
                      <span style={{ fontSize: "11px", color: "#dc2626", lineHeight: 1.6 }}>{error}</span>
                      <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "14px", flexShrink: 0 }}>✕</button>
                    </div>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    style={{ padding: "11px 14px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "9px" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>✅</span>
                      <span style={{ fontSize: "11px", color: "#15803d" }}>{success}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Google button ── */}
              <button
                type="button"
                onClick={handleGoogle}
                style={{
                  width: "100%", padding: "11px 16px",
                  borderRadius: "9px",
                  background: "#fff",
                  border: "1.5px solid #e2e8f0",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "11px", letterSpacing: "0.06em",
                  color: "#334155", fontWeight: 500,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
              >
                {/* Google G SVG */}
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                CONTINUE WITH GOOGLE
              </button>

              {/* ── Divider ── */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flex: 1, height: "1px", background: "#f1f5f9" }} />
                <span style={{ fontSize: "9px", color: "#94a3b8", letterSpacing: "0.1em" }}>OR REGISTER WITH EMAIL</span>
                <div style={{ flex: 1, height: "1px", background: "#f1f5f9" }} />
              </div>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                <FormInput
                  label="Full Name" name="fullName" type="text"
                  value={formData.fullName} onChange={handleChange}
                  placeholder="e.g. Ravi Kumar" required
                  error={fieldErrors.fullName}
                />

                <FormInput
                  label="Email Address" name="email" type="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="you@example.com" required
                  error={fieldErrors.email}
                />

                <FormInput
                  label="Password" name="password" type="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="Min. 6 characters" required
                  error={fieldErrors.password}
                />

                <FormInput
                  label="Confirm Password" name="confirmPassword" type="password"
                  value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Re-enter password" required
                  error={fieldErrors.confirmPassword}
                />

                {/* ── Role selector ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b",
                  }}>
                    I am a <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {ROLES.map(role => (
                      <RoleCard
                        key={role.value} role={role}
                        selected={formData.role}
                        onSelect={v => setFormData(prev => ({ ...prev, role: v }))}
                      />
                    ))}
                  </div>
                </div>

                {/* ── Password strength ── */}
                {formData.password.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {[1,2,3,4].map(i => {
                        const strength = Math.min(4, Math.floor(formData.password.length / 3));
                        const colors = ["#ef4444","#f59e0b","#3b82f6","#0d9488"];
                        return (
                          <div key={i} style={{
                            flex: 1, height: "3px", borderRadius: "2px",
                            background: i <= strength ? colors[strength - 1] : "#e2e8f0",
                            transition: "background 0.3s",
                          }} />
                        );
                      })}
                    </div>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: "#94a3b8" }}>
                      {["","WEAK","FAIR","GOOD","STRONG"][Math.min(4, Math.floor(formData.password.length / 3))]} PASSWORD
                    </span>
                  </motion.div>
                )}

                {/* ── Submit ── */}
                <button
                  type="submit" disabled={loading}
                  style={{
                    width: "100%", padding: "13px",
                    borderRadius: "10px", border: "none", cursor: loading ? "not-allowed" : "pointer",
                    background: loading ? "#94a3b8" : "linear-gradient(135deg, #0d9488, #0891b2)",
                    color: "#fff",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "11px", letterSpacing: "0.14em", fontWeight: 700,
                    boxShadow: loading ? "none" : "0 4px 14px rgba(13,148,136,0.35)",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    marginTop: "4px",
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {loading ? (
                    <>
                      <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>◌</span>
                      CREATING ACCOUNT…
                    </>
                  ) : "CREATE ACCOUNT →"}
                </button>

                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </form>

              {/* ── Footer ── */}
              <div style={{ textAlign: "center", paddingTop: "4px" }}>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>Already have an account? </span>
                <Link to="/login" style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px",
                  color: "#0d9488", fontWeight: 700, textDecoration: "none",
                  letterSpacing: "0.04em",
                }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                >
                  SIGN IN
                </Link>
              </div>

              {/* ── Legal ── */}
              <div style={{
                textAlign: "center",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "8px", color: "#cbd5e1", lineHeight: 1.7,
                borderTop: "1px solid #f1f5f9", paddingTop: "14px",
              }}>
                By creating an account you agree to our{" "}
                <a href="#" style={{ color: "#94a3b8", textDecoration: "underline" }}>Terms of Service</a>
                {" "}and{" "}
                <a href="#" style={{ color: "#94a3b8", textDecoration: "underline" }}>Privacy Policy</a>.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;