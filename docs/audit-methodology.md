# Internal Audit Methodology & Professional Standards

## 1. Professional Audit Alignment
This platform models an IT internal audit executed in strict adherence to:
- **The Institute of Internal Auditors (IIA)**: International Professional Practices Framework (IPPF).
- **ISACA**: Information Technology Assurance Framework (ITAF) Standards for IT Audit and Assurance.
- **AWS Well-Architected Framework**: Security and Reliability Pillars.

## 2. Audit Engagement Lifecycle

### Phase I: Engagement Planning & Risk Assessment
- Establishment of the formal Audit Charter approved by the Audit Committee.
- Defining systems under review, in-scope AWS accounts, operational regions, and resource limitations.
- Preliminary risk assessment to establish testing priorities based on business criticality.

### Phase II: Fieldwork & Automated Evidence Gathering
- Read-only API scanning across 8 core domains.
- Automated 100% population inspection of IAM user credentials, S3 public access blocks, and KMS key configurations.
- Substantive judgmental sampling of infrastructure-as-code pull requests and break-glass CloudTrail sessions.

### Phase III: Control Evaluation & 5C Finding Documentation
- Assessing operating effectiveness against established criteria.
- Formulating findings using the classic 5C architecture:
  1. **Condition:** What was observed in the cloud environment.
  2. **Criteria:** Authoritative standard, benchmark, or corporate policy mandate.
  3. **Cause:** Underlying root cause why the control failed or was bypassed.
  4. **Consequence / Effect:** Business exposure, financial liability, or regulatory penalty.
  5. **Recommendation:** Practical, corrective remediation steps for engineering.

### Phase IV: Reporting, Remediation Tracking, & Retesting
- Executive Audit Report issued to executive leadership and the Board Audit Committee.
- Action plans assigned to responsible engineering owners with hard SLA targets.
- Verification and retesting required before marking remediation items as CLOSED.

