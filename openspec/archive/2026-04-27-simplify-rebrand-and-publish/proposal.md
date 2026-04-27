# Proposal — Simplify, Rebrand & Publish (Revised)

> Status: **APPROVED** — 2026-04-27
> Owner: @senthilsweb
> Revision: 2 (incorporates: Vite SPA, single combined Docker image, 3-feature UI, Slack-purple theme, Iconify, future Markitdown hook)

## 1. Why

After consolidating the Privacy Shield monorepo, several rough edges remain:

- The frontend `package.json` is still named `templrjs` (legacy from the parent template).
- The site has a marketing homepage, blog, portfolio pages, etc. that we don't need.
- Next.js + Turbopack is overkill for a single-page tool that calls one API.
- There is no automated way to ship the project — users must clone, install Python deps, install npm deps, and run two processes manually.
- The README is long-form marketing prose; new users have to scroll to find "how do I run this?" and "what endpoints exist?".

## 2. What changes

| # | Change | Outcome |
|---|--------|---------|
| 1 | Rebrand the frontend package from `templrjs` → `privacyshield-web` | `package.json`, lockfile, all string references updated. |
| 2 | Strip the frontend down to a **single SPA with three tabs**: **Detect**, **Anonymize**, **Enhance & Reverse-Anonymize**. Remove `/blog`, portfolio, marketing landing, content collection. | Root `/` shows the new app; nothing else. |
| 3 | Migrate the trimmed UI to **Vite + React + Tailwind** with a **fresh elegant layout**: left sidebar (Slack-purple `#4A154B`), three tabs as primary nav, [Iconify](https://iconify.design/) icons, shadcn-style components preserved. | Smaller install, faster dev loop, modern look. Bundle ~50–80 KB gz. |
| 4 | Add a **GitHub Actions** workflow that builds and publishes a **single combined multi-arch image** (`linux/amd64`, `linux/arm64`) to `ghcr.io/senthilsweb/privacyshield` on push to `main` + on tags. The image runs **uvicorn** which serves the FastAPI **and** the built static frontend assets. Provide a `docker-compose.yaml` for one-command launch. | One image, one container, one port. `docker compose up -d`. |
| 5 | Rewrite the README into a **slim, elegant** doc: hero, 30-second quick start, endpoint table, screenshot, license. Move long-form articles to `docs/`. | A first-time visitor understands the project and runs it in <2 minutes. |
| 6 | **Future hook** — keep a clean extension point for [Microsoft Markitdown](https://github.com/microsoft/markitdown) so we can later add a 4th tab "Convert" that uploads a PDF/DOCX, converts to Markdown, and feeds it into the existing tabs. Out of scope for this change, but design must not block it. | A documented `/convert` endpoint stub + UI tab placeholder; no implementation. |

## 3. Out of scope

- Backend (FastAPI) PII logic — keep `backend/` PII handlers as is.
- Markitdown integration itself (only the design hook).
- New PII detection features.
- Authentication / multi-tenant features.
- Kubernetes / Helm charts.

## 4. Acceptance criteria

1. `grep -ri "templrjs\|templrgo" frontend/` returns **0 hits** outside lockfiles & `node_modules/`.
2. Visiting `http://localhost:8000/` shows the new SPA immediately. Three tabs visible: **Detect**, **Anonymize**, **Enhance**. No marketing page, no blog, no portfolio.
3. Left sidebar uses Slack-purple (`#4A154B`) as primary; icons via Iconify (`@iconify/react`).
4. `docker compose up -d` (after `docker login ghcr.io`) starts **one** container using the published GHCR image and the app is reachable on a single port (default `8000`).
5. The CI workflow runs on push to `main` and produces a multi-arch image tagged `:latest` and `:<short-sha>` at `ghcr.io/senthilsweb/privacyshield` (and `:<git-tag>` on tag pushes).
6. README fits on one screen above the fold; an **API section** lists every endpoint with method, path, and a one-line description; a **Run section** has 3 commands max.
7. End-to-end smoke test (curl `/detect-pii-entities` + open root page) still passes, equivalent to today's behaviour.
8. The codebase has a clearly-named extension point (e.g., `backend/markitdown_router.py` placeholder + a `Convert` tab placeholder behind a feature flag) so adding Markitdown later is a small additive change.

## 5. Approved decisions

| Decision | Choice |
|----------|--------|
| Frontend framework | **Vite + React + Tailwind SPA** |
| Docker image strategy | **Single combined image** (FastAPI serves built `dist/`) |
| Image name | `ghcr.io/senthilsweb/privacyshield` |
| Theme primary color | **Slack purple** `#4A154B` |
| Icon system | **Iconify** (`@iconify/react`) |
| UI layout | Left sidebar + three tabs (Detect / Anonymize / Enhance & Reverse-Anonymize) |
| Future feature | Markitdown integration — placeholder hook only, not implemented now |
| Content removal | Blog, portfolio, marketing landing all deleted (no redirects) |
