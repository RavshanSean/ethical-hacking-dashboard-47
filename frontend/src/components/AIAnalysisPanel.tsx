import { BrainCircuit } from "lucide-react";

export default function AIAnalysisPanel() {
  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5 shadow-[0_0_35px_rgba(0,255,220,0.05)]">
      <div className="flex items-center gap-3">
        <BrainCircuit
          className="text-cyan-300"
          size={24}
        />

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            AI Analysis
          </p>

          <h3 className="text-xl font-semibold text-white">
            Security Assessment
          </h3>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-cyan-400/10 bg-black/30 p-4">
        <p className="text-sm text-slate-300">
          Current telemetry indicates normal activity.
          No active malware campaigns detected.
        </p>

        <ul className="mt-4 space-y-2 text-sm text-slate-400">
          <li>• Threat activity remains low.</li>
          <li>• No abnormal traffic spikes.</li>
          <li>• System health is stable.</li>
          <li>• Recommended action: continue monitoring.</li>
        </ul>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Risk Score
          </span>

          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
            LOW
          </span>
        </div>
      </div>
    </div>
  );
}