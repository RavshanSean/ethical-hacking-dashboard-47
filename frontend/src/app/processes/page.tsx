"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { API_BASE_URL } from "@/config/api";
import { Activity, Cpu, Database } from "lucide-react";

type ProcessItem = {
  pid: number;
  name: string;
  username: string;
  status: string;
  cpu_percent: number;
  memory_mb: number;
};

type ProcessesResponse = {
  total: number;
  processes: ProcessItem[];
};

export default function ProcessesPage() {
  const [data, setData] = useState<ProcessesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProcesses() {
    try {
      const response = await fetch(`${API_BASE_URL}/processes`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to load processes:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProcesses();

    const interval = setInterval(() => {
      loadProcesses();
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
              Endpoint Activity
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Processes
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Monitor live running processes, memory usage, CPU activity, and
              execution status from the local endpoint.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <StatCard
                title="Total Processes"
                value={data ? String(data.total) : "--"}
                icon={<Activity />}
              />

              <StatCard
                title="Displayed"
                value={data ? String(data.processes.length) : "--"}
                icon={<Database />}
              />

              <StatCard
                title="Refresh"
                value="5s"
                icon={<Cpu />}
              />
            </div>

            <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                    Process Table
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Live Running Processes
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
                      <th className="px-4 py-3">Process</th>
                      <th className="px-4 py-3">PID</th>
                      <th className="px-4 py-3">CPU</th>
                      <th className="px-4 py-3">RAM</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {loading && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-slate-400"
                        >
                          Loading processes...
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      data?.processes.map((process) => (
                        <tr
                          key={process.pid}
                          className="bg-black/20 transition hover:bg-cyan-400/5"
                        >
                          <td className="px-4 py-3 font-medium text-white">
                            {process.name}
                          </td>

                          <td className="px-4 py-3 text-slate-400">
                            {process.pid}
                          </td>

                          <td className="px-4 py-3 text-cyan-300">
                            {process.cpu_percent}%
                          </td>

                          <td className="px-4 py-3 text-slate-300">
                            {process.memory_mb} MB
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                process.status === "running"
                                  ? "bg-emerald-400/10 text-emerald-300"
                                  : "bg-slate-400/10 text-slate-300"
                              }`}
                            >
                              {process.status}
                            </span>
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

      <h3 className="mt-2 text-3xl font-semibold text-white">
        {value}
      </h3>
    </div>
  );
}