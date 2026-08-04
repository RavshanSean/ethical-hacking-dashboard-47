"use client";

import { apiFetch } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import SystemOverview from "@/components/SystemOverview";
import RecentScans from "@/components/RecentScans";
import AIAnalysis from "@/components/AIAnalysis";
import InfoCard from "@/components/InfoCard";
import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Bug,
  LoaderCircle,
} from "lucide-react";

type ScanResult = {
  url: string;
  domain: string;
  resolved_ip: string;
  final_url: string;
  redirect_chain?: string[];
  redirect_count: number;
  https_enabled: boolean;
  http_status_code: number | null;
  suspicious_domain_indicators?: string[];
  registrar: string;
  creation_date: string;
  expiration_date: string;
  risk_score: number;
  threat_level: string;
  reasons?: string[];
  scripts_detected: number;
  login_forms_detected: number;
  password_fields_detected: number;
  camera_microphone_access: boolean;
  location_access: boolean;
  notification_access: boolean;
  permission_note: string;
  scan_type: string;
  engine_version: string;
  analysis_source: string;
  ai_summary?: string;
  ip_intelligence?: {
    ip?: string;
    country?: string;
    region?: string;
    city?: string;
    isp?: string;
    org?: string;
    asn?: string;
  };
  ssl_intelligence?: {
    valid?: boolean;
    issuer?: string;
    expires_at?: string;
    days_left?: number | null;
    error?: string;
  };
};

