"use client";

import { Bell, Search, ShieldCheck, LogOut, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardHeader() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-green-500/20 bg-[#0b1220]/80 p-5 shadow-[0_0_40px_rgba(34,197,94,0.08)] lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm tracking-widest text-green-400 uppercase">
          Security Platform
        </p>

        <h1 className="mt-2 text-4xl font-bold text-white">
          Ethical Hacking Dashboard #47
        </h1>

        <p className="mt-2 text-gray-400">
          Scan URLs, analyze web behavior, and detect suspicious indicators.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-green-500/20 bg-black px-4 py-3 text-gray-400 md:flex">
          <Search size={18} />
          <span className="text-sm">Search threats...</span>
        </div>

        <button className="relative rounded-xl border border-green-500/20 bg-black p-3 text-green-400 transition hover:border-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.25)]">
          <Bell size={20} />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            3
          </span>
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-black px-4 py-3">
          <ShieldCheck className="text-green-400" size={20} />
          <div>
            <p className="text-xs text-gray-500">Protection</p>
            <p className="text-sm font-bold text-green-400">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-black px-4 py-3">
          <UserCircle className="text-green-400" size={28} />

          <div>
            <p className="text-sm font-bold text-white">Sean</p>
            <p className="text-xs text-green-400">Pro Plan</p>
          </div>

          <button
            onClick={handleLogout}
            className="ml-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500 hover:text-white"
            title="Logout"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}