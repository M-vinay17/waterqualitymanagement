import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  LayerGroup
} from "react-leaflet";

import MarkerClusterGroup from "react-leaflet-cluster";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const { BaseLayer, Overlay } = LayersControl;


/* ---------------- Marker Icons ---------------- */

function createIcon(color) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });
}

const greenIcon = createIcon("green");
const yellowIcon = createIcon("yellow");
const redIcon = createIcon("red");
const blueIcon = createIcon("blue");


export default function WaterMap() {

  const [stations, setStations] = useState([]);
  const [govStations, setGovStations] = useState([]);
  const [apiStatus, setApiStatus] = useState("checking");


/* ---------------- Load Local Stations ---------------- */

  const loadStations = async () => {

    try {

      const res = await axios.get(
        "http://localhost:8000/water/stations/latest"
      );

      setStations(res.data);

    } catch (err) {

      console.error("Backend station error:", err);

    }

  };


/* ---------------- Load Government Stations ---------------- */

  const loadGovStations = async () => {

    try {

      const res = await axios.get(
        "http://localhost:8000/water/india/stations"
      );

      setGovStations(res.data.stations || []);
      setApiStatus("online");

    } catch (err) {

      console.error("Government API error:", err);
      setApiStatus("offline");

    }

  };


/* ---------------- Marker Color Logic ---------------- */

  const getMarkerIcon = (status) => {

    if (status === "safe") return greenIcon;
    if (status === "warning") return yellowIcon;
    if (status === "danger") return redIcon;

    return blueIcon;
  };


/* ---------------- Initial Load ---------------- */

  useEffect(() => {

    loadStations();
    loadGovStations();

    const interval = setInterval(() => {
      loadGovStations();
    }, 10000);

    return () => clearInterval(interval);

  }, []);


  return (

    <div style={{ height: "600px", width: "100%", position: "relative" }}>


{/* ---------------- API Status Indicator ---------------- */}

      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "50px",
          zIndex: 1000,
          background: "white",
          padding: "6px 12px",
          borderRadius: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          fontWeight: "bold"
        }}
      >

        Government Water API :

        {" "}

        {apiStatus === "online" && (
          <span style={{ color: "green" }}>🟢 Online</span>
        )}

        {apiStatus === "offline" && (
          <span style={{ color: "red" }}>🔴 Offline</span>
        )}

        {apiStatus === "checking" && (
          <span style={{ color: "orange" }}>🟡 Checking</span>
        )}

      </div>


{/* ---------------- Map ---------------- */}

      <MapContainer
        center={[22.9734, 78.6569]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >

        <LayersControl position="topright">


{/* ---------------- Base Maps ---------------- */}

          <BaseLayer checked name="Street Map">

            <TileLayer
              attribution="OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

          </BaseLayer>


          <BaseLayer name="Satellite">

            <TileLayer
              attribution="Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />

          </BaseLayer>


          <BaseLayer name="Topographic">

            <TileLayer
              attribution="OpenTopoMap"
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />

          </BaseLayer>


{/* ---------------- Your Monitoring Stations ---------------- */}

          <Overlay checked name="Monitoring Stations">

            <LayerGroup>

              <MarkerClusterGroup>

                {stations.map((s, i) => {

                  const lat = Number(s.station?.latitude);
                  const lng = Number(s.station?.longitude);

                  if (
                    !lat ||
                    !lng ||
                    lat > 90 ||
                    lat < -90 ||
                    lng > 180 ||
                    lng < -180
                  ) return null;

                  return (

                    <Marker
                      key={i}
                      position={[lat, lng]}
                      icon={getMarkerIcon(s.safety_status)}
                    >

                      <Popup>

                        <div style={{ minWidth: "220px" }}>

                          <h3>{s.station.name}</h3>

                          <p><b>Location:</b> {s.station.location}</p>

                          <p><b>Managed By:</b> {s.station.managed_by}</p>

                          <p><b>Status:</b> {s.safety_status}</p>

                          {s.latest_reading && (
                            <p>
                              <b>{s.latest_reading.parameter}</b>
                              {" : "}
                              {s.latest_reading.value}
                            </p>
                          )}

                        </div>

                      </Popup>

                    </Marker>

                  );

                })}

              </MarkerClusterGroup>

            </LayerGroup>

          </Overlay>


{/* ---------------- Government Stations ---------------- */}

          <Overlay name="Government Monitoring Stations">

            <LayerGroup>

              <MarkerClusterGroup>

                {govStations.map((s, i) => {

                  if (!s.latitude || !s.longitude) return null;

                  return (

                    <Marker
                      key={i}
                      position={[s.latitude, s.longitude]}
                      icon={blueIcon}
                    >

                      <Popup>

                        <div>

                          <h3>{s.name}</h3>

                          <p><b>River:</b> {s.river}</p>

                          <p><b>District:</b> {s.district}</p>

                          <p><b>State:</b> {s.state}</p>

                        </div>

                      </Popup>

                    </Marker>

                  );

                })}

              </MarkerClusterGroup>

            </LayerGroup>

          </Overlay>

        </LayersControl>

      </MapContainer>

    </div>

  );
}