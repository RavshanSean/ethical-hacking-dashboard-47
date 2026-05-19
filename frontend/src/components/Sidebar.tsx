import {
  LayoutDashboard,
  Shield,
  FileWarning,
  Globe,
  Activity,
  Settings,
  BarChart3,
  ScrollText,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "#dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "URL Scanner", href: "#scanner", icon: <Shield size={18} /> },
  { label: "Live Monitor", href: "#live-monitor", icon: <Activity size={18} /> },
  { label: "Logs", href: "#logs", icon: <ScrollText size={18} /> },
  { label: "Analytics", href: "#analytics", icon: <BarChart3 size={18} /> },
  { label: "Threat Map", href: "#threat-map", icon: <Globe size={18} /> },
  { label: "File Scanner", href: "#file-scanner", icon: <FileWarning size={18} /> },
  { label: "Settings", href: "#settings", icon: <Settings size={18} /> },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 overflow-y-auto border-r border-green-500/20 bg-[#081018] p-5">
      <div>
        <p className="text-green-400 text-sm tracking-widest uppercase">
          Security Core
        </p>

        <h1 className="mt-2 text-2xl font-bold text-white">
          EHD #47
        </h1>
      </div>

      <nav className="mt-10 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-400 transition hover:bg-green-500/10 hover:text-green-400 hover:border hover:border-green-500/20"
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="mt-10 rounded-xl border border-green-500/20 bg-black p-4">
        <p className="text-gray-400 text-sm">System Status</p>

        <div className="mt-3 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />
          <p className="text-green-400 font-bold">Operational</p>
        </div>
      </div>
    </aside>
  );
}