# AWS Cloud Infrastructure Security & Technology Risk Audit Platform

A portfolio-grade, simulated internal audit workspace for a fictional organization, Northstar Claims Technologies. The project demonstrates audit planning, AWS configuration review, control testing, evidence registration, risk assessment, findings, remediation tracking, framework crosswalks, and executive reporting.

> **Important:** The hosted application starts with synthetic demonstration data. It is not connected to a real AWS account and does not issue an independent audit opinion. The Python scanner can separately query AWS through explicitly configured, read-only credentials.

## Live demonstration

The interactive web application is intended to be hosted on Vercel. The hosted UI uses sample data. The Python scanner runs separately from the web application and must be run locally by an authorized user.

## Application features

- Executive audit dashboard with control and risk summaries.
- Audit charter, objectives, scope, methodology, and stakeholder planning.
- AWS asset inventory.
- Control matrix and framework crosswalk.
- Audit tests and workpapers, including TOD/TOE and IPE considerations.
- Evidence register with SHA-256 metadata.
- 5x5 likelihood-impact risk register.
- Structured audit findings using Condition, Criteria, Cause, Consequence, and Recommendation.
- Remediation tracker with ownership, due dates, validation, and closure status.
- Print-friendly executive report and JSON/CSV export.
- Sample audit scan import.

## Technology stack

- Next.js App Router, React, TypeScript.
- Tailwind CSS and Recharts.
- Python 3 and Boto3 for the separate read-only AWS assessment CLI.
- Pytest and mocked AWS API responses for scanner tests.

## Run the web application locally

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Production build and type checking:

```bash
npm run typecheck
npm run build
npm run start
```

## Run the Python scanner in sample mode

Sample mode does not require AWS credentials:

```bash
python tools/aws_audit/main.py --sample --output tools/aws_audit/output/
```

The scanner writes an audit JSON package and a Markdown summary.

## Optional authorized AWS read-only assessment

Use only an AWS account you own or are explicitly authorized to assess. Configure an AWS CLI profile with the minimum read-only permissions documented in `docs/aws-audit-iam-policy.json`.

```bash
python tools/aws_audit/main.py --profile audit-readonly --regions us-east-1 us-west-2 --output tools/aws_audit/output/
```

The scanner is designed to use read-only APIs. It must not create, modify, or delete AWS resources. Authentication failures must stop live assessment rather than silently substituting sample results. API permission gaps should be recorded as testing limitations.

## Import scan results into the web UI

1. Run the Python scanner locally.
2. Open the Audit Platform in your browser.
3. Use **Import Scan** in the application toolbar.
4. Select the generated `audit_results.json` file.
5. Review the imported technical results and independently validate exceptions before recording audit conclusions.

A scanner result is a point-in-time technical observation, not by itself proof of control operating effectiveness over an audit period.

## Audit domains represented

- Identity and Access Management.
- Encryption and Key Management.
- Data Protection.
- Security Logging and Monitoring.
- Vulnerability and Configuration Management.
- Change and Release Management.
- Business Continuity and Availability.
- Third-Party and Cloud Governance.

## Framework references

The project includes an illustrative mapping to NIST CSF 2.0, ISO/IEC 27001:2022, CIS AWS Foundations Benchmark, and SOC 2 Trust Services Criteria. Framework mappings require professional review and do not establish certification or compliance.

## Safety and privacy

- Do not commit AWS credentials, customer information, or employer-confidential material.
- Do not use production accounts without written authorization and a scoped audit approval.
- The AWS scanner is read-only and does not perform remediation.
- Keep live scan artifacts sanitized before sharing them publicly.
- Sample resources, findings, reviewer names, and evidence in the demo are fictional.
- Restore testing, change approvals, control operation over time, and other procedural controls require manual evidence and auditor judgment.

## Current limitations

- The deployed web UI is a sample-data demonstration; the Python AWS scanner is a separate local CLI.
- A live scan does not automatically prove control design or operating effectiveness.
- Framework mappings are illustrative.
- Evidence metadata and hashes do not replace secure evidence retention, independent validation, or chain-of-custody procedures.
- The project is an educational portfolio demonstration, not an accredited audit, compliance certification, or production GRC system.
