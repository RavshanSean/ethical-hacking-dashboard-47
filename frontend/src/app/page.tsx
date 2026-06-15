"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatsCards from "../components/StatsCards";
import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/Sidebar";
import ThreatChart from "../components/ThreatChart";
import ThreatTimeline from "../components/ThreatTimeline";
import RecentThreats from "@/components/RecentThreats";
import QuickScanPanel from "@/components/QuickScanPanel";
import LiveSystemMonitor from "@/components/LiveSystemMonitor";
import AIAnalysisPanel from "@/components/AIAnalysisPanel";

type ScanHistoryItem = {
  domain: string;
  threat: string;
  time: string;
};

export default function Home() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(false);
  }, [router]);

  const scanHistory: ScanHistoryItem[] = [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">
        Checking authentication...
      </div>
    );
  }

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

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <ThreatTimeline />
              </div>

              <RecentThreats />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <QuickScanPanel />
              <LiveSystemMonitor />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <AIAnalysisPanel />
              </div>

              <ThreatChart />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
  }