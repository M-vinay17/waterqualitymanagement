import { useEffect } from "react";

export default function useAlertSocket(setAlerts) {
  useEffect(() => {
    console.log("Simulated WebSocket connected ✅");

    const interval = setInterval(() => {
      const newAlert = {
        id: Date.now(),
        type: "predictive",
        message: "🚨 Live Alert (Simulated)",
        location: "Erode",
        issued_at: new Date().toISOString(),
        source: "websocket"
      };

      setAlerts((prev) => [newAlert, ...prev]);
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [setAlerts]);
}