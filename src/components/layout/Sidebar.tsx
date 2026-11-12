"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Server,
  ShieldCheck,
  ClipboardList,
  FileCheck2,
  AlertTriangle,
  Flame,
  Wrench,
  Network,
  FileSpreadsheet,
  BookOpen,
  Cloud,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAudit } from "@/context/AuditContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { stats } = useAudit();

  const navigationItems = [
    { name: "Executive Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Audit Planning", href: "/planning", icon: CalendarCheck },
    { name: "AWS Asset Inventory", href: "/inventory", icon: Server },
    {
      name: "Control Matrix",
      href: "/controls",
      icon: ShieldCheck,
      badge: stats.failedControls > 0 ? `${stats.failedControls} Fail` : undefined,
      badgeColor: "bg-rose-100 text-rose-800",
    },
    { name: "Control Testing", href: "/testing", icon: ClipboardList },
    {
      name: "Evidence Register",
      href: "/evidence",
      icon: FileCheck2,
      badge: `${stats.totalControls}`,
      badgeColor: "bg-slate-100 text-slate-700",
    },
    { name: "Risk Register", href: "/risks", icon: AlertTriangle },
    {
      name: "Audit Findings",
      href: "/findings",
      icon: Flame,
      badge: stats.criticalFindings > 0 ? `${stats.criticalFindings} Crit` : `${stats.totalFindings}`,
      badgeColor: stats.criticalFindings > 0 ? "bg-red-100 text-red-800 font-semibold" : "bg-amber-100 text-amber-800",
    },
    {
      name: "Remediation Tracker",
      href: "/remediation",
      icon: Wrench,
      badge: stats.overdueRemediations > 0 ? `${stats.overdueRemediations} Overdue` : undefined,
      badgeColor: "bg-red-100 text-red-800",
    },
    { name: "Framework Mapping", href: "/frameworks", icon: Network },
    { name: "Reports", href: "/reports", icon: FileSpreadsheet },
    { name: "Project Documentation", href: "/docs", icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col flex-shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
          <Cloud className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-semibold text-sm leading-tight text-white tracking-wide">
            AWS Cloud Risk Audit
          </h1>
          <p className="text-[11px] text-slate-400 font-mono">
            Northstar Claims Tech
          </p>
        </div>
      </div>

      {/* Audit Engagement Status Summary */}
      <div className="mx-3 mt-3 p-2.5 rounded-md bg-slate-800/80 border border-slate-700/60">
        <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1.5">
          <span className="font-medium">Audit Engagement:</span>
          <span className="inline-flex items-center text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
            Fieldwork
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <div className="flex items-center space-x-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>{stats.passedControls} Passed</span>
          </div>
          <div className="flex items-center space-x-1 text-rose-400">
            <XCircle className="w-3 h-3" />
            <span>{stats.failedControls} Failed</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <div className="px-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Audit Workspace
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User / Persona Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold text-xs">
            SR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">
              Senior IT Auditor
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              AWS Technology Risk
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

