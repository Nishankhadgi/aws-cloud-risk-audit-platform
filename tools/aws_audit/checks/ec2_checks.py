"""Amazon EC2 and Network Security Group Audit Checks."""

from typing import List, Dict, Any, Optional
from .base_check import BaseCheck

class EC2SecurityCheck(BaseCheck):
    """Evaluates EBS default volume encryption and security group ingress boundaries."""

    @property
    def check_id(self) -> str:
        return "CHK-EC2-01"

    @property
    def control_id(self) -> str:
        return "CTL-NET-01"

    @property
    def domain(self) -> str:
        return "Vulnerability and Configuration Management"

    def run(self, regions: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        if self.sample_mode or not self.aws_client or self.aws_client.sample_mode:
            return self._run_sample_checks()

        results = []
        regions = regions or ["us-east-1"]
        account_id = self.aws_client.account_id

        for reg in regions:
            # 1. EBS Encryption by Default
            ebs_resp = self.aws_client.call_readonly_api("ec2", "get_ebs_encryption_by_default", region_name=reg)
            if "_error" not in ebs_resp:
                ebs_enc = ebs_resp.get("EbsEncryptionByDefault", False)
                results.append(self.create_result(
                    test_id=f"EC2-EBS-{reg}",
                    resource_id=f"EBS Default Encryption ({reg})",
                    resource_type="AWS::EC2::EBS",
                    status="PASS" if ebs_enc else "FAIL",
                    severity="HIGH" if not ebs_enc else "LOW",
                    title=f"EBS Encryption by Default Configuration ({reg})",
                    description=f"Region {reg} EBS default block storage encryption status: {ebs_enc}.",
                    technical_evidence={"EbsEncryptionByDefault": ebs_enc},
                    aws_region=reg,
                    aws_account=account_id,
                    recommendation="Enable EBS encryption by default using AWS KMS Customer Managed Key."
                ))

            # 2. Security Groups Administrative Ingress (Paginated)
            security_groups = self.aws_client.paginate_readonly_api(
                "ec2", "describe_security_groups", region_name=reg, result_key="SecurityGroups"
            )
            for sg in security_groups:
                sg_id = sg.get("GroupId", "")
                sg_name = sg.get("GroupName", "")
                risky_rules = []

                for perm in sg.get("IpPermissions", []):
                    ip_protocol = str(perm.get("IpProtocol", "")).lower()
                    from_p = perm.get("FromPort")
                    to_p = perm.get("ToPort")

                    # Check if port 22 (SSH) or 3389 (RDP) or all ports (-1) are exposed
                    is_admin_port = False
                    if ip_protocol == "-1":
                        is_admin_port = True
                    elif from_p is not None and to_p is not None:
                        if (from_p <= 22 <= to_p) or (from_p <= 3389 <= to_p):
                            is_admin_port = True

                    if not is_admin_port:
                        continue

                    # Check IPv4 0.0.0.0/0
                    for ip_range in perm.get("IpRanges", []):
                        if ip_range.get("CidrIp") == "0.0.0.0/0":
                            risky_rules.append({
                                "protocol": ip_protocol,
                                "port_range": f"{from_p}-{to_p}" if ip_protocol != "-1" else "ALL",
                                "cidr": "0.0.0.0/0",
                                "type": "IPv4 Public Internet"
                            })

                    # Check IPv6 ::/0
                    for ipv6_range in perm.get("Ipv6Ranges", []):
                        if ipv6_range.get("CidrIpv6") == "::/0":
                            risky_rules.append({
                                "protocol": ip_protocol,
                                "port_range": f"{from_p}-{to_p}" if ip_protocol != "-1" else "ALL",
                                "cidr": "::/0",
                                "type": "IPv6 Public Internet"
                            })

                if risky_rules:
                    results.append(self.create_result(
                        test_id=f"EC2-SG-{sg_id}",
                        resource_id=sg_id,
                        resource_type="AWS::EC2::SecurityGroup",
                        status="FAIL",
                        severity="CRITICAL",
                        title=f"Security Group Administrative Port Exposure: {sg_name} ({sg_id})",
                        description=f"Security group permits unrestricted public ingress (0.0.0.0/0 or ::/0) to administrative management ports: {risky_rules}.",
                        technical_evidence={"GroupId": sg_id, "GroupName": sg_name, "risky_rules": risky_rules},
                        aws_region=reg,
                        aws_account=account_id,
                        finding_ref="AWS-NET-001",
                        recommendation="Remove 0.0.0.0/0 and ::/0 ingress rules on port 22/3389; enforce AWS Systems Manager Session Manager or bastion over VPN."
                    ))

        return results

    def _run_sample_checks(self) -> List[Dict[str, Any]]:
        account_id = "112233445566"
        return [
            self.create_result(
                test_id="NET-01",
                resource_id=f"sg-09827384aef1729b1",
                resource_type="AWS::EC2::SecurityGroup",
                status="FAIL",
                severity="HIGH",
                title="Security Group Permits Inbound SSH (Port 22) from Public Internet",
                description="Security group claims-bastion-sg allows TCP port 22 inbound from CIDR 0.0.0.0/0, violating perimeter ingress controls.",
                technical_evidence={
                    "GroupId": "sg-09827384aef1729b1",
                    "GroupName": "northstar-claims-bastion-sg",
                    "Description": "Legacy bastion host ingress rules",
                    "VpcId": "vpc-018274a9bc837190e",
                    "OffendingRule": {
                        "IpProtocol": "tcp",
                        "FromPort": 22,
                        "ToPort": 22,
                        "CidrIp": "0.0.0.0/0"
                    }
                },
                aws_region="us-east-1",
                aws_account=account_id,
                finding_ref="AWS-NET-001",
                recommendation="Decommission public SSH ingress; mandate AWS Systems Manager Session Manager with IAM authorization and CloudTrail session logging."
            ),
            self.create_result(
                test_id="NET-02",
                resource_id=f"arn:aws:ec2:us-east-1:{account_id}:ebs-encryption",
                resource_type="AWS::EC2::EBS",
                status="PASS",
                severity="LOW",
                title="EBS Encryption by Default Active in Production Region",
                description="EBS encryption by default is enforced in us-east-1, ensuring all newly provisioned EBS volumes are encrypted using AWS KMS.",
                technical_evidence={
                    "EbsEncryptionByDefault": True,
                    "KmsKeyId": f"arn:aws:kms:us-east-1:{account_id}:key/b498f82a-e837-4d92-965a-claimscrypto01"
                },
                aws_region="us-east-1",
                aws_account=account_id,
                recommendation="Maintain default encryption across all operational regions."
            )
        ]
