import {
  LayoutDashboard,
  Shield,
  FileWarning,
  Globe,
  Activity,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen border-r border-green-500/20 bg-[#081018] p-5">
      <div>
        <p className="text-green-400 text-sm tracking-widest uppercase">
          Security Core
        </p>

        <h1 className="mt-2 text-2xl font-bold text-white">
          EHD #47
        </h1>
      </div>

      <nav className="mt-10 space-y-2">
        <SidebarItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active
        />

        <SidebarItem
          icon={<Shield size={18} />}
          label="URL Scanner"
        />

        <SidebarItem
          icon={<FileWarning size={18} />}
          label="File Scanner"
        />

        <SidebarItem
          icon={<Globe size={18} />}
          label="Threat Map"
        />

        <SidebarItem
          icon={<Activity size={18} />}
          label="Live Monitor"
        />

        <SidebarItem
          icon={<Settings size={18} />}
          label="Settings"
        />
      </nav>

      <div className="mt-10 rounded-xl border border-green-500/20 bg-black p-4">
        <p className="text-gray-400 text-sm">
          System Status
        </p>

        <div className="mt-3 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />

          <p className="text-green-400 font-bold">
            All Systems Operational
          </p>
        </div>
      </div>
    </aside>
  );
}

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
};

function SidebarItem({
  icon,
  label,
  active = false,
}: SidebarItemProps) {
  return (
    <button
      className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 transition ${
        active
          ? "bg-green-500/10 text-green-400 border border-green-500/20"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}

      <span className="font-medium">
        {label}
      </span>
    </button>
  );
}