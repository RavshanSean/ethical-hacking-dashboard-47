"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type StatsData = {
  total_events: number;
  high_threats: number;
  medium_threats: number;
  low_threats: number;
};

export default function ThreatChart() {

  const [stats, setStats] = useState<StatsData>({
    total_events: 0,
    high_threats: 0,
    medium_threats: 0,
    low_threats: 0,
  });

  async function loadStats() {

    try {
 
      const response = await fetch(`${API_BASE_URL}/stats`)

      const data = await response.json();

      setStats(data);

    } catch (error) {

      console.error("Failed to load chart stats:", error);
    }
  }

  useEffect(() => {

    loadStats();

    const interval = setInterval(() => {
      loadStats();
    }, 5000);

    return () => clearInterval(interval);

  }, []);

  const chartData = [
    {
      name: "HIGH",
      value: stats.high_threats,
      color: "#dc2626",
    },
    {
      name: "MEDIUM",
      value: stats.medium_threats,
      color: "#ca8a04",
    },
    {
      name: "LOW",
      value: stats.low_threats,
      color: "#16a34a",
    },
  ];

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-6">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-semibold text-cyan-300">
          Threat Distribution
        </h2>

        <span className="text-sm text-cyan-400">
          LIVE ANALYTICS
        </span>

      </div>

      {stats.total_events === 0 && (
        <p className="mb-4 text-sm text-slate-500">
          No threat distribution data available yet.
        </p>
      )}

      <div className="h-72 sm:h-80 lg:h-[350px]">

        <ResponsiveContainer width="100%" height="100%">

          <PieChart>

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={115}
              stroke="#020711"
              strokeWidth={2}
              label={{
                fontSize: 12,
                fontWeight: 400,
              }}
            >

              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              ))}

            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "#020711",
                border: "1px solid rgba(34, 211, 238, 0.18)",
                borderRadius: "12px",
                color: "#cbd5e1",
                fontSize: "12px",
                fontWeight: 400,
                boxShadow: "0 0 25px rgba(34, 211, 238, 0.08)",
              }}
              itemStyle={{
                fontSize: "12px",
                fontWeight: 400,
              }}
            />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}