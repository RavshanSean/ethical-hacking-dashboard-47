"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { BrainCircuit, RefreshCw } from "lucide-react";
export default function AIAnalysisPanel() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadAISummary() {
    setLoading(true);

    try {
      const response = await apiFetch(`/ai-copilot/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: "Give me dashboard summary",
        }),
      });

      const data = await response.json();

      setSummary(data.answer || "AI summary unavailable.");
    } catch (error) {
      console.error("AI dashboard summary failed:", error);
      setSummary("AI summary unavailable. Backend may be offline.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAISummary();
  }, []);

  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5 shadow-[0_0_35px_rgba(0,255,220,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BrainCircuit className="text-cyan-300" size={24} />

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              AI Analysis
            </p>

            <h3 className="text-xl font-semibold text-white">
              Security Assessment
            </h3>
          </div>
        </div>

        <button
          onClick={loadAISummary}
          disabled={loading}
          className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-300 transition hover:border-cyan-300/50 disabled:opacity-50"
          title="Refresh AI summary"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-cyan-400/10 bg-black/30 p-4">
        <p className="text-sm leading-6 text-slate-300">
          {loading ? "AI analyst is reviewing dashboard telemetry..." : summary}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Engine
          </span>

          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-300">
            AI V3
          </span>
        </div>
      </div>
    </div>
  );
}