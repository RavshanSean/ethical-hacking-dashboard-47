"use client";

import { apiFetch } from "@/lib/api";
import { useCallback, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Activity,
  Download,
  LoaderCircle,
  Network,
  Upload,
  Radar,
  ShieldAlert,
} from "lucide-react";
import { useVisibilityPolling } from "@/lib/performance";

type Connection = {
  local_address?: string;
  remote_address?: string;
  status?: string;
  pid?: number | null;
};

type NetworkData = {
  bytes_sent?: number;
  bytes_received?: number;
  packets_sent?: number;
  packets_received?: number;
  connections_count?: number;
  connections?: Connection[];
};

type DiscoveredHost = {
  ip?: string;
  open_ports?: number[];
  risk_score?: number;
  risk_level?: string;
  reasons?: string[];
};

type DiscoveryData = {
  status?: string;
  local_ip?: string | null;
  private_range?: string | null;
  scanned_hosts_limit?: number;
  detected_count?: number;
  detected_hosts?: DiscoveredHost[];
  note?: string;
};

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${bytes} B`;
}

export default function NetworkPage() {
  const [data, setData] = useState<NetworkData | null>(null);
  const [networkError, setNetworkError] = useState("");
  const [discovery, setDiscovery] = useState<DiscoveryData | null>(null);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryError, setDiscoveryError] = useState("");

  const loadNetwork = useCallback(async () => {
    try {
      const response = await apiFetch(`/network`);

      if (!response.ok) {
        throw new Error("Failed to load network data");
      }

      const result = await response.json();

      setData(result);
      setNetworkError("");
    } catch (error) {
      console.error("Failed to load network data:", error);
      setNetworkError("Network telemetry is currently unavailable.");
    }
  }, []);

  async function runDiscovery() {
    setDiscoveryLoading(true);
    setDiscoveryError("");
    setDiscovery(null);

    try {
      const response = await apiFetch(`/network/discovery`);

      if (!response.ok) {
        throw new Error("Network discovery failed");
      }

      const result = await response.json();

      setDiscovery(result);
    } catch (error) {
      console.error("Failed to run network discovery:", error);
      setDiscoveryError("Private network discovery failed.");
    } finally {
      setDiscoveryLoading(false);
    }
  }

  useVisibilityPolling(loadNetwork, 8000);
  const connections = data?.connections || [];
  const detectedHosts = discovery?.detected_hosts || [];
  const telemetryLive = !networkError && Boolean(data);

  return (
    <div className="app-shell">
      <div className="flex">
        <Sidebar />

        <main className="app-main">
          <section className="app-frame">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
              Network Telemetry
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Network Monitor
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Inspect live network traffic, active endpoint connections, and
              private network discovery results from the backend machine.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
              <StatCard
                title="Bytes Sent"
                value={data ? formatBytes(data.bytes_sent ?? 0) : "--"}
                icon={<Upload />}
              />

              <StatCard
                title="Bytes Received"
                value={data ? formatBytes(data.bytes_received ?? 0) : "--"}
                icon={<Download />}
              />

              <StatCard
                title="Packets Sent"
                value={data ? String(data.packets_sent ?? 0) : "--"}
                icon={<Activity />}
              />

              <StatCard
                title="Connections"
                value={data ? String(data.connections_count ?? 0) : "--"}
                icon={<Network />}
              />
            </div>

            {networkError && (
              <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-300">
                {networkError}
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                    Private Network Intelligence
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Local Network Discovery
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Scans a small safe slice of the backend machine&apos;s local
                    network for reachable private IPv4 hosts.
                  </p>
                </div>

                <button
                  onClick={runDiscovery}
                  disabled={discoveryLoading}
                  className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-50"
                >
                  {discoveryLoading ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="animate-spin" size={18} />
                      Scanning...
                    </span>
                  ) : (
                    "Run Discovery"
                  )}
                </button>
              </div>

              {!discovery && !discoveryLoading && !discoveryError && (
                <div className="mt-6 rounded-xl border border-white/5 bg-black/35 p-4 text-sm text-slate-500">
                  No discovery scan has been run yet.
                </div>
              )}

              {discoveryLoading && (
                <div className="mt-6 rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-4 text-sm text-cyan-200">
                  Discovering reachable private IPv4 hosts and checking common
                  ports...
                </div>
              )}

              {discoveryError && (
                <div className="mt-6 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
                  {discoveryError}
                </div>
              )}

              {discovery && (
                <>
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <StatCard
                      title="Local IP"
                      value={discovery.local_ip || "--"}
                      icon={<Radar />}
                    />

                    <StatCard
                      title="Private Range"
                      value={discovery.private_range || "--"}
                      icon={<Network />}
                    />

                    <StatCard
                      title="Hosts Found"
                      value={String(discovery.detected_count ?? 0)}
                      icon={<Activity />}
                    />

                    <StatCard
                      title="Scan Limit"
                      value={String(discovery.scanned_hosts_limit ?? 0)}
                      icon={<ShieldAlert />}
                    />
                  </div>

                  {discovery.note && (
                    <p className="mt-5 rounded-xl border border-yellow-400/10 bg-yellow-400/5 p-4 text-sm text-yellow-200">
                      {discovery.note}
                    </p>
                  )}

                  <div className="mt-6 space-y-4">
                    {detectedHosts.length === 0 && (
                      <p className="rounded-xl border border-white/5 bg-black/35 p-4 text-sm text-slate-400">
                        No reachable hosts found in the safe scan window.
                      </p>
                    )}

                    {detectedHosts.map((host, index) => {
                      const openPorts = host.open_ports || [];
                      const reasons = host.reasons || [];
                      const riskLevel = host.risk_level || "INFO";
                      const riskScore = host.risk_score ?? 0;

                      return (
                        <div
                          key={host.ip || index}
                          className="rounded-xl border border-white/5 bg-black/35 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-white">
                                {host.ip || "Unknown host"}
                              </p>

                              <p className="mt-1 text-sm text-slate-400">
                                Open ports:{" "}
                                {openPorts.length > 0
                                  ? openPorts.join(", ")
                                  : "None detected"}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                riskLevel === "HIGH"
                                  ? "bg-red-500/10 text-red-300"
                                  : riskLevel === "MEDIUM"
                                  ? "bg-yellow-500/10 text-yellow-300"
                                  : riskLevel === "LOW"
                                  ? "bg-cyan-500/10 text-cyan-300"
                                  : "bg-green-500/10 text-green-300"
                              }`}
                            >
                              {riskLevel} · {riskScore}/100
                            </span>
                          </div>

                          {reasons.length > 0 ? (
                            <ul className="mt-3 space-y-1 text-sm text-slate-400">
                              {reasons.map((reason, reasonIndex) => (
                                <li key={reasonIndex}>• {reason}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-3 text-sm text-slate-500">
                              No risk reasons returned.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                    Active Connections
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Network Sessions
                  </h2>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs ${
                    telemetryLive
                      ? "border-emerald-400/15 bg-emerald-400/10 text-emerald-300"
                      : "border-slate-400/15 bg-slate-400/10 text-slate-300"
                  }`}
                >
                  {telemetryLive ? "LIVE" : "UNAVAILABLE"}
                </span>
              </div>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-white/5">
                <table className="min-w-[760px] w-full text-left text-sm">
                  <thead className="bg-black/50 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Local</th>
                      <th className="px-4 py-3">Remote</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">PID</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {!data && !networkError && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-center text-slate-400"
                        >
                          Loading network data...
                        </td>
                      </tr>
                    )}

                    {data && connections.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-center text-slate-400"
                        >
                          No active network connections returned by backend.
                        </td>
                      </tr>
                    )}

                    {connections.map((connection, index) => (
                      <tr
                        key={index}
                        className="bg-black/20 transition hover:bg-cyan-400/5"
                      >
                        <td className="px-4 py-3 text-slate-300">
                          {connection.local_address || "N/A"}
                        </td>

                        <td className="px-4 py-3 text-slate-400">
                          {connection.remote_address || "N/A"}
                        </td>

                        <td className="px-4 py-3">
                          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                            {connection.status || "UNKNOWN"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-400">
                          {connection.pid ?? "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5">
      <div className="text-cyan-300">{icon}</div>

      <p className="mt-4 text-sm text-slate-400">{title}</p>

      <h3 className="mt-2 break-all text-2xl font-semibold text-white">
        {value}
      </h3>
    </div>
  );
}