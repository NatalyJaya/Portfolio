/**
 * Selected work. Every claim below was checked against the repository
 * history or the Devpost page (Nov 2026). "contribution" lists only work that
 * is attributable to Nataly in git history or that she confirmed directly.
 */

export type ProjectLink = { label: string; href: string; note?: string };

export type Project = {
  id: "jetflow" | "streamsync" | "translator";
  index: string;
  name: string;
  tagline: string;
  /** Event or context and year — one short line. */
  kicker: string;
  team: number;
  /** One sentence: what it is and what it does. */
  summary: string;
  /** Two or three short lines: the part Nataly built. */
  contribution: string[];
  /** Optional note next to the "My part" label. */
  contributionNote?: string;
  stack: string[];
  links: ProjectLink[];
  /** Optional distinction, rendered as an accent label. */
  distinction?: string;
};

export const projects: Project[] = [
  {
    id: "jetflow",
    index: "01",
    name: "JetFlow",
    kicker: "HackUPC 2026",
    team: 3,
    tagline: "CI/CD without leaving the IDE.",
    summary:
      "IntelliJ plugin that generates GitHub Actions workflows, follows each CI run and deploys to Render, all from the editor.",
    contribution: [
      "Render deploy layer: the API client and keychain-stored credentials.",
      "Deployment tool window and the first Rocky assistant, wired to CI feedback.",
    ],
    stack: ["Kotlin", "IntelliJ SDK", "GitHub Actions", "Render API"],
    links: [{ label: "GitHub", href: "https://github.com/NatalyJaya/JetFlow" }],
  },
  {
    id: "streamsync",
    index: "02",
    name: "StreamSync",
    kicker: "Course project · 2026",
    team: 4,
    tagline: "One catalog for everything you stream.",
    summary:
      "Django app that gathers films and series from many platforms into one catalog, with personal libraries and staff dashboards.",
    contributionNote: "most commits",
    contribution: [
      "Catalog and search, from the external API to the internal database.",
      "Onboarding, personal library, settings and notifications.",
      "Code-quality metrics in CI, plus issue and PR templates.",
    ],
    stack: ["Django", "Tailwind CSS", "Docker", "GitHub Actions"],
    links: [
      { label: "GitHub", href: "https://github.com/TralaleritosTralalas/SoftwareProject" },
      { label: "Live demo", href: "https://softwareproject-web-latest.onrender.com/", note: "~1 min to wake" },
    ],
  },
  {
    id: "translator",
    index: "03",
    name: "Translator",
    kicker: "UAB The Hack 2024",
    team: 3,
    tagline: "Let your code overcome language barriers.",
    distinction: "Winner · Rookies",
    summary:
      "pip package that translates a Python file's comments, docs and variable names, detecting the source language automatically.",
    contribution: ["The translation module: deep-translator's Google backend with automatic language detection."],
    stack: ["Python", "deep-translator", "Poetry", "PyPI"],
    links: [
      { label: "Devpost", href: "https://devpost.com/software/translator-uabthehack" },
      { label: "GitHub", href: "https://github.com/naimsg16/hackatonUAB" },
    ],
  },
];
