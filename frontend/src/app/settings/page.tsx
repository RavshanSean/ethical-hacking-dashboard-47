"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Brain, FileArchive, Radio, Save, Shield } from "lucide-react";

type AppSettings = {
  max_file_size: number;
  max_archive_depth: number;
  zip_inspection: boolean;
  ai_analysis: boolean;
  websocket_enabled: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
  max_file_size: 25,
  max_archive_depth: 2,
  zip_inspection: true,
  ai_analysis: true,
  websocket_enabled: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  async function loadSettings() {
    setLoading(true);
    setLoadError("");

    try {
      const response = await apiFetch(`/settings`);
      if (!response.ok) throw new Error("Failed to load settings");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Settings fetch error:", error);
      setLoadError("Settings are currently unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function updateSetting(key: keyof AppSettings, value: number | boolean) {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setSaveStatus("");
  }

  async function saveSettings() {
    if (settings.max_file_size < 1 || settings.max_archive_depth < 1) {
      setSaveStatus("File size and archive depth must be at least 1.");
      return;
    }

    setSaving(true);
    setSaveStatus("Saving...");

    try {
      const response = await apiFetch(`/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to save settings");
      const data = await response.json();
      setSettings(data);
      setSaveStatus("Settings saved.");
    } catch (error) {
      console.error("Settings save error:", error);
      setSaveStatus("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <section className="mx-auto max-w-6xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">System Control</p>

            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-4xl font-bold">Settings</h1>
                <p className="mt-3 max-w-3xl text-gray-400">Configure scanner behavior, archive inspection limits, AI analysis, and live telemetry options.</p>
              </div>

              <button onClick={saveSettings} disabled={loading || saving || Boolean(loadError)} className="flex w-fit items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50">
                <Save size={18} />
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>

            {loading && <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5 text-sm text-cyan-200">Loading settings...</div>}

            {loadError && (
              <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-300">
                <p>{loadError}</p>
                <button onClick={loadSettings} className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-red-200">Retry</button>
              </div>
            )}

            {saveStatus && <p className="mt-4 text-sm text-cyan-300">{saveStatus}</p>}

            {!loading && !loadError && (
              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-6">
                  <div className="flex items-center gap-3"><FileArchive className="text-cyan-300" /><h2 className="text-xl font-semibold">File Scanner Engine</h2></div>
                  <div className="mt-6 space-y-5">
                    <NumberSettingRow label="Max file upload size" value={settings.max_file_size} suffix="MB" min={1} onChange={(value) => updateSetting("max_file_size", value)} />
                    <NumberSettingRow label="Max archive recursion depth" value={settings.max_archive_depth} suffix="levels" min={1} onChange={(value) => updateSetting("max_archive_depth", value)} />
                    <ToggleSettingRow label="ZIP inspection" checked={settings.zip_inspection} onChange={(value) => updateSetting("zip_inspection", value)} />
                    <CapabilityRow label="Password-protected ZIP detection" value="Built in" />
                  </div>
                </div>

                <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-6">
                  <div className="flex items-center gap-3"><Shield className="text-green-300" /><h2 className="text-xl font-semibold">Detection Capabilities</h2></div>
                  <div className="mt-6 space-y-5">
                    <CapabilityRow label="Dangerous extensions" value="Built in" />
                    <CapabilityRow label="Script heuristics" value="Built in" />
                    <CapabilityRow label="Entropy analysis" value="Built in" />
                    <CapabilityRow label="Executable masquerade detection" value="Built in" />
                  </div>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-[#0b1220] p-6">
                  <div className="flex items-center gap-3"><Brain className="text-purple-300" /><h2 className="text-xl font-semibold">AI Analysis</h2></div>
                  <div className="mt-6 space-y-5">
                    <ToggleSettingRow label="AI security summary" checked={settings.ai_analysis} onChange={(value) => updateSetting("ai_analysis", value)} />
                    <CapabilityRow label="Analysis mode" value="Local rules" />
                    <CapabilityRow label="OpenAI integration" value="Planned" />
                  </div>
                </div>

                <div className="rounded-2xl border border-yellow-500/20 bg-[#0b1220] p-6">
                  <div className="flex items-center gap-3"><Radio className="text-yellow-300" /><h2 className="text-xl font-semibold">Live Telemetry</h2></div>
                  <div className="mt-6 space-y-5">
                    <ToggleSettingRow label="WebSocket events" checked={settings.websocket_enabled} onChange={(value) => updateSetting("websocket_enabled", value)} />
                    <CapabilityRow label="Threat Map live updates" value="Built in" />
                    <CapabilityRow label="Database event storage" value="Built in" />
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function CapabilityRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/30 px-4 py-3"><p className="text-sm text-gray-300">{label}</p><span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">{value}</span></div>;
}

function NumberSettingRow({ label, value, suffix, min, onChange }: { label: string; value: number; suffix: string; min: number; onChange: (value: number) => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-black/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-300">{label}</p>
      <div className="flex items-center gap-2">
        <input type="number" min={min} value={value} onChange={(event) => onChange(Math.max(min, Number(event.target.value) || min))} className="w-24 rounded-lg border border-cyan-500/20 bg-black px-2 py-1 text-right text-sm text-cyan-300 outline-none" />
        <span className="text-xs text-gray-400">{suffix}</span>
      </div>
    </div>
  );
}

function ToggleSettingRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/30 px-4 py-3"><p className="text-sm text-gray-300">{label}</p><button type="button" onClick={() => onChange(!checked)} className={`rounded-full border px-3 py-1 text-xs transition ${checked ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300" : "border-red-500/20 bg-red-500/10 text-red-300"}`}>{checked ? "Enabled" : "Disabled"}</button></div>;
}