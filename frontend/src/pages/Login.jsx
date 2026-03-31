import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import API from "../services/api";

function FormInput({ label, name, type = "text", value, onChange, placeholder, required, error }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  const isPassword = type === "password";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "10px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: error ? "#dc2626" : focused ? "#0d9488" : "#64748b",
          transition: "color 0.15s",
        }}
      >
        {label}
        {required && <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>}
      </label>

      <div style={{ position: "relative" }}>
        <input
          name={name}
          type={isPassword ? (show ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={isPassword ? "current-password" : "email"}
          style={{
            width: "100%",
            boxSizing: "border-box",
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
            boxShadow: focused
              ? "0 0 0 3px rgba(13,148,136,0.1)"
              : error
              ? "0 0 0 3px rgba(220,38,38,0.08)"
              : "none",
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              fontSize: "14px",
              padding: 0,
              lineHeight: 1,
            }}
          >
            {show ? "🙈" : "👁️"}
          </button>
        )}
      </div>

      {error && (
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            color: "#dc2626",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

// ── Left Decorative Panel ─────────────────────────────────────────────────────
function WaterPanel() {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(160deg, #0f766e 0%, #0891b2 55%, #1d4ed8 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 40px",
        color: "#fff",
        height: "100%",
      }}
    >
      <style>{`
        @keyframes floatDrop { 
          0%, 100% { transform: translateY(0); } 
          50% { transform: translateY(-12px); } 
        }
        @keyframes rippleOut { 
          0% { transform: scale(1); opacity: 0.5; } 
          100% { transform: scale(2.8); opacity: 0; } 
        }
      `}</style>

      {/* Decorative circles */}
      <div style={{
        position: "absolute", top: "8%", right: "8%",
        width: "180px", height: "180px", borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.03)"
      }} />

      <div style={{
        position: "absolute", bottom: "15%", left: "6%",
        width: "110px", height: "110px", borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(255,255,255,0.02)"
      }} />

      {/* Floating Water Drop */}
      <div style={{ position: "relative", marginBottom: "32px", animation: "floatDrop 3.5s ease-in-out infinite" }}>
        <div style={{
          width: "84px", height: "84px", borderRadius: "50%",
          background: "rgba(255,255,255,0.14)", backdropFilter: "blur(10px)",
          border: "1.5px solid rgba(255,255,255,0.28)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "38px", position: "relative", zIndex: 1,
        }}>
          💧
        </div>

        {[0, 0.8, 1.6].map((delay, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "84px", height: "84px", borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.25)",
              animation: `rippleOut 2.4s ease-out ${delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Heading */}
      <div style={{
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontSize: "34px",
        color: "#fff",
        textAlign: "center",
        lineHeight: 1.15,
        marginBottom: "12px",
        letterSpacing: "-0.01em",
      }}>
        Safe Water<br />for All
      </div>

      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "11px",
        color: "rgba(255,255,255,0.65)",
        textAlign: "center",
        lineHeight: 1.9,
        letterSpacing: "0.03em",
        maxWidth: "260px",
        marginBottom: "40px",
      }}>
        Monitor real-time water quality, report issues, and protect rivers and lakes across India.
      </div>

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "280px" }}>
        {[
          { icon: "🗺️", text: "Live station maps across India" },
          { icon: "📋", text: "Citizen water quality reporting" },
          { icon: "🔔", text: "Alerts when quality drops" },
          { icon: "📊", text: "Historical trend analysis" },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.09)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <span style={{ fontSize: "16px" }}>{item.icon}</span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              color: "rgba(255,255,255,0.8)",
              letterSpacing: "0.04em",
            }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Wave */}
      <svg
        viewBox="0 0 1440 80"
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", opacity: 0.12 }}
      >
        <path fill="white" d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z" />
      </svg>
    </div>
  );
}

// ── Main Login Component ──────────────────────────────────────────────────────
function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setError("");
  };

  const validate = () => {
    const errs = {};
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!formData.password.trim()) {
      errs.password = "Password is required";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.access_token) {
        API.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${API.defaults.baseURL}/auth/google`;
  };

  const handleForgotPassword = () => {
    alert("Forgot Password feature coming soon!");
    // navigate("/forgot-password"); // Uncomment when you add the route
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'IBM Plex Mono', monospace",
        background: "#f0fdfa",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-right { width: 100% !important; }
        }
      `}</style>

      {/* Left Panel */}
      <div className="login-left" style={{ width: "45%", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <WaterPanel />
      </div>

      {/* Right Panel */}
      <div
        className="login-right"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          background: "linear-gradient(160deg, #f0fdfa 0%, #f8fafc 60%, #f0f9ff 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: "100%", maxWidth: "420px" }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              border: "1.5px solid #e2e8f0",
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
            }}
          >
            {/* Card Header */}
            <div
              style={{
                padding: "24px 28px 20px",
                borderBottom: "1.5px solid #f1f5f9",
                background: "linear-gradient(135deg, #f0fdfa, #f0f9ff)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "9px",
                    background: "linear-gradient(135deg, #0d9488, #0891b2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    boxShadow: "0 2px 8px rgba(13,148,136,0.3)",
                  }}
                >
                  🌊
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: "20px",
                    color: "#0f172a",
                    lineHeight: 1,
                  }}>
                    Welcome back
                  </div>
                  <div style={{
                    fontSize: "8px",
                    color: "#94a3b8",
                    letterSpacing: "0.15em",
                    marginTop: "2px",
                  }}>
                    AQUAWATCH · WATER QUALITY MONITOR
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Global Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      padding: "11px 14px",
                      background: "#fef2f2",
                      border: "1.5px solid #fca5a5",
                      borderRadius: "9px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>⚠️</span>
                      <span style={{ fontSize: "11px", color: "#dc2626", lineHeight: 1.5 }}>
                        {error}
                      </span>
                      <button
                        onClick={() => setError("")}
                        style={{
                          marginLeft: "auto",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#94a3b8",
                          fontSize: "14px",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogle}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  borderRadius: "9px",
                  background: "#fff",
                  border: "1.5px solid #e2e8f0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "0.06em",
                  color: "#334155",
                  fontWeight: 500,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#94a3b8";
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                CONTINUE WITH GOOGLE
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flex: 1, height: "1px", background: "#f1f5f9" }} />
                <span style={{ fontSize: "9px", color: "#94a3b8", letterSpacing: "0.1em" }}>
                  OR SIGN IN WITH EMAIL
                </span>
                <div style={{ flex: 1, height: "1px", background: "#f1f5f9" }} />
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  error={fieldErrors.email}
                />

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <FormInput
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    error={fieldErrors.password}
                  />

                  {/* Forgot Password */}
                  <div style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "9px",
                        color: "#0d9488",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        letterSpacing: "0.06em",
                        padding: 0,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      FORGOT PASSWORD?
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    background: loading
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #0d9488, #0891b2)",
                    color: "#fff",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "11px",
                    letterSpacing: "0.14em",
                    fontWeight: 700,
                    boxShadow: loading ? "none" : "0 4px 14px rgba(13,148,136,0.35)",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  {loading ? (
                    <>
                      <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>◌</span>
                      SIGNING IN…
                    </>
                  ) : (
                    "SIGN IN →"
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>Don't have an account? </span>
                <Link
                  to="/register"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "10px",
                    color: "#0d9488",
                    fontWeight: 700,
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  CREATE ACCOUNT
                </Link>
              </div>

              {/* Legal Footer */}
              <div
                style={{
                  textAlign: "center",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "8px",
                  color: "#cbd5e1",
                  lineHeight: 1.7,
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "14px",
                }}
              >
                Protected by AquaWatch security.{" "}
                <a
                  href="#"
                  style={{ color: "#94a3b8", textDecoration: "underline" }}
                  onClick={(e) => { e.preventDefault(); alert("Privacy Policy - Coming soon"); }}
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;