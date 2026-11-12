"use client";

import React, { useState, useMemo } from "react";
import {
  Network,
  Download,
  Filter,
  Shield,
  ExternalLink,
  BookOpen,
  Info,
} from "lucide-react";
import DataTable, { Column } from "@/components/shared/DataTable";
import DomainBadge from "@/components/shared/DomainBadge";
import { exportToCSV } from "@/utils/exportUtils";
import {
  supportedFrameworks,
  frameworkCrosswalkData,
  CrosswalkEntry,
} from "@/data/frameworksData";
import { AuditDomain } from "@/types/audit";

export default function FrameworkMappingPage() {
  const [selectedFramework, setSelectedFramework] = useState<string>("ALL");
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");

  const domains = useMemo(() => {
    const list = Array.from(new Set(frameworkCrosswalkData.map((d) => d.domain)));
    return ["ALL", ...list];
  }, []);

  const filteredEntries = useMemo(() => {
    return frameworkCrosswalkData.filter((entry) => {
      const domMatch = selectedDomain === "ALL" || entry.domain === selectedDomain;
      return domMatch;
    });
  }, [selectedDomain]);

  const handleExportCSV = () => {
    const exportData = filteredEntries.map((e) => ({
      control_id: e.control_id,
      title: e.title,
      domain: e.domain,
      nist_csf: e.nist_csf,
      nist_title: e.nist_title,
      iso_27001: e.iso_27001,
      iso_title: e.iso_title,
      cis_aws: e.cis_aws,
      cis_title: e.cis_title,
      soc_2: e.soc_2,
      soc_title: e.soc_title,
      audit_significance: e.audit_significance,
    }));
    exportToCSV(exportData, "Northstar_Framework_Crosswalk_Matrix");
  };

  const columns: Column<CrosswalkEntry>[] = [
    {
      key: "control_id",
      header: "Internal Control ID",
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900 block">
            {row.control_id}
          </span>
          <span className="text-[11px] font-medium text-slate-700">{row.title}</span>
        </div>
      ),
    },
    {
      key: "domain",
      header: "Audit Domain",
      render: (row) => <DomainBadge domain={row.domain as AuditDomain} />,
    },
    {
      key: "nist_csf",
      header: "NIST CSF 2.0",
      render: (row) => (
        <div>
          <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {row.nist_csf}
          </span>
          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{row.nist_title}</p>
        </div>
      ),
    },
    {
      key: "iso_27001",
      header: "ISO/IEC 27001:2022",
      render: (row) => (
        <div>
          <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            {row.iso_27001}
          </span>
          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{row.iso_title}</p>
        </div>
      ),
    },
    {
      key: "cis_aws",
      header: "CIS AWS v3.0",
      render: (row) => (
        <div>
          <span className="font-mono text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            {row.cis_aws}
          </span>
          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{row.cis_title}</p>
        </div>
      ),
    },
    {
      key: "soc_2",
      header: "AICPA SOC 2 (2022)",
      render: (row) => (
        <div>
          <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            {row.soc_2}
          </span>
          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{row.soc_title}</p>
        </div>
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
              Compliance & Security Framework Crosswalk
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              4 Authoritative Standards
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-mapping internal audit controls to NIST CSF 2.0, ISO/IEC 27001:2022, CIS AWS Foundations v3.0, and SOC 2
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-300 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Crosswalk (CSV)</span>
        </button>
      </div>

      {/* Professional Auditor Disclaimer Banner */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Auditor Professional Standard Notice:</strong> This framework mapping is an illustrative
          audit crosswalk designed for internal gap analysis and control alignment. Passing automated technical
          scanner checks does <em>not</em> constitute an official third-party ISO 27001 certification, SOC 2 Type II
          attestation, or regulatory clearance. Formal opinions require independent accredited examination.
        </p>
      </div>

      {/* Framework Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {supportedFrameworks.map((fw) => (
          <div
            key={fw.framework_id}
            className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">{fw.name}</span>
              <span className="font-mono text-[10px] text-blue-600 font-semibold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                {fw.version}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{fw.description}</p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>{fw.authoritative_body}</span>
              <span className="font-semibold text-slate-700">{fw.mapping_count} Mappings</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Domain:</span>
          </div>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="p-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white"
          >
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-400 text-[11px]">
          Showing {filteredEntries.length} crosswalk entries
        </span>
      </div>

      {/* Crosswalk Table */}
      <DataTable
        data={filteredEntries}
        columns={columns}
        searchPlaceholder="Search by internal ID, title, CIS reference, NIST, or SOC 2..."
        pageSize={10}
      />
    </div>
  );
}

