"""Audit Report and JSON Fixture Generator."""

import json
from datetime import datetime, timezone
from typing import Dict, Any, List

class AuditReportGenerator:
    """Generates structured JSON fixtures for web UI import and human-readable executive summaries."""

    @classmethod
    def generate_json_package(
        cls,
        account_id: str,
        regions: List[str],
        results: List[Dict[str, Any]],
        evidence_register: List[Dict[str, Any]],
        is_sample_mode: bool = False
    ) -> Dict[str, Any]:
        """Packages audit scan findings and evidence into the standard UI import schema."""
        summary = {
            "total_checks": len(results),
            "passed": sum(1 for r in results if r["status"] == "PASS"),
            "failed": sum(1 for r in results if r["status"] == "FAIL"),
            "partial": sum(1 for r in results if r["status"] == "PARTIAL"),
            "not_tested": sum(1 for r in results if r["status"] == "NOT_TESTED"),
            "not_applicable": sum(1 for r in results if r["status"] == "NOT_APPLICABLE"),
            "error": sum(1 for r in results if r["status"] == "ERROR"),
            "critical_findings": sum(1 for r in results if r["status"] in ["FAIL", "PARTIAL"] and r["severity"] == "CRITICAL"),
            "high_findings": sum(1 for r in results if r["status"] in ["FAIL", "PARTIAL"] and r["severity"] == "HIGH"),
        }

        package = {
            "metadata": {
                "platform": "AWS Cloud Infrastructure Security & Technology Risk Audit Platform",
                "engagement_name": "Northstar Claims Technologies - Comprehensive AWS Infrastructure Audit",
                "organization": "Northstar Claims Technologies",
                "aws_account_id": account_id,
                "assessed_regions": regions,
                "scan_timestamp": datetime.now(timezone.utc).isoformat(),
                "is_sample_mode": is_sample_mode,
                "disclaimer": "SIMULATED AUDIT DATA — NOT AN ACTUAL AWS AUDIT" if is_sample_mode else "LIVE AWS READ-ONLY ASSESSMENT DATA",
                "auditor_role": "Senior IT Internal Auditor / AWS Cloud Security Architect",
                "version": "1.0.0"
            },
            "summary": summary,
            "results": results,
            "evidence_register": evidence_register
        }
        return package

    @classmethod
    def generate_markdown_summary(cls, report_package: Dict[str, Any]) -> str:
        """Generates executive summary markdown text."""
        meta = report_package["metadata"]
        summ = report_package["summary"]
        res = report_package["results"]

        md = []
        md.append(f"# Executive Audit Summary: {meta['engagement_name']}")
        md.append(f"**Target Account:** `{meta['aws_account_id']}` | **Date:** {meta['scan_timestamp']}")
        md.append(f"**Audit Classification:** {meta['disclaimer']}\n")
        md.append("## 1. Engagement Overview & Metrics")
        md.append(f"- **Total Controls Assessed:** {summ['total_checks']}")
        md.append(f"- **Controls Passed:** {summ['passed']} ({round(summ['passed'] / max(1, summ['total_checks']) * 100)}%)")
        md.append(f"- **Controls Failed / Deficient:** {summ['failed']}")
        md.append(f"- **Partially Effective Controls:** {summ['partial']}")
        md.append(f"- **Scope Limitations / Not Tested:** {summ['not_tested']}")
        md.append(f"- **Critical Exceptions:** {summ['critical_findings']}")
        md.append(f"- **High-Risk Exceptions:** {summ['high_findings']}\n")

        md.append("## 2. Key Exceptions Requiring Immediate Remediation")
        high_critical = [r for r in res if r["status"] in ["FAIL", "PARTIAL"] and r["severity"] in ["CRITICAL", "HIGH"]]
        for r in high_critical:
            md.append(f"### [{r['severity']}] {r['title']} (`{r['test_id']}`)")
            md.append(f"- **Resource:** `{r['resource_id']}`")
            md.append(f"- **Audit Condition:** {r['description']}")
            md.append(f"- **Recommendation:** {r['risk_recommendation']}\n")

        return "\n".join(md)

