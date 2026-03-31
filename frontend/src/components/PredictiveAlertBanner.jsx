import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function PredictiveAlertBanner({ user }) {
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // ❌ If already dismissed, don't show
    if (sessionStorage.getItem("hideBanner")) {
      setLoading(false);
      return;
    }

    const location = user?.location || "Erode";

    API.get(`/api/v1/alerts/predictive?location=${location}`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setAlert(res.data[0]);
        }
      })
      .catch((err) => {
        console.error("Error fetching predictive alert:", err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleDismiss = () => {
    sessionStorage.setItem("hideBanner", "true");
    setAlert(null);
  };

  // ❌ Don't render if loading or no alert
  if (loading || !alert) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        background: "#fde68a",
        color: "#92400e",
        padding: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f59e0b",
      }}
    >
      {/* ALERT MESSAGE */}
      <span style={{ fontWeight: "500" }}>
        ⚠️ {alert.message}
      </span>

      {/* ACTION BUTTONS */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => navigate("/alerts")}
          aria-label="View alert details"
          style={{
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          View Details
        </button>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss alert"
          style={{
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}