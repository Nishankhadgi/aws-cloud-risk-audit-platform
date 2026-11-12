# AWS Read-Only Infrastructure Audit Engine (`tools/aws_audit`)

## Overview
This tool is a dedicated Python 3 audit engine engineered for IT Internal Auditors, Cloud Security Architects, and GRC Consultants conducting AWS technology risk evaluations. It operates exclusively using read-only AWS APIs (`get_*`, `list_*`, `describe_*`) and produces standardized cryptographic evidence workpapers and structured audit findings.

> [!IMPORTANT]
> **Audit Principle of Least Privilege & Non-Destructive Operation:**
> The engine contains a two-tiered enforcement boundary in `aws_client.py`:
> 1. **Permitted Read-Only Prefix Whitelist**: Only methods starting with approved prefixes (`get_`, `list_`, `describe_`, `lookup_`, `view_`, `batch_get_`, `scan_`, `query_`) are permitted.
> 2. **Mutating Method Blacklist**: Any invocation of mutating methods (`create_*`, `delete_*`, `put_*`, `update_*`, `modify_*`, `authorize_*`, `terminate_*`, etc.) raises a fatal `SecurityAuditViolationError` immediately before any network traffic is initiated.
> The engine never modifies, creates, stops, or deletes AWS resources.

---

## Technical Architecture & Enterprise Auditor Features

### 1. Robust API Pagination (PCAOB AS 1105 IPE Completeness)
To guarantee that audit test populations represent 100% of deployed resources without sampling blind spots, `SafeAWSClient.paginate_readonly_api()` handles pagination across all resource types:
- **Native Boto3 Paginator**: Automatically leverages Boto3's `get_paginator()` where supported by AWS service APIs.
- **Manual Marker/Token Looping**: Employs an automated token fallback handler supporting `NextToken`, `Marker`, `NextMarker`, and `ContinuationToken`.
- **Safety Limit Capping**: Includes a configurable safety threshold (`max_pages=50`) to prevent infinite token loops and protect the client from uncontrolled AWS API rate exhaustion.

### 2. Standardized Error Handling & Rate Limiting Classification
All API calls pass through `SafeAWSClient._classify_error()`:
- **Permission Denials**: Catches `AccessDenied`, `AccessDeniedException`, `UnauthorizedOperation`, and `AuthFailure`, gracefully emitting a `NOT_TESTED` audit workpaper with an explicit scope limitation record rather than crashing the audit run.
- **Throttling Detection**: Distinguishes `RequestLimitExceeded` and `ThrottlingException`, logging rate limits for audit evidence trail.

### 3. Professional Audit False-Positive Calibrations
- **S3 Public Access Block Defense-in-Depth**: When an individual S3 bucket lacks bucket-level PAB but the AWS Account-Level PAB is active, the engine calibrates the finding to `PARTIAL` (Significant Deficiency) rather than a false-positive Critical breach alarm, recognizing the active global compensating control.
- **Asymmetric KMS Key Rotation**: Detects asymmetric (e.g. `RSA_2048`) and imported key specifications that AWS KMS does not support for automated annual rotation, tagging them as `NOT_APPLICABLE` to prevent erroneous compliance failures.
- **EC2 Security Group Precision**: Scans for port ranges covering management ports (e.g. `20-25` covering SSH 22, `3000-4000` covering RDP 3389), `IpProtocol="-1"` (all traffic), and both IPv4 `0.0.0.0/0` and IPv6 `::/0` CIDRs.
- **RDS Backup Retention**: Evaluates retention period against the CIS AWS Benchmark requirement of $\ge 7$ days.

### 4. Technical Configuration vs. Manual Audit Conclusion Distinction
In accordance with IIA standards, ISACA ITAF 1205, and PCAOB AS 1105:
- Automated API checks confirm that an `AWS::Backup::BackupPlan` exists and executes scheduled snapshots.
- **However, technical configuration cannot prove data restorability.** The engine emits a dedicated workpaper item (`BCP-RESTORE-TEST`) flagged as `PARTIAL` / `MANUAL_VALIDATION_REQUIRED`, mandating that the auditor manually review documented quarterly restore drill workpapers and verify RTO/RPO achievement.

