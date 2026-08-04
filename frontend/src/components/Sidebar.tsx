"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  FileText,
  Database,
} from "lucide-react";
import { getToken } from "@/lib/auth";

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
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    title: "Tools",
    items: [
      { label: "IP & Threat Map", href: "/threat-map", icon: Globe },
      { label: "ThreatIntel", href: "/threat-intel", icon: Database },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "AI Copilot", href: "/ai-copilot", icon: Bot },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    const savedScroll = sessionStorage.getItem("sidebar-scroll");
    if (sidebarRef.current && savedScroll) {
      sidebarRef.current.scrollTop = Number(savedScroll);
    }
  }, [router]);

  function saveSidebarScroll() {
    if (!sidebarRef.current) return;
    sessionStorage.setItem(
      "sidebar-scroll",
      String(sidebarRef.current.scrollTop)
    );
  }

  return (
    <aside
      ref={sidebarRef}
      className="sticky top-0 h-screen w-[17rem] shrink-0 overflow-y-auto border-r border-[var(--line)] bg-[rgba(5,8,14,0.92)] px-5 py-7 backdrop-blur-xl"
    >
      <div>
        <p className="lux-label">Security Core</p>
        <h1 className="lux-title mt-4 text-3xl text-[var(--fg)]">EHD #47</h1>
      </div>

      <nav className="mt-10 space-y-8">
        {navGroups.map((group) => (
          <div key={group.title || "main"}>
            {group.title && (
              <p className="mb-3 px-4 text-[0.65rem] uppercase tracking-[0.28em] text-white/30">
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
                    prefetch
                    onClick={(event) => {
                      if (item.href === "#") {
                        event.preventDefault();
                        return;
                      }
                      saveSidebarScroll();
                    }}
                    className={`group flex items-center gap-4 rounded-xl border px-4 py-3 transition duration-300 ${
                      active
                        ? "border-[var(--accent)]/25 bg-[var(--accent)]/10 text-[var(--accent-strong)]"
                        : "border-transparent text-white/45 hover:border-white/8 hover:bg-white/[0.03] hover:text-white/85"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={
                        active
                          ? "text-[var(--accent-strong)]"
                          : "text-white/35 group-hover:text-[var(--accent-strong)]"
                      }
                    />
                    <span className="text-sm font-medium tracking-wide">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-10 rounded-2xl border border-[var(--line)] bg-black/35 p-4">
        <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/30">
          System Status
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[var(--ok)] shadow-[0_0_14px_rgba(143,191,159,0.7)]" />
          <p className="text-sm font-semibold text-[var(--ok)]">Operational</p>
        </div>
      </div>
    </aside>
  );
}
