from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

class BaseCheck(ABC):
    """Abstract Base Class for all AWS Configuration Audit Checks."""

    def __init__(self, aws_client=None, sample_mode: bool = False):
        self.aws_client = aws_client
        self.sample_mode = sample_mode

    @property
    @abstractmethod
    def check_id(self) -> str:
        """Unique check identifier (e.g., IAM-01, S3-01)."""
        pass

    @property
    @abstractmethod
    def control_id(self) -> str:
        """Mapped audit control ID (e.g., CTL-IAM-01)."""
        pass

    @property
    @abstractmethod
    def domain(self) -> str:
        """Audit domain (e.g., IAM, Data Protection, Encryption)."""
        pass

    @abstractmethod
    def run(self, regions: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Executes the check and returns structured test results."""
        pass

    def create_result(
        self,
        test_id: str,
        resource_id: str,
        resource_type: str,
        status: str,
        severity: str,
        title: str,
        description: str,
        technical_evidence: Dict[str, Any],
        aws_region: str = "global",
        aws_account: str = "123456789012",
        finding_ref: Optional[str] = None,
        recommendation: str = "",
        limitation_or_error: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Helper to create standardized audit check result."""
        valid_statuses = {"PASS", "FAIL", "PARTIAL", "NOT_TESTED", "NOT_APPLICABLE", "ERROR"}
        if status not in valid_statuses:
            raise ValueError(f"Invalid status {status}. Must be one of {valid_statuses}")

        return {
            "control_id": self.control_id,
            "test_id": test_id,
            "check_id": self.check_id,
            "domain": self.domain,
            "resource_id": resource_id,
            "resource_type": resource_type,
            "aws_account": aws_account,
            "aws_region": aws_region,
            "status": status,
            "severity": severity,
            "title": title,
            "description": description,
            "technical_evidence": technical_evidence,
            "evidence_timestamp": datetime.now(timezone.utc).isoformat(),
            "finding_reference": finding_ref,
            "risk_recommendation": recommendation,
            "limitation_or_error": limitation_or_error,
            "is_simulated": self.sample_mode,
        }

