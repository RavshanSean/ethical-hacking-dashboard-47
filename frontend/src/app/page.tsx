"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import StatsCards from "@/components/StatsCards";
import QuickScanPanel from "@/components/QuickScanPanel";
import { AuthSplash, PanelSkeleton } from "@/components/PanelSkeleton";

const ThreatTimeline = dynamic(() => import("@/components/ThreatTimeline"), {
  loading: () => <PanelSkeleton className="h-80" />,
  ssr: false,
});

const RecentThreats = dynamic(() => import("@/components/RecentThreats"), {
  loading: () => <PanelSkeleton className="h-80" />,
  ssr: false,
});

const LiveSystemMonitor = dynamic(
  () => import("@/components/LiveSystemMonitor"),
  {
    loading: () => <PanelSkeleton className="h-64" />,
    ssr: false,
  }
);

const ThreatChart = dynamic(() => import("@/components/ThreatChart"), {
  loading: () => <PanelSkeleton className="h-72" />,
  ssr: false,
});

const AIAnalysisPanel = dynamic(() => import("@/components/AIAnalysisPanel"), {
  loading: () => <PanelSkeleton className="h-72" />,
  ssr: false,
});

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [showHeavy, setShowHeavy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(() => setShowHeavy(true), {
        timeout: 900,
      });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(() => setShowHeavy(true), 250);
    return () => clearTimeout(timeoutId);
  }, [router]);

  if (!ready) return <AuthSplash />;

  return (
    <div className="app-shell">
      <div className="flex">
        <Sidebar />

        <main className="app-main">
          <section id="dashboard" className="app-frame animate-rise">
            <DashboardHeader />

            <div className="mt-7">
              <StatsCards scanHistory={[]} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                {showHeavy ? <ThreatTimeline /> : <PanelSkeleton className="h-80" />}
              </div>
              {showHeavy ? <RecentThreats /> : <PanelSkeleton className="h-80" />}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <QuickScanPanel />
              {showHeavy ? (
                <LiveSystemMonitor />
              ) : (
                <PanelSkeleton className="h-64" />
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                {showHeavy ? (
                  <AIAnalysisPanel />
                ) : (
                  <PanelSkeleton className="h-72" />
                )}
              </div>
              {showHeavy ? <ThreatChart /> : <PanelSkeleton className="h-72" />}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
