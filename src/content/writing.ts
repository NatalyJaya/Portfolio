/**
 * Research interests and writing.
 *
 * Nothing has been published yet. The entries in `articles` are explicitly
 * labelled placeholders that show the layout. To publish a real article,
 * replace a placeholder with:
 *
 *   {
 *     status: "published",
 *     title: "The real title",
 *     abstract: "One or two sentences.",
 *     platform: "Substack",            // or "Medium"
 *     date: "2027-01-15",              // ISO date
 *     readingTime: "8 min read",
 *     href: "https://nataken.substack.com/p/…",
 *   }
 */

export type Interest = { field: string; note: string };

export const interests: Interest[] = [
  {
    field: "Computational neuroscience",
    note: "Using mathematical models and simulation to understand how neurons and circuits compute.",
  },
  {
    field: "Machine learning for healthcare",
    note: "How models are built, evaluated and deployed on clinical data — the subject of my Stanford Online course.",
  },
  {
    field: "Biomedical signal processing",
    note: "Turning EEG, ECG and other physiological recordings into features a model can learn from.",
  },
  {
    field: "Neurotechnology",
    note: "Interfaces between software and the nervous system, and what they could mean for neurological disorders.",
  },
];

export type Article =
  | {
      status: "published";
      title: string;
      abstract: string;
      platform: "Substack" | "Medium";
      date: string;
      readingTime?: string;
      href: string;
    }
  | {
      status: "in-progress" | "planned";
      /** Shown as-is — keep it clearly a placeholder until there is a real title. */
      label: string;
      abstract: string;
      platform: "Substack" | "Medium";
    };

export const articles: Article[] = [
  {
    status: "in-progress",
    label: "First essay — working title to come",
    abstract:
      "My first long-form piece is being drafted. It will go out on Substack first and be cross-posted to Medium.",
    platform: "Substack",
  },
  {
    status: "planned",
    label: "Learning notes — coming soon",
    abstract: "Shorter notes from the courses and papers I'm working through, written up as I go.",
    platform: "Medium",
  },
];
