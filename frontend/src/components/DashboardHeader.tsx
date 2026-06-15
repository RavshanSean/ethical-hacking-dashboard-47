"use client";

import { useEffect, useState } from "react";
import { Bell, LogOut, Search, ShieldCheck, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type StoredUser = {
  username: string;
  email: string;
};

export default function DashboardHeader() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <header className="mb-8 overflow-hidden rounded-[24px] border border-cyan-400/10 bg-[#050b16] shadow-[0_0_45px_rgba(0,255,220,0.05)]">
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
          <div className="hidden min-w-[280px] items-center gap-3 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-slate-400 shadow-inner md:flex">
            <Search size={18} className="text-cyan-300" />
            <span className="text-sm">Search threats, scans, logs...</span>
          </div>

          <button className="relative rounded-2xl border border-white/10 bg-black/45 p-3 text-cyan-300 transition hover:border-cyan-300/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)]">
            <Bell size={20} />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-[0_0_18px_rgba(239,68,68,0.7)]">
              3
            </span>
          </button>

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