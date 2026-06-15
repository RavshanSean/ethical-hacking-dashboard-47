"use client";

import { useRouter } from "next/navigation";
import { FileWarning, Monitor, Shield } from "lucide-react";

export default function QuickScanPanel() {
  const router = useRouter();

  const scans = [
    {
      title: "URL Scan",
      description: "Analyze suspicious links and web behavior.",
      icon: Shield,
      href: "/url-scanner",
      color: "text-cyan-300",
    },
    {
      title: "File Scan",
      description: "Inspect uploads, scripts, archives, and entropy.",
      icon: FileWarning,
      href: "/file-scanner",
      color: "text-emerald-300",
    },
    {
      title: "System Scan",
      description: "Check local system health and security signals.",
      icon: Monitor,
      href: "#",
      color: "text-violet-300",
    },
  ];

  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5 shadow-[0_0_35px_rgba(0,255,220,0.05)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Quick Actions
          </p>

          <h3 className="mt-2 text-xl font-semibold text-white">
            Quick Scan
          </h3>
        </div>

        <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
          READY
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {scans.map((scan) => {
          const Icon = scan.icon;

          return (
            <button
              key={scan.title}
              onClick={() => {
                if (scan.href !== "#") {
                  router.push(scan.href);
                }
              }}
              className="rounded-2xl border border-white/5 bg-black/35 p-4 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/5"
            >
              <Icon className={scan.color} size={26} />

              <h4 className="mt-4 font-semibold text-white">
                {scan.title}
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                {scan.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}