"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { API_BASE_URL } from "@/config/api";
import { Activity, Download, Network, Upload } from "lucide-react";

type Connection = {
  local_address: string;
  remote_address: string;
  status: string;
  pid: number | null;
};

type NetworkData = {
  bytes_sent: number;
  bytes_received: number;
  packets_sent: number;
  packets_received: number;
  connections_count: number;
  connections: Connection[];
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

  async function loadNetwork() {
    try {
      const response = await fetch(`${API_BASE_URL}/network`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to load network data:", error);
    }
  }

  useEffect(() => {
    loadNetwork();

    const interval = setInterval(() => {
      loadNetwork();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020711] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-7xl">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
              Network Telemetry
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Network Monitor
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Inspect live network traffic counters, packet flow, and active
              endpoint connections.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
              <StatCard
                title="Bytes Sent"
                value={data ? formatBytes(data.bytes_sent) : "--"}
                icon={<Upload />}
              />

              <StatCard
                title="Bytes Received"
                value={data ? formatBytes(data.bytes_received) : "--"}
                icon={<Download />}
              />

              <StatCard
                title="Packets Sent"
                value={data ? String(data.packets_sent) : "--"}
                icon={<Activity />}
              />

              <StatCard
                title="Connections"
                value={data ? String(data.connections_count) : "--"}
                icon={<Network />}
              />
            </div>

            <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                    Active Connections
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Network Sessions
                  </h2>
                </div>

                <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  LIVE
                </span>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/50 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Local</th>
                      <th className="px-4 py-3">Remote</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">PID</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {data?.connections.map((connection, index) => (
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

                    {!data && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-center text-slate-400"
                        >
                          Loading network data...
                        </td>
                      </tr>
                    )}
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

      <h3 className="mt-2 text-2xl font-semibold text-white">
        {value}
      </h3>
    </div>
  );
}