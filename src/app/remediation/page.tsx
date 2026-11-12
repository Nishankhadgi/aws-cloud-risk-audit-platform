"use client";

import React, { useState } from "react";
import {
  Wrench,
  Download,
  Eye,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  X,
  Save,
  AlertCircle,
} from "lucide-react";
import { useAudit } from "@/context/AuditContext";
import DataTable, { Column } from "@/components/shared/DataTable";
import SeverityBadge from "@/components/shared/SeverityBadge";
import { exportToCSV } from "@/utils/exportUtils";
import { RemediationAction, RemediationStatus, SeverityLevel } from "@/types/audit";

export default function RemediationTrackerPage() {
  const { remediations, updateRemediation } = useAudit();
  const [selectedAction, setSelectedAction] = useState<RemediationAction | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editStatus, setEditStatus] = useState<RemediationStatus>("OPEN");
  const [editOwner, setEditOwner] = useState("");
  const [editPlannedDate, setEditPlannedDate] = useState("");
  const [editActualDate, setEditActualDate] = useState("");
  const [editEvidence, setEditEvidence] = useState("");
  const [editValidation, setEditValidation] = useState("");
  const [editResidualRisk, setEditResidualRisk] = useState<SeverityLevel>("LOW");
  const [editApprover, setEditApprover] = useState("");
  const [editComments, setEditComments] = useState("");

  // Risk acceptance fields
  const [acceptanceApprover, setAcceptanceApprover] = useState("");
  const [acceptanceRationale, setAcceptanceRationale] = useState("");
  const [acceptanceReviewDate, setAcceptanceReviewDate] = useState("2027-06-30");

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleOpenAction = (action: RemediationAction) => {
    setSelectedAction(action);
    setEditStatus(action.status);
    setEditOwner(action.remediation_owner);
    setEditPlannedDate(action.planned_completion_date);
    setEditActualDate(action.actual_completion_date || "");
    setEditEvidence(action.evidence_submitted || "");
    setEditValidation(action.validation_results || "");
    setEditResidualRisk(action.residual_risk);
    setEditApprover(action.closure_approver || "");
    setEditComments(action.comments);
    setValidationError(null);
    setIsEditing(false);
  };

  const handleSaveAction = () => {
    if (!selectedAction) return;

    // Strict GRC Governance Validation
    if (editStatus === "CLOSED") {
      if (!editEvidence.trim()) {
        setValidationError("Remediation cannot be closed without documented evidence submission.");
        return;
      }
      if (!editValidation.trim()) {
        setValidationError("Remediation cannot be closed without documented auditor validation results.");
        return;
      }
      if (!editApprover.trim()) {
        setValidationError("Closure requires an authorized auditor or audit director sign-off.");
        return;
      }
    }

    if (editStatus === "RISK_ACCEPTED") {
      if (!acceptanceApprover.trim() || !acceptanceRationale.trim()) {
        setValidationError("Risk Acceptance mandates documented formal approver and business rationale.");
        return;
      }
    }

    const updates: Partial<RemediationAction> = {
      status: editStatus,
      remediation_owner: editOwner,
      planned_completion_date: editPlannedDate,
      actual_completion_date: editStatus === "CLOSED" ? (editActualDate || new Date().toISOString().slice(0, 10)) : undefined,
      evidence_submitted: editEvidence,
      validation_results: editValidation,
      residual_risk: editResidualRisk,
      closure_approver: editApprover,
      comments: editComments,
      risk_acceptance_details:
        editStatus === "RISK_ACCEPTED"
          ? {
              approver: acceptanceApprover,
              rationale: acceptanceRationale,
              approval_date: new Date().toISOString().slice(0, 10),
              review_date: acceptanceReviewDate,
            }
          : undefined,
    };

    updateRemediation(selectedAction.action_id, updates);
    setSelectedAction({ ...selectedAction, ...updates });
    setIsEditing(false);
    setValidationError(null);
  };

  const handleExportCSV = () => {
    const exportData = remediations.map((r) => ({
      action_id: r.action_id,
      finding_id: r.finding_id,
      title: r.title,
      owner: r.remediation_owner,
      team: r.responsible_team,
      priority: r.priority,
      status: r.status,
      planned_date: r.planned_completion_date,
      actual_date: r.actual_completion_date || "N/A",
      closure_approver: r.closure_approver || "N/A",
    }));
    exportToCSV(exportData, "Northstar_Remediation_Tracker");
  };

  const columns: Column<RemediationAction>[] = [
    {
      key: "action_id",
      header: "Action ID",
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900">{row.action_id}</span>
          <span className="font-mono text-[10px] text-blue-600 block">{row.finding_id}</span>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (row) => <SeverityBadge severity={row.priority} size="sm" />,
    },
    {
      key: "title",
      header: "Action Item & Plan",
      render: (row) => (
        <div className="max-w-md">
          <p className="font-semibold text-slate-900 leading-snug">{row.title}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{row.recommended_action}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Remediation Status",
      render: (row) => {
        const isClosed = row.status === "CLOSED";
        const isOverdue =
          !isClosed &&
          row.status !== "RISK_ACCEPTED" &&
          new Date(row.planned_completion_date) < new Date("2026-11-12");

        return (
          <div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                isClosed
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : isOverdue
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {isClosed ? (
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
              ) : (
                <Clock className="w-3 h-3 mr-1 text-slate-500" />
              )}
              {row.status.replace("_", " ")}
            </span>
            {isOverdue && (
              <span className="text-[9px] text-red-600 font-bold block mt-0.5 uppercase tracking-tight">
                SLA Overdue
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "remediation_owner",
      header: "Assigned Owner",
      render: (row) => (
        <div>
          <span className="text-[11px] text-slate-800 font-medium block">{row.remediation_owner}</span>
          <span className="text-[10px] text-slate-400">{row.responsible_team}</span>
        </div>
      ),
    },
    {
      key: "planned_completion_date",
      header: "Target SLA Date",
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-600">
          {row.planned_completion_date}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (row) => (
        <button
          onClick={() => handleOpenAction(row)}
          className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
        >
          <Eye className="w-3 h-3" />
          <span>Manage</span>
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
              Remediation Tracker & Retest Verification
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              {remediations.length} Active Workflows
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor engineering commitments, validate uploaded remediation evidence, and verify retest closures
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-300 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Tracker (CSV)</span>
        </button>
      </div>

      {/* Governance Banner */}
      <div className="p-3.5 bg-slate-900 text-slate-200 rounded-lg text-xs flex items-center justify-between border border-slate-800">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-white">
              Internal Audit Governance Policy: Strict Closure Criteria
            </p>
            <p className="text-[11px] text-slate-400">
              Findings cannot be closed by engineers alone. Closure requires verified technical evidence,
              auditor retesting, and written approval by the Audit Director.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={remediations}
        columns={columns}
        searchPlaceholder="Filter by action ID, finding, owner, or status..."
        pageSize={10}
      />

      {/* Action Detail & Closure Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-xs">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-200/80">
                  {selectedAction.action_id}
                </span>
                <span className="font-mono text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedAction.finding_id}
                </span>
                <SeverityBadge severity={selectedAction.priority} size="sm" />
              </div>
              <button
                onClick={() => setSelectedAction(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{validationError}</span>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{selectedAction.title}</h3>
                <p className="text-slate-600">{selectedAction.recommended_action}</p>
              </div>

              {/* Workflow Details */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    <span>Remediation Workflow & Retesting Validation</span>
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 text-xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Update Status</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Workflow Status:
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as RemediationStatus)}
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        >
                          <option value="OPEN">OPEN - Awaiting Assignment</option>
                          <option value="ASSIGNED">ASSIGNED - Assigned to Engineer</option>
                          <option value="IN_PROGRESS">IN_PROGRESS - Engineering Work Active</option>
                          <option value="PENDING_EVIDENCE">PENDING_EVIDENCE - Awaiting Artifacts</option>
                          <option value="PENDING_VALIDATION">PENDING_VALIDATION - Ready for Retest</option>
                          <option value="CLOSED">CLOSED - Verified and Retested</option>
                          <option value="RISK_ACCEPTED">RISK_ACCEPTED - Formal Risk Acceptance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Remediation Owner:
                        </label>
                        <input
                          type="text"
                          value={editOwner}
                          onChange={(e) => setEditOwner(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Target Completion Date:
                        </label>
                        <input
                          type="date"
                          value={editPlannedDate}
                          onChange={(e) => setEditPlannedDate(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Actual Closure Date:
                        </label>
                        <input
                          type="date"
                          value={editActualDate}
                          onChange={(e) => setEditActualDate(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Submitted Technical Evidence (PR link, screenshot, or CLI output):
                      </label>
                      <textarea
                        rows={2}
                        value={editEvidence}
                        onChange={(e) => setEditEvidence(e.target.value)}
                        placeholder="e.g. Terraform PR #412 merged into main; AWS CLI verification command output..."
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Auditor Retest Validation Results:
                      </label>
                      <textarea
                        rows={2}
                        value={editValidation}
                        onChange={(e) => setEditValidation(e.target.value)}
                        placeholder="Auditor executed retest command on live account; confirmed rule deleted / setting active..."
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Closure Approver:
                        </label>
                        <input
                          type="text"
                          value={editApprover}
                          onChange={(e) => setEditApprover(e.target.value)}
                          placeholder="e.g. David Ross (Internal Audit Director)"
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Residual Risk Post-Closure:
                        </label>
                        <select
                          value={editResidualRisk}
                          onChange={(e) => setEditResidualRisk(e.target.value as SeverityLevel)}
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        >
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                        </select>
                      </div>
                    </div>

                    {editStatus === "RISK_ACCEPTED" && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded space-y-2">
                        <span className="font-bold text-amber-900 block">
                          Formal Risk Acceptance Documentation (Mandatory):
                        </span>
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">
                            Approving Executive (e.g. CISO or VP):
                          </label>
                          <input
                            type="text"
                            value={acceptanceApprover}
                            onChange={(e) => setAcceptanceApprover(e.target.value)}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">
                            Business Justification / Rationale:
                          </label>
                          <textarea
                            rows={2}
                            value={acceptanceRationale}
                            onChange={(e) => setAcceptanceRationale(e.target.value)}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveAction}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium flex items-center space-x-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Action Item</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-slate-700">
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-slate-500 font-semibold block">Remediation Owner:</span>
                        <span className="text-slate-900 font-medium">{selectedAction.remediation_owner}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">Responsible Team:</span>
                        <span className="text-slate-900">{selectedAction.responsible_team}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">Planned Completion Date:</span>
                        <span className="font-mono text-slate-800">{selectedAction.planned_completion_date}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">Actual Closure Date:</span>
                        <span className="font-mono text-slate-800">{selectedAction.actual_completion_date || "Pending"}</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded border border-slate-200">
                      <span className="font-semibold text-slate-800 block mb-0.5">Submitted Evidence:</span>
                      <p className="text-slate-600 text-[11px]">
                        {selectedAction.evidence_submitted || "No evidence submitted yet."}
                      </p>
                    </div>

                    <div className="p-2.5 bg-white rounded border border-slate-200">
                      <span className="font-semibold text-slate-800 block mb-0.5">Validation & Retest Outcome:</span>
                      <p className="text-slate-600 text-[11px]">
                        {selectedAction.validation_results || "Awaiting auditor retest."}
                      </p>
                    </div>

                    {selectedAction.closure_approver && (
                      <p className="text-[11px] text-slate-500">
                        <strong>Closure Sign-Off:</strong> {selectedAction.closure_approver}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedAction(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded font-medium hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

