"use client";

import { apiFetch } from "@/lib/api";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Cpu,
  HardDrive,
  LoaderCircle,
  MemoryStick,
  Network,
  ShieldCheck,
} from "lucide-react";

type SystemScanResult = {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  network_status: string;
};

export default function SystemScanPage() {
  const [result, setResult] = useState<SystemScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runScan() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await apiFetch(`/system/scan`);

      if (!response.ok) {
        throw new Error("System scan failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("System scan failed:", error);
      setError("System scan failed. Backend telemetry may be unavailable.");
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

  const networkHealthy =
    result?.network_status?.toLowerCase() === "online" ||
    result?.network_status?.toLowerCase() === "connected";

  return (
    <div className="app-shell">
      <div className="flex">
        <Sidebar />

        <main className="app-main">
          <section className="app-frame">
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
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="animate-spin" size={18} />
                  Scanning...
                </span>
              ) : (
                "Run System Scan"
              )}
            </button>

            {!result && !loading && !error && (
              <div className="mt-8 rounded-2xl border border-white/5 bg-[#07111f]/90 p-6 text-sm text-slate-400">
                No system scan has been run yet.
              </div>
            )}

            {loading && (
              <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-6 text-sm text-cyan-200">
                Collecting CPU, memory, disk, and network telemetry...
              </div>
            )}

            {error && (
              <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-300">
                {error}
              </div>
            )}

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
                    value={result.network_status || "Unknown"}
                    status={networkHealthy ? "Healthy" : "Warning"}
                    icon={<Network />}
                  />
                </div>

                <div className="mt-8 rounded-2xl border border-emerald-400/15 bg-[#07111f]/90 p-6">
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="text-emerald-300" size={34} />

                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                        Overall System Score
                      </p>

                      <h2 className="mt-2 text-5xl font-semibold text-white">
                        {score}/100
                      </h2>

                      <p className="mt-2 text-sm text-slate-400">
                        Calculated from current CPU, RAM, and disk pressure.
                      </p>
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