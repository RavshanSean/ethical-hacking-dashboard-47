"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function ReportsPage() {
  const [status, setStatus] = useState("");
  const [reportData, setReportData] = useState<any[]>([]);

useEffect(() => {
  fetch("http://127.0.0.1:8000/threat-map/events")
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setReportData(data);
      }
    })
    .catch(console.error);
}, []);

  async function exportThreatJson() {
    setStatus("Preparing JSON report...");

    try {
      const response = await fetch("http://127.0.0.1:8000/threat-map/events");
      const data = await response.json();

      const report = {
        report_name: "EHD #47 Threat Intelligence Report",
        generated_at: new Date().toISOString(),
        total_events: Array.isArray(data) ? data.length : 0,
        events: data,
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "ehd-47-threat-report.json";
      link.click();

      URL.revokeObjectURL(url);
      setStatus("JSON report exported.");
    } catch (error) {
      console.error(error);
      setStatus("Export failed.");
    }
  }

  function exportThreatCsv() {
    if (reportData.length === 0) {
        setStatus("No report data available.");
        return;
    }

    const headers = [
        "id",
        "country",
        "city",
        "threat_type",
        "severity",
        "message",
        "timestamp",
    ];

    const rows = reportData.map((event) =>
        headers
        .map((header) => `"${String(event[header] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], {
        type: "text/csv",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ehd-47-threat-report.csv";
    link.click();

    URL.revokeObjectURL(url);
    setStatus("CSV report exported.");
    }

function printReport() {
  window.print();
}

  return (
    <div className="min-h-screen bg-[#020711] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-7xl">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
              Security Reports
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Reports
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Export security findings, threat intelligence, and scan results.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">

            <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5">
                <p className="text-sm text-slate-400">Total Events</p>
                <h3 className="mt-2 text-3xl font-bold text-cyan-300">
                {reportData.length}
                </h3>
            </div>

            <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5">
                <p className="text-sm text-slate-400">High Severity</p>
                <h3 className="mt-2 text-3xl font-bold text-red-300">
                {
                    reportData.filter(
                    (event) => event.severity === "HIGH"
                    ).length
                }
                </h3>
            </div>

            <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5">
                <p className="text-sm text-slate-400">Countries</p>
                <h3 className="mt-2 text-3xl font-bold text-cyan-300">
                {new Set(reportData.map((event) => event.country)).size}
                </h3>
            </div>

            <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5">
                <p className="text-sm text-slate-400">Latest Threat</p>
                <h3 className="mt-2 text-sm font-medium text-cyan-300">
                {reportData[0]?.threat_type || "None"}
                </h3>
            </div>

            </div>

            <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
              <h2 className="text-xl font-semibold text-white">
                Export Center
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Download security reports in multiple formats.
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  onClick={exportThreatJson}
                  className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-cyan-300"
                >
                  Export JSON
                </button>

                <button
                    onClick={exportThreatCsv}
                    className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-cyan-300"
                    >
                    Export CSV
                </button>

                <button
                    onClick={printReport}
                    className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-cyan-300"
                    >
                    Print / Save PDF
                </button>
              </div>

              {status && (
                <p className="mt-4 text-sm text-cyan-300">
                  {status}
                </p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}