import React from "react";
import { AuditDomain } from "@/types/audit";

export default function DomainBadge({ domain }: { domain: AuditDomain }) {
  const getDomainStyle = (dom: string) => {
    switch (dom) {
      case "IAM and Access Governance":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Encryption and Key Management":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Data Protection":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Security Logging and Monitoring":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "Vulnerability and Configuration Management":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Change and Release Management":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Business Continuity and Availability":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "Third-Party and Cloud Governance":
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getDomainStyle(
        domain
      )}`}
    >
      {domain}
    </span>
  );
}

