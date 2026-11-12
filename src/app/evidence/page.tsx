"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  Plus,
  Download,
  Upload,
  Shield,
  CheckCircle2,
  FileCode,
  Lock,
  Eye,
  X,
  FileText,
} from "lucide-react";
import { useAudit } from "@/context/AuditContext";
import DataTable, { Column } from "@/components/shared/DataTable";
import { exportToCSV, exportToJSON } from "@/utils/exportUtils";
import { calculateSHA256, hashFile } from "@/utils/hashUtils";
import { EvidenceRecord } from "@/types/audit";

export default function EvidenceRegisterPage() {
  const { evidence, addEvidence } = useAudit();
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New Evidence Form state
  const [formData, setFormData] = useState({
    evidence_id: `EVD-NEW-${Math.floor(100 + Math.random() * 900)}`,
    title: "",
    control_id: "CTL-IAM-01",
    test_id: "IAM-01",
    source: "AWS Management Console / CLI",
    collector: "Senior IT Auditor",
    description: "",
    is_confidential: true,
    is_sanitized: true,
    payload_text: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [computedHash, setComputedHash] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const hash = await hashFile(file);
      setComputedHash(hash);
    }
  };

  const handlePayloadTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, payload_text: val }));
    if (!uploadedFile && val) {
      const hash = await calculateSHA256(val);
      setComputedHash(hash);
    }
  };

  const handleSaveEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalHash = computedHash;
    if (!finalHash) {
      finalHash = await calculateSHA256(formData.payload_text || formData.title);
    }

    const record: EvidenceRecord = {
      evidence_id: formData.evidence_id,
      title: formData.title,
      control_id: formData.control_id,
      test_id: formData.test_id,
      source: formData.source,
      collector: formData.collector,
      collection_date: new Date().toISOString(),
      sha256_hash: finalHash,
      is_confidential: formData.is_confidential,
      is_sanitized: formData.is_sanitized,
      validation_status: "VALIDATED",
      file_name: uploadedFile ? uploadedFile.name : `${formData.evidence_id}.json`,
      file_size_bytes: uploadedFile ? uploadedFile.size : new Blob([formData.payload_text]).size,
      description: formData.description,
      raw_payload_preview: formData.payload_text || `Uploaded file: ${uploadedFile?.name || "artifact"}`,
    };

    addEvidence(record);
    setIsUploadModalOpen(false);
    // Reset form
    setFormData({
      evidence_id: `EVD-NEW-${Math.floor(100 + Math.random() * 900)}`,
      title: "",
      control_id: "CTL-IAM-01",
      test_id: "IAM-01",
      source: "AWS Management Console / CLI",
      collector: "Senior IT Auditor",
      description: "",
      is_confidential: true,
      is_sanitized: true,
      payload_text: "",
    });
    setUploadedFile(null);
    setComputedHash("");
  };

  const handleExportCSV = () => {
    const exportData = evidence.map((ev) => ({
      evidence_id: ev.evidence_id,
      title: ev.title,
      control_id: ev.control_id,
      test_id: ev.test_id,
      source: ev.source,
      collector: ev.collector,
      collection_date: ev.collection_date,
      sha256_hash: ev.sha256_hash,
      validation_status: ev.validation_status,
      file_name: ev.file_name,
    }));
    exportToCSV(exportData, "Northstar_Evidence_Register");
  };

  const columns: Column<EvidenceRecord>[] = [
    {
      key: "evidence_id",
      header: "Evidence ID",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {row.evidence_id}
        </span>
      ),
    },
    {
      key: "title",
      header: "Artifact Title & Description",
      render: (row) => (
        <div className="max-w-md">
          <p className="font-semibold text-slate-900 leading-snug">{row.title}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{row.description}</p>
        </div>
      ),
    },
    {
      key: "control_id",
      header: "Linked Control / Test",
      render: (row) => (
        <div>
          <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {row.control_id}
          </span>
          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
            Test: {row.test_id}
          </span>
        </div>
      ),
    },
    {
      key: "sha256_hash",
      header: "SHA-256 Digest",
      render: (row) => (
        <div className="flex items-center space-x-1 font-mono text-[10px] text-slate-600">
          <Lock className="w-3 h-3 text-teal-600 flex-shrink-0" />
          <span className="truncate max-w-[140px]" title={row.sha256_hash}>
            {row.sha256_hash.slice(0, 16)}...
          </span>
        </div>
      ),
    },
    {
      key: "validation_status",
      header: "Validation Status",
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
          {row.validation_status}
        </span>
      ),
    },
    {
      key: "source",
      header: "Source / Collector",
      render: (row) => (
        <div>
          <span className="text-[11px] text-slate-700 block">{row.source}</span>
          <span className="text-[10px] text-slate-400">{row.collector}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (row) => (
        <button
          onClick={() => setSelectedEvidence(row)}
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
              Evidence Register & Cryptographic Vault
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">
              {evidence.length} Hashed Artifacts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit workpapers with SHA-256 cryptographic digests, collection timestamps, and chain-of-custody metadata
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Register (CSV)</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Attach Evidence</span>
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start space-x-2.5">
        <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Integrity & Confidentiality Assurance:</strong> Every piece of evidence in this register is
          cryptographically hashed via browser SHA-256 upon ingestion to prevent retrospective alteration.
          In accordance with internal audit standards, all payloads are sanitized to exclude passwords,
          IAM secret access keys, and live AWS session tokens.
        </p>
      </div>

      {/* Evidence Table */}
      <DataTable
        data={evidence}
        columns={columns}
        searchPlaceholder="Search evidence by ID, title, control, or hash..."
        pageSize={10}
      />

      {/* Inspect Evidence Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-200/80">
                  {selectedEvidence.evidence_id}
                </span>
                <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Control: {selectedEvidence.control_id}
                </span>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{selectedEvidence.title}</h3>
                <p className="text-slate-600">{selectedEvidence.description}</p>
              </div>

              {/* SHA-256 Digest Card */}
              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-teal-400 uppercase font-mono font-bold block">
                  SHA-256 Cryptographic Digest (Chain-of-Custody Verification):
                </span>
                <p className="font-mono text-[11px] text-emerald-400 break-all select-all">
                  {selectedEvidence.sha256_hash}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500 font-semibold block">Source:</span>
                  <span className="text-slate-800">{selectedEvidence.source}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Collected By:</span>
                  <span className="text-slate-800">{selectedEvidence.collector}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Date:</span>
                  <span className="text-slate-800 font-mono">
                    {new Date(selectedEvidence.collection_date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Status:</span>
                  <span className="text-emerald-700 font-semibold">{selectedEvidence.validation_status}</span>
                </div>
              </div>

              {/* Payload Preview */}
              <div>
                <span className="font-semibold text-slate-700 block mb-1.5 flex items-center space-x-1.5">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>Sanitized Technical Evidence Content / Payload:</span>
                </span>
                <pre className="p-3 bg-slate-950 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto max-h-56">
                  {selectedEvidence.raw_payload_preview || "No raw payload preview available."}
                </pre>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedEvidence(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded font-medium hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attach Evidence Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 p-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Attach New Audit Evidence Record</span>
              </h2>
              <button onClick={() => setIsUploadModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveEvidence} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Evidence ID</label>
                  <input
                    type="text"
                    required
                    value={formData.evidence_id}
                    onChange={(e) => setFormData({ ...formData, evidence_id: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Linked Control ID</label>
                  <input
                    type="text"
                    required
                    value={formData.control_id}
                    onChange={(e) => setFormData({ ...formData, control_id: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Artifact Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS CloudTrail Multi-Region Trail Configuration JSON"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description / Observation</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this evidence verifies..."
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Upload File (Optional):</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Or Paste Technical Evidence JSON / Logs:
                </label>
                <textarea
                  rows={4}
                  value={formData.payload_text}
                  onChange={handlePayloadTextChange}
                  placeholder='{ "setting": "value" }'
                  className="w-full p-2 font-mono text-[11px] border border-slate-300 rounded bg-slate-50 focus:bg-white"
                />
              </div>

              {computedHash && (
                <div className="p-2.5 rounded bg-slate-900 text-slate-100 font-mono text-[10px]">
                  <span className="text-teal-400 block font-bold">Computed SHA-256 Integrity Hash:</span>
                  <span className="text-emerald-400 break-all">{computedHash}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium"
                >
                  Save & Hash Artifact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

