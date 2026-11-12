# Security, Safety, & Privacy Architecture

## 1. Ethical & Responsible Audit Guardrails
The development and execution of this audit platform enforce strict defensive engineering practices:
1. **Strict Read-Only Enforcement:** All Boto3 AWS API calls are constrained to non-destructive inspection operations. The engine hard-codes an API whitelist preventing `delete_*`, `update_*`, `create_*`, or `put_*` commands.
2. **Zero Exploitation Testing:** This platform does not execute penetration tests, packet fuzzing, password spraying, or network denial-of-service tests against AWS infrastructure.
3. **No Credential Exfiltration:** AWS credentials, named profile tokens, and session secrets are kept within local runtime memory and are never persisted in workpapers, JSON fixtures, or transmitted to third parties.
4. **Data Privacy by Design:** All sample customer records, policy numbers, claim amounts, and identity profiles represent synthetically generated mock data for Northstar Claims Technologies.
5. **Clear Simulation Labeling:** All visual UI views, exported reports, and terminal summaries display clear warnings: **"SIMULATED AUDIT DATA — NOT AN ACTUAL AWS AUDIT"**.

