"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Shield,
  FileArchive,
  Radio,
  Brain,
  Save,
} from "lucide-react";

type AppSettings = {
  max_file_size: number;
  max_archive_depth: number;
  zip_inspection: boolean;
  ai_analysis: boolean;
  websocket_enabled: boolean;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    max_file_size: 25,
    max_archive_depth: 2,
    zip_inspection: true,
    ai_analysis: true,
    websocket_enabled: true,
  });

  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/settings")
      .then((response) => response.json())
      .then((data) => setSettings(data))
      .catch((error) => console.error("Settings fetch error:", error));
  }, []);

  function updateSetting(key: keyof AppSettings, value: number | boolean) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function saveSettings() {
    setSaveStatus("Saving...");

    try {
      const response = await fetch("http://127.0.0.1:8000/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await response.json();
      setSettings(data);
      setSaveStatus("Settings saved");
    } catch (error) {
      console.error("Settings save error:", error);
      setSaveStatus("Save failed");
    }
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-6xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
              System Control
            </p>

            <div className="mt-2 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold">Settings</h1>

                <p className="mt-3 max-w-3xl text-gray-400">
                  Configure scanner behavior, archive inspection limits,
                  AI analysis, and live telemetry options.
                </p>
              </div>

              <button
                onClick={saveSettings}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
              >
                <Save size={18} />
                Save Settings
              </button>
            </div>

            {saveStatus && (
              <p className="mt-4 text-sm text-cyan-300">
                {saveStatus}
              </p>
            )}

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-6">
                <div className="flex items-center gap-3">
                  <FileArchive className="text-cyan-300" />
                  <h2 className="text-xl font-semibold">File Scanner Engine</h2>
                </div>

                <div className="mt-6 space-y-5">
                  <NumberSettingRow
                    label="Max file upload size"
                    value={settings.max_file_size}
                    suffix="MB"
                    onChange={(value) => updateSetting("max_file_size", value)}
                  />

                  <NumberSettingRow
                    label="Max archive recursion depth"
                    value={settings.max_archive_depth}
                    suffix="levels"
                    onChange={(value) =>
                      updateSetting("max_archive_depth", value)
                    }
                  />

                  <ToggleSettingRow
                    label="ZIP inspection"
                    checked={settings.zip_inspection}
                    onChange={(value) =>
                      updateSetting("zip_inspection", value)
                    }
                  />

                  <SettingRow
                    label="Password-protected ZIP detection"
                    value="Enabled"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-6">
                <div className="flex items-center gap-3">
                  <Shield className="text-green-300" />
                  <h2 className="text-xl font-semibold">Detection Rules</h2>
                </div>

                <div className="mt-6 space-y-5">
                  <SettingRow label="Dangerous extensions" value="Enabled" />
                  <SettingRow label="Script heuristics" value="Enabled" />
                  <SettingRow label="Entropy analysis" value="Enabled" />
                  <SettingRow
                    label="Executable masquerade detection"
                    value="Enabled"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-[#0b1220] p-6">
                <div className="flex items-center gap-3">
                  <Brain className="text-purple-300" />
                  <h2 className="text-xl font-semibold">AI Analysis</h2>
                </div>

                <div className="mt-6 space-y-5">
                  <ToggleSettingRow
                    label="AI security summary"
                    checked={settings.ai_analysis}
                    onChange={(value) =>
                      updateSetting("ai_analysis", value)
                    }
                  />

                  <SettingRow label="Analysis mode" value="Local rules" />
                  <SettingRow label="OpenAI integration" value="Planned" />
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-500/20 bg-[#0b1220] p-6">
                <div className="flex items-center gap-3">
                  <Radio className="text-yellow-300" />
                  <h2 className="text-xl font-semibold">Live Telemetry</h2>
                </div>

                <div className="mt-6 space-y-5">
                  <ToggleSettingRow
                    label="WebSocket events"
                    checked={settings.websocket_enabled}
                    onChange={(value) =>
                      updateSetting("websocket_enabled", value)
                    }
                  />

                  <SettingRow label="Threat Map live updates" value="Enabled" />
                  <SettingRow label="Database event storage" value="Enabled" />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
      <p className="text-sm text-gray-300">{label}</p>

      <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
        {value}
      </span>
    </div>
  );
}

function NumberSettingRow({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
      <p className="text-sm text-gray-300">{label}</p>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-20 rounded-lg border border-cyan-500/20 bg-black px-2 py-1 text-right text-sm text-cyan-300 outline-none"
        />

        <span className="text-xs text-gray-400">{suffix}</span>
      </div>
    </div>
  );
}

function ToggleSettingRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
      <p className="text-sm text-gray-300">{label}</p>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`rounded-full border px-3 py-1 text-xs transition ${
          checked
            ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
            : "border-red-500/20 bg-red-500/10 text-red-300"
        }`}
      >
        {checked ? "Enabled" : "Disabled"}
      </button>
    </div>
  );
}