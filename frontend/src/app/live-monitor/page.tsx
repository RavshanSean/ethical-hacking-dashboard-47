"use client";

import Sidebar from "@/components/Sidebar";
import LiveMonitor from "@/components/LiveMonitor";

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

            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Monitor real backend security events and live WebSocket updates.
            </p>

            <div className="mt-8">
              <LiveMonitor />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}