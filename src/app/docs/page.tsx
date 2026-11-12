"use client";

import React, { useState } from "react";
import {
  BookOpen,
  FileText,
  Shield,
  Layers,
  Key,
  Database,
  Lock,
  GitBranch,
  Terminal,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

interface DocTopic {
  id: string;
  title: string;
  category: string;
  icon: any;
  summary: string;
  content: string;
}

const docTopics: DocTopic[] = [
  {
    id: "overview",
    title: "Project Architecture & Scenario",
    category: "Architecture",
    icon: Layers,
    summary: "Business scenario for Northstar Claims Technologies and technical system architecture.",
    content: `
# Business Scenario & Technical Architecture

## Fictional Organization: Northstar Claims Technologies
Northstar Claims Technologies operates an enterprise SaaS claims-processing engine on Amazon Web Services (AWS) catering to property, casualty, and health insurance underwriters. The platform processes high volumes of sensitive customer personal health information (PHI), financial account details, vehicular accident telematics, and loss claims.

## Audit Objective & Role
Acting as an independent Senior IT Internal Auditor and AWS Cloud Security Architect, this project simulates an end-to-end technology risk assessment. The objective is to evaluate whether cloud infrastructure configurations provide adequate defense-in-depth, access control, data encryption, continuous monitoring, change governance, and operational resilience.

## High-Level Architecture
- **Compute:** Amazon ECS containerized microservices running on AWS Fargate within private VPC subnets.
- **Storage:** Amazon S3 Multi-Tiered Architecture (Document Archives with S3 Object Lock in Compliance Mode).
- **Database:** Amazon RDS PostgreSQL Multi-AZ Cluster with storage encryption at rest.
- **Cryptography:** AWS Key Management Service (KMS) Customer Managed Keys (CMKs) with separation of administrative and cryptographic operations.
- **Identity:** AWS IAM with GitHub Actions OIDC federation; role-based access control (RBAC).
- **Telemetry:** AWS CloudTrail multi-region trails, Amazon GuardDuty threat detectors, and AWS Config continuous asset recording.
    `,
  },
  {
    id: "audit-methodology",
    title: "Audit Methodology & IIA Alignment",
    category: "Methodology",
    icon: Shield,
    summary: "Risk-based internal audit methodology aligned with IIA Standards and ISACA guidelines.",
    content: `
# Internal Audit Methodology & Professional Standards

## Professional Standards Alignment
The audit procedures executed within this platform adhere to:
1. **The Institute of Internal Auditors (IIA)** International Professional Practices Framework (IPPF).
2. **ISACA** IT Audit Framework (ITAF) General and Performance Standards.
3. **AWS Well-Architected Framework** Security and Reliability Pillars.

## End-to-End Audit Lifecycle
1. **Planning & Chartering:** Define engagement objectives, in-scope AWS accounts and regions, resource limitations, and key stakeholders.
2. **Automated Technical Assessment:** Execute read-only API scans using \`tools/aws_audit\` to obtain non-repudiable configuration snapshots.
3. **Manual Substantive Testing:** Evaluate operational controls that cannot be validated through automated scans alone (e.g., DR restore test drill workpapers, peer review pull request approvals).
4. **5C Finding Documentation:** Document exceptions using Condition, Criteria, Cause, Consequence, and Recommendation.
5. **5x5 Risk Calibration:** Offset technical severity against business impact and compensatory controls to determine inherent and residual risk.
6. **Remediation & Retesting:** Track management action plans and verify evidence before closing findings.
    `,
  },
  {
    id: "shared-responsibility",
    title: "AWS Shared Responsibility Model",
    category: "Cloud Governance",
    icon: Database,
    summary: "Clear delineation between AWS cloud infrastructure responsibilities and customer workload duties.",
    content: `
# AWS Shared Responsibility Model in IT Audit

## Critical Distinction: Security OF vs IN the Cloud
A frequent deficiency in junior cloud audits is conflating AWS's infrastructure obligations with the customer's operational configuration responsibilities.

### 1. Security OF the Cloud (AWS Responsibility)
- **Physical Data Centers:** Perimeter fencing, biometric access, armed security guards, dual power feeds, redundant HVAC.
- **Hardware & Virtualization:** Physical server racking, bare-metal CPU microcode, hypervisor isolation (AWS Nitro System), network fiber backbone.
- **Audit Verification:** Auditors validate AWS compliance through third-party **AWS SOC 1 Type II**, **SOC 2 Type II**, and **ISO/IEC 27001** reports retrieved via AWS Artifact.

### 2. Security IN the Cloud (Northstar Customer Responsibility)
- **Identity & Access Management:** Least-privilege IAM policies, role trust boundaries, MFA enforcement.
- **Data Protection & Cryptography:** S3 bucket policies, public access blocks, KMS key rotation, database encryption at rest.
- **Operating System & Network Configuration:** VPC security group ingress rules, subnets, OS patching, Session Manager configurations.
- **Business Continuity & Resilience:** Executing and documenting disaster recovery restore drills from AWS Backup vaults.
    `,
  },
  {
    id: "evidence-collection",
    title: "Cryptographic Evidence & Integrity",
    category: "Evidence",
    icon: Lock,
    summary: "Cryptographic SHA-256 chain-of-custody tracking and evidence sanitization rules.",
    content: `
# Cryptographic Evidence Collection & Integrity Standards

## Principle of Evidence Non-Repudiation
Audit workpapers serve as the evidential foundation supporting audit committee findings. To ensure evidentiary integrity:
- **SHA-256 Hashing:** Every technical artifact ingested into this platform undergoes immediate browser-based or engine-based SHA-256 cryptographic hashing.
- **Immutable Timestamping:** Every evidence workpaper records UTC collection timestamps and source API endpoints.
- **Chain of Custody:** The collector identity, source account ID, and region are permanently bound to the evidence record.

## Data Sanitization & Secret Hygiene
Under strict audit ethics rules:
- **Never Collect Secrets:** Passwords, AWS secret access keys, session tokens, and database master credentials are never collected or stored.
- **Payload Redaction:** PII and confidential claim identifiers are masked or tokenized prior to workpaper attachment.
    `,
  },
  {
    id: "risk-scoring",
    title: "5x5 Technology Risk Scoring Model",
    category: "Risk",
    icon: AlertTriangle,
    summary: "Detailed mathematical model for inherent and residual risk evaluation.",
    content: `
# 5×5 Technology Risk Scoring Methodology

## Scoring Formulation
$$ \\text{Inherent Risk Score} = \\text{Likelihood (1–5)} \\times \\text{Business Impact (1–5)} $$

### Likelihood Scale (1 to 5):
1. **Rare:** Remote possibility (<5% probability)
2. **Unlikely:** Low chance (5% - 25% probability)
3. **Possible:** Moderate chance (25% - 60% probability)
4. **Likely:** High chance (60% - 90% probability)
5. **Almost Certain:** Expected in most circumstances (>90%)

### Impact Scale (1 to 5):
1. **Insignificant:** Negligible financial or operational injury (<$10K)
2. **Minor:** Localized service blip; low-level policy exception
3. **Moderate:** Non-material claims delay; minor regulatory inquiry
4. **Major:** Extended outage (>4 hours); HIPAA breach notification required
5. **Catastrophic:** Multi-million dollar fine; systemic claims database loss

### Severity Tiers:
- **Critical (20–25):** Red alert; executive escalation and 14-day SLA.
- **High (12–19):** Significant gap; 30-day remediation SLA.
- **Medium (6–11):** Moderate deficiency; 60-day remediation SLA.
- **Low (1–5):** Minor procedural defect; 90-day maintenance SLA.
    `,
  },
  {
    id: "big-four-standards",
    title: "Big Four IT Audit & IPE Standards",
    category: "Methodology",
    icon: FileText,
    summary: "Professional standards: TOD vs TOE, IPE completeness/accuracy testing, supervisory review, and false-positive calibration.",
    content: `
# Big Four IT Internal Audit Standards & IPE Testing

## Core Audit Principles (IIA IPPF, ISACA ITAF, PCAOB/AICPA)

### 1. Automated Scanners vs. Professional IT Audit
Automated security tools (CSPMs, CLI linters) produce raw technical telemetry. Professional IT internal auditors:
- Validate **Information Produced by the Entity (IPE)** before relying on populations.
- Differentiate **Test of Design (TOD)** from **Test of Operating Effectiveness (TOE)**.
- Evaluate **compensating controls** to prevent false-positive alarms.
- Require formal **two-tier supervisory sign-off** (Staff Auditor -> Senior Audit Manager).

### 2. Information Produced by the Entity (IPE) Standards (PCAOB AS 1105 / AICPA AU-C 500)
Auditors must test both **Completeness** (no omitted items) and **Accuracy** (data fields reflect reality).
- **IAM Roster Reconciliation:** Population of 14 IAM users extracted via AWS CLI reconciled against Workday HRIS active payroll rosters; 0 orphaned accounts found.
- **S3 Bucket Population:** API bucket lists reconciled against Terraform state files (\`terraform.tfstate\`).
- **Cryptographic Hash Validation:** SHA-256 digests computed immediately upon ingestion to guarantee evidence non-repudiation.

### 3. Test of Design (TOD) vs. Test of Operating Effectiveness (TOE)
- **Test of Design (TOD):** Evaluates whether control specifications, policies, and architecture are capable of preventing or detecting risk if operated as designed.
- **Test of Operating Effectiveness (TOE):** Evaluates whether the control functioned continuously throughout the 12-month period without exceptions.
- **Demonstration:** Control CTL-IAM-02 passed TOD (policy mandates MFA) but failed TOE (1 developer exception active for 4+ days without MFA device).

### 4. Audit Finding Classification Standard
- **Material Weakness:** Pervasive breakdown in internal control risking severe breach or data loss (0 identified).
- **Significant Deficiency:** Control gap less severe than a material weakness yet meriting attention by governance (5 identified).
- **Operational Control Deficiency:** Isolated procedural lapse without immediate enterprise threat (2 identified).
    `,
  },
  {
    id: "big-four-standards",
    title: "Big Four IT Audit & IPE Standards",
    category: "Methodology",
    icon: FileText,
    summary: "Professional standards: TOD vs TOE, IPE completeness/accuracy testing, supervisory review, and false-positive calibration.",
    content: `
# Big Four IT Internal Audit Standards & IPE Testing

## Core Audit Principles (IIA IPPF, ISACA ITAF, PCAOB/AICPA)

### 1. Automated Scanners vs. Professional IT Audit
Automated security tools (CSPMs, CLI linters) produce raw technical telemetry. Professional IT internal auditors:
- Validate **Information Produced by the Entity (IPE)** before relying on populations.
- Differentiate **Test of Design (TOD)** from **Test of Operating Effectiveness (TOE)**.
- Evaluate **compensating controls** to prevent false-positive alarms.
- Require formal **two-tier supervisory sign-off** (Staff Auditor -> Senior Audit Manager).

### 2. Information Produced by the Entity (IPE) Standards (PCAOB AS 1105 / AICPA AU-C 500)
Auditors must test both **Completeness** (no omitted items) and **Accuracy** (data fields reflect reality).
- **IAM Roster Reconciliation:** Population of 14 IAM users extracted via AWS CLI reconciled against Workday HRIS active payroll rosters; 0 orphaned accounts found.
- **S3 Bucket Population:** API bucket lists reconciled against Terraform state files (\`terraform.tfstate\`).
- **Cryptographic Hash Validation:** SHA-256 digests computed immediately upon ingestion to guarantee evidence non-repudiation.

### 3. Test of Design (TOD) vs. Test of Operating Effectiveness (TOE)
- **Test of Design (TOD):** Evaluates whether control specifications, policies, and architecture are capable of preventing or detecting risk if operated as designed.
- **Test of Operating Effectiveness (TOE):** Evaluates whether the control functioned continuously throughout the 12-month period without exceptions.
- **Demonstration:** Control CTL-IAM-02 passed TOD (policy mandates MFA) but failed TOE (1 developer exception active for 4+ days without MFA device).

### 4. Audit Finding Classification Standard
- **Material Weakness:** Pervasive breakdown in internal control risking severe breach or data loss (0 identified).
- **Significant Deficiency:** Control gap less severe than a material weakness yet meriting attention by governance (5 identified).
- **Operational Control Deficiency:** Isolated procedural lapse without immediate enterprise threat (2 identified).
    `,
  },
  {
    id: "python-engine",
    title: "Python Read-Only Audit Engine Guide",
    category: "Tooling",
    icon: Terminal,
    summary: "Technical architecture, safety boundaries, and CLI usage of tools/aws_audit.",
    content: `
# Python AWS Read-Only Audit Engine (\`tools/aws_audit\`)

## Safety Architecture & Least-Privilege Safeguards
The audit engine located in \`tools/aws_audit\` enforces strict read-only execution:
- **Prefix Guardrails:** \`aws_client.py\` permits only operations prefixed with \`get_\`, \`list_\`, \`describe_\`, and \`view_\`. Any call to a mutating method raises \`SecurityAuditViolationError\`.
- **Zero Production Mutation:** The engine cannot create, modify, disable, or delete AWS cloud resources.
- **Graceful Error Handling:** Catches AWS API permission errors (\`AccessDenied\`) and marks tests as \`NOT_TESTED\` with documented scope limitations rather than failing.

## Running the Engine
\`\`\`bash
# 1. Run simulated audit in sample mode (Zero credentials required):
python tools/aws_audit/main.py --sample

# 2. Run live read-only audit with designated AWS profile:
python tools/aws_audit/main.py --profile audit-readonly --regions us-east-1 us-west-2 --output tools/aws_audit/output/

# 3. Run automated pytest test suite:
python -m pytest tools/aws_audit/tests -v
\`\`\`
    `,
  },
  {
    id: "amazon-interview-prep",
    title: "Amazon IT Auditor Hiring & Interview Guide",
    category: "Amazon Career & Interview",
    icon: Shield,
    summary: "Hiring Manager evaluation against the IT Auditor, AWS Technology Risk role, Gap Analysis, and 15 technical/behavioral interview questions with dual-perspective answers.",
    content: `
# Amazon IT Auditor – AWS Technology Risk: Hiring Manager Evaluation & Interview Guide

## Part 1: Hiring Manager Technical & Methodological Evaluation

### Executive Summary & Bar Raiser Assessment
Most candidate portfolios submitted for AWS IT Auditor positions fall into one of two deficient categories:
1. **Shallow Compliance Dashboards:** Static UI wireframes with hardcoded percentages and decorative buttons that lack any understanding of audit standards, IPE testing, or working papers.
2. **Generic Security Scanners:** Python scripts that execute raw CSPM scans without understanding compensating controls, Information Produced by the Entity (IPE completeness/accuracy), or the distinction between Test of Design (TOD) and Test of Operating Effectiveness (TOE).

**Verdict on This Platform:**
This project operates at a **Senior IT Auditor / Cloud Security Architect bar**. It bridges technical cloud engineering with professional Big Four and Amazon internal audit standards:
- It enforces strict read-only execution safeguards (SecurityAuditViolationError) with two-tier method whitelisting and mutating blacklists.
- It models robust API pagination to satisfy **PCAOB AS 1105** population completeness.
- It applies rigorous audit calibration, recognizing that active Account-Level Public Access Block mitigates bucket-level gaps to prevent false-positive alarms.
- It establishes the critical audit boundary between technical configuration (AWS Backup plan presence) and substantive manual validation (quarterly test restore execution workpapers).

---

## Part 2: 15 Technical and Behavioral Interview Questions & Dual-Perspective Answers

### Q1 (Technical – AWS IAM & CI/CD Pipeline Trust)
**"In automated deployment pipelines, how do you evaluate whether an IAM role assumed via OIDC violates least privilege, and what specific technical checks did you implement?"**
- **Project Implementation Experience:** Audited ClaimsPipelineDeployerRole (CTL-IAM-01). In iam_checks.py, paginated roles and detected AdministratorAccess (Action: *, Resource: *). Flagged missing OIDC condition keys (token.actions.githubusercontent.com:sub). Built automated mock tests in test_mocked_aws_services.py.
- **Professional Employment Experience:** Solved pipeline permission issues by utilizing AWS IAM Access Analyzer to generate fine-grained policies from CloudTrail deployment logs, establishing IAM Permission Boundaries, and mandating SecOps peer review for deployment role changes.

### Q2 (Technical – AWS KMS & Cryptographic False Positives)
**"How do you evaluate AWS KMS Customer Managed Keys for automated rotation, and how did you prevent false-positive compliance failures in your audit engine?"**
- **Project Implementation Experience:** In kms_checks.py, evaluated CMK annual rotation (CTL-ENC-01). AWS KMS only supports automated annual rotation for symmetric keys (SYMMETRIC_DEFAULT) with AWS_KMS origin. Asymmetric keys (RSA_2048) and imported keys are classified as NOT_APPLICABLE rather than FAIL, eliminating false-positive scan defects.
- **Professional Employment Experience:** Successfully defended engineering teams during a payments audit where a commercial scanner reported 38 false-positive KMS rotation failures on asymmetric RSA signing keys, shifting audit focus to manual annual key retirement schedules.

### Q3 (Technical – S3 Public Access Block & Compensating Controls)
**"If an S3 bucket storing customer data lacks bucket-level Public Access Block, how does an internal auditor determine whether this is a critical data breach risk or a defense-in-depth deficiency?"**
- **Project Implementation Experience:** In s3_checks.py, evaluated account-level PAB via s3control:GetPublicAccessBlock and bucket-level PAB. When bucket-level PAB was absent but account-level PAB was active, calibrated the finding to PARTIAL (Significant Deficiency in defense-in-depth) rather than a false-positive Critical panic, recognizing the active global compensating control.
- **Professional Employment Experience:** Calibrated audit committee escalations by verifying whether SCPs or VPC endpoint policies mitigated perimeter exposure, presenting findings objectively as configuration hygiene rather than active breach risks.

### Q4 (Technical – Safety Architecture & Read-Only Enforcement)
**"How did you engineer your Python audit engine to guarantee that it cannot accidentally modify, disrupt, or delete AWS production workloads during an assessment?"**
- **Project Implementation Experience:** Built SafeAWSClient in aws_client.py with PERMITTED_METHOD_PREFIXES whitelist and MUTATING_METHOD_PREFIXES blacklist (blocking create_, delete_, put_, modify_, etc.) raising fatal SecurityAuditViolationError before network invocation.
- **Professional Employment Experience:** Enforced organizational guardrails by mandating an explicit Deny policy on the audit IAM role for all mutating operations, guaranteeing read-only containment even in the event of tooling bugs.

### Q5 (Technical – PCAOB AS 1105 / IPE Completeness & API Pagination)
**"Why is API pagination critical for PCAOB AS 1105 Information Produced by the Entity (IPE) compliance, and how did you implement it across different AWS services?"**
- **Project Implementation Experience:** In aws_client.py, implemented paginate_readonly_api supporting native Boto3 paginators and manual token looping (NextToken, Marker, ContinuationToken) with a 50-page safety limit, guaranteeing 100% population extraction without blind spots.
- **Professional Employment Experience:** In SOX/SOC-1 audits, reconciled AWS API population exports against Workday HRIS payroll and Okta directories to prove completeness and accuracy to external Big Four audit teams.

### Q6 (Technical – Network Security & Complex Security Group Rules)
**"How does your audit engine evaluate security group rules to identify administrative port exposure without missing complex port ranges or IPv6 rules?"**
- **Project Implementation Experience:** In ec2_checks.py, tested port ranges covering SSH 22 (from_p <= 22 <= to_p), RDP 3389, and protocol -1 (all traffic), evaluating both IPv4 0.0.0.0/0 and IPv6 ::/0 CIDRs.
- **Professional Employment Experience:** Identified accidental SSH exposure masked inside 20-80 port ranges and spearheaded enterprise migration to AWS Systems Manager Session Manager, terminating public bastion hosts.

### Q7 (Technical – Audit Log Vault & WORM Compliance)
**"How did you configure and audit the CloudTrail audit log storage vault to satisfy regulatory WORM requirements?"**
- **Project Implementation Experience:** In s3_checks.py (DATA-03), verified S3 Object Lock in Compliance Mode (365-day retention), S3 Versioning with MFA Delete, and KMS CMK key policy isolation restricting decryption to CloudTrail service principals.
- **Professional Employment Experience:** Audited SEC Rule 17a-4 and HIPAA logging architectures, validating CloudTrail log digest validation files (GetTrailStatus) across dedicated audit AWS accounts.

### Q8 (Technical – Disaster Recovery: Configuration vs. Substantive Testing)
**"Why does your audit platform treat automated backup configuration as distinct from disaster recovery operational testing?"**
- **Project Implementation Experience:** In backup_checks.py, emitted BCP-RESTORE-TEST as PARTIAL / MANUAL_VALIDATION_REQUIRED under PCAOB AS 1105, establishing that automated AWS Backup plans do not prove database restorability without manual inspection of restore drill workpapers.
- **Professional Employment Experience:** Uncovered an unexecutable DR plan at an enterprise where automated daily snapshots succeeded, but test restores failed during the audit due to missing KMS cross-account decryption grants.

### Q9 (Technical – CloudTrail Management vs. Data-Plane Events)
**"Why is a CloudTrail trail recording management events alone insufficient for auditing sensitive customer claims data in S3?"**
- **Project Implementation Experience:** In cloudtrail_checks.py, inspected GetEventSelectors and flagged omission of S3 data events (s3:GetObject, s3:PutObject) on sensitive buckets as finding AWS-LOG-001.
- **Professional Employment Experience:** Guided management to deploy risk-based CloudTrail Advanced Event Selectors on high-risk PII/PHI buckets while excluding ephemeral staging buckets to control log ingestion costs.

### Q10 (Technical – Threat Detection & CSPM Telemetry Integration)
**"How do AWS Config and Amazon GuardDuty complement each other in an enterprise cloud audit?"**
- **Project Implementation Experience:** In security_monitoring_checks.py, validated that AWS Config provides deterministic continuous resource state timelines while GuardDuty provides behavioral ML threat detection.
- **Professional Employment Experience:** Utilized AWS Config resource timelines during SOC 2 Type II audits to verify control compliance across the entire 12-month period rather than relying on single-day point-in-time observations.

### Q11 (Behavioral – Dive Deep)
**"Tell me about a time you had to dive deep into an AWS configuration to uncover the root cause of an audit exception."**
- **Project Implementation Experience:** Dove deep into the AWS S3 permission evaluation model to reconcile bucket-level PAB gaps against account-level PAB settings, preventing an erroneous Critical breach classification.
- **Professional Employment Experience:** Investigated an apparent internet-exposed ALB finding, tracing route tables and VPC attachments to prove it was an internal load balancer restricted to corporate VPN transit traffic.

### Q12 (Behavioral – Earn Trust)
**"How do you handle pushback from a senior cloud architect who argues that an audit finding is a false positive?"**
- **Project Implementation Experience:** Embedded compensating controls analysis and false-positive notes directly into finding workpapers (AWS-S3-001), establishing credibility through transparent technical evidence.
- **Professional Employment Experience:** Earned trust with DevOps by demonstrating AWS Systems Manager Session Manager as a secure replacement for SSH, enabling them to decommission bastions without impacting engineering productivity.

### Q13 (Behavioral – Insist on the Highest Standards)
**"Describe a situation where an automated scanner reported that a control passed, but your substantive testing revealed a deficiency."**
- **Project Implementation Experience:** Flagged backup recovery testing (CTL-BCP-01) as requiring manual substantive review despite automated tools showing 100% snapshot success.
- **Professional Employment Experience:** Uncovered third-party contractor MFA bypass in an identity federation flow even though the underlying AWS IAM password policy had passed automated CIS compliance checks.

### Q14 (Behavioral – Have Backbone; Disagree and Commit)
**"Tell me about a disagreement you had regarding the risk rating of an AWS vulnerability."**
- **Project Implementation Experience:** Defended a Critical rating on CI/CD deployment role wildcard permissions against auditee claims that internal runners are low risk, citing supply chain attack vectors.
- **Professional Employment Experience:** Successfully persuaded audit leadership to downgrade an open SSH finding from Critical to Medium after demonstrating that the source IP was a dedicated private Direct Connect circuit.

### Q15 (Behavioral – Deliver Results & Bias for Action)
**"How did you balance building a functional, end-to-end cloud audit platform with maintaining Big Four evidentiary standards?"**
- **Project Implementation Experience:** Prioritized the core evidentiary engine first (SafeAWSClient, pagination, SHA-256 hashing, 20 passing unit tests in <6s) before building the Next.js reporting console.
- **Professional Employment Experience:** Maintained an Agile audit cadence with bi-weekly finding clearing meetings to deliver audit committee deliverables ahead of board deadlines without workpaper backlogs.

---

## Part 3: Correction of Errors (COE) / 5 Whys Integration

Every high-severity finding in this platform maps to Amazon's **Correction of Errors (COE)** mechanism:
1. **Why was AdministratorAccess attached to the deployment role?** Terraform pipeline failed due to missing S3 policy permissions.
2. **Why did the engineer attach AdministratorAccess?** Urgent release deadline and lack of documented least-privilege service roles.
3. **Why did the engineer have authorization to attach managed policies?** IAM permission boundary was missing in the production account.
4. **Why was the permission boundary omitted?** Module drift occurred between staging and production environments.
5. **Why was drift not detected?** The CI/CD pipeline lacked pre-deployment automated policy linting.
- **Mechanism Established:** Enforce automated IAM Access Analyzer policy validation in CI/CD and deploy an Organization-wide SCP prohibiting IAM role modification without SecOps approval.
    `,
  },
];

export default function DocumentationPage() {
  const [activeTopic, setActiveTopic] = useState<string>("overview");

  const currentTopic = docTopics.find((t) => t.id === activeTopic) || docTopics[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              Audit Methodology & System Documentation
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Technical Reference
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Architectural guides, IT audit methodology, cryptographic integrity standards, and Python engine reference
          </p>
        </div>
      </div>

      {/* Main Grid: Sidebar of Topics + Content Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Topics List */}
        <div className="space-y-1.5 md:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 block mb-1">
            Methodology Guides
          </span>
          {docTopics.map((topic) => {
            const Icon = topic.icon;
            const isSelected = activeTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start space-x-2.5 ${
                  isSelected
                    ? "bg-white border-blue-500 shadow-xs ring-1 ring-blue-500"
                    : "bg-white/60 border-slate-200 hover:bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{topic.title}</p>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                    {topic.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="md:col-span-3 bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 text-xs text-slate-500 pb-3 border-b border-slate-100">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-700">{currentTopic.category}</span>
            <span>/</span>
            <span>{currentTopic.title}</span>
          </div>

          <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4">
            <div className="whitespace-pre-line text-slate-700 font-sans">
              {currentTopic.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
