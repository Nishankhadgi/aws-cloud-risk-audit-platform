"use client";

import React, { useState } from "react";
import { useAudit } from "@/context/AuditContext";
import DataTable, { Column } from "@/components/shared/DataTable";
import {
  Flame,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Edit2,
  Save,
  X,
  Plus,
  Download,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import SeverityBadge from "@/components/shared/SeverityBadge";
import DomainBadge from "@/components/shared/DomainBadge";
import { exportToCSV, exportToJSON } from "@/utils/exportUtils";
import {
  AuditFinding,
  SeverityLevel,
  AuditDomain,
  RemediationStatus,
  FindingClassification,
  RootCauseCategory,
} from "@/types/audit";

export default function AuditFindingsPage() {
  const { findings, updateFinding, addFinding } = useAudit();
  const [selectedFinding, setSelectedFinding] = useState<AuditFinding | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit fields
  const [editSeverity, setEditSeverity] = useState<SeverityLevel>("HIGH");
  const [editClassification, setEditClassification] = useState<FindingClassification>("Significant Deficiency");
  const [editRootCause, setEditRootCause] = useState<RootCauseCategory>("Process & Execution");
  const [editStatus, setEditStatus] = useState<RemediationStatus>("OPEN");
  const [editActionPlan, setEditActionPlan] = useState("");
  const [editAuditorNotes, setEditAuditorNotes] = useState("");
  const [editCompensatingControls, setEditCompensatingControls] = useState("");

  // New Finding form state
  const [newFinding, setNewFinding] = useState<Partial<AuditFinding>>({
    finding_id: `AWS-NEW-${Math.floor(100 + Math.random() * 900)}`,
    title: "",
    severity: "HIGH",
    classification: "Significant Deficiency",
    root_cause_category: "Process & Execution",
    domain: "IAM and Access Governance",
    condition: "",
    criteria: "",
    cause: "",
    consequence: "",
    recommendation: "",
    compensating_controls: "",
    false_positive_analysis: "Evaluated against AWS configuration architecture; false positive ruled out.",
    evidence_refs: ["EVD-IAM-001"],
    framework_mapping: {
      nist_csf: "PR.AA-01",
      iso_27001: "A.8.2",
      cis_aws: "1.1",
      soc_2: "CC6.1",
    },
    management_response: {
      action_plan: "",
      responsible_owner: "Evelyn Vance (CISO)",
      target_completion_date: "2026-12-31",
    },
    remediation_status: "OPEN",
    auditor_notes: "Initial finding draft under supervisory review.",
    is_simulated: true,
  });

  const handleOpenFinding = (f: AuditFinding) => {
    setSelectedFinding(f);
    setEditSeverity(f.severity);
    setEditClassification(f.classification || "Significant Deficiency");
    setEditRootCause(f.root_cause_category || "Process & Execution");
    setEditStatus(f.remediation_status);
    setEditActionPlan(f.management_response.action_plan);
    setEditAuditorNotes(f.auditor_notes);
    setEditCompensatingControls(f.compensating_controls || "");
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!selectedFinding) return;
    const updates: Partial<AuditFinding> = {
      severity: editSeverity,
      classification: editClassification,
      root_cause_category: editRootCause,
      remediation_status: editStatus,
      auditor_notes: editAuditorNotes,
      compensating_controls: editCompensatingControls,
      management_response: {
        ...selectedFinding.management_response,
        action_plan: editActionPlan,
      },
    };
    updateFinding(selectedFinding.finding_id, updates);
    setSelectedFinding({ ...selectedFinding, ...updates });
    setIsEditing(false);
  };

  const handleCreateFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFinding.title || !newFinding.condition) return;

    addFinding({
      finding_id: newFinding.finding_id!,
      title: newFinding.title!,
      severity: newFinding.severity || "HIGH",
      classification: newFinding.classification || "Significant Deficiency",
      root_cause_category: newFinding.root_cause_category || "Process & Execution",
      domain: newFinding.domain || "IAM and Access Governance",
      condition: newFinding.condition || "",
      criteria: newFinding.criteria || "CIS AWS Foundations Benchmark v3.0",
      cause: newFinding.cause || "Lack of automated guardrail.",
      consequence: newFinding.consequence || "Potential security incident.",
      recommendation: newFinding.recommendation || "Implement corrective configuration.",
      compensating_controls: newFinding.compensating_controls || "Compensating controls under review.",
      false_positive_analysis: newFinding.false_positive_analysis || "Evaluated against AWS configuration architecture.",
      evidence_refs: newFinding.evidence_refs || ["EVD-IAM-001"],
      framework_mapping: newFinding.framework_mapping || {
        nist_csf: "PR.AA-01",
        iso_27001: "A.8.2",
        cis_aws: "1.1",
        soc_2: "CC6.1",
      },
      management_response: newFinding.management_response || {
        action_plan: "Management to evaluate corrective action.",
        responsible_owner: "Evelyn Vance (CISO)",
        target_completion_date: "2026-12-31",
      },
      remediation_status: newFinding.remediation_status || "OPEN",
      auditor_notes: newFinding.auditor_notes || "Draft finding submitted for Manager review.",
      is_simulated: true,
    });

    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const exportData = findings.map((f) => ({
      finding_id: f.finding_id,
      title: f.title,
      severity: f.severity,
      classification: f.classification,
      root_cause_category: f.root_cause_category,
      domain: f.domain,
      condition: f.condition,
      criteria: f.criteria,
      cause: f.cause,
      consequence: f.consequence,
      recommendation: f.recommendation,
      compensating_controls: f.compensating_controls,
      remediation_status: f.remediation_status,
      owner: f.management_response.responsible_owner,
      target_date: f.management_response.target_completion_date,
    }));
    exportToCSV(exportData, "Northstar_Audit_Findings_Register");
  };

  const getClassificationBadge = (classification: FindingClassification) => {
    switch (classification) {
      case "Material Weakness":
        return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
      case "Significant Deficiency":
        return "bg-amber-100 text-amber-900 border-amber-300 font-semibold";
      case "Operational Control Deficiency":
        return "bg-blue-100 text-blue-800 border-blue-300 font-medium";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300 font-normal";
    }
  };

  const columns: Column<AuditFinding>[] = [
    {
      key: "finding_id",
      header: "Finding ID",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {row.finding_id}
        </span>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      render: (row) => <SeverityBadge severity={row.severity} size="sm" />,
    },
    {
      key: "classification",
      header: "Audit Classification",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${getClassificationBadge(
            row.classification || "Significant Deficiency"
          )}`}
        >
          {row.classification || "Significant Deficiency"}
        </span>
      ),
    },
    {
      key: "title",
      header: "Finding Title & Condition Summary",
      render: (row) => (
        <div className="max-w-md">
          <p className="font-semibold text-slate-900 leading-snug">{row.title}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{row.condition}</p>
        </div>
      ),
    },
    {
      key: "domain",
      header: "Audit Domain",
      render: (row) => <DomainBadge domain={row.domain} />,
    },
    {
      key: "root_cause_category",
      header: "Root Cause",
      render: (row) => (
        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.root_cause_category || "Process & Execution"}
        </span>
      ),
    },
    {
      key: "remediation_status",
      header: "Remediation Status",
      render: (row) => {
        const isClosed = row.remediation_status === "CLOSED";
        const isInProgress = row.remediation_status === "IN_PROGRESS";
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
              isClosed
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : isInProgress
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {isClosed ? (
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            ) : (
              <Clock className="w-3 h-3 mr-1 text-slate-500" />
            )}
            {row.remediation_status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      key: "owner",
      header: "Remediation Owner",
      render: (row) => (
        <div>
          <span className="text-[11px] text-slate-700 block font-medium">
            {row.management_response.responsible_owner.split(" ")[0]}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {row.management_response.target_completion_date}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (row) => (
        <button
          onClick={() => handleOpenFinding(row)}
          className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
        >
          <Eye className="w-3 h-3" />
          <span>Inspect</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              Audit Findings & Management Action Plans
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
              {findings.length} Documented Exceptions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured under the Big Four / IIA 5C Audit Architecture (Condition, Criteria, Cause, Consequence, Recommendation) with formal audit impact classification.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Findings (CSV)</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Draft Finding</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Material Weaknesses</span>
          <p className="text-xl font-bold text-rose-700 mt-0.5">
            {findings.filter((f) => f.classification === "Material Weakness").length}
          </p>
          <span className="text-[10px] text-slate-400">Pervasive control failures</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Significant Deficiencies</span>
          <p className="text-xl font-bold text-amber-600 mt-0.5">
            {findings.filter((f) => f.classification === "Significant Deficiency").length}
          </p>
          <span className="text-[10px] text-slate-400">Merits attention by governance</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Operational Deficiencies</span>
          <p className="text-xl font-bold text-blue-600 mt-0.5">
            {findings.filter((f) => f.classification === "Operational Control Deficiency").length}
          </p>
          <span className="text-[10px] text-slate-400">Isolated operational lapses</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Under Active Remediation</span>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">
            {findings.filter((f) => f.remediation_status === "IN_PROGRESS" || f.remediation_status === "PENDING_VALIDATION").length}
          </p>
          <span className="text-[10px] text-slate-400">Tracked with agreed deadlines</span>
        </div>
      </div>

      {/* Findings Table */}
      <DataTable
        data={findings}
        columns={columns}
        searchPlaceholder="Filter findings by ID, title, severity, classification, or domain..."
        pageSize={10}
      />

      {/* Detailed Finding Modal (5C Architecture) */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-xs">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-sm font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-200/80">
                  {selectedFinding.finding_id}
                </span>
                <SeverityBadge severity={isEditing ? editSeverity : selectedFinding.severity} />
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${getClassificationBadge(
                    isEditing ? editClassification : selectedFinding.classification || "Significant Deficiency"
                  )}`}
                >
                  {isEditing ? editClassification : selectedFinding.classification || "Significant Deficiency"}
                </span>
                <DomainBadge domain={selectedFinding.domain} />
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body: 5C Architecture */}
            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{selectedFinding.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    SIMULATED AUDIT FINDING — FICTIONAL DEMONSTRATION SCENARIO
                  </span>
                  <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Root Cause: {selectedFinding.root_cause_category || "Process & Execution"}
                  </span>
                </div>
              </div>

              {/* 5C Sections */}
              <div className="space-y-3">
                {/* 1. Condition */}
                <div className="p-3 rounded border border-slate-200 bg-white">
                  <span className="font-semibold text-slate-900 block mb-1">
                    1. Condition (What was found):
                  </span>
                  <p className="text-slate-700 leading-relaxed">{selectedFinding.condition}</p>
                </div>

                {/* 2. Criteria */}
                <div className="p-3 rounded border border-slate-200 bg-white">
                  <span className="font-semibold text-slate-900 block mb-1">
                    2. Criteria (What should be / Standard benchmark):
                  </span>
                  <p className="text-slate-700 leading-relaxed">{selectedFinding.criteria}</p>
                </div>

                {/* 3. Cause */}
                <div className="p-3 rounded border border-slate-200 bg-white">
                  <span className="font-semibold text-slate-900 block mb-1">
                    3. Cause (Why it happened / Root cause):
                  </span>
                  <p className="text-slate-700 leading-relaxed">{selectedFinding.cause}</p>
                </div>

                {/* 4. Consequence */}
                <div className="p-3 rounded border border-slate-200 bg-white">
                  <span className="font-semibold text-slate-900 block mb-1">
                    4. Consequence / Effect (Business impact / Risk exposure):
                  </span>
                  <p className="text-slate-700 leading-relaxed">{selectedFinding.consequence}</p>
                </div>

                {/* 5. Recommendation */}
                <div className="p-3 rounded border border-blue-200 bg-blue-50/50">
                  <span className="font-bold text-blue-900 block mb-1">
                    5. Auditor Recommendation (Remediating guidance):
                  </span>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                    {selectedFinding.recommendation}
                  </p>
                </div>

                {/* Compensating Controls Evaluated */}
                {selectedFinding.compensating_controls && (
                  <div className="p-3 rounded border border-emerald-200 bg-emerald-50/40">
                    <span className="font-bold text-emerald-900 block mb-1 flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Compensating Controls Evaluated:</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedFinding.compensating_controls}
                    </p>
                  </div>
                )}

                {/* False Positive Analysis */}
                {selectedFinding.false_positive_analysis && (
                  <div className="p-3 rounded border border-purple-200 bg-purple-50/30">
                    <span className="font-bold text-purple-900 block mb-1">
                      Technical Calibration & False-Positive Analysis:
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedFinding.false_positive_analysis}
                    </p>
                  </div>
                )}
              </div>

              {/* Management Response & Retest Card */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Management Response & Retest Status</span>
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 text-xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Status</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Severity:</label>
                        <select
                          value={editSeverity}
                          onChange={(e) => setEditSeverity(e.target.value as SeverityLevel)}
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        >
                          <option value="CRITICAL">CRITICAL</option>
                          <option value="HIGH">HIGH</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="LOW">LOW</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Classification:</label>
                        <select
                          value={editClassification}
                          onChange={(e) => setEditClassification(e.target.value as FindingClassification)}
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        >
                          <option value="Material Weakness">Material Weakness</option>
                          <option value="Significant Deficiency">Significant Deficiency</option>
                          <option value="Operational Control Deficiency">Operational Control Deficiency</option>
                          <option value="Process Improvement Observation">Process Improvement Observation</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Remediation Status:</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as RemediationStatus)}
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="PENDING_VALIDATION">PENDING_VALIDATION</option>
                          <option value="CLOSED">CLOSED</option>
                          <option value="RISK_ACCEPTED">RISK_ACCEPTED</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Compensating Controls:
                      </label>
                      <input
                        type="text"
                        value={editCompensatingControls}
                        onChange={(e) => setEditCompensatingControls(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Management Action Plan:
                      </label>
                      <textarea
                        rows={2}
                        value={editActionPlan}
                        onChange={(e) => setEditActionPlan(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Auditor Retesting Notes:
                      </label>
                      <textarea
                        rows={2}
                        value={editAuditorNotes}
                        onChange={(e) => setEditAuditorNotes(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium flex items-center space-x-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Updates</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-slate-800">
                    <div>
                      <span className="text-slate-500 font-semibold block">Management Action Plan:</span>
                      <p className="mt-0.5">{selectedFinding.management_response.action_plan}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Owner: {selectedFinding.management_response.responsible_owner} | Target:{" "}
                        {selectedFinding.management_response.target_completion_date}
                      </p>
                    </div>

                    {selectedFinding.retest_result && (
                      <div className="pt-2 border-t border-slate-200 text-[11px]">
                        <span className="font-semibold text-slate-700 block">
                          Retest Verification: {selectedFinding.retest_result.retest_conclusion}
                        </span>
                        <p className="text-slate-500">
                          {selectedFinding.retest_result.retest_notes} (
                          {selectedFinding.retest_result.retest_date})
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedFinding(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded font-medium hover:bg-slate-900"
              >
                Close Finding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft Finding Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 p-5 text-xs overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Draft New Audit Finding (5C Model)</span>
              </h2>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateFinding} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Finding ID</label>
                  <input
                    type="text"
                    required
                    value={newFinding.finding_id}
                    onChange={(e) => setNewFinding({ ...newFinding, finding_id: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Severity</label>
                  <select
                    value={newFinding.severity}
                    onChange={(e) => setNewFinding({ ...newFinding, severity: e.target.value as SeverityLevel })}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Audit Classification</label>
                  <select
                    value={newFinding.classification}
                    onChange={(e) => setNewFinding({ ...newFinding, classification: e.target.value as FindingClassification })}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="Material Weakness">Material Weakness</option>
                    <option value="Significant Deficiency">Significant Deficiency</option>
                    <option value="Operational Control Deficiency">Operational Control Deficiency</option>
                    <option value="Process Improvement Observation">Process Improvement Observation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Root Cause Category</label>
                  <select
                    value={newFinding.root_cause_category}
                    onChange={(e) => setNewFinding({ ...newFinding, root_cause_category: e.target.value as RootCauseCategory })}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="Governance & Policy">Governance & Policy</option>
                    <option value="Process & Execution">Process & Execution</option>
                    <option value="People & Competency">People & Competency</option>
                    <option value="Technology & Architecture">Technology & Architecture</option>
                    <option value="Monitoring & Oversight">Monitoring & Oversight</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Audit Domain</label>
                <select
                  value={newFinding.domain}
                  onChange={(e) => setNewFinding({ ...newFinding, domain: e.target.value as AuditDomain })}
                  className="w-full p-2 border border-slate-300 rounded"
                >
                  <option value="IAM and Access Governance">IAM and Access Governance</option>
                  <option value="Data Protection">Data Protection</option>
                  <option value="Encryption and Key Management">Encryption and Key Management</option>
                  <option value="Security Logging and Monitoring">Security Logging and Monitoring</option>
                  <option value="Vulnerability and Configuration Management">Vulnerability and Configuration Management</option>
                  <option value="Business Continuity and Availability">Business Continuity and Availability</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Finding Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inadequate Encryption Key Rotation Policy"
                  value={newFinding.title}
                  onChange={(e) => setNewFinding({ ...newFinding, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">1. Condition (What was found)</label>
                <textarea
                  rows={2}
                  required
                  value={newFinding.condition}
                  onChange={(e) => setNewFinding({ ...newFinding, condition: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">2. Criteria (Policy / Benchmark requirement)</label>
                <textarea
                  rows={2}
                  value={newFinding.criteria}
                  onChange={(e) => setNewFinding({ ...newFinding, criteria: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">3. Cause (Why it happened)</label>
                <input
                  type="text"
                  value={newFinding.cause}
                  onChange={(e) => setNewFinding({ ...newFinding, cause: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">4. Consequence (Business risk)</label>
                <input
                  type="text"
                  value={newFinding.consequence}
                  onChange={(e) => setNewFinding({ ...newFinding, consequence: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">5. Recommendation</label>
                <textarea
                  rows={2}
                  required
                  value={newFinding.recommendation}
                  onChange={(e) => setNewFinding({ ...newFinding, recommendation: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Compensating Controls Evaluated</label>
                <input
                  type="text"
                  placeholder="e.g. Account-level S3 PAB, VPN restrictions, or IAM permission boundaries"
                  value={newFinding.compensating_controls}
                  onChange={(e) => setNewFinding({ ...newFinding, compensating_controls: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium"
                >
                  Save Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
