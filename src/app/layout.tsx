import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Newsreader } from "next/font/google";
import "./globals.css";

const sans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
  display: "swap",
});

const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const description =
  "Nataly Jaya Salazar — Computer Engineering student at the Universitat de Lleida. Software engineering foundation, heading towards machine learning for healthcare and computational neuroscience.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nataly Jaya Salazar — Software engineering with a scientific mindset",
    template: "%s — Nataly Jaya Salazar",
  },
  description,
  authors: [{ name: "Nataly Jaya Salazar" }],
  keywords: [
    "Nataly Jaya Salazar",
    "software engineering",
    "machine learning for healthcare",
    "computational neuroscience",
    "Universitat de Lleida",
    "portfolio",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Nataly Jaya Salazar",
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07080b",
  colorScheme: "dark",
};

/**
 * Runs before first paint. Decides whether the opening sequence plays
 * (JS on, motion allowed, first visit this session — or `?intro` to force),
 * and opts the page into scroll reveals. A safety timer guarantees the hero
 * is never left hidden if something fails later.
 */
const bootScript = `(function(){try{var d=document.documentElement;d.classList.add('js-reveal');
var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var force=/[?&]intro\\b/.test(location.search);var seen=null;
try{seen=sessionStorage.getItem('njs:intro-seen')}catch(e){}
if(!rm&&(force||!seen)){d.setAttribute('data-intro','play');
setTimeout(function(){if(d.getAttribute('data-intro')==='play'){d.setAttribute('data-intro','done')}},8000)}}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only z-[70] rounded bg-fg px-3 py-2 text-sm text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
