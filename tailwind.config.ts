import type { Config } from "tailwindcss";

/**
 * Design tokens live as CSS custom properties in `src/app/globals.css`.
 * Tailwind only maps names to them, so a palette change happens in one place.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        elev: "var(--bg-elev)",
        elev2: "var(--bg-elev-2)",
        fg: "var(--fg)",
        muted: "var(--fg-muted)",
        faint: "var(--fg-faint)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        violet: "var(--violet)",
        cyan: "var(--cyan)",
        blue: "var(--blue)",
        amber: "var(--amber)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { page: "76rem" },
      transitionTimingFunction: { out: "cubic-bezier(0.16, 1, 0.3, 1)" },
    },
  },
  plugins: [],
};

export default config;
