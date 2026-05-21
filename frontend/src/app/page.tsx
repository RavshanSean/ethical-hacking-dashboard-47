"use client";

import EventHistory from "@/components/EventHistory";
import LiveMonitor from "../components/LiveMonitor";
import ThreatActivity from "../components/ThreatActivity";
import StatsCards from "../components/StatsCards";
import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/Sidebar";
import ThreatChart from "../components/ThreatChart";
import ThreatTimeline from "../components/ThreatTimeline";

type ScanHistoryItem = {
  domain: string;
  threat: string;
  time: string;
};

export default function Home() {
  const scanHistory: ScanHistoryItem[] = [];

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section id="dashboard" className="mx-auto max-w-7xl">
            <DashboardHeader />

            <div className="mt-6">
              <StatsCards scanHistory={scanHistory} />
            </div>

            <div
              id="analytics"
              className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6"
            >
              <div className="xl:col-span-2">
                <ThreatTimeline />
              </div>

              <div>
                <ThreatChart />
              </div>
            </div>

            <div
              id="live-monitor"
              className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6"
            >
              <LiveMonitor />

              <ThreatActivity scanHistory={scanHistory} />
            </div>

            <div id="logs" className="mt-6">
              <EventHistory />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}