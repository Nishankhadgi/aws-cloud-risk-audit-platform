"""Unit tests for S3 storage security audit checks."""

from checks.s3_checks import S3SecurityCheck
from aws_client import SafeAWSClient

def test_s3_sample_mode_execution():
    client = SafeAWSClient(sample_mode=True)
    check = S3SecurityCheck(aws_client=client, sample_mode=True)
    results = check.run()

    assert len(results) >= 3
    # Check that archive bucket with missing bucket-level PAB is evaluated with compensating control
    archive_bucket = next(r for r in results if "archive" in r["resource_id"])
    # Professional Big Four audit calibration: status is PARTIAL because account PAB is active as compensating control
    assert archive_bucket["status"] == "PARTIAL"
    assert archive_bucket["severity"] == "MEDIUM"
    assert archive_bucket["technical_evidence"]["account_level_pab_effective"] is True
    assert "false_positive_analysis" in archive_bucket["technical_evidence"]

    # Check that audit log vault with object lock passes
    vault_bucket = next(r for r in results if "vault" in r["resource_id"])
    assert vault_bucket["status"] == "PASS"
    assert vault_bucket["technical_evidence"]["object_lock_enabled"] is True
