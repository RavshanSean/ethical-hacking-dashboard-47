type ScanHistoryItem = {
  domain: string;
  threat: string;
  time: string;
};

type StatsCardsProps = {
  scanHistory: ScanHistoryItem[];
  lastDomain?: string;
};

export default function StatsCards({
  scanHistory,
  lastDomain,
}: StatsCardsProps) {
  const totalScans = scanHistory.length;

  const highRisk = scanHistory.filter((scan) =>
    scan.threat.includes("HIGH")
  ).length;

  const mediumRisk = scanHistory.filter((scan) =>
    scan.threat.includes("MEDIUM")
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title="Total Scans"
        value={String(totalScans)}
        color="text-cyan-400"
      />

      <StatCard
        title="High Risk"
        value={String(highRisk)}
        color="text-red-400"
      />

      <StatCard
        title="Medium Risk"
        value={String(mediumRisk)}
        color="text-yellow-300"
      />

      <StatCard
        title="Last Domain"
        value={lastDomain || "N/A"}
        color="text-green-400"
      />
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  color: string;
};

function StatCard({
  title,
  value,
  color,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-5 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
      <p className="text-sm text-gray-400">
        {title}
      </p>

      <h3 className={`mt-3 text-3xl font-bold ${color}`}>
        {value}
      </h3>
    </div>
  );
}