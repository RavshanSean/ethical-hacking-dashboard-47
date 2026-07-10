"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { API_BASE_URL } from "@/config/api";

type ReportEvent = {
  type?: string;
  severity?: string;
  message?: string;
  timestamp?: string;
  country?: string | null;
  city?: string | null;
};

type EventTypeCount = {
  type?: string;
  count?: number;
};

type QuarantineItem = {
  id?: string;
  original_filename?: string;
  threat?: string | null;
  risk_score?: number;
  status?: string;
};

type IOCItem = {
  id?: number;
  ioc_type?: string;
  value?: string;
  severity?: string;
  description?: string;
  source?: string;
};

type IOCTypeCount = {
  type?: string;
  count?: number;
};

type SecurityReport = {
  report_name?: string;
  generated_at?: string;
  executive_summary?: string;
  events?: {
    total?: number;
    high?: number;
    medium?: number;
    low?: number;
    top_event_types?: EventTypeCount[];
    recent?: ReportEvent[];
  };
  url_scans?: {
    total?: number;
    high_risk?: number;
    medium_risk?: number;
  };
  quarantine?: {
    total?: number;
    high_risk?: number;
    items?: QuarantineItem[];
  };
  threat_intel?: {
    ioc_total?: number;
    high_iocs?: number;
    medium_iocs?: number;
    low_iocs?: number;
    ioc_types?: IOCTypeCount[];
    recent_iocs?: IOCItem[];
    status?: string;
  };
  recommendations?: string[];
};

