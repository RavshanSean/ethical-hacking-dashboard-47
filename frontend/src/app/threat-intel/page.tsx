"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Activity, Database, ListChecks, ShieldAlert } from "lucide-react";

type IOCItem = {
  id?: number;
  ioc_type?: string;
  value?: string;
  severity?: string;
  description?: string;
  source?: string;
};

type IOCTypeCount = {
  type?: string;
  count?: number;
};

type ThreatIntelData = {
  ioc_total?: number;
  high_iocs?: number;
  medium_iocs?: number;
  low_iocs?: number;
  recent_iocs?: IOCItem[];
  ioc_types?: IOCTypeCount[];
  status?: string;
};

type SecuritySummaryResponse = {
  threat_intel?: ThreatIntelData;
};

export default function ThreatIntelPage() {
  const [data, setData] = useState<ThreatIntelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadThreatIntel() {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch(`/reports/security-summary`);

      if (!response.ok) {
        throw new Error("Failed to load ThreatIntel data");
      }

      const result: SecuritySummaryResponse = await response.json();
      setData(result.threat_intel || {});
    } catch (error) {
      console.error("ThreatIntel fetch error:", error);
      setError("ThreatIntel data is currently unavailable.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadThreatIntel();
  }, []);

  const iocs = data?.recent_iocs || [];
  const iocTypes = data?.ioc_types || [];

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-7xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
              RavShield Intelligence
            </p>

            <h1 className="mt-2 text-4xl font-bold">ThreatIntel</h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Local indicators of compromise, reputation signals, and RavShield
              threat intelligence records.
            </p>

            {loading && (
              <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-6 text-sm text-cyan-200">
                Loading ThreatIntel records...
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-300">
                <p>{error}</p>
                <button onClick={loadThreatIntel} className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/20">
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard title="Total IOCs" value={data?.ioc_total ?? 0} icon={<Database className="text-cyan-300" />} color="text-cyan-300" />
                  <StatCard title="High IOCs" value={data?.high_iocs ?? 0} icon={<ShieldAlert className="text-red-400" />} color="text-red-400" />
                  <StatCard title="Medium IOCs" value={data?.medium_iocs ?? 0} icon={<Activity className="text-yellow-300" />} color="text-yellow-300" />
                  <StatCard title="IOC Types" value={iocTypes.length} icon={<ListChecks className="text-green-400" />} color="text-green-400" />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                  <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-6 xl:col-span-2">
                    <h2 className="text-2xl font-semibold text-cyan-300">Recent Indicators</h2>
                    <div className="mt-5 space-y-4">
                      {iocs.length === 0 && <p className="rounded-xl border border-white/5 bg-black/35 p-4 text-sm text-gray-500">No IOC records found yet.</p>}
                      {iocs.map((ioc, index) => (
                        <div key={ioc.id ?? index} className="rounded-xl border border-white/5 bg-black/35 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="break-all font-semibold text-white">{ioc.ioc_type || "IOC"}: {ioc.value || "Unknown"}</p>
                            <SeverityBadge severity={ioc.severity || "UNKNOWN"} />
                          </div>
                          <p className="mt-2 text-sm text-gray-400">{ioc.description || "No description available."}</p>
                          <p className="mt-2 text-xs text-gray-500">Source: {ioc.source || "Unknown"}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-6">
                    <h2 className="text-xl font-semibold text-cyan-300">IOC Types</h2>
                    <div className="mt-5 space-y-3">
                      {iocTypes.length === 0 && <p className="rounded-xl border border-white/5 bg-black/35 p-4 text-sm text-gray-500">No IOC type counts available.</p>}
                      {iocTypes.map((item, index) => (
                        <div key={item.type || index} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/35 p-3">
                          <span className="text-sm text-gray-300">{item.type || "UNKNOWN"}</span>
                          <span className="text-sm font-bold text-cyan-300">{item.count ?? 0}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                      <p className="text-sm font-semibold text-green-300">Status</p>
                      <p className="mt-2 text-sm text-gray-300">{data?.status || "ThreatIntel status unavailable."}</p>
                    </div>
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

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string; }) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-5">
      <div className="flex items-center gap-3">{icon}<p className="text-sm text-gray-400">{title}</p></div>
      <p className={`mt-4 text-4xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const className = severity === "HIGH" ? "bg-red-500/10 text-red-300" : severity === "MEDIUM" ? "bg-yellow-500/10 text-yellow-300" : severity === "LOW" ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-500/10 text-slate-300";
  return <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${className}`}>{severity}</span>;
}