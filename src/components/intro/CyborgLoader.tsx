"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { SHELL_OPEN_EVENT, type ShellOpenDetail } from "./events";

// three.js and the model stay out of the page's own bundle.
const CyborgScene = dynamic(() => import("./CyborgScene"), { ssr: false });

// Timeline (ms)
const ASSEMBLY_MS = 4600; // drop + layer-by-layer assembly: the shortest the intro can be
const PAGE_SOFT_MS = 3200; // `load` waits on every image below the fold — don't hold the reveal for those
const MAX_WAIT_MS = 7000; // dive in anyway if something never reports ready
const HARD_STOP_MS = 11000; // the scene never got to hand off (no WebGL, chunk failed): just open
const FADE_MS = 700; // matches the CSS fade of `.shell-cyborg`

/**
 * Loading screen: the cyborg drops in on its cables and assembles itself while
 * the page loads; once the page is ready the camera dives into its brain and
 * the screen fades to the site, where the neural field takes over.
 *
 * Displayed only while <html data-shell="on|open">, which the boot script in
 * the layout sets before first paint — so repeat visitors, reduced-motion and
 * no-JS visitors never see it (and never download three.js).
 */
export default function CyborgLoader() {
  const pctRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);
  const [exit, setExit] = useState(false);
  const [fast, setFast] = useState(false);
  const opened = useRef(false);
  const diving = useRef(false);

  /** Reveal the page: fade the screen out and let the neural intro start. */
  const open = useCallback((skip: boolean) => {
    if (opened.current) return;
    opened.current = true;
    const html = document.documentElement;
    if (!html.hasAttribute("data-shell")) return; // the layout's safety timer got there first
    html.dataset.shell = "open";
    window.dispatchEvent(new CustomEvent<ShellOpenDetail>(SHELL_OPEN_EVENT, { detail: { skip } }));
    window.setTimeout(() => {
      delete html.dataset.shell;
      setActive(false);
    }, FADE_MS);
  }, []);

  const skip = useCallback(() => {
    setFast(true);
    setExit(true);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.shell !== "on") return;

    const t0 = performance.now();
    const ready = { page: document.readyState === "complete", fonts: !document.fonts };
    let raf = 0;
    let shown = 0;
    let asked = false;
    let mounted = false;

    const onLoad = () => (ready.page = true);
    window.addEventListener("load", onLoad, { once: true });
    document.fonts?.ready.then(
      () => (ready.fonts = true),
      () => (ready.fonts = true),
    );

    function frame(now: number) {
      if (!mounted) {
        mounted = true;
        setActive(true); // mount the scene (and fetch three.js) only when the intro plays
      }
      const elapsed = now - t0;
      if (elapsed > PAGE_SOFT_MS) ready.page = true;
      const allReady = elapsed > MAX_WAIT_MS || (ready.page && ready.fonts);
      if (allReady && !asked) {
        asked = true;
        setExit(true);
      }
      // The bar follows the assembly, but can't finish before the page is ready.
      const loaded = (Number(ready.page) + Number(ready.fonts)) / 2;
      const cap = diving.current ? 1 : allReady ? 0.96 : 0.15 + 0.7 * loaded;
      const goal = Math.min(elapsed / ASSEMBLY_MS, cap);
      shown += (goal - shown) * 0.1;
      if (diving.current && shown > 0.99) shown = 1;
      if (pctRef.current) pctRef.current.textContent = String(Math.round(shown * 100)).padStart(3, "0");
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown})`;
      if (!opened.current) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    const hardStop = window.setTimeout(() => open(true), HARD_STOP_MS);
    // Any intent to move on skips the sequence (same rule as the neural intro).
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") return; // let keyboard users reach the skip button
      skip();
    };
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hardStop);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, skip]);

  const onExitStart = useCallback(() => {
    diving.current = true;
    if (statusRef.current) statusRef.current.textContent = "Entering";
  }, []);
  const onHandOff = useCallback(() => open(false), [open]);

  return (
    <div className="shell shell-cyborg">
      <div className="shell-stage" aria-hidden="true">
        {active && <CyborgScene exit={exit} fast={fast} onExitStart={onExitStart} onHandOff={onHandOff} />}
      </div>

      <button type="button" className="intro-skip label" onClick={skip}>
        Skip intro
      </button>

      <div className="shell-hud">
        <p className="font-serif text-2xl text-fg sm:text-3xl">Nataly Jaya Salazar</p>
        <div className="mt-5 h-px w-full overflow-hidden bg-line-strong">
          <span ref={barRef} className="block h-full origin-left bg-cyan" style={{ transform: "scaleX(0)" }} />
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-6 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
          <span ref={statusRef} role="status">
            Assembling
          </span>
          <span className="tabular-nums text-fg" aria-hidden="true">
            <span ref={pctRef}>000</span>%
          </span>
        </div>
        {/* Same height as the neural intro's step list, so the name doesn't jump at the hand-off. */}
        <div className="mt-6 h-[0.9375rem]" aria-hidden="true" />
      </div>
    </div>
  );
}
