# About Privacy Shield

Privacy Shield started as a small FastAPI experiment to see how far Microsoft Presidio could be pushed for everyday PII protection — incident tickets, support emails, internal chat logs — without ever shipping the underlying personal data to a third-party LLM.

The project consolidates three earlier prototypes (`privacy-shield`, `privacyshield`, `privacyshield-web`) into a single, deployable container with a deliberately small surface area:

- 4 HTTP endpoints (plus an optional placeholder for Markdown conversion).
- 3 UI tabs that map 1-to-1 onto those endpoints.
- 1 Docker image, multi-arch, published to GHCR on every push to `main`.

## Design principles

1. **Local-first.** No telemetry. No background calls. The only network egress is the LLM endpoint *you* point Enhance at.
2. **Reversible by design.** Anonymization is paired with a mapping the backend keeps in memory just long enough to reverse the LLM's output. Nothing is persisted to disk.
3. **Same-origin by default.** The SPA is served by FastAPI itself, so there are no CORS surprises in production. CORS in dev is wide-open and explicit.
4. **Minimal vocabulary.** Three verbs — *detect, anonymize, enhance* — and that's the whole product. Future Markitdown support is gated behind an env flag and clearly labelled "coming soon".

## Roadmap

- File upload + Markdown conversion via [Microsoft Markitdown](https://github.com/microsoft/markitdown).
- Pluggable recognizers for industry-specific PII (claims, EHR, KYC).
- Optional audit log (off by default).

## Credits

- [Microsoft Presidio](https://microsoft.github.io/presidio/)
- [spaCy](https://spacy.io/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Vite](https://vitejs.dev/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Iconify](https://iconify.design/)
