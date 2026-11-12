"use client";

import React, { useState } from "react";
import {
  Search,
  Upload,
  Download,
  RotateCcw,
  Bell,
  Shield,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useAudit } from "@/context/AuditContext";
import { exportToJSON } from "@/utils/exportUtils";
import ImportScanModal from "@/components/modals/ImportScanModal";

export default function TopNav() {
  const {
    isSampleMode,
    dataSourceInfo,
    globalSearchQuery,
    setGlobalSearchQuery,
    resetToSampleData,
    controls,
    findings,
    evidence,
    risks,
    remediations,
    stats,
  } = useAudit();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleExportState = () => {
    const fullState = {
      exportedAt: new Date().toISOString(),
      platform: "AWS Cloud Infrastructure Security & Technology Risk Audit Platform",
      account: dataSourceInfo.account,
      stats,
      controls,
      findings,
      evidence,
      risks,
      remediations,
    };
    exportToJSON(fullState, `northstar_audit_state_${new Date().toISOString().slice(0, 10)}`);
  };

  const confirmResetAction = () => {
    resetToSampleData();
    setShowConfirmReset(false);
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-sm flex-shrink-0">
        {/* Left Side: Brand and Engagement Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-navy-800 tracking-tight uppercase">
              AWS Infrastructure Audit Console
            </span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Shield className="w-3 h-3 mr-1 text-blue-600" />
              FY26 H2 Audit
            </span>
          </div>

          {/* Mode Pill */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${
              isSampleMode
                ? "bg-amber-100 text-amber-900 border border-amber-300"
                : "bg-teal-100 text-teal-900 border border-teal-300"
            }`}
          >
            {isSampleMode ? "Sample Mode" : "Live Mode"}
          </span>
        </div>

        {/* Center: Global Search Input */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search controls, findings, evidence (e.g. 'MFA', 'S3', 'CTL-IAM-01')..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
            />
            {globalSearchQuery && (
              <button
                onClick={() => setGlobalSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Import JSON Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors"
            title="Import scan output from tools/aws_audit or mock fixture"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Import Scan</span>
          </button>

          {/* Export JSON Button */}
          <button
            onClick={handleExportState}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors"
            title="Export complete audit state to JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export State</span>
          </button>

          {/* Reset Baseline Data Button */}
          <button
            onClick={() => setShowConfirmReset(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-300 rounded-md transition-colors"
            title="Reset audit workpapers to clean baseline sample data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Notifications Flyout Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
              title="Audit Notifications"
            >
              <Bell className="w-4 h-4" />
              {stats.criticalFindings > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-100 font-semibold text-slate-800 flex items-center justify-between">
                  <span>Audit Alerts & Notifications</span>
                  <span className="text-[10px] text-slate-400 font-normal">Active Alerts</span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  <div className="px-3 py-2 hover:bg-slate-50 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Critical Exception Logged</p>
                      <p className="text-slate-500 text-[11px]">
                        CI/CD deployment role has AdministratorAccess wildcard policy attached.
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-2 hover:bg-slate-50 flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Remediation Retest Verified</p>
                      <p className="text-slate-500 text-[11px]">
                        KMS CMK annual automated rotation enabled & verified.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Import Modal */}
      {isImportModalOpen && (
        <ImportScanModal onClose={() => setIsImportModalOpen(false)} />
      )}

      {/* Confirmation Dialog for Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 border border-slate-200">
            <div className="flex items-center space-x-3 text-rose-600 mb-3">
              <RotateCcw className="w-5 h-5" />
              <h3 className="text-sm font-semibold text-slate-900">Reset Audit Workspace?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              This will restore all controls, workpapers, evidence, risks, and findings to the original
              Northstar Claims Technologies baseline. Any edits made in browser session will be reset.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetAction}
                className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

