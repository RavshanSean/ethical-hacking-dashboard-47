"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { Bell, LogOut, Search, ShieldCheck, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
type StoredUser = {
  username: string;
  email: string;
};

type AlertItem = {
  id: number;
  threat_type: string;
  severity: string;
  message: string;
  timestamp: string;
};

type SearchEvent = {
  id: number;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
};

type SearchScan = {
  id: number;
  url: string;
  domain: string;
  risk_score: number;
  threat_level: string;
  created_at: string;
};

export default function DashboardHeader() {
  const router = useRouter();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchEvents, setSearchEvents] = useState<SearchEvent[]>([]);
  const [searchScans, setSearchScans] = useState<SearchScan[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const response = await apiFetch(`/threat-map/events`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setAlerts(data.slice(0, 5));
        }
      } catch (error) {
        console.error("Alert fetch error:", error);
      }
    }

    loadAlerts();

    const interval = setInterval(loadAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function runSearch() {
      if (!searchQuery.trim()) {
        setSearchEvents([]);
        setSearchScans([]);
        setSearchOpen(false);
        return;
      }

      try {
        const response = await apiFetch(`/search?q=${encodeURIComponent(searchQuery)}`
        );

        const data = await response.json();

        setSearchEvents(data.events || []);
        setSearchScans(data.scans || []);
        setSearchOpen(true);
      } catch (error) {
        console.error("Search failed:", error);
      }
    }

    const timeout = setTimeout(runSearch, 350);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  const highAlerts = alerts.filter((alert) => alert.severity === "HIGH").length;
  const mediumAlerts = alerts.filter((alert) => alert.severity === "MEDIUM").length;
  const lowAlerts = alerts.filter((alert) => alert.severity === "LOW").length;

  function getBellBadgeColor() {
    if (highAlerts > 0) {
      return "bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.7)]";
    }

    if (mediumAlerts > 0) {
      return "bg-yellow-400 text-black shadow-[0_0_18px_rgba(250,204,21,0.55)]";
    }

    return "bg-emerald-400 text-black shadow-[0_0_18px_rgba(52,211,153,0.55)]";
  }

  const protectionLabel =
    highAlerts > 0 ? "Attention" : mediumAlerts > 0 ? "Warning" : "Stable";

  const protectionColor =
    highAlerts > 0
      ? "text-red-400"
      : mediumAlerts > 0
      ? "text-yellow-300"
      : "text-emerald-400";

  const protectionBorder =
    highAlerts > 0
      ? "border-red-400/15"
      : mediumAlerts > 0
      ? "border-yellow-400/15"
      : "border-emerald-400/15";

  return (
    <header className="mb-8 overflow-visible rounded-[24px] border border-cyan-400/10 bg-[#050b16] shadow-[0_0_45px_rgba(0,255,220,0.05)]">
      <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.42em] text-cyan-300">
            Security Command Center
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
            Ethical Hacking Dashboard #47
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Live threat telemetry, scanner intelligence, and security operation
            controls in one command view.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative hidden min-w-[360px] md:block">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-slate-400 shadow-inner">
              <Search size={18} className="text-cyan-300" />

              <input
                type="text"
                placeholder="Search threats, scans, logs..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchOpen(true);
                }}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>

            {searchOpen && searchQuery.trim() && (
              <div className="absolute left-0 z-50 mt-3 w-[460px] rounded-2xl border border-cyan-400/10 bg-[#07111f] p-4 shadow-[0_0_35px_rgba(34,211,238,0.12)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Search Results
                  </h3>

                  <button
                    onClick={() => setSearchOpen(false)}
                    className="text-xs text-slate-500 hover:text-cyan-300"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <SearchSection title="Events">
                    {searchEvents.length === 0 ? (
                      <EmptySearch text="No matching events." />
                    ) : (
                      searchEvents.map((event) => (
                        <SearchResultCard
                          key={`event-${event.id}`}
                          title={event.type.replaceAll("_", " ")}
                          badge={event.severity}
                          description={event.message}
                          severity={event.severity}
                        />
                      ))
                    )}
                  </SearchSection>

                  <SearchSection title="Scan Results">
                    {searchScans.length === 0 ? (
                      <EmptySearch text="No matching scans." />
                    ) : (
                      searchScans.map((scan) => (
                        <SearchResultCard
                          key={`scan-${scan.id}`}
                          title={scan.domain}
                          badge={`${scan.risk_score}/100`}
                          description={scan.url}
                          severity={scan.threat_level}
                        />
                      ))
                    )}
                  </SearchSection>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setAlertsOpen((open) => !open)}
              className="relative rounded-2xl border border-white/10 bg-black/45 p-3 text-cyan-300 transition hover:border-cyan-300/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)]"
            >
              <Bell size={20} />

              {alerts.length > 0 && (
                <span
                  className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${getBellBadgeColor()}`}
                >
                  {alerts.length}
                </span>
              )}
            </button>

            {alertsOpen && (
              <div className="absolute right-0 z-50 mt-3 w-96 rounded-2xl border border-cyan-400/10 bg-[#07111f] p-4 shadow-[0_0_35px_rgba(34,211,238,0.12)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Recent Alerts
                  </h3>

                  <span className="text-xs text-cyan-300">
                    {alerts.length} active
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <AlertCount label="High" count={highAlerts} color="text-red-300" border="border-red-400/20" bg="bg-red-500/5" />
                  <AlertCount label="Medium" count={mediumAlerts} color="text-yellow-300" border="border-yellow-400/20" bg="bg-yellow-500/5" />
                  <AlertCount label="Low" count={lowAlerts} color="text-emerald-300" border="border-emerald-400/20" bg="bg-emerald-500/5" />
                </div>

                <div className="mt-4 space-y-3">
                  {alerts.length === 0 && (
                    <div className="rounded-xl border border-sky-400/20 bg-sky-500/5 p-3 text-sm text-sky-300">
                      No recent alerts.
                    </div>
                  )}

                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="rounded-xl border border-white/5 bg-black/40 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">
                          {alert.threat_type}
                        </p>

                        <SeverityText severity={alert.severity} />
                      </div>

                      <p className="mt-2 text-sm text-slate-300">
                        {alert.message}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={`flex items-center gap-3 rounded-2xl border ${protectionBorder} bg-black/45 px-4 py-3`}>
            <ShieldCheck className={protectionColor} size={21} />

            <div>
              <p className="text-xs text-slate-500">Telemetry</p>
              <p className={`text-sm font-bold ${protectionColor}`}>
                {protectionLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/15 bg-black/45 px-4 py-3">
            <UserCircle className="text-cyan-300" size={31} />

            <div>
              <p className="text-sm font-semibold text-white">
                {user?.username || "Analyst"}
              </p>
              <p className="text-xs text-slate-500">
                {user?.email || "Signed in"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="ml-2 rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-red-300 transition hover:border-red-300/50 hover:bg-red-500/20 hover:text-red-200"
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />
    </header>
  );
}

function SearchSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
        {title}
      </p>

      <div className="mt-2 space-y-2">
        {children}
      </div>
    </div>
  );
}

function SearchResultCard({
  title,
  badge,
  description,
  severity,
}: {
  title: string;
  badge: string;
  description: string;
  severity: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-white">
          {title}
        </p>

        <span className={`text-xs font-bold ${getSeverityColor(severity)}`}>
          {badge}
        </span>
      </div>

      <p className="mt-2 break-all text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function EmptySearch({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs text-slate-500">
      {text}
    </p>
  );
}

function AlertCount({
  label,
  count,
  color,
  border,
  bg,
}: {
  label: string;
  count: number;
  color: string;
  border: string;
  bg: string;
}) {
  return (
    <div className={`rounded-xl border ${border} ${bg} p-2 text-center`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{count}</p>
    </div>
  );
}

function SeverityText({ severity }: { severity: string }) {
  return (
    <span className={`text-xs font-bold ${getSeverityColor(severity)}`}>
      {severity}
    </span>
  );
}

function getSeverityColor(severity: string) {
  if (severity === "HIGH") return "text-red-300";
  if (severity === "MEDIUM") return "text-yellow-300";
  return "text-emerald-300";
}