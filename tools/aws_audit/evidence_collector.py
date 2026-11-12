"""Cryptographic Evidence Collector and Integrity Hasher for AWS Audit Engagements."""

import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any, List

class EvidenceCollector:
    """Manages raw technical evidence records and computes SHA-256 integrity digests."""

    def __init__(self, auditor_name: str = "Lead IT Auditor"):
        self.auditor_name = auditor_name
        self._evidence_register: List[Dict[str, Any]] = []

    def record_evidence(
        self,
        evidence_id: str,
        title: str,
        control_id: str,
        test_id: str,
        source: str,
        raw_payload: Any,
        is_confidential: bool = True,
        is_sanitized: bool = True
    ) -> Dict[str, Any]:
        """Creates an evidence workpaper record with SHA-256 integrity hash."""
        # Convert raw payload to stable serialized string for hashing
        serialized_payload = json.dumps(raw_payload, sort_keys=True, default=str)
        sha256_hash = hashlib.sha256(serialized_payload.encode("utf-8")).hexdigest()

        evidence_entry = {
            "evidence_id": evidence_id,
            "title": title,
            "control_id": control_id,
            "test_id": test_id,
            "source": source,
            "collector": self.auditor_name,
            "collection_date": datetime.now(timezone.utc).isoformat(),
            "sha256_hash": sha256_hash,
            "is_confidential": is_confidential,
            "is_sanitized": is_sanitized,
            "validation_status": "VALIDATED",
            "content_sample": serialized_payload[:250] + ("..." if len(serialized_payload) > 250 else ""),
            "raw_payload": raw_payload
        }
        self._evidence_register.append(evidence_entry)
        return evidence_entry

    def get_register(self) -> List[Dict[str, Any]]:
        return self._evidence_register

