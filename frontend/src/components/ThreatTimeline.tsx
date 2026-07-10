"use client";
import { API_BASE_URL } from "@/config/api";
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
      
      const response = await fetch(
        `${API_BASE_URL}/stats/timeline`
       );

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

      {timeline.length === 0 && (
        <p className="mb-4 text-sm text-slate-500">
          No timeline data available yet.
        </p>
      )}

      <div className="h-72 sm:h-80 lg:h-[350px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.12} />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
            />

            <YAxis tick={{ fontSize: 12, fontWeight: 400 }} />

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
              labelStyle={{
                color: "#67e8f9",
                fontSize: "12px",
                fontWeight: 500,
              }}
              itemStyle={{
                fontSize: "12px",
                fontWeight: 400,
              }}
            />

            <Line
              type="monotone"
              dataKey="total"
              stroke="#22c55e"
              strokeWidth={1.2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="high"
              stroke="#ef4444"
              strokeWidth={1.2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="medium"
              stroke="#facc15"
              strokeWidth={1.2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}