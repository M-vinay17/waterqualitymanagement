import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Map showing water stations with status color-coded markers
export default function WaterMap({ stations }) {
  // Fallback dummy stations if none are provided
  const defaultStations = [
    { id: 1, name: 'Station A', lat: 37.7749, lng: -122.4194, status: 'safe', ph: 7.2, turbidity: 1.1, do: 8.2 },
    { id: 2, name: 'Station B', lat: 37.7849, lng: -122.4094, status: 'warning', ph: 6.5, turbidity: 3.4, do: 6.9 },
    { id: 3, name: 'Station C', lat: 37.7649, lng: -122.4294, status: 'contaminated', ph: 5.8, turbidity: 8.2, do: 3.4 },
  ]

  const list = stations && stations.length ? stations : defaultStations

  const center = [list[0].lat, list[0].lng]

  const colorFor = (status) => {
    if (status === 'safe') return 'green'
    if (status === 'warning') return 'yellow'
    return 'red'
  }

  return (
    <div className="h-72 sm:h-96 rounded-lg overflow-hidden shadow-sm">
      <MapContainer center={center} zoom={13} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {list.map((s) => (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lng]}
            radius={10}
            pathOptions={{ color: colorFor(s.status), fillColor: colorFor(s.status), fillOpacity: 0.8 }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{s.name}</div>
                <div>pH: {s.ph}</div>
                <div>Turbidity: {s.turbidity} NTU</div>
                <div>Dissolved O₂: {s.do} mg/L</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
