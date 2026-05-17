type Props = {
  summary: string;
};

export default function AIAnalysis({ summary }: Props) {
  return (
    <div className="mt-6 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
      <h3 className="font-bold text-purple-300">
        AI Security Analysis
      </h3>

      <p className="mt-3 text-gray-300 leading-7">
        {summary}
      </p>
    </div>
  );
}
