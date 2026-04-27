# Prompts

This folder is bind-mounted into the container at `/app/prompts` (via the
`PROMPTS_DIR` env var). Drop `.txt` or `.md` files here and they show up in
the **Enhance** tab without rebuilding the image.

## File format

```
# Title (optional, first line)
Short description (optional, second line)

<template body — must include the literal token {anonymized_text}>
```

Examples shipped: `incident.md`, `email.md`, `summary.md`.
