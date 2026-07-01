"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { API_BASE_URL } from "@/config/api";
import { Database, ShieldAlert, Activity, ListChecks } from "lucide-react";

export default function ThreatIntelPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/reports/security-summary`)
      .then((response) => response.json())
      .then((result) => setData(result.threat_intel))
      .catch((error) => console.error("ThreatIntel fetch error:", error));
  }, []);

  const iocs = data?.recent_iocs || [];

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-7xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
              RavShield Intelligence
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              ThreatIntel
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Local indicators of compromise, reputation signals, and RavShield threat intelligence records.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-4">
              <StatCard
                title="Total IOCs"
                value={data?.ioc_total || 0}
                icon={<Database className="text-cyan-300" />}
                color="text-cyan-300"
              />

              <StatCard
                title="High IOCs"
                value={data?.high_iocs || 0}
                icon={<ShieldAlert className="text-red-400" />}
                color="text-red-400"
              />

              <StatCard
                title="Medium IOCs"
                value={data?.medium_iocs || 0}
                icon={<Activity className="text-yellow-300" />}
                color="text-yellow-300"
              />

              <StatCard
                title="IOC Types"
                value={data?.ioc_types?.length || 0}
                icon={<ListChecks className="text-green-400" />}
                color="text-green-400"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-6">
                <h2 className="text-2xl font-semibold text-cyan-300">
                  Recent Indicators
                </h2>

                <div className="mt-5 space-y-4">
                  {iocs.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No IOC records found yet.
                    </p>
                  )}

                  {iocs.map((ioc: any) => (
                    <div
                      key={ioc.id}
                      className="rounded-xl border border-white/5 bg-black/35 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">
                          {ioc.ioc_type}: {ioc.value}
                        </p>

                        <span
                          className={`text-xs font-bold ${
                            ioc.severity === "HIGH"
                              ? "text-red-400"
                              : ioc.severity === "MEDIUM"
                              ? "text-yellow-300"
                              : "text-green-400"
                          }`}
                        >
                          {ioc.severity}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-400">
                        {ioc.description || "No description available."}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        Source: {ioc.source}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-6">
                <h2 className="text-xl font-semibold text-cyan-300">
                  IOC Types
                </h2>

                <div className="mt-5 space-y-3">
                  {(data?.ioc_types || []).map((item: any) => (
                    <div
                      key={item.type}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-black/35 p-3"
                    >
                      <span className="text-sm text-gray-300">
                        {item.type}
                      </span>

                      <span className="text-sm font-bold text-cyan-300">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                  <p className="text-sm font-semibold text-green-300">
                    Status
                  </p>

                  <p className="mt-2 text-sm text-gray-300">
                    {data?.status || "Loading ThreatIntel status..."}
                  </p>
                </div>
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
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-5">
      <div className="flex items-center gap-3">
        {icon}
        <p className="text-sm text-gray-400">{title}</p>
      </div>

      <p className={`mt-4 text-4xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}