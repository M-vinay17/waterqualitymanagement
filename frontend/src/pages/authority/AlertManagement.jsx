import { useEffect, useState } from "react";

export default function AlertManagement() {
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: "",
    message: "",
    location: ""
  });

  // ✅ FETCH ALERTS
  useEffect(() => {
    fetch("/api/v1/alerts?active=true")
      .then(res => res.json())
      .then(data => {
        console.log("Alerts:", data);

        if (!data || data.length === 0) {
          setAlerts([
            {
              id: 1,
              type: "Warning",
              message: "High turbidity detected",
              location: "Station A",
              issued_at: "Today"
            },
            {
              id: 2,
              type: "Critical",
              message: "Lead level exceeded",
              location: "Station B",
              issued_at: "Today"
            }
          ]);
        } else {
          setAlerts(data);
        }
      })
      .catch(() => {
        setAlerts([
          {
            id: 1,
            type: "Warning",
            message: "High turbidity detected",
            location: "Station A",
            issued_at: "Today"
          },
          {
            id: 2,
            type: "Critical",
            message: "Lead level exceeded",
            location: "Station B",
            issued_at: "Today"
          }
        ]);
      });
  }, []);

  // ✅ RESOLVE ALERT
  const handleResolve = async (id) => {
    const prevAlerts = alerts;

    // optimistic UI
    setAlerts(prev => prev.filter(a => a.id !== id));

    try {
      await fetch(`/api/v1/alerts/${id}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.error("Error resolving alert:", err);
      alert("Failed to resolve alert ❌");
      setAlerts(prevAlerts); // rollback
    }
  };

  // ✅ ADD ALERT
  const handleAddAlert = async () => {
    if (!newAlert.type || !newAlert.message || !newAlert.location) {
      alert("All fields required ⚠️");
      return;
    }

    const tempAlert = {
      id: Date.now(),
      ...newAlert,
      issued_at: "Now"
    };

    // optimistic UI
    setAlerts(prev => [tempAlert, ...prev]);

    try {
      await fetch("/api/v1/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newAlert)
      });

      alert("Alert created successfully ✅");
      setShowModal(false);
      setNewAlert({ type: "", message: "", location: "" });

    } catch (err) {
      console.error("Error adding alert:", err);
      alert("Failed to create alert ❌");

      // rollback
      setAlerts(prev => prev.filter(a => a.id !== tempAlert.id));
    }
  };

  return (
    <div className="p-4 border rounded mt-6">
      <h2 className="text-xl font-semibold mb-4 text-white">
        Alert Management
      </h2>

      {/* ADD ALERT BUTTON */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded mb-4 font-semibold"
      >
        + Issue New Alert
      </button>

      {/* ALERT LIST */}
      {alerts.length === 0 ? (
        <p className="text-white">No active alerts</p>
      ) : (
        alerts.map(alert => (
          <div
            key={alert.id}
            className="flex justify-between items-center bg-white/10 p-4 rounded mb-3 shadow"
          >
            <div className="flex flex-col gap-1">
              
              {/* ✅ TYPE BADGE */}
              <span
                className={`px-2 py-1 w-fit rounded text-xs font-bold ${
                  alert.type === "Critical"
                    ? "bg-red-600 text-white"
                    : "bg-yellow-400 text-black"
                }`}
              >
                {alert.type}
              </span>

              <p className="text-white font-medium">
                {alert.message}
              </p>

              <p className="text-sm text-gray-200">
                📍 {alert.location} | 🕒 {alert.issued_at}
              </p>
            </div>

            <button
              onClick={() => handleResolve(alert.id)}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 text-white rounded"
            >
              Resolve
            </button>
          </div>
        ))
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-5 rounded w-80 shadow-lg">
            <h3 className="font-semibold mb-3 text-lg">
              New Alert
            </h3>

            <select
              value={newAlert.type}
              onChange={e => setNewAlert({ ...newAlert, type: e.target.value })}
              className="w-full mb-2 border p-2 rounded"
            >
              <option value="">Select Type</option>
              <option>Warning</option>
              <option>Critical</option>
            </select>

            <textarea
              placeholder="Message"
              value={newAlert.message}
              onChange={e => setNewAlert({ ...newAlert, message: e.target.value })}
              className="w-full mb-2 border p-2 rounded"
            />

            <input
              placeholder="Location"
              value={newAlert.location}
              onChange={e => setNewAlert({ ...newAlert, location: e.target.value })}
              className="w-full mb-3 border p-2 rounded"
            />

            <div className="flex justify-between">
              <button
                onClick={handleAddAlert}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                Submit
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 hover:bg-gray-500 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}