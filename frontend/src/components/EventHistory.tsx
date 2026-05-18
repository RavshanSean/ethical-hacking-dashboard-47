"use client";

import { useEffect, useState } from "react";

interface SecurityEvent {
  type: string;
  severity: string;
  message: string;
  timestamp: string;
}

export default function EventHistory() {

  const [events, setEvents] = useState<SecurityEvent[]>([]);

  async function loadEvents() {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/events"
      );

      const data = await response.json();

      setEvents(data.events);

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

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] p-6">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-semibold text-cyan-300">
          Historical Telemetry
        </h2>

        <span className="text-sm text-cyan-400">
          DATABASE EVENTS
        </span>

      </div>

      <div className="space-y-4">

        {events.map((event, index) => (

          <div
            key={index}
            className="rounded-xl border border-cyan-500/20 bg-black/40 p-4"
          >

            <div className="flex items-center justify-between mb-2">

              <div className="flex items-center gap-3">

                <span className="font-semibold text-cyan-300">
                  {event.type}
                </span>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
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

            <p className="text-gray-300 text-sm">
              {event.message}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}