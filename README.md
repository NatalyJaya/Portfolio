# 🌐 Personal Portfolio — Next.js

A personal portfolio website built with **Next.js**, **TypeScript**, and **Tailwind CSS**. It showcases projects, skills, trajectory, and contact information, and is automatically deployed to GitHub Pages via CI/CD pipelines.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [CI/CD Pipeline with GitHub Actions](#cicd-pipeline-with-github-actions)
- [Deployment](#deployment)

---

## Overview

This is a fully responsive personal portfolio featuring:

- **Home** — introduction and typewriter effect
- **About** — bio and profile image
- **Projects** — showcased work with GitHub data integration
- **Languages & Skills** — technology stack display
- **Contact** — footer with social links and email

Internationalization is supported via `i18next` and `react-i18next`.

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Framework   | [Next.js](https://nextjs.org/) (v16)            |
| Language    | TypeScript                                      |
| Styling     | Tailwind CSS, Styled Components                 |
| UI Icons    | Lucide React, React Icons                       |
| i18n        | i18next, react-i18next                          |
| Font        | Geist (via `next/font`)                         |
| Linting     | ESLint (eslint-config-next)                     |

---

## Project Structure

```
src/
├── app/
│   ├── about/          # About section component
│   ├── assets/img/     # Static images and icons
│   ├── data/           # GitHub data integration
│   ├── fonts/          # Geist font files
│   ├── main/           # Navbar, footer, post-footer
│   ├── sections/       # Home, Projects, Languages, Trajectory
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Entry page
├── components/
│   └── ui/             # Reusable UI components (badge, etc.)
└── lib/
    ├── rate-limit.ts   # API rate limiting utility
    ├── sanitize.ts     # Input sanitization
    └── utils.ts        # General utilities
```

---

## Getting Started

### Prerequisites

- Node.js **v20** or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/Portfolio.git
cd Portfolio

# Install dependencies
npm install
```

### Run in development mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

The project uses environment variables for things like email configuration (Nodemailer). Refer to `.env.example` for the required keys.

---

## Available Scripts

| Command         | Description                        |
|-----------------|------------------------------------|
| `npm run dev`   | Start the development server       |
| `npm run build` | Build for production               |
| `npm run start` | Start the production server        |
| `npm run lint`  | Run ESLint                         |

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
5. **Build the Next.js project** (`next build`) to validate that the code compiles without errors.

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
3. **Configure GitHub Pages** with Next.js as the static site generator.
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
      - uses: actions/configure-pages@v5
        with:
          static_site_generator: next
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
