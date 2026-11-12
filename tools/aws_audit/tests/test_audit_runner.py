"""Integration tests for the Audit Runner and safe execution safeguards."""

import pytest
from audit_runner import AuditRunner
from aws_client import SecurityAuditViolationError, SafeAWSClient

def test_runner_executes_sample_audit():
    runner = AuditRunner(sample_mode=True)
    package = runner.execute_audit()

    assert "metadata" in package
    assert "summary" in package
    assert "results" in package
    assert "evidence_register" in package

    assert package["metadata"]["is_sample_mode"] is True
    assert package["metadata"]["disclaimer"] == "SIMULATED AUDIT DATA — NOT AN ACTUAL AWS AUDIT"

    summary = package["summary"]
    assert summary["total_checks"] > 10
    assert summary["passed"] > 0
    assert summary["failed"] > 0
    assert summary["critical_findings"] > 0

    # Ensure evidence was cryptographically hashed
    evidence_list = package["evidence_register"]
    assert len(evidence_list) == len(package["results"])
    for ev in evidence_list:
        assert len(ev["sha256_hash"]) == 64  # Valid SHA-256 hex string

def test_safe_aws_client_blocks_destructive_operations():
    client = SafeAWSClient(sample_mode=False)
    # Attempting to call a non-read-only method must raise SecurityAuditViolationError immediately
    with pytest.raises(SecurityAuditViolationError):
        client.call_readonly_api("s3", "delete_bucket", Bucket="test-bucket")

    with pytest.raises(SecurityAuditViolationError):
        client.call_readonly_api("iam", "create_user", UserName="rogue-user")

