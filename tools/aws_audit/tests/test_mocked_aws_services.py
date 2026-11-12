"""
Comprehensive AWS Security Auditor Unit Tests with Mocked AWS Responses.
Validates:
1. Strict read-only API enforcement & mutating method blocking.
2. Robust pagination (Boto3 paginator & manual NextToken/Marker loops).
3. Error classification (AccessDenied, Throttling).
4. Logic for all 8 audit check modules (IAM, S3, KMS, CloudTrail, EC2, RDS, Backup, Security Monitoring).
5. Explicit distinction between technical configuration and manual substantive restore testing.
"""

import pytest
from unittest.mock import MagicMock
from datetime import datetime, timezone, timedelta
from botocore.exceptions import ClientError

from aws_client import SafeAWSClient, SecurityAuditViolationError
from checks.iam_checks import IAMSecurityCheck
from checks.s3_checks import S3SecurityCheck
from checks.kms_checks import KMSKeyAuditCheck
from checks.cloudtrail_checks import CloudTrailSecurityCheck
from checks.ec2_checks import EC2SecurityCheck
from checks.rds_checks import RDSSecurityCheck
from checks.security_monitoring_checks import SecurityMonitoringAuditCheck
from checks.backup_checks import BackupAuditCheck


def make_test_client():
    """Constructs a non-sample SafeAWSClient backed by a mock session for unit tests."""
    mock_session = MagicMock()
    return SafeAWSClient(session=mock_session, account_id="112233445566", sample_mode=False)


# ==========================================
# 1. READ-ONLY ENFORCEMENT & SAFETY TESTS
# ==========================================

def test_safe_client_blocks_all_mutating_verbs():
    """Verify that any AWS mutating API prefix is blocked with SecurityAuditViolationError."""
    client = make_test_client()

    mutating_calls = [
        ("s3", "delete_bucket"),
        ("s3", "put_bucket_policy"),
        ("iam", "create_user"),
        ("iam", "update_account_password_policy"),
        ("iam", "attach_user_policy"),
        ("ec2", "terminate_instances"),
        ("ec2", "stop_instances"),
        ("ec2", "authorize_security_group_ingress"),
        ("rds", "modify_db_instance"),
        ("rds", "delete_db_instance"),
        ("kms", "disable_key"),
        ("cloudtrail", "stop_logging"),
        ("backup", "delete_backup_plan"),
    ]

    for service, op in mutating_calls:
        with pytest.raises(SecurityAuditViolationError):
            client.call_readonly_api(service, op)

        with pytest.raises(SecurityAuditViolationError):
            client.paginate_readonly_api(service, op)


def test_safe_client_blocks_non_whitelisted_verbs():
    """Verify that operations not starting with approved read prefixes are rejected."""
    client = make_test_client()
    with pytest.raises(SecurityAuditViolationError):
        client.call_readonly_api("ec2", "arbitrary_unauthorized_call")


# ==========================================
# 2. PAGINATION ENGINE TESTS
# ==========================================

def test_pagination_native_paginator():
    """Test pagination when Boto3 client natively supports can_paginate()."""
    client = make_test_client()
    mock_boto_client = MagicMock()
    mock_boto_client.can_paginate.return_value = True

    mock_paginator = MagicMock()
    # Return 2 pages of users
    page1 = {"Users": [{"UserName": "user1"}, {"UserName": "user2"}]}
    page2 = {"Users": [{"UserName": "user3"}]}
    mock_paginator.paginate.return_value = [page1, page2]
    mock_boto_client.get_paginator.return_value = mock_paginator

    client._clients["iam:default"] = mock_boto_client

    results = client.paginate_readonly_api("iam", "list_users", result_key="Users")
    assert len(results) == 3
    assert [u["UserName"] for u in results] == ["user1", "user2", "user3"]
    mock_boto_client.get_paginator.assert_called_once_with("list_users")


def test_pagination_manual_token_loop():
    """Test manual NextToken loop when can_paginate() is False."""
    client = make_test_client()
    mock_boto_client = MagicMock()
    mock_boto_client.can_paginate.return_value = False

    # Simulate 2 pages with NextToken
    page1 = {"Keys": [{"KeyId": "key-1"}], "NextToken": "tok-page2"}
    page2 = {"Keys": [{"KeyId": "key-2"}]}

    mock_boto_client.list_keys.side_effect = [page1, page2]
    client._clients["kms:us-east-1"] = mock_boto_client

    results = client.paginate_readonly_api("kms", "list_keys", region_name="us-east-1", result_key="Keys")
    assert len(results) == 2
    assert [k["KeyId"] for k in results] == ["key-1", "key-2"]
    assert mock_boto_client.list_keys.call_count == 2


