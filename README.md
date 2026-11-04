# 🌐 Personal Portfolio — Next.js

A personal portfolio website built with **Next.js**, **TypeScript**, and **Tailwind CSS**. It showcases projects, skills, trajectory, and contact information, and is automatically deployed to GitHub Pages via CI/CD pipelines.


---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [CI/CD Pipeline with GitHub Actions](#cicd-pipeline-with-github-actions)
- [Deployment](#deployment)

---

## Overview

A single-page portfolio with an editorial, "neural field" identity:

- **Opening sequence**: a live Canvas 2D network forms (nodes → synapses → signal) and becomes the hero background. It plays once per session; `?intro` forces a replay. It respects `prefers-reduced-motion` and pauses off-screen.
- **About**, **Selected work** (three case studies with schematics drawn from each codebase), **Open notebooks** (learning resources), **Skills** (a draggable "connectome" where each skill links to its evidence, plus an index view), **Research interests & writing**, **Journey** (gallery + lightbox) and **Contact**.

No runtime dependencies beyond Next.js and React.

---

## Tech Stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Framework  | [Next.js](https://nextjs.org/) 16 (static export)  |
| Language   | TypeScript                                         |
| Styling    | Tailwind CSS 3 + CSS custom-property tokens        |
| Graphics   | Canvas 2D and inline SVG (no WebGL library)        |
| Fonts      | Newsreader (Google Fonts), Geist Sans/Mono (local) |
| Linting    | ESLint 9 flat config (`eslint-config-next`)        |

---

## Project Structure

```
src/
├── app/                 # layout (fonts, metadata, pre-paint intro script), page, globals.css, icon
├── assets/photos/       # optimised JPEGs used by the gallery/about
├── components/
│   ├── neural/          # field.ts (simulation engine) + NeuralField.tsx (intro overlay)
│   ├── figures/         # project schematics (SVG / code)
│   ├── sections/        # one component per page section
│   ├── layout/          # navbar
│   └── ui/              # icons, section header, reveal observer
├── content/             # ← edit these to update the site
│   ├── profile.ts       # identity, links, education, certificates
│   ├── projects.ts      # case studies
│   ├── resources.ts     # open notebooks
│   ├── skills.ts        # skills + evidence
│   ├── writing.ts       # interests + articles (placeholders until published)
│   └── journey.ts       # gallery entries
└── lib/utils.ts
```

### Updating content

- **Publish an article**: replace a placeholder in `src/content/writing.ts` with a `status: "published"` entry (the file has a template).
- **Add a gallery photo**: drop a JPEG (≤1400px wide) into `src/assets/photos/`, import it in `src/content/journey.ts` and set `image` on the entry.
- **Add project screenshots**: set `media` on a project in `src/content/projects.ts`.
- **Add a skill**: append to `src/content/skills.ts` with the places it was used (`evidence`). Size in the sphere is derived from that count.

---

## Getting Started

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Available Scripts

| Command             | Description                                   |
|---------------------|-----------------------------------------------|
| `npm run dev`       | Development server                            |
| `npm run build`     | Static export to `./out`                      |
| `npm run start`     | Serve `./out` locally                         |
| `npm run lint`      | ESLint                                        |
| `npm run typecheck` | TypeScript, no emit                           |

`PAGES_BASE_PATH` (set automatically in CD) builds the site for a GitHub Pages project path such as `/Portfolio`.

---

## CI/CD Pipeline with GitHub Actions

> **A3 — CI and CD Pipeline with GitHub Actions**  
> Universitat de Lleida · Academic Year 2025–2026

This project implements two separate GitHub Actions workflows located in `.github/workflows/`:

---

### CI — Continuous Integration (`ci.yml`)

**Trigger:** Runs automatically on every `push` to `main` and on every `pull_request`. Can also be triggered manually via `workflow_dispatch`.

**What it does:**

1. **Checkout** the repository code.
2. **Detect the package manager** (yarn or npm) by checking for a `yarn.lock` file.
3. **Set up Node.js v20** with dependency caching.
4. **Install dependencies** using the detected package manager.
5. **Lint, type-check and build** the Next.js project to validate the code.

```yaml
# Simplified overview of ci.yml
on:
  push:
    branches: ["main"]
  pull_request:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Detect package manager   # yarn or npm
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Install dependencies
      - name: Build                    # next build
```

This ensures that no broken code is ever merged into the main branch.

---

### CD — Continuous Deployment (`cd.yml`)

**Trigger:** Runs automatically when the `CI - Build & Test` workflow **completes successfully**. Can also be triggered manually via `workflow_dispatch`.

**What it does:**

1. **Waits for CI to pass** — the deployment only starts if the CI workflow conclusion is `success`.
2. **Checkout** the repository.
3. **Configure GitHub Pages** and read its base path, passed to the build as `PAGES_BASE_PATH`.
4. **Install dependencies** and **build** the project (`next build`), producing a static export in `./out`.
5. **Upload the build artifact** for GitHub Pages.
6. **Deploy** to GitHub Pages and output the live URL.

```yaml
# Simplified overview of cd.yml
on:
  workflow_run:
    workflows: ["CI - Build & Test"]
    types: [completed]
  workflow_dispatch:

jobs:
  deploy:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5   # provides base_path
      - name: Install & Build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./out
      - uses: actions/deploy-pages@v5
```

**Required permissions** (set at the workflow level):

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

---

### Pipeline Flow

```
Push / Pull Request
        │
        ▼
  ┌─────────────┐
  │  CI Workflow │  ← build + validate
  └──────┬──────┘
         │ success
         ▼
  ┌─────────────┐
  │  CD Workflow │  ← deploy to GitHub Pages
  └─────────────┘
         │
         ▼
   🌐 Live Site
```

The two workflows are intentionally **decoupled**: CI validates the code, and CD only deploys if CI passes. This prevents broken builds from ever reaching production.

---

## Deployment

The site is deployed to **GitHub Pages** via the CD workflow described above.

To enable GitHub Pages in your repository:
1. Go to **Settings → Pages**.
2. Set the source to **GitHub Actions**.
3. Push to `main` — the CI/CD pipeline will handle the rest.
