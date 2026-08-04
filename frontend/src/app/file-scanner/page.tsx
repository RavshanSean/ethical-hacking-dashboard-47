"use client";

import { apiFetch } from "@/lib/api";
import { useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  FileWarning,
  ShieldAlert,
  Upload,
  Bug,
  ScanSearch,
  LoaderCircle,
} from "lucide-react";

type FileScanResult = {
  filename?: string;
  entropy?: number;
  detected_file_type?: string;
  risk_score?: number;
  threat_level?: string;
  file_size?: number;
  engine_version?: string;
  status?: string;
  sha256?: string;
  reasons?: string[];
  ai_summary?: string;
  archive_findings?: string[];
  suspicious_script_patterns?: string[];
  hash_reputation?: {
    status?: string;
    known?: boolean;
    threat?: string | null;
    category?: string;
    source?: string;
    risk_score?: number;
  };
};

export default function FileScannerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<FileScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reportRef = useRef<HTMLDivElement | null>(null);

  async function scanFile() {
    if (!selectedFile) {
      setError("Please choose a file before scanning.");
      return;
    }

    setLoading(true);
    setError("");
    setScanResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await apiFetch(`/scan-file`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "File scan failed"
        );
      }

      const data = await response.json();
      setScanResult(data);

      setTimeout(() => {
        reportRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      console.error("File scan failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "File scan failed. Please try another file."
      );
    } finally {
      setLoading(false);
    }
  }

  const threatLevel = scanResult?.threat_level || "UNKNOWN";
  const riskScore = scanResult?.risk_score ?? 0;

  const threatCount = threatLevel === "HIGH" ? 1 : 0;
  const suspiciousCount = threatLevel === "MEDIUM" ? 1 : 0;
  const filesScanned = scanResult ? 1 : 0;
  const uploadQueue = selectedFile && !scanResult && !loading ? 1 : 0;

  const reasons = scanResult?.reasons || [];
  const archiveFindings = scanResult?.archive_findings || [];
  const scriptPatterns = scanResult?.suspicious_script_patterns || [];

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
                  Malware Analysis
                </p>

                <h1 className="mt-2 text-4xl font-bold">
                  File Scanner
                </h1>

                <p className="mt-3 max-w-3xl text-gray-400">
                  Upload files for malware detection, suspicious behavior
                  analysis, archive inspection, hash intelligence, and threat
                  classification.
                </p>
              </div>

              <div className="hidden items-center gap-3 rounded-2xl border border-orange-500/20 bg-[#0b1220] px-5 py-4 md:flex">
                <Bug className="text-orange-300" size={28} />

                <div>
                  <p className="text-xs text-gray-500">
                    Analysis Mode
                  </p>

                  <p className="text-lg font-bold text-orange-300">
                    On Demand
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-4">
              <StatCard
                title="Current Threats"
                value={threatCount}
                icon={<ShieldAlert className="text-red-400" />}
                textColor="text-red-400"
                borderColor="border-red-500/20"
              />

              <StatCard
                title="Current Suspicious"
                value={suspiciousCount}
                icon={<FileWarning className="text-yellow-300" />}
                textColor="text-yellow-300"
                borderColor="border-yellow-500/20"
              />

              <StatCard
                title="Current Scan"
                value={filesScanned}
                icon={<ScanSearch className="text-green-400" />}
                textColor="text-green-400"
                borderColor="border-green-500/20"
              />

              <StatCard
                title="Upload Queue"
                value={uploadQueue}
                icon={<Upload className="text-cyan-300" />}
                textColor="text-cyan-300"
                borderColor="border-cyan-500/20"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-orange-500/20 bg-[#0b1220] p-6 xl:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-orange-300">
                    Upload File
                  </h2>

                  <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs text-orange-300">
                    STATIC ANALYSIS
                  </span>
                </div>

                <div className="mt-6 flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-500/20 bg-black p-6">
                  <Upload className="text-orange-300" size={70} />

                  <p className="mt-6 text-2xl font-bold text-orange-300">
                    Choose File
                  </p>

                  <p className="mt-3 max-w-md text-center text-sm text-gray-500">
                    Upload executables, archives, documents, scripts, or
                    suspicious payloads for local backend analysis.
                  </p>

                  <input
                    type="file"
                    onChange={(event) => {
                      setSelectedFile(event.target.files?.[0] || null);
                      setScanResult(null);
                      setError("");
                    }}
                    className="mt-6 block w-full max-w-md rounded-xl border border-orange-500/20 bg-black p-3 text-sm text-gray-300"
                  />

                  {selectedFile && (
                    <p className="mt-3 max-w-md break-all text-center text-sm text-slate-400">
                      Selected: {selectedFile.name}
                    </p>
                  )}

                  <button
                    onClick={scanFile}
                    disabled={!selectedFile || loading}
                    className="mt-4 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400 disabled:bg-gray-700 disabled:text-gray-400"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <LoaderCircle className="animate-spin" size={18} />
                        Scanning...
                      </span>
                    ) : (
                      "Scan File"
                    )}
                  </button>
                </div>

                {loading && (
                  <div className="mt-5 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 text-sm text-orange-200">
                    File analysis is running. The report will appear when the
                    backend finishes scanning.
                  </div>
                )}

                {error && (
                  <div className="mt-5 rounded-xl border border-red-500/30 bg-black p-4 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {!scanResult && !loading && !error && (
                  <div className="mt-5 rounded-xl border border-white/5 bg-black/30 p-4 text-sm text-slate-500">
                    No file scan report yet.
                  </div>
                )}

                {scanResult && (
                  <div
                    ref={reportRef}
                    className="mt-5 rounded-xl border border-orange-500/20 bg-black p-5"
                  >
                    <h3 className="text-lg font-bold text-orange-300">
                      File Scan Report
                    </h3>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-300 md:grid-cols-2">
                      <InfoLine label="Filename" value={scanResult.filename || "Unknown"} />
                      <InfoLine label="Entropy" value={String(scanResult.entropy ?? "Unknown")} />
                      <InfoLine label="Type" value={scanResult.detected_file_type || "Unknown"} />
                      <InfoLine label="Risk" value={`${riskScore}/100`} />
                      <InfoLine label="Threat" value={threatLevel} />
                      <InfoLine label="Size" value={`${scanResult.file_size ?? "Unknown"} bytes`} />
                      <InfoLine label="Engine" value={scanResult.engine_version || "Unknown"} />
                      <InfoLine label="Status" value={scanResult.status || "Unknown"} />
                    </div>

                    <div className="mt-4 rounded-lg border border-orange-500/10 bg-[#050816] p-3">
                      <p className="text-xs text-gray-500">SHA256</p>

                      <p className="mt-1 break-all text-xs text-orange-200">
                        {scanResult.sha256 || "Unknown"}
                      </p>
                    </div>

                    {scanResult.hash_reputation && (
                      <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4">
                        <p className="font-semibold text-cyan-300">
                          Hash Reputation
                        </p>

                        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-300 md:grid-cols-2">
                          <InfoLine label="Status" value={scanResult.hash_reputation.status || "Unknown"} />
                          <InfoLine label="Known" value={String(scanResult.hash_reputation.known ?? "Unknown")} />
                          <InfoLine label="Threat" value={scanResult.hash_reputation.threat || "None"} />
                          <InfoLine label="Category" value={scanResult.hash_reputation.category || "Unknown"} />
                          <InfoLine label="Source" value={scanResult.hash_reputation.source || "Unknown"} />
                          <InfoLine label="Risk" value={`${scanResult.hash_reputation.risk_score ?? 0}/100`} />
                        </div>
                      </div>
                    )}

                    {scanResult.ai_summary && (
                      <div className="mt-4 rounded-lg border border-purple-500/20 bg-purple-500/10 p-4">
                        <p className="font-semibold text-purple-300">
                          AI File Analysis
                        </p>

                        <p className="mt-2 text-sm leading-7 text-gray-300">
                          {scanResult.ai_summary}
                        </p>
                      </div>
                    )}

                    <div className="mt-4">
                      <p className="font-semibold text-orange-300">
                        Reasons
                      </p>

                      {reasons.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-sm text-gray-300">
                          {reasons.map((reason, index) => (
                            <li key={index}>• {reason}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">
                          No detailed reasons were returned.
                        </p>
                      )}
                    </div>

                    {archiveFindings.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-2 font-semibold text-orange-400">
                          Archive Findings
                        </h3>

                        <ul className="space-y-2 text-sm text-orange-200">
                          {archiveFindings.map((finding, index) => (
                            <li key={index}>• {finding}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {scriptPatterns.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-2 font-semibold text-red-400">
                          Suspicious Script Patterns
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          {scriptPatterns.map((pattern, index) => (
                            <span
                              key={index}
                              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-300"
                            >
                              {pattern}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-6">
                <h2 className="text-xl font-semibold text-green-300">
                  Latest Scan
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Displays the most recently completed file analysis in this session.
                </p>

                {scanResult ? (
                  <div className="mt-5 rounded-xl border border-green-500/20 bg-black/40 p-4">
                    <p className="font-semibold text-white">
                      {scanResult.filename || "Unknown file"}
                    </p>

                    <div className="mt-3 space-y-2 text-sm text-gray-300">
                      <p>
                        Threat:{" "}
                        <span
                          className={
                            threatLevel === "HIGH"
                              ? "text-red-300"
                              : threatLevel === "MEDIUM"
                              ? "text-yellow-300"
                              : "text-green-300"
                          }
                        >
                          {threatLevel}
                        </span>
                      </p>

                      <p>Risk Score: {riskScore}/100</p>
                      <p>Status: {scanResult.status || "Unknown"}</p>
                      <p>Engine: {scanResult.engine_version || "Unknown"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-white/5 bg-black/40 p-4">
                    <p className="text-sm text-gray-500">
                      No file scanned yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <p>
      <span className="text-slate-500">{label}:</span>{" "}
      <span className="text-slate-300">{value}</span>
    </p>
  );
}

function StatCard({
  title,
  value,
  icon,
  textColor,
  borderColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  textColor: string;
  borderColor: string;
}) {
  return (
    <div className={`rounded-2xl border ${borderColor} bg-[#0b1220] p-5`}>
      <div className="flex items-center gap-3">
        {icon}

        <p className="text-sm text-gray-400">
          {title}
        </p>
      </div>

      <p className={`mt-4 text-4xl font-bold ${textColor}`}>
        {value}
      </p>
    </div>
  );
}