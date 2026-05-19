"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type TimelinePoint = {
  time: string;
  low: number;
  medium: number;
  high: number;
  total: number;
};

export default function ThreatTimeline() {
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);

  async function loadTimeline() {
    try {
      const response = await fetch("http://127.0.0.1:8000/stats/timeline");
      const data = await response.json();

      setTimeline(data.timeline || []);
    } catch (error) {
      console.error("Failed to load timeline:", error);
    }
  }

  useEffect(() => {
    loadTimeline();

    const interval = setInterval(() => {
      loadTimeline();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-cyan-300">
          Threat Timeline
        </h2>

        <span className="text-sm text-cyan-400">
          DATABASE TREND
        </span>
      </div>

      <div className="h-72 sm:h-80 lg:h-[350px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
            />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="total"
              stroke="#22c55e"
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="high"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="medium"
              stroke="#facc15"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}