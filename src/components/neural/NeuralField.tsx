"use client";

import { useEffect, useRef, useState } from "react";
import { createNeuralField, type FieldHandle, type IntroPhase } from "./field";

const STEPS: { id: Exclude<IntroPhase, "done">; label: string }[] = [
  { id: "nodes", label: "Nodes" },
  { id: "synapses", label: "Synapses" },
  { id: "signal", label: "Signal" },
];

const STATUS: Record<IntroPhase, string> = {
  nodes: "Seeding nodes",
  synapses: "Forming synapses",
  signal: "Propagating signal",
  done: "Online",
};

export const INTRO_KEY = "njs:intro-seen";

/**
 * Hero background + opening sequence. The overlay is server-rendered but only
 * displayed while <html data-intro="play|reveal">, so there is no hydration
 * mismatch and no flash for repeat visitors or reduced-motion users.
 */
export default function NeuralField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<FieldHandle | null>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const captionRef = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<IntroPhase>("nodes");

  useEffect(() => {
    const root = document.documentElement;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const playIntro = root.dataset.intro === "play";
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setPhase("done");
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

    const writeCaption = () => {
      const s = fieldRef.current?.stats();
      if (s && captionRef.current) {
        captionRef.current.textContent = `${s.nodesTotal} nodes · ${s.synapsesTotal} synapses`;
      }
    };

    const field = createNeuralField({
      canvas,
      playIntro,
      reducedMotion,
      onPhase: setPhase,
      onProgress: (s) => {
        if (countRef.current) countRef.current.textContent = String(s.synapses).padStart(3, "0");
        if (barRef.current) barRef.current.style.transform = `scaleX(${s.synapsesTotal ? s.synapses / s.synapsesTotal : 0})`;
      },
      onIntroDone: () => {
        finish();
        writeCaption();
      },
    });
    fieldRef.current = field;
    writeCaption();

    if (!playIntro) return () => field.destroy();

    // Any intent to move on skips the sequence.
    const skip = () => field.skip();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") return; // let keyboard users reach the skip button
      skip();
    };
    window.addEventListener("wheel", skip, { passive: true, once: true });
    window.addEventListener("touchmove", skip, { passive: true, once: true });
    window.addEventListener("keydown", onKey);

    return () => {
      field.destroy();
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const currentStep = STEPS.findIndex((s) => s.id === phase);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

      {/* Live figure caption — the hero background is a real simulation. */}
      <p
        className="hero-reveal label pointer-events-none absolute bottom-6 right-[var(--gutter)] hidden text-right lg:block"
        style={{ ["--d" as string]: 6 }}
      >
        Fig. 0 — Neural field, drawn live
        <br />
        <span ref={captionRef} className="text-muted" />
      </p>

      <div className="intro-overlay" role="status" aria-live="polite">
        <button type="button" className="intro-skip label" onClick={() => fieldRef.current?.skip()}>
          Skip intro
        </button>

        <div className="intro-panel">
          <p className="font-serif text-2xl text-fg sm:text-3xl">Nataly Jaya Salazar</p>
          <div className="mt-5 h-px w-full overflow-hidden bg-line-strong">
            <span ref={barRef} className="intro-bar block h-full origin-left bg-fg" style={{ transform: "scaleX(0)" }} />
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-6 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
            <span>{STATUS[phase]}</span>
            <span className="tabular-nums text-fg">
              <span ref={countRef}>000</span> synapses
            </span>
          </div>
          <ol className="mt-6 flex gap-5 font-mono text-[0.625rem] uppercase tracking-[0.16em]" aria-hidden="true">
            {STEPS.map((s, i) => (
              <li
                key={s.id}
                className={
                  i < currentStep || phase === "done"
                    ? "text-faint"
                    : i === currentStep
                      ? "text-cyan"
                      : "text-faint opacity-40"
                }
              >
                {String(i + 1).padStart(2, "0")} {s.label}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
