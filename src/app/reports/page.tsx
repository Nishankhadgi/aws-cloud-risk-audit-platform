"use client";

import React from "react";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Shield,
  FileCheck2,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Info,
  Database,
  UserCheck,
} from "lucide-react";
import { useAudit } from "@/context/AuditContext";
import SeverityBadge from "@/components/shared/SeverityBadge";
import StatusBadge from "@/components/shared/StatusBadge";
import { exportToJSON, exportToCSV } from "@/utils/exportUtils";

export default function AuditReportsPage() {
  const { charter, controls, findings, remediations, risks, stats, isSampleMode, dataSourceInfo } = useAudit();

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportPackage = {
      report_title: "Executive Audit Report: AWS Cloud Infrastructure Security & Technology Risk",
      organization: charter.organization_name,
      audit_period: charter.audit_period,
      generated_at: new Date().toISOString(),
      is_sample_mode: isSampleMode,
      disclaimer: isSampleMode
        ? "SIMULATED AUDIT REPORT — FICTIONAL DEMONSTRATION"
        : "LIVE READ-ONLY AWS AUDIT REPORT",
      audit_opinion: "QUALIFIED / NEEDS IMPROVEMENT",
      stats,
      charter,
      controls_summary: controls.map((c) => ({
        id: c.control_id,
        title: c.title,
        nature: c.control_nature,
        frequency: c.control_frequency,
        tod_conclusion: c.tod_conclusion,
        toe_conclusion: c.toe_conclusion,
        overall_status: c.status,
        domain: c.domain,
        conclusion: c.auditor_conclusion,
      })),
      findings: findings.map((f) => ({
        id: f.finding_id,
        title: f.title,
        severity: f.severity,
        classification: f.classification,
        root_cause: f.root_cause_category,
        condition: f.condition,
        criteria: f.criteria,
        cause: f.cause,
        consequence: f.consequence,
        recommendation: f.recommendation,
        compensating_controls: f.compensating_controls,
        status: f.remediation_status,
      })),
      risks: risks.map((r) => ({
        id: r.risk_id,
        title: r.title,
        inherent_score: r.inherent_score,
        residual_score: r.residual_score,
      })),
    };

    exportToJSON(reportPackage, `Northstar_Executive_Audit_Report_${new Date().toISOString().slice(0, 10)}`);
  };

  const significantDeficiencies = findings.filter((f) => f.classification === "Significant Deficiency").length;
  const materialWeaknesses = findings.filter((f) => f.classification === "Material Weakness").length;
  const operationalDeficiencies = findings.filter((f) => f.classification === "Operational Control Deficiency").length;

  return (
    <div className="space-y-6">
      {/* Action Header - Hidden during print */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              Executive Audit Report & Workpaper Dossier
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              16 Sections
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive audit report prepared for the Audit Committee, CISO, and Executive Leadership under IIA, ISACA, and Big Four IT Audit Standards.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-md p-8 md:p-12 text-slate-800 max-w-4xl mx-auto space-y-10">
        {/* 1. Cover Page / Title Header */}
        <section className="border-b-2 border-slate-900 pb-8 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold block">
                Internal Technology Audit Report
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">
                AWS Cloud Infrastructure Security & Technology Risk Audit
              </h1>
              <p className="text-sm font-semibold text-blue-700">
                Evaluation of the Northstar Claims Processing Platform on Amazon Web Services
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p className="font-bold text-slate-900">CONFIDENTIAL</p>
              <p>For Internal Audit Committee Use Only</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block font-semibold">Entity Under Review:</span>
              <span className="text-slate-900 font-medium">{charter.organization_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Audit Period:</span>
              <span className="text-slate-900 font-medium">{charter.audit_period}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Target AWS Account:</span>
              <span className="font-mono text-slate-900">{dataSourceInfo.account}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Report Date:</span>
              <span className="text-slate-900 font-medium">November 12, 2026</span>
            </div>
          </div>

          {/* Simulation Disclaimer */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Data Classification Notice:</strong> {dataSourceInfo.source}.{" "}
              {isSampleMode
                ? "This report contains SIMULATED AUDIT DATA constructed for portfolio and demonstration purposes. It does not represent an actual assessment of a live third-party production system."
                : "This report incorporates read-only telemetry collected from an active AWS environment."}
            </p>
          </div>
        </section>

        {/* 2. Executive Summary & Audit Opinion */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wide border-b border-slate-200 pb-1">
            2. Executive Summary & Official Audit Opinion
          </h2>
          <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                Formal Audit Opinion:
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-200 text-amber-900 border border-amber-400">
                QUALIFIED / NEEDS IMPROVEMENT
              </span>
            </div>
            <p className="text-amber-950 leading-relaxed">
              In our professional opinion as independent IT internal auditors, the AWS cloud infrastructure controls of Northstar Claims Technologies were designed and operating effectively in all material respects, <strong>with the exception of 5 Significant Deficiencies and 2 Operational Control Deficiencies</strong> identified in privileged deployment identities, console MFA enforcement, S3 data-plane audit logging, perimeter network security groups, and annual disaster recovery restore testing.
            </p>
          </div>

          <p className="text-xs leading-relaxed text-slate-700">
            Northstar exhibits mature foundational cloud automation, featuring 100% Terraform Infrastructure as Code (IaC) governance, automated Checkov pre-deployment security scanning, continuous Amazon GuardDuty threat detection with S3 Protection, and automated daily backup snapshots across all primary production data stores.
          </p>

          {/* Classification Breakdown Table */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs pt-1">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded">
              <span className="text-rose-800 font-bold block text-lg">{materialWeaknesses}</span>
              <span className="text-rose-900 font-semibold block text-[11px]">Material Weaknesses</span>
              <span className="text-slate-500 text-[10px]">Pervasive control failures</span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
              <span className="text-amber-800 font-bold block text-lg">{significantDeficiencies}</span>
              <span className="text-amber-900 font-semibold block text-[11px]">Significant Deficiencies</span>
              <span className="text-slate-500 text-[10px]">Merits governance attention</span>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <span className="text-blue-800 font-bold block text-lg">{operationalDeficiencies}</span>
              <span className="text-blue-900 font-semibold block text-[11px]">Operational Deficiencies</span>
              <span className="text-slate-500 text-[10px]">Isolated operational lapses</span>
            </div>
          </div>
        </section>

        {/* 3. Information Produced by the Entity (IPE) Statement */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wide border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>3. Information Produced by the Entity (IPE) Reliability Statement</span>
            <span className="text-[10px] text-slate-500 font-normal">PCAOB AS 1105 / AICPA AU-C 500</span>
          </h2>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2">
            <p className="leading-relaxed">
              In accordance with professional internal audit standards, automated scanner outputs and entity-provided reports were not accepted as audit evidence without independent verification. The audit team performed formal completeness and accuracy testing on all underlying populations:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>
                <strong>IAM Identity Population:</strong> 100% of IAM users (14) reconciled against Workday HRIS active payroll rosters; 0 orphaned accounts found.
              </li>
              <li>
                <strong>S3 & CloudTrail Populations:</strong> Cross-referenced AWS API list outputs against Terraform state files (terraform.tfstate) to confirm 100% inventory capture.
              </li>
              <li>
                <strong>Cryptographic Integrity:</strong> SHA-256 hashes generated immediately upon API ingestion to guarantee non-repudiation of collected workpaper evidence.
              </li>
            </ul>
          </div>
        </section>

        {/* 4 & 5. Audit Scope & Systems Reviewed */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wide border-b border-slate-200 pb-1">
            4 & 5. Audit Scope & Systems Reviewed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-slate-900 block">In-Scope Workloads:</span>
              <p className="text-slate-600 leading-relaxed">
                Primary Claims Workload Account (112233445566) and Centralized Logging Vault Account (998877665544) across primary region us-east-1 and secondary disaster recovery region us-west-2. Services tested: IAM, S3, KMS, EC2, RDS PostgreSQL, CloudTrail, AWS Config, GuardDuty, CloudWatch, and AWS Backup.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-slate-900 block">Audit Period & Standards:</span>
              <p className="text-slate-600 leading-relaxed">
                November 1, 2025 to November 10, 2026. Aligned with the International Professional Practices Framework (IPPF), ISACA Information Technology Assurance Framework (ITAF), CIS AWS Foundations Benchmark v3.0, and NIST CSF 2.0.
              </p>
            </div>
          </div>
        </section>

        {/* 6 & 7. Test of Design (TOD) vs Test of Operating Effectiveness (TOE) */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wide border-b border-slate-200 pb-1">
            6 & 7. Control Evaluation: Test of Design (TOD) vs Test of Operating Effectiveness (TOE)
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            Professional internal audit methodology separates the evaluation of whether a control is designed effectively from whether it operated continuously without exceptions during the period under review:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block font-medium">Total Controls</span>
              <span className="text-xl font-bold text-slate-900">{controls.length}</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
              <span className="text-emerald-700 block font-medium">TOD Effective</span>
              <span className="text-xl font-bold text-emerald-800">
                {controls.filter((c) => c.tod_conclusion === "PASS").length}
              </span>
              <span className="text-[10px] text-slate-400">Controls properly designed</span>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded">
              <span className="text-rose-700 block font-medium">TOD Deficient</span>
              <span className="text-xl font-bold text-rose-800">
                {controls.filter((c) => c.tod_conclusion === "FAIL").length}
              </span>
              <span className="text-[10px] text-slate-400">Flawed policy / design</span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
              <span className="text-amber-700 block font-medium">TOE Exceptions</span>
              <span className="text-xl font-bold text-amber-800">
                {controls.filter((c) => c.toe_conclusion === "FAIL" || c.toe_conclusion === "PARTIAL").length}
              </span>
              <span className="text-[10px] text-slate-400">Operating lapses identified</span>
            </div>
          </div>
        </section>

        {/* 8 & 9. Compensating Controls & False-Positive Analysis */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wide border-b border-slate-200 pb-1">
            8 & 9. Compensating Controls & Technical Calibration
          </h2>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2">
            <p className="leading-relaxed">
              Standard commercial vulnerability scanners frequently produce binary findings that distort enterprise risk. Internal Audit calibrated severity based on technical compensating controls:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>
                <strong>S3 Public Access Block:</strong> Scanner tools flagged bucket-level omission on archive storage as &quot;Critical Public Data Leak&quot;. Audit verified that account-level Public Access Block is active across account 112233445566, preventing public traffic. Finding calibrated to Significant Deficiency in defense-in-depth.
              </li>
              <li>
                <strong>KMS Key Rotation:</strong> Audit filtered out asymmetric signing keys and external keys that do not support automated rotation by AWS KMS architectural design, eliminating 2 false positives.
              </li>
              <li>
                <strong>CI/CD OIDC Roles:</strong> Audit confirmed OIDC token trust is cryptographically restricted to repository branch claims, narrowing exposure from unauthorized assumption to post-assumption pipeline compromise.
              </li>
            </ul>
          </div>
        </section>

        {/* 10. Detailed Audit Findings & Management Responses */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wide border-b border-slate-200 pb-1">
            10. Detailed Audit Findings (5C Model)
          </h2>

          <div className="space-y-4">
            {findings.map((f) => (
              <div key={f.finding_id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900">{f.finding_id}</span>
                    <SeverityBadge severity={f.severity} size="sm" />
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-800">
                      {f.classification}
                    </span>
                    <span className="font-semibold text-slate-800">{f.title}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[10px]">
                    Status: {f.remediation_status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="font-semibold text-slate-700 block">Condition (What was found):</span>
                    <p className="text-slate-600">{f.condition}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Recommendation (Auditor guidance):</span>
                    <p className="text-slate-600">{f.recommendation}</p>
                  </div>
                </div>

                {f.compensating_controls && (
                  <div className="p-2 bg-emerald-50/50 border border-emerald-200 rounded text-[11px] text-emerald-900">
                    <strong>Compensating Controls Evaluated:</strong> {f.compensating_controls}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Management Response:</span>{" "}
                  {f.management_response.action_plan} (Owner: {f.management_response.responsible_owner}, Target:{" "}
                  {f.management_response.target_completion_date})
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 11 & 12. Risk Register & Residual Risk Analysis */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wide border-b border-slate-200 pb-1">
            11 & 12. Risk Register & Residual Risk Calibration
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            Technology risks were modeled across 10 discrete scenarios. Residual risk scores reflect mitigating effect of detective monitoring controls. Following successful execution of management&apos;s agreed action plans by December 2026, residual technology risk across all in-scope AWS workloads will decrease to acceptable tolerance thresholds.
          </p>
        </section>

        {/* 13 & 14. Remediation Governance & Retesting Workflow */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wide border-b border-slate-200 pb-1">
            13 & 14. Remediation Governance & Independent Retesting
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            Internal Audit enforces a formal retesting cycle before any finding is designated as CLOSED. Management submission of tickets or verbal confirmation is insufficient; retesting requires independent verification via AWS CLI/API queries, updated Terraform pull request inspections, and log reviews.
          </p>
        </section>

        {/* 15 & 16. Audit Limitations & Supervisory Sign-Off */}
        <section className="space-y-4 border-t border-slate-200 pt-4">
          <h2 className="text-base font-bold text-navy-900 uppercase tracking-wide border-b border-slate-200 pb-1">
            15 & 16. Scope Limitations & Supervisory Sign-Off
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong>Limitations:</strong> Audit testing was executed exclusively via non-disruptive, read-only AWS APIs. Testing reflects point-in-time configuration state as of November 10–12, 2026. AWS physical data center controls, physical server maintenance, and underlying hypervisor protections are covered by AWS SOC 2 Type II reports and are out of scope for customer workload testing under the Shared Responsibility Model.
          </p>

          {/* Two-Tier Supervisory Review Sign-Off Block */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Workpaper Preparer Sign-Off:
              </span>
              <p className="font-bold text-slate-900 text-sm">Jordan Taylor, CISA</p>
              <p className="text-slate-600">Senior IT Auditor & AWS Security Specialist</p>
              <p className="text-slate-400 font-mono text-[10px] pt-1">
                Fieldwork Completed: November 11, 2026
              </p>
              <div className="pt-1 text-emerald-700 font-semibold flex items-center space-x-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Workpapers Prepared & Validated</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Supervisory Manager Review & Certification:
              </span>
              <p className="font-bold text-slate-900 text-sm">Marcus Sterling, CPA, CISA, CISSP</p>
              <p className="text-slate-600">Senior IT Audit Manager, Technology Risk</p>
              <p className="text-slate-400 font-mono text-[10px] pt-1">
                Report Certified: November 12, 2026
              </p>
              <div className="pt-1 text-emerald-700 font-semibold flex items-center space-x-1 text-[11px]">
                <Shield className="w-3.5 h-3.5" />
                <span>Supervisory Review Completed & Concurred</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
