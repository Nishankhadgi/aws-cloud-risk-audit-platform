"use client";

import React, { useState, useMemo } from "react";
import {
  Server,
  Plus,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import { useAudit } from "@/context/AuditContext";
import DataTable, { Column } from "@/components/shared/DataTable";
import SeverityBadge from "@/components/shared/SeverityBadge";
import { exportToCSV, exportToJSON } from "@/utils/exportUtils";
import { AWSAsset, SeverityLevel } from "@/types/audit";

export default function AssetInventoryPage() {
  const { assets, addAsset } = useAudit();
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New asset form state
  const [newAsset, setNewAsset] = useState<Partial<AWSAsset>>({
    resource_id: "",
    resource_name: "",
    resource_type: "AWS::S3::Bucket",
    region: "us-east-1",
    account_id: "112233445566",
    configuration_status: "COMPLIANT",
    related_control: "CTL-DATA-01",
    audit_risk: "LOW",
    evidence_ref: "EVD-DATA-001",
  });

  const resourceTypes = useMemo(() => {
    const types = new Set(assets.map((a) => a.resource_type));
    return ["ALL", ...Array.from(types)];
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const typeMatch = selectedType === "ALL" || asset.resource_type === selectedType;
      const statusMatch = selectedStatus === "ALL" || asset.configuration_status === selectedStatus;
      return typeMatch && statusMatch;
    });
  }, [assets, selectedType, selectedStatus]);

  const handleExportCSV = () => {
    exportToCSV(filteredAssets, "Northstar_AWS_Asset_Inventory");
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.resource_id || !newAsset.resource_name) return;

    addAsset({
      resource_id: newAsset.resource_id!,
      resource_name: newAsset.resource_name!,
      resource_type: newAsset.resource_type || "AWS::S3::Bucket",
      region: newAsset.region || "us-east-1",
      account_id: newAsset.account_id || "112233445566",
      configuration_status: newAsset.configuration_status as any,
      related_control: newAsset.related_control || "CTL-DATA-01",
      audit_risk: newAsset.audit_risk as SeverityLevel,
      evidence_ref: newAsset.evidence_ref || "EVD-GEN-001",
      tags: { Environment: "Production", Discovered: "Manual-Audit" },
    });
    setIsAddModalOpen(false);
  };

  const columns: Column<AWSAsset>[] = [
    {
      key: "resource_name",
      header: "Resource Name / Identifier",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.resource_name}</p>
          <p className="font-mono text-[10px] text-slate-500 break-all">{row.resource_id}</p>
        </div>
      ),
    },
    {
      key: "resource_type",
      header: "Service Type",
      render: (row) => (
        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
          {row.resource_type}
        </span>
      ),
    },
    {
      key: "region",
      header: "AWS Region",
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-600">{row.region}</span>
      ),
    },
    {
      key: "configuration_status",
      header: "Config Status",
      render: (row) => {
        const isCompliant = row.configuration_status === "COMPLIANT";
        const isNon = row.configuration_status === "NON_COMPLIANT";
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
              isCompliant
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : isNon
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {isCompliant ? (
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            ) : isNon ? (
              <XCircle className="w-3 h-3 mr-1 text-rose-600" />
            ) : (
              <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />
            )}
            {row.configuration_status}
          </span>
        );
      },
    },
    {
      key: "audit_risk",
      header: "Audit Risk",
      render: (row) => <SeverityBadge severity={row.audit_risk} size="sm" />,
    },
    {
      key: "related_control",
      header: "Related Control",
      render: (row) => (
        <span className="font-mono text-[11px] font-medium text-blue-700">
          {row.related_control}
        </span>
      ),
    },
    {
      key: "evidence_ref",
      header: "Evidence",
      render: (row) => (
        <span className="font-mono text-[10px] text-slate-500 underline decoration-slate-300">
          {row.evidence_ref}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight">
            AWS Cloud Resource Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Target Account: 112233445566 (Northstar Production Claims Workload)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center gap-3 text-xs shadow-2xs">
        <div className="flex items-center space-x-1.5 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-500">Service:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white"
          >
            {resourceTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
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
            <option value="COMPLIANT">Compliant</option>
            <option value="NON_COMPLIANT">Non-Compliant</option>
            <option value="INVESTIGATING">Investigating</option>
          </select>
        </div>

        <span className="ml-auto text-slate-400 text-[11px]">
          Showing {filteredAssets.length} of {assets.length} cloud assets
        </span>
      </div>

      {/* Assets Table */}
      <DataTable
        data={filteredAssets}
        columns={columns}
        searchPlaceholder="Filter assets by name, ARN, region, or service..."
        pageSize={12}
      />

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 border border-slate-200 text-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Register AWS Asset</h2>
            <form onSubmit={handleCreateAsset} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Resource Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. northstar-customer-uploads-bucket"
                  value={newAsset.resource_name}
                  onChange={(e) => setNewAsset({ ...newAsset, resource_name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Resource ARN / ID</label>
                <input
                  type="text"
                  required
                  placeholder="arn:aws:s3:::northstar-customer-uploads"
                  value={newAsset.resource_id}
                  onChange={(e) => setNewAsset({ ...newAsset, resource_id: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Resource Type</label>
                  <select
                    value={newAsset.resource_type}
                    onChange={(e) => setNewAsset({ ...newAsset, resource_type: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="AWS::S3::Bucket">AWS::S3::Bucket</option>
                    <option value="AWS::IAM::Role">AWS::IAM::Role</option>
                    <option value="AWS::IAM::User">AWS::IAM::User</option>
                    <option value="AWS::KMS::Key">AWS::KMS::Key</option>
                    <option value="AWS::RDS::DBInstance">AWS::RDS::DBInstance</option>
                    <option value="AWS::EC2::SecurityGroup">AWS::EC2::SecurityGroup</option>
                    <option value="AWS::CloudTrail::Trail">AWS::CloudTrail::Trail</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Region</label>
                  <select
                    value={newAsset.region}
                    onChange={(e) => setNewAsset({ ...newAsset, region: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="us-east-1">us-east-1</option>
                    <option value="us-west-2">us-west-2</option>
                    <option value="global">global</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Config Status</label>
                  <select
                    value={newAsset.configuration_status}
                    onChange={(e) => setNewAsset({ ...newAsset, configuration_status: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="COMPLIANT">COMPLIANT</option>
                    <option value="NON_COMPLIANT">NON_COMPLIANT</option>
                    <option value="INVESTIGATING">INVESTIGATING</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Audit Risk</label>
                  <select
                    value={newAsset.audit_risk}
                    onChange={(e) => setNewAsset({ ...newAsset, audit_risk: e.target.value as SeverityLevel })}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
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
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

