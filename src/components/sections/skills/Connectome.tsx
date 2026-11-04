"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { skillCategories, skills, type Skill, type SkillCategory } from "@/content/skills";
import { cx } from "@/lib/utils";

type Filter = "all" | SkillCategory;

const catColor = Object.fromEntries(skillCategories.map((c) => [c.id, c.color])) as Record<SkillCategory, string>;
const catLabel = Object.fromEntries(skillCategories.map((c) => [c.id, c.label])) as Record<SkillCategory, string>;
// RGB for canvas strokes (kept in sync with the CSS tokens)
const catRGB: Record<SkillCategory, string> = {
  languages: "169,155,255",
  web: "122,167,255",
  data: "111,221,230",
  infra: "240,184,110",
};

type V3 = { x: number; y: number; z: number };

/**
 * Lay tags on a Fibonacci sphere, then give each category its own "region"
 * around a tetrahedral direction (round-robin greedy assignment keeps the
 * regions balanced). Synapses: 2 nearest same-region neighbours per tag, plus
 * a few bridges between regions.
 */
function buildGraph(list: Skill[]) {
  const n = list.length;
  const pts: V3[] = Array.from({ length: n }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i + 1) / n);
    const theta = Math.sqrt(n * Math.PI) * phi;
    return { x: Math.cos(theta) * Math.sin(phi), y: Math.sin(theta) * Math.sin(phi), z: Math.cos(phi) };
  });
  const s = 1 / Math.sqrt(3);
  const centroids: Record<SkillCategory, V3> = {
    languages: { x: s, y: s, z: s },
    web: { x: -s, y: -s, z: s },
    data: { x: -s, y: s, z: -s },
    infra: { x: s, y: -s, z: -s },
  };
  const dot = (a: V3, b: V3) => a.x * b.x + a.y * b.y + a.z * b.z;
  const dist = (a: V3, b: V3) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

  const queues = skillCategories.map((c) => ({ id: c.id, idx: list.flatMap((sk, i) => (sk.category === c.id ? [i] : [])) }));
  const free = new Set(pts.map((_, i) => i));
  const pos: V3[] = new Array(n);
  let remaining = n;
  while (remaining > 0) {
    for (const q of queues) {
      const skillIdx = q.idx.shift();
      if (skillIdx === undefined) continue;
      let best = -1;
      let bestDot = -Infinity;
      free.forEach((p) => {
        const d = dot(pts[p], centroids[q.id]);
        if (d > bestDot) {
          bestDot = d;
          best = p;
        }
      });
      free.delete(best);
      pos[skillIdx] = pts[best];
      remaining--;
    }
  }

  const edges: { a: number; b: number; cat: SkillCategory | null }[] = [];
  const key = new Set<string>();
  const add = (a: number, b: number, cat: SkillCategory | null) => {
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (key.has(k)) return;
    key.add(k);
    edges.push({ a, b, cat });
  };
  list.forEach((sk, i) => {
    list
      .map((o, j) => ({ j, d: dist(pos[i], pos[j]), same: o.category === sk.category }))
      .filter((o) => o.j !== i && o.same)
      .sort((x, y) => x.d - y.d)
      .slice(0, 2)
      .forEach(({ j }) => add(i, j, sk.category));
  });
  // bridges: the closest cross-region pairs
  const bridges = list
    .flatMap((a, i) => list.map((b, j) => ({ i, j, d: dist(pos[i], pos[j]), diff: a.category !== b.category })))
    .filter((o) => o.diff && o.i < o.j)
    .sort((x, y) => x.d - y.d)
    .slice(0, 8);
  bridges.forEach(({ i, j }) => add(i, j, null));

  return { pos, edges };
}

const sizeFor = (s: Skill) => (s.evidence.length >= 3 ? 1.125 : s.evidence.length === 2 ? 0.96 : 0.84);

