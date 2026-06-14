"use client";

import Sidebar from "@/components/Sidebar";
import ThreatChart from "@/components/ThreatChart";
import ThreatTimeline from "@/components/ThreatTimeline";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#020711] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-7xl">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
              Threat Intelligence
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Analytics
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Analyze threat distribution, timeline trends, and scan behavior.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <ThreatTimeline />
              </div>

              <ThreatChart />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}