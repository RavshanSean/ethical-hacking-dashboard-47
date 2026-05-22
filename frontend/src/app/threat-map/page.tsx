"use client";

import Sidebar from "@/components/Sidebar";
import {
  Globe,
  ShieldAlert,
  Radar,
  Activity,
} from "lucide-react";

const mockThreats = [
  {
    country: "Russia",
    type: "Phishing Activity",
    level: "HIGH",
  },
  {
    country: "China",
    type: "Botnet Traffic",
    level: "MEDIUM",
  },
  {
    country: "Germany",
    type: "Credential Stuffing",
    level: "LOW",
  },
  {
    country: "Brazil",
    type: "Malware Beacon",
    level: "HIGH",
  },
];

export default function ThreatMapPage() {
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
                  Monitor global threat activity, suspicious
                  behavior patterns, and live cyber telemetry.
                </p>
              </div>

              <div className="hidden md:flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-[#0b1220] px-5 py-4">
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

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="rounded-2xl border border-red-500/20 bg-[#0b1220] p-5">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-red-400" />

                  <p className="text-sm text-gray-400">
                    High Threats
                  </p>
                </div>

                <p className="mt-4 text-4xl font-bold text-red-400">
                  12
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/20 bg-[#0b1220] p-5">
                <div className="flex items-center gap-3">
                  <Activity className="text-yellow-300" />

                  <p className="text-sm text-gray-400">
                    Active Incidents
                  </p>
                </div>

                <p className="mt-4 text-4xl font-bold text-yellow-300">
                  34
                </p>
              </div>

              <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-5">
                <div className="flex items-center gap-3">
                  <Globe className="text-green-400" />

                  <p className="text-sm text-gray-400">
                    Regions Monitored
                  </p>
                </div>

                <p className="mt-4 text-4xl font-bold text-green-400">
                  89
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-5">
                <div className="flex items-center gap-3">
                  <Radar className="text-cyan-300" />

                  <p className="text-sm text-gray-400">
                    Telemetry Nodes
                  </p>
                </div>

                <p className="mt-4 text-4xl font-bold text-cyan-300">
                  241
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-cyan-300">
                    Global Threat Activity
                  </h2>

                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                    LIVE MAP
                  </span>
                </div>

              <div className="relative mt-6 h-[500px] overflow-hidden rounded-2xl border border-cyan-500/20 bg-black">
                <div className="absolute inset-0 opacity-20">
                  <div className="h-full w-full bg-[linear-gradient(rgba(0,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>

                <div className="absolute left-[18%] top-[30%] h-4 w-4 rounded-full bg-red-500 shadow-[0_0_20px_rgba(255,0,0,0.9)] animate-ping" />

                <div className="absolute left-[52%] top-[22%] h-4 w-4 rounded-full bg-yellow-300 shadow-[0_0_20px_rgba(255,255,0,0.9)] animate-ping" />

                <div className="absolute left-[74%] top-[38%] h-4 w-4 rounded-full bg-green-400 shadow-[0_0_20px_rgba(0,255,120,0.9)] animate-ping" />

                <div className="absolute left-[35%] top-[65%] h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.9)] animate-ping" />

                <div className="absolute left-[60%] top-[70%] h-4 w-4 rounded-full bg-red-500 shadow-[0_0_20px_rgba(255,0,0,0.9)] animate-ping" />

                <svg className="absolute inset-0 h-full w-full">
                  <line
                    x1="18%"
                    y1="30%"
                    x2="52%"
                    y2="22%"
                    stroke="rgba(0,255,255,0.5)"
                    strokeWidth="2"
                  />

                  <line
                    x1="52%"
                    y1="22%"
                    x2="74%"
                    y2="38%"
                    stroke="rgba(0,255,255,0.5)"
                    strokeWidth="2"
                  />

                  <line
                    x1="35%"
                    y1="65%"
                    x2="60%"
                    y2="70%"
                    stroke="rgba(0,255,255,0.5)"
                    strokeWidth="2"
                  />

                  <line
                    x1="18%"
                    y1="30%"
                    x2="35%"
                    y2="65%"
                    stroke="rgba(0,255,255,0.5)"
                    strokeWidth="2"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Globe
                      className="mx-auto text-cyan-300 opacity-80"
                      size={90}
                    />

                    <p className="mt-4 text-2xl font-bold text-cyan-300">
                      Global Telemetry Grid
                    </p>

                    <p className="mt-2 max-w-md text-sm text-gray-500">
                      Simulated cyber attack telemetry and threat
                      movement visualization.
                    </p>
                  </div>
                </div>
              </div>
              </div>

              <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-green-300">
                    Live Threat Feed
                  </h2>

                  <span className="text-xs text-green-400">
                    LIVE
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {mockThreats.map((threat, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-green-500/10 bg-black p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white">
                          {threat.country}
                        </p>

                        <span
                          className={`text-xs font-bold ${
                            threat.level === "HIGH"
                              ? "text-red-400"
                              : threat.level === "MEDIUM"
                              ? "text-yellow-300"
                              : "text-green-400"
                          }`}
                        >
                          {threat.level}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-400">
                        {threat.type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}