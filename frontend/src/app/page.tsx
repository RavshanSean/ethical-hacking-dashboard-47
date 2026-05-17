"use client";
import AIAnalysis from "../components/AIAnalysis";
import InfoCard from "../components/InfoCard";
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
  registrar: string;
  creation_date: string;
  expiration_date: string;
  risk_score: number;
  threat_level: string;
  reasons: string[];
  scripts_detected: number;
  login_forms_detected: number;
  password_fields_detected: number;
  camera_microphone_access: boolean;
  location_access: boolean;
  notification_access: boolean;
  permission_note: string;
};

type ScanHistoryItem = {
  domain: string;
  threat: string;
  time: string;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  async function scanWebsite() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/scan-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Backend scan failed");
      }

      const data = await response.json();

      setResult(data);

      setScanHistory((previous) => [
        {
          domain: data.domain,
          threat: data.threat_level,
          time: new Date().toLocaleTimeString(),
        },
        ...previous,
      ]);
    } catch {
      setError("Scan failed. The site may be offline, invalid, or blocked.");
    } finally {
      setLoading(false);
    }
  }

  const threatStyle =
    result?.risk_score && result.risk_score >= 70
      ? {
          text: "text-red-400",
          border: "border-red-500/30",
          bg: "bg-red-500/10",
        }
      : result?.risk_score && result.risk_score >= 30
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

  function buildSecuritySummary() {
    if (!result) return "";

    if (result.threat_level === "HIGH") {
      return "This domain shows multiple dangerous indicators including suspicious keywords, redirects, or phishing behavior. Avoid entering sensitive information.";
    }

    if (result.threat_level === "MEDIUM") {
      return "This website contains suspicious characteristics. Review scripts, redirects, and domain structure before trusting it.";
    }

    return "This website appears relatively safe based on the current scan analysis. No major high-risk indicators were detected.";
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white p-8">
      <section className="max-w-6xl mx-auto">
        <div>
          <p className="text-sm text-green-400 tracking-widest uppercase">
            Security Platform
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Ethical Hacking Dashboard #47
          </h1>

          <p className="mt-3 text-gray-400">
            Scan URLs, analyze web behavior, and detect suspicious indicators.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-green-500/20 bg-[#0b1220] p-6">
            <h2 className="text-2xl font-semibold text-green-300">
              URL Threat Scanner
            </h2>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                type="text"
                placeholder="https://example.com"
                className="flex-1 bg-black border border-green-500/30 rounded-xl px-4 py-3 text-white outline-none"
              />

              <button
                onClick={scanWebsite}
                disabled={loading || url.length === 0}
                className="bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-400 text-black font-bold px-6 py-3 rounded-xl transition"
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

            {result && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="mt-6 rounded-xl border border-green-500/20 bg-black p-5">
                <h3 className="font-bold text-green-300">Security Reasons</h3>

                <ul className="mt-3 space-y-2 text-gray-300">
                  {result.reasons.map((reason, index) => (
                    <li key={index}>• {reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {result && (
              <AIAnalysis summary={buildSecuritySummary()} />
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-6">
              <h2 className="text-xl font-semibold text-green-300">
                System Overview
              </h2>

              <div className="mt-5 space-y-4 text-sm">
                <div className="rounded-xl bg-black p-4 border border-green-500/10">
                  <p className="text-gray-400">Backend</p>
                  <p className="text-green-400 font-bold">FastAPI Active</p>
                </div>

                <div className="rounded-xl bg-black p-4 border border-green-500/10">
                  <p className="text-gray-400">Browser Scanner</p>
                  <p className="text-green-400 font-bold">
                    Playwright Enabled
                  </p>
                </div>

                <div className="rounded-xl bg-black p-4 border border-green-500/10">
                  <p className="text-gray-400">Scan Mode</p>
                  <p className="text-green-400 font-bold">
                    Dynamic + Static
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-6">
              <h2 className="text-xl font-semibold text-green-300">
                Recent Scans
              </h2>

              <div className="mt-4 space-y-3">
                {scanHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">No scans yet.</p>
                ) : (
                  scanHistory.map((scan, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-black border border-green-500/10 p-3"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">
                          {scan.domain}
                        </p>

                        <p className="text-gray-500 text-xs">{scan.time}</p>
                      </div>

                      <div
                        className={`text-sm font-bold ${
                          scan.threat.includes("HIGH")
                            ? "text-red-400"
                            : scan.threat.includes("MEDIUM")
                            ? "text-yellow-300"
                            : "text-green-400"
                        }`}
                      >
                        {scan.threat}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="mt-6 rounded-2xl border border-green-500/20 bg-[#0b1220] p-6">
            <h2 className="text-xl font-semibold text-green-300">
              Full Scan Details
            </h2>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <InfoCard label="Domain" value={result.domain} />
              <InfoCard label="Registrar" value={result.registrar} />
              <InfoCard label="Created" value={result.creation_date} />
              <InfoCard label="Expires" value={result.expiration_date} />
              <InfoCard
                label="Login Forms"
                value={String(result.login_forms_detected)}
              />
              <InfoCard
                label="Password Fields"
                value={String(result.password_fields_detected)}
              />
              <InfoCard
                label="Camera/Microphone"
                value={String(result.camera_microphone_access)}
              />
              <InfoCard
                label="Location Access"
                value={String(result.location_access)}
              />
              <InfoCard
                label="Notifications"
                value={String(result.notification_access)}
              />
            </div>

            <p className="mt-5 text-yellow-300 text-sm">
              {result.permission_note}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

