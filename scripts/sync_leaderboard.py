#!/usr/bin/env python3
"""Regenerate the downloadable CSV and no-JavaScript table from reviewed JSON.

Run from any working directory: python path/to/scripts/sync_leaderboard.py
The canonical source is docs/data/leaderboard.json. No third-party packages.
"""
import csv
import html
import json
from pathlib import Path

REPOSITORY = Path(__file__).resolve().parent.parent
KEYS = (
    "overall", "p_all", "p_l1", "p_l2", "p_l3", "p_l4",
    "c_all", "c_l2", "c_l3", "c_l4",
)
CATEGORIES = {"human": "Human reference", "open": "Open-source", "closed": "Closed-source"}
START = "<!-- STATIC_RESULTS_START -->"
END = "<!-- STATIC_RESULTS_END -->"


def load_rows(source):
    """Validate the public data contract before changing either output."""
    data = json.loads(source.read_text(encoding="utf-8"))
    rows = data.get("rows")
    if not isinstance(rows, list) or not rows:
        raise ValueError("Leaderboard rows must be a nonempty list")
    seen = set()
    for row in rows:
        name = row.get("name")
        if not isinstance(name, str) or not name.strip() or name in seen:
            raise ValueError("Every row needs a nonempty, unique model name")
        seen.add(name)
        if row.get("category") not in CATEGORIES:
            raise ValueError(f"Unknown category for {name}")
        for key in KEYS:
            value = row.get(key)
            if type(value) not in (int, float) or not 0 <= value <= 100:
                raise ValueError(f"{name}: {key} must be a finite accuracy between 0 and 100")
    if not any(row["category"] != "human" for row in rows):
        raise ValueError("Leaderboard needs at least one model")
    if sum(row["category"] == "human" for row in rows) > 1:
        raise ValueError("At most one aggregate human reference is supported")
    return rows


def render_rows(rows):
    models = sorted((row for row in rows if row["category"] != "human"), key=lambda row: (-row["overall"], row["name"]))
    ordered = [row for row in rows if row["category"] == "human"] + models
    maxima = {key: max(row[key] for row in models) for key in KEYS}
    lines = []
    for row in ordered:
        is_human = row["category"] == "human"
        rank = "—" if is_human else str(next(i for i, item in enumerate(models, 1) if item["overall"] == row["overall"]))
        name = html.escape(row["name"], quote=True)
        class_attr = ' class="human-row"' if is_human else ""
        lines.append(f'          <tr data-name="{name}" data-category="{row["category"]}"{class_attr}>')
        label = ' aria-label="Human reference, unranked"' if is_human else ""
        lines.append(f'            <th scope="row" class="rank-cell"{label}>{rank}</th><th scope="row" class="model-cell">{name}<span class="model-class">{CATEGORIES[row["category"]]}</span></th>')
        cells = []
        for key in KEYS:
            classes = []
            if key == "overall":
                classes.append("overall-cell")
            if key == "p_all":
                classes.append("p-start")
            if key == "c_all":
                classes.append("c-start")
            if not is_human and row[key] == maxima[key]:
                classes.append("best")
            extra = f' class="{" ".join(classes)}"' if classes else ""
            cells.append(f'<td data-key="{key}"{extra}>{row[key]:.1f}</td>')
        lines.append("            " + "".join(cells))
        lines.append("          </tr>")
    return ordered, "\n".join(lines)


def main():
    source = REPOSITORY / "docs/data/leaderboard.json"
    page_path = REPOSITORY / "docs/leaderboard.html"
    csv_path = REPOSITORY / "docs/data/leaderboard.csv"
    rows = load_rows(source)
    ordered, rendered = render_rows(rows)
    page = page_path.read_text(encoding="utf-8")
    if page.count(START) != 1 or page.count(END) != 1:
        raise ValueError("The leaderboard HTML must contain exactly one pair of static-results markers")
    before, rest = page.split(START, 1)
    _, after = rest.split(END, 1)
    updated = before + START + "\n" + rendered + "\n          " + END + after
    with csv_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["model", "category", *KEYS])
        for row in ordered:
            writer.writerow([row["name"], row["category"], *(f"{row[key]:.1f}" for key in KEYS)])
    page_path.write_text(updated, encoding="utf-8")
    print(f"Synchronized {len(rows)} rows × {len(KEYS)} score columns into CSV and static HTML.")


if __name__ == "__main__":
    main()
