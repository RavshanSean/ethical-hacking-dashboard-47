"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Radar } from "lucide-react";

type LiveEvent = {
  id: number;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  time: string;
};

const simulatedMessages = [
  {
    type: "SCAN",
    severity: "LOW",
    message: "Background URL scanner heartbeat received",
  },
  {
    type: "NETWORK",
    severity: "MEDIUM",
    message: "Unusual script activity pattern detected",
  },
  {
    type: "THREAT",
    severity: "HIGH",
    message: "Suspicious phishing-style domain pattern observed",
  },
  {
    type: "SYSTEM",
    severity: "LOW",
    message: "Scanner engine health check passed",
  },
];

export default function LiveMonitor() {
  const [events, setEvents] = useState<LiveEvent[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvent =
        simulatedMessages[
          Math.floor(Math.random() * simulatedMessages.length)
        ];

      const newEvent: LiveEvent = {
        id: Date.now(),
        type: randomEvent.type,
        severity: randomEvent.severity as "LOW" | "MEDIUM" | "HIGH",
        message: randomEvent.message,
        time: new Date().toLocaleTimeString(),
      };

      setEvents((previous) => [newEvent, ...previous].slice(0, 6));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  function getSeverityColor(severity: string) {
    if (severity === "HIGH") return "text-red-400 border-red-500/30";
    if (severity === "MEDIUM") return "text-yellow-300 border-yellow-500/30";
    return "text-green-400 border-green-500/30";
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
          SIMULATED LIVE
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3">
        {events.length === 0 ? (
          <div className="rounded-xl border border-green-500/10 bg-black p-4 text-sm text-gray-500">
            Waiting for live security events...
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`rounded-xl border bg-black p-4 ${getSeverityColor(
                event.severity
              )}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {event.severity === "HIGH" ? (
                    <AlertTriangle size={18} />
                  ) : event.severity === "MEDIUM" ? (
                    <Activity size={18} />
                  ) : (
                    <CheckCircle size={18} />
                  )}

                  <p className="font-bold">{event.type}</p>
                </div>

                <p className="text-xs text-gray-500">{event.time}</p>
              </div>

              <p className="mt-2 text-sm text-gray-300">{event.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}