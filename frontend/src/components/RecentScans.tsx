type ScanHistoryItem = {
  domain: string;
  threat: string;
  time: string;
};

type Props = {
  scans: ScanHistoryItem[];
};

export default function RecentScans({ scans }: Props) {
  return (
    <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-6">
      <h2 className="text-xl font-semibold text-green-300">
        Recent Scans
      </h2>

      <div className="mt-4 space-y-3">
        {scans.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No scans yet.
          </p>
        ) : (
          scans.map((scan, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg bg-black border border-green-500/10 p-3"
            >
              <div>
                <p className="text-white text-sm font-medium">
                  {scan.domain}
                </p>

                <p className="text-gray-500 text-xs">
                  {scan.time}
                </p>
              </div>

              <div
                className={`text-sm font-bold ${
                  scan.threat.includes("HIGH")
                    ? "text-red-400"
                    : scan.threat.includes("MEDIUM")
                    ? "text-yellow-300"
                    : "text-green-400"
                }`}
              >
                {scan.threat}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}