def test_pagination_safety_limit_capping():
    """Verify that pagination terminates at max_pages to prevent infinite API consumption."""
    client = make_test_client()
    mock_boto_client = MagicMock()
    mock_boto_client.can_paginate.return_value = True

    mock_paginator = MagicMock()
    # Infinite generator of pages
    def infinite_pages():
        idx = 0
        while True:
            idx += 1
            yield {"Items": [{"id": idx}]}

    mock_paginator.paginate.return_value = infinite_pages()
    mock_boto_client.get_paginator.return_value = mock_paginator
    client._clients["dynamodb:default"] = mock_boto_client

    # Request max_pages=3
    results = client.paginate_readonly_api("dynamodb", "describe_limits", result_key="Items", max_pages=3)
    assert len(results) == 3


# ==========================================
# 3. ERROR CLASSIFICATION TESTS
# ==========================================

def test_error_classification_access_denied():
    """Verify that AccessDenied ClientError is flagged as permission denied."""
    client = make_test_client()
    mock_boto_client = MagicMock()
    error_response = {"Error": {"Code": "AccessDenied", "Message": "Access Denied to Auditor"}}
    mock_boto_client.get_account_password_policy.side_effect = ClientError(error_response, "GetAccountPasswordPolicy")
    client._clients["iam:default"] = mock_boto_client

    resp = client.call_readonly_api("iam", "get_account_password_policy")
    assert resp["_is_permission_denied"] is True
    assert resp["_error_code"] == "AccessDenied"


def test_error_classification_throttling():
    """Verify that RequestLimitExceeded ClientError is flagged as throttled."""
    client = make_test_client()
    mock_boto_client = MagicMock()
    error_response = {"Error": {"Code": "RequestLimitExceeded", "Message": "Rate limit exceeded"}}
    mock_boto_client.describe_security_groups.side_effect = ClientError(error_response, "DescribeSecurityGroups")
    client._clients["ec2:us-east-1"] = mock_boto_client

    resp = client.call_readonly_api("ec2", "describe_security_groups", region_name="us-east-1")
    assert resp["_is_throttled"] is True
    assert resp["_error_code"] == "RequestLimitExceeded"


# ==========================================
# 4. AUDIT CHECK MODULE TESTS WITH MOCKS
# ==========================================

def test_iam_check_with_mocked_aws():
    """Test IAM checks: Root MFA, user without MFA, access key age, and admin role."""
    client = make_test_client()
    mock_iam = MagicMock()
    mock_iam.can_paginate.return_value = False

    # 1. Root MFA & summary
    mock_iam.get_account_summary.return_value = {
        "SummaryMap": {"AccountMFAEnabled": 1, "AccountAccessKeysPresent": 0}
    }
    # 2. Password policy
    mock_iam.get_account_password_policy.return_value = {
        "PasswordPolicy": {"MinimumPasswordLength": 14, "RequireSymbols": True}
    }
    # 3. Users
    mock_iam.list_users.return_value = {
        "Users": [
            {"UserName": "compliant-admin"},
            {"UserName": "unprotected-dev"},
        ]
    }
    # MFA status
    mock_iam.list_mfa_devices.side_effect = lambda UserName: {
        "MFADevices": [{"SerialNumber": "arn:aws:iam::123:mfa/dev"}] if UserName == "compliant-admin" else []
    }
    # Login profile (console password)
    mock_iam.get_login_profile.side_effect = lambda UserName: {
        "LoginProfile": {"UserName": UserName}
    }
    # Access keys
    mock_iam.list_access_keys.side_effect = lambda UserName: {
        "AccessKeyMetadata": [
            {
                "AccessKeyId": "AKIAEXAMPLETEST1",
                "Status": "Active",
                "CreateDate": datetime.now(timezone.utc) - timedelta(days=120)  # > 90 days old
            }
        ] if UserName == "unprotected-dev" else []
    }
    # 4. Roles
    mock_iam.list_roles.return_value = {
        "Roles": [{"RoleName": "OverprivilegedPipelineRole", "Arn": "arn:aws:iam::112233445566:role/OverprivilegedPipelineRole"}]
    }
    mock_iam.list_attached_role_policies.return_value = {
        "AttachedPolicies": [{"PolicyName": "AdministratorAccess", "PolicyArn": "arn:aws:iam::aws:policy/AdministratorAccess"}]
    }

    client._clients["iam:default"] = mock_iam

    check = IAMSecurityCheck(aws_client=client, sample_mode=False)
    results = check.run()

    # Root MFA pass
    root_res = next(r for r in results if r["test_id"] == "IAM-ROOT-01")
    assert root_res["status"] == "PASS"

    # Password policy pass
    pwd_res = next(r for r in results if r["test_id"] == "IAM-PWD-01")
    assert pwd_res["status"] == "PASS"

    # unprotected-dev fails MFA
    dev_mfa = next(r for r in results if r["test_id"] == "IAM-MFA-unprotected-dev")
    assert dev_mfa["status"] == "FAIL"
    assert dev_mfa["severity"] == "HIGH"
    assert dev_mfa["finding_reference"] == "AWS-IAM-002"

    # Key age > 90 days partial
    key_res = next(r for r in results if r["test_id"] == "IAM-KEY-AGE-AKIAEXAMPLETEST1")
    assert key_res["status"] == "PARTIAL"
    assert key_res["finding_reference"] == "AWS-IAM-004"

    # Overprivileged role fails
    role_res = next(r for r in results if "IAM-ROLE-ADMIN" in r["test_id"])
    assert role_res["status"] == "FAIL"
    assert role_res["severity"] == "CRITICAL"
    assert role_res["finding_reference"] == "AWS-IAM-001"


