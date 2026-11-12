import React from "react";
import { SeverityLevel } from "@/types/audit";
import { getSeverityColor } from "@/utils/riskCalculators";

export default function SeverityBadge({
  severity,
  size = "md",
}: {
  severity: SeverityLevel;
  size?: "sm" | "md";
}) {
  const color = getSeverityColor(severity);
  const sizeClasses = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded uppercase tracking-wide border ${color.bg} ${color.text} ${color.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        severity === "CRITICAL" ? "bg-red-600" :
        severity === "HIGH" ? "bg-orange-500" :
        severity === "MEDIUM" ? "bg-amber-500" : "bg-blue-500"
      }`} />
      {severity}
    </span>
  );
}

