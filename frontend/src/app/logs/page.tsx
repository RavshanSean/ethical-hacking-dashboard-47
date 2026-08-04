"use client";

import Sidebar from "@/components/Sidebar";
import EventHistory from "@/components/EventHistory";

export default function LogsPage() {
  return (
    <div className="app-shell">
      <div className="flex">
        <Sidebar />

        <main className="app-main">
          <section className="app-frame">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
              Historical Records
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Security Logs
            </h1>

            <div className="mt-8">
              <EventHistory />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}