def test_s3_check_with_mitigated_account_pab():
    """Verify that missing bucket PAB is PARTIAL (not Critical FAIL) when account PAB is active."""
    client = make_test_client()
    mock_s3ctrl = MagicMock()
    mock_s3 = MagicMock()

    # Account-level PAB is fully active
    mock_s3ctrl.get_public_access_block.return_value = {
        "PublicAccessBlockConfiguration": {
            "BlockPublicAcls": True,
            "IgnorePublicAcls": True,
            "BlockPublicPolicy": True,
            "RestrictPublicBuckets": True,
        }
    }
    # Bucket listing
    mock_s3.list_buckets.return_value = {
        "Buckets": [{"Name": "northstar-claims-bucket"}]
    }
    # Bucket itself lacks PAB
    mock_s3.get_public_access_block.return_value = {
        "PublicAccessBlockConfiguration": {
            "BlockPublicAcls": False,
            "IgnorePublicAcls": False,
            "BlockPublicPolicy": False,
            "RestrictPublicBuckets": False,
        }
    }
    # Bucket encryption configured
    mock_s3.get_bucket_encryption.return_value = {"ServerSideEncryptionConfiguration": {}}
    # Bucket versioning enabled
    mock_s3.get_bucket_versioning.return_value = {"Status": "Enabled"}

    client._clients["s3control:default"] = mock_s3ctrl
    client._clients["s3:default"] = mock_s3

    check = S3SecurityCheck(aws_client=client, sample_mode=False)
    results = check.run()

    pab_res = next(r for r in results if "DATA-S3-PAB" in r["test_id"])
    # Crucial professional audit check: Must be PARTIAL, not FAIL, due to compensating control!
    assert pab_res["status"] == "PARTIAL"
    assert pab_res["severity"] == "MEDIUM"
    assert pab_res["technical_evidence"]["compensating_control_active"] is True


