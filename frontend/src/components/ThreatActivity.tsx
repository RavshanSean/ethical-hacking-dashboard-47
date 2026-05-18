type ActivityItem = {
  domain: string;
  threat: string;
  time: string;
};

type Props = {
  scanHistory: ActivityItem[];
};

export default function ThreatActivity({
  scanHistory,
}: Props) {
  return (
    <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-6 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-green-300">
          Threat Activity
        </h2>

        <div className="flex items-center gap-2 text-xs text-green-400">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          LIVE
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {scanHistory.length === 0 ? (
          <p className="text-sm text-gray-500">
            No threat activity yet.
          </p>
        ) : (
          [...scanHistory]
            .reverse()
            .slice(0, 5)
            .map((scan, index) => (
              <div
                key={index}
                className="rounded-xl border border-green-500/10 bg-black p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">
                    {scan.domain}
                  </p>

                  <span
                    className={`text-xs font-bold ${
                      scan.threat.includes("HIGH")
                        ? "text-red-400"
                        : scan.threat.includes("MEDIUM")
                        ? "text-yellow-300"
                        : "text-green-400"
                    }`}
                  >
                    {scan.threat}
                  </span>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Scan completed at {scan.time}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  );
}