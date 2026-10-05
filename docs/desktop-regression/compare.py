"""Compare full-page PNGs without masks; fail the visual regression gate."""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

root = Path(__file__).parent
before, after = sys.argv[1:3]
output = root / "screenshots" / f"diff-{after}"
output.mkdir(parents=True, exist_ok=True)
rows = []
for file in sorted((root / "screenshots" / before).glob("*.png")):
    a = Image.open(file).convert("RGB")
    b = Image.open(root / "screenshots" / after / file.name).convert("RGB")
    same_size = a.size == b.size
    w, h = max(a.width, b.width), max(a.height, b.height)
    padded = []
    for img in (a, b):
        canvas = Image.new("RGB", (w, h), "white")
        canvas.paste(img)
        padded.append(np.asarray(canvas).astype(np.int16))
    delta = np.max(np.abs(padded[0] - padded[1]), axis=2)
    mask = delta > 8
    count = int(np.count_nonzero(mask))
    percent = count / (w * h) * 100
    ys, xs = np.where(mask)
    bbox = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())] if count else None
    exact_count = int(np.count_nonzero(delta))
    passed = same_size and exact_count == 0
    rows.append({"screen": file.stem, "beforeSize": a.size, "afterSize": b.size,
                 "changedPixels": count, "changedPercent": round(percent, 6),
                 "exactChangedPixels": exact_count,
                 "maxChannelDelta": int(delta.max()),
                 "bbox": bbox, "passed": passed})
    if count or not same_size:
        overlay = (padded[1] * 0.4 + 255 * 0.6).astype(np.uint8)
        overlay[mask] = [240, 40, 100]
        Image.fromarray(overlay).save(output / file.name)
    else:
        (output / file.name).unlink(missing_ok=True)
    print(f"{'PASS' if passed else 'FAIL'} {file.stem}: exact={exact_count}px; delta>8={percent:.4f}% {a.size} -> {b.size} bbox={bbox}")
(root / f"comparison-{after}.json").write_text(json.dumps(rows, indent=2) + "\n", encoding="utf-8")
if "--check" in sys.argv and (not rows or any(not r["passed"] for r in rows)):
    sys.exit(1)
