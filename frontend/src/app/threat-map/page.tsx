"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import dynamic from "next/dynamic";

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
  const [threats, setThreats] = useState<any[]>([]);

  const highThreats = threats.filter(
    (threat) => threat.severity === "HIGH"
  ).length;

  const activeIncidents = threats.length;

  const regionsMonitored = new Set(
    threats.map((threat) => threat.country)
  ).size;

  const telemetryNodes = threats.length;

  useEffect(() => {
    fetch("http://127.0.0.1:8000/threat-map/events")
      .then((response) => response.json())
      .then((data) => {
        setThreats(data);
      })
      .catch((error) => {
        console.error("Threat map fetch error:", error);
      });
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/events");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const liveThreat = {
        id: Date.now(),
        country: "United States",
        city: "New York",
        latitude: 40.7128,
        longitude: -74.006,
        threat_type: data.type,
        severity: data.severity,
        message: data.message,
        timestamp: data.timestamp,
      };

      setThreats((previousThreats) => [
        liveThreat,
        ...previousThreats.slice(0, 9),
      ]);
    };

    socket.onerror = (error) => {
      console.warn("Threat map websocket error:", error);
    };

    return () => {
      socket.close();
    };
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