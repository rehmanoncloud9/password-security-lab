"""Create a deterministic source archive without local state or temporary output."""

from __future__ import annotations

import hashlib
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "artifacts" / "releases" / "password-security-laboratory-source.zip"
EXCLUDED_DIRECTORIES = {
    ".git",
    ".venv",
    "venv",
    "node_modules",
    "__pycache__",
    ".pytest_cache",
    ".ruff_cache",
    ".mypy_cache",
    ".vitest",
    ".cache",
    ".npm",
    ".pnpm-store",
    ".tox",
    "coverage",
    "dist",
    ".test-build",
    "build",
    "out",
    "test-results",
    "playwright-report",
    "playwright",
    "releases",
}
EXCLUDED_FILES = {
    "artifacts/pre-implementation-checkpoint.zip",
}
EXCLUDED_SECRET_FILES = {".npmrc", ".pypirc", ".netrc", ".git-credentials"}
PRIVATE_KEY_SUFFIXES = (".pem", ".key", ".p12", ".pfx")


def included(path: Path) -> bool:
    relative = path.relative_to(ROOT)
    relative_posix = relative.as_posix()
    if path.is_symlink() or not path.is_file():
        return False
    if relative_posix == OUTPUT.relative_to(ROOT).as_posix():
        return False
    if relative_posix in EXCLUDED_FILES:
        return False
    if any(part.lower() in EXCLUDED_DIRECTORIES for part in relative.parts):
        return False
    name = path.name.lower()
    if name in EXCLUDED_SECRET_FILES or name.endswith(PRIVATE_KEY_SUFFIXES):
        return False
    if name == ".env" or (name.startswith(".env.") and name != ".env.example"):
        return False
    if name == "audit-report.json" or name.endswith(".tsbuildinfo"):
        return False
    if name == ".ds_store" or name.endswith((".pyc", ".pyo", ".log", ".tmp", ".swp")):
        return False
    return True


def main() -> None:
    files = sorted(
        (path for path in ROOT.rglob("*") if included(path)),
        key=lambda path: path.relative_to(ROOT).as_posix(),
    )
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(OUTPUT, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path in files:
            relative = path.relative_to(ROOT).as_posix()
            info = ZipInfo(relative, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes())

    with ZipFile(OUTPUT) as archive:
        names = archive.namelist()
        if len(names) != len(set(names)):
            raise RuntimeError("Archive contains duplicate paths")
        if OUTPUT.relative_to(ROOT).as_posix() in names:
            raise RuntimeError("Archive contains itself")
        for name in names:
            parts = Path(name).parts
            if any(part.lower() in EXCLUDED_DIRECTORIES for part in parts):
                raise RuntimeError(f"Forbidden directory is present in archive: {name}")
            basename = Path(name).name.lower()
            if basename in EXCLUDED_SECRET_FILES or basename.endswith(PRIVATE_KEY_SUFFIXES):
                raise RuntimeError(f"Credential or private-key file is present in archive: {name}")
            if basename == ".env" or (basename.startswith(".env.") and basename != ".env.example"):
                raise RuntimeError(f"Environment secret file is present in archive: {name}")
            if basename == "audit-report.json" or basename.endswith(".tsbuildinfo"):
                raise RuntimeError(f"Temporary diagnostic artifact is present in archive: {name}")
    digest = hashlib.sha256(OUTPUT.read_bytes()).hexdigest()
    print(f"Archive: {OUTPUT.relative_to(ROOT).as_posix()}")
    print(f"Files: {len(files)}")
    print(f"Bytes: {OUTPUT.stat().st_size}")
    print(f"SHA-256: {digest}")


if __name__ == "__main__":
    main()
