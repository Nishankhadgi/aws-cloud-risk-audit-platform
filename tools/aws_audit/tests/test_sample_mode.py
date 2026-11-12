"""Verifies that sample mode runs without requiring AWS credentials or network access."""

import subprocess
import sys
from pathlib import Path

def test_main_cli_sample_flag(tmp_path):
    main_py = Path(__file__).resolve().parent.parent / "main.py"
    output_json = tmp_path / "test_output.json"

    cmd = [
        sys.executable,
        str(main_py),
        "--sample",
        "--output",
        str(output_json)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    assert result.returncode == 0
    assert "SIMULATED AUDIT DATA" in result.stdout
    assert output_json.exists()

