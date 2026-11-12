export type ControlStatus =
  | "PASS"
  | "FAIL"
  | "PARTIAL"
  | "NOT_TESTED"
  | "NOT_APPLICABLE"
  | "INCOMPLETE_EVIDENCE"
  | "ERROR";

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";

export type RemediationStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "PENDING_EVIDENCE"
  | "PENDING_VALIDATION"
  | "CLOSED"
  | "RISK_ACCEPTED";

export type AuditDomain =
  | "IAM and Access Governance"
  | "Encryption and Key Management"
  | "Data Protection"
  | "Security Logging and Monitoring"
  | "Vulnerability and Configuration Management"
  | "Change and Release Management"
  | "Business Continuity and Availability"
  | "Third-Party and Cloud Governance";

export type ControlNature = "Preventive" | "Detective" | "Corrective";
export type ControlFrequency =
  | "Continuous Automated"
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Annual"
  | "Event-Driven";

export type WorkpaperReviewStatus =
  | "DRAFT"
  | "SUBMITTED_FOR_REVIEW"
  | "REVIEW_NOTES_PENDING"
  | "MANAGER_APPROVED";

export type FindingClassification =
  | "Material Weakness"
  | "Significant Deficiency"
  | "Operational Control Deficiency"
  | "Process Improvement Observation";

export type RootCauseCategory =
  | "Governance & Policy"
  | "Process & Execution"
  | "People & Competency"
  | "Technology & Architecture"
  | "Monitoring & Oversight";

export interface FrameworkCrosswalk {
  nist_csf: string;       // NIST CSF 2.0 reference (e.g., PR.AC-01)
  iso_27001: string;      // ISO/IEC 27001:2022 Annex A (e.g., A.5.15)
  cis_aws: string;        // CIS AWS Foundations v3.0 (e.g., 1.5)
  soc_2: string;          // SOC 2 2017/2022 TSC (e.g., CC6.1)
}

export interface AuditControl {
  control_id: string;
  title: string;
  objective: string;
  domain: AuditDomain;
  control_nature: ControlNature;
  control_frequency: ControlFrequency;
  risk_description: string;
  expected_activity: string;
  test_procedure: string;
  expected_evidence: string;
  actual_evidence_ref?: string;
  framework_mapping: FrameworkCrosswalk;
  control_owner: string;
  tod_conclusion: ControlStatus; // Test of Design
  toe_conclusion: ControlStatus; // Test of Operating Effectiveness
  status: ControlStatus;        // Overall conclusion
  auditor_conclusion: string;
  testing_notes: string;
  manager_review_notes?: string;
  updated_at: string;
}

export interface IPETestingProcedure {
  source_system: string;
  extraction_query_or_api: string;
  completeness_reconciliation: string;
  accuracy_validation: string;
  verified_complete: boolean;
}

export interface SignOffMetadata {
  name: string;
  title: string;
  date: string;
}

export interface ManagerReviewSignOff extends SignOffMetadata {
  status: WorkpaperReviewStatus;
  review_notes: string;
}

export interface AuditTest {
  test_id: string;
  related_control_id: string;
  test_type: "TOD" | "TOE" | "TOD_AND_TOE";
  audit_objective: string;
  risk_addressed: string;
  population: string;
  sampling_method:
    | "100% Automated Population"
    | "Haphazard Sample"
    | "Judgmental / Risk-Based"
    | "Systematic Sample";
  sample_size: number;
  test_steps: string[];
  expected_result: string;
  actual_result: string;
  evidence_reviewed: string[];
  exceptions_identified: string;
  compensating_controls_evaluated?: string;
  ipe_testing: IPETestingProcedure;
  auditor_conclusion: ControlStatus;
  preparer_signoff: SignOffMetadata;
  manager_signoff: ManagerReviewSignOff;
  reviewer_notes: string;
  performed_by: string;
  test_date: string;
}

export interface EvidenceRecord {
  evidence_id: string;
  title: string;
  control_id: string;
  test_id: string;
  source: string;
  collector: string;
  collection_date: string;
  sha256_hash: string;
  is_confidential: boolean;
  is_sanitized: boolean;
  validation_status: "VALIDATED" | "PENDING_REVIEW" | "REJECTED";
  file_name?: string;
  file_size_bytes?: number;
  description: string;
  raw_payload_preview?: string;
}

export interface RiskItem {
  risk_id: string;
  title: string;
  risk_statement: string;
  related_service: string;
  threat: string;
  vulnerability: string;
  business_impact: string;
  likelihood: number; // 1-5
  impact: number;     // 1-5
  inherent_score: number; // likelihood * impact
  inherent_severity: SeverityLevel;
  existing_controls: string[];
  compensating_controls?: string;
  residual_score: number;
  residual_severity: SeverityLevel;
  risk_owner: string;
  proposed_mitigation: string;
  target_date: string;
  status: "ACTIVE" | "MITIGATING" | "ACCEPTED" | "CLOSED";
  rationale_for_override?: string;
}

export interface AuditFinding {
  finding_id: string;
  title: string;
  severity: SeverityLevel;
  domain: AuditDomain;
  classification: FindingClassification;
  root_cause_category: RootCauseCategory;
  // Classic 5C Structure
  condition: string;
  criteria: string;
  cause: string;
  consequence: string;
  recommendation: string;
  compensating_controls: string;
  false_positive_analysis?: string;
  evidence_refs: string[];
  framework_mapping: FrameworkCrosswalk;
  management_response: {
    action_plan: string;
    responsible_owner: string;
    target_completion_date: string;
  };
  remediation_status: RemediationStatus;
  auditor_notes: string;
  retest_result?: {
    retest_date: string;
    retest_auditor: string;
    retest_conclusion: "VERIFIED_EFFECTIVE" | "REMAINS_DEFICIENT" | "PENDING_EVALUATION";
    retest_notes: string;
  };
  is_simulated: boolean;
}

export interface RemediationAction {
  action_id: string;
  finding_id: string;
  title: string;
  recommended_action: string;
  responsible_team: string;
  remediation_owner: string;
  priority: SeverityLevel;
  status: RemediationStatus;
  planned_completion_date: string;
  actual_completion_date?: string;
  evidence_submitted?: string;
  validation_results?: string;
  residual_risk: SeverityLevel;
  closure_approver?: string;
  comments: string;
  risk_acceptance_details?: {
    approver: string;
    rationale: string;
    approval_date: string;
    review_date: string;
  };
}

export interface AWSAsset {
  resource_id: string;
  resource_name: string;
  resource_type: string;
  region: string;
  account_id: string;
  configuration_status: "COMPLIANT" | "NON_COMPLIANT" | "INVESTIGATING";
  related_control: string;
  audit_risk: SeverityLevel;
  evidence_ref: string;
  tags: Record<string, string>;
}

export interface Stakeholder {
  name: string;
  title: string;
  role: "Audit Sponsor" | "Key Contact" | "Technical Lead" | "Compliance Lead" | "DevOps Lead";
  department: string;
  email: string;
}

export interface AuditCharter {
  engagement_name: string;
  organization_name: string;
  audit_period: string;
  audit_objectives: string[];
  audit_scope: {
    services_in_scope: string[];
    accounts_in_scope: string[];
    regions_in_scope: string[];
    out_of_scope: string[];
  };
  systems_under_review: string[];
  methodology: string;
  assumptions: string[];
  limitations: string[];
  stakeholders: Stakeholder[];
  risk_approach: string;
  expected_deliverables: string[];
}
