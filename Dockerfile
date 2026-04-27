# syntax=docker/dockerfile:1.6
# =====================================================================
# Privacy Shield — single combined image
# Stage 1: build the Vite SPA
# Stage 2: runtime — FastAPI + Presidio + spaCy + the built SPA
# =====================================================================

# ---- Stage 1: frontend builder ---------------------------------------
FROM node:20-alpine AS web-builder

WORKDIR /web
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY frontend/ ./
# Public-facing API is same-origin in production, so VITE_API_URL stays empty.
ENV VITE_API_URL="" \
    VITE_FEATURE_CONVERT="false"
RUN npm run build


# ---- Stage 2: python runtime -----------------------------------------
FROM python:3.10-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8000 \
    CORS_ORIGINS="*" \
    ENABLE_CONVERT="false" \
    PROMPTS_DIR="/app/prompts"

# System deps:
#   curl  — used by HEALTHCHECK
#   build-essential — required to compile blis/thinc from source on
#                     linux/arm64 (no prebuilt wheels for some spaCy deps)
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
        curl \
        build-essential \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python deps — install first for better layer caching.
COPY backend/requirements.txt ./
RUN pip install --upgrade pip \
 && pip install -r requirements.txt \
 && pip install "uvicorn[standard]" \
 && python -m spacy download en_core_web_lg \
 && apt-get purge -y --auto-remove build-essential \
 && rm -rf /root/.cache/pip /var/lib/apt/lists/*

# Application code.
COPY backend/ ./

# Default prompt templates (operators can override by bind-mounting
# their own folder onto /app/prompts at runtime).
COPY prompts/ ./prompts/

# Static SPA bundle (served by FastAPI from backend/static).
COPY --from=web-builder /web/dist ./static

# Drop privileges.
RUN useradd --system --create-home --uid 1001 app \
 && chown -R app:app /app
USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8000/health || exit 1

CMD ["sh", "-c", "uvicorn api:app --host 0.0.0.0 --port ${PORT}"]
