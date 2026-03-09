import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function WaterMap() {
  return (
    <MapContainer
      center={[37.7749, -122.4194]}
      zoom={10}
      style={{ height: "500px", width: "100%" }}
    >

      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[37.7749, -122.4194]}>
        <Popup>Water Station</Popup>
      </Marker>

    </MapContainer>
  );
}