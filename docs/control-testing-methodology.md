# Control Testing & Sampling Methodology

## 1. Testing Approaches
Audit tests in this platform utilize three distinct substantive testing methods:
1. **100% Automated Population Testing:** Applied to digital populations where AWS APIs allow exhaustive enumeration (e.g. testing 100% of IAM users for active MFA, 100% of S3 buckets for Public Access Block settings, and 100% of KMS keys for key rotation).
2. **Judgmental / Risk-Based Sampling:** Applied to operational processes with large populations (e.g. sampling 25 out of 142 infrastructure pull requests to inspect peer approvals and automated Checkov security scans).
3. **Inspectional Inquiry Testing:** Applied to governance and operational resilience activities (e.g. examining disaster recovery restore execution records, vendor SOC 2 reports, and break-glass CloudTrail reconciliation tickets).

## 2. Testing Workpaper Structure
Every testing workpaper records:
- **Test ID:** Unique identifier (e.g., `IAM-01`, `DATA-01`, `BCP-01`).
- **Mapped Control ID:** Corresponding internal control from the Control Matrix.
- **Population:** Total universe of items available for testing.
- **Sample Size & Sampling Method:** Number of units inspected and selection rationale.
- **Executed Steps:** Numbered procedural audit instructions.
- **Expected vs. Actual Result:** Objective benchmark vs observed operational reality.
- **Identified Exceptions:** Specific deviations or failures observed.
- **Auditor Conclusion:** `PASS`, `FAIL`, `PARTIAL`, `NOT_TESTED`, or `NOT_APPLICABLE`.

