export default function SystemOverview() {
  return (
    <div className="rounded-2xl border border-green-500/20 bg-[#0b1220] p-6">
      <h2 className="text-xl font-semibold text-green-300">
        System Overview
      </h2>

      <div className="mt-5 space-y-4 text-sm">
        <div className="rounded-xl bg-black p-4 border border-green-500/10">
          <p className="text-gray-400">Backend</p>
          <p className="text-green-400 font-bold">
            FastAPI Active
          </p>
        </div>

        <div className="rounded-xl bg-black p-4 border border-green-500/10">
          <p className="text-gray-400">Browser Scanner</p>
          <p className="text-green-400 font-bold">
            Playwright Enabled
          </p>
        </div>

        <div className="rounded-xl bg-black p-4 border border-green-500/10">
          <p className="text-gray-400">Scan Mode</p>
          <p className="text-green-400 font-bold">
            Dynamic + Static
          </p>
        </div>
      </div>
    </div>
  );
}