export default function ReportsPage() {
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/reports/security-summary`
      );

      if (!response.ok) {
        throw new Error("Failed to load security report");
      }

      const data = await response.json();

      setReport(data);
      setError("");
    } catch (error) {
      console.error("Failed to load report:", error);
      setError("Failed to load security report.");
      setReport(null);
    } finally {
      setLoading(false);
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

    const headers: Array<keyof ReportEvent> = [
      "type",
      "severity",
      "message",
      "timestamp",
      "country",
      "city",
    ];

    const rows = recentEvents.map((event) =>
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
    if (!report) {
      setStatus("No report data available.");
      return;
    }

    window.print();
  }

  const recentEvents = report?.events?.recent || [];
  const topEventTypes = report?.events?.top_event_types || [];
  const quarantineItems = report?.quarantine?.items || [];
  const recommendations = report?.recommendations || [];
  const recentIocs = report?.threat_intel?.recent_iocs || [];
  const iocTypes = report?.threat_intel?.ioc_types || [];

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
              ThreatIntel indicators, and analyst recommendations.
            </p>

            {loading && (
              <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-6 text-sm text-cyan-200">
                Generating the latest security summary...
              </div>
            )}

            {error && (
              <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-300">
                <p>{error}</p>

                <button
                  onClick={loadReport}
                  className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/20"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && report && (
              <>
                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="Total Events"
                    value={report.events?.total ?? 0}
                    color="text-cyan-300"
                  />

                  <StatCard
                    title="High Severity"
                    value={report.events?.high ?? 0}
                    color="text-red-300"
                  />

                  <StatCard
                    title="URL Scans"
                    value={report.url_scans?.total ?? 0}
                    color="text-emerald-300"
                  />

                  <StatCard
                    title="Quarantined"
                    value={report.quarantine?.total ?? 0}
                    color="text-yellow-300"
                  />
                </div>

                <div className="mt-8 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-6">
                  <h2 className="text-xl font-semibold text-purple-300">
                    Executive Summary
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    {report.executive_summary ||
                      "No executive summary was returned."}
                  </p>

                  <p className="mt-3 text-xs text-slate-500">
                    Generated:{" "}
                    {report.generated_at
                      ? new Date(report.generated_at).toLocaleString()
                      : "Unknown"}
                  </p>
                </div>

                <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
                  <h2 className="text-xl font-semibold text-cyan-300">
                    RavShield Threat Intelligence
                  </h2>

                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      title="IOC Records"
                      value={report.threat_intel?.ioc_total ?? 0}
                      color="text-cyan-300"
                    />

                    <StatCard
                      title="High Severity"
                      value={report.threat_intel?.high_iocs ?? 0}
                      color="text-red-300"
                    />

                    <StatCard
                      title="Medium Severity"
                      value={report.threat_intel?.medium_iocs ?? 0}
                      color="text-yellow-300"
                    />

                    <StatCard
                      title="IOC Types"
                      value={iocTypes.length}
                      color="text-emerald-300"
                    />
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white">
                      Recent Indicators
                    </h3>

                    <div className="mt-4 space-y-3">
                      {recentIocs.length === 0 && (
                        <EmptyText text="No IOC records available." />
                      )}

                      {recentIocs.map((ioc, index) => (
                        <div
                          key={ioc.id ?? index}
                          className="rounded-xl border border-white/5 bg-black/35 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="break-all font-semibold text-white">
                                {ioc.ioc_type || "IOC"}:{" "}
                                {ioc.value || "Unknown value"}
                              </p>

                              <p className="mt-1 text-sm text-slate-400">
                                {ioc.description ||
                                  "No description available."}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Source: {ioc.source || "Unknown"}
                              </p>
                            </div>

                            <SeverityBadge
                              severity={ioc.severity || "UNKNOWN"}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="mt-5 text-sm text-cyan-300">
                      {report.threat_intel?.status ||
                        "ThreatIntel status unavailable."}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <Panel title="Top Event Types">
                    {topEventTypes.length > 0 ? (
                      <div className="space-y-3">
                        {topEventTypes.map((item, index) => (
                          <InfoRow
                            key={item.type || index}
                            label={item.type || "Unknown event"}
                            value={String(item.count ?? 0)}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyText text="No event type data available." />
                    )}
                  </Panel>

                  <Panel title="Recommendations">
                    {recommendations.length > 0 ? (
                      <ul className="space-y-2 text-sm text-slate-300">
                        {recommendations.map((recommendation, index) => (
                          <li key={index}>• {recommendation}</li>
                        ))}
                      </ul>
                    ) : (
                      <EmptyText text="No recommendations available." />
                    )}
                  </Panel>
                </div>

                <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Export Center
                      </h2>

                      <p className="mt-2 text-sm text-slate-400">
                        Download or print the current security summary.
                      </p>
                    </div>

                    <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      REPORT READY
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-4">
                    <button
                      onClick={exportJson}
                      disabled={!report}
                      className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-cyan-300 transition hover:bg-cyan-400/15 disabled:opacity-50"
                    >
                      Export JSON
                    </button>

                    <button
                      onClick={exportCsv}
                      disabled={!report || recentEvents.length === 0}
                      className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-cyan-300 transition hover:bg-cyan-400/15 disabled:opacity-50"
                    >
                      Export CSV
                    </button>

                    <button
                      onClick={printReport}
                      disabled={!report}
                      className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-cyan-300 transition hover:bg-cyan-400/15 disabled:opacity-50"
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
                    {recentEvents.length > 0 ? (
                      <div className="space-y-3">
                        {recentEvents.map((event, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-white/5 bg-black/35 p-4"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-sm font-semibold text-white">
                                {event.type || "UNKNOWN_EVENT"}
                              </p>

                              <SeverityBadge
                                severity={event.severity || "UNKNOWN"}
                              />
                            </div>

                            <p className="mt-2 text-sm text-slate-400">
                              {event.message ||
                                "No event message available."}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                              {event.timestamp
                                ? new Date(
                                    event.timestamp
                                  ).toLocaleString()
                                : "Unknown time"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyText text="No recent events available." />
                    )}
                  </Panel>

                  <Panel title="Quarantine Records">
                    {quarantineItems.length > 0 ? (
                      <div className="space-y-3">
                        {quarantineItems.map((item, index) => (
                          <div
                            key={item.id || index}
                            className="rounded-xl border border-white/5 bg-black/35 p-4"
                          >
                            <p className="break-all text-sm font-semibold text-white">
                              {item.original_filename || "Unknown file"}
                            </p>

                            <p className="mt-2 text-sm text-slate-400">
                              Threat: {item.threat || "Unknown"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Risk: {item.risk_score ?? 0}/100 ·{" "}
                              {item.status || "Unknown"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyText text="No quarantine records available." />
                    )}
                  </Panel>
                </div>
              </>
            )}
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
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/30 p-3">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-sm font-semibold text-cyan-300">
        {value}
      </span>
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: string;
}) {
  const className =
    severity === "HIGH"
      ? "bg-red-500/10 text-red-300"
      : severity === "MEDIUM"
      ? "bg-yellow-500/10 text-yellow-300"
      : severity === "LOW"
      ? "bg-emerald-500/10 text-emerald-300"
      : "bg-slate-500/10 text-slate-300";

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${className}`}
    >
      {severity}
    </span>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-white/5 bg-black/30 p-4 text-sm text-slate-500">
      {text}
    </p>
  );
}