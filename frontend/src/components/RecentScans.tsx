"use client";

import { API_BASE_URL } from "@/config/api";
import { useEffect, useState } from "react";

type SavedScan = {
  id: number;
  url: string;
  domain: string;
  risk_score: number;
  threat_level: string;
  registrar: string;
  created_at: string;
  scan_type: string;
};

export default function RecentScans() {
  const [scans, setScans] = useState<SavedScan[]>([]);

  async function loadScans() {
    try {
      const response = await fetch(`${API_BASE_URL}/scan-results`);
      const data = await response.json();

      setScans(data.scan_results || []);
    } catch (error) {
      console.error("Failed to load saved scans:", error);
    }
  }

  useEffect(() => {
    loadScans();

    const interval = setInterval(() => {
      loadScans();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-6">
      <h2 className="text-2xl font-semibold text-green-300">
        Saved Scan History
      </h2>

      <div className="mt-5 max-h-[300px] space-y-3 overflow-y-auto pr-2">
        {scans.length === 0 ? (
          <p className="text-sm text-gray-500">
            No saved scans yet.
          </p>
        ) : (
          scans.map((scan) => (
            <div
              key={scan.id}
              className="rounded-xl border border-green-500/10 bg-black p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    {scan.domain || scan.url}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {scan.scan_type}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${
                    scan.threat_level === "HIGH"
                      ? "bg-red-500/20 text-red-400"
                      : scan.threat_level === "MEDIUM"
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {scan.threat_level}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Risk: {scan.risk_score}/100</span>
                <span>{new Date(scan.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}