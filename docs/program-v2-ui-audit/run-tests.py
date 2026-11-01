#!/usr/bin/env python3
"""Полный настроенный Vitest-набор небольшими процессами для памяти Cloud."""
import json
import os
from pathlib import Path
import subprocess
import time

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = Path("/workspace/artifacts/program-v2-ui-audit/tests")
OUTPUT.mkdir(parents=True, exist_ok=True)
EXCLUDED = {
    "projects/social_platform/src/app/ui/pages/projects/projects.component.spec.ts",
    "projects/social_platform/src/app/ui/pages/program/program.component.spec.ts",
    "projects/social_platform/src/app/ui/pages/profile/edit/editor-submit-button.directive.spec.ts",
}
files = sorted(str(p.relative_to(ROOT)) for prefix in ("projects/core", "projects/ui", "projects/social_platform") for p in (ROOT / prefix).rglob("*.spec.ts") if str(p.relative_to(ROOT)) not in EXCLUDED)
outcomes = {}
attempts = []

def import_report(report):
    data = json.loads(report.read_text())
    for item in data.get("testResults", []):
        name = str(Path(item["name"]).relative_to(ROOT))
        assertions = item.get("assertionResults", [])
        outcomes[name] = {"file": name, "status": item["status"], "tests": len(assertions), "passed": sum(a["status"] == "passed" for a in assertions), "failed": sum(a["status"] == "failed" for a in assertions), "pending": sum(a["status"] in ("pending", "todo", "skipped") for a in assertions)}
    return data

# Возобновление разрешено только явно, в том же неизмененном checkout текущей проверки.
if os.environ.get("PROGRAM_UI_RESUME") == "1":
    for report in sorted(OUTPUT.glob("batch-*.json"), key=lambda p: p.stat().st_mtime):
        data = json.loads(report.read_text())
        if data.get("success"):
            import_report(report)

remaining = [f for f in files if outcomes.get(f, {}).get("status") != "passed"]
run_id = str(int(time.time()))

def check(selected):
    number = len(attempts) + 1
    report = OUTPUT / f"run-{run_id}-{number}.json"
    command = ["node", "--max-old-space-size=1536", "node_modules/vitest/vitest.mjs", "run", "--maxWorkers=1", "--no-file-parallelism", "--pool=forks", "--reporter=default", "--reporter=json", f"--outputFile.json={report}", *selected]
    with (OUTPUT / f"run-{run_id}-{number}.log").open("w") as output:
        result = subprocess.run(command, cwd=ROOT, stdout=output, stderr=subprocess.STDOUT, env={**os.environ, "NODE_OPTIONS": "--max-old-space-size=1536"})
    attempts.append({"batch": number, "files": len(selected), "exitCode": result.returncode})
    if report.exists():
        data = import_report(report)
        print(f"batch {number}: files={len(selected)} tests={data.get('numTotalTests', 0)} exit={result.returncode}", flush=True)
    else:
        print(f"batch {number}: files={len(selected)} exit={result.returncode}", flush=True)
    if result.returncode in (-6, -9, 137) and len(selected) > 1:
        middle = len(selected) // 2
        check(selected[:middle])
        check(selected[middle:])

print(f"configured_files={len(files)} already_passed={len(outcomes)} remaining={len(remaining)}", flush=True)
for index in range(0, len(remaining), 8):
    check(remaining[index:index + 8])

results = [outcomes[f] for f in files if f in outcomes]
summary = {"runner": "vitest", "pool": "forks", "maxWorkers": 1, "files": len(files), "filesReported": len(results), "excludedByExistingConfig": sorted(EXCLUDED), "tests": sum(r["tests"] for r in results), "passed": sum(r["passed"] for r in results), "failed": sum(r["failed"] for r in results), "pending": sum(r["pending"] for r in results), "success": len(results) == len(files) and all(r["status"] == "passed" for r in results), "attempts": attempts, "fileResults": results}
(ROOT / "docs/program-v2-ui-audit/tests-results.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({k: v for k, v in summary.items() if k not in ("attempts", "fileResults")}, ensure_ascii=False), flush=True)
raise SystemExit(0 if summary["success"] else 1)
