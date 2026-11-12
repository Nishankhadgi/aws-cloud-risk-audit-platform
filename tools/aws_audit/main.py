#!/usr/bin/env python3
"""
AWS Cloud Infrastructure Security & Technology Risk Audit CLI
Senior IT Internal Auditor / AWS Cloud Security Architect Automation Tool
"""

import argparse
import json
import logging
import os
import sys
from pathlib import Path

# Add parent directory to sys.path to enable direct execution
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from audit_runner import AuditRunner
from report_generator import AuditReportGenerator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("aws_audit.cli")

def parse_arguments():
    parser = argparse.ArgumentParser(
        description="AWS Cloud Infrastructure Security & Technology Risk Audit Engine (Read-Only IT Auditor Tool)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Execute simulated audit in sample mode (Zero credentials required):
  python main.py --sample

  # Run live read-only audit using named AWS profile:
  python main.py --profile audit-readonly --regions us-east-1 us-west-2 --output output/

  # Generate audit report to custom path:
  python main.py --sample --output ../../src/data/mockScanData.json
"""
    )
    parser.add_argument(
        "--sample",
        action="store_true",
        help="Run audit in simulated demonstration mode without AWS credentials."
    )
    parser.add_argument(
        "--profile",
        type=str,
        default=None,
        help="AWS named profile to use for read-only authentication."
    )
    parser.add_argument(
        "--regions",
        nargs="+",
        default=["us-east-1", "us-west-2"],
        help="List of AWS regions to inspect (default: us-east-1 us-west-2)."
    )
    parser.add_argument(
        "--output",
        type=str,
        default="output",
        help="Output directory or file path for JSON audit results (default: output/)."
    )
    return parser.parse_args()

def main():
    args = parse_arguments()

    print("=" * 80)
    print(" AWS CLOUD INFRASTRUCTURE SECURITY & TECHNOLOGY RISK AUDIT PLATFORM")
    print(" Enterprise IT Internal Audit & Technology Risk Assessment Engine")
    print("=" * 80)

    if args.sample:
        print("[!] RUNNING IN SAMPLE MODE: SIMULATED AUDIT DATA — NOT AN ACTUAL AWS AUDIT")
    else:
        print(f"[*] Live Read-Only Audit Profile: {args.profile or 'default'} | Regions: {', '.join(args.regions)}")

    runner = AuditRunner(
        profile_name=args.profile,
        sample_mode=args.sample,
        regions=args.regions
    )

    print("\n[*] Executing multi-domain control checks...")
    package = runner.execute_audit()

    summary = package["summary"]
    print("\n" + "-" * 80)
    print(" AUDIT EXECUTION SUMMARY")
    print("-" * 80)
    print(f" Total Controls Checked:       {summary['total_checks']}")
    print(f" Controls Passed:              {summary['passed']}")
    print(f" Controls Failed (Exceptions): {summary['failed']}")
    print(f" Partially Effective:          {summary['partial']}")
    print(f" Not Tested / Restricted:      {summary['not_tested']}")
    print(f" Critical Severity Findings:   {summary['critical_findings']}")
    print(f" High Severity Findings:       {summary['high_findings']}")
    print("-" * 80)

    # Determine output path
    output_path = Path(args.output)
    if output_path.suffix == ".json":
        json_file = output_path
        json_file.parent.mkdir(parents=True, exist_ok=True)
    else:
        output_path.mkdir(parents=True, exist_ok=True)
        json_file = output_path / "audit_results.json"

    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(package, f, indent=2)

    print(f"[+] Audit JSON results written to: {json_file.resolve()}")

    # Also write markdown summary
    md_summary = AuditReportGenerator.generate_markdown_summary(package)
    md_file = json_file.with_suffix(".md")
    with open(md_file, "w", encoding="utf-8") as f:
        f.write(md_summary)
    print(f"[+] Executive summary report written to: {md_file.resolve()}")
    print("=" * 80)

if __name__ == "__main__":
    main()

