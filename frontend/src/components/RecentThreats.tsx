"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

type Threat = {
  id: number;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
};

export default function RecentThreats() {
  const [threats, setThreats] = useState<Threat[]>([]);

  async function loadThreats() {
    try {
      const response = await apiFetch(`/stats/recent-threats`
      );

      const data = await response.json();

      setThreats(data.threats || []);
    } catch (error) {
      console.error(
        "Failed to load recent threats:",
        error
      );
    }
  }

  useEffect(() => {
    loadThreats();

    const interval = setInterval(() => {
      loadThreats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5">
      <h3 className="text-lg font-semibold text-white">
        Recent Threats
      </h3>

      <div className="mt-4 space-y-3">
        {threats.length === 0 && (
          <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-sm text-slate-400">
            No recent threats detected.
          </div>
        )}

        {threats.map((threat) => (
          <div
            key={threat.id}
            className="rounded-xl border border-white/5 bg-black/30 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {threat.type.replaceAll("_", " ")}
              </span>

              <span
                className={`text-xs font-bold ${
                  threat.severity === "HIGH"
                    ? "text-red-400"
                    : threat.severity === "MEDIUM"
                    ? "text-yellow-300"
                    : "text-green-400"
                }`}
              >
                {threat.severity}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              {threat.message}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {new Date(
                threat.timestamp
              ).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}