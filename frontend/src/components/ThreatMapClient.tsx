"use client";
import { API_BASE_URL } from "@/config/api";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap,
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

type IpLookupResult = {
  ip: string;
  country: string;
  region: string;
  city: string;
  isp: string;
  org: string;
  asn: string;
  lat: number;
  lon: number;
};

function getSeverityColor(severity: string) {
  if (severity === "HIGH") return "#dc2626";
  if (severity === "MEDIUM") return "#ca8a04";
  return "#16a34a";
}

function FlyToIpLocation({ result }: { result: IpLookupResult | null }) {
  const map = useMap();

  useEffect(() => {
    if (!result || result.lat === undefined || result.lon === undefined) {
      return;
    }

    map.flyTo([result.lat, result.lon], 12, {
      duration: 1.2,
    });
  }, [result, map]);

  return null;
}

export default function ThreatMapClient() {
  const [events, setEvents] = useState<ThreatEvent[]>([]);
  const [ip, setIp] = useState("8.8.8.8");
  const [ipResult, setIpResult] = useState<IpLookupResult | null>(null);
  const [ipLoading, setIpLoading] = useState(false);
  const [ipError, setIpError] = useState("");
  const [showIpMarker, setShowIpMarker] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/threat-map/events`)
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

  async function lookupIp() {
    setIpLoading(true);
    setIpError("");
    setShowIpMarker(false);

    try {
      const response = await fetch(`${API_BASE_URL}/ip-lookup/${ip}`)
      const data = await response.json();

      if (data.error || data.lat === null || data.lon === null) {
        setIpError("IP lookup failed or location unavailable.");
        setIpResult(null);
        return;
      }

      setIpResult(data);

      setTimeout(() => {
        setShowIpMarker(true);
      }, 1200);
    } catch (error) {
      console.error("IP lookup failed:", error);
      setIpError("IP lookup failed.");
      setIpResult(null);
    } finally {
      setIpLoading(false);
    }
  }

  const threatLines = events.slice(0, 5).map((event, index, array) => {
    const nextEvent = array[index + 1];

    if (!nextEvent) return null;

    return [
      [event.latitude, event.longitude],
      [nextEvent.latitude, nextEvent.longitude],
    ] as [number, number][];
  });

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
      <div className="h-[620px] overflow-hidden rounded-2xl border border-cyan-500/20 bg-black">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={2}
          maxZoom={15}
          maxBounds={[
            [-85, -180],
            [85, 180],
          ]}
          maxBoundsViscosity={1.0}
          worldCopyJump={false}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <FlyToIpLocation result={ipResult} />

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
                  weight: 0.8,
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
                    weight: 0.8,
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
                    weight: 0.8,
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

          {ipResult && showIpMarker && (
            <CircleMarker
              center={[ipResult.lat, ipResult.lon]}
              radius={5}
              pathOptions={{
                color: "#22d3ee",
                fillColor: "#22d3ee",
                fillOpacity: 0.9,
                opacity: 1,
                weight: 1.2,
              }}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>{ipResult.ip}</strong>
                  </p>
                  <p>
                    {ipResult.city}, {ipResult.region}, {ipResult.country}
                  </p>
                  <p>{ipResult.org}</p>
                  <p>{ipResult.asn}</p>
                </div>
              </Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-cyan-500/20 bg-[#07111f] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-cyan-300">
              IP Lookup
            </h3>

            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
              GEO TRACE
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Enter an IP address to view approximate network location and
            provider information.
          </p>

          <div className="mt-4 flex gap-2">
            <input
              value={ip}
              onChange={(event) => setIp(event.target.value)}
              placeholder="8.8.8.8"
              className="w-full rounded-xl border border-cyan-400/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
            />

            <button
              onClick={lookupIp}
              disabled={ipLoading || !ip.trim()}
              className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15 disabled:opacity-50"
            >
              {ipLoading ? "..." : "Trace"}
            </button>
          </div>

          {ipError && (
            <p className="mt-3 text-sm text-red-300">
              {ipError}
            </p>
          )}

          {ipResult && (
            <div className="mt-5 space-y-3 rounded-xl border border-cyan-400/10 bg-black/35 p-4 text-sm">
              <InfoRow label="IP" value={ipResult.ip} />
              <InfoRow label="Country" value={ipResult.country} />
              <InfoRow label="Region" value={ipResult.region} />
              <InfoRow label="City" value={ipResult.city} />
              <InfoRow label="ISP" value={ipResult.isp} />
              <InfoRow label="Org" value={ipResult.org} />
              <InfoRow label="ASN" value={ipResult.asn} />

              <p className="pt-2 text-xs text-slate-500">
                Location is approximate and based on public IP network data.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#07111f] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-emerald-300">
              Live Threat Feed
            </h3>

            <span className="text-xs text-emerald-300">
              LIVE
            </span>
          </div>

          <div className="mt-4 max-h-[350px] space-y-3 overflow-y-auto pr-1">
            {events.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-white/5 bg-black/45 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      {event.city}, {event.country}
                    </p>

                    <p className="mt-1 text-xs uppercase text-slate-500">
                      {event.threat_type}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {event.message}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-semibold ${
                      event.severity === "HIGH"
                        ? "text-red-300"
                        : event.severity === "MEDIUM"
                        ? "text-yellow-300"
                        : "text-emerald-300"
                    }`}
                  >
                    {event.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-2 last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-200">{value || "Unknown"}</span>
    </div>
  );
}