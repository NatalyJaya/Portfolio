/**
 * Journey — the photo section (§ 06), as one chronology.
 *
 *   - `events`    every conference / hackathon, oldest first. All of an
 *                 event's photos live in its `frames` and open with the row
 *                 (hover on desktop, tap on mobile). A frame with a `tilt` is a
 *                 casual snapshot: it is laid down as a tilted print, while the
 *                 professional photos stay straight.
 *
 * Each photo is used exactly once on the page — never in two places.
 * (About uses upc-workshop.jpg, so it is not listed here.)
 *
 * To add a photo:
 *   1. Put the original in photos-src/ (not bundled).
 *   2. Export a web JPEG (≤ 1600px long edge, ~72% quality, no EXIF) into
 *      src/assets/photos/ and import it below.
 */

import type { StaticImageData } from "next/image";
import hackuab from "@/assets/photos/hackuab-2024.jpg";
import hackuabPitch from "@/assets/photos/hackuab-2024-pitch.jpg";
import fourYfnPortrait from "@/assets/photos/4yfn-portrait.jpg";
import mwcAndroid from "@/assets/photos/mwc-android.jpg";
import mwcKddi from "@/assets/photos/mwc-kddi.jpg";
import mwcFriend from "@/assets/photos/mwc-friend.jpg";
import t3chfest from "@/assets/photos/t3chfest-2026.jpg";
import madrid from "@/assets/photos/madrid-palacio-real.jpg";
import gameJam from "@/assets/photos/game-jam.jpg";
import lleidahackTeam from "@/assets/photos/lleidahack-team.jpg";
import lleidahackPhoto from "@/assets/photos/lleidahack-photo.jpg";
import lauzhackAll from "@/assets/photos/lauzhack-all.jpg";
import lauzhackBadge from "@/assets/photos/lauzhack-badge.jpg";
import hackepsPirates from "@/assets/photos/hackeps-pirates.jpg";
import hackepsTricorn from "@/assets/photos/hackeps-tricorn.jpg";
import hackepsCrew from "@/assets/photos/hackeps-crew.jpg";
import hackupcTeam from "@/assets/photos/hackupc-team.jpg";

type Photo = { src: StaticImageData; alt: string; position?: string };

export type Frame = Photo & {
  id: string;
  caption: string;
  /** Casual snapshot: rests at this tilt (degrees) and straightens on hover. */
  tilt?: number;
};

export type JourneyEvent = {
  id: string;
  /** Full name (stage, lightbox). */
  event: string;
  /** Shorter label for the timeline row, when the full name is long. */
  short?: string;
  place: string;
  /** Grouping key on the timeline. */
  year: number;
  /** Displayed date: "Mar 2026", "2024", "2024 — present". */
  when: string;
  role: string;
  note: string;
  href?: string;
  hrefLabel?: string;
  /** Every photo of this event: professional first, then snapshots (with `tilt`). */
  frames?: Frame[];
  /** Layout for the professional photos — trio: a lead portrait and two stacked; step: a lead and a smaller print over its corner. */
  compose?: "trio" | "step";
};

