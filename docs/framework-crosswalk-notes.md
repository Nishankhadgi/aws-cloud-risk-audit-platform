# Framework Crosswalk & Compliance Alignment Notes

## 1. Mapped Industry Standards

### A. NIST Cybersecurity Framework (CSF) 2.0 (February 2024)
- **Govern (GV):** Organizational context, risk management strategy, and supply chain governance (e.g. `GV.OC-01`).
- **Protect (PR):** Identity management (`PR.AA-01`, `PR.AA-05`), data security at rest and in transit (`PR.DS-01`, `PR.DS-02`), and platform security (`PR.PS-01`).
- **Detect (DE):** Continuous monitoring (`DE.CM-01`) and adverse event analysis (`DE.AE-02`).
- **Recover (RC):** Incident recovery planning and backup restoration (`RC.RP-01`).

### B. ISO/IEC 27001:2022 Annex A
- **A.5 Organizational Controls:** A.5.8 Information security in project management, A.5.17 Authentication information, A.5.30 ICT readiness for business continuity.
- **A.8 Technological Controls:** A.8.2 Privileged access rights, A.8.9 Configuration management, A.8.14 Redundancy of information processing facilities, A.8.15 Logging, A.8.16 Monitoring activities, A.8.20 Network security, A.8.24 Use of cryptography, A.8.32 Change management.

### C. CIS Amazon Web Services Foundations Benchmark v3.0.0
- Prescriptive technical configuration standards for IAM root accounts, console MFA, CloudTrail logging, KMS encryption, EBS volume defaults, and Security Group ingress port blocking.

### D. AICPA SOC 2 Trust Services Criteria (2017 with 2022 Updates)
- **Common Criteria (Security):** CC6.1 Logical access, CC6.3 Role permissions, CC6.6 Boundary protection, CC6.7 Cryptographic protection, CC7.2 Logging and anomaly monitoring, CC8.1 Change management.
- **Availability Criteria:** A1.2 Environmental protections and data backups, A1.3 Disaster recovery testing.

## 2. Professional Auditor Disclaimer
This mapping is an internal audit crosswalk for benchmarking and control gap analysis. Automated technical scan results do not substitute for formal accredited third-party SOC 2 or ISO 27001 certification audits.

