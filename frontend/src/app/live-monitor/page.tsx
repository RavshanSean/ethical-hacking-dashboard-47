"use client";

import Sidebar from "@/components/Sidebar";
import LiveMonitor from "@/components/LiveMonitor";
import ThreatActivity from "@/components/ThreatActivity";

export default function LiveMonitorPage() {
  return (
    <div className="min-h-screen bg-[#020711] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-7xl">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
              Runtime Telemetry
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Live Monitor
            </h1>

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <LiveMonitor />
              <ThreatActivity scanHistory={[]} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}