/** Oldest first. Within a year, order is by month where known. */
export const events: JourneyEvent[] = [
  {
    id: "uabthehack-2024",
    event: "UAB The Hack",
    place: "Bellaterra",
    year: 2024,
    when: "2024",
    role: "Developer · Winner, Rookies",
    note: "My first hackathon, at the Universitat Autònoma de Barcelona: a pip package that translates the comments and identifiers in Python code.",
    href: "https://devpost.com/software/translator-uabthehack",
    compose: "step",
    frames: [
      {
        id: "hackuab-2024",
        src: hackuab,
        alt: "Overhead view of hackathon participants working on laptops along a long table covered in cables.",
        caption: "Build: the long table, mid-hackathon.",
        position: "50% 40%",
      },
      {
        id: "hackuab-2024-pitch",
        src: hackuabPitch,
        alt: "Three teammates presenting their project to a classroom, with a slide about code translation projected behind them.",
        caption: "Pitch: presenting the translator.",
      },
    ],
  },
  {
    id: "lleidahack",
    event: "LleidaHack",
    place: "Lleida",
    year: 2024,
    when: "2024 — present",
    role: "Frontend & marketing",
    note: "The student tech association: I work on its website and on event visuals and outreach.",
    compose: "step",
    frames: [
      {
        id: "lleidahack-team",
        src: lleidahackTeam,
        alt: "A group of students, several in matching black hoodies, standing in a circle on a grassy field beside a dry-stone wall, with mountains behind.",
        caption: "The association, gathered in a circle outdoors.",
      },
      {
        id: "lleidahack-photo",
        src: lleidahackPhoto,
        alt: "Two people in black hoodies talking outdoors in bright sun, in front of a dry-stone wall and dense hedges.",
        caption: "A conversation in the sun.",
        position: "60% 50%",
      },
    ],
  },
  {
    id: "hackeps-2024",
    event: "HackEPS",
    place: "Lleida",
    year: 2024,
    when: "2024",
    role: "Volunteer",
    note: "On the organising side with LleidaHack: logistics and activity coordination.",
    frames: [
      {
        id: "hackeps-crew",
        src: hackepsCrew,
        alt: "Three volunteers in white HackEPS T-shirts flash peace signs against a white brick wall; one holds a wide black hat behind her.",
        caption: "The volunteer crew.",
        position: "45% 40%",
      },
      {
        id: "hackeps-pirates",
        src: hackepsPirates,
        alt: "Nataly and a friend in black pirate hats in front of an orange HackEPS backdrop with a painted palm tree; she flashes a peace sign.",
        caption: "The backdrop was a desert island. We committed to the bit.",
        tilt: -1.6,
      },
      {
        id: "hackeps-tricorn",
        src: hackepsTricorn,
        alt: "Nataly in a battered leather tricorn hat, hiding her face behind her forearm, at a table in a bright atrium.",
        caption: "Tricorn on, camera off.",
        tilt: -2,
      },
    ],
  },
  {
    id: "lauzhack-2024",
    event: "LauzHack",
    place: "Lausanne",
    year: 2024,
    when: "2024",
    role: "Developer",
    note: "In Lausanne, Switzerland: a multiplayer drawing game in Unity using augmented-reality glasses and an AR pen.",
    frames: [
      {
        id: "lauzhack-all",
        src: lauzhackAll,
        alt: "Hundreds of hackathon participants waving from the balconies and a spiral staircase in a tall glass atrium, with LauzHack banners at the bottom.",
        caption: "Everyone, on one spiral staircase.",
      },
      {
        id: "lauzhack-badge",
        src: lauzhackBadge,
        alt: "Looking down at a red LauzHack lanyard over a navy hoodie with Lausanne lettering, framed by long brown hair.",
        caption: "Lanyard on, hoodie on.",
        tilt: 2,
      },
    ],
  },
  {
    id: "lan-party-lleida",
    event: "LAN Party Lleida",
    place: "Lleida",
    year: 2025,
    when: "2025",
    role: "Developer · game jam",
    note: "Cartes del Mite, a role-playing game built on Catalan myths and traditions.",
    href: "https://nsaadig16.itch.io/cartes-del-mite",
    hrefLabel: "Play it on itch.io",
    frames: [
      {
        id: "game-jam",
        src: gameJam,
        alt: "A close selfie of Nataly wearing a headset, glasses and a lanyard and sticking out her tongue, while a teammate in a headset with a boom mic looks away behind her.",
        caption: "Headsets on, tongue out, jam in progress.",
        tilt: 1.2,
      },
    ],
  },
  {
    id: "4yfn-mwc-2026",
    event: "4YFN & Mobile World Congress",
    short: "4YFN & MWC",
    place: "Barcelona",
    year: 2026,
    when: "Mar 2026",
    role: "Attendee",
    note: "Mobile World Congress's startup event, attended as a Universitat de Lleida student. The floor ran from neon installations to a data-centre exhibit and a very large Android.",
    compose: "trio",
    frames: [
      {
        id: "4yfn-portrait",
        src: fourYfnPortrait,
        alt: "Nataly smiling in front of the Spain pavilion at 4YFN, under a hanging mesh sculpture threaded with colourful neon tubes, wearing an attendee badge.",
        caption: "4YFN, on the Spain pavilion floor.",
        position: "50% 40%",
      },
      {
        id: "mwc-android",
        src: mwcAndroid,
        alt: "A visitor with a conference badge waves beside a giant Android mascot sculpture on a wooden plinth outside a Mobile World Congress hall.",
        caption: "The Android mascot, Mobile World Congress.",
        position: "50% 55%",
      },
      {
        id: "mwc-kddi",
        src: mwcKddi,
        alt: "A visitor in profile, long dark hair in the foreground, looking at KDDI's interconnection data-centre exhibit under stage lights.",
        caption: "KDDI's interconnection data-centre exhibit.",
        position: "60% 50%",
      },
      {
        id: "mwc-friend",
        src: mwcFriend,
        alt: "A close selfie of Nataly and a friend wearing matching blue lanyards at Mobile World Congress; the friend waves at the camera.",
        caption: "A wave from a friend, a lanyard on each of us.",
        tilt: -2.2,
      },
    ],
  },
  {
    id: "t3chfest-2026",
    event: "t3chfest",
    place: "Madrid",
    year: 2026,
    when: "Mar 2026",
    role: "Attendee",
    note: "A tech conference in Madrid, hosted at the Universidad Complutense. The talk on screen: “Hack Your Way to Silicon Valley”.",
    compose: "step",
    frames: [
      {
        id: "t3chfest-2026",
        src: t3chfest,
        alt: "A conference auditorium at t3chfest 2026: a speaker stands beside a stage-wide screen showing the talk “Hack Your Way to Silicon Valley”, with the audience's backs in the foreground.",
        caption: "t3chfest 2026, Track 3.",
      },
      {
        id: "madrid-palacio-real",
        src: madrid,
        alt: "Someone leans on a railing in the late-afternoon sun, looking across hedged gardens towards Madrid's Royal Palace.",
        caption: "Madrid's Royal Palace, late sun.",
      },
    ],
  },
  {
    id: "hackupc-2026",
    event: "HackUPC",
    place: "Barcelona",
    year: 2026,
    when: "2026",
    role: "Developer",
    note: "Built JetFlow, a CI/CD plugin for IntelliJ, for the event's IntelliJ challenge.",
    frames: [
      {
        id: "hackupc-team",
        src: hackupcTeam,
        alt: "Nataly and two teammates in green HackUPC T-shirts at a shared table with notebooks, coffee cups and a piece of fruit; one flashes a peace sign.",
        caption: "Fuel check: fruit, coffee, notebooks.",
        tilt: -1.2,
      },
    ],
  },
];

/** Every event photo in timeline order — the lightbox's set, Fig. 6.1 onwards. */
export const featured = events.flatMap((event) => (event.frames ?? []).map((frame) => ({ frame, event })));

