"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

type ThreatEvent = {
  id: number;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  threat_type: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  timestamp: string;
};

function getSeverityColor(severity: string) {
  if (severity === "HIGH") return "#7f1d1d";
  if (severity === "MEDIUM") return "#854d0e";
  return "#14532d";
}

export default function ThreatMapClient() {
  const [events, setEvents] = useState<ThreatEvent[]>([]);

useEffect(() => {
  fetch("http://127.0.0.1:8000/threat-map/events")
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        console.error("Threat map data is not an array:", data);
        setEvents([]);
      }
    })
    .catch((error) => console.error("Threat map fetch error:", error));
}, []);

  return (
    <div className="h-[620px] overflow-hidden rounded-2xl border border-cyan-500/20 bg-black">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {events.map((event) => (
          <CircleMarker
            key={event.id}
            center={[event.latitude, event.longitude]}
            radius={10}
            pathOptions={{
              color: getSeverityColor(event.severity),
              fillColor: getSeverityColor(event.severity),
              fillOpacity: 0.75,
            }}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p><strong>{event.city}, {event.country}</strong></p>
                <p>Type: {event.threat_type}</p>
                <p>Severity: {event.severity}</p>
                <p>{event.message}</p>
                <p>{new Date(event.timestamp).toLocaleString()}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}