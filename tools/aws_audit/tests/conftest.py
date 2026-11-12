"""Pytest configuration and common fixtures for AWS Audit Engine."""

import sys
from pathlib import Path
import pytest

# Ensure tools/aws_audit is in python path
tools_dir = Path(__file__).resolve().parent.parent
if str(tools_dir) not in sys.path:
    sys.path.insert(0, str(tools_dir))

@pytest.fixture
def sample_client():
    from aws_client import SafeAWSClient
    return SafeAWSClient(sample_mode=True)

