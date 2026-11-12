"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AuditControl,
  AuditTest,
  EvidenceRecord,
  RiskItem,
  AuditFinding,
  RemediationAction,
  AWSAsset,
  AuditCharter,
  ControlStatus,
  SeverityLevel,
} from "@/types/audit";
import {
  initialControls,
  initialTests,
  initialEvidence,
  initialRisks,
  initialFindings,
  initialRemediations,
  initialAssets,
} from "@/data/initialData";
import { initialAuditCharter } from "@/data/charterData";

interface AuditStats {
  totalControls: number;
  passedControls: number;
  failedControls: number;
  partialControls: number;
  untestedControls: number;
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  openRemediations: number;
  inProgressRemediations: number;
  closedRemediations: number;
  overdueRemediations: number;
  totalRisks: number;
  averageRiskScore: number;
}

interface AuditContextType {
  controls: AuditControl[];
  tests: AuditTest[];
  evidence: EvidenceRecord[];
  risks: RiskItem[];
  findings: AuditFinding[];
  remediations: RemediationAction[];
  assets: AWSAsset[];
  charter: AuditCharter;
  isSampleMode: boolean;
  dataSourceInfo: {
    source: string;
    timestamp: string;
    account: string;
  };
  stats: AuditStats;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  // Mutations
  updateControl: (control_id: string, updates: Partial<AuditControl>) => void;
  addControl: (control: AuditControl) => void;
  updateTest: (test_id: string, updates: Partial<AuditTest>) => void;
  addTest: (test: AuditTest) => void;
  addEvidence: (record: EvidenceRecord) => void;
  updateEvidence: (evidence_id: string, updates: Partial<EvidenceRecord>) => void;
  deleteEvidence: (evidence_id: string) => void;
  addRisk: (risk: RiskItem) => void;
  updateRisk: (risk_id: string, updates: Partial<RiskItem>) => void;
  addFinding: (finding: AuditFinding) => void;
  updateFinding: (finding_id: string, updates: Partial<AuditFinding>) => void;
  addRemediation: (action: RemediationAction) => void;
  updateRemediation: (action_id: string, updates: Partial<RemediationAction>) => void;
  updateCharter: (charter: AuditCharter) => void;
  addAsset: (asset: AWSAsset) => void;
  updateAsset: (resource_id: string, updates: Partial<AWSAsset>) => void;
  resetToSampleData: () => void;
  importAuditJSON: (payload: any) => boolean;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const STORAGE_KEY = "northstar_claims_audit_state_v1";

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [controls, setControls] = useState<AuditControl[]>(initialControls);
  const [tests, setTests] = useState<AuditTest[]>(initialTests);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>(initialEvidence);
  const [risks, setRisks] = useState<RiskItem[]>(initialRisks);
  const [findings, setFindings] = useState<AuditFinding[]>(initialFindings);
  const [remediations, setRemediations] = useState<RemediationAction[]>(initialRemediations);
  const [assets, setAssets] = useState<AWSAsset[]>(initialAssets);
  const [charter, setCharter] = useState<AuditCharter>(initialAuditCharter);
  const [isSampleMode, setIsSampleMode] = useState<boolean>(true);
  const [dataSourceInfo, setDataSourceInfo] = useState({
    source: "Simulated Built-In Fixtures",
    timestamp: "2026-11-12T10:00:00Z",
    account: "112233445566 (Northstar Prod)",
  });
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.controls) setControls(parsed.controls);
        if (parsed.tests) setTests(parsed.tests);
        if (parsed.evidence) setEvidence(parsed.evidence);
        if (parsed.risks) setRisks(parsed.risks);
        if (parsed.findings) setFindings(parsed.findings);
        if (parsed.remediations) setRemediations(parsed.remediations);
        if (parsed.assets) setAssets(parsed.assets);
        if (parsed.charter) setCharter(parsed.charter);
        if (typeof parsed.isSampleMode === "boolean") setIsSampleMode(parsed.isSampleMode);
        if (parsed.dataSourceInfo) setDataSourceInfo(parsed.dataSourceInfo);
      }
    } catch (e) {
      console.error("Failed to load audit state from localStorage", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to LocalStorage on update
  useEffect(() => {
    if (!isInitialized) return;
    try {
      const stateToSave = {
        controls,
        tests,
        evidence,
        risks,
        findings,
        remediations,
        assets,
        charter,
        isSampleMode,
        dataSourceInfo,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error("Failed to persist audit state to localStorage", e);
    }
  }, [
    controls,
    tests,
    evidence,
    risks,
    findings,
    remediations,
    assets,
    charter,
    isSampleMode,
    dataSourceInfo,
    isInitialized,
  ]);

  // Derived statistics
  const stats: AuditStats = {
    totalControls: controls.length,
    passedControls: controls.filter((c) => c.status === "PASS").length,
    failedControls: controls.filter((c) => c.status === "FAIL").length,
    partialControls: controls.filter((c) => c.status === "PARTIAL").length,
    untestedControls: controls.filter((c) => c.status === "NOT_TESTED" || c.status === "NOT_APPLICABLE").length,
    totalFindings: findings.length,
    criticalFindings: findings.filter((f) => f.severity === "CRITICAL").length,
    highFindings: findings.filter((f) => f.severity === "HIGH").length,
    mediumFindings: findings.filter((f) => f.severity === "MEDIUM").length,
    lowFindings: findings.filter((f) => f.severity === "LOW").length,
    openRemediations: remediations.filter((r) => r.status === "OPEN" || r.status === "ASSIGNED").length,
    inProgressRemediations: remediations.filter((r) => r.status === "IN_PROGRESS" || r.status === "PENDING_VALIDATION").length,
    closedRemediations: remediations.filter((r) => r.status === "CLOSED").length,
    overdueRemediations: remediations.filter((r) => {
      if (r.status === "CLOSED" || r.status === "RISK_ACCEPTED") return false;
      return new Date(r.planned_completion_date) < new Date("2026-11-12");
    }).length,
    totalRisks: risks.length,
    averageRiskScore: risks.length ? Math.round((risks.reduce((acc, r) => acc + r.inherent_score, 0) / risks.length) * 10) / 10 : 0,
  };

  const updateControl = (control_id: string, updates: Partial<AuditControl>) => {
    setControls((prev) =>
      prev.map((c) => (c.control_id === control_id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c))
    );
  };

  const addControl = (control: AuditControl) => {
    setControls((prev) => [control, ...prev]);
  };

  const updateTest = (test_id: string, updates: Partial<AuditTest>) => {
    setTests((prev) =>
      prev.map((t) => (t.test_id === test_id ? { ...t, ...updates } : t))
    );
  };

  const addTest = (test: AuditTest) => {
    setTests((prev) => [test, ...prev]);
  };

  const addEvidence = (record: EvidenceRecord) => {
    setEvidence((prev) => [record, ...prev]);
  };

  const updateEvidence = (evidence_id: string, updates: Partial<EvidenceRecord>) => {
    setEvidence((prev) =>
      prev.map((e) => (e.evidence_id === evidence_id ? { ...e, ...updates } : e))
    );
  };

  const deleteEvidence = (evidence_id: string) => {
    setEvidence((prev) => prev.filter((e) => e.evidence_id !== evidence_id));
  };

  const addRisk = (risk: RiskItem) => {
    setRisks((prev) => [risk, ...prev]);
  };

  const updateRisk = (risk_id: string, updates: Partial<RiskItem>) => {
    setRisks((prev) =>
      prev.map((r) => (r.risk_id === risk_id ? { ...r, ...updates } : r))
    );
  };

  const addFinding = (finding: AuditFinding) => {
    setFindings((prev) => [finding, ...prev]);
  };

  const updateFinding = (finding_id: string, updates: Partial<AuditFinding>) => {
    setFindings((prev) =>
      prev.map((f) => (f.finding_id === finding_id ? { ...f, ...updates } : f))
    );
  };

  const addRemediation = (action: RemediationAction) => {
    setRemediations((prev) => [action, ...prev]);
  };

  const updateRemediation = (action_id: string, updates: Partial<RemediationAction>) => {
    setRemediations((prev) =>
      prev.map((r) => (r.action_id === action_id ? { ...r, ...updates } : r))
    );
  };

  const updateCharter = (newCharter: AuditCharter) => {
    setCharter(newCharter);
  };

  const addAsset = (asset: AWSAsset) => {
    setAssets((prev) => [asset, ...prev]);
  };

  const updateAsset = (resource_id: string, updates: Partial<AWSAsset>) => {
    setAssets((prev) =>
      prev.map((a) => (a.resource_id === resource_id ? { ...a, ...updates } : a))
    );
  };

  const resetToSampleData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setControls(initialControls);
    setTests(initialTests);
    setEvidence(initialEvidence);
    setRisks(initialRisks);
    setFindings(initialFindings);
    setRemediations(initialRemediations);
    setAssets(initialAssets);
    setCharter(initialAuditCharter);
    setIsSampleMode(true);
    setDataSourceInfo({
      source: "Simulated Built-In Fixtures",
      timestamp: new Date().toISOString(),
      account: "112233445566 (Northstar Prod)",
    });
  };

  const importAuditJSON = (payload: any): boolean => {
    try {
      if (!payload || !payload.results || !Array.isArray(payload.results)) {
        return false;
      }

      const meta = payload.metadata || {};
      setIsSampleMode(Boolean(meta.is_sample_mode));
      setDataSourceInfo({
        source: meta.is_sample_mode ? "Imported Python Sample Scan" : "Live Boto3 Read-Only Scan",
        timestamp: meta.scan_timestamp || new Date().toISOString(),
        account: `${meta.aws_account_id || "112233445566"} (${meta.organization || "Northstar"})`,
      });

      // Map imported results to controls
      const updatedControls = [...controls];
      for (const res of payload.results) {
        const cIndex = updatedControls.findIndex((c) => c.control_id === res.control_id);
        if (cIndex !== -1) {
          updatedControls[cIndex] = {
            ...updatedControls[cIndex],
            status: res.status as ControlStatus,
            auditor_conclusion: `Automated assessment: ${res.title}. ${res.description}`,
            testing_notes: `Collected via ${res.resource_type} (${res.aws_region}).`,
            updated_at: res.evidence_timestamp || new Date().toISOString(),
          };
        }
      }
      setControls(updatedControls);

      // Merge imported evidence if present
      if (Array.isArray(payload.evidence_register) && payload.evidence_register.length > 0) {
        const importedEv: EvidenceRecord[] = payload.evidence_register.map((ev: any) => ({
          evidence_id: ev.evidence_id,
          title: ev.title,
          control_id: ev.control_id,
          test_id: ev.test_id,
          source: ev.source,
          collector: ev.collector,
          collection_date: ev.collection_date,
          sha256_hash: ev.sha256_hash,
          is_confidential: ev.is_confidential ?? true,
          is_sanitized: ev.is_sanitized ?? true,
          validation_status: "VALIDATED",
          description: `Imported technical artifact for ${ev.test_id}. Hash verified.`,
          raw_payload_preview: JSON.stringify(ev.raw_payload),
        }));

        // Deduplicate
        const evMap = new Map<string, EvidenceRecord>();
        [...importedEv, ...evidence].forEach((item) => evMap.set(item.evidence_id, item));
        setEvidence(Array.from(evMap.values()));
      }

      return true;
    } catch (e) {
      console.error("Failed to import JSON audit package", e);
      return false;
    }
  };

  return (
    <AuditContext.Provider
      value={{
        controls,
        tests,
        evidence,
        risks,
        findings,
        remediations,
        assets,
        charter,
        isSampleMode,
        dataSourceInfo,
        stats,
        globalSearchQuery,
        setGlobalSearchQuery,
        updateControl,
        addControl,
        updateTest,
        addTest,
        addEvidence,
        updateEvidence,
        deleteEvidence,
        addRisk,
        updateRisk,
        addFinding,
        updateFinding,
        addRemediation,
        updateRemediation,
        updateCharter,
        addAsset,
        updateAsset,
        resetToSampleData,
        importAuditJSON,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error("useAudit must be used within an AuditProvider");
  }
  return context;
}

