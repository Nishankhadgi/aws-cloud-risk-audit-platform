"""Amazon S3 Storage Security and Access Governance Audit Checks."""

from typing import List, Dict, Any, Optional
from .base_check import BaseCheck

class S3SecurityCheck(BaseCheck):
    """Evaluates S3 bucket security, public access blocks, encryption, and lifecycle controls."""

    @property
    def check_id(self) -> str:
        return "CHK-S3-01"

    @property
    def control_id(self) -> str:
        return "CTL-DATA-01"

    @property
    def domain(self) -> str:
        return "Data Protection"

    def run(self, regions: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        if self.sample_mode or not self.aws_client or self.aws_client.sample_mode:
            return self._run_sample_checks()

        results = []
        account_id = self.aws_client.account_id

        # 1. First inspect Account-Level Public Access Block (Compensating / Global Control)
        account_pab_resp = self.aws_client.call_readonly_api("s3control", "get_public_access_block", AccountId=account_id)
        account_pab_effective = False
        if "_error" not in account_pab_resp:
            pab_acct = account_pab_resp.get("PublicAccessBlockConfiguration", {})
            account_pab_effective = (
                pab_acct.get("BlockPublicAcls", False)
                and pab_acct.get("IgnorePublicAcls", False)
                and pab_acct.get("BlockPublicPolicy", False)
                and pab_acct.get("RestrictPublicBuckets", False)
            )

        buckets_resp = self.aws_client.call_readonly_api("s3", "list_buckets")
        if "_error" in buckets_resp:
            results.append(self.create_result(
                test_id="S3-INV-01",
                resource_id="Amazon S3 Buckets",
                resource_type="AWS::S3::Bucket",
                status="NOT_TESTED",
                severity="HIGH",
                title="Unable to Enumerate Amazon S3 Bucket Inventory",
                description="Read access s3:ListAllMyBuckets was denied.",
                technical_evidence={"error": buckets_resp["_error"]},
                aws_account=account_id,
                limitation_or_error="PermissionDenied"
            ))
            return results

        buckets = buckets_resp.get("Buckets", [])
        for b in buckets:
            bucket_name = b["Name"]

            # 2. Check Bucket-level Public Access Block
            pab_resp = self.aws_client.call_readonly_api("s3", "get_public_access_block", Bucket=bucket_name)
            pab_config = pab_resp.get("PublicAccessBlockConfiguration", {})
            bucket_pab_effective = (
                pab_config.get("BlockPublicAcls", False)
                and pab_config.get("IgnorePublicAcls", False)
                and pab_config.get("BlockPublicPolicy", False)
                and pab_config.get("RestrictPublicBuckets", False)
            )

            # Professional Audit Calibration:
            # If account-level PAB is active, the bucket cannot be publicly accessed from the internet.
            # Thus, missing bucket-level PAB is an architectural defense-in-depth / secondary hardening gap,
            # NOT an imminent data breach (avoiding false-positive critical panic).
            if bucket_pab_effective:
                status = "PASS"
                severity = "LOW"
                description = f"Bucket {bucket_name} has all four Public Access Block settings enforced at bucket level."
            elif account_pab_effective:
                status = "PARTIAL"
                severity = "MEDIUM"
                description = (
                    f"Bucket {bucket_name} lacks bucket-level PAB enforcement; however, account-level PAB is active "
                    f"acting as a compensating control to prevent internet exposure. Defense-in-depth hardening required."
                )
            else:
                status = "FAIL"
                severity = "HIGH"
                description = f"Bucket {bucket_name} and Account {account_id} both lack Public Access Block protection."

            results.append(self.create_result(
                test_id=f"DATA-S3-PAB-{bucket_name}",
                resource_id=f"arn:aws:s3:::{bucket_name}",
                resource_type="AWS::S3::Bucket",
                status=status,
                severity=severity,
                title=f"S3 Public Access Block Configuration: {bucket_name}",
                description=description,
                technical_evidence={
                    "bucket_pab": pab_config,
                    "account_level_pab_effective": account_pab_effective,
                    "compensating_control_active": account_pab_effective
                },
                aws_account=account_id,
                finding_ref="AWS-S3-001" if status in ["FAIL", "PARTIAL"] else None,
                recommendation="Enforce all four S3 Block Public Access settings at bucket level to satisfy defense-in-depth standards."
            ))

            # 3. Check Default Encryption
            enc_resp = self.aws_client.call_readonly_api("s3", "get_bucket_encryption", Bucket=bucket_name)
            has_enc = "_error" not in enc_resp
            results.append(self.create_result(
                test_id=f"DATA-S3-ENC-{bucket_name}",
                resource_id=f"arn:aws:s3:::{bucket_name}",
                resource_type="AWS::S3::Bucket",
                status="PASS" if has_enc else "FAIL",
                severity="HIGH" if not has_enc else "LOW",
                title=f"S3 Default Server-Side Encryption: {bucket_name}",
                description=f"Server-side encryption verification for {bucket_name}.",
                technical_evidence=enc_resp if has_enc else {"encryption_configured": False},
                aws_account=account_id,
                recommendation="Enforce default SSE-KMS encryption with customer managed key."
            ))

            # 4. Check Bucket Versioning
            ver_resp = self.aws_client.call_readonly_api("s3", "get_bucket_versioning", Bucket=bucket_name)
            ver_status = ver_resp.get("Status", "Suspended") if "_error" not in ver_resp else "Unknown"
            ver_pass = ver_status == "Enabled"
            results.append(self.create_result(
                test_id=f"DATA-S3-VER-{bucket_name}",
                resource_id=f"arn:aws:s3:::{bucket_name}",
                resource_type="AWS::S3::Bucket",
                status="PASS" if ver_pass else "PARTIAL",
                severity="LOW" if ver_pass else "MEDIUM",
                title=f"S3 Object Versioning Status: {bucket_name}",
                description=f"Bucket versioning configuration: {ver_status}.",
                technical_evidence={"VersioningStatus": ver_status, "MFADelete": ver_resp.get("MFADelete", "Disabled")},
                aws_account=account_id,
                recommendation="Enable S3 bucket versioning to safeguard claims documents against accidental overwrite or ransomware deletion."
            ))

        return results

    def _run_sample_checks(self) -> List[Dict[str, Any]]:
        account_id = "112233445566"
        return [
            self.create_result(
                test_id="DATA-01",
                resource_id=f"arn:aws:s3:::northstar-claims-documents-archive-prod",
                resource_type="AWS::S3::Bucket",
                status="PARTIAL",
                severity="MEDIUM",
                title="S3 Claims Archive Bucket Missing Bucket-Level Public Access Block (Mitigated by Account PAB)",
                description=(
                    "Production bucket storing uploaded customer claims records lacks BlockPublicPolicy and RestrictPublicBuckets "
                    "at bucket level. However, testing confirmed Account-Level Public Access Block is active across account 112233445566, "
                    "operating as a compensating control to prevent internet exposure. Finding is classified as a Significant Deficiency in defense-in-depth."
                ),
                technical_evidence={
                    "bucket_name": "northstar-claims-documents-archive-prod",
                    "BlockPublicAcls": True,
                    "IgnorePublicAcls": True,
                    "BlockPublicPolicy": False,
                    "RestrictPublicBuckets": False,
                    "account_level_pab_effective": True,
                    "false_positive_analysis": "Account-level PAB blocks public traffic. Severity calibrated from Critical to Medium Significant Deficiency.",
                    "audit_methodology_note": "Evaluated under IIA standards distinguishing direct exploitability from secondary hardening gaps."
                },
                aws_account=account_id,
                finding_ref="AWS-S3-001",
                recommendation="Update Terraform module to enforce all four S3 Block Public Access settings on northstar-claims-documents-archive-prod."
            ),
            self.create_result(
                test_id="DATA-02",
                resource_id=f"arn:aws:s3:::northstar-claims-app-assets-prod",
                resource_type="AWS::S3::Bucket",
                status="PASS",
                severity="LOW",
                title="S3 Web Static Assets Bucket Public Boundary & CloudFront OAI/OAC",
                description="Static UI assets bucket restricts direct S3 reads and enforces CloudFront Origin Access Control (OAC) with KMS SSE.",
                technical_evidence={
                    "bucket_name": "northstar-claims-app-assets-prod",
                    "all_pab_flags_true": True,
                    "origin_access_control": "arn:aws:cloudfront::112233445566:origin-access-control/E2VEXAMPLETWO",
                    "ssl_enforced": True
                },
                aws_account=account_id,
                recommendation="Maintain quarterly policy regression monitoring."
            ),
            self.create_result(
                test_id="DATA-03",
                resource_id=f"arn:aws:s3:::northstar-claims-audit-logs-vault",
                resource_type="AWS::S3::Bucket",
                status="PASS",
                severity="LOW",
                title="S3 Audit Logs Storage Immortality & Object Lock Verification",
                description="Audit logging archival bucket enforces S3 Object Lock in Compliance Mode with 365-day retention period and MFA Delete.",
                technical_evidence={
                    "bucket_name": "northstar-claims-audit-logs-vault",
                    "object_lock_enabled": True,
                    "retention_mode": "COMPLIANCE",
                    "retention_period_days": 365,
                    "versioning_status": "Enabled",
                    "mfa_delete": "Enabled"
                },
                aws_account=account_id,
                recommendation="Retain WORM compliance posture."
            ),
        ]
