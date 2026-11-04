/**
 * Journey / gallery entries. To add a photo:
 *   1. Put a JPEG (≤ 1400px wide, ~65% quality) in src/assets/photos/
 *   2. Import it below and set `image` on the entry.
 * Entries without an image render a labelled placeholder frame.
 *
 * `span` controls the tile shape in the editorial grid.
 */

import type { StaticImageData } from "next/image";
import hackuab from "@/assets/photos/hackuab-2024.jpg";
import fourYfn from "@/assets/photos/4yfn-2026.jpg";

export type JourneyEntry = {
  id: string;
  event: string;
  place: string;
  date: string;
  role: string;
  note: string;
  span: "tall" | "wide" | "square" | "feature";
  image?: { src: StaticImageData; alt: string; position?: string };
  href?: string;
};

export const journey: JourneyEntry[] = [
  {
    id: "4yfn-2026",
    event: "4YFN",
    place: "Barcelona",
    date: "2026",
    role: "Attendee",
    note: "Mobile World Congress's startup event, attending as a Universitat de Lleida student.",
    span: "tall",
    image: {
      src: fourYfn,
      alt: "Nataly smiling in front of a wall of curved neon light strips, wearing a 4YFN attendee badge.",
      position: "50% 35%",
    },
  },
  {
    id: "hackupc-2026",
    event: "HackUPC",
    place: "Barcelona",
    date: "2026",
    role: "Developer",
    note: "Built JetFlow, a CI/CD plugin for IntelliJ, for the event's IntelliJ challenge.",
    span: "square",
  },
  {
    id: "uabthehack-2024",
    event: "UAB The Hack",
    place: "Bellaterra, Barcelona",
    date: "2024",
    role: "Developer · Winner, Rookies",
    note: "My first hackathon: a pip package that translates the comments and identifiers in Python code.",
    span: "feature",
    image: {
      src: hackuab,
      alt: "Overhead view of hackathon participants working on laptops along a long table covered in cables.",
      position: "50% 40%",
    },
    href: "https://devpost.com/software/translator-uabthehack",
  },
  {
    id: "lauzhack-2024",
    event: "LauzHack",
    place: "Lausanne, Switzerland",
    date: "2024",
    role: "Developer",
    note: "A multiplayer drawing game in Unity using augmented-reality glasses and an AR pen.",
    span: "square",
  },
  {
    id: "lleidahack",
    event: "LleidaHack",
    place: "Lleida",
    date: "2024 — present",
    role: "Frontend & marketing",
    note: "The student tech association: I work on its website and on event visuals and outreach.",
    span: "wide",
  },
  {
    id: "hackeps-2024",
    event: "HackEPS",
    place: "Lleida",
    date: "2024",
    role: "Volunteer",
    note: "On the organising side with LleidaHack: logistics and activity coordination.",
    span: "square",
  },
  {
    id: "lan-party-lleida",
    event: "LAN Party Lleida",
    place: "Lleida",
    date: "2025",
    role: "Developer · game jam",
    note: "Cartes del Mite, a role-playing game built on Catalan myths and traditions.",
    span: "square",
    href: "https://nsaadig16.itch.io/cartes-del-mite",
  },
];
