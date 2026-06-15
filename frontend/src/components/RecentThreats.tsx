export default function RecentThreats() {
  const threats = [
    {
      severity: "HIGH",
      title: "Malware Detected",
    },
    {
      severity: "MEDIUM",
      title: "Port Scan Activity",
    },
    {
      severity: "LOW",
      title: "Safe Scan Completed",
    },
    {
      severity: "HIGH",
      title: "Suspicious Login",
    },
  ];

  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-[#07111f]/90 p-5">
      <h3 className="text-lg font-semibold text-white">
        Recent Threats
      </h3>

      <div className="mt-4 space-y-3">
        {threats.map((threat, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 p-3"
          >
            <span className="text-sm text-white">
              {threat.title}
            </span>

            <span
              className={`text-xs font-bold ${
                threat.severity === "HIGH"
                  ? "text-red-400"
                  : threat.severity === "MEDIUM"
                  ? "text-yellow-300"
                  : "text-green-400"
              }`}
            >
              {threat.severity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}