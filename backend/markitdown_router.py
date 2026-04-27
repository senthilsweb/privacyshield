"""
Markitdown router (placeholder).

Exposes POST /convert which currently returns HTTP 501 Not Implemented.
The route is only mounted when the env var ENABLE_CONVERT=true.

Future implementation: accept multipart file upload, run Microsoft
Markitdown (https://github.com/microsoft/markitdown) and return markdown.
"""

from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/convert")
async def convert_to_markdown() -> dict:
    """Reserved for Markitdown-powered file → Markdown conversion."""
    raise HTTPException(
        status_code=501,
        detail=(
            "Convert endpoint is not yet implemented. "
            "Set ENABLE_CONVERT=true and supply a Markitdown integration."
        ),
    )
