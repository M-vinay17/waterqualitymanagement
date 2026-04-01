import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = "http://localhost:8000";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f) {
  const errs = {};

  if (!f.project_name.trim())
    errs.project_name = "Project name is required";
  else if (f.project_name.length > 120)
    errs.project_name = "Maximum 120 characters allowed";

  if (!f.ngo_name.trim())
    errs.ngo_name = "NGO name is required";

  if (!f.contact_email.trim())
    errs.contact_email = "Email is required";
  else if (!EMAIL_RE.test(f.contact_email))
    errs.contact_email = "Enter a valid email address";

  return errs;
}

function Toast({ message, type, onClose }) {
  const styles = {
    success: { color: "#0ea472", icon: "✅" },
    error: { color: "#dc2626", icon: "⚠️" }
  };

  const s = styles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        marginBottom: "12px",
        display: "flex",
        gap: "10px",
        alignItems: "center"
      }}
    >
      <span>{s.icon}</span>
      <span style={{ color: s.color }}>{message}</span>
      <button onClick={onClose} style={{ marginLeft: "auto" }}>✕</button>
    </motion.div>
  );
}

function FieldInput({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  maxLength
}) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ fontSize: "12px", fontWeight: "600" }}>
        {label} *
      </label>

      <input
        name={name}
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "9px",
          borderRadius: "8px",
          border: error ? "1px solid #ef4444" : "1px solid #cbd5e1",
          marginTop: "4px"
        }}
      />

      {error && (
        <div style={{ color: "#ef4444", fontSize: "11px" }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default function SubmitCollaborationForm({ onSuccess }) {

  const [fields, setFields] = useState({
    project_name: "",
    ngo_name: "",
    contact_email: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const update = (e) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const validationErrors = validate(fields);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const token = localStorage.getItem("token");

    console.log("Token:", token);
    console.log("Submitting:", fields);

    setLoading(true);

    try {

      const res = await fetch(`${BASE}/collaborations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(fields)
      });

      console.log("Response Status:", res.status);

      if (res.ok) {

        const data = await res.json();

        setToast({
          type: "success",
          message: "Collaboration created successfully 🎉"
        });

        setFields({
          project_name: "",
          ngo_name: "",
          contact_email: ""
        });

        onSuccess?.(data);

      } 
      else if (res.status === 422) {

        const data = await res.json();

        setErrors(data.errors || {});

        setToast({
          type: "error",
          message: "Please correct the highlighted fields."
        });

      } 
      else if (res.status === 401) {

        setToast({
          type: "error",
          message: "Unauthorized. Please login again."
        });

      }
      else {

        const text = await res.text();
        console.log("Server Error:", text);

        setToast({
          type: "error",
          message: `Server error (${res.status})`
        });

      }

    } 
    catch (err) {

      console.error("Network Error:", err);

      setToast({
        type: "error",
        message: "Network error. Please try again."
      });

    } 
    finally {

      setLoading(false);

    }
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0"
      }}
    >

      <h3>➕ Submit New Collaboration</h3>

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>

        <FieldInput
          label="Project Name"
          name="project_name"
          value={fields.project_name}
          onChange={update}
          maxLength={120}
          error={errors.project_name}
        />

        <FieldInput
          label="NGO Name"
          name="ngo_name"
          value={fields.ngo_name}
          onChange={update}
          error={errors.ngo_name}
        />

        <FieldInput
          label="Contact Email"
          name="contact_email"
          type="email"
          value={fields.contact_email}
          onChange={update}
          error={errors.contact_email}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "10px",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            background: loading ? "#94a3b8" : "#0e74bd",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Submitting..." : "Submit Collaboration"}
        </button>

      </form>

    </div>
  );
}