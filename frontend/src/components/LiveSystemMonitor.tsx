import { Cpu, HardDrive, MemoryStick, Wifi } from "lucide-react";

const metrics = [
  { label: "CPU", value: "42%", icon: Cpu },
  { label: "RAM", value: "68%", icon: MemoryStick },
  { label: "Disk", value: "51%", icon: HardDrive },
  { label: "Network", value: "Live", icon: Wifi },
];

export default function LiveSystemMonitor() {
  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5 shadow-[0_0_35px_rgba(0,255,220,0.05)]">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
        Monitor
      </p>

      <h3 className="mt-2 text-xl font-semibold text-white">
        Live System Monitor
      </h3>

      <div className="mt-5 grid grid-cols-2 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/5 bg-black/35 p-4"
            >
              <Icon className="text-cyan-300" size={22} />

              <p className="mt-3 text-sm text-slate-400">
                {metric.label}
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {metric.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}