import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  LayersControl,
  ZoomControl
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

/* ================= LEAFLET ICON FIX ================= */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
});

/* ================= AUTO FIT BOUNDS ================= */
function AutoFit({ stations }) {
  const map = useMap();

  useEffect(() => {
    if (!stations.length) return;

    const bounds = L.latLngBounds(
      stations.map((s) => [s.latitude, s.longitude])
    );

    map.flyToBounds(bounds, {
      padding: [100, 100],
      duration: 1.2,
      maxZoom: 14
    });
  }, [stations, map]);

  return null;
}

/* ================= LEGEND ================= */
function Legend() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        background: "white",
        padding: "14px 18px",
        borderRadius: 14,
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        fontSize: 14,
        zIndex: 1000
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 10 }}>
        Water Quality
      </div>

      <LegendItem color="#16a34a" label="Safe" />
      <LegendItem color="#f59e0b" label="Moderate" />
      <LegendItem color="#dc2626" label="Unsafe" />
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
      <span
        style={{
          width: 14,
          height: 14,
          background: color,
          borderRadius: "50%",
          marginRight: 10
        }}
      ></span>
      {label}
    </div>
  );
}

/* ================= CUSTOM MARKER ================= */
const createWaterIcon = (color) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width:24px;
        height:24px;
        background:${color};
        border-radius:50%;
        border:3px solid white;
        box-shadow:0 6px 14px rgba(0,0,0,0.4);
        transition:transform 0.2s ease;
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

export default function WaterMap() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/water/");
      setStations(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getColor = (status) => {
    if (!status) return "#6b7280";
    const s = status.toLowerCase();
    if (s === "safe") return "#16a34a";
    if (s === "unsafe") return "#dc2626";
    return "#f59e0b";
  };

  const memoStations = useMemo(() => stations, [stations]);

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-white rounded-2xl shadow-xl">
        Loading map...
      </div>
    );
  }

  if (!stations.length) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-white rounded-2xl shadow-xl">
        No water stations available.
      </div>
    );
  }

  return (
    <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl">
      <MapContainer
        center={[20, 0]}
        zoom={3}
        minZoom={3}
        maxZoom={18}
        zoomControl={false}
        scrollWheelZoom
        zoomDelta={0.25}
        zoomSnap={0.25}
        worldCopyJump={true}
        maxBounds={[
          [-85, -180],
          [85, 180]
        ]}
        className="h-full w-full"
      >
        <ZoomControl position="bottomleft" />

        <LayersControl position="topright">

          <LayersControl.BaseLayer checked name="Light Map">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap & CARTO"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Dark Map">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap & CARTO"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
            />
          </LayersControl.BaseLayer>

        </LayersControl>

        <AutoFit stations={memoStations} />

        <MarkerClusterGroup
          chunkedLoading
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          maxClusterRadius={50}
        >
          {memoStations.map((station) => (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={createWaterIcon(getColor(station.status))}
            >
              <Popup>
                <div style={{ minWidth: 220 }}>
                  <h3 style={{ fontWeight: 600, marginBottom: 8 }}>
                    {station.station_name}
                  </h3>
                  <div>pH: {station.ph}</div>
                  <div>Turbidity: {station.turbidity}</div>
                  <div>Dissolved Oxygen: {station.dissolved_oxygen}</div>
                  <div
                    style={{
                      marginTop: 8,
                      fontWeight: 600,
                      color: getColor(station.status)
                    }}
                  >
                    Status: {station.status}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <Legend />
    </div>
  );
}