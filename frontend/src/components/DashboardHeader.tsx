"use client";

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

export default function DashboardHeader() {
  const router = useRouter();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/threat-map/events")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAlerts(data.slice(0, 5));
        }
      })
      .catch((error) => console.error("Alert fetch error:", error));
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  const filteredAlerts = alerts.filter((alert) =>
    JSON.stringify(alert)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

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
          <div className="hidden min-w-[360px] items-center gap-3 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-slate-400 shadow-inner md:flex">
            <Search size={18} className="text-cyan-300" />

            <input
              type="text"
              placeholder="Search threats, scans, logs..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setAlertsOpen(true);
              }}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setAlertsOpen((open) => !open)}
              className="relative rounded-2xl border border-white/10 bg-black/45 p-3 text-cyan-300 transition hover:border-cyan-300/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)]"
            >
              <Bell size={20} />

              {alerts.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-[0_0_18px_rgba(239,68,68,0.7)]">
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
                    {filteredAlerts.length} active
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {filteredAlerts.length === 0 && (
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3 text-sm text-emerald-300">
                      No matching alerts.
                    </div>
                  )}

                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="rounded-xl border border-white/5 bg-black/40 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">
                          {alert.threat_type}
                        </p>

                        <span
                          className={`text-xs font-bold ${
                            alert.severity === "HIGH"
                              ? "text-red-300"
                              : alert.severity === "MEDIUM"
                                ? "text-yellow-300"
                                : "text-emerald-300"
                          }`}
                        >
                          {alert.severity}
                        </span>
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

          <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-black/45 px-4 py-3">
            <ShieldCheck className="text-emerald-400" size={21} />

            <div>
              <p className="text-xs text-slate-500">Protection</p>
              <p className="text-sm font-bold text-emerald-400">Online</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/15 bg-black/45 px-4 py-3">
            <UserCircle className="text-cyan-300" size={31} />

            <div>
              <p className="text-sm font-semibold text-white">
                {user?.username || "Analyst"}
              </p>
              <p className="text-xs text-emerald-400">Pro Plan</p>
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