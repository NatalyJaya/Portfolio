"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import { ArrowUpRight } from "@/components/ui/Icons";
import { events, type Frame, type JourneyEvent } from "@/content/journey";
import { cx } from "@/lib/utils";

/**
 * Desktop with a real pointer: hovering a row previews it on a sticky stage
 * beside the list, so the list itself never moves under the cursor.
 * Everywhere else: tapping a row opens it in place (accordion).
 */
const STAGE_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(STAGE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useStageMode = () =>
  useSyncExternalStore(subscribe, () => window.matchMedia(STAGE_QUERY).matches, () => false);

const years = Array.from(
  events.reduce((m, e) => m.set(e.year, [...(m.get(e.year) ?? []), e]), new Map<number, JourneyEvent[]>()),
);
const span = `${years[0][0]} — ${years[years.length - 1][0]}`;
const pad = (n: number) => String(n).padStart(2, "0");
const ratio = (f: Frame) => f.src.width / f.src.height;

/** Index of each event's first frame in the lightbox set. */
const frameStart: Record<string, number> = {};
events.reduce((n, e) => {
  frameStart[e.id] = n;
  return n + (e.frames?.length ?? 0);
}, 0);

type Open = { photo: (index: number) => void };

/* ------------------------------------------------------------------ */

function Photo({
  frame,
  i,
  onOpen,
  sizes,
  className,
  style,
}: {
  frame: Frame;
  i: number;
  onOpen: () => void;
  sizes: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cx(
        "gl group block cursor-zoom-in overflow-hidden bg-elev",
        !className?.includes("absolute") && "relative",
        frame.tilt === undefined ? "rounded-md" : "snap rounded-sm",
        className,
      )}
      style={{
        ["--i" as string]: i,
        ["--tilt" as string]: frame.tilt !== undefined ? `${frame.tilt}deg` : undefined,
        ["--src" as string]: `url("${frame.src.src}")`,
        ["--pos" as string]: frame.position,
        ...style,
      }}
    >
      <span className="gl-mask absolute inset-0 block">
        <Image
          src={frame.src}
          alt={frame.alt}
          fill
          sizes={sizes}
          placeholder="blur"
          className="object-cover grayscale-[20%] transition duration-[1.2s] ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
          style={{ objectPosition: frame.position }}
        />
      </span>
      <span className="sr-only">— open full size</span>
    </button>
  );
}

/** Professional photos: straight frames, laid out per `compose`. */
function ProSet({ e, pro, at }: { e: JourneyEvent; pro: Frame[]; at: (f: Frame, k: number) => () => void }) {
  if (e.compose === "trio" && pro.length >= 3) {
    return (
      <div className="grid aspect-[1.15] grid-cols-[2fr_1fr] grid-rows-2 gap-3">
        <Photo frame={pro[0]} i={0} onOpen={at(pro[0], 0)} sizes="28vw" className="row-span-2 h-full w-full" />
        <Photo frame={pro[1]} i={1} onOpen={at(pro[1], 1)} sizes="14vw" className="h-full w-full" />
        <Photo frame={pro[2]} i={2} onOpen={at(pro[2], 2)} sizes="14vw" className="h-full w-full" />
      </div>
    );
  }
  // A lone portrait lead stays narrower, leaving room for a print beside it.
  const narrow = pro.length === 1 && ratio(pro[0]) < 1;
  return (
    <div>
      <Photo
        frame={pro[0]}
        i={0}
        onOpen={at(pro[0], 0)}
        sizes="40vw"
        className={narrow ? "w-[70%]" : "w-full"}
        style={{ aspectRatio: ratio(pro[0]) }}
      />
      {pro.slice(1).map((f, k) => (
        <Photo
          key={f.id}
          frame={f}
          i={k + 1}
          onOpen={at(f, k + 1)}
          sizes="24vw"
          className="relative -mt-[14%] ml-auto w-[58%] ring-[6px] ring-bg"
          style={{ aspectRatio: ratio(f) }}
        />
      ))}
    </div>
  );
}

/**
 * Casual snapshots: tilted prints. Tucked under the corner of the
 * professional set when there is one; otherwise they make a small pile.
 */
