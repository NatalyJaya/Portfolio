/**
 * Selected work. Every claim below was checked against the repository
 * history or the Devpost page (Nov 2026). "contribution" lists only work that
 * is attributable to Nataly in git history or that she confirmed directly.
 */

import type { StaticImageData } from "next/image";

export type ProjectLink = { label: string; href: string; note?: string };

export type Project = {
  id: "jetflow" | "streamsync" | "translator";
  index: string;
  name: string;
  tagline: string;
  /** Short line shown above the title, e.g. the event. */
  kicker: string;
  meta: { label: string; value: string }[];
  problem: string;
  whatItDoes: string[];
  contribution: string[];
  stack: string[];
  links: ProjectLink[];
  /** Optional distinction, rendered as an accent label. */
  distinction?: string;
  figureCaption: string;
  /** Layout variant — gives each case study its own composition. */
  layout: "figure-left" | "figure-wide" | "figure-right";
  /**
   * Screenshots or demo frames. Empty for now: add real captures here and the
   * case study will render them under the schematic.
   */
  media?: { src: StaticImageData; alt: string }[];
};

export const projects: Project[] = [
  {
    id: "jetflow",
    index: "01",
    name: "JetFlow",
    kicker: "HackUPC 2026 · IntelliJ challenge",
    tagline: "CI/CD without leaving the IDE.",
    meta: [
      { label: "Context", value: "Hackathon, one weekend" },
      { label: "Team", value: "3 developers" },
      { label: "Platform", value: "IntelliJ Platform plugin" },
      { label: "Year", value: "2026" },
    ],
    problem:
      "Shipping a change usually means leaving the editor: writing workflow YAML, watching a CI run in the browser, then triggering a deploy on a hosting dashboard. JetFlow keeps that loop inside IntelliJ.",
    whatItDoes: [
      "Generates GitHub Actions workflows and watches the run started by each push, reporting failed steps in the IDE.",
      "Connects to the Render API to list services, trigger deploys, check their status and roll back.",
      "Bundles a project's code and structure into one Markdown file, with secrets redacted, to give an LLM context.",
      "Rocky, an animated assistant in the editor, guides setup and announces whether a build or deploy succeeded.",
    ],
    contribution: [
      "Bootstrapped the plugin from the IntelliJ Platform template.",
      "Built the Render.com deployment layer: the API client (services, deploys, status, rollback) and credential storage in the OS keychain via IntelliJ's PasswordSafe.",
      "Built the deployment tool window and the first version of the Rocky assistant, then wired it to CI feedback.",
    ],
    stack: ["Kotlin", "IntelliJ Platform SDK", "Gradle", "GitHub Actions API", "Render API"],
    links: [{ label: "Source on GitHub", href: "https://github.com/NatalyJaya/JetFlow" }],
    figureCaption: "The loop JetFlow closes: push from the IDE, follow CI, deploy on Render.",
    layout: "figure-left",
  },
  {
    id: "streamsync",
    index: "02",
    name: "StreamSync",
    kicker: "University team project · Feb — Jun 2026",
    tagline: "One catalog for everything you stream.",
    meta: [
      { label: "Context", value: "Semester-long software engineering project" },
      { label: "Team", value: "4 developers" },
      { label: "My share", value: "Most commits on the repo" },
      { label: "Year", value: "2026" },
    ],
    problem:
      "Films and series are spread across many streaming platforms, so keeping track of what to watch, and where, is tedious. StreamSync brings them into one catalog with personal libraries. Behind it is a team process with issues, pull requests and automated quality gates.",
    whatItDoes: [
      "A browsable catalog of films and series across platforms, with search, filters and genre-based recommendations.",
      "Personal libraries: favourites, watching and completed lists, custom lists and a watchlist.",
      "Notifications when new content appears in a user's favourite genres.",
      "Role-based areas: dashboards for platform managers and directors, plus user administration for tech admins.",
      "English and Spanish interface, deployed with Docker on Render.",
    ],
    contribution: [
      "Built the catalog: film and series pages, search with filters, the external catalog API integration and its later move to the internal database.",
      "Designed and built registration and onboarding, including genre selection that feeds the recommendations.",
      "Built the personal library (favourites, status lists, list CRUD) and user settings, with profile images on Cloudinary.",
      "Added the notification commands and the Spanish translations of the remaining pages.",
      "Contributed code-quality tooling: cyclomatic-complexity and identifier-length metrics in CI, plus issue and PR templates.",
    ],
    stack: ["Python", "Django", "JavaScript", "Tailwind CSS", "Docker", "GitHub Actions", "Render", "Cloudinary"],
    links: [
      { label: "Source on GitHub", href: "https://github.com/TralaleritosTralalas/SoftwareProject" },
      {
        label: "Live demo",
        href: "https://softwareproject-web-latest.onrender.com/",
        note: "free tier — may take ~1 min to wake",
      },
    ],
    figureCaption: "StreamSync's domain: who uses it, what they see, and what the system tracks.",
    layout: "figure-wide",
  },
  {
    id: "translator",
    index: "03",
    name: "Translator UABTheHack",
    kicker: "UAB The Hack · May 2024",
    tagline: "Let your code overcome language barriers.",
    distinction: "Winner — Rookies category",
    meta: [
      { label: "Context", value: "Hackathon, first year of university" },
      { label: "Team", value: "3 developers" },
      { label: "Format", value: "pip package" },
      { label: "Year", value: "2024" },
    ],
    problem:
      "Programmers often meet code whose comments and identifiers are written in a language they don't read. We saw the same barrier at the event itself, when someone in the audience asked a presenter to switch language.",
    whatItDoes: [
      "Takes a Python file and a target language and writes a translated copy.",
      "Translates comments, documentation and variable names, and detects the source language automatically.",
      "Published as a pip package with one entry point: translate_code(input, language, output).",
    ],
    contribution: [
      "Wrote the translation module, which wraps deep-translator's Google Translate backend with automatic source-language detection.",
      "Took on Python and packaging for the first time, together with the rest of the team.",
    ],
    stack: ["Python", "deep-translator", "Poetry", "PyPI"],
    links: [
      { label: "Devpost", href: "https://devpost.com/software/translator-uabthehack" },
      { label: "Source on GitHub", href: "https://github.com/naimsg16/hackatonUAB" },
    ],
    figureCaption: "What the package does to a file. Illustrative input and output, not real output.",
    layout: "figure-right",
  },
];
