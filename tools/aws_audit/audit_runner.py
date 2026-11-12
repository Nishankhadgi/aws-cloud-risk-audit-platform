"""Central Audit Runner orchestrating AWS Configuration checks and evidence compilation."""

import logging
from typing import List, Dict, Any, Optional

try:
    from .aws_client import SafeAWSClient
    from .evidence_collector import EvidenceCollector
    from .report_generator import AuditReportGenerator
    from .checks.iam_checks import IAMSecurityCheck
    from .checks.s3_checks import S3SecurityCheck
    from .checks.kms_checks import KMSKeyAuditCheck
    from .checks.cloudtrail_checks import CloudTrailSecurityCheck
    from .checks.security_monitoring_checks import SecurityMonitoringAuditCheck
    from .checks.ec2_checks import EC2SecurityCheck
    from .checks.rds_checks import RDSSecurityCheck
    from .checks.backup_checks import BackupAuditCheck
except ImportError:
    from aws_client import SafeAWSClient
    from evidence_collector import EvidenceCollector
    from report_generator import AuditReportGenerator
    from checks.iam_checks import IAMSecurityCheck
    from checks.s3_checks import S3SecurityCheck
    from checks.kms_checks import KMSKeyAuditCheck
    from checks.cloudtrail_checks import CloudTrailSecurityCheck
    from checks.security_monitoring_checks import SecurityMonitoringAuditCheck
    from checks.ec2_checks import EC2SecurityCheck
    from checks.rds_checks import RDSSecurityCheck
    from checks.backup_checks import BackupAuditCheck

logger = logging.getLogger("aws_audit.runner")

class AuditRunner:
    """Orchestrates comprehensive multi-domain AWS infrastructure audits."""

    def __init__(
        self,
        profile_name: Optional[str] = None,
        sample_mode: bool = False,
        regions: Optional[List[str]] = None
    ):
        self.sample_mode = sample_mode
        self.regions = regions or ["us-east-1", "us-west-2"]
        self.client = SafeAWSClient(profile_name=profile_name, sample_mode=sample_mode)
        self.collector = EvidenceCollector(auditor_name="Senior IT Auditor (Northstar Engagement)")

    def execute_audit(self) -> Dict[str, Any]:
        """Runs all registered audit check modules."""
        logger.info(f"Starting AWS Audit. Target Account: {self.client.account_id}, SampleMode: {self.sample_mode}")

        check_classes = [
            IAMSecurityCheck,
            S3SecurityCheck,
            KMSKeyAuditCheck,
            CloudTrailSecurityCheck,
            SecurityMonitoringAuditCheck,
            EC2SecurityCheck,
            RDSSecurityCheck,
            BackupAuditCheck,
        ]

        all_results: List[Dict[str, Any]] = []

        for check_cls in check_classes:
            try:
                instance = check_cls(aws_client=self.client, sample_mode=self.sample_mode)
                check_results = instance.run(regions=self.regions)
                
                # Record evidence for each test
                for res in check_results:
                    all_results.append(res)
                    evidence_id = f"EVD-{res['check_id'].replace('CHK-', '')}-{res['test_id']}"
                    self.collector.record_evidence(
                        evidence_id=evidence_id,
                        title=f"Evidence Workpaper: {res['title']}",
                        control_id=res["control_id"],
                        test_id=res["test_id"],
                        source=f"AWS API ({res['aws_region']})",
                        raw_payload=res["technical_evidence"]
                    )
            except Exception as e:
                logger.error(f"Error executing check {check_cls.__name__}: {e}", exc_info=True)
                all_results.append({
                    "control_id": "UNKNOWN",
                    "test_id": f"ERR-{check_cls.__name__}",
                    "check_id": check_cls.__name__,
                    "domain": "General Cloud Governance",
                    "resource_id": "AWS Account",
                    "resource_type": "AWS::Account",
                    "aws_account": self.client.account_id,
                    "aws_region": "global",
                    "status": "ERROR",
                    "severity": "HIGH",
                    "title": f"Execution Error in {check_cls.__name__}",
                    "description": str(e),
                    "technical_evidence": {"error": str(e)},
                    "evidence_timestamp": "now",
                    "finding_reference": None,
                    "risk_recommendation": "Review auditor script execution logs.",
                    "limitation_or_error": str(e),
                    "is_simulated": self.sample_mode
                })

        report_package = AuditReportGenerator.generate_json_package(
            account_id=self.client.account_id,
            regions=self.regions,
            results=all_results,
            evidence_register=self.collector.get_register(),
            is_sample_mode=self.sample_mode
        )

        return report_package
