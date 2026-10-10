"""Strict RGB desktop regression gate, including scrolled and modal states."""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument("before", type=Path)
parser.add_argument("after", type=Path)
parser.add_argument("output", type=Path)
parser.add_argument("--widths", default="1000,1440,1920")
parser.add_argument("--screens", help="Comma-separated additional states; default gate always uses all 22 core states")
args = parser.parse_args()
rows = []
screens = (
    "feed projects members programs program profile project vacancies vacancy courses course "
    "profile-edit project-edit partners analytics team-invite projects-invites "
    "project-edit-fields project-edit-goals project-edit-new-goal analytics-attention "
    "team-invite-selected"
).split()
if args.screens:
    screens = args.screens.split(",")
widths = tuple(int(width) for width in args.widths.split(","))
if not widths or any(width < 1000 for width in widths):
    raise SystemExit("Desktop widths must be >=1000")
files = sorted(args.before / f"{screen}-{width}.png" for screen in screens for width in widths)
for file in files:
    before = Image.open(file).convert("RGB")
    after = Image.open(args.after / file.name).convert("RGB")
    same_size = before.size == after.size
    if same_size:
        delta = np.max(np.abs(np.asarray(before).astype(np.int16) - np.asarray(after).astype(np.int16)), axis=2)
        changed = int(np.count_nonzero(delta))
        maximum = int(delta.max())
    else:
        changed = -1
        maximum = -1
    rows.append({"screen": file.stem, "beforeSize": before.size, "afterSize": after.size,
                 "exactChangedPixels": changed, "maxChannelDelta": maximum,
                 "passed": same_size and changed == 0})
    if changed != 0:
        print(f"FAIL {file.stem}: {changed} changed RGB pixels")
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(rows, indent=2) + "\n", encoding="utf-8")
passed = sum(row["passed"] for row in rows)
print(f"Desktop pixel comparison: {passed}/{len(rows)} exact matches")
if not rows or passed != len(rows):
    raise SystemExit(1)
