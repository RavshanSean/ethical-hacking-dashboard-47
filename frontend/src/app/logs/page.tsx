"use client";

import Sidebar from "@/components/Sidebar";
import EventHistory from "@/components/EventHistory";

export default function LogsPage() {
  return (
    <div className="min-h-screen bg-[#020711] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-7xl">
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