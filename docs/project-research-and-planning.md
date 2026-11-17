# Project Research & Planning — August 13, 2026

> **Project origin note:** The project owner identifies August 13, 2026 as the date they began the project through paper-based research and planning. This entry records that reported planning milestone. It is not a Git commit dated August 13, 2026, and it does not claim that implementation, testing, deployment, or AWS assessments occurred on that date.

## 1. Initial research and problem definition

The initial research explored how an internal technology-risk or cloud-security audit could assess an organization's AWS environment in a structured, evidence-led way.

The planning focused on a fictional organization, **Northstar Claims Technologies**, to provide a realistic but non-confidential scenario for a portfolio demonstration. The central problem was to bring several audit activities into one traceable workflow:

- Define audit objectives, scope, stakeholders, and methodology.
- Inventory cloud assets and identify relevant security configurations.
- Map risks to control objectives and recognized frameworks.
- Record test procedures, evidence references, exceptions, and limitations.
- Rate risks, document findings, and track remediation.
- Communicate results through management-level dashboards and reports.

The project was conceived as an educational portfolio platform, not as a production GRC product or an independent certification service.

## 2. Architecture planning

The planned solution was divided into two complementary parts.

### A. Audit workspace (web application)

A browser-based workspace would organize the audit lifecycle:

1. **Planning:** audit charter, objectives, scope, methodology, and stakeholders.
2. **Inventory:** AWS asset and service inventory.
3. **Controls:** control matrix and framework crosswalk.
4. **Testing:** audit procedures, workpapers, and test-of-design / test-of-operating-effectiveness considerations.
5. **Evidence:** evidence register and integrity metadata.
6. **Risk and findings:** likelihood-impact assessment and structured findings.
7. **Remediation:** action owners, due dates, validation, and closure tracking.
8. **Reporting:** executive dashboard, printable report, and data exports.

The implementation direction selected for the web workspace is Next.js App Router, React, TypeScript, Tailwind CSS, and Recharts.

### B. AWS assessment utility (separate Python tool)

A separate Python 3 and Boto3 command-line utility was planned to collect point-in-time technical observations from AWS APIs.

Design principles:

- Use explicitly configured credentials and an authorized AWS account only.
- Prefer least-privilege, read-only IAM permissions.
- Do not create, modify, or delete AWS resources.
- Support sample mode so the workflow can be demonstrated without cloud credentials.
- Export structured JSON results and a human-readable Markdown summary.
- Record access-denied responses and other coverage gaps as assessment limitations.
- Never silently replace a failed live assessment with sample data.

The scanner and hosted web application are separate components. The hosted demonstration uses synthetic data; the scanner is run separately by an authorized user.

## 3. AWS security objectives and planned audit domains

The research established the following objectives as the basis for the audit scope:

| Domain | Planning objective |
|---|---|
| Identity and Access Management | Review identity lifecycle, privileged access, roles, policies, and MFA-related configuration. |
| Encryption and Key Management | Review encryption settings and key-management practices for relevant services. |
| Data Protection | Examine storage exposure, access controls, and data-protection configurations. |
| Logging and Monitoring | Review audit logging, monitoring coverage, alerting, and retention configuration. |
| Vulnerability and Configuration Management | Identify selected insecure or non-compliant configuration conditions. |
| Change and Release Management | Consider deployment controls, approvals, and CI/CD security practices. |
| Business Continuity and Availability | Review backup, recovery, resilience, and availability-related evidence. |
| Third-Party and Cloud Governance | Consider ownership, shared-responsibility boundaries, and supplier/cloud governance. |

The intent is to identify configuration risks and support audit testing—not to infer operating effectiveness from a single technical scan.

## 4. Framework research

The planned control mapping references:

- **NIST Cybersecurity Framework (CSF) 2.0**
- **ISO/IEC 27001:2022**
- **CIS AWS Foundations Benchmark**
- **SOC 2 Trust Services Criteria**

These are reference points for an illustrative crosswalk. A mapping does not prove compliance, certification, or that every framework requirement has been tested. Applicability and control interpretation require review.

## 5. Risk assessment and audit methodology

The planned methodology combines:

- Scope definition and risk-based audit planning.
- Control design review and, where suitable evidence exists, operating-effectiveness testing.
- Inspection of configuration and supporting evidence.
- A 5 × 5 likelihood-and-impact risk model.
- Structured findings using **Condition, Criteria, Cause, Consequence, and Recommendation**.
- Remediation ownership, target dates, validation, and closure status.
- Clear distinction between verified evidence, sample data, assumptions, and testing limitations.

Evidence hashes may help identify file changes, but do not independently establish evidence authenticity, secure retention, or chain of custody.

## 6. Initial project roadmap

The following was the proposed phased roadmap, not a claim that each phase was completed on the dates shown.

| Phase | Planned work | Intended output |
|---|---|---|
| 1 — Research and definition | Identify audit use case, scope, risks, users, and framework references. | Research notes, project charter, objectives. |
| 2 — Design | Plan application modules, data structures, control taxonomy, and scanner boundaries. | Architecture outline, workflow, control matrix. |
| 3 — Build the audit workspace | Implement dashboard, inventory, workpapers, evidence, risk, findings, and remediation modules. | Working web application with synthetic demonstration data. |
| 4 — Build the assessment utility | Implement read-only AWS collection, sample mode, output formats, and automated tests. | Python/Boto3 scanner and test suite. |
| 5 — Validate and communicate | Test workflows, review limitations, prepare reporting, and document safe usage. | Demonstration, documentation, and improvement backlog. |

## 7. Safety, assumptions, and limitations

- The scenario organization and demonstration records are fictional.
- Use live AWS assessment only with explicit authorization and appropriately scoped read-only access.
- Do not place credentials, customer data, or employer-confidential information in the repository.
- A point-in-time scanner observation is not sufficient evidence of control operation over an audit period.
- Manual procedures—such as approval review, restore testing, and control operation over time—require appropriate evidence and auditor judgment.
- Framework crosswalks are illustrative and require professional review.
- The project is an educational portfolio demonstration, not an accredited audit, compliance certification, or production GRC system.

## 8. Relationship to the implementation

This planning record describes the project rationale and intended direction. The repository's current README documents the implemented demonstration, including the web audit workspace and the separate Python read-only assessment utility. Features, tests, and deployment status should be assessed from the code and current build/deployment evidence rather than inferred from this historical planning entry.

---

**Historical date supplied by project owner:** August 13, 2026  
**Record type:** Retrospective documentation of initial paper research and planning  
**Git history:** This file is committed when added to the repository; its Git commit date remains the actual date of that commit.
