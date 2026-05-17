import React from "react";

type InfoCardProps = {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
};

export default function InfoCard({
  label,
  value,
  color = "text-white",
  icon,
}: InfoCardProps) {
  return (
    <div className="rounded-xl bg-black border border-green-500/10 p-4">
      <p className="text-gray-500">{label}</p>

      <div className={`mt-1 flex items-center gap-2 text-gray-200 break-words ${color}`}>
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}