function Snaps({
  snaps,
  tucked,
  beside,
  from,
  at,
}: {
  snaps: Frame[];
  /** Laid over the bottom of a professional set. */
  tucked: boolean;
  /** …which is a narrow portrait: tuck to its right instead. */
  beside: boolean;
  from: number;
  at: (f: Frame, k: number) => () => void;
}) {
  const print = "ring-[6px] ring-bg shadow-[0_24px_48px_-24px_rgba(0,0,0,0.9)]";
  const p = (f: Frame, k: number, className: string) => (
    <Photo
      key={f.id}
      frame={f}
      i={from + k}
      onOpen={at(f, from + k)}
      sizes="22vw"
      className={cx(print, className)}
      style={{ aspectRatio: ratio(f) }}
    />
  );
  if (tucked) {
    return (
      <div className={cx("relative z-[1] flex items-start gap-4", beside ? "-mt-[38%] justify-end" : "-mt-[12%] pl-[5%]")}>
        {snaps.map((f, k) => p(f, k, cx("relative", beside ? "w-[42%]" : "w-[44%]")))}
      </div>
    );
  }
  if (snaps.length === 1) {
    const portrait = ratio(snaps[0]) < 1;
    return <div className={cx("pt-2", portrait ? "pl-[10%]" : "px-[6%]")}>{p(snaps[0], 0, cx("relative", portrait ? "w-[62%]" : "w-full"))}</div>;
  }
  if (snaps.length === 3) {
    return (
      <div className="relative pt-2">
        {p(snaps[0], 0, "relative w-[66%]")}
        {p(snaps[1], 1, "absolute right-0 top-[10%] w-[40%]")}
        {p(snaps[2], 2, "relative -mt-[18%] ml-[20%] w-[38%]")}
      </div>
    );
  }
  return <div className="flex flex-wrap items-start gap-4 pt-2">{snaps.map((f, k) => p(f, k, "relative w-[46%]"))}</div>;
}

/** Stage composition: every photo the event has, professional first. */
function Composition({ e, open }: { e: JourneyEvent; open: Open }) {
  const all = e.frames!;
  const pro = all.filter((f) => f.tilt === undefined);
  const snaps = all.filter((f) => f.tilt !== undefined);
  const at = (f: Frame) => () => open.photo(frameStart[e.id] + all.indexOf(f));
  return (
    <div>
      {pro.length > 0 && <ProSet e={e} pro={pro} at={at} />}
      {snaps.length > 0 && (
        <Snaps
          snaps={snaps}
          tucked={pro.length > 0}
          beside={pro.length === 1 && ratio(pro[0]) < 1}
          from={pro.length}
          at={at}
        />
      )}
    </div>
  );
}

