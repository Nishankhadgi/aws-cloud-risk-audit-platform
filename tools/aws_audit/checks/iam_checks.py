"""IAM Security and Access Governance Audit Checks."""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from .base_check import BaseCheck

class IAMSecurityCheck(BaseCheck):
    """Evaluates IAM identity controls, root MFA, credential rotation, and privilege scoping."""

    @property
    def check_id(self) -> str:
        return "CHK-IAM-01"

    @property
    def control_id(self) -> str:
        return "CTL-IAM-01"

    @property
    def domain(self) -> str:
        return "IAM and Access Governance"

    def run(self, regions: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        results = []

        if self.sample_mode or not self.aws_client or self.aws_client.sample_mode:
            return self._run_sample_checks()

        # Real AWS Read-Only execution
        account_id = self.aws_client.account_id

        # 1. Root Account Security & MFA via GetAccountSummary
        summary_resp = self.aws_client.call_readonly_api("iam", "get_account_summary")
        if "_error" not in summary_resp:
            summary = summary_resp.get("SummaryMap", {})
            mfa_enabled = summary.get("AccountMFAEnabled", 0) == 1
            root_keys = summary.get("AccountAccessKeysPresent", 0)
            status = "PASS" if (mfa_enabled and root_keys == 0) else "FAIL"
            results.append(self.create_result(
                test_id="IAM-ROOT-01",
                resource_id=f"arn:aws:iam::{account_id}:root",
                resource_type="AWS::IAM::RootUser",
                status=status,
                severity="CRITICAL" if status == "FAIL" else "LOW",
                title="Root Account MFA Enforcement and Access Key Hygiene",
                description=f"Root MFA enabled: {mfa_enabled}. Root active access keys: {root_keys}.",
                technical_evidence={
                    "AccountMFAEnabled": mfa_enabled,
                    "AccountAccessKeysPresent": root_keys,
                    "SummaryMap": summary
                },
                aws_account=account_id,
                finding_ref="AWS-IAM-002" if status == "FAIL" else None,
                recommendation="Enforce hardware/virtual MFA on root and delete all root access keys immediately."
            ))

        # 2. Account Password Policy Check
        pwd_policy = self.aws_client.call_readonly_api("iam", "get_account_password_policy")
        if "_error" in pwd_policy:
            if pwd_policy.get("_is_permission_denied"):
                results.append(self.create_result(
                    test_id="IAM-PWD-01",
                    resource_id="IAM Password Policy",
                    resource_type="AWS::IAM::AccountPasswordPolicy",
                    status="NOT_TESTED",
                    severity="MEDIUM",
                    title="Account Password Policy Access Restricted",
                    description="Auditor lacks read permission (iam:GetAccountPasswordPolicy) to verify password configuration.",
                    technical_evidence={"error": pwd_policy["_error"]},
                    aws_account=account_id,
                    limitation_or_error="PermissionDenied",
                ))
            else:
                results.append(self.create_result(
                    test_id="IAM-PWD-01",
                    resource_id="IAM Password Policy",
                    resource_type="AWS::IAM::AccountPasswordPolicy",
                    status="FAIL",
                    severity="HIGH",
                    title="No Custom IAM Account Password Policy Configured",
                    description="AWS default password policy is active, which does not enforce enterprise password complexity.",
                    technical_evidence={"policy_present": False, "details": pwd_policy.get("_error")},
                    aws_account=account_id,
                    finding_ref="AWS-IAM-003",
                    recommendation="Define custom IAM password policy: min length 14, uppercase, symbols, max age 90 days."
                ))
        else:
            pol = pwd_policy.get("PasswordPolicy", {})
            min_length = pol.get("MinimumPasswordLength", 0)
            status = "PASS" if min_length >= 14 and pol.get("RequireSymbols") else "PARTIAL"
            results.append(self.create_result(
                test_id="IAM-PWD-01",
                resource_id="IAM Password Policy",
                resource_type="AWS::IAM::AccountPasswordPolicy",
                status=status,
                severity="MEDIUM" if status == "PARTIAL" else "LOW",
                title="Account Password Policy Configuration Evaluation",
                description=f"Minimum length is {min_length} chars. RequireSymbols: {pol.get('RequireSymbols', False)}.",
                technical_evidence=pol,
                aws_account=account_id,
                recommendation="Enforce minimum 14 characters and symbol complexity." if status != "PASS" else "Maintain existing standard."
            ))

        # 3. IAM Users Population Inspection (Paginated)
        users = self.aws_client.paginate_readonly_api("iam", "list_users", result_key="Users")
        now_dt = datetime.now(timezone.utc)

        for user in users:
            user_name = user["UserName"]
            # Check MFA devices
            mfa_resp = self.aws_client.call_readonly_api("iam", "list_mfa_devices", UserName=user_name)
            mfa_devices = mfa_resp.get("MFADevices", []) if "_error" not in mfa_resp else []
            mfa_active = len(mfa_devices) > 0

            # Check if user has console password enabled
            login_profile_resp = self.aws_client.call_readonly_api("iam", "get_login_profile", UserName=user_name)
            has_console_pwd = "_error" not in login_profile_resp

            status = "PASS"
            severity = "LOW"
            finding_ref = None

            if has_console_pwd and not mfa_active:
                status = "FAIL"
                severity = "HIGH"
                finding_ref = "AWS-IAM-002"
            elif not mfa_active:
                status = "PARTIAL"
                severity = "MEDIUM"

            results.append(self.create_result(
                test_id=f"IAM-MFA-{user_name}",
                resource_id=f"arn:aws:iam::{account_id}:user/{user_name}",
                resource_type="AWS::IAM::User",
                status=status,
                severity=severity,
                title=f"IAM User Multi-Factor Authentication: {user_name}",
                description=f"User {user_name} MFA verification. Console login: {has_console_pwd}, Device count: {len(mfa_devices)}.",
                technical_evidence={
                    "user_name": user_name,
                    "console_access": has_console_pwd,
                    "mfa_active": mfa_active,
                    "devices": mfa_devices
                },
                aws_account=account_id,
                finding_ref=finding_ref,
                recommendation="Enforce virtual or hardware MFA token enrollment prior to console sign-in."
            ))

            # Check Programmatic Access Keys Age & Rotation
            keys_resp = self.aws_client.call_readonly_api("iam", "list_access_keys", UserName=user_name)
            if "_error" not in keys_resp:
                for key_meta in keys_resp.get("AccessKeyMetadata", []):
                    key_id = key_meta["AccessKeyId"]
                    key_status = key_meta.get("Status")
                    create_dt = key_meta.get("CreateDate")
                    age_days = (now_dt - create_dt).days if create_dt else 0

                    if age_days > 90 and key_status == "Active":
                        results.append(self.create_result(
                            test_id=f"IAM-KEY-AGE-{key_id}",
                            resource_id=f"arn:aws:iam::{account_id}:user/{user_name}/key/{key_id}",
                            resource_type="AWS::IAM::AccessKey",
                            status="PARTIAL",
                            severity="MEDIUM",
                            title=f"IAM Access Key Age Exceeds 90-Day Rotation Threshold: {user_name}",
                            description=f"Access Key {key_id} is active and has been in service for {age_days} days without rotation.",
                            technical_evidence={
                                "user_name": user_name,
                                "access_key_id": key_id,
                                "age_days": age_days,
                                "status": key_status
                            },
                            aws_account=account_id,
                            finding_ref="AWS-IAM-004",
                            recommendation="Rotate access key and automate credential lifecycle via AWS Secrets Manager or IAM Roles Anywhere."
                        ))

        # 4. IAM Roles and Excessive Permissions Check (Paginated)
        roles = self.aws_client.paginate_readonly_api("iam", "list_roles", result_key="Roles")
        for role in roles:
            role_name = role.get("RoleName", "")
            # Inspect roles attached policies
            attached_resp = self.aws_client.call_readonly_api("iam", "list_attached_role_policies", RoleName=role_name)
            if "_error" not in attached_resp:
                for pol in attached_resp.get("AttachedPolicies", []):
                    pol_arn = pol.get("PolicyArn", "")
                    pol_name = pol.get("PolicyName", "")
                    if "AdministratorAccess" in pol_name:
                        results.append(self.create_result(
                            test_id=f"IAM-ROLE-ADMIN-{role_name}",
                            resource_id=role.get("Arn", f"arn:aws:iam::{account_id}:role/{role_name}"),
                            resource_type="AWS::IAM::Role",
                            status="FAIL",
                            severity="CRITICAL",
                            title=f"Excessive Wildcard AdministratorAccess Policy Attached to Role: {role_name}",
                            description=f"Role {role_name} has AWS managed policy AdministratorAccess attached. Violates principle of least privilege.",
                            technical_evidence={
                                "role_name": role_name,
                                "attached_policy": pol_arn,
                                "assume_role_policy_document": role.get("AssumeRolePolicyDocument")
                            },
                            aws_account=account_id,
                            finding_ref="AWS-IAM-001",
                            recommendation="Replace full AdministratorAccess with scoped least-privilege permissions."
                        ))

        return results

    def _run_sample_checks(self) -> List[Dict[str, Any]]:
        """Pre-configured illustrative sample tests for Northstar Claims Technologies."""
        account_id = "112233445566"
        return [
            self.create_result(
                test_id="IAM-ROOT-01",
                resource_id=f"arn:aws:iam::{account_id}:root",
                resource_type="AWS::IAM::RootUser",
                status="PASS",
                severity="CRITICAL",
                title="Root Account Hardware/Virtual MFA Enforcement",
                description="Verified that root account possesses active hardware MFA token and zero active access keys.",
                technical_evidence={
                    "account_mfa_enabled": True,
                    "mfa_type": "Hardware TOTP (Gemalto)",
                    "root_access_keys_count": 0,
                    "last_root_login": "2026-09-14T08:12:00Z (Emergency Break-Glass Drill)"
                },
                aws_account=account_id,
                recommendation="Continue storing physical token in dual-custody corporate vault."
            ),
            self.create_result(
                test_id="IAM-02",
                resource_id=f"arn:aws:iam::{account_id}:user/claims-lead-dev",
                resource_type="AWS::IAM::User",
                status="FAIL",
                severity="HIGH",
                title="Console Access Enabled for Privileged Identity Without Active MFA",
                description="IAM user claims-lead-dev has active console password authentication enabled but lacks enrolled MFA token.",
                technical_evidence={
                    "user_name": "claims-lead-dev",
                    "password_enabled": True,
                    "password_last_used": "2026-11-08T14:22:18Z",
                    "mfa_devices": [],
                    "attached_policies": ["arn:aws:iam::aws:policy/PowerUserAccess"]
                },
                aws_account=account_id,
                finding_ref="AWS-IAM-002",
                recommendation="Immediately enforce MFA requirement via IAM policy condition aws:MultiFactorAuthPresent or deactivate console password."
            ),
            self.create_result(
                test_id="IAM-01",
                resource_id=f"arn:aws:iam::{account_id}:role/ClaimsPipelineDeployerRole",
                resource_type="AWS::IAM::Role",
                status="FAIL",
                severity="CRITICAL",
                title="Excessive Wildcard Administrator Privileges Assigned to CI/CD Pipeline Role",
                description="CI/CD deployment role ClaimsPipelineDeployerRole has AdministratorAccess (Action: *, Resource: *) attached instead of least-privilege service actions.",
                technical_evidence={
                    "role_name": "ClaimsPipelineDeployerRole",
                    "attached_policies": ["arn:aws:iam::aws:policy/AdministratorAccess"],
                    "inline_policies": {},
                    "trust_principal": "arn:aws:iam::112233445566:oidc-provider/token.actions.githubusercontent.com"
                },
                aws_account=account_id,
                finding_ref="AWS-IAM-001",
                recommendation="Refactor pipeline permissions using AWS IAM Access Analyzer into discrete least-privilege IAM policies scoped to deployment services."
            ),
            self.create_result(
                test_id="IAM-03",
                resource_id=f"arn:aws:iam::{account_id}:role/ClaimsLambdaExecutionRole",
                resource_type="AWS::IAM::Role",
                status="PASS",
                severity="LOW",
                title="Microservice Execution Role Trust Boundary and Scoped Actions",
                description="Lambda execution role adheres to least-privilege scoping: limited to reading claims queue and writing to claim-records DynamoDB table.",
                technical_evidence={
                    "role_name": "ClaimsLambdaExecutionRole",
                    "trust_policy_service": "lambda.amazonaws.com",
                    "allowed_actions": ["sqs:ReceiveMessage", "sqs:DeleteMessage", "dynamodb:PutItem", "logs:CreateLogStream"],
                    "wildcard_resources": False
                },
                aws_account=account_id,
                recommendation="Maintain periodic automated review of role policy execution."
            ),
            self.create_result(
                test_id="IAM-04",
                resource_id=f"arn:aws:iam::{account_id}:user/claims-batch-svc",
                resource_type="AWS::IAM::User",
                status="PARTIAL",
                severity="MEDIUM",
                title="Service Account Access Key Age Exceeds Recommended 90-Day Rotation",
                description="IAM programmatic access key AKIAEXAMPLE004B has been active for 142 days without key rotation.",
                technical_evidence={
                    "user_name": "claims-batch-svc",
                    "access_key_id": "AKIAEXAMPLE004B",
                    "create_date": "2026-06-23T10:00:00Z",
                    "age_days": 142,
                    "last_used_service": "s3",
                    "status": "Active"
                },
                aws_account=account_id,
                finding_ref="AWS-IAM-004",
                recommendation="Migrate legacy batch user to IAM Roles Anywhere or AWS Secrets Manager automated rotation every 90 days."
            ),
        ]