export default function UrlScannerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function scanWebsite() {
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError("Please enter a URL before scanning.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await apiFetch(`/scan-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof data?.detail === "string"
            ? data.detail
            : "Backend scan failed";
        throw new Error(detail);
      }

      setResult(data);
    } catch (error) {
      console.error("URL scan failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Scan failed. The site may be offline, invalid, or blocked."
      );
    } finally {
      setLoading(false);
    }
  }

  const suspiciousIndicators = result?.suspicious_domain_indicators || [];
  const redirectChain = result?.redirect_chain || [];
  const reasons = result?.reasons || [];

  const threatStyle =
    result?.risk_score !== undefined && result.risk_score >= 70
      ? {
          text: "text-red-400",
          border: "border-red-500/30",
          bg: "bg-red-500/10",
        }
      : result?.risk_score !== undefined && result.risk_score >= 30
      ? {
          text: "text-yellow-300",
          border: "border-yellow-500/30",
          bg: "bg-yellow-500/10",
        }
      : {
          text: "text-green-400",
          border: "border-green-500/30",
          bg: "bg-green-500/10",
        };

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-7xl">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-green-400">
                Investigation Workspace
              </p>

              <h1 className="mt-2 text-4xl font-bold text-white">
                URL Threat Scanner
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Scan suspicious domains, detect risky behavior, generate AI
                security summaries, and review stored scan reports.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-6 xl:col-span-2">
                <h2 className="text-2xl font-semibold text-green-300">
                  Scan Target
                </h2>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        scanWebsite();
                      }
                    }}
                    type="text"
                    placeholder="https://example.com"
                    className="flex-1 rounded-xl border border-green-500/30 bg-black px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  />

                  <button
                    onClick={scanWebsite}
                    disabled={loading || url.trim().length === 0}
                    className="rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-400"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <LoaderCircle className="animate-spin" size={18} />
                        Scanning...
                      </div>
                    ) : (
                      "Scan"
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 rounded-xl border border-red-500/30 bg-black p-4 text-red-400">
                    {error}
                  </div>
                )}

                {!result && !loading && !error && (
                  <div className="mt-6 rounded-xl border border-white/5 bg-black/30 p-4 text-sm text-slate-400">
                    Enter a URL to begin scanning. Results will appear here.
                  </div>
                )}

                {result && (
                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div
                      className={`rounded-xl border ${threatStyle.border} ${threatStyle.bg} p-4`}
                    >
                      <p className="text-sm text-gray-400">Risk Score</p>
                      <p className={`mt-2 text-3xl font-bold ${threatStyle.text}`}>
                        {result.risk_score}/100
                      </p>
                    </div>

                    <div
                      className={`rounded-xl border ${threatStyle.border} ${threatStyle.bg} p-4`}
                    >
                      <p className="text-sm text-gray-400">Threat Level</p>

                      <div className="mt-2 flex items-center gap-2">
                        {result.risk_score >= 70 ? (
                          <ShieldX className="text-red-400" size={28} />
                        ) : result.risk_score >= 30 ? (
                          <ShieldAlert className="text-yellow-300" size={28} />
                        ) : (
                          <ShieldCheck className="text-green-400" size={28} />
                        )}

                        <p className={`text-2xl font-bold ${threatStyle.text}`}>
                          {result.threat_level}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-blue-500/20 bg-black p-4">
                      <p className="text-sm text-gray-400">Scripts Detected</p>

                      <div className="mt-2 flex items-center gap-2">
                        <Bug className="text-blue-300" size={28} />
                        <p className="text-3xl font-bold text-blue-300">
                          {result.scripts_detected}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="mt-6 rounded-xl border border-cyan-500/20 bg-black p-5">
                    <h3 className="font-semibold text-cyan-300">
                      URL Intelligence
                    </h3>

                    <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                      <InfoCard label="Resolved IP" value={result.resolved_ip || "Unknown"} />
                      <InfoCard label="Country" value={result.ip_intelligence?.country || "Unknown"} />
                      <InfoCard label="Region" value={result.ip_intelligence?.region || "Unknown"} />
                      <InfoCard label="City" value={result.ip_intelligence?.city || "Unknown"} />
                      <InfoCard label="ISP" value={result.ip_intelligence?.isp || "Unknown"} />
                      <InfoCard label="Organization" value={result.ip_intelligence?.org || "Unknown"} />
                      <InfoCard label="ASN" value={result.ip_intelligence?.asn || "Unknown"} />
                      <InfoCard label="SSL Valid" value={String(result.ssl_intelligence?.valid ?? "Unknown")} />
                      <InfoCard label="SSL Issuer" value={result.ssl_intelligence?.issuer || "Unknown"} />
                      <InfoCard label="SSL Expires" value={result.ssl_intelligence?.expires_at || "Unknown"} />
                      <InfoCard
                        label="SSL Days Left"
                        value={
                          result.ssl_intelligence?.days_left !== null &&
                          result.ssl_intelligence?.days_left !== undefined
                            ? String(result.ssl_intelligence.days_left)
                            : "Unknown"
                        }
                      />
                      <InfoCard label="Final URL" value={result.final_url || "Unknown"} />
                      <InfoCard label="Redirect Count" value={String(result.redirect_count)} />
                      <InfoCard label="HTTPS Enabled" value={String(result.https_enabled)} />
                      <InfoCard
                        label="HTTP Status"
                        value={
                          result.http_status_code !== null &&
                          result.http_status_code !== undefined
                            ? String(result.http_status_code)
                            : "Unknown"
                        }
                      />
                      <InfoCard
                        label="Suspicious Indicators"
                        value={String(suspiciousIndicators.length)}
                      />
                    </div>

                    {redirectChain.length > 0 && (
                      <div className="mt-5 rounded-xl border border-cyan-500/10 bg-[#07111f] p-4">
                        <p className="text-sm font-semibold text-cyan-300">
                          Redirect Chain
                        </p>

                        <div className="mt-4 space-y-3">
                          {redirectChain.map((redirect, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-xs text-cyan-300">
                                {index + 1}
                              </div>

                              <div className="min-w-0 flex-1 rounded-xl border border-white/5 bg-black/30 p-3">
                                <p className="break-all text-sm text-slate-300">
                                  {redirect}
                                </p>
                              </div>
                            </div>
                          ))}

                          <div className="flex items-start gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-xs text-emerald-300">
                              ✓
                            </div>

                            <div className="min-w-0 flex-1 rounded-xl border border-emerald-400/10 bg-emerald-500/5 p-3">
                              <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
                                Final Destination
                              </p>

                              <p className="mt-1 break-all text-sm text-slate-300">
                                {result.final_url}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {suspiciousIndicators.length > 0 && (
                      <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                        <p className="text-sm font-semibold text-yellow-300">
                          Suspicious Domain Indicators
                        </p>

                        <ul className="mt-3 space-y-2 text-sm text-slate-300">
                          {suspiciousIndicators.map((indicator, index) => (
                            <li key={index}>• {indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {result && (
                  <div className="mt-6 rounded-xl border border-green-500/20 bg-black p-5">
                    <h3 className="font-bold text-green-300">
                      Security Reasons
                    </h3>

                    {reasons.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-gray-300">
                        {reasons.map((reason, index) => (
                          <li key={index}>• {reason}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        No detailed reasons were returned for this scan.
                      </p>
                    )}
                  </div>
                )}

                {result && (
                  <AIAnalysis
                    summary={
                      result.ai_summary ||
                      "AI summary unavailable for this scan."
                    }
                  />
                )}
              </div>

              <div className="space-y-6">
                <SystemOverview />
                <RecentScans />
              </div>
            </div>

            {result && (
              <div className="mt-6 rounded-2xl border border-green-500/20 bg-[#0b1220] p-6">
                <h2 className="text-xl font-semibold text-green-300">
                  Full Scan Details
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                  <InfoCard label="Domain" value={result.domain || "Unknown"} />
                  <InfoCard label="Resolved IP" value={result.resolved_ip || "Unknown"} />
                  <InfoCard label="Final URL" value={result.final_url || "Unknown"} />
                  <InfoCard label="Redirect Count" value={String(result.redirect_count)} />
                  <InfoCard label="HTTPS Enabled" value={String(result.https_enabled)} />
                  <InfoCard label="Registrar" value={result.registrar || "Unknown"} />
                  <InfoCard label="Created" value={result.creation_date || "Unknown"} />
                  <InfoCard label="Expires" value={result.expiration_date || "Unknown"} />
                  <InfoCard label="Login Forms" value={String(result.login_forms_detected)} />
                  <InfoCard label="Password Fields" value={String(result.password_fields_detected)} />
                  <InfoCard label="Camera/Microphone" value={String(result.camera_microphone_access)} />
                  <InfoCard label="Location Access" value={String(result.location_access)} />
                  <InfoCard label="Notifications" value={String(result.notification_access)} />
                  <InfoCard label="Scan Type" value={result.scan_type || "Unknown"} />
                  <InfoCard label="Engine Version" value={result.engine_version || "Unknown"} />
                  <InfoCard label="Analysis Source" value={result.analysis_source || "Unknown"} />
                </div>

                <p className="mt-5 text-sm text-yellow-300">
                  {result.permission_note}
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}