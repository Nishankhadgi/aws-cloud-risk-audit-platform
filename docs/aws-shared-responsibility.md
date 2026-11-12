# AWS Shared Responsibility Model in IT Audit

## 1. Concept Overview
The AWS Shared Responsibility Model is fundamental to cloud security auditing. Cloud security is a shared partnership between the cloud provider (AWS) and the customer (Northstar Claims Technologies).

```
+-------------------------------------------------------------------------------+
|                       Customer Responsibility: Security IN the Cloud          |
|  - Customer Claims Data & PHI Classification                                  |
|  - IAM Users, Roles, MFA, Least-Privilege Policies & OIDC Trust Relationships |
|  - Operating System Configuration & Security Patching                         |
|  - Network Traffic Filtering (VPC Security Groups & Route Tables)             |
|  - Amazon S3 Bucket Policies, Public Access Blocks, & Encryption at Rest      |
|  - Disaster Recovery Testing & Restore Drills                                  |
+-------------------------------------------------------------------------------+
                                        |
+-------------------------------------------------------------------------------+
|                         AWS Responsibility: Security OF the Cloud             |
|  - Physical Security of AWS Global Data Center Facilities                     |
|  - Hardware Host Racks, Power Supplies, & Biometric Perimeter Access           |
|  - Hypervisor Virtualization Layer & AWS Nitro System Isolation               |
|  - Underlying Fiber Backbone Network Infrastructure                           |
|  - Storage Media Decommissioning & NIST 800-88 Cryptographic Erasure          |
+-------------------------------------------------------------------------------+
```

## 2. Audit Implications for Northstar Claims Technologies
1. **Audit Scope Limitation:** Internal auditors do not audit physical AWS data centers. Instead, auditors review AWS's annual **SOC 1 Type II**, **SOC 2 Type II**, and **ISO 27001** audit reports via AWS Artifact.
2. **Customer Configuration Risk:** Over 99% of cloud security failures originate from customer misconfigurations (such as open S3 buckets, excessive IAM permissions, or exposed management ports). The internal audit program focuses heavily on these customer-managed controls.

