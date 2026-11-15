"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import shellImage from "@/assets/intro/shell.png";
import { createShellRenderer, type ShellRenderer } from "./shell";

import { SHELL_OPEN_EVENT, type ShellOpenDetail } from "./events";

// Timeline (ms)
const MIN_MS = 2400; // shortest time on screen, so the scan reads as a moment
const PAGE_SOFT_MS = 3200; // `load` waits on every image below the fold — don't hold the reveal for those
const MAX_WAIT_MS = 6000; // open anyway if something never reports ready
const INTRO_MS = 1300; // relief rising + plate swinging to face the viewer
const SEAM_MS = 260; // light runs down the split before the plates move
const OPEN_MS = 1350; // plates swinging apart

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Loading screen: the cyborg shell as a 3D relief, scanned top to bottom as
 * the page loads, then split down the middle and swung open to reveal the
 * site. Server-rendered but only displayed while <html data-shell="on|open">,
 * which the boot script in the layout sets before first paint — so there is no
 * flash for repeat visitors, reduced-motion users or no-JS visitors.
 *
 * Without WebGL the same sequence runs with the flat image and CSS.
 */
export default function ShellLoader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.shell !== "on") return;

    const rootEl = rootRef.current;
    const t0 = performance.now();
    const ready = { page: document.readyState === "complete", fonts: !document.fonts, image: false };
    let renderer: ShellRenderer | null = null;
    let glStart = 0;
    let raf = 0;
    let disposed = false;
    let shown = 0;
    let openAt: number | null = null;
    let pace = 1; // < 1 when skipping
    let skipping = false;
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };

    const onLoad = () => (ready.page = true);
    window.addEventListener("load", onLoad, { once: true });
    document.fonts?.ready.then(
      () => (ready.fonts = true),
      () => (ready.fonts = true),
    );

    const img = imgRef.current;
    (img ? img.decode() : Promise.reject())
      .then(() => {
        ready.image = true;
        if (disposed || !img || !canvasRef.current) return;
        try {
          renderer = createShellRenderer(canvasRef.current, img);
        } catch (err) {
          console.warn("[shell] WebGL unavailable, using the flat image", err);
          renderer = null;
        }
        if (renderer) {
          glStart = performance.now();
          rootEl?.classList.add("is-gl");
        }
      })
      .catch(() => (ready.image = true));

    function beginOpen(now: number) {
      if (openAt !== null) return;
      openAt = now;
      html.dataset.shell = "open";
      html.style.setProperty("--shell-pace", String(pace));
      if (statusRef.current) statusRef.current.textContent = "Opening shell";
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent<ShellOpenDetail>(SHELL_OPEN_EVENT, { detail: { skip: skipping } }));
      }, SEAM_MS * pace);
    }

    function cleanup() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", onKey);
    }

    function finish() {
      cleanup();
      renderer?.destroy(true);
      renderer = null;
      delete html.dataset.shell;
      html.style.removeProperty("--shell-pace");
    }

    function frame(now: number) {
      const elapsed = now - t0;
      if (elapsed > PAGE_SOFT_MS) ready.page = true;
      const allReady = elapsed > MAX_WAIT_MS || (ready.page && ready.fonts && ready.image);
      const loaded = (Number(ready.page) + Number(ready.fonts) + Number(ready.image)) / 3;
      const cap = allReady ? 1 : 0.15 + 0.7 * loaded;
      const goal = Math.min(elapsed / MIN_MS, cap);
      shown += (goal - shown) * 0.1;
      if (goal >= 1 && shown > 0.995) shown = 1;
      if (shown >= 1) beginOpen(now);

      if (pctRef.current) pctRef.current.textContent = String(Math.round(shown * 100)).padStart(3, "0");
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown})`;

      const sinceOpen = openAt === null ? -1 : now - openAt;
      if (renderer) {
        const tg = now - glStart;
        const intro = easeOut(clamp01(tg / INTRO_MS));
        const open = openAt === null ? 0 : easeInOut(clamp01((sinceOpen - SEAM_MS * pace) / (OPEN_MS * pace)));
        const seam =
          openAt === null ? 0 : smooth(0, SEAM_MS * pace, sinceOpen) * (1 - smooth(0.15, 0.7, open));
        pointer.sx += (pointer.x - pointer.sx) * 0.05;
        pointer.sy += (pointer.y - pointer.sy) * 0.05;
        const s = tg / 1000;
        renderer.render({
          time: s,
          scan: shown,
          open,
          seam,
          intro,
          alpha: smooth(0, 500, tg) * (1 - smooth(0.55, 1, open)),
          rotY: (1 - intro) * 0.9 + 0.2 * Math.sin(s * 0.55) + pointer.sx * 0.28,
          rotX: (1 - intro) * -0.35 + 0.08 * Math.sin(s * 0.4) + pointer.sy * 0.16,
          zoom: 0.8 + 0.2 * intro + open * 0.1,
        });
      }

      if (openAt !== null && sinceOpen > (SEAM_MS + OPEN_MS) * pace + 80) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => renderer?.resize();
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    // Any intent to move on skips the sequence (same rule as the neural intro).
    function skip() {
      if (openAt !== null) return;
      skipping = true;
      pace = 0.6;
      shown = 1;
      beginOpen(performance.now());
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") return; // let keyboard users reach the skip button
      skip();
    };
    skipRef.current = skip;

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("keydown", onKey);
    raf = requestAnimationFrame(frame);

    // Unmount (or a dev re-run of the effect) leaves the attribute alone so
    // the sequence can resume; only `finish()` ends it.
    return () => {
      cleanup();
      renderer?.destroy(false);
      renderer = null;
      rootEl?.classList.remove("is-gl");
    };
  }, []);

  return (
    <div ref={rootRef} className="shell">
      <div className="shell-door" data-side="l" aria-hidden="true" />
      <div className="shell-door" data-side="r" aria-hidden="true" />
      <span className="shell-seam" aria-hidden="true" />

      <div className="shell-stage" aria-hidden="true">
        <Image ref={imgRef} src={shellImage} alt="" priority className="shell-fallback" />
        <canvas ref={canvasRef} className="shell-canvas" />
      </div>

      <button type="button" className="intro-skip label" onClick={() => skipRef.current()}>
        Skip intro
      </button>

      <div className="shell-hud">
        <p className="font-serif text-2xl text-fg sm:text-3xl">Nataly Jaya Salazar</p>
        <div className="mt-5 h-px w-full overflow-hidden bg-line-strong">
          <span ref={barRef} className="block h-full origin-left bg-cyan" style={{ transform: "scaleX(0)" }} />
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-6 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
          <span ref={statusRef} role="status">
            Loading shell
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
