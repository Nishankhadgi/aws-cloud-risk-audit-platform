export interface FrameworkDetail {
  framework_id: string;
  name: string;
  version: string;
  authoritative_body: string;
  description: string;
  mapping_count: number;
}

export const supportedFrameworks: FrameworkDetail[] = [
  {
    framework_id: "nist_csf",
    name: "NIST Cybersecurity Framework",
    version: "2.0 (Feb 2024)",
    authoritative_body: "National Institute of Standards and Technology (NIST)",
    description: "Industry-standard cybersecurity guidance organized across Govern, Identify, Protect, Detect, Respond, and Recover functions.",
    mapping_count: 28,
  },
  {
    framework_id: "iso_27001",
    name: "ISO/IEC 27001:2022",
    version: "2022 Edition",
    authoritative_body: "International Organization for Standardization (ISO) / IEC",
    description: "Information security management systems standard specifying Annex A organizational, people, physical, and technological controls.",
    mapping_count: 28,
  },
  {
    framework_id: "cis_aws",
    name: "CIS Amazon Web Services Foundations Benchmark",
    version: "v3.0.0 (Nov 2023)",
    authoritative_body: "Center for Internet Security (CIS)",
    description: "Prescriptive technical configuration recommendations for securing core AWS services and accounts.",
    mapping_count: 28,
  },
  {
    framework_id: "soc_2",
    name: "AICPA SOC 2 Trust Services Criteria",
    version: "2017 with 2022 Updates",
    authoritative_body: "American Institute of Certified Public Accountants (AICPA)",
    description: "Attestation criteria covering Security (Common Criteria), Availability, Confidentiality, and Processing Integrity.",
    mapping_count: 28,
  },
];

export interface CrosswalkEntry {
  control_id: string;
  title: string;
  domain: string;
  nist_csf: string;
  nist_title: string;
  iso_27001: string;
  iso_title: string;
  cis_aws: string;
  cis_title: string;
  soc_2: string;
  soc_title: string;
  audit_significance: string;
}

