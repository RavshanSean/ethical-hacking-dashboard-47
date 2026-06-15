"use client";

import { API_BASE_URL } from "@/config/api";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Bug,
  FileText,
  Clock3,
} from "lucide-react";

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

export default function StatsCards({ lastDomain }: StatsCardsProps) {
  const [stats, setStats] = useState<BackendStats>({
    total_events: 0,
    high_threats: 0,
    medium_threats: 0,
    low_threats: 0,
  });

  async function loadStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Overall Protection"
        value="Secure"
        subtitle="Your system is safe"
        accent="emerald"
        icon={<ShieldCheck size={26} />}
        sparkline="green"
      />

      <StatCard
        title="Threats Detected"
        value={String(stats.high_threats)}
        subtitle={`High: ${stats.high_threats}`}
        accent="red"
        icon={<Bug size={26} />}
        sparkline="red"
      />

      <StatCard
        title="Files Scanned"
        value={String(stats.total_events)}
        subtitle="Total security events"
        accent="cyan"
        icon={<FileText size={26} />}
        sparkline="cyan"
      />

      <StatCard
        title="Last Scan"
        value={lastDomain ? "Now" : "Live"}
        subtitle={lastDomain || "System monitor"}
        accent="violet"
        icon={<Clock3 size={26} />}
        sparkline="violet"
      />
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  accent: "emerald" | "red" | "cyan" | "violet";
  icon: React.ReactNode;
  sparkline: "green" | "red" | "cyan" | "violet";
};

function StatCard({
  title,
  value,
  subtitle,
  accent,
  icon,
  sparkline,
}: StatCardProps) {
  const accentStyles = {
    emerald: {
      text: "text-emerald-300",
      border: "border-emerald-400/15",
      glow: "shadow-[0_0_28px_rgba(52,211,153,0.08)]",
      bg: "bg-emerald-400/10",
    },
    red: {
      text: "text-red-300",
      border: "border-red-400/15",
      glow: "shadow-[0_0_28px_rgba(248,113,113,0.08)]",
      bg: "bg-red-400/10",
    },
    cyan: {
      text: "text-cyan-300",
      border: "border-cyan-400/15",
      glow: "shadow-[0_0_28px_rgba(34,211,238,0.08)]",
      bg: "bg-cyan-400/10",
    },
    violet: {
      text: "text-violet-300",
      border: "border-violet-400/15",
      glow: "shadow-[0_0_28px_rgba(167,139,250,0.08)]",
      bg: "bg-violet-400/10",
    },
  };

  const style = accentStyles[accent];

  return (
    <div
      className={`rounded-2xl border ${style.border} bg-[#07111f]/90 p-5 ${style.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            {title}
          </p>

          <h3 className={`mt-4 text-3xl font-bold ${style.text}`}>
            {value}
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className={`rounded-2xl ${style.bg} p-3 ${style.text}`}>
          {icon}
        </div>
      </div>

      <MiniSparkline type={sparkline} />
    </div>
  );
}

function MiniSparkline({
  type,
}: {
  type: "green" | "red" | "cyan" | "violet";
}) {
  const stroke = {
    green: "#34d399",
    red: "#f87171",
    cyan: "#22d3ee",
    violet: "#a78bfa",
  }[type];

  return (
    <svg
      viewBox="0 0 160 38"
      className="mt-5 h-10 w-full opacity-80"
      preserveAspectRatio="none"
    >
      <path
        d="M0 26 L14 20 L28 24 L42 18 L56 22 L70 15 L84 26 L98 19 L112 21 L126 12 L140 24 L160 18"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
      />

      <path
        d="M0 38 L0 26 L14 20 L28 24 L42 18 L56 22 L70 15 L84 26 L98 19 L112 21 L126 12 L140 24 L160 18 L160 38 Z"
        fill={stroke}
        opacity="0.08"
      />
    </svg>
  );
}