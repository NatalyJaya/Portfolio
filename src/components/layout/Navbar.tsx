"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";

export const navItems = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "notebooks", label: "Notebooks" },
  { id: "skills", label: "Skills" },
  { id: "writing", label: "Writing" },
  { id: "journey", label: "Journey" },
  { id: "contact", label: "Contact" },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Highlight the section currently crossing the upper third of the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    const hero = document.getElementById("top");
    if (hero) io.observe(hero);
    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cx(
        "site-nav fixed inset-x-0 top-0 z-50 border-b",
        scrolled || open ? "border-line bg-[rgba(7,8,11,0.86)] backdrop-blur-md" : "border-transparent bg-transparent",
      )}
    >
      <nav aria-label="Primary" className="page flex h-[var(--nav-h)] items-center justify-between">
        <a href="#top" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span aria-hidden="true" className="relative flex h-2 w-2">
            <span className="pulse-dot absolute inset-0 rounded-full bg-cyan" />
          </span>
          <span className="font-mono text-xs tracking-[0.18em] text-fg">NJS</span>
          <span className="sr-only">Nataly Jaya Salazar — back to top</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active === item.id ? "true" : undefined}
                className={cx(
                  "group flex items-baseline gap-1.5 px-3 py-2 text-[0.8125rem] transition-colors",
                  active === item.id ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                <span
                  className={cx(
                    "font-mono text-[0.625rem] transition-colors",
                    active === item.id ? "text-cyan" : "text-faint group-hover:text-muted",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="label -mr-2 px-2 py-3 text-fg lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      <div
        id="mobile-menu"
        hidden={!open}
        className="page h-[calc(100dvh-var(--nav-h))] overflow-y-auto border-t border-line pb-10 pt-6 lg:hidden"
      >
        <ul className="flex flex-col">
          {navItems.map((item, i) => (
            <li key={item.id} className="border-b border-line">
              <a
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 py-4 font-serif text-3xl text-fg"
              >
                <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
