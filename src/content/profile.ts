/**
 * Identity, links and background. Everything here is sourced from the CV,
 * the previous portfolio, or confirmed directly by Nataly — keep it that way.
 */

export const profile = {
  name: "Nataly Jaya Salazar",
  shortName: "Nataly",
  monogram: "NJS",
  positioning: "An engineer with a scientific mindset.",
  role: "Computer Engineering student",
  institution: "Universitat de Lleida",
  email: "njayasalazar@gmail.com",
  /** Served from /public. Update the PDF when the CV changes. */
  cvPath: "/Nataly_Jaya_CV_En.pdf",
};

export type SocialLink = {
  id: "github" | "linkedin" | "substack" | "medium" | "devpost" | "email";
  label: string;
  handle: string;
  href: string;
};

export const socials: SocialLink[] = [
  { id: "github", label: "GitHub", handle: "NatalyJaya", href: "https://github.com/NatalyJaya" },
  { id: "linkedin", label: "LinkedIn", handle: "in/natjs", href: "https://www.linkedin.com/in/natjs" },
  { id: "substack", label: "Substack", handle: "@nataken", href: "https://substack.com/@nataken" },
  { id: "medium", label: "Medium", handle: "@njayasalazar", href: "https://medium.com/@njayasalazar" },
  { id: "devpost", label: "Devpost", handle: "NatalyJaya", href: "https://devpost.com/NatalyJaya" },
  { id: "email", label: "Email", handle: profile.email, href: `mailto:${profile.email}` },
];

export const socialById = (id: SocialLink["id"]) => socials.find((s) => s.id === id)!;

export type LedgerItem = { title: string; org: string; date: string; note?: string; href?: string };

export const education: LedgerItem[] = [
  { title: "BSc Computer Engineering", org: "Universitat de Lleida", date: "2023 — present" },
  {
    title: "BachiBac, Science & Technology track",
    org: "Vedruna Escorial Vic",
    date: "2021 — 2023",
    note: "French–Spanish dual diploma",
  },
];

/** Newest first. Add new certificates at the top. */
export const certificates: LedgerItem[] = [
  { title: "Intro to Deep Learning", org: "Kaggle", date: "Oct 2026" },
  { title: "Intro to Machine Learning", org: "Kaggle", date: "Oct 2026" },
  { title: "Fundamentals of Machine Learning for Healthcare", org: "Stanford Online", date: "Sep 2026" },
  {
    title: "Python Programming for Solving Mathematical, Physical and Chemical Problems",
    org: "Universitat de Lleida",
    date: "Sep 2026",
  },
];

export const community: LedgerItem[] = [
  {
    title: "Frontend developer",
    org: "LleidaHack",
    date: "2024 — present",
    note: "Pages, components and UI fixes for the student tech association",
  },
  {
    title: "Marketing member",
    org: "LleidaHack",
    date: "2024 — present",
    note: "Event visuals, social media and outreach",
  },
];

export const spokenLanguages = [
  { name: "Spanish", level: "Native" },
  { name: "Catalan", level: "Native" },
  { name: "English", level: "B2" },
  { name: "French", level: "B2" },
];
