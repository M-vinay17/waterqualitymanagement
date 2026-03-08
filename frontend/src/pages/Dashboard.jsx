import React from "react";
import { useNavigate } from "react-router-dom";
import StationReading from "../components/StationReading";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0ea5e9,#22c55e)",
        padding: "20px"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white"
        }}
      >
        <h2>Water Quality Monitor</h2>

        <div>
          <span style={{ color: "red", marginRight: "15px" }}>User</span>

          <button
            onClick={logout}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Station Boxes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginTop: "40px"
        }}
      >
        <StationReading station="Station 1" ph="7.1" turbidity="2.3 NTU" color="#38bdf8" />
        <StationReading station="Station 2" ph="6.9" turbidity="2.8 NTU" color="#4ade80" />
        <StationReading station="Station 3" ph="7.4" turbidity="1.9 NTU" color="#fbbf24" />
        <StationReading station="Station 4" ph="7.0" turbidity="2.1 NTU" color="#fb7185" />
      </div>

      {/* Map */}
      <div
        style={{
          marginTop: "40px",
          height: "450px",
          borderRadius: "10px",
          overflow: "hidden"
        }}
      >
        <MapContainer
          center={[17.385, 78.4867]}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[17.385, 78.4867]}>
            <Popup>
              Hyderabad Station <br />
              pH: 7.2 <br />
              Turbidity: 2.1 NTU
            </Popup>
          </Marker>

          <Marker position={[16.5062, 80.648]}>
            <Popup>
              Vijayawada Station <br />
              pH: 6.9 <br />
              Turbidity: 2.4 NTU
            </Popup>
          </Marker>

          <Marker position={[17.6868, 83.2185]}>
            <Popup>
              Visakhapatnam Station <br />
              pH: 7.3 <br />
              Turbidity: 1.8 NTU
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}