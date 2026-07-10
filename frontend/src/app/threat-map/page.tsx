"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import dynamic from "next/dynamic";
import { API_BASE_URL } from "@/config/api";
import {
  Activity,
  Globe,
  Radar,
  ShieldAlert,
} from "lucide-react";

const ThreatMapClient = dynamic(
  () => import("@/components/ThreatMapClient"),
  {
    ssr: false,
  }
);

type CountrySummary = {
  country?: string;
  count?: number;
};

type ThreatMapSummary = {
  total_events?: number;
  high_events?: number;
  mapped_events?: number;
  countries?: CountrySummary[];
};

type UnmappedEvent = {
  id?: number;
  threat_type?: string;
  severity?: string;
  message?: string;
  timestamp?: string;
};

export default function ThreatMapPage() {
  const [summary, setSummary] = useState<ThreatMapSummary | null>(null);
  const [unmappedEvents, setUnmappedEvents] = useState<UnmappedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadThreatMapData() {
    setLoading(true);
    setError("");

    try {
      const [summaryResponse, unmappedResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/threat-map/summary`),
        fetch(`${API_BASE_URL}/threat-map/unmapped-events`),
      ]);

      if (!summaryResponse.ok || !unmappedResponse.ok) {
        throw new Error("Failed to load threat map data");
      }

      const summaryData = await summaryResponse.json();
      const unmappedData = await unmappedResponse.json();

      setSummary(summaryData);
      setUnmappedEvents(
        Array.isArray(unmappedData.items)
          ? unmappedData.items
          : []
      );
    } catch (error) {
      console.error("Threat map data fetch failed:", error);
      setError("Threat map telemetry is currently unavailable.");
      setSummary(null);
      setUnmappedEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadThreatMapData();
  }, []);

  const highThreats = summary?.high_events ?? 0;
  const activeIncidents = summary?.total_events ?? 0;
  const regionsMonitored = summary?.countries?.length ?? 0;
  const telemetryNodes = summary?.mapped_events ?? 0;
  const telemetryLive = !loading && !error && Boolean(summary);

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
                  Global Intelligence
                </p>

                <h1 className="mt-2 text-4xl font-bold">
                  Threat Map
                </h1>

                <p className="mt-3 max-w-3xl text-gray-400">
                  Monitor verified threat locations, suspicious behavior
                  patterns, and live cyber telemetry.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-[#0b1220] px-5 py-4">
                <Radar
                  className={
                    telemetryLive
                      ? "text-cyan-300"
                      : "text-slate-500"
                  }
                  size={28}
                />

                <div>
                  <p className="text-xs text-gray-500">
                    Threat Monitoring
                  </p>

                  <p
                    className={`text-lg font-bold ${
                      telemetryLive
                        ? "text-cyan-300"
                        : "text-slate-400"
                    }`}
                  >
                    {loading
                      ? "LOADING"
                      : telemetryLive
                      ? "ACTIVE"
                      : "UNAVAILABLE"}
                  </p>
                </div>
              </div>
            </div>

            {loading && (
              <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-6 text-sm text-cyan-200">
                Loading threat map summary and location telemetry...
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-300">
                <p>{error}</p>

                <button
                  onClick={loadThreatMapData}
                  className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/20"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && summary && (
              <>
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="High Threats"
                    value={highThreats}
                    icon={<ShieldAlert className="text-red-400" />}
                    borderColor="border-red-500/20"
                    textColor="text-red-400"
                  />

                  <StatCard
                    title="Active Incidents"
                    value={activeIncidents}
                    icon={<Activity className="text-yellow-300" />}
                    borderColor="border-yellow-500/20"
                    textColor="text-yellow-300"
                  />

                  <StatCard
                    title="Regions Monitored"
                    value={regionsMonitored}
                    icon={<Globe className="text-green-400" />}
                    borderColor="border-green-500/20"
                    textColor="text-green-400"
                  />

                  <StatCard
                    title="Telemetry Nodes"
                    value={telemetryNodes}
                    icon={<Radar className="text-cyan-300" />}
                    borderColor="border-cyan-500/20"
                    textColor="text-cyan-300"
                  />
                </div>

                <div className="mt-6">
                  <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-6">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="text-2xl font-semibold text-cyan-300">
                        Global Threat Activity
                      </h2>

                      <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                        LIVE TELEMETRY
                      </span>
                    </div>

                    <ThreatMapClient />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-[#0b1220] p-6">
                  <h2 className="text-xl font-semibold text-yellow-300">
                    Events Without Location
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    These are real security events, but no verified geographic
                    coordinates were available.
                  </p>

                  <div className="mt-4 space-y-3">
                    {unmappedEvents.length === 0 && (
                      <div className="rounded-xl border border-white/5 bg-black/35 p-4 text-sm text-slate-500">
                        No unmapped security events available.
                      </div>
                    )}

                    {unmappedEvents.slice(0, 6).map((event, index) => (
                      <div
                        key={event.id ?? index}
                        className="rounded-xl border border-white/5 bg-black/35 p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-semibold text-white">
                            {event.threat_type || "UNKNOWN_EVENT"}
                          </p>

                          <SeverityBadge
                            severity={event.severity || "UNKNOWN"}
                          />
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          {event.message || "No event message available."}
                        </p>

                        {event.timestamp && (
                          <p className="mt-2 text-xs text-slate-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  borderColor,
  textColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  borderColor: string;
  textColor: string;
}) {
  return (
    <div className={`rounded-2xl border ${borderColor} bg-[#0b1220] p-5`}>
      <div className="flex items-center gap-3">
        {icon}

        <p className="text-sm text-gray-400">
          {title}
        </p>
      </div>

      <p className={`mt-4 text-4xl font-bold ${textColor}`}>
        {value}
      </p>
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: string;
}) {
  const className =
    severity === "HIGH"
      ? "bg-red-500/10 text-red-300"
      : severity === "MEDIUM"
      ? "bg-yellow-500/10 text-yellow-300"
      : severity === "LOW"
      ? "bg-emerald-500/10 text-emerald-300"
      : "bg-slate-500/10 text-slate-300";

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${className}`}
    >
      {severity}
    </span>
  );
}