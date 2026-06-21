"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import {
  LayoutDashboard,
  Shield,
  FileWarning,
  Globe,
  Activity,
  Settings,
  BarChart3,
  ScrollText,
  Monitor,
  Bug,
  Network,
  Lock,
  Box,
} from "lucide-react";

const navGroups = [
  {
    title: "",
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Scan",
    items: [
      { label: "URL Scanner", href: "/url-scanner", icon: Shield },
      { label: "File Scanner", href: "/file-scanner", icon: FileWarning },
      { label: "System Scan", href: "/system-scan", icon: Monitor },
      { label: "Vulnerability Scan", href: "/vulnerability-scan", icon: Bug },
      { label: "Browser Protection", href: "/browser-protection", icon: Lock },
      
      
    ],
  },
  {
    title: "Monitor",
    items: [
      { label: "Live Monitor", href: "/live-monitor", icon: Activity },
      { label: "Processes", href: "/processes", icon: BarChart3 },
      { label: "Network", href: "/network", icon: Network },
      { label: "Quarantine", href: "/quarantine", icon: Box },
      { label: "Logs", href: "/logs", icon: ScrollText },
      { label: "Reports", href: "/analytics", icon: BarChart3 },
      
    ],
  },
  {
    title: "Tools",
    items: [
      { label: "IP & Threat Map", href: "/threat-map", icon: Globe },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "AI Copilot", href: "/ai-copilot", icon: Bot },
    ],
  },
];
export default function Sidebar() {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("sidebar-scroll");

    if (sidebarRef.current && savedScroll) {
      sidebarRef.current.scrollTop = Number(savedScroll);
    }
  }, []);

  function saveSidebarScroll() {
    if (!sidebarRef.current) return;

    sessionStorage.setItem(
      "sidebar-scroll",
      String(sidebarRef.current.scrollTop)
    );
  }

  return (
    <aside ref={sidebarRef} className="sticky top-0 h-screen w-64 shrink-0 overflow-y-auto border-r border-cyan-400/10 bg-[#020711] px-5 py-7">
      <div>
        <p className="text-xs uppercase tracking-[0.42em] text-cyan-300">
          Security Core
        </p>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
          EHD #47
        </h1>
      </div>

      <nav className="mt-10 space-y-8">
        {navGroups.map((group) => (
          <div key={group.title || "main"}>
            {group.title && (
              <p className="mb-3 px-4 text-xs uppercase tracking-[0.28em] text-slate-600">
                {group.title}
              </p>
            )}

            <div className="space-y-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.href !== "#" && pathname === item.href;

                return (
                  <Link
                      key={item.label}
                      href={item.href}
                      onClick={(event) => {
                        if (item.href === "#") {
                          event.preventDefault();
                          return;
                        }

                        saveSidebarScroll();
                      }}
                    className={`group flex items-center gap-4 rounded-xl border px-4 py-3 transition ${
                      active
                        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.08)]"
                        : "border-transparent text-slate-400 hover:border-cyan-400/10 hover:bg-white/[0.03] hover:text-cyan-200"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        active
                          ? "text-cyan-300"
                          : "text-slate-500 group-hover:text-cyan-300"
                      }
                    />

                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-10 rounded-2xl border border-cyan-400/10 bg-black/45 p-4 shadow-[0_0_28px_rgba(0,255,220,0.04)]">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          System Status
        </p>

        <div className="mt-4 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
          <p className="text-sm font-semibold text-emerald-400">Operational</p>
        </div>
      </div>
    </aside>
  );
}