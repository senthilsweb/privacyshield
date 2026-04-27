"""Prompt template loader.

Reads `.txt` and `.md` files from the directory pointed at by the
``PROMPTS_DIR`` env var (default ``./prompts``). The directory is intended
to be bind-mounted into the Docker container so operators can drop in new
templates without rebuilding the image.

Each file's stem becomes its identifier. Templates SHOULD contain the
literal token ``{anonymized_text}`` where the anonymized payload is
injected at request time.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/prompts", tags=["prompts"])

ALLOWED_SUFFIXES = {".txt", ".md"}
# Stems hidden from the listing — operator-facing docs, not user prompts.
HIDDEN_STEMS = {"readme"}


class PromptSummary(BaseModel):
    id: str
    title: str
    description: Optional[str] = None


class PromptDetail(PromptSummary):
    template: str


def _prompts_dir() -> Path:
    return Path(os.getenv("PROMPTS_DIR", "prompts")).expanduser()


def _safe_resolve(name: str) -> Path:
    """Resolve `name` inside PROMPTS_DIR, refusing path traversal."""
    base = _prompts_dir().resolve()
    if not base.is_dir():
        raise HTTPException(status_code=404, detail="PROMPTS_DIR not found")
    # Strip any provided suffix; we'll probe allowed extensions ourselves.
    stem = Path(name).stem
    if not stem or stem.startswith(".") or "/" in name or "\\" in name:
        raise HTTPException(status_code=400, detail="invalid prompt name")
    for suffix in ALLOWED_SUFFIXES:
        candidate = (base / f"{stem}{suffix}").resolve()
        # Reject anything that escapes the base directory (symlink shenanigans).
        try:
            candidate.relative_to(base)
        except ValueError:
            continue
        if candidate.is_file():
            return candidate
    raise HTTPException(status_code=404, detail=f"prompt '{stem}' not found")


def _humanize(stem: str) -> str:
    return stem.replace("_", " ").replace("-", " ").strip().title()


def _read_meta(path: Path) -> tuple[str, Optional[str], str]:
    """Return (title, description, template) for a prompt file.

    Convention: the first line MAY be ``# Title`` (markdown heading) and the
    second line MAY be a short description. Everything after a blank line is
    treated as the template body. If no headers are detected, the entire
    file is the template and the title is derived from the file name.
    """
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    title = _humanize(path.stem)
    description: Optional[str] = None
    body_start = 0

    if lines and lines[0].startswith("#"):
        title = lines[0].lstrip("# ").strip() or title
        body_start = 1
        if len(lines) > 1 and lines[1].strip() and not lines[1].startswith("#"):
            description = lines[1].strip()
            body_start = 2
        # Skip a single blank separator line.
        if body_start < len(lines) and not lines[body_start].strip():
            body_start += 1

    template = "\n".join(lines[body_start:]).strip() or text.strip()
    return title, description, template


@router.get("", response_model=List[PromptSummary])
async def list_prompts() -> List[PromptSummary]:
    base = _prompts_dir()
    if not base.is_dir():
        return []
    summaries: List[PromptSummary] = []
    for entry in sorted(base.iterdir()):
        if not (entry.is_file() and entry.suffix.lower() in ALLOWED_SUFFIXES):
            continue
        if entry.stem.lower() in HIDDEN_STEMS:
            continue
        try:
            title, description, _ = _read_meta(entry)
        except OSError:
            continue
        summaries.append(
            PromptSummary(id=entry.stem, title=title, description=description)
        )
    return summaries


@router.get("/{name}", response_model=PromptDetail)
async def get_prompt(name: str) -> PromptDetail:
    path = _safe_resolve(name)
    title, description, template = _read_meta(path)
    return PromptDetail(
        id=path.stem,
        title=title,
        description=description,
        template=template,
    )
