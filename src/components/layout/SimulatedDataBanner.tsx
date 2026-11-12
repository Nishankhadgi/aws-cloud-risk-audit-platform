"use client";

import React from "react";
import { AlertCircle, Database, CheckCircle2 } from "lucide-react";
import { useAudit } from "@/context/AuditContext";

export default function SimulatedDataBanner() {
  const { isSampleMode, dataSourceInfo } = useAudit();

  return (
    <div
      className={`w-full px-4 py-1.5 text-xs font-medium flex items-center justify-between border-b ${
        isSampleMode
          ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
          : "bg-teal-500/10 border-teal-500/30 text-teal-900 dark:text-teal-200"
      }`}
    >
      <div className="flex items-center space-x-2">
        {isSampleMode ? (
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
        )}
        <span>
          {isSampleMode ? (
            <span className="font-bold tracking-wide">
              SIMULATED AUDIT DATA — NOT AN ACTUAL AWS AUDIT
            </span>
          ) : (
            <span className="font-bold tracking-wide">
              LIVE IMPORTED AUDIT DATA — READ-ONLY AWS TELEMETRY
            </span>
          )}
          <span className="hidden sm:inline text-slate-600 dark:text-slate-400 font-normal ml-2">
            | Assessment Target: {dataSourceInfo.account}
          </span>
        </span>
      </div>

      <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center space-x-1">
          <Database className="w-3.5 h-3.5" />
          <span>Source: {dataSourceInfo.source}</span>
        </span>
        <span className="hidden md:inline">
          Captured: {new Date(dataSourceInfo.timestamp).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

