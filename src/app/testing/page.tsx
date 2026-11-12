"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  Eye,
  Plus,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck2,
  X,
  Edit2,
  Save,
  ShieldCheck,
  Database,
  UserCheck,
  Clock,
  Layers,
} from "lucide-react";
import { useAudit } from "@/context/AuditContext";
import DataTable, { Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { exportToCSV } from "@/utils/exportUtils";
import {
  AuditTest,
  ControlStatus,
  WorkpaperReviewStatus,
} from "@/types/audit";

export default function TestingWorkpapersPage() {
  const { tests, updateTest } = useAudit();
  const [activeTest, setActiveTest] = useState<AuditTest | null>(null);
  const [activeTab, setActiveTab] = useState<"procedure" | "ipe" | "signoff">("procedure");

  // Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editOutcome, setEditOutcome] = useState<ControlStatus>("PASS");
  const [editActualResult, setEditActualResult] = useState("");
  const [editExceptions, setEditExceptions] = useState("");
  const [editReviewerNotes, setEditReviewerNotes] = useState("");
  const [editManagerStatus, setEditManagerStatus] = useState<WorkpaperReviewStatus>("MANAGER_APPROVED");
  const [editManagerNotes, setEditManagerNotes] = useState("");

  const handleOpenTest = (t: AuditTest) => {
    setActiveTest(t);
    setEditOutcome(t.auditor_conclusion);
    setEditActualResult(t.actual_result);
    setEditExceptions(t.exceptions_identified);
    setEditReviewerNotes(t.reviewer_notes);
    setEditManagerStatus(t.manager_signoff?.status || "MANAGER_APPROVED");
    setEditManagerNotes(t.manager_signoff?.review_notes || "");
    setActiveTab("procedure");
    setIsEditing(false);
  };

  const handleSaveTest = () => {
    if (!activeTest) return;
    const updatedManagerSignoff = {
      ...activeTest.manager_signoff,
      status: editManagerStatus,
      review_notes: editManagerNotes,
    };

    updateTest(activeTest.test_id, {
      auditor_conclusion: editOutcome,
      actual_result: editActualResult,
      exceptions_identified: editExceptions,
      reviewer_notes: editReviewerNotes,
      manager_signoff: updatedManagerSignoff,
    });

    setActiveTest({
      ...activeTest,
      auditor_conclusion: editOutcome,
      actual_result: editActualResult,
      exceptions_identified: editExceptions,
      reviewer_notes: editReviewerNotes,
      manager_signoff: updatedManagerSignoff,
    });
    setIsEditing(false);
  };

  const handleExportCSV = () => {
    const exportData = tests.map((t) => ({
      test_id: t.test_id,
      related_control_id: t.related_control_id,
      test_type: t.test_type,
      audit_objective: t.audit_objective,
      sampling_method: t.sampling_method,
      sample_size: t.sample_size,
      ipe_verified: t.ipe_testing?.verified_complete ? "VERIFIED" : "INCOMPLETE",
      auditor_conclusion: t.auditor_conclusion,
      manager_review_status: t.manager_signoff?.status || "DRAFT",
      exceptions_identified: t.exceptions_identified,
      performed_by: t.performed_by,
      test_date: t.test_date,
    }));
    exportToCSV(exportData, "Northstar_Audit_Testing_Workpapers");
  };

  const getManagerStatusBadge = (status: WorkpaperReviewStatus) => {
    switch (status) {
      case "MANAGER_APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold";
      case "REVIEW_NOTES_PENDING":
        return "bg-amber-50 text-amber-800 border-amber-300 font-bold";
      case "SUBMITTED_FOR_REVIEW":
        return "bg-blue-50 text-blue-700 border-blue-300 font-medium";
      default:
        return "bg-slate-100 text-slate-600 border-slate-300 font-normal";
    }
  };

  const columns: Column<AuditTest>[] = [
    {
      key: "test_id",
      header: "Test ID",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {row.test_id}
        </span>
      ),
    },
    {
      key: "related_control_id",
      header: "Mapped Control",
      render: (row) => (
        <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.related_control_id}
        </span>
      ),
    },
    {
      key: "test_type",
      header: "Test Scope",
      render: (row) => (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
          {row.test_type === "TOD_AND_TOE" ? "TOD & TOE" : row.test_type}
        </span>
      ),
    },
    {
      key: "audit_objective",
      header: "Audit Testing Objective",
      render: (row) => (
        <div className="max-w-md">
          <p className="font-medium text-slate-800 leading-snug">{row.audit_objective}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
            Method: {row.sampling_method} (n={row.sample_size})
          </p>
        </div>
      ),
    },
    {
      key: "ipe_testing",
      header: "IPE Verification",
      render: (row) => (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
            row.ipe_testing?.verified_complete
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {row.ipe_testing?.verified_complete ? (
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
          ) : (
            <AlertCircle className="w-3 h-3 mr-1 text-rose-600" />
          )}
          {row.ipe_testing?.verified_complete ? "IPE Validated" : "IPE Incomplete"}
        </span>
      ),
    },
    {
      key: "auditor_conclusion",
      header: "Auditor Conclusion",
      render: (row) => <StatusBadge status={row.auditor_conclusion} />,
    },
    {
      key: "manager_status",
      header: "Manager Review",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${getManagerStatusBadge(
            row.manager_signoff?.status || "MANAGER_APPROVED"
          )}`}
        >
          {row.manager_signoff?.status === "REVIEW_NOTES_PENDING" && (
            <Clock className="w-3 h-3 mr-1 text-amber-600" />
          )}
          {(row.manager_signoff?.status || "MANAGER_APPROVED").replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "performed_by",
      header: "Preparer",
      render: (row) => (
        <span className="text-[11px] text-slate-600 font-medium">{row.performed_by}</span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (row) => (
        <button
          onClick={() => handleOpenTest(row)}
          className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
        >
          <Eye className="w-3 h-3" />
          <span>Workpaper</span>
        </button>
      ),
    },
  ];

  const pendingReviewNotesCount = tests.filter(
    (t) => t.manager_signoff?.status === "REVIEW_NOTES_PENDING"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              Audit Testing & Detailed Workpapers
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              {tests.length} Executed Workpapers
            </span>
            {pendingReviewNotesCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-amber-700" />
                <span>{pendingReviewNotesCount} Manager Review Notes Pending</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-tier audit documentation meeting IIA IPPF and PCAOB/AICPA IPE guidelines: Test of Design (TOD), Test of Operating Effectiveness (TOE), IPE Reconciliation, and Managerial Sign-Off.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-300 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Workpapers (CSV)</span>
        </button>
      </div>

      {/* Big Four Testing Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Total Workpapers</span>
          <p className="text-xl font-bold text-navy-900 mt-0.5">{tests.length}</p>
          <span className="text-[10px] text-slate-400">100% automated & risk-based samples</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Operating Effectiveness (TOE)</span>
          <p className="text-xl font-bold text-blue-700 mt-0.5">
            {tests.filter((t) => t.test_type === "TOE" || t.test_type === "TOD_AND_TOE").length}
          </p>
          <span className="text-[10px] text-slate-400">Sample testing over audit period</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">IPE Data Validation</span>
          <p className="text-xl font-bold text-emerald-700 mt-0.5">
            {tests.filter((t) => t.ipe_testing?.verified_complete).length} / {tests.length}
          </p>
          <span className="text-[10px] text-slate-400">Reconciled to authoritative source</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Supervisory Review</span>
          <p className="text-xl font-bold text-amber-700 mt-0.5">
            {tests.filter((t) => t.manager_signoff?.status === "MANAGER_APPROVED").length} Approved
          </p>
          <span className="text-[10px] text-slate-400">
            {pendingReviewNotesCount} with active manager notes
          </span>
        </div>
      </div>

      {/* Tests Table */}
      <DataTable
        data={tests}
        columns={columns}
        searchPlaceholder="Filter tests by ID, control, objective, auditor, or review status..."
        pageSize={10}
      />

      {/* Detailed Workpaper Modal */}
      {activeTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-xs">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-sm font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-200/80">
                  {activeTest.test_id}
                </span>
                <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Control: {activeTest.related_control_id}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800">
                  {activeTest.test_type === "TOD_AND_TOE" ? "TOD & TOE" : activeTest.test_type}
                </span>
                <StatusBadge status={isEditing ? editOutcome : activeTest.auditor_conclusion} />
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${getManagerStatusBadge(
                    isEditing ? editManagerStatus : activeTest.manager_signoff?.status || "MANAGER_APPROVED"
                  )}`}
                >
                  {(isEditing ? editManagerStatus : activeTest.manager_signoff?.status || "MANAGER_APPROVED").replace(/_/g, " ")}
                </span>
              </div>
              <button
                onClick={() => setActiveTest(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 px-5 pt-2 border-b border-slate-200 bg-slate-100/60 text-xs">
              <button
                onClick={() => setActiveTab("procedure")}
                className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
                  activeTab === "procedure"
                    ? "border-blue-600 text-blue-700 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>1. Procedures & Results</span>
              </button>
              <button
                onClick={() => setActiveTab("ipe")}
                className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
                  activeTab === "ipe"
                    ? "border-blue-600 text-blue-700 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>2. IPE Validation (Completeness/Accuracy)</span>
              </button>
              <button
                onClick={() => setActiveTab("signoff")}
                className={`px-3 py-2 font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
                  activeTab === "signoff"
                    ? "border-blue-600 text-blue-700 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>3. Supervisory Review & Sign-Off</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {activeTab === "procedure" && (
                <>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      {activeTest.audit_objective}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Risk Addressed:</strong> {activeTest.risk_addressed}
                    </p>
                  </div>

                  {/* Sampling & Population Card */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-semibold block">Population:</span>
                      <span className="text-slate-800">{activeTest.population}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Sampling Method:</span>
                      <span className="text-slate-800 font-medium">{activeTest.sampling_method}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Sample Size:</span>
                      <span className="font-mono font-bold text-slate-900">{activeTest.sample_size} Units</span>
                    </div>
                  </div>

                  {/* Test Steps */}
                  <div className="p-3 rounded border border-slate-200 bg-white">
                    <span className="font-semibold text-slate-800 block mb-1.5">Executed Test Steps:</span>
                    <ol className="space-y-1.5 text-slate-600 list-decimal list-inside leading-relaxed">
                      {activeTest.test_steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Expected vs Actual Result */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded border border-slate-200 bg-white">
                      <span className="font-semibold text-slate-700 block mb-1">Expected Test Result:</span>
                      <p className="text-slate-600">{activeTest.expected_result}</p>
                    </div>
                    <div className="p-3 rounded border border-slate-200 bg-white">
                      <span className="font-semibold text-slate-700 block mb-1">Actual Observed Result:</span>
                      {isEditing ? (
                        <textarea
                          value={editActualResult}
                          onChange={(e) => setEditActualResult(e.target.value)}
                          rows={3}
                          className="w-full p-2 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <p className="text-slate-800 font-medium">{activeTest.actual_result}</p>
                      )}
                    </div>
                  </div>

                  {/* Compensating Controls Evaluated */}
                  {activeTest.compensating_controls_evaluated && (
                    <div className="p-3 rounded border border-emerald-200 bg-emerald-50/30">
                      <span className="font-semibold text-emerald-900 flex items-center space-x-1.5 mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Compensating & Mitigating Controls Evaluated:</span>
                      </span>
                      <p className="text-slate-700 leading-relaxed">
                        {activeTest.compensating_controls_evaluated}
                      </p>
                    </div>
                  )}

                  {/* Exceptions Identified */}
                  <div className="p-3 rounded border border-slate-200 bg-white">
                    <span className="font-semibold text-slate-700 block mb-1">Exceptions Identified:</span>
                    {isEditing ? (
                      <textarea
                        value={editExceptions}
                        onChange={(e) => setEditExceptions(e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    ) : (
                      <p className={activeTest.exceptions_identified.includes("None") ? "text-emerald-700 font-medium" : "text-rose-700 font-semibold"}>
                        {activeTest.exceptions_identified}
                      </p>
                    )}
                  </div>
                </>
              )}

              {activeTab === "ipe" && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-blue-900">
                    <h4 className="font-bold flex items-center space-x-1.5">
                      <Database className="w-4 h-4 text-blue-700" />
                      <span>Information Produced by the Entity (IPE) Audit Verification</span>
                    </h4>
                    <p className="text-[11px] text-blue-800 mt-1">
                      Per PCAOB Auditing Standard 1105 and AICPA AU-C 500, auditors cannot rely on reports, exports, or scripts without independently validating both the completeness and accuracy of the underlying population extract.
                    </p>
                  </div>

                  {activeTest.ipe_testing ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded border border-slate-200 bg-white">
                        <span className="text-slate-500 font-semibold block mb-0.5">Source System / API:</span>
                        <span className="font-mono text-xs text-slate-900 font-bold">
                          {activeTest.ipe_testing.source_system}
                        </span>
                      </div>

                      <div className="p-3 rounded border border-slate-200 bg-white">
                        <span className="text-slate-500 font-semibold block mb-1">
                          Exact Extraction Command / Query:
                        </span>
                        <pre className="p-2 bg-slate-900 text-emerald-400 rounded font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                          {activeTest.ipe_testing.extraction_query_or_api}
                        </pre>
                      </div>

                      <div className="p-3 rounded border border-slate-200 bg-white">
                        <span className="text-slate-700 font-bold block mb-1">
                          1. Completeness Reconciliation (Population Validation):
                        </span>
                        <p className="text-slate-700 leading-relaxed">
                          {activeTest.ipe_testing.completeness_reconciliation}
                        </p>
                      </div>

                      <div className="p-3 rounded border border-slate-200 bg-white">
                        <span className="text-slate-700 font-bold block mb-1">
                          2. Accuracy Validation (Cryptographic Hash & Parameter Verification):
                        </span>
                        <p className="text-slate-700 leading-relaxed">
                          {activeTest.ipe_testing.accuracy_validation}
                        </p>
                      </div>

                      <div className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-900 block">IPE Reliability Determination:</span>
                          <span className="text-slate-500 text-[11px]">
                            {activeTest.ipe_testing.verified_complete
                              ? "Auditor independently verified data is complete and accurate."
                              : "Evidence or reconciliation incomplete; scope limitation applies."}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-bold border ${
                            activeTest.ipe_testing.verified_complete
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-rose-100 text-rose-800 border-rose-300"
                          }`}
                        >
                          {activeTest.ipe_testing.verified_complete ? "VERIFIED COMPLETE" : "INCOMPLETE"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500">
                      No formal IPE testing recorded for this workpaper.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "signoff" && (
                <div className="space-y-4">
                  {/* Two-Tier Sign-Off Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Preparer Box */}
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
                      <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <span>Level 1: Workpaper Preparer</span>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <p><strong>Name:</strong> {activeTest.preparer_signoff?.name || activeTest.performed_by}</p>
                        <p><strong>Title:</strong> {activeTest.preparer_signoff?.title || "Senior IT Auditor"}</p>
                        <p><strong>Date:</strong> {activeTest.preparer_signoff?.date || activeTest.test_date}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Workpaper Completed & Submitted for Review</span>
                      </div>
                    </div>

                    {/* Manager Box */}
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
                      <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Level 2: Senior Audit Manager Review</span>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <p><strong>Manager:</strong> {activeTest.manager_signoff?.name || "Marcus Sterling, CPA, CISA, CISSP"}</p>
                        <p><strong>Title:</strong> {activeTest.manager_signoff?.title || "Senior IT Audit Manager"}</p>
                        <p><strong>Date:</strong> {activeTest.manager_signoff?.date || activeTest.test_date}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${getManagerStatusBadge(
                            isEditing ? editManagerStatus : activeTest.manager_signoff?.status || "MANAGER_APPROVED"
                          )}`}
                        >
                          {(isEditing ? editManagerStatus : activeTest.manager_signoff?.status || "MANAGER_APPROVED").replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Manager Review Notes Card */}
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <FileCheck2 className="w-4 h-4 text-purple-600" />
                        <span>Managerial Review Notes & Sign-Off Workflow</span>
                      </span>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 text-xs"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit Review & Sign-Off</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Auditor Conclusion:
                            </label>
                            <select
                              value={editOutcome}
                              onChange={(e) => setEditOutcome(e.target.value as ControlStatus)}
                              className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                            >
                              <option value="PASS">PASS - Operating Effectively</option>
                              <option value="FAIL">FAIL - Control Deficiency</option>
                              <option value="PARTIAL">PARTIAL - Partially Effective</option>
                              <option value="INCOMPLETE_EVIDENCE">INCOMPLETE_EVIDENCE - Scope Limitation</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Manager Review Status:
                            </label>
                            <select
                              value={editManagerStatus}
                              onChange={(e) => setEditManagerStatus(e.target.value as WorkpaperReviewStatus)}
                              className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                            >
                              <option value="MANAGER_APPROVED">MANAGER_APPROVED - Concur with Workpaper</option>
                              <option value="REVIEW_NOTES_PENDING">REVIEW_NOTES_PENDING - Additional Evidence Required</option>
                              <option value="SUBMITTED_FOR_REVIEW">SUBMITTED_FOR_REVIEW - Under Initial Review</option>
                              <option value="DRAFT">DRAFT - In Progress</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Manager Review Notes / Coaching Feedback:
                          </label>
                          <textarea
                            value={editManagerNotes}
                            onChange={(e) => setEditManagerNotes(e.target.value)}
                            rows={3}
                            placeholder="Enter supervisory comments, sampling justification requests, or concurrence rationale..."
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
                            onClick={handleSaveTest}
                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium flex items-center space-x-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Sign-Off</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-slate-700">
                        <div>
                          <span className="font-semibold text-slate-900 block mb-0.5">
                            Supervisory Manager Comments:
                          </span>
                          <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                            {activeTest.manager_signoff?.review_notes || activeTest.reviewer_notes || "No manager review notes documented."}
                          </p>
                        </div>
                        <p className="text-slate-400 text-[10px] font-mono">
                          Reviewer: {activeTest.manager_signoff?.name || "Marcus Sterling, CPA, CISA, CISSP"} | Status: {activeTest.manager_signoff?.status || "MANAGER_APPROVED"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setActiveTest(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded font-medium hover:bg-slate-900"
              >
                Close Workpaper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
