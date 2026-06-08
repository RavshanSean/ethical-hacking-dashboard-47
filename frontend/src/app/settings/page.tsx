"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Shield,
  FileArchive,
  Radio,
  Brain,
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/settings")
      .then((response) => response.json())
      .then((data) => setSettings(data))
      .catch((error) => console.error("Settings fetch error:", error));
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <section className="mx-auto max-w-6xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
              System Control
            </p>

            <h1 className="mt-2 text-4xl font-bold">Settings</h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Configure scanner behavior, archive inspection limits,
              AI analysis, and live telemetry options.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-6">
                <div className="flex items-center gap-3">
                  <FileArchive className="text-cyan-300" />
                  <h2 className="text-xl font-semibold">File Scanner Engine</h2>
                </div>

                <div className="mt-6 space-y-5">
                  <SettingRow
                    label="Max file upload size"
                    value={`${settings?.max_file_size ?? 25} MB`}
                  />
                  <SettingRow
                    label="Max archive recursion depth"
                    value={`${settings?.max_archive_depth ?? 2} levels`}
                  />
                  <SettingRow
                    label="ZIP inspection"
                    value={settings?.zip_inspection ? "Enabled" : "Disabled"}
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
                  <SettingRow label="Executable masquerade detection" value="Enabled" />
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-[#0b1220] p-6">
                <div className="flex items-center gap-3">
                  <Brain className="text-purple-300" />
                  <h2 className="text-xl font-semibold">AI Analysis</h2>
                </div>

                <div className="mt-6 space-y-5">
                  <SettingRow
                    label="AI security summary"
                    value={settings?.ai_analysis ? "Enabled" : "Disabled"}
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
                  <SettingRow
                    label="WebSocket events"
                    value={settings?.websocket_enabled ? "Enabled" : "Disabled"}
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