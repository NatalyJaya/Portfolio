import type { SVGProps } from "react";
import type { SocialLink } from "@/content/profile";

type P = SVGProps<SVGSVGElement>;

const line = (props: P) => ({
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const ArrowUpRight = (p: P) => (
  <svg {...line(p)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
export const ArrowDown = (p: P) => (
  <svg {...line(p)}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);
export const ArrowUp = (p: P) => (
  <svg {...line(p)}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);
export const Download = (p: P) => (
  <svg {...line(p)}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
);
export const Close = (p: P) => (
  <svg {...line(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const ChevronLeft = (p: P) => (
  <svg {...line(p)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
export const ChevronRight = (p: P) => (
  <svg {...line(p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
export const Mail = (p: P) => (
  <svg {...line(p)}>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

const solid = (props: P) => ({
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
  ...props,
});

export const GitHub = (p: P) => (
  <svg {...solid(p)}>
    <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
  </svg>
);
export const LinkedIn = (p: P) => (
  <svg {...solid(p)}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
);
export const Substack = (p: P) => (
  <svg {...solid(p)}>
    <path d="M22.54 8.24H1.46V5.4h21.08v2.84ZM1.46 10.81V24L12 18.11 22.54 24V10.81H1.46ZM22.54 0H1.46v2.84h21.08V0Z" />
  </svg>
);
export const Medium = (p: P) => (
  <svg {...solid(p)}>
    <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12Zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42ZM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12Z" />
  </svg>
);
export const Devpost = (p: P) => (
  <svg {...line({ strokeWidth: 1.6, ...p })}>
    <path d="M6.5 2.5 1.5 12l5 9.5h11l5-9.5-5-9.5h-11Z" />
    <path d="M9 7.5h2.6a4.5 4.5 0 0 1 0 9H9v-9Z" />
  </svg>
);

export const SocialIcon = ({ id, ...p }: { id: SocialLink["id"] } & P) => {
  switch (id) {
    case "github":
      return <GitHub {...p} />;
    case "linkedin":
      return <LinkedIn {...p} />;
    case "substack":
      return <Substack {...p} />;
    case "medium":
      return <Medium {...p} />;
    case "devpost":
      return <Devpost {...p} />;
    case "email":
      return <Mail {...p} />;
  }
};