def test_ec2_check_detects_port_ranges_and_ipv6():
    """Verify EC2 checks identify port ranges covering SSH (22) and IPv6 ::/0 exposure."""
    client = make_test_client()
    mock_ec2 = MagicMock()
    mock_ec2.can_paginate.return_value = False

    # EBS encryption enabled
    mock_ec2.get_ebs_encryption_by_default.return_value = {"EbsEncryptionByDefault": True}

    # Security Group with port range 20-25 (covers 22!) open to IPv4 0.0.0.0/0
    sg1 = {
        "GroupId": "sg-range22",
        "GroupName": "range-bastion",
        "IpPermissions": [
            {
                "IpProtocol": "tcp",
                "FromPort": 20,
                "ToPort": 25,
                "IpRanges": [{"CidrIp": "0.0.0.0/0"}],
            }
        ]
    }
    # Security Group with IPv6 ::/0 open on port 3389
    sg2 = {
        "GroupId": "sg-ipv6rdp",
        "GroupName": "ipv6-rdp",
        "IpPermissions": [
            {
                "IpProtocol": "tcp",
                "FromPort": 3389,
                "ToPort": 3389,
                "Ipv6Ranges": [{"CidrIpv6": "::/0"}],
            }
        ]
    }
    # Safe Security Group (only port 443)
    sg3 = {
        "GroupId": "sg-safe-web",
        "GroupName": "web-ssl",
        "IpPermissions": [
            {
                "IpProtocol": "tcp",
                "FromPort": 443,
                "ToPort": 443,
                "IpRanges": [{"CidrIp": "0.0.0.0/0"}],
            }
        ]
    }

    mock_ec2.describe_security_groups.return_value = {"SecurityGroups": [sg1, sg2, sg3]}
    client._clients["ec2:us-east-1"] = mock_ec2

    check = EC2SecurityCheck(aws_client=client, sample_mode=False)
    results = check.run(regions=["us-east-1"])

    # sg-range22 must fail
    res_range = next((r for r in results if r["resource_id"] == "sg-range22"), None)
    assert res_range is not None
    assert res_range["status"] == "FAIL"
    assert res_range["severity"] == "CRITICAL"

    # sg-ipv6rdp must fail
    res_ipv6 = next((r for r in results if r["resource_id"] == "sg-ipv6rdp"), None)
    assert res_ipv6 is not None
    assert res_ipv6["status"] == "FAIL"

    # sg-safe-web must NOT have a failure result
    res_safe = next((r for r in results if r["resource_id"] == "sg-safe-web"), None)
    assert res_safe is None


def test_rds_check_evaluates_public_endpoints_and_retention():
    """Verify RDS checks flag public accessibility and retention < 7 days."""
    client = make_test_client()
    mock_rds = MagicMock()
    mock_rds.can_paginate.return_value = False

    mock_rds.describe_db_instances.return_value = {
        "DBInstances": [
            {
                "DBInstanceIdentifier": "dev-pg-public",
                "DBInstanceArn": "arn:aws:rds:us-east-1:112233445566:db:dev-pg-public",
                "PubliclyAccessible": True,
                "StorageEncrypted": False,
                "BackupRetentionPeriod": 3,  # < 7 days
                "MultiAZ": False,
            }
        ]
    }
    client._clients["rds:us-east-1"] = mock_rds

    check = RDSSecurityCheck(aws_client=client, sample_mode=False)
    results = check.run(regions=["us-east-1"])

    pub_res = next(r for r in results if "RDS-PUB" in r["test_id"])
    assert pub_res["status"] == "FAIL"
    assert pub_res["severity"] == "CRITICAL"

    enc_res = next(r for r in results if "RDS-ENC" in r["test_id"])
    assert enc_res["status"] == "FAIL"

    bcp_res = next(r for r in results if "RDS-BCP" in r["test_id"])
    assert bcp_res["status"] == "FAIL"
    assert bcp_res["severity"] == "MEDIUM"


def test_backup_check_distinguishes_technical_vs_manual_validation():
    """
    CRITICAL AUDIT STANDARD TEST:
    Verify that automated backup scan emits a distinct result for Recovery Testing Validation,
    explicitly documenting that technical configuration checks cannot substitute for substantive
    manual auditor inspection of restore drill workpapers.
    """
    client = make_test_client()
    mock_backup = MagicMock()
    mock_backup.can_paginate.return_value = False

    mock_backup.list_backup_plans.return_value = {
        "BackupPlansList": [{"BackupPlanName": "DailyProductionPlan"}]
    }
    mock_backup.list_backup_vaults.return_value = {
        "BackupVaultList": [{"BackupVaultName": "PrimaryVault"}]
    }
    client._clients["backup:us-east-1"] = mock_backup

    check = BackupAuditCheck(aws_client=client, sample_mode=False)
    results = check.run(regions=["us-east-1"])

    # 1. Technical plan check passes
    plan_res = next(r for r in results if r["test_id"] == "BCP-PLAN-us-east-1")
    assert plan_res["status"] == "PASS"

    # 2. Substantive recovery drill check flags PARTIAL and requires manual workpaper
    restore_res = next(r for r in results if "BCP-RESTORE-TEST" in r["test_id"])
    assert restore_res["status"] == "PARTIAL"
    assert restore_res["severity"] == "HIGH"
    assert restore_res["technical_evidence"]["requires_manual_audit_workpaper"] is True
    assert "PCAOB AS 1105" in restore_res["technical_evidence"]["applicable_standard"]


