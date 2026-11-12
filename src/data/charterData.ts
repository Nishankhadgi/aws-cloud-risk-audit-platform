import { AuditCharter } from "@/types/audit";

export const initialAuditCharter: AuditCharter = {
  engagement_name: "AWS Cloud Infrastructure Security & Technology Risk Audit",
  organization_name: "Northstar Claims Technologies",
  audit_period: "July 1, 2026 – October 31, 2026 (FY26 H2 Evaluation)",
  audit_objectives: [
    "Assess AWS cloud infrastructure configuration against CIS AWS Foundations Benchmark v3.0 and NIST CSF 2.0 standards.",
    "Evaluate identity governance, privileged IAM role assignments, least privilege enforcement, and Multi-Factor Authentication (MFA).",
    "Review cryptographic protection of sensitive customer health and claims data at rest and in transit across Amazon S3, AWS KMS, and RDS.",
    "Examine security logging, monitoring, and threat detection posture across AWS CloudTrail, Amazon GuardDuty, AWS Config, and Security Hub.",
    "Evaluate cloud change management, infrastructure-as-code (IaC) pipelines, and deployment guardrails.",
    "Assess operational resilience, backup redundancy, cross-region replication, and manual disaster recovery testing evidence."
  ],
  audit_scope: {
    services_in_scope: [
      "AWS IAM (Identity and Access Management)",
      "Amazon S3 (Simple Storage Service)",
      "AWS KMS (Key Management Service)",
      "Amazon EC2 & VPC Security Groups",
      "Amazon RDS (Relational Database Service - PostgreSQL)",
      "AWS CloudTrail",
      "AWS Config",
      "AWS Security Hub",
      "Amazon GuardDuty",
      "Amazon CloudWatch Logs & Alarms",
      "AWS Backup",
      "GitHub Actions & AWS OIDC Deployment Roles"
    ],
    accounts_in_scope: [
      "112233445566 (Northstar Production Claims Workload Account)",
      "998877665544 (Northstar Centralized Security & Audit Logging Vault)"
    ],
    regions_in_scope: [
      "us-east-1 (Primary Production)",
      "us-west-2 (Secondary Disaster Recovery)"
    ],
    out_of_scope: [
      "AWS physical data center facilities and hardware (governed under AWS SOC 2 Type II / Shared Responsibility Model)",
      "Third-party SaaS integrations not directly interacting with AWS APIs",
      "Application source code penetration testing (addressed under separate Application Security engagement)"
    ]
  },
  systems_under_review: [
    "Northstar Claims Intake & Processing Engine (Microservices architecture)",
    "Claims Document Storage Vault (Amazon S3 Multi-Tiered Archive)",
    "Claims Core Transactional Database (Amazon RDS PostgreSQL Multi-AZ Cluster)",
    "CI/CD Pipeline Deployment Automation (GitHub Actions via AWS IAM OIDC Federation)"
  ],
  methodology: "Risk-based internal audit methodology aligned with the IIA International Standards for the Professional Practice of Internal Auditing, ISACA IT Audit Standards, and the AWS Well-Architected Framework (Security & Reliability Pillars). Testing leverages automated configuration inspection, audit sampling of privileged identities, manual inspection of DR drill records, and cryptographic workpaper verification.",
  assumptions: [
    "AWS operates and secures the underlying cloud infrastructure (hypervisors, physical host facilities, data center networking) in accordance with published AWS SOC reports.",
    "Audit evidence obtained via read-only AWS APIs accurately reflects live production system state as of the collection timestamp.",
    "Management has provided complete rosters of authorized system administrators and privileged deployment pipelines."
  ],
  limitations: [
    "Certain operational controls (such as manual disaster recovery restores and incident response tabletop drills) cannot be validated solely via technical API scans and require inspectional testing of documented workpapers.",
    "Testing was conducted without disruptive or invasive penetration testing tools to preserve claims processing availability.",
    "Audit conclusions reflect environment posture during the testing window and may not capture unmonitored changes deployed subsequent to testing."
  ],
  stakeholders: [
    {
      name: "Evelyn Vance",
      title: "Chief Information Security Officer (CISO)",
      role: "Audit Sponsor",
      department: "Information Security & Compliance",
      email: "e.vance@northstarclaims.example.com"
    },
    {
      name: "Marcus Chen",
      title: "VP of Cloud Engineering & Infrastructure",
      role: "Key Contact",
      department: "Cloud Operations",
      email: "m.chen@northstarclaims.example.com"
    },
    {
      name: "Sarah Jenkins",
      title: "Lead Cloud Architect (AWS)",
      role: "Technical Lead",
      department: "Cloud Architecture",
      email: "s.jenkins@northstarclaims.example.com"
    },
    {
      name: "David Ross",
      title: "Director of Internal Audit & Technology Risk",
      role: "Audit Sponsor",
      department: "Internal Audit",
      email: "d.ross@northstarclaims.example.com"
    },
    {
      name: "Devon Reed",
      title: "Lead DevOps & Platform Engineer",
      role: "DevOps Lead",
      department: "Infrastructure Engineering",
      email: "d.reed@northstarclaims.example.com"
    }
  ],
  risk_approach: "Comprehensive 5x5 Likelihood and Business Impact scoring model. Risks are evaluated based on financial loss, regulatory exposure (HIPAA, GLBA, State Insurance Commissioner mandates), operational disruption, and reputational injury. Technical scanner findings are cross-referenced with compensatory controls to determine actual business risk.",
  expected_deliverables: [
    "Audit Charter & Approved Engagement Scope Document",
    "Detailed Audit Control Matrix with Testing Conclusions across 8 domains",
    "Cryptographic Evidence Register with SHA-256 Hashes",
    "Audit Workpapers documenting testing steps, populations, and sampling rationale",
    "Audit Findings Register structured according to Condition, Criteria, Cause, Consequence, and Recommendation (5C Model)",
    "Remediation Tracker with assigned owners, SLAs, and retest verification statuses",
    "Comprehensive Executive Audit Report for the Audit Committee and Executive Leadership"
  ]
};

