import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

// ── Animation variants ────────────────────────────────────────────────────────
const panelVariants = {
  hidden:  { x: "100%", opacity: 0, scale: 0.97 },
  visible: {
    x: 0, opacity: 1, scale: 1,
    transition: { type: "spring", damping: 28, stiffness: 200 },
  },
  exit: {
    x: "100%", opacity: 0, scale: 0.97,
    transition: { duration: 0.35, ease: "easeIn" },
  },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08 + 0.15, duration: 0.4, ease: "easeOut" },
  }),
};

// ── Avatar initials ───────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ").slice(0, 2)
    .map(w => w[0]?.toUpperCase()).join("");

  return (
    <div style={{
      width: "72px", height: "72px", borderRadius: "50%",
      background: "linear-gradient(135deg, #0d9488, #0891b2)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "26px", fontWeight: 700, color: "#fff",
      boxShadow: "0 4px 18px rgba(13,148,136,0.4)",
      flexShrink: 0,
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      {initials}
    </div>
  );
}

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const cfg = {
    admin:    { bg: "#fef3c7", border: "#fcd34d", color: "#92400e", label: "Admin"    },
    user:     { bg: "#dbeafe", border: "#93c5fd", color: "#1e40af", label: "User"     },
    verifier: { bg: "#d1fae5", border: "#6ee7b7", color: "#065f46", label: "Verifier" },
  };
  const s = cfg[role?.toLowerCase()] || cfg.user;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: "6px", fontSize: "10px",
      fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em",
      fontWeight: 700, background: s.bg, border: `1px solid ${s.border}`, color: s.color,
    }}>
      {s.label.toUpperCase()}
    </span>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value, index }) {
  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      style={{
        padding: "13px 16px",
        borderRadius: "10px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        display: "flex", flexDirection: "column", gap: "3px",
      }}
    >
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "9px", letterSpacing: "0.14em",
        color: "#94a3b8", textTransform: "uppercase",
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "13px", color: "#0f172a", fontWeight: 500,
        wordBreak: "break-all",
      }}>
        {value || "—"}
      </span>
    </motion.div>
  );
}

// ── Main Profile Panel ────────────────────────────────────────────────────────
export default function Profile({ isOpen, onClose }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    fetchUser();
  }, [isOpen]);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ GET /users/me — JWT auto-attached by api.js interceptor
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Failed to load profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 99,
              backdropFilter: "blur(2px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="profile-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0,
              width: "100%", maxWidth: "400px",
              background: "#fff",
              zIndex: 100,
              display: "flex", flexDirection: "column",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Google Fonts */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=IBM+Plex+Mono:wght@400;500;700&display=swap');`}</style>

            {/* Top accent bar */}
            <div style={{ height: "4px", background: "linear-gradient(90deg, #0d9488, #0891b2, #6366f1)" }} />

            {/* Header */}
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: "1.5px solid #f1f5f9",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "20px", color: "#0f172a" }}>
                My Profile
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: "#f1f5f9", border: "none",
                  width: "32px", height: "32px", borderRadius: "8px",
                  cursor: "pointer", fontSize: "14px", color: "#64748b",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ✕
              </motion.button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

              {/* Loading */}
              {loading && (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#94a3b8", letterSpacing: "0.12em" }}>
                    LOADING PROFILE…
                  </div>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div style={{
                  padding: "16px", borderRadius: "10px",
                  background: "#fef2f2", border: "1px solid #fecaca",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚠️</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#dc2626" }}>
                    {error}
                  </div>
                  <button onClick={fetchUser} style={{
                    marginTop: "12px", padding: "6px 16px", borderRadius: "6px",
                    background: "#fff", border: "1px solid #fca5a5",
                    color: "#dc2626", cursor: "pointer",
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px",
                  }}>
                    RETRY
                  </button>
                </div>
              )}

              {/* User data */}
              {!loading && user && (
                <>
                  {/* Avatar + name */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      display: "flex", alignItems: "center", gap: "16px",
                      padding: "20px", borderRadius: "14px",
                      background: "linear-gradient(135deg, #f0fdfa, #f0f9ff)",
                      border: "1.5px solid #e2e8f0",
                      marginBottom: "20px",
                    }}
                  >
                    <Avatar name={user.full_name || user.username || user.email} />
                    <div>
                      <div style={{
                        fontFamily: "'Instrument Serif', Georgia, serif",
                        fontSize: "18px", color: "#0f172a", lineHeight: 1.2,
                        marginBottom: "6px",
                      }}>
                        {user.full_name || user.username || "User"}
                      </div>
                      <RoleBadge role={user.role} />
                    </div>
                  </motion.div>

                  {/* Info rows */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <InfoRow index={0} label="Email"    value={user.email}                />
                    <InfoRow index={1} label="Username" value={user.username}             />
                    <InfoRow index={2} label="Role"     value={user.role}                 />
                    {user.full_name && (
                      <InfoRow index={3} label="Full Name" value={user.full_name}         />
                    )}
                    {user.created_at && (
                      <InfoRow index={4} label="Member Since" value={
                        new Date(user.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "long", year: "numeric",
                        })
                      } />
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer: Sign out */}
            <div style={{
              padding: "16px 24px",
              borderTop: "1.5px solid #f1f5f9",
              background: "#fafafa",
            }}>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: "100%", padding: "12px",
                  borderRadius: "10px",
                  background: "#fff",
                  border: "1.5px solid #fca5a5",
                  color: "#dc2626",
                  cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "11px", letterSpacing: "0.12em", fontWeight: 700,
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                🚪 SIGN OUT
              </motion.button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}