def test_kms_check_eliminates_false_positive_on_asymmetric_key():
    """Verify asymmetric CMK receives NOT_APPLICABLE rather than FAIL for automated rotation."""
    client = make_test_client()
    mock_kms = MagicMock()
    mock_kms.can_paginate.return_value = False

    # Return one asymmetric key and one symmetric key
    mock_kms.list_keys.return_value = {
        "Keys": [{"KeyId": "asymm-key-id"}, {"KeyId": "symm-key-id"}]
    }
    mock_kms.describe_key.side_effect = lambda KeyId, **kwargs: {
        "KeyMetadata": {
            "KeyId": KeyId,
            "Arn": f"arn:aws:kms:us-east-1:112233445566:key/{KeyId}",
            "KeyManager": "CUSTOMER",
            "KeySpec": "RSA_2048" if KeyId == "asymm-key-id" else "SYMMETRIC_DEFAULT",
            "Origin": "AWS_KMS",
            "KeyState": "Enabled",
        }
    }
    mock_kms.get_key_rotation_status.return_value = {"KeyRotationEnabled": True}
    client._clients["kms:us-east-1"] = mock_kms

    check = KMSKeyAuditCheck(aws_client=client, sample_mode=False)
    results = check.run(regions=["us-east-1"])

    asymm_res = next(r for r in results if "asymm-ke" in r["test_id"])
    assert asymm_res["status"] == "NOT_APPLICABLE"
    assert asymm_res["severity"] == "INFORMATIONAL"

    symm_res = next(r for r in results if "symm-key" in r["test_id"])
    assert symm_res["status"] == "PASS"


def test_cloudtrail_and_monitoring_checks_with_mocks():
    """Test CloudTrail data events check and Security Hub / GuardDuty checks."""
    client = make_test_client()

    # CloudTrail mock
    mock_trail = MagicMock()
    mock_trail.describe_trails.return_value = {
        "trailList": [
            {
                "Name": "audit-trail",
                "TrailARN": "arn:aws:cloudtrail:us-east-1:112233445566:trail/audit-trail",
                "IsMultiRegionTrail": True,
                "LogFileValidationEnabled": True,
                "KmsKeyId": "arn:aws:kms:us-east-1:112233445566:key/123",
            }
        ]
    }
    mock_trail.get_trail_status.return_value = {"IsLogging": True}
    # No data events configured
    mock_trail.get_event_selectors.return_value = {"EventSelectors": [{"DataResources": []}]}
    client._clients["cloudtrail:us-east-1"] = mock_trail

    trail_check = CloudTrailSecurityCheck(aws_client=client, sample_mode=False)
    trail_results = trail_check.run()
    trail_res = trail_results[0]
    assert trail_res["status"] == "PARTIAL"
    assert trail_res["severity"] == "MEDIUM"
    assert trail_res["technical_evidence"]["HasDataEvents"] is False

    # Security Monitoring mock
    mock_gd = MagicMock()
    mock_gd.list_detectors.return_value = {"DetectorIds": ["det-1"]}
    mock_gd.get_detector.return_value = {"Status": "ENABLED"}
    client._clients["guardduty:us-east-1"] = mock_gd

    mock_cfg = MagicMock()
    mock_cfg.describe_configuration_recorder_status.return_value = {
        "ConfigurationRecordersStatus": [{"recording": True}]
    }
    client._clients["config:us-east-1"] = mock_cfg

    mock_hub = MagicMock()
    mock_hub.describe_hub.return_value = {"HubArn": "arn:aws:securityhub:us-east-1:112233445566:hub/default"}
    mock_hub.get_enabled_standards.return_value = {"StandardsSubscriptions": [{"StandardsArn": "cis"}]}
    client._clients["securityhub:us-east-1"] = mock_hub

    mon_check = SecurityMonitoringAuditCheck(aws_client=client, sample_mode=False)
    mon_results = mon_check.run(regions=["us-east-1"])

    gd_res = next(r for r in mon_results if "MON-GD" in r["test_id"])
    assert gd_res["status"] == "PASS"

    cfg_res = next(r for r in mon_results if "MON-CFG" in r["test_id"])
    assert cfg_res["status"] == "PASS"

    hub_res = next(r for r in mon_results if "MON-HUB" in r["test_id"])
    assert hub_res["status"] == "PASS"
