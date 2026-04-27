# Tasks — Simplify, Rebrand & Publish (Revised)

> Companion to [`proposal.md`](./proposal.md) and [`design.md`](./design.md).
> Revision 2 — single combined image, 3-feature SPA, Slack-purple theme, Iconify, Markitdown hook.

## Phase 1 — Vite SPA scaffold

1. Scaffold a fresh Vite app at `frontend-new/`: `npm create vite@latest frontend-new -- --template react-ts`.
2. Install Tailwind v3 + autoprefixer + postcss; init `tailwind.config.ts` (with the `brand` palette around `#4A154B` per design §2.1) and `postcss.config.cjs`.
3. Install runtime deps: `react-hook-form`, `@hookform/resolvers`, `zod`, `@iconify/react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `@radix-ui/react-tabs`, `@radix-ui/react-select`, `@radix-ui/react-slot`, `sonner`.
4. Add `index.html` title "Privacy Shield" + favicon.
5. Verify `npm run dev` boots a blank page.

## Phase 2 — Layout & theme

6. Build `src/components/Sidebar.tsx` (Slack-purple `bg-brand-700`, logo `mdi:shield-lock-outline`, nav items with Iconify icons per design §2.4, collapsible at `<lg`).
7. Build `src/components/AppShell.tsx` (Sidebar + main content area + tab bar).
8. Implement `Tabs` using `@radix-ui/react-tabs`; three triggers (`Detect`, `Anonymize`, `Enhance & Reverse-Anonymize`) plus a hidden `Convert` trigger gated by `import.meta.env.VITE_FEATURE_CONVERT === 'true'`.
9. Verify `dark:` variants on every custom color; test light + dark mode toggling.

## Phase 3 — Feature tabs

10. Port `components/ui/*` from current `frontend/src/`; strip `"use client"` directives.
11. Move the extended `entityStyles` map to `src/lib/entity-styles.ts`.
12. **Detect tab** (`src/features/Detect.tsx`): textarea + submit; calls `POST ${VITE_API_URL}/detect-pii-entities`; renders highlighted text + entity table.
13. **Anonymize tab** (`src/features/Anonymize.tsx`): textarea + submit; calls `POST /anonymize-with-fake-data`; renders Original / Anonymized / Faked panels + mapping table.
14. **Enhance tab** (`src/features/Enhance.tsx`): textarea + prompt-template select + LLM-model select + temperature slider; calls `POST /anonymize-and-transform`; renders Anonymized → Enhanced → Reverse-Anonymized.
15. **Convert tab placeholder** (`src/features/Convert.tsx`): inert "coming soon" panel describing Markitdown intent.
16. Add `sonner` toaster mount in `App.tsx`.
17. Add a copy-to-clipboard button (`mdi:content-copy`) on every output card.

## Phase 4 — Wire-up & cleanup

18. Set `VITE_API_URL` (default `""` so paths are relative when served from same origin); update all fetch calls.
19. `npm run build` → static `dist/` works.
20. Delete the old Next.js `frontend/`. `git mv frontend-new frontend`.
21. Set `frontend/package.json`: `name: "privacyshield-web"`, update `description`, `repository`.
22. `grep -ri "templrjs\|templrgo" frontend/ docs/ README.md` → fix all hits; regenerate lockfile.

## Phase 5 — Backend tweaks

23. Add `GET /health` → `{"status":"ok"}` to `backend/api.py`.
24. Create `backend/markitdown_router.py`: `POST /convert` returning HTTP 501 with `{"detail":"Markitdown integration coming soon"}`. Mount under `app.include_router(markitdown_router, prefix="/convert")` gated by env `ENABLE_CONVERT=true` (default off).
25. Mount static SPA: `app.mount("/", StaticFiles(directory="static", html=True), name="spa")` — register **after** all API routes.
26. Tighten CORS default to `["http://localhost:8000","http://localhost:3000"]` via env.
27. Smoke test: backend on 8001 + Vite dev server on 3000 against it; all 3 tabs work.

## Phase 6 — Single combined Docker image

28. Add root `Dockerfile` (multi-stage) per design §3.1.
29. Add root `docker-compose.yaml` per design §3.3.
30. Local build & run: `docker build -t privacyshield:dev . && docker run -p 8000:8000 --env-file backend/.env privacyshield:dev`. Open `http://localhost:8000` → SPA + API both reachable.
31. Add `.dockerignore` (exclude `node_modules`, `.git`, `frontend/.next`, `backend/env`, `logs`, `*.webp` not in `docs/`).

## Phase 7 — GitHub Actions

32. Create `.github/workflows/build-and-publish.yml` per design §3.4 — multi-arch (`linux/amd64,linux/arm64`), GHCR push, GHA layer cache, tags `latest` + `<short-sha>` + `<git-tag>`.
33. Push to `main`; verify image at `ghcr.io/senthilsweb/privacyshield:latest`.
34. Manually mark the GHCR package **public** (one-time UI step). Document in README.
35. Tag `v0.1.0`; verify tag-triggered builds publish `:v0.1.0`.

## Phase 8 — README rewrite

36. Rewrite `README.md` per design §4 (≤ ~120 lines).
37. Move long-form content to `docs/architecture.md` + `docs/about.md`.
38. Capture a fresh screenshot → `docs/screenshot.png`. Reference it in the hero.
39. Add the API table from design §6.

## Phase 9 — Verification & commit

40. Run the acceptance check (proposal §4) end-to-end:
    - [ ] `grep -ri "templrjs\|templrgo" frontend/ docs/ README.md` → 0 hits.
    - [ ] `http://localhost:8000/` shows SPA with three tabs.
    - [ ] Sidebar Slack-purple, Iconify icons render.
    - [ ] `docker compose up -d` boots one container; SPA + API both reachable on `:8000`.
    - [ ] CI green; image published & public.
    - [ ] README ≤ ~120 lines with API table + 3-command quick start.
    - [ ] All endpoints respond identically to pre-change behaviour.
    - [ ] `Convert` tab + `POST /convert` exist behind their feature flags (Markitdown future hook).
41. Commit in logical chunks: `chore(rebrand)`, `feat(frontend): vite + slack-purple shell`, `feat(frontend): three feature tabs`, `feat(backend): /health + /convert stub`, `feat(docker): single combined image`, `ci: ghcr workflow`, `docs: slim readme`.
42. Move `openspec/changes/simplify-rebrand-and-publish/` → `openspec/archive/simplify-rebrand-and-publish/` once verified.
