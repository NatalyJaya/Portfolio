"use client";

import { useEffect, useRef } from "react";
import { SHELL_OPEN_EVENT, type ShellOpenDetail } from "@/components/intro/events";
import { withBase } from "@/lib/utils";
import { createPlugged, type PluggedHandle } from "./plugged";

export const INTRO_KEY = "njs:intro-seen";
const ENTRANCE_MS = 3400; // the camera pulls back from the loader's dive
const REVEAL_AT = 0.72; // the copy starts to stagger in at this point of the entrance

/**
 * Hero background: FIG 0, "Plugged in" (see ./plugged.ts).
 *
 * Takes over the role NeuralField had in the opening sequence: when the
 * cyborg loader opens (njs:shell-open) the scene pulls back from the dive,
 * then flips <html data-intro> to "reveal" so the Hero copy staggers in.
 * Repeat visitors, reduced-motion users and skips get the settled scene.
 */
export default function PluggedFigure() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const playIntro = root.dataset.intro === "play";
    const monoFont = getComputedStyle(root).getPropertyValue("--font-mono").trim();
    let scene: PluggedHandle | null = null;
    let finished = false;
    let raf = 0;

    const finish = () => {
      if (finished) return;
      finished = true;
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {
        /* storage may be unavailable (private mode) — the intro just replays */
      }
      if (root.dataset.intro === "play") {
        root.dataset.intro = "reveal";
        window.setTimeout(() => (root.dataset.intro = "done"), 900);
      }
    };

    const settle = () => {
      cancelAnimationFrame(raf);
      scene?.setEntrance(1);
      finish();
    };

    // Any intent to move on skips the entrance (same rule as the loader).
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") settle();
    };

    // Cables unplug as the Hero scrolls away.
    const onScroll = () => {
      const h = canvas.getBoundingClientRect().height || 1;
      scene?.setUnplug(Math.min(1, window.scrollY / (h * 0.8)));
    };

    const boot = (skip: boolean) => {
      scene = createPlugged({ canvas, src: withBase("/figures/fig0-plugged.webp"), reducedMotion, monoFont });
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      if (!playIntro || skip || reducedMotion) {
        settle();
        return;
      }
      scene.setEntrance(0);
      const t0 = performance.now();
      const tick = (now: number) => {
        const e = Math.min(1, (now - t0) / ENTRANCE_MS);
        scene?.setEntrance(e);
        if (e >= REVEAL_AT) finish();
        if (e < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      window.addEventListener("wheel", settle, { passive: true, once: true });
      window.addEventListener("touchmove", settle, { passive: true, once: true });
      window.addEventListener("keydown", onKey);
    };

    // While the loader covers the page, the scene waits for it to open.
    const onShellOpen = (e: Event) => boot(Boolean((e as CustomEvent<ShellOpenDetail>).detail?.skip));
    if (playIntro && root.dataset.shell === "on") {
      window.addEventListener(SHELL_OPEN_EVENT, onShellOpen, { once: true });
    } else {
      boot(false);
    }

    return () => {
      cancelAnimationFrame(raf);
      scene?.destroy();
      scene = null;
      window.removeEventListener(SHELL_OPEN_EVENT, onShellOpen);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", settle);
      window.removeEventListener("touchmove", settle);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full opacity-55 lg:opacity-100" />

      {/* Figure caption. 第0図 (dai zero zu) = "Figure 0". */}
      <div
        className="hero-reveal label pointer-events-none absolute bottom-6 right-[var(--gutter)] hidden bg-[rgba(7,8,11,0.82)] px-3 py-2 text-right lg:block"
        style={{ ["--d" as string]: 6 }}
      >
      </div>
    </>
  );
}
