#!/usr/bin/env python3
"""
Privacy Shield — command-line interface
========================================

Run any Privacy Shield operation without the GUI or HTTP server. Useful for
batch jobs, CI pipelines, smoke-tests, or `docker exec`.

Usage
-----
  python cli.py entities [--language en] [--json]
  python cli.py detect    "Linda Adams, ITIN 880-69-4570"
  python cli.py detect    --stdin < input.txt
  python cli.py anonymize "Adjuster Linda Adams"          [--seed 42]
  python cli.py enhance   "..."  --template prompts/incident.md
                                  [--model gpt-3.5-turbo --temperature 0.2]

Output is JSON on stdout by default; pass `--text` to detect/anonymize for the
plain processed string only (handy in shell pipelines).

Inside Docker:
  docker exec privacy-shield python cli.py detect "Jane Doe lives in Paris"
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Optional


def _read_text(args: argparse.Namespace) -> str:
    if getattr(args, "stdin", False):
        return sys.stdin.read()
    if not args.text:
        sys.stderr.write("error: provide TEXT or pass --stdin\n")
        sys.exit(2)
    return args.text


def _print_json(payload) -> None:
    json.dump(payload, sys.stdout, indent=2, ensure_ascii=False, default=str)
    sys.stdout.write("\n")


# Lazy imports keep `--help` instant (the analyzer init takes a few seconds).
def _shield():
    from core import PrivacyShield  # noqa: WPS433
    return PrivacyShield()


def cmd_entities(args: argparse.Namespace) -> int:
    from presidio_analyzer import AnalyzerEngine  # noqa: WPS433
    analyzer = AnalyzerEngine()
    types = sorted(analyzer.get_supported_entities(language=args.language))
    if args.json:
        _print_json({"language": args.language, "count": len(types), "entities": types})
    else:
        for t in types:
            print(t)
        sys.stderr.write(f"\n{len(types)} entity types ({args.language})\n")
    return 0


def cmd_detect(args: argparse.Namespace) -> int:
    text = _read_text(args)
    result = _shield().detect_pii_with_placeholders(text)
    if args.text_only:
        print(result["processed_text"])
    else:
        _print_json(result)
    return 0


def cmd_anonymize(args: argparse.Namespace) -> int:
    text = _read_text(args)
    result = _shield().anonymize_with_fake_data(text, faker_seed=args.seed)
    if args.text_only:
        print(result["processed_text"])
    else:
        _print_json(result)
    return 0


def cmd_enhance(args: argparse.Namespace) -> int:
    text = _read_text(args)
    template: Optional[str] = None
    if args.template:
        path = Path(args.template)
        if not path.is_file():
            sys.stderr.write(f"error: template not found: {path}\n")
            return 2
        template = path.read_text(encoding="utf-8")
    api_key = args.openai_api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        sys.stderr.write("error: OPENAI_API_KEY not set (use --openai-api-key or env)\n")
        return 2
    result = _shield().anonymize_and_transform(
        text=text,
        prompt_template=template,
        openai_api_key=api_key,
        temperature=args.temperature,
        model=args.model,
    )
    if args.text_only:
        print(result["processed_text"])
    else:
        _print_json(result)
    return 0


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="privacyshield",
        description="Privacy Shield CLI — detect / anonymize / enhance text without the GUI.",
    )
    sub = p.add_subparsers(dest="command", required=True)

    pe = sub.add_parser("entities", help="List PII entity types the analyzer supports")
    pe.add_argument("--language", default="en")
    pe.add_argument("--json", action="store_true", help="Emit JSON envelope instead of one-per-line")
    pe.set_defaults(func=cmd_entities)

    pd = sub.add_parser("detect", help="Detect PII spans and emit <TYPE> placeholders")
    pd.add_argument("text", nargs="?", help="Input text (omit to read from --stdin)")
    pd.add_argument("--stdin", action="store_true", help="Read text from stdin")
    pd.add_argument("--text", dest="text_only", action="store_true",
                    help="Print only the processed text (no JSON)")
    pd.set_defaults(func=cmd_detect)

    pa = sub.add_parser("anonymize", help="Replace PII with synthetic Faker values")
    pa.add_argument("text", nargs="?")
    pa.add_argument("--stdin", action="store_true")
    pa.add_argument("--seed", type=int, default=None, help="Faker seed for reproducible output")
    pa.add_argument("--text", dest="text_only", action="store_true")
    pa.set_defaults(func=cmd_anonymize)

    px = sub.add_parser("enhance", help="Anonymize → LLM → de-anonymize round-trip")
    px.add_argument("text", nargs="?")
    px.add_argument("--stdin", action="store_true")
    px.add_argument("--template", help="Path to a prompt template file (use {anonymized_text})")
    px.add_argument("--model", default=None)
    px.add_argument("--temperature", type=float, default=None)
    px.add_argument("--openai-api-key", default=None)
    px.add_argument("--text", dest="text_only", action="store_true")
    px.set_defaults(func=cmd_enhance)

    return p


def main(argv: Optional[list] = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
