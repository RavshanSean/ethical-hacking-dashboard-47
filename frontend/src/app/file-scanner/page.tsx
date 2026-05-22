"use client";

import Sidebar from "@/components/Sidebar";
import {
  FileWarning,
  ShieldAlert,
  Upload,
  Bug,
  ScanSearch,
} from "lucide-react";

const mockFindings = [
  {
    file: "invoice.exe",
    threat: "Trojan Detected",
    level: "HIGH",
  },
  {
    file: "payload.zip",
    threat: "Suspicious Archive",
    level: "MEDIUM",
  },
  {
    file: "photo.png",
    threat: "Clean File",
    level: "LOW",
  },
];

export default function FileScannerPage() {
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
                  Upload files for malware detection,
                  suspicious behavior analysis, and
                  threat classification.
                </p>
              </div>

              <div className="hidden md:flex items-center gap-3 rounded-2xl border border-orange-500/20 bg-[#0b1220] px-5 py-4">
                <Bug className="text-orange-300" size={28} />

                <div>
                  <p className="text-xs text-gray-500">
                    Malware Engine
                  </p>

                  <p className="text-lg font-bold text-orange-300">
                    ACTIVE
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="rounded-2xl border border-red-500/20 bg-[#0b1220] p-5">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-red-400" />

                  <p className="text-sm text-gray-400">
                    Threats Found
                  </p>
                </div>

                <p className="mt-4 text-4xl font-bold text-red-400">
                  7
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/20 bg-[#0b1220] p-5">
                <div className="flex items-center gap-3">
                  <FileWarning className="text-yellow-300" />

                  <p className="text-sm text-gray-400">
                    Suspicious Files
                  </p>
                </div>

                <p className="mt-4 text-4xl font-bold text-yellow-300">
                  14
                </p>
              </div>

              <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-5">
                <div className="flex items-center gap-3">
                  <ScanSearch className="text-green-400" />

                  <p className="text-sm text-gray-400">
                    Files Scanned
                  </p>
                </div>

                <p className="mt-4 text-4xl font-bold text-green-400">
                  392
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-5">
                <div className="flex items-center gap-3">
                  <Upload className="text-cyan-300" />

                  <p className="text-sm text-gray-400">
                    Upload Queue
                  </p>
                </div>

                <p className="mt-4 text-4xl font-bold text-cyan-300">
                  3
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 rounded-2xl border border-orange-500/20 bg-[#0b1220] p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-orange-300">
                    Upload Malware Sample
                  </h2>

                  <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs text-orange-300">
                    ANALYSIS LAB
                  </span>
                </div>

                <div className="mt-6 flex h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-500/20 bg-black">
                  <Upload
                    className="text-orange-300"
                    size={70}
                  />

                  <p className="mt-6 text-2xl font-bold text-orange-300">
                    Drag & Drop Files
                  </p>

                  <p className="mt-3 max-w-md text-center text-sm text-gray-500">
                    Upload executable files, archives,
                    documents, or suspicious payloads for
                    behavioral and signature analysis.
                  </p>

                  <button className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400">
                    Select File
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-green-300">
                    Analysis Feed
                  </h2>

                  <span className="text-xs text-green-400">
                    LIVE
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {mockFindings.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-green-500/10 bg-black p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white">
                          {item.file}
                        </p>

                        <span
                          className={`text-xs font-bold ${
                            item.level === "HIGH"
                              ? "text-red-400"
                              : item.level === "MEDIUM"
                              ? "text-yellow-300"
                              : "text-green-400"
                          }`}
                        >
                          {item.level}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-400">
                        {item.threat}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}