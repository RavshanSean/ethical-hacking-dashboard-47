"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Run a callback immediately and on an interval only while the tab is visible. */
export function useVisibilityPolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled = true
) {
  const saved = useRef(callback);

  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      void saved.current();
    };

    const start = () => {
      if (timer) return;
      tick();
      timer = setInterval(tick, intervalMs);
    };

    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs, enabled]);
}

type BackendStats = {
  total_events: number;
  high_threats: number;
  medium_threats: number;
  low_threats: number;
};

let statsCache: BackendStats | null = null;
let statsPromise: Promise<BackendStats> | null = null;
const statsListeners = new Set<(stats: BackendStats) => void>();

async function fetchStatsOnce(): Promise<BackendStats> {
  const { apiFetch } = await import("@/lib/api");
  const response = await apiFetch("/stats");
  if (!response.ok) {
    throw new Error("Failed to load stats");
  }
  return response.json();
}

export async function loadSharedStats(force = false): Promise<BackendStats> {
  if (!force && statsCache) return statsCache;
  if (!force && statsPromise) return statsPromise;

  statsPromise = fetchStatsOnce()
    .then((data) => {
      statsCache = data;
      statsListeners.forEach((listener) => listener(data));
      return data;
    })
    .finally(() => {
      statsPromise = null;
    });

  return statsPromise;
}

export function useSharedStats(pollMs = 8000) {
  const [stats, setStats] = useState<BackendStats>(
    statsCache || {
      total_events: 0,
      high_threats: 0,
      medium_threats: 0,
      low_threats: 0,
    }
  );

  useEffect(() => {
    const listener = (next: BackendStats) => setStats(next);
    statsListeners.add(listener);
    return () => {
      statsListeners.delete(listener);
    };
  }, []);

  const refresh = useCallback(async () => {
    await loadSharedStats(true);
  }, []);

  useVisibilityPolling(refresh, pollMs);

  return stats;
}
