"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { API_BASE_URL } from "@/config/api";

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/security-summary`);
      const data = await response.json();

      setReport(data);
    } catch (error) {
      console.error("Failed to load report:", error);
      setStatus("Failed to load security report.");
    }
  }

  function exportJson() {
    if (!report) {
      setStatus("No report data available.");
      return;
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ehd-47-security-summary.json";
    link.click();

    URL.revokeObjectURL(url);
    setStatus("JSON report exported.");
  }

  function exportCsv() {
    const recentEvents = report?.events?.recent || [];

    if (recentEvents.length === 0) {
      setStatus("No event data available for CSV export.");
      return;
    }

    const headers = [
      "type",
      "severity",
      "message",
      "timestamp",
      "country",
      "city",
    ];

    const rows = recentEvents.map((event: any) =>
      headers
        .map((header) =>
          `"${String(event[header] ?? "").replace(/"/g, '""')}"`
        )
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ehd-47-security-events.csv";
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
              Export real EHD security events, URL scans, quarantine records,
              and analyst recommendations.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
              <StatCard
                title="Total Events"
                value={report?.events?.total || 0}
                color="text-cyan-300"
              />

              <StatCard
                title="High Severity"
                value={report?.events?.high || 0}
                color="text-red-300"
              />

              <StatCard
                title="URL Scans"
                value={report?.url_scans?.total || 0}
                color="text-emerald-300"
              />

              <StatCard
                title="Quarantined"
                value={report?.quarantine?.total || 0}
                color="text-yellow-300"
              />
            </div>

            <div className="mt-8 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-6">
              <h2 className="text-xl font-semibold text-purple-300">
                Executive Summary
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-200">
                {report?.executive_summary || "Loading report summary..."}
              </p>

              <p className="mt-3 text-xs text-slate-500">
                Generated:{" "}
                {report?.generated_at
                  ? new Date(report.generated_at).toLocaleString()
                  : "Loading..."}
              </p>
            </div>


          <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
  <h2 className="text-xl font-semibold text-cyan-300">
    RavShield Threat Intelligence
  </h2>

  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
    <StatCard
      title="IOC Records"
      value={report?.threat_intel?.ioc_total || 0}
      color="text-cyan-300"
    />

    <StatCard
      title="High Severity"
      value={report?.threat_intel?.high_iocs || 0}
      color="text-red-300"
    />

    <StatCard
      title="Medium Severity"
      value={report?.threat_intel?.medium_iocs || 0}
      color="text-yellow-300"
    />

    <StatCard
      title="IOC Types"
      value={Number((report?.threat_intel?.ioc_types || []).length)}
      color="text-emerald-300"
    />
  </div>

  <div className="mt-8">
    <h3 className="text-lg font-semibold text-white">
      Recent Indicators
    </h3>

    <div className="mt-4 space-y-3">
      {(report?.threat_intel?.recent_iocs || []).map((ioc: any) => (
        <div
          key={ioc.id}
          className="rounded-xl border border-white/5 bg-black/35 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">
                {ioc.ioc_type}: {ioc.value}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {ioc.description}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                ioc.severity === "HIGH"
                  ? "bg-red-500/10 text-red-300"
                  : ioc.severity === "MEDIUM"
                  ? "bg-yellow-500/10 text-yellow-300"
                  : "bg-emerald-500/10 text-emerald-300"
              }`}
            >
              {ioc.severity}
            </span>
          </div>
        </div>
      ))}

      {(report?.threat_intel?.recent_iocs || []).length === 0 && (
        <EmptyText text="No IOC records available." />
      )}
    </div>

    <p className="mt-5 text-sm text-cyan-300">
      {report?.threat_intel?.status}
    </p>
  </div>
</div>


            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Panel title="Top Event Types">
                {(report?.events?.top_event_types || []).length > 0 ? (
                  <div className="space-y-3">
                    {report.events.top_event_types.map((item: any) => (
                      <InfoRow
                        key={item.type}
                        label={item.type}
                        value={String(item.count)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyText text="No event type data available." />
                )}
              </Panel>

              <Panel title="Recommendations">
                {(report?.recommendations || []).length > 0 ? (
                  <ul className="space-y-2 text-sm text-slate-300">
                    {report.recommendations.map(
                      (recommendation: string, index: number) => (
                        <li key={index}>• {recommendation}</li>
                      )
                    )}
                  </ul>
                ) : (
                  <EmptyText text="No recommendations available." />
                )}
              </Panel>
            </div>

            <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
              <h2 className="text-xl font-semibold text-white">
                Export Center
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Download or print the current security summary.
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  onClick={exportJson}
                  className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-cyan-300"
                >
                  Export JSON
                </button>

                <button
                  onClick={exportCsv}
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

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Panel title="Recent Security Events">
                {(report?.events?.recent || []).length > 0 ? (
                  <div className="space-y-3">
                    {report.events.recent.map((event: any, index: number) => (
                      <div
                        key={index}
                        className="rounded-xl border border-white/5 bg-black/35 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">
                            {event.type}
                          </p>

                          <span
                            className={`text-xs font-bold ${
                              event.severity === "HIGH"
                                ? "text-red-300"
                                : event.severity === "MEDIUM"
                                ? "text-yellow-300"
                                : "text-emerald-300"
                            }`}
                          >
                            {event.severity}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          {event.message}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyText text="No recent events available." />
                )}
              </Panel>

              <Panel title="Quarantine Records">
                {(report?.quarantine?.items || []).length > 0 ? (
                  <div className="space-y-3">
                    {report.quarantine.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-white/5 bg-black/35 p-4"
                      >
                        <p className="text-sm font-semibold text-white">
                          {item.original_filename}
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                          Threat: {item.threat || "Unknown"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Risk: {item.risk_score}/100 · {item.status}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyText text="No quarantine records available." />
                )}
              </Panel>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h3 className={`mt-2 text-3xl font-bold ${color}`}>
        {value}
      </h3>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
      <h2 className="text-xl font-semibold text-white">
        {title}
      </h2>

      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 p-3">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-sm font-semibold text-cyan-300">
        {value}
      </span>
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <p className="text-sm text-slate-500">
      {text}
    </p>
  );
}