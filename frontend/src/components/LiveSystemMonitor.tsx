"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import { Cpu, HardDrive, MemoryStick, Wifi } from "lucide-react";

type SystemMetrics = {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  network_status: string;
};

export default function LiveSystemMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [error, setError] = useState("");

  async function loadMetrics() {
    try {
      const response = await fetch(`${API_BASE_URL}/system/scan`);

      if (!response.ok) {
        throw new Error("Failed to load system metrics");
      }

      const data = await response.json();

      setMetrics(data);
      setError("");
    } catch (error) {
      console.error("Failed to load system metrics:", error);
      setError("System metrics are currently unavailable.");
    }
  }

  useEffect(() => {
    loadMetrics();

    const interval = setInterval(() => {
      loadMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      label: "CPU",
      value: metrics ? `${metrics.cpu_percent}%` : "--",
      icon: Cpu,
    },
    {
      label: "RAM",
      value: metrics ? `${metrics.memory_percent}%` : "--",
      icon: MemoryStick,
    },
    {
      label: "Disk",
      value: metrics ? `${metrics.disk_percent}%` : "--",
      icon: HardDrive,
    },
    {
      label: "Network",
      value: metrics ? metrics.network_status : "--",
      icon: Wifi,
    },
  ];

  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5 shadow-[0_0_35px_rgba(0,255,220,0.05)]">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
        Monitor
      </p>

      <h3 className="mt-2 text-xl font-semibold text-white">
        Live System Monitor
      </h3>

      {error && (
        <p className="mt-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-4">
        {cards.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/5 bg-black/35 p-4"
            >
              <Icon className="text-cyan-300" size={22} />

              <p className="mt-3 text-sm text-slate-400">
                {metric.label}
              </p>

              <p className="mt-1 text-2xl font-semibold text-white">
                {metric.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}