---

## Capabilities & Covered Checks

| Domain | Control ID | Check ID | AWS Service APIs | Test Focus |
| :--- | :--- | :--- | :--- | :--- |
| **IAM & Privileged Access** | CTL-IAM-01 | CHK-IAM-01 | `iam:GetAccountSummary`, `iam:GetAccountPasswordPolicy`, `iam:ListUsers`, `iam:ListMFADevices`, `iam:ListAccessKeys`, `iam:ListRoles`, `iam:ListAttachedRolePolicies` | Root MFA & key absence, console MFA enforcement, access key age (>90 days), and wildcard `AdministratorAccess` policies attached to deployment roles. |
| **Data Protection** | CTL-DATA-01 | CHK-S3-01 | `s3control:GetPublicAccessBlock`, `s3:ListAllMyBuckets`, `s3:GetPublicAccessBlock`, `s3:GetBucketEncryption`, `s3:GetBucketVersioning` | Account vs. bucket-level PAB enforcement, default SSE-KMS encryption, and bucket versioning immutability. |
| **Data Protection** | CTL-DATA-02 | CHK-RDS-01 | `rds:DescribeDBInstances` | Public endpoint isolation, KMS at-rest storage encryption, CIS $\ge 7$-day backup retention, and Multi-AZ resilience. |
| **Key Management** | CTL-ENC-01 | CHK-KMS-01 | `kms:ListKeys`, `kms:DescribeKey`, `kms:GetKeyRotationStatus` | Customer-managed symmetric key automated annual rotation, asymmetric key exclusion handling, and key policy separation. |
| **Logging & Monitoring** | CTL-LOG-01 | CHK-TRAIL-01 | `cloudtrail:DescribeTrails`, `cloudtrail:GetTrailStatus`, `cloudtrail:GetEventSelectors` | Multi-region trail coverage, SHA-256 log file validation, KMS encryption, active logging status, and S3 data-plane event selectors. |
| **Threat Detection** | CTL-MON-01 | CHK-MON-01 | `guardduty:ListDetectors`, `guardduty:GetDetector`, `config:DescribeConfigurationRecorderStatus`, `securityhub:DescribeHub`, `securityhub:GetEnabledStandards` | GuardDuty continuous threat detection status, AWS Config resource change recording, and Security Hub foundational standards. |
| **Perimeter Security** | CTL-NET-01 | CHK-EC2-01 | `ec2:GetEbsEncryptionByDefault`, `ec2:DescribeSecurityGroups` | Default EBS volume encryption across regions; security groups with unrestricted 0.0.0.0/0 or ::/0 ingress to port 22/3389 or all protocols. |
| **Business Continuity** | CTL-BCP-01 | CHK-BCP-01 | `backup:ListBackupPlans`, `backup:ListBackupVaults` | Centralized backup plans, vault inventory, and mandatory substantive manual restore drill audit verification. |

---

## CLI Usage

### 1. Simulated Sample Mode (Zero AWS Credentials Required)
Perfect for portfolio demonstrations, offline audits, and testing:
```bash
python main.py --sample --output output/
```

### 2. Live Read-Only AWS Assessment
Run against an actual AWS account using a designated read-only IAM profile:
```bash
python main.py --profile audit-readonly --regions us-east-1 us-west-2 --output output/
```

### 3. Direct Import into Web Platform
Export results directly into the Next.js platform's data fixture:
```bash
python main.py --sample --output ../../src/data/mockScanData.json
```

---

## Minimum Required IAM Read-Only Policy
To run live assessments, attach the dedicated read-only policy defined in [aws-audit-iam-policy.json](file:///C:/Users/Nishant/.gemini/antigravity/scratch/aws-cloud-risk-audit-platform/docs/aws-audit-iam-policy.json) or the AWS-managed `SecurityAudit` policy (`arn:aws:iam::aws:policy/SecurityAudit`).

---

## Automated Test Suite

Run the full pytest suite (including mocked AWS API responses, pagination tests, and mutating blacklist validation):
```bash
python -m pytest tools/aws_audit/tests -v
```
All 20 test cases execute in $<6$ seconds with zero cloud dependencies.
