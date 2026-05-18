"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Radar,
} from "lucide-react";

type LiveEvent = {
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  timestamp: string;
};

export default function LiveMonitor() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [error, setError] = useState("");

  async function fetchEvents() {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/events"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();

      setEvents(data.events || []);
      setError("");
    } catch {
      setError(
        "Live events unavailable. Backend may be offline."
      );
    }
  }

  useEffect(() => {
    fetchEvents();

    const interval = setInterval(() => {
      fetchEvents();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  function getSeverityColor(severity: string) {
    if (severity === "HIGH") {
      return "text-red-400 border-red-500/30";
    }

    if (severity === "MEDIUM") {
      return "text-yellow-300 border-yellow-500/30";
    }

    return "text-green-400 border-green-500/30";
  }

  function getEventIcon(severity: string) {
    if (severity === "HIGH") {
      return <AlertTriangle size={18} />;
    }

    if (severity === "MEDIUM") {
      return <Activity size={18} />;
    }

    return <CheckCircle size={18} />;
  }

  return (
    <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-6 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-green-300">
          <Radar size={22} />
          Live Monitor
        </h2>

        <div className="flex items-center gap-2 text-xs text-green-400">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          BACKEND LIVE
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-black p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-3">
        {events.length === 0 && !error ? (
          <div className="rounded-xl border border-green-500/10 bg-black p-4 text-sm text-gray-500">
            No backend security events yet.
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={index}
              className={`rounded-xl border bg-black p-4 ${getSeverityColor(
                event.severity
              )}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getEventIcon(event.severity)}

                  <p className="font-bold">
                    {event.type}
                  </p>
                </div>

                <p className="text-xs text-gray-500">
                  {new Date(
                    event.timestamp
                  ).toLocaleTimeString()}
                </p>
              </div>

              <p className="mt-2 text-sm text-gray-300">
                {event.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}