export const frameworkCrosswalkData: CrosswalkEntry[] = [
  {
    control_id: "CTL-IAM-01",
    title: "Privileged CI/CD Deployment Role Scoping",
    domain: "IAM and Access Governance",
    nist_csf: "PR.AA-05",
    nist_title: "Access permissions are allocated and managed incorporating least privilege and separation of duties",
    iso_27001: "A.8.2",
    iso_title: "Privileged access rights",
    cis_aws: "1.16",
    cis_title: "Ensure IAM policies that allow full '*:*' administrative privileges are not attached to deployment roles",
    soc_2: "CC6.3",
    soc_title: "Role-based access permissions restricted to authorized job functions",
    audit_significance: "Wildcard administrator access on automation roles creates catastrophic blast radius if pipeline secrets or OIDC tokens leak."
  },
  {
    control_id: "CTL-IAM-02",
    title: "Multi-Factor Authentication (MFA) for Console Users",
    domain: "IAM and Access Governance",
    nist_csf: "PR.AA-01",
    nist_title: "Identities and credentials are authenticated and asserted",
    iso_27001: "A.5.17",
    iso_title: "Authentication information",
    cis_aws: "1.5",
    cis_title: "Ensure MFA is enabled for all IAM users that have a console password",
    soc_2: "CC6.1",
    soc_title: "Logical access controls require multi-factor authentication for administrative access",
    audit_significance: "Direct console access without MFA exposes the organization to credential stuffing and phishing takeovers."
  },
  {
    control_id: "CTL-IAM-03",
    title: "Root Account Protection and Inactivity",
    domain: "IAM and Access Governance",
    nist_csf: "PR.AA-02",
    nist_title: "Identities are managed for authorized users and devices",
    iso_27001: "A.8.2",
    iso_title: "Privileged access rights",
    cis_aws: "1.4",
    cis_title: "Ensure no root account access keys exist and hardware MFA is enabled",
    soc_2: "CC6.1",
    soc_title: "Restricted super-user credential isolation",
    audit_significance: "Root credential compromise leads to irrevocable ownership loss of the entire AWS account."
  },
  {
    control_id: "CTL-IAM-04",
    title: "Programmatic Access Key Lifecycle and Rotation",
    domain: "IAM and Access Governance",
    nist_csf: "PR.AA-03",
    nist_title: "Access permissions and authorizations are revoked upon termination",
    iso_27001: "A.5.17",
    iso_title: "Authentication information",
    cis_aws: "1.14",
    cis_title: "Ensure access keys are rotated every 90 days or fewer",
    soc_2: "CC6.2",
    soc_title: "Credential management and periodic expiration",
    audit_significance: "Stale long-lived access keys frequently end up committed to source code or retained by departing contractors."
  },
  {
    control_id: "CTL-IAM-05",
    title: "IAM Role Trust Policy Boundary Validation",
    domain: "IAM and Access Governance",
    nist_csf: "PR.AA-05",
    nist_title: "Access permissions incorporate least privilege",
    iso_27001: "A.8.2",
    iso_title: "Privileged access rights",
    cis_aws: "1.17",
    cis_title: "Ensure IAM role trust policies restrict STS assume role access to explicit principals",
    soc_2: "CC6.3",
    soc_title: "Access control lists enforce intended identity delegation",
    audit_significance: "Overly broad trust policies allow external cross-account actors to assume internal execution roles."
  },
  {
    control_id: "CTL-DATA-01",
    title: "Amazon S3 Public Access Block Enforcement",
    domain: "Data Protection",
    nist_csf: "PR.DS-01",
    nist_title: "Data at rest is protected",
    iso_27001: "A.8.24",
    iso_title: "Use of cryptography and storage isolation",
    cis_aws: "2.1.4",
    cis_title: "Ensure S3 Buckets are configured with 'Block Public Access'",
    soc_2: "CC6.6",
    soc_title: "Boundary controls prevent unauthorized external access to data assets",
    audit_significance: "Misconfigured public S3 buckets are the historical #1 cause of cloud data breaches and regulatory fines."
  },
  {
    control_id: "CTL-DATA-02",
    title: "S3 Object Versioning & Lifecycle Deletion Safeguards",
    domain: "Data Protection",
    nist_csf: "PR.DS-11",
    nist_title: "Data integrity and authenticity are maintained",
    iso_27001: "A.8.14",
    iso_title: "Redundancy of information processing facilities",
    cis_aws: "2.1.2",
    cis_title: "Ensure S3 bucket versioning is enabled",
    soc_2: "A1.2",
    soc_title: "Environmental protections and recovery from destructive overwrite events",
    audit_significance: "Guards against accidental deletion, malicious insider sabotage, and ransomware encryption."
  },
  {
    control_id: "CTL-DATA-03",
    title: "S3 SSL/TLS In-Transit Enforcement Policy",
    domain: "Data Protection",
    nist_csf: "PR.DS-02",
    nist_title: "Data in transit is protected",
    iso_27001: "A.8.24",
    iso_title: "Use of cryptography",
    cis_aws: "2.1.1",
    cis_title: "Ensure S3 Bucket Policy denies HTTP requests without SecureTransport",
    soc_2: "CC6.7",
    soc_title: "Transmission encryption protects data over public networks",
    audit_significance: "Prevents man-in-the-middle interception of unencrypted claims files."
  },
  {
    control_id: "CTL-DATA-04",
    title: "Amazon RDS Database Storage Encryption",
    domain: "Data Protection",
    nist_csf: "PR.DS-01",
    nist_title: "Data at rest is protected",
    iso_27001: "A.8.24",
    iso_title: "Use of cryptography",
    cis_aws: "2.3.1",
    cis_title: "Ensure storage encryption is enabled for Amazon RDS DB instances",
    soc_2: "CC6.7",
    soc_title: "Data at rest encryption controls",
    audit_significance: "Guarantees that database volumes, snapshots, and logs are protected if physical media or backups are compromised."
  },
  {
    control_id: "CTL-ENC-01",
    title: "AWS KMS Customer Managed Key (CMK) Automated Rotation",
    domain: "Encryption and Key Management",
    nist_csf: "PR.DS-01",
    nist_title: "Data at rest is protected through key lifecycle management",
    iso_27001: "A.8.24",
    iso_title: "Use of cryptography - key lifecycle management",
    cis_aws: "2.8",
    cis_title: "Ensure rotation for customer-created KMS keys is enabled",
    soc_2: "CC6.7",
    soc_title: "Cryptographic key generation, storage, and rotation procedures",
    audit_significance: "Automated rotation limits the amount of ciphertext compromised if a specific key version is exposed."
  },
  {
    control_id: "CTL-ENC-02",
    title: "KMS Key Policy Least Privilege & Dual Custody",
    domain: "Encryption and Key Management",
    nist_csf: "PR.AA-05",
    nist_title: "Least privilege access to cryptographic operations",
    iso_27001: "A.8.24",
    iso_title: "Use of cryptography",
    cis_aws: "2.9",
    cis_title: "Ensure KMS key policy does not allow wildcards in Principal field",
    soc_2: "CC6.3",
    soc_title: "Role segregation for cryptographic administrative keys",
    audit_significance: "Ensures cloud administrators cannot decrypt sensitive claims payloads without audited key authorization."
  },
  {
    control_id: "CTL-ENC-03",
    title: "Default EBS Volume Encryption Enforcement",
    domain: "Encryption and Key Management",
    nist_csf: "PR.DS-01",
    nist_title: "Data at rest is protected across all compute volumes",
    iso_27001: "A.8.24",
    iso_title: "Use of cryptography",
    cis_aws: "2.2.1",
    cis_title: "Ensure EBS default encryption is enabled in all operational regions",
    soc_2: "CC6.7",
    soc_title: "Default encryption guardrails for new infrastructure",
    audit_significance: "Prevents engineers from inadvertently launching unencrypted virtual machine block stores."
  },
  {
    control_id: "CTL-ENC-04",
    title: "TLS 1.2+ Protocol Enforcement on Edge Endpoints",
    domain: "Encryption and Key Management",
    nist_csf: "PR.DS-02",
    nist_title: "Data in transit is protected using modern cryptographic protocols",
    iso_27001: "A.8.24",
    iso_title: "Use of cryptography",
    cis_aws: "2.1.1",
    cis_title: "Ensure ALBs and CloudFront distributions deprecate TLS 1.0 and 1.1",
    soc_2: "CC6.7",
    soc_title: "Modern transmission encryption protocols",
    audit_significance: "Mitigates protocol downgrade attacks and complies with PCI-DSS and HIPAA cryptographic requirements."
  },
  {
    control_id: "CTL-LOG-01",
    title: "CloudTrail Multi-Region Audit Trail Configuration",
    domain: "Security Logging and Monitoring",
    nist_csf: "DE.CM-01",
    nist_title: "The network is monitored to detect potential cybersecurity events",
    iso_27001: "A.8.15",
    iso_title: "Logging",
    cis_aws: "3.1",
    cis_title: "Ensure CloudTrail is enabled in all regions",
    soc_2: "CC7.2",
    soc_title: "System activities and administrative actions are logged and retained",
    audit_significance: "Without multi-region trails, attacker activities in unmonitored AWS regions go completely undetected."
  },
  {
    control_id: "CTL-LOG-02",
    title: "CloudTrail Cryptographic Log File Integrity Validation",
    domain: "Security Logging and Monitoring",
    nist_csf: "PR.DS-11",
    nist_title: "Audit logs are protected against tampering or deletion",
    iso_27001: "A.8.15",
    iso_title: "Logging and log tamper prevention",
    cis_aws: "3.2",
    cis_title: "Ensure CloudTrail log file validation is enabled",
    soc_2: "CC7.2",
    soc_title: "Cryptographic validation of audit log integrity",
    audit_significance: "Ensures evidence presented to regulatory auditors has not been altered or truncated post-event."
  },
  {
    control_id: "CTL-LOG-03",
    title: "CloudTrail Dedicated S3 Vault and KMS Encryption",
    domain: "Security Logging and Monitoring",
    nist_csf: "PR.DS-01",
    nist_title: "Audit log records are encrypted at rest with managed keys",
    iso_27001: "A.8.15",
    iso_title: "Protection of log information",
    cis_aws: "3.7",
    cis_title: "Ensure CloudTrail logs are encrypted using KMS CMKs",
    soc_2: "CC6.7",
    soc_title: "Encryption of security telemetry and logs",
    audit_significance: "Protects security audit trails from unauthorized viewing by curious internal operators."
  },
  {
    control_id: "CTL-LOG-04",
    title: "CloudWatch Critical Security Alarm Metric Filters",
    domain: "Security Logging and Monitoring",
    nist_csf: "DE.AE-02",
    nist_title: "Potentially malicious events are analyzed",
    iso_27001: "A.8.16",
    iso_title: "Monitoring activities",
    cis_aws: "3.4",
    cis_title: "Ensure metric filters and alarms exist for unauthorized API calls, root logins, and IAM changes",
    soc_2: "CC7.3",
    soc_title: "Automated alerts for unauthorized system and configuration changes",
    audit_significance: "Enables immediate real-time response to unauthorized security group openings or root console sign-ins."
  },
  {
    control_id: "CTL-MON-01",
    title: "Amazon GuardDuty Threat Detection Across All Regions",
    domain: "Security Logging and Monitoring",
    nist_csf: "DE.AE-03",
    nist_title: "Threat intelligence and anomalous activity detection",
    iso_27001: "A.8.16",
    iso_title: "Monitoring activities",
    cis_aws: "4.1",
    cis_title: "Ensure Amazon GuardDuty is enabled in all active and inactive regions",
    soc_2: "CC7.2",
    soc_title: "Anomalous behavior and intrusion detection",
    audit_significance: "Detects active credential theft, Bitcoin mining instances, and command-and-control communication."
  },
  {
    control_id: "CTL-MON-02",
    title: "AWS Config Continuous Asset and Configuration Tracking",
    domain: "Security Logging and Monitoring",
    nist_csf: "ID.AM-01",
    nist_title: "Physical and virtual assets are inventoried and managed",
    iso_27001: "A.8.9",
    iso_title: "Configuration management",
    cis_aws: "3.5",
    cis_title: "Ensure AWS Config is enabled in all regions",
    soc_2: "CC8.1",
    soc_title: "Configuration baseline management and change recording",
    audit_significance: "Provides forensic history of resource configuration state changes for IT audit trail reconstruction."
  },
  {
    control_id: "CTL-NET-01",
    title: "Perimeter Security Group Administrative Port Isolation",
    domain: "Vulnerability and Configuration Management",
    nist_csf: "PR.AC-05",
    nist_title: "Network integrity is protected from unauthorized access",
    iso_27001: "A.8.20",
    iso_title: "Network security",
    cis_aws: "5.1",
    cis_title: "Ensure no Security Groups allow ingress from 0.0.0.0/0 to port 22 or 3389",
    soc_2: "CC6.6",
    soc_title: "Perimeter boundaries restrict direct internet administrative access",
    audit_significance: "Exposing SSH/RDP to the internet leads directly to automated brute-force attacks and initial compromise."
  },
  {
    control_id: "CTL-NET-02",
    title: "VPC Flow Logs Traffic Inspection and Anomaly Analysis",
    domain: "Vulnerability and Configuration Management",
    nist_csf: "DE.CM-01",
    nist_title: "Network communication traffic is monitored",
    iso_27001: "A.8.15",
    iso_title: "Logging network traffic",
    cis_aws: "3.9",
    cis_title: "Ensure VPC Flow Logging is enabled in all VPCs",
    soc_2: "CC7.2",
    soc_title: "Network traffic logging and retention",
    audit_significance: "Essential for tracing lateral movement and data exfiltration routes during incident response."
  },
  {
    control_id: "CTL-NET-03",
    title: "Amazon RDS Private Subnet Placement",
    domain: "Vulnerability and Configuration Management",
    nist_csf: "PR.AC-05",
    nist_title: "Databases are isolated behind multi-tiered network architectures",
    iso_27001: "A.8.20",
    iso_title: "Network security and segregation",
    cis_aws: "2.3.2",
    cis_title: "Ensure RDS instances are not publicly accessible",
    soc_2: "CC6.6",
    soc_title: "Multi-tier network segregation isolating sensitive data stores",
    audit_significance: "Publicly accessible databases invite automated credential stuffing and zero-day database exploit probing."
  },
  {
    control_id: "CTL-CHG-01",
    title: "Infrastructure as Code (IaC) Pull Request Approval Gate",
    domain: "Change and Release Management",
    nist_csf: "PR.PS-01",
    nist_title: "Configuration management practices are followed",
    iso_27001: "A.8.32",
    iso_title: "Change management",
    cis_aws: "N/A - Process",
    cis_title: "AWS Well-Architected Operational Excellence Pillar",
    soc_2: "CC8.1",
    soc_title: "Infrastructure changes require documented peer review and formal approval prior to production release",
    audit_significance: "Prevents rogue unauthorized infrastructure modifications by requiring branch protection and 2 peer approvals."
  },
  {
    control_id: "CTL-CHG-02",
    title: "Automated Pre-Deployment Security Policy Scanning (Checkov)",
    domain: "Change and Release Management",
    nist_csf: "PR.PS-02",
    nist_title: "Software development lifecycle incorporates security reviews",
    iso_27001: "A.8.28",
    iso_title: "Secure coding and infrastructure scanning",
    cis_aws: "N/A - Process",
    cis_title: "DevSecOps Static Analysis Guidance",
    soc_2: "CC8.1",
    soc_title: "Automated change controls detect configuration defects prior to deployment",
    audit_significance: "Catches misconfigurations (like open S3 buckets or open SSH ports) before Terraform code reaches production."
  },
  {
    control_id: "CTL-CHG-03",
    title: "AWS CloudTrail Emergency Production Access Auditing",
    domain: "Change and Release Management",
    nist_csf: "PR.AC-04",
    nist_title: "Emergency break-glass access is monitored and reconciled",
    iso_27001: "A.8.2",
    iso_title: "Privileged access rights",
    cis_aws: "1.1",
    cis_title: "Ensure root and break-glass usage triggers immediate security notification",
    soc_2: "CC6.3",
    soc_title: "Emergency privileged access is logged, time-bounded, and reviewed",
    audit_significance: "Ensures emergency production fixes are reviewed post-incident to prevent persistent backdoors."
  },
  {
    control_id: "CTL-BCP-01",
    title: "Centralized Automated Backup Redundancy (AWS Backup)",
    domain: "Business Continuity and Availability",
    nist_csf: "RC.RP-01",
    nist_title: "Recovery plans are executed during or after an incident",
    iso_27001: "A.8.14",
    iso_title: "Redundancy of information processing facilities",
    cis_aws: "2.10",
    cis_title: "Ensure automated snapshots and backup retention for critical workloads",
    soc_2: "A1.2",
    soc_title: "Backups of critical data are generated and replicated",
    audit_significance: "Guarantees that database corruption or regional outage can be recovered within agreed RTO / RPO limits."
  },
  {
    control_id: "CTL-BCP-02",
    title: "Cross-Region Disaster Recovery Vault Replication",
    domain: "Business Continuity and Availability",
    nist_csf: "RC.RP-02",
    nist_title: "Recovery strategies incorporate geographical redundancy",
    iso_27001: "A.8.14",
    iso_title: "Redundancy of facilities",
    cis_aws: "2.11",
    cis_title: "Ensure cross-region backup copies for critical RDS and DynamoDB stores",
    soc_2: "A1.3",
    soc_title: "Geographic replication protects against regional catastrophic disasters",
    audit_significance: "Survives total AWS major region loss (e.g., severe natural disaster in us-east-1)."
  },
  {
    control_id: "CTL-BCP-03",
    title: "Documented Disaster Recovery Restore & Failover Testing",
    domain: "Business Continuity and Availability",
    nist_csf: "RC.RP-01",
    nist_title: "Recovery plans are tested annually to ensure effectiveness",
    iso_27001: "A.5.30",
    iso_title: "ICT readiness for business continuity",
    cis_aws: "N/A - Process",
    cis_title: "AWS Well-Architected Reliability Pillar - Failure Management",
    soc_2: "A1.3",
    soc_title: "Disaster recovery testing is conducted annually and evaluated against RTO/RPO",
    audit_significance: "A backup without proven restore testing is merely a hope, not a reliable recovery control."
  },
  {
    control_id: "CTL-GOV-01",
    title: "AWS Shared Responsibility Model Governance Matrix",
    domain: "Third-Party and Cloud Governance",
    nist_csf: "GV.OC-01",
    nist_title: "The organizational cybersecurity context and third-party dependencies are understood",
    iso_27001: "A.5.8",
    iso_title: "Information security in project management & cloud supplier relationships",
    cis_aws: "General",
    cis_title: "AWS Shared Responsibility Architecture Guidelines",
    soc_2: "CC9.2",
    soc_title: "Vendor and third-party risk management",
    audit_significance: "Clarifies customer responsibility (IAM, data encryption, OS patching) vs AWS responsibility (hardware, virtualization)."
  }
];

