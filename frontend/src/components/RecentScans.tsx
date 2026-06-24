"use client";

import { API_BASE_URL } from "@/config/api";
import { useEffect, useState } from "react";

type ThreatFilter = "ALL" | "HIGH" | "MEDIUM" | "LOW";

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
  const [hasNextPage, setHasNextPage] =
    useState(false);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedScan, setSelectedScan] =
    useState<FullScanReport | null>(null);
  const [threatFilter, setThreatFilter] =
    useState<ThreatFilter>("ALL");
  const [search, setSearch] = useState("");

  async function loadScans() {
    try {
      const endpoint =
        threatFilter === "ALL"
          ? `${API_BASE_URL}/scan-results?page=${page}&limit=5`
          : `${API_BASE_URL}/scan-results?page=${page}&limit=5&threat_level=${threatFilter}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      setScans(data.items || []);
      setHasNextPage(data.has_next);
      setTotalResults(data.total_results || 0);
    } catch (error) {
      console.error("Failed to load saved scans:", error);
    }
  }

  async function loadScanDetails(scanId: number) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/scan-results/${scanId}`
      );
      const data = await response.json();

      setSelectedScan(data);
    } catch (error) {
      console.error("Failed to load scan detail:", error);
    }
  }

  const filteredScans = scans.filter((scan) =>
    JSON.stringify(scan)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  useEffect(() => {
    loadScans();

    const interval = setInterval(() => {
      loadScans();
    }, 5000);

    return () => clearInterval(interval);
  }, [threatFilter, page]);

  return (
    <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-green-300">
          Saved Scan History
        </h2>

        <span className="text-xs text-green-400">
          {totalResults} scans
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["ALL", "HIGH", "MEDIUM", "LOW"] as ThreatFilter[]).map(
          (level) => (
            <button
              key={level}
              onClick={() => {
                setThreatFilter(level);
                setSelectedScan(null);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                threatFilter === level
                  ? "bg-green-500 text-black"
                  : "border border-green-500/20 bg-black text-gray-400 hover:text-green-300"
              }`}
            >
              {level}
            </button>
          )
        )}
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search domains, URLs, registrars..."
        className="mt-4 w-full rounded-xl border border-green-500/20 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500"
      />

      <div className="mt-5 max-h-[300px] space-y-3 overflow-y-auto pr-2">
        {filteredScans.length === 0 ? (
          <p className="text-sm text-gray-500">
            No saved scans for this filter.
          </p>
        ) : (
          filteredScans.map((scan) => (
            <button
              key={scan.id}
              onClick={() => loadScanDetails(scan.id)}
              className="w-full rounded-xl border border-green-500/10 bg-black p-4 text-left transition hover:border-green-400/40 hover:bg-green-500/5"
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

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() =>
            setPage((current) =>
              Math.max(1, current - 1)
            ) 
          }
          disabled={page === 1}
          className="rounded-lg border border-green-500/20 bg-black px-3 py-2 text-xs text-gray-300 disabled:opacity-40"
        >
          Previous
        </button>

        <span className="text-xs text-gray-500">
          Page {page}
        </span>

        <button
          onClick={() =>
            setPage((current) => current + 1)
          }
          disabled={!hasNextPage}
          className="rounded-lg border border-green-500/20 bg-black px-3 py-2 text-xs text-gray-300 disabled:opacity-40"
        >
          Next
        </button>
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