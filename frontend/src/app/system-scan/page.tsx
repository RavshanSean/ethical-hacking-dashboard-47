"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { API_BASE_URL } from "@/config/api";
import { Cpu, HardDrive, MemoryStick, Network, ShieldCheck } from "lucide-react";

type SystemScanResult = {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  network_status: string;
};

export default function SystemScanPage() {
  const [result, setResult] = useState<SystemScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runScan() {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/system/scan`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("System scan failed:", error);
    } finally {
      setLoading(false);
    }
  }

  const score = result
    ? Math.max(
        0,
        Math.round(
          100 -
            result.cpu_percent * 0.2 -
            result.memory_percent * 0.35 -
            result.disk_percent * 0.2
        )
      )
    : null;

  return (
    <div className="min-h-screen bg-[#020711] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-7xl">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
              Endpoint Diagnostics
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              System Scan
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Run a real-time local system health check using backend telemetry.
            </p>

            <button
              onClick={runScan}
              disabled={loading}
              className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-6 py-3 font-semibold text-cyan-300 transition hover:border-cyan-300/50 hover:bg-cyan-400/15 disabled:opacity-50"
            >
              {loading ? "Scanning..." : "Run System Scan"}
            </button>

            {result && (
              <>
                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    title="CPU"
                    value={`${result.cpu_percent}%`}
                    status={result.cpu_percent > 85 ? "Warning" : "Healthy"}
                    icon={<Cpu />}
                  />

                  <MetricCard
                    title="RAM"
                    value={`${result.memory_percent}%`}
                    status={result.memory_percent > 85 ? "Warning" : "Healthy"}
                    icon={<MemoryStick />}
                  />

                  <MetricCard
                    title="Disk"
                    value={`${result.disk_percent}%`}
                    status={result.disk_percent > 85 ? "Warning" : "Healthy"}
                    icon={<HardDrive />}
                  />

                  <MetricCard
                    title="Network"
                    value={result.network_status}
                    status="Healthy"
                    icon={<Network />}
                  />
                </div>

                <div className="mt-8 rounded-2xl border border-emerald-400/15 bg-[#07111f]/90 p-6">
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="text-emerald-300" size={34} />

                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                        Overall Security Score
                      </p>

                      <h2 className="mt-2 text-5xl font-semibold text-white">
                        {score}/100
                      </h2>
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

function MetricCard({
  title,
  value,
  status,
  icon,
}: {
  title: string;
  value: string;
  status: "Healthy" | "Warning";
  icon: React.ReactNode;
}) {
  const healthy = status === "Healthy";

  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5">
      <div className="flex items-center justify-between">
        <div className="text-cyan-300">{icon}</div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            healthy
              ? "bg-emerald-400/10 text-emerald-300"
              : "bg-yellow-400/10 text-yellow-300"
          }`}
        >
          {status}
        </span>
      </div>

      <p className="mt-5 text-sm text-slate-400">{title}</p>

      <h3 className="mt-2 text-3xl font-semibold text-white">
        {value}
      </h3>
    </div>
  );
}