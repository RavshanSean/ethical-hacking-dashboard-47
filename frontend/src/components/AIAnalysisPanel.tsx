"use client";

import { apiFetch } from "@/lib/api";
import { useCallback, useState } from "react";
import { BrainCircuit, RefreshCw } from "lucide-react";

export default function AIAnalysisPanel() {
  const [summary, setSummary] = useState(
    "Generate an on-demand assessment of current dashboard telemetry."
  );
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadAISummary = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiFetch(`/ai-copilot/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "Give me dashboard summary",
        }),
      });

      const data = await response.json();
      setSummary(data.answer || "AI summary unavailable.");
      setHasLoaded(true);
    } catch (error) {
      console.error("AI dashboard summary failed:", error);
      setSummary("AI summary unavailable. Backend may be offline.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="lux-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BrainCircuit className="text-[var(--accent-strong)]" size={24} />
          <div>
            <p className="lux-label">AI Analysis</p>
            <h3 className="lux-title mt-1 text-xl">Security Assessment</h3>
          </div>
        </div>

        <button
          onClick={loadAISummary}
          disabled={loading}
          className="rounded-xl border border-[var(--line)] bg-white/[0.03] p-2 text-[var(--accent-strong)] transition hover:border-[var(--accent)]/40 disabled:opacity-50"
          title="Generate AI summary"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-[var(--line)] bg-black/25 p-4">
        <p className="text-sm leading-6 text-[var(--muted)]">
          {loading
            ? "AI analyst is reviewing dashboard telemetry..."
            : summary}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.25em] text-white/30">
            {hasLoaded ? "Engine" : "On demand"}
          </span>
          <span className="rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-3 py-1 text-sm font-semibold text-[var(--accent-strong)]">
            AI V3
          </span>
        </div>
      </div>
    </div>
  );
}
