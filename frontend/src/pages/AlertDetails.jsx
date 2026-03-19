import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function AlertDetails() {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/alerts/${id}`)
      .then(res => res.json())
      .then(data => setAlert(data));
  }, [id]);

  if (!alert) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div style={{ padding: "30px" }}>
      <h2>Alert Details</h2>

      <p><b>ID:</b> {alert.id}</p>
      <p><b>Type:</b> {alert.type}</p>
      <p><b>Location:</b> {alert.location}</p>
      <p><b>Message:</b> {alert.message}</p>
      <p><b>Date:</b> {alert.issued_at}</p>

    </div>
  );
}

export default AlertDetails;