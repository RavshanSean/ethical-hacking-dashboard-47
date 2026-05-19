"use client";

import { useEffect, useState } from "react";

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

      const response = await fetch(
        "http://127.0.0.1:8000/stats"
      );

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
      color: "#ef4444",
    },
    {
      name: "MEDIUM",
      value: stats.medium_threats,
      color: "#facc15",
    },
    {
      name: "LOW",
      value: stats.low_threats,
      color: "#22c55e",
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

      <div className="h-[350px]">

        <ResponsiveContainer width="100%" height="100%">

          <PieChart>

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >

              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              ))}

            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}