/** Date, place, note, role and link — shared by the stage and the drawers. */
function Notes({ e }: { e: JourneyEvent }) {
  return (
    <div>
      <p className="label">
        <span className="text-fg">{e.when}</span>
        <span className="mx-2 text-line-strong">/</span>
        {e.place}
      </p>
      {e.short && <p className="mt-3 font-serif text-xl leading-snug text-fg">{e.event}</p>}
      <p className="mt-3 max-w-md text-pretty text-[0.9375rem] leading-relaxed text-muted">{e.note}</p>
      <p className="label mt-3">{e.role}</p>
      {e.href && (
        <a href={e.href} target="_blank" rel="noopener noreferrer" className="group mt-4 inline-flex items-center gap-1 text-sm text-fg">
          <span className="link-underline">{e.hrefLabel ?? "See the project"}</span>
          <ArrowUpRight className="text-muted transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan" />
        </a>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Timeline({ onOpenPhoto }: { onOpenPhoto: Open["photo"] }) {
  const stage = useStageMode();
  const [active, setActive] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const intent = useRef(0);
  const rest = useRef(0);
  const hovering = useRef(false);
  const open: Open = { photo: onOpenPhoto };

  useEffect(
    () => () => {
      clearTimeout(intent.current);
      clearTimeout(rest.current);
    },
    [],
  );

  /* Stage mode: a short hover intent so sweeping across the list doesn't flicker. */
  const hoverRow = (id: string) => {
    clearTimeout(intent.current);
    intent.current = window.setTimeout(() => setActive(id), 70);
  };
  const enterAll = () => {
    hovering.current = true;
    clearTimeout(rest.current);
  };
  const leaveAll = () => {
    hovering.current = false;
    clearTimeout(intent.current);
    rest.current = window.setTimeout(() => {
      if (!wrapRef.current?.contains(document.activeElement)) setActive(null);
    }, 450);
  };

  const pick = (id: string, btn: HTMLElement) => {
    clearTimeout(intent.current);
    if (stage) {
      setActive(id);
      return;
    }
    setActive((a) => (a === id ? null : id));
    // A drawer closing above can lift this row out of view; bring it back.
    window.setTimeout(() => {
      const top = btn.getBoundingClientRect().top;
      if (top < 72) window.scrollBy({ top: top - 88, behavior: "smooth" });
    }, 620);
  };

  return (
    <div
      ref={wrapRef}
      className="mt-14 grid grid-cols-12 gap-x-6 md:mt-20"
      onPointerEnter={stage ? enterAll : undefined}
      onPointerLeave={stage ? leaveAll : undefined}
      onBlur={(ev) => {
        if (stage && !hovering.current && !ev.currentTarget.contains(ev.relatedTarget as Node | null)) setActive(null);
      }}
      onKeyDown={(ev) => ev.key === "Escape" && setActive(null)}
    >
      <div className="col-span-12 lg:col-span-7">
        <ol className="tl-list border-b border-line" data-has-active={active ? "" : undefined} aria-label="Events, oldest first">
          {years.map(([year, evs]) => (
            <li key={year} className="grid grid-cols-7 gap-x-6 border-t border-line pb-3 pt-4 lg:pt-5">
              <p className="label col-span-7 pb-1 lg:col-span-3 lg:pt-3" data-reveal>
                <span className="text-fg">{year}</span>
              </p>
              <ol className="col-span-7 lg:col-span-4">
                {evs.map((e, i) => {
                  const on = active === e.id;
                  return (
                    <li key={e.id} data-reveal style={{ ["--reveal-delay" as string]: i + 1 }}>
                      <button
                        type="button"
                        className="tl-row flex w-full items-baseline py-2.5 text-left"
                        data-on={on ? "" : undefined}
                        aria-expanded={on}
                        aria-controls={stage ? `stage-${e.id}` : `drawer-${e.id}`}
                        onPointerEnter={stage ? () => hoverRow(e.id) : undefined}
                        onPointerLeave={stage ? () => clearTimeout(intent.current) : undefined}
                        onFocus={stage ? () => setActive(e.id) : undefined}
                        onClick={(ev) => pick(e.id, ev.currentTarget)}
                      >
                        <span className="tl-tick" aria-hidden="true" />
                        <span className="font-serif text-[clamp(1.375rem,2.1vw,1.75rem)] leading-tight tracking-[-0.015em] text-fg">
                          {e.short ?? e.event}
                        </span>
                        {e.frames && (
                          <span className="tl-frames" aria-label={`${e.frames.length} photos`}>
                            {e.frames.map((f) => (
                              <i key={f.id} data-snap={f.tilt !== undefined ? "" : undefined} />
                            ))}
                          </span>
                        )}
                        <span className="ml-auto shrink-0 pl-4 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-faint">
                          {e.place}
                        </span>
                      </button>

                      {!stage && (
                        <div id={`drawer-${e.id}`} className="tl-drawer tl-reveal" data-on={on ? "" : undefined} inert={!on}>
                          <div>
                            <div className="tl-drawer-inner pb-7 pt-2">
                              {e.frames && (
                                <div className="tl-strip mb-4">
                                  {e.frames.map((f, k) => (
                                    <Photo
                                      key={f.id}
                                      frame={f}
                                      i={k}
                                      onOpen={() => onOpenPhoto(frameStart[e.id] + k)}
                                      sizes="70vw"
                                      style={{ ["--ar" as string]: ratio(f).toFixed(4) }}
                                    />
                                  ))}
                                </div>
                              )}
                              <Notes e={e} />
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
        </ol>
      </div>

      {stage && (
        <aside
          className="tl-stage col-span-5 self-start lg:sticky lg:top-[calc(var(--nav-h)+2rem)]"
          aria-label="Event notes"
        >
          <div className="tl-panel" data-on={active === null ? "" : undefined}>
            <p className="outline-num text-[clamp(5rem,8vw,7.5rem)] leading-[0.85]" aria-hidden="true">
              {pad(events.length)}
            </p>
            <p className="label mt-5">
              <span className="text-fg">{events.length} events</span>
              <span className="mx-2 text-line-strong">/</span>
              {span}
            </p>
            <p className="mt-2 max-w-[19rem] text-sm leading-relaxed text-faint">Hover a name to open its notes and frames.</p>
          </div>
          {events.map((e) => (
            <div key={e.id} id={`stage-${e.id}`} className="tl-panel tl-reveal" data-on={active === e.id ? "" : undefined}>
              {e.frames ? (
                <Composition e={e} open={open} />
              ) : (
                <p className="outline-num text-[clamp(5rem,8vw,7.5rem)] leading-[0.85]" aria-hidden="true">
                  {e.year}
                </p>
              )}
              <div className="mt-6">
                <Notes e={e} />
              </div>
            </div>
          ))}
        </aside>
      )}
    </div>
  );
}
