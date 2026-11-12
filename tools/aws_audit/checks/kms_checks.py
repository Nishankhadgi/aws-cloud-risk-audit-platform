"""AWS KMS Cryptographic Key Management Audit Checks."""

from typing import List, Dict, Any, Optional
from .base_check import BaseCheck

class KMSKeyAuditCheck(BaseCheck):
    """Evaluates KMS customer-managed key lifecycle, automated rotation, and access policies."""

    @property
    def check_id(self) -> str:
        return "CHK-KMS-01"

    @property
    def control_id(self) -> str:
        return "CTL-ENC-01"

    @property
    def domain(self) -> str:
        return "Encryption and Key Management"

    def run(self, regions: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        if self.sample_mode or not self.aws_client or self.aws_client.sample_mode:
            return self._run_sample_checks()

        results = []
        regions = regions or ["us-east-1"]
        account_id = self.aws_client.account_id

        for reg in regions:
            # Paginated list of all KMS keys in the region
            keys = self.aws_client.paginate_readonly_api("kms", "list_keys", region_name=reg, result_key="Keys")
            if not keys:
                continue

            for k in keys:
                key_id = k.get("KeyId")
                if not key_id:
                    continue

                desc_resp = self.aws_client.call_readonly_api("kms", "describe_key", region_name=reg, KeyId=key_id)
                if "_error" in desc_resp:
                    continue

                metadata = desc_resp.get("KeyMetadata", {})
                if metadata.get("KeyManager") != "CUSTOMER":
                    continue  # Skip AWS managed keys (aws/s3, aws/ebs, etc.)

                key_spec = metadata.get("CustomerMasterKeySpec") or metadata.get("KeySpec", "SYMMETRIC_DEFAULT")
                origin = metadata.get("Origin", "AWS_KMS")

                # Professional Audit False-Positive Check:
                # AWS KMS automated rotation is only supported for SYMMETRIC_DEFAULT keys with AWS_KMS origin.
                # Asymmetric keys or imported keys cannot enable automated rotation.
                if key_spec != "SYMMETRIC_DEFAULT" or origin != "AWS_KMS":
                    results.append(self.create_result(
                        test_id=f"KMS-ROT-{key_id[:8]}",
                        resource_id=metadata.get("Arn", key_id),
                        resource_type="AWS::KMS::Key",
                        status="NOT_APPLICABLE",
                        severity="INFORMATIONAL",
                        title=f"Automated Key Rotation Not Supported for Asymmetric/Imported CMK: {metadata.get('Description', key_id)}",
                        description=f"Key spec is {key_spec} with origin {origin}. Automated annual rotation is not supported by AWS KMS for non-symmetric keys.",
                        technical_evidence={
                            "KeyId": key_id,
                            "KeySpec": key_spec,
                            "Origin": origin,
                            "audit_analysis": "Flagged as NOT_APPLICABLE to prevent false-positive compliance failure."
                        },
                        aws_region=reg,
                        aws_account=account_id,
                        recommendation="Manual annual re-keying and key retirement required for asymmetric or imported keys."
                    ))
                    continue

                # Verify automated key rotation for symmetric keys
                rot_resp = self.aws_client.call_readonly_api("kms", "get_key_rotation_status", region_name=reg, KeyId=key_id)
                rotation_enabled = rot_resp.get("KeyRotationEnabled", False)

                status = "PASS" if rotation_enabled else "FAIL"
                results.append(self.create_result(
                    test_id=f"KMS-ROT-{key_id[:8]}",
                    resource_id=metadata.get("Arn", key_id),
                    resource_type="AWS::KMS::Key",
                    status=status,
                    severity="MEDIUM" if not rotation_enabled else "LOW",
                    title=f"Customer Managed Symmetric Key Rotation: {metadata.get('Description', key_id)}",
                    description=f"Key {key_id} automated annual key rotation status: {rotation_enabled}.",
                    technical_evidence={
                        "KeyId": key_id,
                        "KeyRotationEnabled": rotation_enabled,
                        "KeyState": metadata.get("KeyState"),
                        "KeyUsage": metadata.get("KeyUsage"),
                        "KeySpec": key_spec,
                        "Origin": origin
                    },
                    aws_region=reg,
                    aws_account=account_id,
                    finding_ref="AWS-KMS-001" if not rotation_enabled else None,
                    recommendation="Enable annual automated key rotation for symmetric customer managed KMS key."
                ))

        return results

    def _run_sample_checks(self) -> List[Dict[str, Any]]:
        account_id = "112233445566"
        return [
            self.create_result(
                test_id="KMS-01",
                resource_id=f"arn:aws:kms:us-east-1:{account_id}:key/b498f82a-e837-4d92-965a-claimscrypto01",
                resource_type="AWS::KMS::Key",
                status="FAIL",
                severity="MEDIUM",
                title="Customer Managed KMS Master Key Missing Automated Key Rotation",
                description="The primary symmetric CMK used for claims payload encryption at rest has automated annual rotation disabled, increasing cryptanalytic exposure window.",
                technical_evidence={
                    "KeyId": "b498f82a-e837-4d92-965a-claimscrypto01",
                    "Description": "Claims Platform Primary CMK (PII and Financial Records)",
                    "KeyRotationEnabled": False,
                    "KeyState": "Enabled",
                    "CreationDate": "2025-01-10T12:00:00Z",
                    "KeySpec": "SYMMETRIC_DEFAULT",
                    "Origin": "AWS_KMS",
                    "supports_rotation": True,
                    "false_positive_analysis": "Confirmed key is symmetric AWS_KMS key eligible for rotation. Valid exception."
                },
                aws_region="us-east-1",
                aws_account=account_id,
                finding_ref="AWS-KMS-001",
                recommendation="Enable KMS automatic annual key rotation via EnableKeyRotation API or Terraform configuration."
            ),
            self.create_result(
                test_id="KMS-02",
                resource_id=f"arn:aws:kms:us-east-1:{account_id}:key/f331c19d-761a-4c91-912b-auditlogkey02",
                resource_type="AWS::KMS::Key",
                status="PASS",
                severity="LOW",
                title="Audit Trail CMK Policy Separation and Rotation Compliance",
                description="CloudTrail dedicated encryption key has annual rotation active and key policy strictly isolates crypto usage to CloudTrail service principal.",
                technical_evidence={
                    "KeyId": "f331c19d-761a-4c91-912b-auditlogkey02",
                    "KeyRotationEnabled": True,
                    "KeyState": "Enabled",
                    "KeyPolicySeparation": "Verified dual-custody administrator delegation"
                },
                aws_region="us-east-1",
                aws_account=account_id,
                recommendation="Maintain existing rotation policy."
            ),
            self.create_result(
                test_id="KMS-03",
                resource_id=f"arn:aws:kms:us-east-1:{account_id}:key/e991204a-8120-410a-88aa-claimssignkey03",
                resource_type="AWS::KMS::Key",
                status="NOT_APPLICABLE",
                severity="INFORMATIONAL",
                title="Asymmetric Signing Key Ineligible for Automated AWS Key Rotation",
                description="Claims settlement verification key uses asymmetric RSA_2048 key material. In accordance with AWS KMS design, automated rotation is not applicable.",
                technical_evidence={
                    "KeyId": "e991204a-8120-410a-88aa-claimssignkey03",
                    "KeySpec": "RSA_2048",
                    "KeyUsage": "SIGN_VERIFY",
                    "Origin": "AWS_KMS",
                    "audit_conclusion": "Classified as NOT_APPLICABLE rather than FAIL, eliminating false-positive scan defect."
                },
                aws_region="us-east-1",
                aws_account=account_id,
                recommendation="Verify manual key retirement schedule."
            )
        ]
