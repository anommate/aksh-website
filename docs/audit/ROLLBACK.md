# AKSH — Restructure Rollback

This reverses **only** the 8 October 2026 restructure recorded in `RESTRUCTURE_MANIFEST.csv`. It never deletes files and never touches work that the manifest does not list.

## What a rollback does

1. **Files the restructure created** (README, CLAUDE.md, `.gitignore`, `docs/**` notes, canonical requirement copies, and this audit set) are moved to `.local-backup/rollback-quarantine-<timestamp>/`, but only if their SHA-256 still matches the manifest. A file edited since then is **left in place** and reported.
2. **Moved originals** go back to their original paths, newest move first:
   - If the file at the new path is unchanged (hash match), it is moved back.
   - If it was **edited since**, the edited file stays where it is and the original is restored from the byte snapshot, so both versions survive.
   - If it was **deleted since**, the original is restored from the snapshot.
   - If something else already occupies the original path, nothing is overwritten and a conflict is reported.
3. **Directories the restructure created** are removed only if they are empty. Any directory containing new work survives.
4. `.local-backup/restructure-2026-10-08/` (the snapshot) is kept. Delete it yourself once you are satisfied.

## Automated rollback (recommended)

Run from any directory with Python 3:

```bash
# 1. Preview: lists every action and changes nothing
python -I "F:/My Digital Savvy/AKSH/docs/audit/rollback_restructure.py" "F:/My Digital Savvy/AKSH"

# 2. Execute
python -I "F:/My Digital Savvy/AKSH/docs/audit/rollback_restructure.py" "F:/My Digital Savvy/AKSH" --apply
```

Read every `NOTE` line at the end of the output. Each one is a file that changed after the restructure and needs a human decision.

**Before rolling back once development has started:** commit or copy your new work first. Application files that the manifest does not list (for example `package.json` or `src/`) are never moved, but `docs/` and `assets/` directories that still contain them will be kept rather than removed.

## Manual rollback

The manifest has one row per operation, with columns `operation`, `original_relative_path`, `new_relative_path`, `reason`, `before_sha256`, and `after_sha256`. Work through it in reverse:

| Operation | Manual reversal |
|---|---|
| `create`, `copy-edit` | If `sha256(new_relative_path)` equals `after_sha256`, move the file somewhere outside the project. Otherwise it has been edited, so decide by hand |
| `move` | If `original_relative_path` is free and the hash of `new_relative_path` equals `after_sha256`, move it back. Otherwise copy the snapshot `.local-backup/restructure-2026-10-08/original-root/<original_relative_path>` (verify its hash equals `before_sha256`) |
| `remove-empty-dir` | Recreated automatically when files move back into `Inspi/` and `Logo Inspi/` |
| `create-dir` | `rmdir` once empty (never use recursive delete) |
| `backup-copy`, `create-backup-dir` | Keep until you are satisfied, then delete manually |

To check a file's hash in PowerShell, use `Get-FileHash -Algorithm SHA256 -LiteralPath '<path>'`. In Git Bash, use `sha256sum < '<path>'`.

## Restoring one file only

To recover a single original without a full rollback, copy it from `.local-backup/restructure-2026-10-08/original-root/` (same relative path as the original) to wherever you need it. Do not overwrite a file you have since edited.

## Verification performed

The script was tested on 8 October 2026 against a full scratch copy of the restructured project (see `FINAL_AUDIT.md`). After `--apply`, the copy contained exactly the 14 original files at their original paths with matching SHA-256 hashes, plus `.local-backup/`.
