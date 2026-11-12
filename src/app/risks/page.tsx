"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Plus,
  Download,
  Eye,
  Edit2,
  Save,
  X,
  TrendingDown,
  Layers,
  HelpCircle,
} from "lucide-react";
import { useAudit } from "@/context/AuditContext";
import DataTable, { Column } from "@/components/shared/DataTable";
import SeverityBadge from "@/components/shared/SeverityBadge";
import { exportToCSV } from "@/utils/exportUtils";
import { calculateRiskScore, LIKELIHOOD_SCALE, IMPACT_SCALE } from "@/utils/riskCalculators";
import { RiskItem, SeverityLevel } from "@/types/audit";

export default function RiskRegisterPage() {
  const { risks, updateRisk, addRisk } = useAudit();
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editLikelihood, setEditLikelihood] = useState(3);
  const [editImpact, setEditImpact] = useState(3);
  const [editResidualScore, setEditResidualScore] = useState(6);
  const [editMitigation, setEditMitigation] = useState("");
  const [editRationale, setEditRationale] = useState("");

  const handleOpenRisk = (r: RiskItem) => {
    setSelectedRisk(r);
    setEditLikelihood(r.likelihood);
    setEditImpact(r.impact);
    setEditResidualScore(r.residual_score);
    setEditMitigation(r.proposed_mitigation);
    setEditRationale(r.rationale_for_override || "");
    setIsEditing(false);
  };

  const handleSaveRisk = () => {
    if (!selectedRisk) return;
    const { score, severity } = calculateRiskScore(editLikelihood, editImpact);
    const residualSeverity = calculateRiskScore(Math.ceil(editResidualScore / 5), 5).severity;

    const updates: Partial<RiskItem> = {
      likelihood: editLikelihood,
      impact: editImpact,
      inherent_score: score,
      inherent_severity: severity,
      residual_score: editResidualScore,
      residual_severity: residualSeverity,
      proposed_mitigation: editMitigation,
      rationale_for_override: editRationale,
    };

    updateRisk(selectedRisk.risk_id, updates);
    setSelectedRisk({ ...selectedRisk, ...updates });
    setIsEditing(false);
  };

  const handleExportCSV = () => {
    const exportData = risks.map((r) => ({
      risk_id: r.risk_id,
      title: r.title,
      service: r.related_service,
      inherent_score: r.inherent_score,
      inherent_severity: r.inherent_severity,
      residual_score: r.residual_score,
      residual_severity: r.residual_severity,
      risk_owner: r.risk_owner,
      status: r.status,
      target_date: r.target_date,
    }));
    exportToCSV(exportData, "Northstar_Technology_Risk_Register");
  };

  const columns: Column<RiskItem>[] = [
    {
      key: "risk_id",
      header: "Risk ID",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {row.risk_id}
        </span>
      ),
    },
    {
      key: "title",
      header: "Risk Title & Service",
      render: (row) => (
        <div className="max-w-md">
          <p className="font-semibold text-slate-900 leading-snug">{row.title}</p>
          <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-1 inline-block">
            {row.related_service}
          </span>
        </div>
      ),
    },
    {
      key: "inherent_severity",
      header: "Inherent Risk (L × I)",
      render: (row) => (
        <div>
          <SeverityBadge severity={row.inherent_severity} size="sm" />
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
            Score: {row.inherent_score} ({row.likelihood}×{row.impact})
          </span>
        </div>
      ),
    },
    {
      key: "residual_severity",
      header: "Residual Risk",
      render: (row) => (
        <div>
          <SeverityBadge severity={row.residual_severity} size="sm" />
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
            Score: {row.residual_score}
          </span>
        </div>
      ),
    },
    {
      key: "risk_owner",
      header: "Risk Owner",
      render: (row) => (
        <span className="text-[11px] text-slate-700 font-medium">{row.risk_owner}</span>
      ),
    },
    {
      key: "target_date",
      header: "Target SLA",
      render: (row) => (
        <span className="text-[11px] text-slate-500 font-mono">{row.target_date}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (row) => (
        <button
          onClick={() => handleOpenRisk(row)}
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
              Technology Risk Register & 5×5 Scoring Matrix
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              {risks.length} Assessed Cloud Risks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quantitative evaluation using Likelihood × Impact = Inherent Risk with mitigating control offsets
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-300 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Register (CSV)</span>
        </button>
      </div>

      {/* Methodology Banner */}
      <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs text-xs space-y-2">
        <h3 className="font-bold text-slate-900 flex items-center space-x-1.5">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>5×5 Risk Scoring Methodology & Calibration Standard</span>
        </h3>
        <p className="text-slate-600 leading-relaxed">
          Technology risk is computed as <strong>Inherent Score = Likelihood (1-5) × Impact (1-5)</strong>.
          Scores are categorized into four tiers: <strong>Critical (20–25)</strong>, <strong>High (12–19)</strong>,{" "}
          <strong>Medium (6–11)</strong>, and <strong>Low (1–5)</strong>.
          Auditors apply professional judgment to calibrate scanner findings against business impact (e.g. HIPAA exposure,
          claims settlement downtime, and customer data loss) rather than relying blindly on automated severity tags.
        </p>
      </div>

      {/* Risks Table */}
      <DataTable
        data={risks}
        columns={columns}
        searchPlaceholder="Filter risks by ID, title, service, owner, or status..."
        pageSize={10}
      />

      {/* Inspect & Calibrate Risk Modal */}
      {selectedRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-200/80">
                  {selectedRisk.risk_id}
                </span>
                <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedRisk.related_service}
                </span>
                <SeverityBadge severity={selectedRisk.inherent_severity} size="sm" />
              </div>
              <button
                onClick={() => setSelectedRisk(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{selectedRisk.title}</h3>
                <p className="text-slate-600 leading-relaxed">{selectedRisk.risk_statement}</p>
              </div>

              {/* Threat and Vulnerability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded border border-slate-200 bg-slate-50">
                  <span className="font-semibold text-slate-700 block mb-1">Threat Agent / Vector:</span>
                  <p className="text-slate-600">{selectedRisk.threat}</p>
                </div>
                <div className="p-3 rounded border border-slate-200 bg-slate-50">
                  <span className="font-semibold text-slate-700 block mb-1">Vulnerability / Weakness:</span>
                  <p className="text-slate-600">{selectedRisk.vulnerability}</p>
                </div>
              </div>

              {/* Business Impact */}
              <div className="p-3 rounded border border-slate-200 bg-slate-50">
                <span className="font-semibold text-slate-700 block mb-1">Business Impact Analysis:</span>
                <p className="text-slate-600">{selectedRisk.business_impact}</p>
              </div>

              {/* Inherent vs Residual Calibration Box */}
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <TrendingDown className="w-4 h-4 text-blue-600" />
                    <span>5×5 Risk Calibration & Auditor Override</span>
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 text-xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Adjust Ratings</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Likelihood (1 to 5):
                        </label>
                        <select
                          value={editLikelihood}
                          onChange={(e) => setEditLikelihood(Number(e.target.value))}
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        >
                          {LIKELIHOOD_SCALE.map((l) => (
                            <option key={l.level} value={l.level}>
                              {l.level} - {l.label} ({l.desc})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Impact (1 to 5):
                        </label>
                        <select
                          value={editImpact}
                          onChange={(e) => setEditImpact(Number(e.target.value))}
                          className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                        >
                          {IMPACT_SCALE.map((i) => (
                            <option key={i.level} value={i.level}>
                              {i.level} - {i.label} ({i.desc})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded border border-slate-200 text-slate-800 flex justify-between items-center">
                      <span>Calculated Inherent Score:</span>
                      <span className="font-mono font-bold text-sm">
                        {editLikelihood * editImpact} / 25 (
                        {calculateRiskScore(editLikelihood, editImpact).severity})
                      </span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Residual Risk Score (after controls):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="25"
                        value={editResidualScore}
                        onChange={(e) => setEditResidualScore(Number(e.target.value))}
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Auditor Rationale for Adjustment / Override:
                      </label>
                      <textarea
                        rows={2}
                        value={editRationale}
                        onChange={(e) => setEditRationale(e.target.value)}
                        placeholder="Document business justification for modifying risk rating..."
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
                        onClick={handleSaveRisk}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium flex items-center space-x-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Calibration</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-slate-800">
                    <div>
                      <span className="text-slate-500 font-semibold block">Inherent Risk:</span>
                      <p className="font-mono font-bold text-sm mt-0.5">
                        {selectedRisk.inherent_score} / 25 ({selectedRisk.inherent_severity})
                      </p>
                      <span className="text-[11px] text-slate-500">
                        Likelihood {selectedRisk.likelihood} × Impact {selectedRisk.impact}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block">Residual Risk:</span>
                      <p className="font-mono font-bold text-sm mt-0.5">
                        {selectedRisk.residual_score} / 25 ({selectedRisk.residual_severity})
                      </p>
                      <span className="text-[11px] text-slate-500">
                        Offset by existing detective controls
                      </span>
                    </div>

                    {selectedRisk.rationale_for_override && (
                      <div className="col-span-2 pt-2 border-t border-blue-100 text-[11px] text-slate-600">
                        <strong>Auditor Rationale:</strong> {selectedRisk.rationale_for_override}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mitigation Plan */}
              <div className="p-3 rounded border border-slate-200 bg-white">
                <span className="font-semibold text-slate-700 block mb-1">Proposed Mitigation:</span>
                <p className="text-slate-600 leading-relaxed">{selectedRisk.proposed_mitigation}</p>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Owner: {selectedRisk.risk_owner}</span>
                  <span>Target Date: {selectedRisk.target_date}</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedRisk(null)}
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

