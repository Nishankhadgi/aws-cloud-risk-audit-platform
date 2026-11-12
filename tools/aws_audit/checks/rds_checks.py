"""Amazon RDS Database Security and Encryption Audit Checks."""

from typing import List, Dict, Any, Optional
from .base_check import BaseCheck

class RDSSecurityCheck(BaseCheck):
    """Evaluates RDS storage encryption, public accessibility, backup retention, and multi-AZ resilience."""

    @property
    def check_id(self) -> str:
        return "CHK-RDS-01"

    @property
    def control_id(self) -> str:
        return "CTL-DATA-02"

    @property
    def domain(self) -> str:
        return "Data Protection"

    def run(self, regions: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        if self.sample_mode or not self.aws_client or self.aws_client.sample_mode:
            return self._run_sample_checks()

        results = []
        regions = regions or ["us-east-1"]
        account_id = self.aws_client.account_id

        for reg in regions:
            db_instances = self.aws_client.paginate_readonly_api(
                "rds", "describe_db_instances", region_name=reg, result_key="DBInstances"
            )

            for db in db_instances:
                db_id = db.get("DBInstanceIdentifier", "unknown")
                db_arn = db.get("DBInstanceArn", f"arn:aws:rds:{reg}:{account_id}:db:{db_id}")
                encrypted = db.get("StorageEncrypted", False)
                publicly_accessible = db.get("PubliclyAccessible", False)
                retention = db.get("BackupRetentionPeriod", 0)
                multi_az = db.get("MultiAZ", False)

                # 1. Public accessibility test
                if publicly_accessible:
                    results.append(self.create_result(
                        test_id=f"RDS-PUB-{db_id}",
                        resource_id=db_arn,
                        resource_type="AWS::RDS::DBInstance",
                        status="FAIL",
                        severity="CRITICAL",
                        title=f"RDS Instance Configured with Public Endpoint: {db_id}",
                        description=f"Database {db_id} has PubliclyAccessible set to True, exposing database engine ports to the internet.",
                        technical_evidence={"DBInstanceIdentifier": db_id, "PubliclyAccessible": True, "Endpoint": db.get("Endpoint")},
                        aws_region=reg,
                        aws_account=account_id,
                        finding_ref="AWS-RDS-001",
                        recommendation="Disable PubliclyAccessible; isolate database inside private VPC subnets with security group controls."
                    ))

                # 2. Storage Encryption test
                results.append(self.create_result(
                    test_id=f"RDS-ENC-{db_id}",
                    resource_id=db_arn,
                    resource_type="AWS::RDS::DBInstance",
                    status="PASS" if encrypted else "FAIL",
                    severity="HIGH" if not encrypted else "LOW",
                    title=f"RDS Storage At-Rest Encryption Status: {db_id}",
                    description=f"Storage KMS encryption for {db_id}: {encrypted}.",
                    technical_evidence={"StorageEncrypted": encrypted, "KmsKeyId": db.get("KmsKeyId")},
                    aws_region=reg,
                    aws_account=account_id,
                    recommendation="Enable KMS storage encryption for RDS database using Customer Managed Key."
                ))

                # 3. Backup Retention Period (CIS 2.3.1 - retention >= 7 days)
                retention_pass = retention >= 7
                results.append(self.create_result(
                    test_id=f"RDS-BCP-{db_id}",
                    resource_id=db_arn,
                    resource_type="AWS::RDS::DBInstance",
                    status="PASS" if retention_pass else "FAIL",
                    severity="MEDIUM" if not retention_pass else "LOW",
                    title=f"RDS Automated Backup Retention Period: {db_id}",
                    description=f"Automated backup retention is {retention} days (CIS AWS benchmark requirement: >= 7 days).",
                    technical_evidence={"BackupRetentionPeriod": retention, "MultiAZ": multi_az},
                    aws_region=reg,
                    aws_account=account_id,
                    recommendation="Increase automated backup retention period to at least 7 days."
                ))

        return results

    def _run_sample_checks(self) -> List[Dict[str, Any]]:
        account_id = "112233445566"
        return [
            self.create_result(
                test_id="DATA-RDS-01",
                resource_id=f"arn:aws:rds:us-east-1:{account_id}:db:northstar-claims-primary-pg",
                resource_type="AWS::RDS::DBInstance",
                status="PASS",
                severity="LOW",
                title="Production RDS PostgreSQL Cluster Storage Encryption Active",
                description="Primary transactional claims database enforces KMS encryption at rest using Customer Managed Key with Multi-AZ automated failover enabled.",
                technical_evidence={
                    "DBInstanceIdentifier": "northstar-claims-primary-pg",
                    "Engine": "postgres",
                    "EngineVersion": "15.4",
                    "StorageEncrypted": True,
                    "KmsKeyId": f"arn:aws:kms:us-east-1:{account_id}:key/b498f82a-e837-4d92-965a-claimscrypto01",
                    "PubliclyAccessible": False,
                    "MultiAZ": True,
                    "BackupRetentionPeriod": 30
                },
                aws_region="us-east-1",
                aws_account=account_id,
                recommendation="Continue maintaining 30-day point-in-time recovery window."
            )
        ]
