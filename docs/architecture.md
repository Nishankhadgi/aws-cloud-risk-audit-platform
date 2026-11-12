# Technical Architecture & Solution Design

## 1. System Overview
The **AWS Cloud Infrastructure Security & Technology Risk Audit Platform** is an enterprise-grade internal audit and technology risk console engineered for IT auditors, cloud security architects, and GRC leaders. It models the complete audit lifecycle for a fictional fintech/insurtech enterprise, **Northstar Claims Technologies**, which processes synthetic customer claims on AWS.

```
+-----------------------------------------------------------------------------------+
|                        Executive Presentation & Audit Web Console                 |
|      (Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts, LocalStorage)    |
+-----------------------------------------------------------------------------------+
                                         ^
                                         | Ingests & Exports JSON Audit Package
                                         v
+-----------------------------------------------------------------------------------+
|                     Python 3 Read-Only AWS Audit Engine (tools/aws_audit)          |
|    +------------------+   +-------------------+   +----------------------------+   |
|    | SafeAWSClient    |-->| AuditRunner       |-->| EvidenceCollector (SHA256) |   |
|    | (Read-Only Guard)|   | (8 Domain Checks) |   | RiskScoringEngine (5x5)    |   |
|    +------------------+   +-------------------+   +----------------------------+   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v AWS Read-Only APIs (Boto3)
+-----------------------------------------------------------------------------------+
|                           AWS Cloud Infrastructure Under Review                   |
|  [IAM] [S3] [KMS] [EC2/VPC] [RDS PostgreSQL] [CloudTrail] [GuardDuty] [AWS Backup] |
+-----------------------------------------------------------------------------------+
```

## 2. Core Architectural Pillars

### A. Frontend Application
- **Next.js 14 App Router:** Multi-page layout covering Executive Dashboard, Audit Planning, Asset Inventory, Control Matrix, Testing Workpapers, Evidence Register, Risk Register, Audit Findings, Remediation Tracker, Framework Crosswalk, and Reports.
- **State Management & Persistence:** Browser `localStorage` engine with bidirectional JSON import/export, allowing auditors to record sample observations, conclusion overrides, and evidence attachments without data loss upon refresh.
- **Visual Analytics:** Interactive Recharts visualizations depicting control effectiveness, findings by severity, audit domain breakdown, remediation lifecycles, and a 5x5 technology risk heatmap.

### B. Python Read-Only Audit Engine (`tools/aws_audit`)
- **Safety Enforcement:** The `SafeAWSClient` wrapper strictly enforces read-only operations. Any attempt to invoke mutating AWS APIs (e.g. `create_*`, `delete_*`, `put_*`) raises a `SecurityAuditViolationError`.
- **Sample Mode Guarantee:** The engine runs in offline `--sample` mode out of the box without requiring AWS credentials or network connectivity, outputting complete cryptographic evidence packages.
- **Multi-Region & Pagination:** Handles pagination across IAM, S3, KMS, EC2, RDS, and CloudTrail, recording account IDs and scan timestamps.

