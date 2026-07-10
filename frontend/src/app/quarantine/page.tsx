"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { API_BASE_URL } from "@/config/api";
import { ShieldAlert, Skull, Archive, LoaderCircle } from "lucide-react";

type QuarantineItem = {
  id: string;
  original_filename?: string;
  stored_filename?: string;
  threat_level?: string;
  risk_score?: number;
  threat?: string | null;
  status?: string;
  created_at?: string | number;
};

export default function QuarantinePage() {
  const [items, setItems] = useState<QuarantineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadQuarantine() {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/quarantine`);

      if (!response.ok) {
        throw new Error("Failed to load quarantine records");
      }

      const data = await response.json();

      setItems(data.items || []);
      setError("");
    } catch (error) {
      console.error("Failed to load quarantine:", error);
      setError("Quarantine records are currently unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuarantine();
  }, []);

  async function deleteItem(id: string) {
    if (!confirm("Delete this quarantined file permanently?")) return;

    setDeleteLoadingId(id);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/quarantine/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete quarantine item");
      }

      await loadQuarantine();
    } catch (error) {
      console.error("Failed to delete quarantine item:", error);
      setError("Failed to delete quarantine item.");
    } finally {
      setDeleteLoadingId(null);
    }
  }

  const highRiskCount = items.filter(
    (item) => item.threat_level === "HIGH"
  ).length;

  const malwareSignatureCount = items.filter((item) => item.threat).length;

  const statusLabel = error ? "UNAVAILABLE" : loading ? "LOADING" : "ACTIVE";

  return (
    <div className="min-h-screen bg-[#020711] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-7xl">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
              Malware Containment
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Quarantine
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Review files isolated by the antivirus engine after malware
              detection.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <StatCard
                title="Quarantined Files"
                value={loading ? "--" : String(items.length)}
                icon={<Archive />}
              />

              <StatCard
                title="High Risk"
                value={loading ? "--" : String(highRiskCount)}
                icon={<ShieldAlert />}
              />

              <StatCard
                title="Malware Signatures"
                value={loading ? "--" : String(malwareSignatureCount)}
                icon={<Skull />}
              />
            </div>

            {error && (
              <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                    Isolated Files
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Quarantine Records
                  </h2>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs ${
                    error
                      ? "border-slate-400/15 bg-slate-400/10 text-slate-300"
                      : "border-red-400/15 bg-red-400/10 text-red-300"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {loading && (
                  <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-6 text-sm text-cyan-200">
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="animate-spin" size={18} />
                      Loading quarantine records...
                    </span>
                  </div>
                )}

                {!loading && !error && items.length === 0 && (
                  <div className="rounded-2xl border border-white/5 bg-black/30 p-6 text-center text-slate-400">
                    No quarantined files yet.
                  </div>
                )}

                {!loading &&
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-red-400/10 bg-black/35 p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <p className="break-all text-lg font-semibold text-white">
                            {item.original_filename || "Unknown file"}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            Threat: {item.threat || "Unknown"}
                          </p>

                          <p className="mt-1 break-all text-xs text-slate-500">
                            Stored as: {item.stored_filename || "Unknown"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Created:{" "}
                            {item.created_at
                              ? new Date(item.created_at).toLocaleString()
                              : "Unknown"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge color="red">
                            {item.threat_level || "UNKNOWN"}
                          </Badge>

                          <Badge color="yellow">
                            Risk {item.risk_score ?? 0}/100
                          </Badge>

                          <Badge color="cyan">
                            {item.status || "UNKNOWN"}
                          </Badge>

                          <button
                            onClick={() => deleteItem(item.id)}
                            disabled={deleteLoadingId === item.id}
                            className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:border-red-300/50 hover:bg-red-500/20 disabled:opacity-50"
                          >
                            {deleteLoadingId === item.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5">
      <div className="text-cyan-300">{icon}</div>

      <p className="mt-4 text-sm text-slate-400">{title}</p>

      <h3 className="mt-2 text-3xl font-semibold text-white">
        {value}
      </h3>
    </div>
  );
}

function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "red" | "yellow" | "cyan";
}) {
  const styles = {
    red: "border-red-400/20 bg-red-500/10 text-red-300",
    yellow: "border-yellow-400/20 bg-yellow-500/10 text-yellow-300",
    cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[color]}`}
    >
      {children}
    </span>
  );
}