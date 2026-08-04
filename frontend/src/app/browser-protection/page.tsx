"use client";

import { apiFetch } from "@/lib/api";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  AlertTriangle,
  Globe,
  LoaderCircle,
  Lock,
  ShieldCheck,
} from "lucide-react";

type Finding = {
  severity?: "HIGH" | "MEDIUM" | "LOW" | "INFO";
  title?: string;
  description?: string;
};

type MatchedIOC = {
  id?: number;
  ioc_type?: string;
  value?: string;
  severity?: string;
  source?: string;
  description?: string;
};

type BrowserProtectionResult = {
  target?: string;
  hostname?: string;
  score?: number;
  risk_score?: number;
  status?: string;
  recommendation?: string;
  explanation?: string;
  url_risk_score?: number;
  vulnerability_score?: number;
  findings?: Finding[];
  threat_intel?: {
    correlation_level?: string;
    risk_adjustment?: number;
    matched_iocs?: MatchedIOC[];
    reasons?: string[];
  };
  ssl?: {
    valid?: boolean;
    issuer?: string;
    expires_at?: string;
    days_left?: number | null;
  };
  network?: {
    ip?: string;
    country?: string;
    region?: string;
    city?: string;
    isp?: string;
    org?: string;
    asn?: string;
  };
  redirects?: {
    count?: number;
    chain?: string[];
    final_url?: string;
  };
};

