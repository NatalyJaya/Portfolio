"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import { ArrowUpRight, ChevronLeft, ChevronRight, Close } from "@/components/ui/Icons";
import { journey, type JourneyEntry } from "@/content/journey";
import { cx } from "@/lib/utils";

const spanClass: Record<JourneyEntry["span"], string> = {
  square: "",
  tall: "row-span-2",
  wide: "sm:col-span-2",
  feature: "sm:col-span-2 row-span-2",
};

/** Deterministic points from a string seed (FNV-1a hash → xorshift). */
function seededPoints(seed: string, n: number) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const a = ((h >>> 0) % 1000) / 1000;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const b = ((h >>> 0) % 1000) / 1000;
    out.push({ x: 10 + a * 180, y: 10 + b * 100 });
  }
  return out;
}

/** A little network, distinct per entry, for frames still waiting on a photo. */
function PlaceholderArt({ seed }: { seed: string }) {
  const pts = seededPoints(seed, 9);
  return (
    <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full opacity-60" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {pts.map((p, i) =>
        pts.slice(i + 1, i + 3).map((q, j) => (
          <line key={`${i}-${j}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} style={{ stroke: "var(--line-strong)" }} strokeWidth={0.6} />
        )),
      )}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 2 : 1.2} style={{ fill: i === 0 ? "var(--violet)" : "var(--fg-faint)" }} />
      ))}
    </svg>
  );
}

function Caption({ e }: { e: JourneyEntry }) {
  return (
    <>
      <p className="label text-[color:var(--fg-muted)]">
        {e.place} · {e.date}
      </p>
      <p className="mt-1.5 font-serif text-2xl leading-tight text-fg">{e.event}</p>
      <p className="mt-1 text-sm text-muted">{e.role}</p>
    </>
  );
}

export default function Journey() {
  const photos = journey.filter((e) => e.image);
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const show = useCallback((i: number) => {
    setOpen(i);
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  }, []);
  const close = useCallback(() => dialogRef.current?.close(), []);
  const step = useCallback(
    (d: number) => setOpen((o) => (o === null ? o : (o + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onClose = () => setOpen(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    dlg.addEventListener("close", onClose);
    dlg.addEventListener("keydown", onKey);
    return () => {
      dlg.removeEventListener("close", onClose);
      dlg.removeEventListener("keydown", onKey);
    };
  }, [step]);

  const current = open !== null ? photos[open] : null;

  return (
    <section id="journey" aria-labelledby="journey-title" className="page py-24 md:py-32">
      <SectionHeader
        index="06"
        eyebrow="Personal journey"
        id="journey-title"
        title="Field notes from the community"
        lede="Hackathons, events and the student association where I learned to build with other people. Frames without a photo are placeholders for now."
      />

      <ul className="mt-14 grid auto-rows-[220px] grid-cols-1 gap-3 [grid-auto-flow:dense] sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
        {journey.map((e, i) => (
          <li key={e.id} className={cx("min-h-0", spanClass[e.span])} data-reveal style={{ ["--reveal-delay" as string]: i % 4 }}>
            {e.image ? (
              <button
                type="button"
                onClick={() => show(photos.indexOf(e))}
                className="group relative block h-full w-full overflow-hidden rounded-md bg-elev text-left"
                aria-label={`${e.event}, ${e.date} — open photo`}
              >
                <Image
                  src={e.image.src}
                  alt={e.image.alt}
                  fill
                  sizes={e.span === "feature" ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
                  className="object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.03]"
                  style={{ objectPosition: e.image.position }}
                  placeholder="blur"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-[rgba(7,8,11,0.92)] via-[rgba(7,8,11,0.2)] to-transparent" />
                <span className="absolute inset-x-0 bottom-0 block p-5">
                  <Caption e={e} />
                  <span className="mt-2 block max-w-md text-sm leading-relaxed text-muted opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {e.note}
                  </span>
                </span>
                <span className="label absolute right-4 top-4 rounded-full bg-[rgba(7,8,11,0.6)] px-2 py-1 text-fg opacity-0 transition-opacity group-hover:opacity-100">
                  View
                </span>
              </button>
            ) : (
              <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-md border border-dashed border-line-strong p-5">
                <PlaceholderArt seed={e.id} />
                <p className="label relative">Photo to come</p>
                <div className="relative">
                  <Caption e={e} />
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-faint">{e.note}</p>
                  {e.href && (
                    <a
                      href={e.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-fg"
                    >
                      <span className="link-underline">See the project</span> <ArrowUpRight width={12} height={12} />
                    </a>
                  )}
                </div>
              </article>
            )}
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={current ? `${current.event} photo` : "Photo"}
        onClick={(ev) => ev.target === dialogRef.current && close()}
        className="m-auto max-h-[100dvh] w-[min(64rem,calc(100vw-2rem))] max-w-none overflow-visible bg-transparent p-0 text-fg"
      >
        {current?.image && (
          <figure className="flex flex-col gap-4">
            <div className="flex justify-center">
              <Image
                src={current.image.src}
                alt={current.image.alt}
                sizes="(min-width: 1024px) 64rem, 100vw"
                className="h-auto max-h-[72dvh] w-auto max-w-full rounded-md object-contain"
              />
            </div>
            <figcaption className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <Caption e={current} />
                <p className="mt-2 text-sm leading-relaxed text-muted">{current.note}</p>
              </div>
              <div className="flex items-center gap-2">
                {photos.length > 1 && (
                  <>
                    <button type="button" onClick={() => step(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong hover:border-fg" aria-label="Previous photo">
                      <ChevronLeft />
                    </button>
                    <span className="font-mono text-xs tabular-nums text-faint">
                      {open! + 1} / {photos.length}
                    </span>
                    <button type="button" onClick={() => step(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong hover:border-fg" aria-label="Next photo">
                      <ChevronRight />
                    </button>
                  </>
                )}
                <button type="button" onClick={close} className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-fg text-bg" aria-label="Close" autoFocus>
                  <Close />
                </button>
              </div>
            </figcaption>
          </figure>
        )}
      </dialog>
    </section>
  );
}
