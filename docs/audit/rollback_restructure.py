"""Reverse the 8 October 2026 AKSH restructure using RESTRUCTURE_MANIFEST.csv.

Dry run by default; pass --apply to act. Nothing is deleted: files this restructure
created are moved into .local-backup/rollback-quarantine-<timestamp>/. Files that
changed after the restructure are left in place and reported, and the original is
restored from the byte snapshot instead. Usage (from any directory):

    python -I docs/audit/rollback_restructure.py "<project root>"          # preview
    python -I docs/audit/rollback_restructure.py "<project root>" --apply  # execute
"""
import csv
import datetime
import hashlib
import os
import shutil
import sys

MANIFEST = os.path.join("docs", "audit", "RESTRUCTURE_MANIFEST.csv")
SELF_HASH = "n/a (self)"


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def main():
    args = [a for a in sys.argv[1:] if a != "--apply"]
    apply = "--apply" in sys.argv[1:]
    if len(args) != 1:
        sys.exit(__doc__)
    root = os.path.abspath(args[0])
    with open(os.path.join(root, MANIFEST), encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    quarantine = os.path.join(root, ".local-backup", f"rollback-quarantine-{stamp}")
    backup = {r["original_relative_path"]: r for r in rows if r["operation"] == "backup-copy"}
    problems = []

    def act(message, fn=None):
        print(("APPLY  " if apply else "PLAN   ") + message)
        if apply and fn:
            fn()

    def to_quarantine(rel):
        src = os.path.join(root, rel)
        dst = os.path.join(quarantine, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.move(src, dst)

    # 1. Files created or copied-and-edited by the restructure (manifest/script last).
    created = [r for r in rows if r["operation"] in ("create", "copy-edit")]
    created.sort(key=lambda r: r["after_sha256"] == SELF_HASH or r["new_relative_path"].endswith(".py"))
    for r in created:
        rel = r["new_relative_path"]
        path = os.path.join(root, rel)
        if not os.path.isfile(path):
            problems.append(f"created file already absent: {rel}")
            continue
        if r["after_sha256"] not in (SELF_HASH, "") and sha256(path) != r["after_sha256"]:
            problems.append(f"KEPT (modified after restructure, review manually): {rel}")
            continue
        act(f"quarantine created file {rel}", lambda rel=rel: to_quarantine(rel))

    # 2. Moves, newest first.
    for r in reversed([r for r in rows if r["operation"] == "move"]):
        orig, new = r["original_relative_path"], r["new_relative_path"]
        o_path, n_path = os.path.join(root, orig), os.path.join(root, new)
        snap = backup.get(orig)
        snap_path = os.path.join(root, snap["new_relative_path"]) if snap else None

        def restore_from_snapshot(orig=orig, o_path=o_path, snap_path=snap_path, before=r["before_sha256"]):
            if not snap_path or not os.path.isfile(snap_path) or sha256(snap_path) != before:
                problems.append(f"NO VALID SNAPSHOT for {orig}; not restored")
                return
            os.makedirs(os.path.dirname(o_path) or root, exist_ok=True)
            shutil.copy2(snap_path, o_path)

        if os.path.exists(o_path):
            if os.path.isfile(o_path) and sha256(o_path) == r["before_sha256"]:
                print(f"SKIP   already at original path: {orig}")
            else:
                problems.append(f"CONFLICT: a different file exists at {orig}; {new} left in place")
            continue
        if os.path.isfile(n_path) and sha256(n_path) == r["after_sha256"]:
            def move_back(o_path=o_path, n_path=n_path):
                os.makedirs(os.path.dirname(o_path) or root, exist_ok=True)
                shutil.move(n_path, o_path)
            act(f"move back {new} -> {orig}", move_back)
        elif os.path.isfile(n_path):
            problems.append(f"KEPT (modified after restructure): {new}; original restored from snapshot")
            act(f"restore {orig} from snapshot", restore_from_snapshot)
        else:
            act(f"restore missing {orig} from snapshot", restore_from_snapshot)

    # 3. Remove directories the restructure created, deepest first, only when empty.
    dirs = [r["new_relative_path"] for r in rows if r["operation"] == "create-dir"]
    for rel in sorted(dirs, key=lambda d: d.count("/"), reverse=True):
        path = os.path.join(root, rel)
        if os.path.isdir(path) and not os.listdir(path):
            act(f"remove empty directory {rel}", lambda path=path: os.rmdir(path))
        elif os.path.isdir(path) and apply:
            problems.append(f"directory not empty, kept: {rel}")

    print("\n" + ("Rollback applied." if apply else "Dry run only; re-run with --apply to execute."))
    if apply:
        print(f"Quarantined files (if any): {quarantine}")
        print("The snapshot in .local-backup/restructure-2026-10-08/ is kept; delete it manually once satisfied.")
    for p in problems:
        print("NOTE   " + p)


if __name__ == "__main__":
    main()
