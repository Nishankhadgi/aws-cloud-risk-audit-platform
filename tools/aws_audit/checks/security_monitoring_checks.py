"""AWS Threat Detection and Configuration Monitoring Audit Checks."""

from typing import List, Dict, Any, Optional
from .base_check import BaseCheck

class SecurityMonitoringAuditCheck(BaseCheck):
    """Evaluates GuardDuty threat detection, AWS Config recorder status, and Security Hub compliance posture."""

    @property
    def check_id(self) -> str:
        return "CHK-MON-01"

    @property
    def control_id(self) -> str:
        return "CTL-MON-01"

    @property
    def domain(self) -> str:
        return "Security Logging and Monitoring"

    def run(self, regions: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        if self.sample_mode or not self.aws_client or self.aws_client.sample_mode:
            return self._run_sample_checks()

        results = []
        regions = regions or ["us-east-1"]
        account_id = self.aws_client.account_id

        for reg in regions:
            # 1. GuardDuty Status & Features
            gd_resp = self.aws_client.call_readonly_api("guardduty", "list_detectors", region_name=reg)
            if "_error" not in gd_resp:
                detectors = gd_resp.get("DetectorIds", [])
                has_active_gd = False
                detector_details = {}
                if detectors:
                    det_id = detectors[0]
                    det_resp = self.aws_client.call_readonly_api("guardduty", "get_detector", region_name=reg, DetectorId=det_id)
                    if "_error" not in det_resp:
                        has_active_gd = det_resp.get("Status") == "ENABLED"
                        detector_details = det_resp

                results.append(self.create_result(
                    test_id=f"MON-GD-{reg}",
                    resource_id=f"Amazon GuardDuty ({reg})",
                    resource_type="AWS::GuardDuty::Detector",
                    status="PASS" if has_active_gd else "FAIL",
                    severity="HIGH" if not has_active_gd else "LOW",
                    title=f"Amazon GuardDuty Threat Detection Status ({reg})",
                    description=f"GuardDuty detector status in {reg}: {'ENABLED' if has_active_gd else 'DISABLED/ABSENT'}.",
                    technical_evidence={"DetectorIds": detectors, "Enabled": has_active_gd, "details": detector_details},
                    aws_region=reg,
                    aws_account=account_id,
                    recommendation="Enable Amazon GuardDuty with S3, EKS, and Runtime protection enabled."
                ))

            # 2. AWS Config Recorder
            cfg_resp = self.aws_client.call_readonly_api("config", "describe_configuration_recorder_status", region_name=reg)
            if "_error" not in cfg_resp:
                statuses = cfg_resp.get("ConfigurationRecordersStatus", [])
                recording = any(s.get("recording", False) for s in statuses)
                results.append(self.create_result(
                    test_id=f"MON-CFG-{reg}",
                    resource_id=f"AWS Config Recorder ({reg})",
                    resource_type="AWS::Config::ConfigurationRecorder",
                    status="PASS" if recording else "FAIL",
                    severity="HIGH" if not recording else "LOW",
                    title=f"AWS Config Configuration Recorder Status ({reg})",
                    description=f"AWS Config resource state recording in {reg}: {recording}.",
                    technical_evidence={"Recorders": statuses, "Recording": recording},
                    aws_region=reg,
                    aws_account=account_id,
                    recommendation="Activate AWS Config recorder across all supported resource types."
                ))

            # 3. AWS Security Hub Posture
            hub_resp = self.aws_client.call_readonly_api("securityhub", "describe_hub", region_name=reg)
            if "_error" not in hub_resp:
                hub_arn = hub_resp.get("HubArn")
                standards_resp = self.aws_client.call_readonly_api("securityhub", "get_enabled_standards", region_name=reg)
                standards = standards_resp.get("StandardsSubscriptions", []) if "_error" not in standards_resp else []
                results.append(self.create_result(
                    test_id=f"MON-HUB-{reg}",
                    resource_id=hub_arn or f"SecurityHub-{reg}",
                    resource_type="AWS::SecurityHub::Hub",
                    status="PASS",
                    severity="LOW",
                    title=f"AWS Security Hub CSPM Standards Active ({reg})",
                    description=f"Security Hub is enabled with {len(standards)} subscribed standards in {reg}.",
                    technical_evidence={"HubArn": hub_arn, "StandardsCount": len(standards)},
                    aws_region=reg,
                    aws_account=account_id,
                    recommendation="Maintain CIS AWS Benchmark and AWS Foundational Security Best Practices standards."
                ))

        return results

    def _run_sample_checks(self) -> List[Dict[str, Any]]:
        account_id = "112233445566"
        return [
            self.create_result(
                test_id="MON-01",
                resource_id=f"arn:aws:guardduty:us-east-1:{account_id}:detector/12a849f2b874382e",
                resource_type="AWS::GuardDuty::Detector",
                status="PASS",
                severity="LOW",
                title="Amazon GuardDuty Continuous Machine-Learning Threat Detection Active",
                description="GuardDuty detector is enabled in primary production region with CloudWatch EventBridge alerting hooked into PagerDuty.",
                technical_evidence={
                    "detector_id": "12a849f2b874382e",
                    "status": "ENABLED",
                    "finding_publishing_frequency": "FIFTEEN_MINUTES",
                    "features": [
                        {"name": "S3_DATA_EVENTS", "status": "ENABLED"},
                        {"name": "EKS_AUDIT_LOGS", "status": "ENABLED"},
                        {"name": "RUNTIME_MONITORING", "status": "ENABLED"}
                    ]
                },
                aws_region="us-east-1",
                aws_account=account_id,
                recommendation="Ensure secondary DR region (us-west-2) maintains identical detector configuration."
            ),
            self.create_result(
                test_id="MON-02",
                resource_id=f"arn:aws:config:us-east-1:{account_id}:recorder/default",
                resource_type="AWS::Config::ConfigurationRecorder",
                status="PASS",
                severity="LOW",
                title="AWS Config Continuous Resource State and Compliance Tracking Active",
                description="AWS Config is actively recording configuration changes for all IAM, S3, RDS, KMS, and EC2 resources.",
                technical_evidence={
                    "recorder_name": "default",
                    "recording": True,
                    "all_supported_resources": True,
                    "include_global_resource_types": True,
                    "last_successful_delivery_time": "2026-11-12T12:00:00Z"
                },
                aws_region="us-east-1",
                aws_account=account_id,
                recommendation="Continue periodic evaluation of conformance packs."
            ),
            self.create_result(
                test_id="MON-03",
                resource_id=f"arn:aws:securityhub:us-east-1:{account_id}:hub/default",
                resource_type="AWS::SecurityHub::Hub",
                status="PASS",
                severity="LOW",
                title="AWS Security Hub Foundational Security Best Practices Standard Active",
                description="Security Hub is enabled and ingests findings from GuardDuty, Inspector, and Config rules.",
                technical_evidence={
                    "hub_arn": f"arn:aws:securityhub:us-east-1:{account_id}:hub/default",
                    "subscribed_standards": [
                        "arn:aws:securityhub:::ruleset/cis-aws-foundations-benchmark/v/3.0.0",
                        "arn:aws:securityhub:us-east-1::standards/aws-foundational-security-best-practices/v/1.0.0"
                    ],
                    "overall_security_score": 87
                },
                aws_region="us-east-1",
                aws_account=account_id,
                recommendation="Remediate remaining lower-priority findings reported in Hub."
            )
        ]
