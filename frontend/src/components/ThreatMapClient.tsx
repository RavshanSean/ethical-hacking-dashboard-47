"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
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
  if (severity === "HIGH") return "#dc2626";
  if (severity === "MEDIUM") return "#ca8a04";
  return "#16a34a";
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

  const threatLines = events.slice(0, 5).map((event, index, array) => {
    const nextEvent = array[index + 1];

    if (!nextEvent) return null;

    return [
      [event.latitude, event.longitude],
      [nextEvent.latitude, nextEvent.longitude],
    ] as [number, number][];
  });

  return (
    <div className="h-[620px] overflow-hidden rounded-2xl border border-cyan-500/20 bg-black">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={6}
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          noWrap={true}
        />

        {threatLines.map((line, index) =>
          line ? (
            <Polyline
              key={index}
              positions={line}
              pathOptions={{
                color: "#dc2626",
                weight: 1.2,
                opacity: 0.55,
              }}
            />
          ) : null
        )}

        {events.map((event) => {
          const color = getSeverityColor(event.severity);

          return (
            <React.Fragment key={event.id}>
              <CircleMarker
                center={[event.latitude, event.longitude]}
                radius={14}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.08,
                  opacity: 0.2,
                  weight: 0,
                }}
              />

              <CircleMarker
                center={[event.latitude, event.longitude]}
                radius={8}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.12,
                  opacity: 0.45,
                  weight: 1,
                }}
              />

              <CircleMarker
                center={[event.latitude, event.longitude]}
                radius={3.5}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 1,
                  opacity: 1,
                  weight: 1,
                }}
              >
                <Popup>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>
                        {event.city}, {event.country}
                      </strong>
                    </p>
                    <p>Type: {event.threat_type}</p>
                    <p>Severity: {event.severity}</p>
                    <p>{event.message}</p>
                    <p>{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}