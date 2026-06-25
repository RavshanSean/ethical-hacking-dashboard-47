"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import dynamic from "next/dynamic";
import { API_BASE_URL } from "@/config/api";


const ThreatMapClient = dynamic(
  () => import("@/components/ThreatMapClient"),
  {
    ssr: false,
  }
);

import {
  Globe,
  ShieldAlert,
  Radar,
  Activity,
} from "lucide-react";

export default function ThreatMapPage() {

  const [summary, setSummary] = useState<any>(null);
  const [unmappedEvents, setUnmappedEvents] = useState<any[]>([]);

  const highThreats = summary?.high_events || 0;

  const activeIncidents = summary?.total_events || 0;

  const regionsMonitored = summary?.countries?.length || 0;

  const telemetryNodes = summary?.mapped_events || 0;

  useEffect(() => {
    fetch(`${API_BASE_URL}/threat-map/summary`)
      .then((response) => response.json())
      .then((data) => {
        setSummary(data);
      })
      .catch((error) => {
        console.error("Threat map summary fetch error:", error);
      });
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/threat-map/unmapped-events`)
      .then((response) => response.json())
      .then((data) => {
        setUnmappedEvents(data.items || []);
      })
      .catch((error) => {
        console.error("Unmapped events fetch error:", error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
                  Global Intelligence
                </p>

                <h1 className="mt-2 text-4xl font-bold">
                  Threat Map
                </h1>

                <p className="mt-3 max-w-3xl text-gray-400">
                  Monitor global threat activity, suspicious behavior patterns,
                  and live cyber telemetry.
                </p>
              </div>

              <div className="hidden items-center gap-3 rounded-2xl border border-cyan-500/20 bg-[#0b1220] px-5 py-4 md:flex">
                <Radar className="text-cyan-300" size={28} />

                <div>
                  <p className="text-xs text-gray-500">
                    Threat Monitoring
                  </p>

                  <p className="text-lg font-bold text-cyan-300">
                    ACTIVE
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-4">
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
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-cyan-300">
                    Global Threat Activity
                  </h2>

                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                    LIVE MAP
                  </span>
                </div>

                <ThreatMapClient />
              </div>
            </div>

            {unmappedEvents.length > 0 && (
              <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-[#0b1220] p-6">
                <h2 className="text-xl font-semibold text-yellow-300">
                  Events Without Location
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  These are real security events, but no verified geo coordinates were available.
                </p>

                <div className="mt-4 space-y-3">
                  {unmappedEvents.slice(0, 6).map((event) => (
                    <div
                      key={event.id}
                      className="rounded-xl border border-white/5 bg-black/35 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          {event.threat_type}
                        </p>

                        <span className="text-xs font-bold text-yellow-300">
                          {event.severity}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-400">
                        {event.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
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