"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { API_BASE_URL } from "@/config/api";
import { Lock, ShieldCheck, AlertTriangle, Globe } from "lucide-react";

export default function BrowserProtectionPage() {
  const [url, setUrl] = useState("https://example.com");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function checkWebsite() {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/browser-protection/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        }
      );

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function statusColor(status: string) {
    if (status === "SAFE") return "text-emerald-300";
    if (status === "WARNING") return "text-yellow-300";
    return "text-red-400";
  }

  return (
    <div className="min-h-screen bg-[#020711] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-7xl">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
              Browser Security
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Browser Protection
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Analyze websites before visiting them.
            </p>

            <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
              <label className="text-sm text-slate-400">
                Website URL
              </label>

              <div className="mt-3 flex gap-3">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 rounded-xl border border-cyan-400/10 bg-black/40 px-4 py-3"
                />

                <button
                  onClick={checkWebsite}
                  disabled={loading}
                  className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-cyan-300"
                >
                  {loading ? "Checking..." : "Check"}
                </button>
              </div>
            </div>

            {result && (
              <>

                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                  <Card
                    icon={<ShieldCheck />}
                    title="Protection Status"
                    value={result.status}
                    color={statusColor(result.status)}
                  />

                  <Card
                    icon={<Lock />}
                    title="Trust Score"
                    value={`${result.score}/100`}
                  />

                  <Card
                    icon={<Globe />}
                    title="Domain"
                    value={result.hostname}
                  />

                  <Card
                    icon={<Lock />}
                    title="SSL"
                    value={result.ssl.valid ? "VALID" : "INVALID"}
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
                  <Card
                    icon={<AlertTriangle />}
                    title="Risk Score"
                    value={`${result.risk_score}/100`}
                    color={
                      result.risk_score >= 75
                        ? "text-red-400"
                        : result.risk_score >= 40
                        ? "text-yellow-300"
                        : "text-emerald-300"
                    }
                  />

                  <Card
                    icon={<ShieldCheck />}
                    title="URL Risk"
                    value={`${result.url_risk_score}/100`}
                  />

                  <Card
                    icon={<Lock />}
                    title="Vulnerability Score"
                    value={`${result.vulnerability_score}/100`}
                  />

                  <Card
                    icon={<Globe />}
                    title="ASN / Provider"
                    value={result.network?.asn || "Unknown"}
                  />
                </div>

                <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
                  <h2 className="text-2xl font-semibold">
                    Intelligence Details
                  </h2>

                  <div className="mt-5 grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                    <InfoRow label="IP Address" value={result.network?.ip} />
                    <InfoRow label="Country" value={result.network?.country} />
                    <InfoRow label="City" value={result.network?.city} />
                    <InfoRow label="ISP" value={result.network?.isp} />
                    <InfoRow label="Organization" value={result.network?.org} />
                    <InfoRow label="SSL Issuer" value={result.ssl?.issuer} />
                    <InfoRow
                      label="SSL Days Left"
                      value={
                        result.ssl?.days_left !== null && result.ssl?.days_left !== undefined
                          ? String(result.ssl.days_left)
                          : "Unknown"
                      }
                    />
                    <InfoRow label="Final URL" value={result.redirects?.final_url} />
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
                    {result.recommendation}
                  </p>

                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    {result.explanation}
                  </p>

                </div>

                <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
                  <h2 className="text-2xl font-semibold">
                    Findings
                  </h2>

                  <div className="mt-6 space-y-4">
                    {result.findings.length === 0 && (
                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4 text-emerald-300">
                            No browser protection issues detected.
                        </div>
                        )}
                        
                    {result.findings.map(
                      (finding: any, index: number) => (
                        <div
                            key={index}
                            className={`rounded-xl border p-4 ${
                                finding.severity === "HIGH"
                                ? "border-red-400/20 bg-red-500/5"
                                : finding.severity === "MEDIUM"
                                ? "border-yellow-400/20 bg-yellow-500/5"
                                : "border-emerald-400/20 bg-emerald-500/5"
                            }`}
                            >
                            <div className="flex items-center gap-3">
                                <AlertTriangle
                                size={18}
                                className={
                                    finding.severity === "HIGH"
                                    ? "text-red-300"
                                    : finding.severity === "MEDIUM"
                                    ? "text-yellow-300"
                                    : "text-emerald-300"
                                }
                                />

                                <span
                                className={`text-xs font-medium uppercase tracking-[0.25em] ${
                                    finding.severity === "HIGH"
                                    ? "text-red-300"
                                    : finding.severity === "MEDIUM"
                                    ? "text-yellow-300"
                                    : "text-emerald-300"
                                }`}
                                >
                                {finding.severity}
                                </span>

                                <span className="font-semibold text-white">
                                {finding.title}
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-slate-400">
                                {finding.description}
                            </p>
                            </div>
                      )
                    )}
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

      <h3 className={`mt-2 text-xl font-medium ${color}`}>
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