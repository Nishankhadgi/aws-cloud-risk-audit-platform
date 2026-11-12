import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "default" | "emerald" | "rose" | "amber" | "blue" | "teal";
  trend?: string;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "default",
  trend,
  onClick,
}: StatCardProps) {
  const colorMap = {
    default: "text-slate-700 bg-slate-100",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    rose: "text-rose-700 bg-rose-50 border-rose-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    blue: "text-blue-700 bg-blue-50 border-blue-200",
    teal: "text-teal-700 bg-teal-50 border-teal-200",
  };

  const iconColorMap = {
    default: "text-slate-600 bg-slate-200/60",
    emerald: "text-emerald-600 bg-emerald-100",
    rose: "text-rose-600 bg-rose-100",
    amber: "text-amber-600 bg-amber-100",
    blue: "text-blue-600 bg-blue-100",
    teal: "text-teal-600 bg-teal-100",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-4 border border-slate-200 shadow-2xs hover:shadow-xs transition-all ${
        onClick ? "cursor-pointer hover:border-slate-300" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${iconColorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold text-navy-800 tracking-tight">
          {value}
        </span>
        {trend && (
          <span className="text-[11px] font-medium text-slate-500">
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-500 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}

