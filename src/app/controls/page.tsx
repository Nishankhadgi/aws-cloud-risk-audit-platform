"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Filter,
  Download,
  Eye,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck2,
  ChevronRight,
  X,
  Save,
  Layers,
} from "lucide-react";
import { useAudit } from "@/context/AuditContext";
import DataTable, { Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import DomainBadge from "@/components/shared/DomainBadge";
import { exportToCSV } from "@/utils/exportUtils";
import {
  AuditControl,
  ControlStatus,
  AuditDomain,
  ControlNature,
  ControlFrequency,
} from "@/types/audit";

export default function ControlMatrixPage() {
  const { controls, updateControl } = useAudit();
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedNature, setSelectedNature] = useState<string>("ALL");
  const [selectedOwner, setSelectedOwner] = useState<string>("ALL");

  // Detailed View Modal / Drawer
  const [activeControl, setActiveControl] = useState<AuditControl | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<ControlStatus>("PASS");
  const [editTod, setEditTod] = useState<ControlStatus>("PASS");
  const [editToe, setEditToe] = useState<ControlStatus>("PASS");
  const [editConclusion, setEditConclusion] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editManagerNotes, setEditManagerNotes] = useState("");

  const domains: AuditDomain[] = [
    "IAM and Access Governance",
    "Encryption and Key Management",
    "Data Protection",
    "Security Logging and Monitoring",
    "Vulnerability and Configuration Management",
    "Change and Release Management",
    "Business Continuity and Availability",
    "Third-Party and Cloud Governance",
  ];

  const owners = useMemo(() => {
    const list = Array.from(new Set(controls.map((c) => c.control_owner)));
    return ["ALL", ...list];
  }, [controls]);

  const filteredControls = useMemo(() => {
    return controls.filter((c) => {
      const domMatch = selectedDomain === "ALL" || c.domain === selectedDomain;
      const statusMatch = selectedStatus === "ALL" || c.status === selectedStatus;
      const natureMatch = selectedNature === "ALL" || c.control_nature === selectedNature;
      const ownerMatch = selectedOwner === "ALL" || c.control_owner === selectedOwner;
      return domMatch && statusMatch && natureMatch && ownerMatch;
    });
  }, [controls, selectedDomain, selectedStatus, selectedNature, selectedOwner]);

  const handleOpenDetail = (ctrl: AuditControl) => {
    setActiveControl(ctrl);
    setEditStatus(ctrl.status);
    setEditTod(ctrl.tod_conclusion || "PASS");
    setEditToe(ctrl.toe_conclusion || "PASS");
    setEditConclusion(ctrl.auditor_conclusion);
    setEditNotes(ctrl.testing_notes);
    setEditManagerNotes(ctrl.manager_review_notes || "");
    setIsEditing(false);
  };

  const handleSaveControl = () => {
    if (!activeControl) return;
    updateControl(activeControl.control_id, {
      status: editStatus,
      tod_conclusion: editTod,
      toe_conclusion: editToe,
      auditor_conclusion: editConclusion,
      testing_notes: editNotes,
      manager_review_notes: editManagerNotes,
    });
    setActiveControl({
      ...activeControl,
      status: editStatus,
      tod_conclusion: editTod,
      toe_conclusion: editToe,
      auditor_conclusion: editConclusion,
      testing_notes: editNotes,
      manager_review_notes: editManagerNotes,
    });
    setIsEditing(false);
  };

  const handleExportCSV = () => {
    const exportData = filteredControls.map((c) => ({
      control_id: c.control_id,
      title: c.title,
      domain: c.domain,
      nature: c.control_nature,
      frequency: c.control_frequency,
      tod_conclusion: c.tod_conclusion,
      toe_conclusion: c.toe_conclusion,
      overall_status: c.status,
      control_owner: c.control_owner,
      auditor_conclusion: c.auditor_conclusion,
      manager_review_notes: c.manager_review_notes || "",
      nist_csf: c.framework_mapping.nist_csf,
      iso_27001: c.framework_mapping.iso_27001,
      cis_aws: c.framework_mapping.cis_aws,
      soc_2: c.framework_mapping.soc_2,
    }));
    exportToCSV(exportData, "Northstar_Audit_Control_Matrix");
  };

  const columns: Column<AuditControl>[] = [
    {
      key: "control_id",
      header: "Control ID",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {row.control_id}
        </span>
      ),
    },
    {
      key: "title",
      header: "Control Title & Objective",
      render: (row) => (
        <div className="max-w-md">
          <p className="font-semibold text-slate-900 leading-snug">{row.title}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{row.objective}</p>
        </div>
      ),
    },
    {
      key: "domain",
      header: "Audit Domain",
      render: (row) => <DomainBadge domain={row.domain} />,
    },
    {
      key: "control_nature",
      header: "Nature & Frequency",
      render: (row) => (
        <div>
          <span className="text-[11px] font-semibold text-slate-700 block">
            {row.control_nature || "Preventive"}
          </span>
          <span className="text-[10px] text-slate-400">
            {row.control_frequency || "Continuous"}
          </span>
        </div>
      ),
    },
    {
      key: "tod_conclusion",
      header: "Test of Design",
      render: (row) => (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
            row.tod_conclusion === "PASS"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          TOD: {row.tod_conclusion || "PASS"}
        </span>
      ),
    },
    {
      key: "toe_conclusion",
      header: "Operating Eff.",
      render: (row) => (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
            row.toe_conclusion === "PASS"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : row.toe_conclusion === "PARTIAL"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          TOE: {row.toe_conclusion || "PASS"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Overall Conclusion",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "cis_aws",
      header: "CIS AWS",
      render: (row) => (
        <span className="font-mono text-[10px] text-slate-500">
          {row.framework_mapping.cis_aws}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (row) => (
        <button
          onClick={() => handleOpenDetail(row)}
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
              Audit Control Matrix
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">
              {controls.length} Defined Controls
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluates technology risks, expected control activities, test procedures, framework crosswalks, and distinct Test of Design (TOD) vs Test of Operating Effectiveness (TOE) evaluations.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-300 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Matrix (CSV)</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center gap-3 text-xs shadow-2xs">
        <div className="flex items-center space-x-1.5 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Domain Filter */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-500">Domain:</span>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="p-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white"
          >
            <option value="ALL">All Domains ({controls.length})</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Nature Filter */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-500">Nature:</span>
          <select
            value={selectedNature}
            onChange={(e) => setSelectedNature(e.target.value)}
            className="p-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white"
          >
            <option value="ALL">All Types</option>
            <option value="Preventive">Preventive</option>
            <option value="Detective">Detective</option>
            <option value="Corrective">Corrective</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-500">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PASS">Pass</option>
            <option value="FAIL">Fail</option>
            <option value="PARTIAL">Partial</option>
            <option value="NOT_TESTED">Not Tested</option>
            <option value="NOT_APPLICABLE">Not Applicable</option>
          </select>
        </div>

        {/* Owner Filter */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-500">Owner:</span>
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="p-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white"
          >
            {owners.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <span className="ml-auto text-slate-400 text-[11px]">
          Showing {filteredControls.length} of {controls.length} controls
        </span>
      </div>

      {/* Control Matrix Table */}
      <DataTable
        data={filteredControls}
        columns={columns}
        searchPlaceholder="Search by ID, title, objective, nature, or framework..."
        pageSize={10}
      />

      {/* Control Inspection Modal */}
      {activeControl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-xs">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-sm font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-200/80">
                  {activeControl.control_id}
                </span>
                <DomainBadge domain={activeControl.domain} />
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-800">
                  {activeControl.control_nature || "Preventive"}
                </span>
                <StatusBadge status={isEditing ? editStatus : activeControl.status} />
              </div>
              <button
                onClick={() => setActiveControl(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {activeControl.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {activeControl.objective}
                </p>
                <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-500">
                  <span><strong>Owner:</strong> {activeControl.control_owner}</span>
                  <span><strong>Frequency:</strong> {activeControl.control_frequency || "Continuous Automated"}</span>
                </div>
              </div>

              {/* TOD & TOE Dual Evaluation Card */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">Test of Design (TOD):</span>
                  <p className="text-slate-600 text-[10px] mb-1.5">
                    Evaluates whether control policy and technical mechanisms are properly structured to mitigate risk.
                  </p>
                  <StatusBadge status={isEditing ? editTod : activeControl.tod_conclusion || "PASS"} />
                </div>
                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">Test of Operating Effectiveness (TOE):</span>
                  <p className="text-slate-600 text-[10px] mb-1.5">
                    Evaluates whether the control operated consistently as designed without unmanaged exceptions over the audit period.
                  </p>
                  <StatusBadge status={isEditing ? editToe : activeControl.toe_conclusion || "PASS"} />
                </div>
              </div>

              {/* Framework Crosswalk Grid */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 font-semibold block">NIST CSF 2.0:</span>
                  <span className="font-mono text-slate-800">{activeControl.framework_mapping.nist_csf}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">ISO 27001:2022:</span>
                  <span className="font-mono text-slate-800">{activeControl.framework_mapping.iso_27001}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">CIS AWS v3.0:</span>
                  <span className="font-mono text-slate-800">{activeControl.framework_mapping.cis_aws}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">SOC 2 (2022):</span>
                  <span className="font-mono text-slate-800">{activeControl.framework_mapping.soc_2}</span>
                </div>
              </div>

              {/* Expected Activity & Test Procedure */}
              <div className="space-y-3">
                <div className="p-3 rounded border border-slate-200 bg-white">
                  <span className="font-semibold text-slate-800 block mb-1">Expected Control Activity:</span>
                  <p className="text-slate-600">{activeControl.expected_activity}</p>
                </div>

                <div className="p-3 rounded border border-slate-200 bg-white">
                  <span className="font-semibold text-slate-800 block mb-1">Audit Test Procedure:</span>
                  <p className="text-slate-600">{activeControl.test_procedure}</p>
                </div>
              </div>

              {/* Manager Review Notes */}
              <div className="p-3 rounded border border-purple-200 bg-purple-50/30">
                <span className="font-bold text-purple-900 block mb-1">
                  Senior Audit Manager Review & Coaching Notes:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {activeControl.manager_review_notes || "Concur with auditor workpaper conclusions."}
                </p>
              </div>

              {/* Auditor Conclusion & Override Section */}
              <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Auditor Evaluation & Conclusion</span>
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 text-xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Auditor Conclusion</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Overall Status:</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as ControlStatus)}
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        >
                          <option value="PASS">PASS</option>
                          <option value="FAIL">FAIL</option>
                          <option value="PARTIAL">PARTIAL</option>
                          <option value="NOT_TESTED">NOT_TESTED</option>
                          <option value="NOT_APPLICABLE">NOT_APPLICABLE</option>
                          <option value="INCOMPLETE_EVIDENCE">INCOMPLETE_EVIDENCE</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">TOD Status:</label>
                        <select
                          value={editTod}
                          onChange={(e) => setEditTod(e.target.value as ControlStatus)}
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        >
                          <option value="PASS">PASS</option>
                          <option value="FAIL">FAIL</option>
                          <option value="PARTIAL">PARTIAL</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">TOE Status:</label>
                        <select
                          value={editToe}
                          onChange={(e) => setEditToe(e.target.value as ControlStatus)}
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        >
                          <option value="PASS">PASS</option>
                          <option value="FAIL">FAIL</option>
                          <option value="PARTIAL">PARTIAL</option>
                          <option value="INCOMPLETE_EVIDENCE">INCOMPLETE</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Auditor Conclusion:</label>
                      <textarea
                        value={editConclusion}
                        onChange={(e) => setEditConclusion(e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Testing Workpaper Notes:</label>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Manager Review Notes:</label>
                      <textarea
                        value={editManagerNotes}
                        onChange={(e) => setEditManagerNotes(e.target.value)}
                        rows={2}
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
                        onClick={handleSaveControl}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium flex items-center space-x-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Conclusion</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-slate-700">
                    <p>
                      <strong>Conclusion:</strong> {activeControl.auditor_conclusion}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      <strong>Workpaper Notes:</strong> {activeControl.testing_notes}
                    </p>
                    <p className="text-slate-400 text-[10px] font-mono">
                      Last Updated: {new Date(activeControl.updated_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setActiveControl(null)}
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
