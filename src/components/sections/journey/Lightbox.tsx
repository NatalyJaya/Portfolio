"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Close } from "@/components/ui/Icons";
import type { Frame, JourneyEvent } from "@/content/journey";

export type LightboxItem = { frame: Frame; event: JourneyEvent; fig: string };

type Props = {
  items: LightboxItem[];
  /** `null` = closed. */
  index: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
};

/**
 * Native <dialog> viewer for the featured photos: focus trap, Esc, inert
 * background for free. Arrow keys and swipes step through the set.
 */
export default function Lightbox({ items, index, onChange, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const n = items.length;

  const step = useCallback(
    (d: number) => {
      if (index !== null) onChange((index + d + n) % n);
    },
    [index, n, onChange],
  );

  // Open / close the dialog to match `index`.
  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (index !== null && !dlg.open) {
      dlg.showModal();
      dlg.querySelector<HTMLElement>("[data-close]")?.focus({ preventScroll: true });
    }
    if (index === null && dlg.open) dlg.close();
  }, [index]);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
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
  }, [step, onClose]);

  const cur = index !== null ? items[index] : null;

  return (
    <dialog
      ref={ref}
      aria-label={cur ? `Photo: ${cur.frame.caption}` : "Photo"}
      onClick={(ev) => ev.target === ref.current && ref.current?.close()}
      className="lightbox m-auto max-h-[100dvh] w-[min(64rem,calc(100vw-2rem))] max-w-none overflow-visible bg-transparent p-0 text-fg"
    >
      {cur && (
        <figure
          className="flex flex-col gap-4"
          onPointerDown={(e) => {
            if (e.pointerType === "touch") swipe.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const s = swipe.current;
            swipe.current = null;
            if (!s) return;
            const dx = e.clientX - s.x;
            if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(e.clientY - s.y)) step(dx < 0 ? 1 : -1);
          }}
        >
          <div className="flex justify-center">
            <Image
              key={cur.frame.id}
              src={cur.frame.src}
              alt={cur.frame.alt}
              sizes="(min-width: 1024px) 64rem, 100vw"
              className="lightbox-photo h-auto max-h-[72dvh] w-auto max-w-full rounded-md object-contain"
            />
          </div>
          <figcaption className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="label text-[color:var(--fg-muted)]">
                Fig. {cur.fig} · {cur.event.event}, {cur.event.place} · {cur.event.when}
              </p>
              <p className="mt-1.5 font-serif text-2xl leading-tight text-fg">{cur.frame.caption}</p>
              <p className="mt-1 text-sm text-muted">{cur.event.role}</p>
            </div>
            <div className="flex items-center gap-2">
              {n > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong transition-colors hover:border-fg"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft />
                  </button>
                  <span className="font-mono text-xs tabular-nums text-faint">
                    {index! + 1} / {n}
                  </span>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong transition-colors hover:border-fg"
                    aria-label="Next photo"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => ref.current?.close()}
                className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-fg text-bg"
                aria-label="Close"
                data-close
              >
                <Close />
              </button>
            </div>
          </figcaption>
        </figure>
      )}
    </dialog>
  );
}
