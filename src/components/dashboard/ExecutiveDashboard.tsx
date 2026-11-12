"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Flame,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useAudit } from "@/context/AuditContext";
import StatCard from "@/components/shared/StatCard";
import SeverityBadge from "@/components/shared/SeverityBadge";
import StatusBadge from "@/components/shared/StatusBadge";
import DomainBadge from "@/components/shared/DomainBadge";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function ExecutiveDashboard() {
  const { controls, findings, remediations, risks, stats } = useAudit();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Data for Chart A: Control Effectiveness
  const effectivenessData = [
    { name: "Pass", value: stats.passedControls, color: "#10b981" },
    { name: "Fail", value: stats.failedControls, color: "#ef4444" },
    { name: "Partial", value: stats.partialControls, color: "#f59e0b" },
    { name: "Not Tested", value: stats.untestedControls, color: "#94a3b8" },
  ];

  // Data for Chart B: Findings by Severity
  const severityData = [
    { name: "Critical", count: stats.criticalFindings, color: "#b91c1c" },
    { name: "High", count: stats.highFindings, color: "#ea580c" },
    { name: "Medium", count: stats.mediumFindings, color: "#0284c7" },
    { name: "Low", count: stats.lowFindings, color: "#64748b" },
  ];

  // Data for Chart C: Findings by Audit Domain
  const domainCounts = findings.reduce((acc, f) => {
    const key = f.domain.split(" ")[0]; // Shorten for label
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const domainData = Object.entries(domainCounts).map(([domain, count]) => ({
    domain,
    count,
  }));

  // Data for Chart D: Remediation Status
  const remediationData = [
    {
      status: "Open",
      count: remediations.filter((r) => r.status === "OPEN" || r.status === "ASSIGNED").length,
      fill: "#ef4444",
    },
    {
      status: "In Progress",
      count: remediations.filter((r) => r.status === "IN_PROGRESS").length,
      fill: "#f59e0b",
    },
    {
      status: "Pending Validation",
      count: remediations.filter((r) => r.status === "PENDING_VALIDATION").length,
      fill: "#0284c7",
    },
    {
      status: "Closed",
      count: remediations.filter((r) => r.status === "CLOSED").length,
      fill: "#10b981",
    },
  ];

  // Top 4 Highest-Risk Findings
  const topFindings = [...findings]
    .sort((a, b) => {
      const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFORMATIONAL: 0 };
      return order[b.severity] - order[a.severity];
    })
    .slice(0, 4);

  // Upcoming remediation deadlines
  const upcomingRemediations = [...remediations]
    .filter((r) => r.status !== "CLOSED" && r.status !== "RISK_ACCEPTED")
    .sort((a, b) => new Date(a.planned_completion_date).getTime() - new Date(b.planned_completion_date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Page Title & Scope Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight">
            Executive Technology Risk & Audit Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Engagement: Northstar Claims Technologies — AWS Infrastructure Security Evaluation (FY26 H2)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/reports"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <span>View Executive Audit Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Row 1: KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Controls"
          value={stats.totalControls}
          subtitle="Across 8 audit domains"
          icon={ShieldCheck}
          color="default"
        />
        <StatCard
          title="Controls Passed"
          value={stats.passedControls}
          subtitle={`${Math.round((stats.passedControls / maxOne(stats.totalControls)) * 100)}% compliance rate`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Controls Failed"
          value={stats.failedControls}
          subtitle="Material control gaps"
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Partially Effective"
          value={stats.partialControls}
          subtitle="Compensatory controls"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="Critical Findings"
          value={stats.criticalFindings}
          subtitle="Requires immediate SLA"
          icon={Flame}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard
          title="Total Findings"
          value={stats.totalFindings}
          subtitle={`${stats.highFindings} High, ${stats.mediumFindings} Medium`}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Open Remediations"
          value={stats.openRemediations}
          subtitle="Assigned to owners"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Overdue Remediations"
          value={stats.overdueRemediations}
          subtitle={stats.overdueRemediations > 0 ? "Past target SLA date" : "All SLAs on schedule"}
          icon={AlertCircle}
          color={stats.overdueRemediations > 0 ? "rose" : "teal"}
        />
        <StatCard
          title="Avg Technology Risk"
          value={`${stats.averageRiskScore} / 25`}
          subtitle="5x5 Likelihood x Impact"
          icon={TrendingUp}
          color="default"
        />
      </div>

      {/* Row 2: Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart A: Control Effectiveness */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Control Effectiveness
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              N={stats.totalControls} Controls
            </span>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={effectivenessData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {effectivenessData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "6px",
                      fontSize: "12px",
                      border: "none",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Loading chart...</div>
            )}
          </div>
        </div>

        {/* Chart B: Findings by Severity */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Findings by Severity
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              N={stats.totalFindings} Findings
            </span>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "6px",
                      fontSize: "12px",
                      border: "none",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Loading chart...</div>
            )}
          </div>
        </div>

        {/* Chart D: Remediation Progress */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Remediation Lifecycle
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              N={remediations.length} Actions
            </span>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={remediationData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
                >
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="status" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "6px",
                      fontSize: "12px",
                      border: "none",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {remediationData.map((entry, index) => (
                      <Cell key={`rem-bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Loading chart...</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: 5x5 Technology Risk Matrix & Highest-Risk Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Interactive 5x5 Risk Matrix */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                5x5 Technology Risk Heatmap
              </h3>
              <p className="text-[11px] text-slate-500">
                Likelihood vs Business Impact distribution of evaluated cloud risks
              </p>
            </div>
            <Link
              href="/risks"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <span>View Register</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {/* 5x5 Grid Table */}
          <div className="border border-slate-200 rounded-md p-2 bg-slate-50/50">
            <div className="grid grid-cols-6 gap-1 text-center text-[10px]">
              {/* Header corner */}
              <div className="p-1 font-semibold text-slate-400">Imp ↓ / Lkhd →</div>
              <div className="p-1 font-semibold text-slate-600">1: Rare</div>
              <div className="p-1 font-semibold text-slate-600">2: Unlikely</div>
              <div className="p-1 font-semibold text-slate-600">3: Possible</div>
              <div className="p-1 font-semibold text-slate-600">4: Likely</div>
              <div className="p-1 font-semibold text-slate-600">5: Almost Certain</div>

              {/* Rows 5 to 1 (Impact descending) */}
              {[5, 4, 3, 2, 1].map((impact) => {
                const impactLabels: Record<number, string> = {
                  5: "5: Catastrophic",
                  4: "4: Major",
                  3: "3: Moderate",
                  2: "2: Minor",
                  1: "1: Insignificant",
                };
                return (
                  <React.Fragment key={`row-${impact}`}>
                    <div className="p-1 font-semibold text-slate-600 flex items-center justify-center text-[9px] bg-slate-100 rounded">
                      {impactLabels[impact]}
                    </div>
                    {[1, 2, 3, 4, 5].map((likelihood) => {
                      const score = likelihood * impact;
                      const matchingRisks = risks.filter(
                        (r) => r.likelihood === likelihood && r.impact === impact
                      );

                      // Cell background
                      let bgClass = "bg-blue-100/60 text-blue-900 border-blue-200";
                      if (score >= 20) bgClass = "bg-red-500/20 text-red-900 border-red-300 font-bold";
                      else if (score >= 12) bgClass = "bg-orange-500/20 text-orange-900 border-orange-300 font-semibold";
                      else if (score >= 6) bgClass = "bg-amber-500/20 text-amber-900 border-amber-300";

                      return (
                        <div
                          key={`cell-${impact}-${likelihood}`}
                          className={`p-2 rounded border flex flex-col items-center justify-center min-h-[38px] ${bgClass}`}
                        >
                          <span className="text-[10px]">{score}</span>
                          {matchingRisks.length > 0 && (
                            <span className="mt-0.5 px-1 py-0.2 rounded-full bg-slate-900 text-white text-[9px] font-bold">
                              {matchingRisks.length} {matchingRisks.length === 1 ? "risk" : "risks"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Highest-Risk Findings List */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Priority Audit Findings
              </h3>
              <p className="text-[11px] text-slate-500">
                Top identified control deficiencies requiring management remediation
              </p>
            </div>
            <Link
              href="/findings"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <span>All Findings</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-2.5 overflow-y-auto flex-1">
            {topFindings.map((finding) => (
              <div
                key={finding.finding_id}
                className="p-3 rounded-md border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {finding.finding_id}
                    </span>
                    <SeverityBadge severity={finding.severity} size="sm" />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Owner: {finding.management_response.responsible_owner.split(" ")[0]}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 leading-snug">
                  {finding.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {finding.condition}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">
                    Target: {finding.management_response.target_completion_date}
                  </span>
                  <span className="font-medium text-blue-600">
                    Status: {finding.remediation_status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Upcoming Deadlines & Scope Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Upcoming Remediation Deadlines */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Upcoming Remediation SLA Deadlines
              </h3>
              <p className="text-[11px] text-slate-500">
                Action items committed by Northstar management
              </p>
            </div>
            <Link
              href="/remediation"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <span>Track All</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                  <th className="pb-2">Action / Finding</th>
                  <th className="pb-2">Owner</th>
                  <th className="pb-2">Priority</th>
                  <th className="pb-2">Planned Target</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingRemediations.map((rem) => {
                  const isOverdue = new Date(rem.planned_completion_date) < new Date("2026-11-12");
                  return (
                    <tr key={rem.action_id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 pr-2">
                        <p className="font-semibold text-slate-800 line-clamp-1">{rem.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{rem.finding_id}</p>
                      </td>
                      <td className="py-2.5 text-slate-600 text-[11px]">{rem.remediation_owner}</td>
                      <td className="py-2.5">
                        <SeverityBadge severity={rem.priority} size="sm" />
                      </td>
                      <td className="py-2.5 text-[11px]">
                        <span className={isOverdue ? "text-red-600 font-bold" : "text-slate-600"}>
                          {rem.planned_completion_date}
                          {isOverdue && " (Overdue)"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          {rem.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Framework Crosswalk Coverage Summary */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Framework Mapping Coverage
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Controls mapped across industry standards
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">NIST CSF 2.0</span>
                  <span className="font-mono text-slate-500">28 / 28 Controls</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-full rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">CIS AWS Foundations v3.0</span>
                  <span className="font-mono text-slate-500">28 / 28 Controls</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full w-full rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">ISO/IEC 27001:2022</span>
                  <span className="font-mono text-slate-500">28 / 28 Controls</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-full rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">AICPA SOC 2 (2022)</span>
                  <span className="font-mono text-slate-500">28 / 28 Controls</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full w-full rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/frameworks"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center justify-between"
            >
              <span>Explore full framework crosswalk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function maxOne(num: number): number {
  return Math.max(1, num);
}

