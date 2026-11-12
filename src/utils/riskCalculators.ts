import { SeverityLevel } from "@/types/audit";

export const LIKELIHOOD_SCALE = [
  { level: 1, label: "Rare", desc: "Remote possibility (<5% probability)" },
  { level: 2, label: "Unlikely", desc: "Low chance (5% - 25% probability)" },
  { level: 3, label: "Possible", desc: "Moderate chance (25% - 60% probability)" },
  { level: 4, label: "Likely", desc: "High chance (60% - 90% probability)" },
  { level: 5, label: "Almost Certain", desc: "Expected in most circumstances (>90%)" },
];

export const IMPACT_SCALE = [
  { level: 1, label: "Insignificant", desc: "Negligible loss or operational impact" },
  { level: 2, label: "Minor", desc: "Localized downtime or minor compliance defect" },
  { level: 3, label: "Moderate", desc: "Claims processing delay; non-material PII exposure" },
  { level: 4, label: "Major", desc: "Extended outage or significant regulatory inquiry" },
  { level: 5, label: "Catastrophic", desc: "Severe data breach, multi-million fine, insolvency" },
];

export function calculateRiskScore(likelihood: number, impact: number): { score: number; severity: SeverityLevel } {
  const l = Math.max(1, Math.min(5, likelihood));
  const i = Math.max(1, Math.min(5, impact));
  const score = l * i;

  let severity: SeverityLevel = "LOW";
  if (score >= 20) severity = "CRITICAL";
  else if (score >= 12) severity = "HIGH";
  else if (score >= 6) severity = "MEDIUM";
  else severity = "LOW";

  return { score, severity };
}

export function getSeverityColor(severity: SeverityLevel): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  switch (severity) {
    case "CRITICAL":
      return {
        bg: "bg-red-50",
        text: "text-red-800",
        border: "border-red-300",
        badge: "bg-red-600 text-white",
      };
    case "HIGH":
      return {
        bg: "bg-orange-50",
        text: "text-orange-800",
        border: "border-orange-300",
        badge: "bg-orange-500 text-white",
      };
    case "MEDIUM":
      return {
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-300",
        badge: "bg-amber-500 text-white",
      };
    case "LOW":
      return {
        bg: "bg-blue-50",
        text: "text-blue-800",
        border: "border-blue-300",
        badge: "bg-blue-600 text-white",
      };
    case "INFORMATIONAL":
    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-800",
        border: "border-slate-200",
        badge: "bg-slate-500 text-white",
      };
  }
}

export function getControlStatusColor(status: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "PASS":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
    case "FAIL":
      return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
    case "PARTIAL":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    case "NOT_TESTED":
      return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300" };
    case "NOT_APPLICABLE":
      return { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200" };
    default:
      return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };
  }
}

