"""AWS CloudTrail Audit Logging and Integrity Checks."""

from typing import List, Dict, Any, Optional
from .base_check import BaseCheck

class CloudTrailSecurityCheck(BaseCheck):
    """Evaluates CloudTrail trail presence, multi-region coverage, log validation, and KMS encryption."""

    @property
    def check_id(self) -> str:
        return "CHK-TRAIL-01"

    @property
    def control_id(self) -> str:
        return "CTL-LOG-01"

    @property
    def domain(self) -> str:
        return "Security Logging and Monitoring"

    def run(self, regions: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        if self.sample_mode or not self.aws_client or self.aws_client.sample_mode:
            return self._run_sample_checks()

        results = []
        account_id = self.aws_client.account_id

        trails_resp = self.aws_client.call_readonly_api("cloudtrail", "describe_trails", region_name="us-east-1")
        if "_error" in trails_resp:
            results.append(self.create_result(
                test_id="LOG-TRAIL-01",
                resource_id="AWS CloudTrail",
                resource_type="AWS::CloudTrail::Trail",
                status="NOT_TESTED",
                severity="HIGH",
                title="Unable to Audit CloudTrail Configuration",
                description="Permission denied on cloudtrail:DescribeTrails.",
                technical_evidence={"error": trails_resp["_error"]},
                aws_account=account_id,
                limitation_or_error="PermissionDenied"
            ))
            return results

        trails = trails_resp.get("trailList", [])
        if not trails:
            results.append(self.create_result(
                test_id="LOG-TRAIL-01",
                resource_id="AWS CloudTrail",
                resource_type="AWS::CloudTrail::Trail",
                status="FAIL",
                severity="CRITICAL",
                title="No Active AWS CloudTrail Configured",
                description="Zero CloudTrail audit trails exist in the account, leaving administrative actions unlogged.",
                technical_evidence={"trails_count": 0},
                aws_account=account_id,
                finding_ref="AWS-LOG-001",
                recommendation="Create an organizational multi-region trail with CloudWatch Logs integration."
            ))
            return results

        for trail in trails:
            trail_arn = trail.get("TrailARN", trail.get("Name"))
            trail_name = trail.get("Name")
            is_multi = trail.get("IsMultiRegionTrail", False)
            val_enabled = trail.get("LogFileValidationEnabled", False)
            kms_key = trail.get("KmsKeyId")

            # Check trail logging status
            status_resp = self.aws_client.call_readonly_api("cloudtrail", "get_trail_status", region_name="us-east-1", Name=trail_arn)
            is_logging = status_resp.get("IsLogging", False) if "_error" not in status_resp else False

            # Check event selectors for S3 Data Event coverage
            selectors_resp = self.aws_client.call_readonly_api("cloudtrail", "get_event_selectors", region_name="us-east-1", TrailName=trail_arn)
            has_data_events = False
            if "_error" not in selectors_resp:
                for sel in selectors_resp.get("EventSelectors", []):
                    if sel.get("DataResources"):
                        has_data_events = True
                        break

            overall_pass = is_multi and val_enabled and bool(kms_key) and is_logging and has_data_events
            status = "PASS" if overall_pass else "PARTIAL"

            results.append(self.create_result(
                test_id=f"LOG-01-{trail_name}",
                resource_id=trail_arn,
                resource_type="AWS::CloudTrail::Trail",
                status=status,
                severity="HIGH" if not is_logging or not is_multi else ("MEDIUM" if not has_data_events else "LOW"),
                title=f"CloudTrail Trail Configuration: {trail_name}",
                description=f"MultiRegion: {is_multi}, Validation: {val_enabled}, KMS: {bool(kms_key)}, Logging: {is_logging}, S3 Data Events: {has_data_events}.",
                technical_evidence={
                    "TrailARN": trail_arn,
                    "IsMultiRegionTrail": is_multi,
                    "LogFileValidationEnabled": val_enabled,
                    "KmsKeyId": kms_key,
                    "IsLogging": is_logging,
                    "HasDataEvents": has_data_events,
                    "LatestDeliveryTime": str(status_resp.get("LatestDeliveryTime", "N/A"))
                },
                aws_account=account_id,
                finding_ref="AWS-LOG-001" if status != "PASS" else None,
                recommendation="Ensure multi-region, SHA-256 validation, KMS encryption, and S3 data-plane event logging are all enforced."
            ))

        return results

    def _run_sample_checks(self) -> List[Dict[str, Any]]:
        account_id = "112233445566"
        return [
            self.create_result(
                test_id="LOG-01",
                resource_id=f"arn:aws:cloudtrail:us-east-1:{account_id}:trail/northstar-primary-org-trail",
                resource_type="AWS::CloudTrail::Trail",
                status="PARTIAL",
                severity="MEDIUM",
                title="CloudTrail Incomplete Multi-Region Global Service Data Event Coverage",
                description="Primary trail records management events across all regions, but S3 Data Events and Lambda invocation data events are omitted to contain log ingestion costs.",
                technical_evidence={
                    "TrailARN": f"arn:aws:cloudtrail:us-east-1:{account_id}:trail/northstar-primary-org-trail",
                    "IsMultiRegionTrail": True,
                    "IsLogging": True,
                    "LogFileValidationEnabled": True,
                    "KmsKeyId": f"arn:aws:kms:us-east-1:{account_id}:key/f331c19d-761a-4c91-912b-auditlogkey02",
                    "ManagementEvents": True,
                    "S3DataEventsEnabled": False,
                    "LambdaDataEventsEnabled": False
                },
                aws_region="us-east-1",
                aws_account=account_id,
                finding_ref="AWS-LOG-001",
                recommendation="Enable CloudTrail Data Events for sensitive S3 claims storage buckets to record object-level reads/writes for forensic reconstruction."
            )
        ]
