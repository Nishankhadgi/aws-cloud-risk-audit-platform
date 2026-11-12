"""Unit tests for IAM audit checks."""

from checks.iam_checks import IAMSecurityCheck
from aws_client import SafeAWSClient

def test_iam_sample_mode_execution():
    client = SafeAWSClient(sample_mode=True)
    check = IAMSecurityCheck(aws_client=client, sample_mode=True)
    results = check.run()

    assert len(results) >= 4
    # Check that root MFA check passes
    root_check = next(r for r in results if r["test_id"] == "IAM-ROOT-01")
    assert root_check["status"] == "PASS"
    assert root_check["severity"] == "CRITICAL"
    assert root_check["is_simulated"] is True

    # Check that un-MFA'd dev user fails
    dev_mfa = next(r for r in results if r["test_id"] == "IAM-02")
    assert dev_mfa["status"] == "FAIL"
    assert dev_mfa["finding_reference"] == "AWS-IAM-002"

def test_iam_results_schema():
    client = SafeAWSClient(sample_mode=True)
    check = IAMSecurityCheck(aws_client=client, sample_mode=True)
    results = check.run()

    required_keys = {
        "control_id", "test_id", "check_id", "domain",
        "resource_id", "resource_type", "aws_account",
        "aws_region", "status", "severity", "title",
        "description", "technical_evidence", "evidence_timestamp",
        "is_simulated"
    }
    for res in results:
        assert required_keys.issubset(res.keys())
        assert res["status"] in {"PASS", "FAIL", "PARTIAL", "NOT_TESTED", "NOT_APPLICABLE", "ERROR"}

