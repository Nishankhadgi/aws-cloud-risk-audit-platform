"""AWS Backup and Disaster Recovery Audit Checks."""

from typing import List, Dict, Any, Optional
from .base_check import BaseCheck

class BackupAuditCheck(BaseCheck):
    """Evaluates AWS Backup plans, recovery points, and enforces manual recovery testing validation."""

    @property
    def check_id(self) -> str:
        return "CHK-BCP-01"

    @property
    def control_id(self) -> str:
        return "CTL-BCP-01"

    @property
    def domain(self) -> str:
        return "Business Continuity and Availability"

    def run(self, regions: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        if self.sample_mode or not self.aws_client or self.aws_client.sample_mode:
            return self._run_sample_checks()

        results = []
        regions = regions or ["us-east-1"]
        account_id = self.aws_client.account_id

        for reg in regions:
            # 1. Centralized AWS Backup Plans (Paginated)
            plans = self.aws_client.paginate_readonly_api(
                "backup", "list_backup_plans", region_name=reg, result_key="BackupPlansList"
            )
            has_plans = len(plans) > 0
            results.append(self.create_result(
                test_id=f"BCP-PLAN-{reg}",
                resource_id=f"AWS Backup Plans ({reg})",
                resource_type="AWS::Backup::BackupPlan",
                status="PASS" if has_plans else "FAIL",
                severity="HIGH" if not has_plans else "LOW",
                title=f"Centralized AWS Backup Plan Configuration ({reg})",
                description=f"Active backup plan count in {reg}: {len(plans)}.",
                technical_evidence={"plans_count": len(plans), "plans": plans},
                aws_region=reg,
                aws_account=account_id,
                finding_ref="AWS-BCP-001" if not has_plans else None,
                recommendation="Establish automated daily backup plan with cross-region replication."
            ))

            # 2. Backup Vaults & Recovery Points (Paginated)
            vaults = self.aws_client.paginate_readonly_api(
                "backup", "list_backup_vaults", region_name=reg, result_key="BackupVaultList"
            )
            has_vaults = len(vaults) > 0
            results.append(self.create_result(
                test_id=f"BCP-VAULT-{reg}",
                resource_id=f"AWS Backup Vaults ({reg})",
                resource_type="AWS::Backup::BackupVault",
                status="PASS" if has_vaults else "PARTIAL",
                severity="MEDIUM" if not has_vaults else "LOW",
                title=f"AWS Backup Vault Inventory ({reg})",
                description=f"Identified {len(vaults)} backup vaults in {reg}.",
                technical_evidence={"vaults_count": len(vaults), "vaults": vaults},
                aws_region=reg,
                aws_account=account_id,
                recommendation="Configure encrypted backup vault with AWS Backup Vault Lock."
            ))

            # 3. CRITICAL AUDIT DISTINCTION: Recovery Testing Validation
            # In accordance with IIA, ISACA ITAF 1205, and PCAOB AS 1105, automated configuration
            # verification of backup plans CANNOT prove data restorability. An independent auditor
            # must manually inspect restore drill execution logs, recovery point objectives (RPO),
            # and recovery time objectives (RTO).
            results.append(self.create_result(
                test_id=f"BCP-RESTORE-TEST-{reg}",
                resource_id=f"arn:aws:backup:{reg}:{account_id}:restore-drill-evidence",
                resource_type="AWS::Backup::RestoreDrill",
                status="PARTIAL",
                severity="HIGH",
                title=f"Disaster Recovery Restore Testing Manual Workpaper Validation Requirement ({reg})",
                description=(
                    f"Automated scan confirms backup plan presence in {reg}; however, technical API checks "
                    f"cannot assert data integrity or operational restore capability. In accordance with PCAOB AS 1105, "
                    f"the IT auditor must perform manual substantive inspection of documented test restore execution logs."
                ),
                technical_evidence={
                    "automated_scan_limitation": "Configuration scan cannot validate restore execution success",
                    "requires_manual_audit_workpaper": True,
                    "applicable_standard": "PCAOB AS 1105 / ISACA ITAF 1205",
                    "audit_methodology_note": "Technical snapshot configuration does not substitute for substantive recovery testing."
                },
                aws_region=reg,
                aws_account=account_id,
                finding_ref="AWS-BCP-001",
                recommendation="Execute and document quarterly test restores of production claims databases into isolated test VPC."
            ))

        return results

    def _run_sample_checks(self) -> List[Dict[str, Any]]:
        account_id = "112233445566"
        return [
            self.create_result(
                test_id="BCP-01",
                resource_id=f"arn:aws:backup:us-east-1:{account_id}:backup-plan:0a84fb72-911e-4c28-northstar-daily",
                resource_type="AWS::Backup::BackupPlan",
                status="PARTIAL",
                severity="HIGH",
                title="Automated Backup Plan Configured but Formal Recovery Testing Evidence Absent",
                description="AWS Backup daily snapshot rule covers RDS and DynamoDB with cross-region copy to us-west-2; however, automated technical scan confirms that actual recovery/restore testing requires independent manual workpaper verification.",
                technical_evidence={
                    "backup_plan_name": "northstar-claims-daily-production-plan",
                    "schedule_expression": "cron(0 5 ? * * *)",
                    "delete_after_days": 35,
                    "copy_actions": [{"DestinationVaultArn": f"arn:aws:backup:us-west-2:{account_id}:backup-vault:dr-vault"}],
                    "recovery_testing_status": "MANUAL_VALIDATION_REQUIRED",
                    "audit_methodology_note": "Technical scanner cannot assert recovery effectiveness based solely on backup presence. Auditor must inspect documented test restore execution logs."
                },
                aws_region="us-east-1",
                aws_account=account_id,
                finding_ref="AWS-BCP-001",
                recommendation="Execute and document quarterly test restores of production claims databases into isolated test VPC."
            )
        ]
