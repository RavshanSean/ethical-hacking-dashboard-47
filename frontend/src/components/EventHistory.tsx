"use client";

import { API_BASE_URL } from "@/config/api";
import { useEffect, useState } from "react";

interface SecurityEvent {
  type: string;
  severity: string;
  message: string;
  timestamp: string;
}

export default function EventHistory() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  async function loadEvents() {
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      const data = await response.json();

      setEvents(data.events || []);
    } catch (error) {
      console.error("Failed to load events:", error);
    }
  }

  useEffect(() => {
    loadEvents();

    const interval = setInterval(() => {
      loadEvents();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = JSON.stringify(event)
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesSeverity =
      severityFilter === "ALL" || event.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-cyan-300">
            Historical Telemetry
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredEvents.length} of {events.length} events shown
          </p>
        </div>

        <span className="text-sm text-cyan-400">
          DATABASE EVENTS
        </span>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search logs by type, message, country, severity..."
          className="rounded-xl border border-cyan-400/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
        />

        <select
          value={severityFilter}
          onChange={(event) => setSeverityFilter(event.target.value)}
          className="rounded-xl border border-cyan-400/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
        >
          <option value="ALL">All severities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2">
        {filteredEvents.length === 0 && (
          <div className="rounded-xl border border-cyan-500/20 bg-black/40 p-4 text-sm text-slate-400">
            No matching logs found.
          </div>
        )}

        {filteredEvents.map((event, index) => (
          <div
            key={index}
            className="rounded-xl border border-cyan-500/20 bg-black/40 p-4"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-cyan-300">
                  {event.type}
                </span>

                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    event.severity === "HIGH"
                      ? "bg-red-500/20 text-red-400"
                      : event.severity === "MEDIUM"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {event.severity}
                </span>
              </div>

              <span className="text-xs text-gray-500">
                {new Date(event.timestamp).toLocaleString()}
              </span>
            </div>

            <p className="text-sm text-gray-300">
              {event.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}