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

type FullScanReport = SavedScan & {
  creation_date: string;
  expiration_date: string;
  reasons: string;
  scripts_detected: number;
  login_forms_detected: number;
  password_fields_detected: number;
  camera_microphone_access: string;
  location_access: string;
  notification_access: string;
  engine_version: string;
  analysis_source: string;
};

export default function RecentScans() {
  const [scans, setScans] = useState<SavedScan[]>([]);
  const [selectedScan, setSelectedScan] = useState<FullScanReport | null>(null);

  async function loadScans() {
    try {
      const response = await fetch(`${API_BASE_URL}/scan-results`);
      const data = await response.json();

      setScans(data.scan_results || []);
    } catch (error) {
      console.error("Failed to load saved scans:", error);
    }
  }

  async function loadScanDetails(scanId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/scan-results/${scanId}`);
      const data = await response.json();

      setSelectedScan(data);
    } catch (error) {
      console.error("Failed to load scan detail:", error);
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
            <button
              key={scan.id}
              onClick={() => loadScanDetails(scan.id)}
              className="w-full text-left rounded-xl border border-green-500/10 bg-black p-4 transition hover:border-green-400/40 hover:bg-green-500/5"
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
            </button>
          ))
        )}
      </div>

      {selectedScan && (
        <div className="mt-5 rounded-xl border border-cyan-500/20 bg-black p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-cyan-300">
              Selected Report
            </h3>

            <button
              onClick={() => setSelectedScan(null)}
              className="text-xs text-gray-500 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-300">
            <p>
              <span className="text-gray-500">Domain:</span>{" "}
              {selectedScan.domain}
            </p>

            <p>
              <span className="text-gray-500">Risk:</span>{" "}
              {selectedScan.risk_score}/100
            </p>

            <p>
              <span className="text-gray-500">Threat:</span>{" "}
              {selectedScan.threat_level}
            </p>

            <p>
              <span className="text-gray-500">Registrar:</span>{" "}
              {selectedScan.registrar}
            </p>

            <p>
              <span className="text-gray-500">Scripts:</span>{" "}
              {selectedScan.scripts_detected}
            </p>

            <p>
              <span className="text-gray-500">Engine:</span>{" "}
              {selectedScan.engine_version}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}