export default function Connectome() {
  const [view, setView] = useState<"sphere" | "index">("sphere");
  const [filter, setFilter] = useState<Filter>("all");
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stateRef = useRef({ filter: "all" as Filter, focus: null as number | null });
  const renderRef = useRef<(() => void) | null>(null);

  const graph = useMemo(() => buildGraph(skills), []);
  const focus = hovered ?? pinned;
  const focused = focus !== null ? skills[focus] : null;

  useEffect(() => {
    if (view !== "sphere") return;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const S = { angleX: -0.35, angleY: 0.4, velX: 0.0009, velY: 0.0022, dragging: false, moved: 0, lastX: 0, lastY: 0 };
    const proj = graph.pos.map(() => ({ x: 0, y: 0, s: 1, z: 0 }));
    let w = 0;
    let h = 0;
    let rad = 180;
    let raf = 0;
    let visible = false;
    let t = 0;

    const size = () => {
      const r = stage.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const widest = Math.max(...tagRefs.current.map((el) => el?.offsetWidth ?? 0));
      // projected points can reach ~1.2r; keep the widest label inside
      rad = Math.max(120, Math.min((w / 2 - widest / 2 - 8) / 1.25, (h / 2 - 18) / 1.2, 260));
    };

    const render = () => {
      t += 16;
      const { filter: f, focus: fo } = stateRef.current;
      if (!S.dragging && !reduced) {
        const slow = fo !== null ? 0.25 : 1;
        S.angleY += S.velY * slow;
        S.angleX += S.velX * slow;
        S.velY += (0.0022 - S.velY) * 0.02;
        S.velX += (0.0009 - S.velX) * 0.02;
      }
      const cy = Math.cos(S.angleY);
      const sy = Math.sin(S.angleY);
      const cxr = Math.cos(S.angleX);
      const sxr = Math.sin(S.angleX);
      const fov = rad * 2;

      graph.pos.forEach((p, i) => {
        const x1 = p.x * cy - p.z * sy;
        const z1 = p.x * sy + p.z * cy;
        const y2 = p.y * cxr - z1 * sxr;
        const z2 = p.y * sxr + z1 * cxr;
        const s = fov / (fov + z2 * rad);
        proj[i] = { x: w / 2 + x1 * rad * s, y: h / 2 + y2 * rad * s, s, z: z2 };
      });

      // synapses
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (const e of graph.edges) {
        const A = proj[e.a];
        const B = proj[e.b];
        const depth = Math.max(0, Math.min(1, ((A.s + B.s) / 2 - 0.6) / 0.75));
        const inFilter = f === "all" || e.cat === f;
        const touchesFocus = fo !== null && (e.a === fo || e.b === fo);
        let alpha = (inFilter ? (f === "all" ? 0.16 : 0.42) : 0.035) * (0.25 + 0.75 * depth);
        if (touchesFocus) alpha = 0.75;
        const rgb = e.cat ? catRGB[e.cat] : "236,238,242";
        ctx.strokeStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();

        // a signal running along highlighted synapses
        if (!reduced && (touchesFocus || (f !== "all" && e.cat === f))) {
          const k = ((t / 1400 + (e.a * 0.37 + e.b * 0.21)) % 1 + 1) % 1;
          ctx.fillStyle = `rgba(${rgb},${(0.9 * (0.3 + 0.7 * depth)).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(A.x + (B.x - A.x) * k, A.y + (B.y - A.y) * k, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // tags
      skills.forEach((sk, i) => {
        const el = tagRefs.current[i];
        if (!el) return;
        const P = proj[i];
        const depth = Math.max(0, Math.min(1, (P.s - 0.55) / 0.8));
        const match = f === "all" || sk.category === f;
        let o = 0.14 + 0.86 * depth * depth;
        if (!match) o *= 0.18;
        if (fo === i) o = 1;
        el.style.transform = `translate3d(${P.x.toFixed(1)}px, ${P.y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${P.s.toFixed(3)})`;
        el.style.opacity = o.toFixed(3);
        el.style.zIndex = String(Math.round(P.s * 100));
      });
    };

    const loop = () => {
      render();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    // input
    const down = (e: PointerEvent) => {
      S.dragging = true;
      S.moved = 0;
      S.lastX = e.clientX;
      S.lastY = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (!S.dragging) return;
      const dx = e.clientX - S.lastX;
      const dy = e.clientY - S.lastY;
      S.moved += Math.abs(dx) + Math.abs(dy);
      if (S.moved > 4 && !stage.hasPointerCapture(e.pointerId)) stage.setPointerCapture(e.pointerId);
      S.lastX = e.clientX;
      S.lastY = e.clientY;
      S.angleY += dx * 0.006;
      S.angleX -= dy * 0.006;
      S.velY = dx * 0.0012;
      S.velX = -dy * 0.0012;
      if (reduced) render();
    };
    const up = (e: PointerEvent) => {
      if (S.dragging && S.moved <= 4) {
        const idx = (e.target as HTMLElement).closest<HTMLElement>("[data-skill]")?.dataset.skill;
        setPinned((p) => (idx === undefined ? null : p === Number(idx) ? null : Number(idx)));
      }
      S.dragging = false;
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", () => (S.dragging = false));

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      start();
    });
    io.observe(stage);
    const onVis = () => start();
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(() => {
      size();
      render();
    });
    ro.observe(stage);

    size();
    render();
    renderRef.current = render;

    return () => {
      renderRef.current = null;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
    };
  }, [view, graph]);

  // Hand the latest UI state to the animation loop. In reduced-motion mode the
  // loop doesn't run, so repaint once on each change.
  useEffect(() => {
    stateRef.current = { filter, focus };
    if (view === "sphere" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      renderRef.current?.();
    }
  }, [filter, focus, view]);

  const filters: { id: Filter; label: string; color?: string; count: number }[] = [
    { id: "all", label: "All", count: skills.length },
    ...skillCategories.map((c) => ({ id: c.id, label: c.label, color: c.color, count: skills.filter((s) => s.category === c.id).length })),
  ];

  return (
    <div>
      {/* controls */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between" data-reveal>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter skills by category">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cx(
                "inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] transition-colors duration-300",
                filter === f.id ? "border-fg bg-fg text-bg" : "border-line-strong text-muted hover:border-fg hover:text-fg",
              )}
            >
              {f.color && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: f.color }} />}
              {f.label}
              <span className={filter === f.id ? "opacity-60" : "text-faint"}>{f.count}</span>
            </button>
          ))}
        </div>
        <div className="hidden items-center gap-1 rounded-full border border-line p-1 md:flex" role="group" aria-label="Skills view">
          {(["sphere", "index"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cx(
                "rounded-full px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] transition-colors",
                view === v ? "bg-elev2 text-fg" : "text-faint hover:text-fg",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* sphere (md+) */}
      {view === "sphere" && (
        <div className="mt-6 hidden md:block">
          <div
            ref={stageRef}
            aria-hidden="true"
            className="relative h-[clamp(440px,64vh,580px)] cursor-grab select-none [touch-action:pan-y] overflow-hidden active:cursor-grabbing"
          >
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
            {skills.map((s, i) => (
              <span
                key={s.name}
                ref={(el) => {
                  tagRefs.current[i] = el;
                }}
                data-skill={i}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
                className={cx(
                  "absolute left-0 top-0 whitespace-nowrap px-1 leading-none will-change-transform [text-shadow:0_0_10px_var(--bg),0_0_4px_var(--bg)]",
                  s.level === "learning" ? "font-serif italic" : "font-sans font-medium tracking-[-0.01em]",
                  focus === i && "underline decoration-1 underline-offset-4",
                )}
                style={{ color: catColor[s.category], fontSize: `${sizeFor(s)}rem` }}
              >
                {s.level === "learning" && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full border border-current align-middle" />}
                {s.name}
              </span>
            ))}
          </div>

          {/* evidence readout */}
          <div className="grid min-h-[5.5rem] grid-cols-12 gap-6 border-t border-line pt-5" aria-live="polite">
            <div className="col-span-12 md:col-span-4">
              {focused ? (
                <>
                  <p className="font-serif text-2xl leading-tight">{focused.name}</p>
                  <p className="label mt-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: catColor[focused.category] }} />
                    {catLabel[focused.category]} · {focused.level === "learning" ? "Currently learning" : "Applied"}
                  </p>
                </>
              ) : (
                <p className="label pt-1">Drag to rotate · hover or tap a node</p>
              )}
            </div>
            <div className="col-span-12 md:col-span-5">
              {focused && (
                <>
                  <p className="label">{focused.level === "learning" ? "Learning through" : "Used in"}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{focused.evidence.join(" · ")}</p>
                </>
              )}
            </div>
            <div className="col-span-12 flex flex-col gap-1.5 md:col-span-3 md:items-end">
              <p className="flex items-center gap-2 text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-muted" /> Applied in projects or roles
              </p>
              <p className="flex items-center gap-2 font-serif text-xs italic text-muted">
                <span className="h-1.5 w-1.5 rounded-full border border-muted" /> Currently learning
              </p>
              <p className="text-xs text-faint">Size = how many places it appears</p>
            </div>
          </div>
        </div>
      )}

      {/* index — always on small screens; on md+ when chosen. Kept for screen readers in sphere view. */}
      <div className={cx("mt-10", view === "sphere" && "md:sr-only")}>
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {skillCategories.map((c) => {
            const list = skills.filter((s) => s.category === c.id);
            const dim = filter !== "all" && filter !== c.id;
            return (
              <section key={c.id} aria-label={c.label} className={cx("transition-opacity duration-500", dim && "opacity-25")}>
                <h3 className="label flex items-center gap-2 border-b border-line pb-3">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-fg">{c.label}</span>
                  <span className="ml-auto">{list.length}</span>
                </h3>
                <ul>
                  {list.map((s) => (
                    <li key={s.name} className="border-b border-line py-3">
                      <p className={cx("flex items-center gap-2 text-[0.9375rem] text-fg", s.level === "learning" && "font-serif italic")}>
                        {s.name}
                        {s.level === "learning" && <span className="chip py-0 not-italic">learning</span>}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-faint">
                        <span className="sr-only">{s.level === "learning" ? "Learning through: " : "Used in: "}</span>
                        {s.evidence.join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
