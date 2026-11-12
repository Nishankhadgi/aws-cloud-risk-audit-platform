import React from "react";
import { ControlStatus } from "@/types/audit";
import { getControlStatusColor } from "@/utils/riskCalculators";
import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from "lucide-react";

export default function StatusBadge({ status }: { status: ControlStatus }) {
  const color = getControlStatusColor(status);

  const getIcon = () => {
    switch (status) {
      case "PASS":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />;
      case "FAIL":
        return <XCircle className="w-3.5 h-3.5 text-rose-600 mr-1" />;
      case "PARTIAL":
        return <AlertCircle className="w-3.5 h-3.5 text-amber-600 mr-1" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-500 mr-1" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${color.bg} ${color.text} ${color.border}`}
    >
      {getIcon()}
      {status.replace("_", " ")}
    </span>
  );
}