export default function BrowserProtectionPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<BrowserProtectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkWebsite() {
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError("Please enter a website URL before checking.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await apiFetch(`/browser-protection/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: cleanUrl }),
        }
      );

      if (!response.ok) {
        throw new Error("Browser protection check failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Browser protection check failed:", error);
      setError(
        "Browser protection check failed. The site may be invalid, offline, or blocked."
      );
    } finally {
      setLoading(false);
    }
  }

  const findings = result?.findings || [];
  const matchedIocs = result?.threat_intel?.matched_iocs || [];
  const threatIntelReasons = result?.threat_intel?.reasons || [];
  const status = result?.status || "UNKNOWN";
  const riskScore = result?.risk_score ?? 0;

  function statusColor(currentStatus: string) {
    if (currentStatus === "SAFE") return "text-emerald-300";
    if (currentStatus === "WARNING") return "text-yellow-300";
    if (currentStatus === "BLOCKED") return "text-red-400";
    return "text-slate-300";
  }

  function riskColor(score: number) {
    if (score >= 75) return "text-red-400";
    if (score >= 40) return "text-yellow-300";
    return "text-emerald-300";
  }

  return (
    <div className="app-shell">
      <div className="flex">
        <Sidebar />

        <main className="app-main">
          <section className="app-frame">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
              Browser Security
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Browser Protection
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Analyze websites before visiting them using URL reputation,
              vulnerability findings, SSL status, redirects, and RavShield
              ThreatIntel correlation.
            </p>

            <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
              <label className="text-sm text-slate-400">
                Website URL
              </label>

              <div className="mt-3 flex flex-col gap-3 md:flex-row">
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      checkWebsite();
                    }
                  }}
                  placeholder="https://example.com"
                  className="flex-1 rounded-xl border border-cyan-400/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
                />

                <button
                  onClick={checkWebsite}
                  disabled={loading || !url.trim()}
                  className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-300 transition hover:border-cyan-300/50 hover:bg-cyan-400/15 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="animate-spin" size={18} />
                      Checking...
                    </span>
                  ) : (
                    "Check"
                  )}
                </button>
              </div>
            </div>

            {!result && !loading && !error && (
              <div className="mt-8 rounded-2xl border border-white/5 bg-[#07111f]/90 p-6 text-sm text-slate-400">
                No browser protection check has been run yet.
              </div>
            )}

            {loading && (
              <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-6 text-sm text-cyan-200">
                Checking URL reputation, vulnerability posture, SSL status,
                redirects, and ThreatIntel correlation...
              </div>
            )}

            {error && (
              <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-300">
                {error}
              </div>
            )}

            {result && (
              <>
                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                  <Card
                    icon={<ShieldCheck />}
                    title="Protection Status"
                    value={status}
                    color={statusColor(status)}
                  />

                  <Card
                    icon={<Lock />}
                    title="Trust Score"
                    value={`${result.score ?? 0}/100`}
                  />

                  <Card
                    icon={<Globe />}
                    title="Domain"
                    value={result.hostname || "Unknown"}
                  />

                  <Card
                    icon={<Lock />}
                    title="SSL"
                    value={result.ssl?.valid ? "VALID" : "INVALID"}
                    color={result.ssl?.valid ? "text-emerald-300" : "text-red-300"}
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                  <Card
                    icon={<AlertTriangle />}
                    title="Risk Score"
                    value={`${riskScore}/100`}
                    color={riskColor(riskScore)}
                  />

                  <Card
                    icon={<ShieldCheck />}
                    title="URL Risk"
                    value={`${result.url_risk_score ?? 0}/100`}
                  />

                  <Card
                    icon={<Lock />}
                    title="Vulnerability Score"
                    value={`${result.vulnerability_score ?? 0}/100`}
                  />

                  <Card
                    icon={<Globe />}
                    title="ASN / Provider"
                    value={result.network?.asn || "Unknown"}
                  />
                </div>

                <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
                  <h2 className="text-2xl font-semibold">
                    RavShield ThreatIntel
                  </h2>

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <InfoRow
                      label="Correlation Level"
                      value={result.threat_intel?.correlation_level || "NONE"}
                    />

                    <InfoRow
                      label="Risk Adjustment"
                      value={`${result.threat_intel?.risk_adjustment ?? 0}/100`}
                    />

                    <InfoRow
                      label="Matched IOCs"
                      value={String(matchedIocs.length)}
                    />
                  </div>

                  <div className="mt-5 space-y-3">
                    {matchedIocs.length === 0 && (
                      <p className="rounded-xl border border-white/5 bg-black/35 p-4 text-sm text-slate-500">
                        No local IOC matches found for this target.
                      </p>
                    )}

                    {matchedIocs.map((ioc, index) => (
                      <div
                        key={ioc.id || index}
                        className="rounded-xl border border-red-400/20 bg-red-500/5 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-semibold text-white">
                            {ioc.ioc_type || "IOC"}: {ioc.value || "Unknown"}
                          </p>

                          <span className="text-xs font-bold text-red-300">
                            {ioc.severity || "UNKNOWN"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          {ioc.description || "No description available."}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          Source: {ioc.source || "Unknown"}
                        </p>
                      </div>
                    ))}
                  </div>

                  {threatIntelReasons.length > 0 && (
                    <div className="mt-5 rounded-xl border border-cyan-400/10 bg-black/35 p-4">
                      <p className="text-sm font-semibold text-cyan-300">
                        Correlation Reasons
                      </p>

                      <ul className="mt-3 space-y-2 text-sm text-slate-300">
                        {threatIntelReasons.map((reason, index) => (
                          <li key={index}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
                  <h2 className="text-2xl font-semibold">
                    Intelligence Details
                  </h2>

                  <div className="mt-5 grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                    <InfoRow label="IP Address" value={result.network?.ip} />
                    <InfoRow label="Country" value={result.network?.country} />
                    <InfoRow label="Region" value={result.network?.region} />
                    <InfoRow label="City" value={result.network?.city} />
                    <InfoRow label="ISP" value={result.network?.isp} />
                    <InfoRow label="Organization" value={result.network?.org} />
                    <InfoRow label="SSL Issuer" value={result.ssl?.issuer} />
                    <InfoRow
                      label="SSL Days Left"
                      value={
                        result.ssl?.days_left !== null &&
                        result.ssl?.days_left !== undefined
                          ? String(result.ssl.days_left)
                          : "Unknown"
                      }
                    />
                    <InfoRow
                      label="Final URL"
                      value={result.redirects?.final_url}
                    />
                    <InfoRow
                      label="Redirect Count"
                      value={String(result.redirects?.count ?? 0)}
                    />
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
                  <h2 className="text-2xl font-semibold">
                    Recommendation
                  </h2>

                  <p className="mt-3 text-slate-300">
                    {result.recommendation || "No recommendation returned."}
                  </p>

                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    {result.explanation || "No explanation returned."}
                  </p>
                </div>

                <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
                  <h2 className="text-2xl font-semibold">
                    Findings
                  </h2>

                  <div className="mt-6 space-y-4">
                    {findings.length === 0 && (
                      <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4 text-emerald-300">
                        No browser protection issues detected.
                      </div>
                    )}

                    {findings.map((finding, index) => (
                      <FindingCard key={index} finding={finding} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  value,
  color = "text-white",
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5">
      <div className="text-cyan-300">{icon}</div>

      <p className="mt-4 text-sm text-slate-400">
        {title}
      </p>

      <h3 className={`mt-2 break-all text-xl font-medium ${color}`}>
        {value}
      </h3>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-xl border border-cyan-400/10 bg-black/35 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-all text-sm text-slate-200">
        {value || "Unknown"}
      </p>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const severity = finding.severity || "INFO";

  const color =
    severity === "HIGH"
      ? "border-red-400/20 bg-red-500/5"
      : severity === "MEDIUM"
      ? "border-yellow-400/20 bg-yellow-500/5"
      : severity === "LOW"
      ? "border-emerald-400/20 bg-emerald-500/5"
      : "border-cyan-400/20 bg-cyan-500/5";

  const textColor =
    severity === "HIGH"
      ? "text-red-300"
      : severity === "MEDIUM"
      ? "text-yellow-300"
      : severity === "LOW"
      ? "text-emerald-300"
      : "text-cyan-300";

  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center gap-3">
        <AlertTriangle size={18} className={textColor} />

        <span
          className={`text-xs font-medium uppercase tracking-[0.25em] ${textColor}`}
        >
          {severity}
        </span>

        <span className="font-semibold text-white">
          {finding.title || "Untitled finding"}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-400">
        {finding.description || "No description available."}
      </p>
    </div>
  );
}