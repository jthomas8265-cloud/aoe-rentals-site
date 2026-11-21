#!/usr/bin/env python3
"""Remove expired community-board listings.

A listing stays up through its last day (inclusive) in America/Denver.
Last day is `end`, then `expires`, then a category fallback (see
effective_end). The public page uses the same rule, so this is the
repo cleanup step.

Usage (from the site repo root):
  python3 scripts/prune-yard-sales.py
  python3 scripts/prune-yard-sales.py data/yard-sales.json

Prints how many listings were removed. Rewrites the file only when the
list changes. Exit 0 on success, 1 on a bad file or bad arguments.
"""
from __future__ import annotations

import json
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

DENVER = ZoneInfo("America/Denver")


def today_denver() -> str:
    return datetime.now(DENVER).date().isoformat()


def listings_of(data):
    if isinstance(data, list):
        return data, "array"
    if isinstance(data, dict):
        return list(data.get("listings") or []), "object"
    raise ValueError("yard-sales JSON must be an array or an object with a listings array")


def add_days(iso: str, days: int) -> str:
    return (date.fromisoformat(iso) + timedelta(days=days)).isoformat()


def category_of(entry) -> str:
    c = str((entry or {}).get("category") or "yard-sale").lower().replace("_", "-")
    if c in ("garden", "eggs", "garden-eggs"):
        return "garden"
    if c in ("farm", "hay", "hay-farm"):
        return "farm"
    if c in ("food-truck", "foodtruck", "truck"):
        return "food-truck"
    if c in ("coffee", "coffee-shop", "coffee-hut"):
        return "coffee"
    if c in ("restaurant", "restaurants"):
        return "restaurant"
    return "yard-sale"


def is_paid(entry) -> bool:
    if not isinstance(entry, dict):
        return False
    return bool(entry.get("paid") or entry.get("featured") or category_of(entry) == "restaurant")


def effective_end(entry) -> str | None:
    """Last visible day, inclusive. Matches the client filter in site.js."""
    if not isinstance(entry, dict):
        return None
    if entry.get("end"):
        return str(entry["end"])
    if entry.get("expires"):
        return str(entry["expires"])
    cat = category_of(entry)
    paid = is_paid(entry)
    start = entry.get("start")
    added = entry.get("added")
    try:
        if cat == "coffee" and not paid:
            if added:
                return add_days(str(added), 7)
            return str(start) if start else None
        if cat == "food-truck" and not paid:
            value = start or added
            return str(value) if value else None
        if paid or cat == "restaurant":
            return str(start) if start else None
        if start:
            return str(start)
        if added:
            return add_days(str(added), 30)
    except ValueError:
        return None
    return None


def is_active(entry, today: str) -> bool:
    end = effective_end(entry)
    return bool(end) and end >= today


def prune(path: Path, today: str | None = None) -> tuple[int, int]:
    today = today or today_denver()
    raw = path.read_text(encoding="utf-8")
    data = json.loads(raw)
    listings, shape = listings_of(data)
    kept = [item for item in listings if is_active(item, today)]
    removed = len(listings) - len(kept)
    if shape == "array":
        out = kept
    else:
        data = dict(data)
        data["listings"] = kept
        out = data
    new = json.dumps(out, indent=2, ensure_ascii=False) + "\n"
    current_pretty = json.dumps(json.loads(raw), indent=2, ensure_ascii=False) + "\n"
    if new != current_pretty:
        path.write_text(new, encoding="utf-8")
    return removed, len(kept)


def main(argv: list[str]) -> int:
    if len(argv) > 2 or (len(argv) == 2 and argv[1] in ("-h", "--help")):
        out = sys.stdout if len(argv) == 2 else sys.stderr
        print(__doc__.strip(), file=out)
        return 0 if len(argv) == 2 else 1
    path = Path(argv[1] if len(argv) == 2 else "data/yard-sales.json")
    if not path.is_file():
        print(f"prune-yard-sales: file not found: {path}", file=sys.stderr)
        return 1
    try:
        removed, kept = prune(path)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"prune-yard-sales: {exc}", file=sys.stderr)
        return 1
    today = today_denver()
    print(f"Community board pruned for {today} (America/Denver): removed {removed}, {kept} still listed.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
