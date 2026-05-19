"use client";
import { API_BASE_URL } from "@/config/api";
import { useEffect, useState } from "react";

type ScanHistoryItem = {
  domain: string;
  threat: string;
  time: string;
};

type StatsCardsProps = {
  scanHistory: ScanHistoryItem[];
  lastDomain?: string;
};

type BackendStats = {
  total_events: number;
  high_threats: number;
  medium_threats: number;
  low_threats: number;
};

export default function StatsCards({
  lastDomain,
}: StatsCardsProps) {
  const [stats, setStats] = useState<BackendStats>({
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
      console.error("Failed to load stats:", error);
    }
  }

  useEffect(() => {
    loadStats();

    const interval = setInterval(() => {
      loadStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title="Total Events"
        value={String(stats.total_events)}
        color="text-cyan-400"
      />

      <StatCard
        title="High Risk"
        value={String(stats.high_threats)}
        color="text-red-400"
      />

      <StatCard
        title="Medium Risk"
        value={String(stats.medium_threats)}
        color="text-yellow-300"
      />

      <StatCard
        title="Low Risk"
        value={String(stats.low_threats)}
        color="text-green-400"
      />
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  color: string;
};

function StatCard({ title, value, color }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-5 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
      <p className="text-sm text-gray-400">{title}</p>

      <h3 className={`mt-3 text-3xl font-bold ${color}`}>
        {value}
      </h3>
    </div>
  );
}