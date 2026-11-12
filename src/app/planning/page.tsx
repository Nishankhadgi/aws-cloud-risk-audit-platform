"use client";

import React, { useState } from "react";
import {
  CalendarCheck,
  Edit3,
  Save,
  Shield,
  Layers,
  Users,
  CheckCircle,
  FileText,
  AlertCircle,
  Download,
  Check,
} from "lucide-react";
import { useAudit } from "@/context/AuditContext";
import { exportToJSON } from "@/utils/exportUtils";

export default function AuditPlanningPage() {
  const { charter, updateCharter } = useAudit();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(charter);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    updateCharter(formData);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportCharter = () => {
    exportToJSON(charter, "Northstar_Claims_Audit_Charter_FY26");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              Audit Planning & Engagement Charter
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Approved
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal Technology Audit Engagement Charter: {charter.organization_name}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCharter}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Charter</span>
          </button>

          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Planning Document</span>
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Audit Planning Charter successfully updated and persisted to local state.</span>
        </div>
      )}

      {/* Engagement Overview Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>1. Engagement Overview & Audit Scope Period</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="font-semibold text-slate-500 block mb-1">Target Organization</span>
            {isEditing ? (
              <input
                type="text"
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            ) : (
              <p className="font-medium text-slate-800">{charter.organization_name}</p>
            )}
          </div>
          <div>
            <span className="font-semibold text-slate-500 block mb-1">Audit Engagement Title</span>
            {isEditing ? (
              <input
                type="text"
                value={formData.engagement_name}
                onChange={(e) => setFormData({ ...formData, engagement_name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            ) : (
              <p className="font-medium text-slate-800">{charter.engagement_name}</p>
            )}
          </div>
          <div>
            <span className="font-semibold text-slate-500 block mb-1">Audit Period</span>
            {isEditing ? (
              <input
                type="text"
                value={formData.audit_period}
                onChange={(e) => setFormData({ ...formData, audit_period: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            ) : (
              <p className="font-medium text-slate-800">{charter.audit_period}</p>
            )}
          </div>
        </div>
      </div>

      {/* Shared Responsibility Architecture Banner */}
      <div className="bg-slate-900 text-slate-100 rounded-lg p-5 border border-slate-800">
        <div className="flex items-center space-x-2 mb-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">
            AWS Shared Responsibility Model Audit Delineation
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Under the AWS Shared Responsibility Model, the scope of this internal audit is strictly focused
          on <strong>Security IN the Cloud</strong> (customer responsibilities: IAM access governance, KMS
          key policies, S3 bucket permissions, database encryption, logging configurations, and DR restore testing).
          AWS remains responsible for <strong>Security OF the Cloud</strong> (underlying physical facilities, host
          hardware, hypervisor virtualization, and data center perimeter security), which is validated via independent
          third-party AWS SOC 2 Type II reports.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
            <span className="text-teal-400 font-bold block mb-1.5">
              ✓ Customer Responsibility (In-Scope for Northstar):
            </span>
            <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
              <li>IAM role scoping and multi-factor authentication (MFA)</li>
              <li>Customer-managed key (CMK) rotation and KMS policies</li>
              <li>Amazon S3 Public Access Block & Object Lock retention</li>
              <li>VPC Security Group ingress rules and network isolation</li>
              <li>Continuous CloudTrail logging and GuardDuty monitoring</li>
              <li>Annual disaster recovery database restore verification</li>
            </ul>
          </div>
          <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
            <span className="text-blue-400 font-bold block mb-1.5">
              ℹ AWS Responsibility (Inherited & Governed via SOC 2):
            </span>
            <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
              <li>Physical security of AWS data centers and power redundancies</li>
              <li>Hypervisor patching, host microcode, and rack server maintenance</li>
              <li>Underlying global AWS fiber network backbone infrastructure</li>
              <li>S3 underlying disk drive shredding and hardware decommissioning</li>
              <li>KMS Hardware Security Module (HSM) FIPS 140-3 Level 3 compliance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Audit Objectives & Methodology */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>2. Audit Objectives</span>
          </h2>
          <ul className="space-y-2 text-xs text-slate-700">
            {charter.audit_objectives.map((obj, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="font-semibold text-blue-600 font-mono mt-0.5">{i + 1}.</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-purple-600" />
            <span>3. Audit Methodology & Professional Standards</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            {charter.methodology}
          </p>
          <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700 block mb-1">Risk Approach:</span>
            <p className="text-slate-600">{charter.risk_approach}</p>
          </div>
        </div>
      </div>

      {/* Scope Definition & AWS Accounts */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>4. In-Scope AWS Services, Accounts, & Regions</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="font-semibold text-slate-700 block mb-1.5">AWS Accounts In-Scope:</span>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              {charter.audit_scope.accounts_in_scope.map((acc, i) => (
                <li key={i} className="font-mono text-[11px]">{acc}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-semibold text-slate-700 block mb-1.5">AWS Regions In-Scope:</span>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              {charter.audit_scope.regions_in_scope.map((reg, i) => (
                <li key={i} className="font-mono text-[11px]">{reg}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-semibold text-slate-700 block mb-1.5">Out of Scope:</span>
            <ul className="space-y-1 text-slate-500 list-disc list-inside text-[11px]">
              {charter.audit_scope.out_of_scope.map((out, i) => (
                <li key={i}>{out}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="font-semibold text-slate-700 block mb-1.5 text-xs">Services In-Scope:</span>
          <div className="flex flex-wrap gap-1.5">
            {charter.audit_scope.services_in_scope.map((svc, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]"
              >
                {svc}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stakeholder Register */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span>5. Key Stakeholder Register</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                <th className="pb-2">Stakeholder Name</th>
                <th className="pb-2">Corporate Title</th>
                <th className="pb-2">Audit Engagement Role</th>
                <th className="pb-2">Department</th>
                <th className="pb-2">Contact Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {charter.stakeholders.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2.5 font-semibold text-slate-900">{s.name}</td>
                  <td className="py-2.5 text-slate-600">{s.title}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium text-[11px]">
                      {s.role}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-600">{s.department}</td>
                  <td className="py-2.5 font-mono text-[11px] text-slate-500">{s.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assumptions and Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-2">Audit Assumptions</h2>
          <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
            {charter.assumptions.map((ass, i) => (
              <li key={i}>{ass}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-2 text-amber-900 flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Audit Limitations & Scope Constraints</span>
          </h2>
          <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
            {charter.limitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

