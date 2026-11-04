/**
 * Neural field — a small, dependency-free Canvas 2D simulation.
 *
 * One network, two moments:
 *  1. Opening (≈3 s): nodes appear outward from a "soma", synapses grow
 *     between neighbours, then a signal propagates hop by hop.
 *  2. Idle: the same network stays as the hero background — slow drift,
 *     spontaneous firing that cascades through neighbours, and the pointer
 *     gently excites nearby nodes.
 *
 * Performance notes
 *  - Node count scales with viewport area and device hints (cores, memory,
 *    Save-Data); DPR is capped.
 *  - Edges are batched into a few alpha buckets → few stroke() calls.
 *  - No shadowBlur; glows are cheap concentric fills.
 *  - The loop stops when the canvas is off-screen or the tab is hidden, and
 *    the simulation clock only advances while running.
 *  - Reduced motion: one static, fully formed frame; no loop.
 */

export type IntroPhase = "nodes" | "synapses" | "signal" | "done";

export type FieldStats = { nodes: number; synapses: number; nodesTotal: number; synapsesTotal: number };

export type FieldOptions = {
  canvas: HTMLCanvasElement;
  playIntro: boolean;
  reducedMotion: boolean;
  onPhase?: (phase: IntroPhase) => void;
  onProgress?: (stats: FieldStats) => void;
  onIntroDone?: () => void;
};

export type FieldHandle = {
  skip: () => void;
  destroy: () => void;
  stats: () => FieldStats;
};

type Node = {
  x: number;
  y: number;
  r: number;
  birth: number;
  phase: number;
  amp: number;
  hop: number;
  act: number; // activation 0..1
  lastFire: number;
  px: number; // current drawn position
  py: number;
};

type Edge = { a: number; b: number; birth: number };

type Pulse = { edge: number; from: number; t: number; speed: number };

// Timeline (ms of simulation time)
const T_EDGE_GROW = 420;
const T_SYNAPSES = 650;
const T_SIGNAL = 1750;
const T_DONE = 2950;
const T_SETTLE = 900; // dimming after the intro

const MAX_PULSES = 48;
const REFRACTORY = 900;

// Colours (kept in sync with the CSS tokens)
const C_LINE = [176, 184, 210];
const C_VIOLET = [169, 155, 255];
const C_CYAN = [111, 221, 230];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function performanceFactor() {
  if (typeof navigator === "undefined") return 1;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  let f = 1;
  if ((nav.hardwareConcurrency ?? 8) <= 4) f *= 0.75;
  if ((nav.deviceMemory ?? 8) <= 4) f *= 0.8;
  if (nav.connection?.saveData) f *= 0.6;
  return f;
}

export function createNeuralField(opts: FieldOptions): FieldHandle {
  const { canvas, reducedMotion } = opts;
  const ctx = canvas.getContext("2d", { alpha: true });
  const noop: FieldHandle = {
    skip: () => opts.onIntroDone?.(),
    destroy: () => {},
    stats: () => ({ nodes: 0, synapses: 0, nodesTotal: 0, synapsesTotal: 0 }),
  };
  if (!ctx) {
    opts.onIntroDone?.();
    return noop;
  }

  const perf = performanceFactor();
  const lowPower = perf < 0.7;
  const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);

  let W = 0;
  let H = 0;
  let nodes: Node[] = [];
  let edges: Edge[] = [];
  let adj: number[][] = [];
  let pulses: Pulse[] = [];
  let origin = 0;
  let hopMs = 95;

  // simulation clock
  let time = opts.playIntro && !reducedMotion ? 0 : T_DONE + T_SETTLE;
  let introDone = !(opts.playIntro && !reducedMotion);
  let phase: IntroPhase = introDone ? "done" : "nodes";
  let nextSpontaneous = 0;
  let lastFrame = 0;
  let raf = 0;
  let running = false;
  let onScreen = true;
  let lastProgressEmit = -1;

  const pointer = { x: -9999, y: -9999, active: false };

  // ------------------------------------------------------------------ layout
  function build() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rand = mulberry32(20231 + Math.round(W) * 7 + Math.round(H));
    const wide = W >= 900;
    const area = W * H;
    const count = Math.round(Math.min(170, Math.max(55, area / (wide ? 8200 : 10500))) * perf);

    const ox = wide ? W * 0.7 : W * 0.5;
    const oy = wide ? H * 0.46 : H * 0.36;

    // Best-candidate sampling: even but organic spacing. On wide screens the
    // score is weighted so the network gathers to the right of the copy.
    const pts: { x: number; y: number }[] = [{ x: ox, y: oy }];
    const density = (x: number) => (wide ? 0.42 + 0.58 * smoothstep(0.18, 0.72, x / W) : 1);
    for (let i = 1; i < count; i++) {
      let best = { x: 0, y: 0 };
      let bestScore = -1;
      for (let k = 0; k < 10; k++) {
        const c = { x: rand() * W, y: rand() * H };
        let md = Infinity;
        for (const p of pts) {
          const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
          if (d < md) md = d;
        }
        const score = Math.sqrt(md) * density(c.x);
        if (score > bestScore) {
          bestScore = score;
          best = c;
        }
      }
      pts.push(best);
    }

    const maxR = Math.hypot(Math.max(ox, W - ox), Math.max(oy, H - oy));
    nodes = pts.map((p, i) => {
      const dist = Math.hypot(p.x - ox, p.y - oy);
      return {
        x: p.x,
        y: p.y,
        r: i === 0 ? 2.6 : 0.9 + rand() * 1.3,
        birth: i === 0 ? 0 : 120 + (dist / maxR) * 950 + rand() * 160,
        phase: rand() * Math.PI * 2,
        amp: 1.5 + rand() * 3.5,
        hop: Infinity,
        act: 0,
        lastFire: -Infinity,
        px: p.x,
        py: p.y,
      };
    });
    origin = 0;

    // k-nearest neighbours within a distance cap
    const spacing = Math.sqrt(area / count);
    const maxD = spacing * 2.1;
    const seen = new Set<number>();
    edges = [];
    adj = nodes.map(() => []);
    nodes.forEach((n, i) => {
      const near = nodes
        .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
        .filter((o) => o.j !== i && o.d < maxD)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      for (const { j } of near) {
        const key = i < j ? i * 4096 + j : j * 4096 + i;
        if (seen.has(key)) continue;
        seen.add(key);
        const [a, b] = nodes[i].birth <= nodes[j].birth ? [i, j] : [j, i];
        edges.push({ a, b, birth: Math.max(nodes[a].birth, nodes[b].birth) + 60 + rand() * 260 });
        const e = edges.length - 1;
        adj[a].push(e);
        adj[b].push(e);
      }
    });

    // hop distance from the origin, for the propagation wave
    nodes[origin].hop = 0;
    const queue = [origin];
    while (queue.length) {
      const i = queue.shift()!;
      for (const e of adj[i]) {
        const j = edges[e].a === i ? edges[e].b : edges[e].a;
        if (nodes[j].hop === Infinity) {
          nodes[j].hop = nodes[i].hop + 1;
          queue.push(j);
        }
      }
    }
    let maxHop = 1;
    for (const n of nodes) if (n.hop !== Infinity && n.hop > maxHop) maxHop = n.hop;
    hopMs = Math.min(110, 1050 / maxHop);
    pulses = [];
  }

  // -------------------------------------------------------------- dynamics
  function fire(i: number, t: number, cascade: number) {
    const n = nodes[i];
    if (t - n.lastFire < REFRACTORY) return;
    n.lastFire = t;
    n.act = 1;
    if (pulses.length >= MAX_PULSES) return;
    const out = adj[i];
    if (!out.length) return;
    // forward to a couple of neighbours
    const picks = Math.min(out.length, cascade > 0 ? 2 : 1);
    for (let k = 0; k < picks && pulses.length < MAX_PULSES; k++) {
      const e = out[(Math.random() * out.length) | 0];
      pulses.push({ edge: e, from: i, t: 0, speed: 0.0011 + Math.random() * 0.0009 });
    }
  }

  function step(dt: number) {
    time += dt;
    const t = time;

    // intro phases
    if (!introDone) {
      const next: IntroPhase = t >= T_DONE ? "done" : t >= T_SIGNAL ? "signal" : t >= T_SYNAPSES ? "synapses" : "nodes";
      if (next !== phase) {
        phase = next;
        opts.onPhase?.(phase);
      }
      // the wave: fire nodes as it reaches their hop
      if (t >= T_SIGNAL) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const at = T_SIGNAL + n.hop * hopMs;
          if (n.lastFire < T_SIGNAL && t >= at && n.hop !== Infinity) {
            n.lastFire = t;
            n.act = 1;
            // carry the signal forward along synapses to the next hop
            for (const e of adj[i]) {
              if (pulses.length >= MAX_PULSES) break;
              const j = edges[e].a === i ? edges[e].b : edges[e].a;
              if (nodes[j].hop === n.hop + 1 && Math.random() < 0.5) {
                pulses.push({ edge: e, from: i, t: 0, speed: 1 / Math.max(60, hopMs) });
              }
            }
          }
        }
      }
      if (phase === "done") {
        introDone = true;
        nextSpontaneous = t + 500;
        opts.onIntroDone?.();
      }
    } else if (t >= nextSpontaneous) {
      fire((Math.random() * nodes.length) | 0, t, 1);
      nextSpontaneous = t + 420 + Math.random() * 700;
    }

    // pointer excitation
    if (pointer.active && introDone) {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const d = Math.hypot(n.px - pointer.x, n.py - pointer.y);
        if (d < 90) {
          n.act = Math.max(n.act, 0.55 * (1 - d / 90));
          if (d < 34 && Math.random() < 0.04) fire(i, t, 1);
        }
      }
    }

    // pulses travel; arrival may fire the next node (decaying cascade)
    for (let k = pulses.length - 1; k >= 0; k--) {
      const p = pulses[k];
      p.t += p.speed * dt;
      if (p.t >= 1) {
        const e = edges[p.edge];
        const to = e.a === p.from ? e.b : e.a;
        pulses.splice(k, 1);
        if (Math.random() < 0.62) fire(to, t, 1);
        else nodes[to].act = Math.max(nodes[to].act, 0.6);
      }
    }

    // decay + drift
    const decay = Math.exp(-dt / 520);
    const drift = !lowPower;
    for (const n of nodes) {
      n.act *= decay;
      if (drift) {
        n.px = n.x + Math.sin(t * 0.00031 + n.phase) * n.amp;
        n.py = n.y + Math.cos(t * 0.00027 + n.phase * 1.3) * n.amp;
      }
    }

    // progress for the overlay counter (throttled)
    if (!introDone && opts.onProgress && t - lastProgressEmit > 60) {
      lastProgressEmit = t;
      opts.onProgress(stats());
    }
  }

  function stats(): FieldStats {
    let bornN = 0;
    for (const n of nodes) if (time >= n.birth) bornN++;
    let bornE = 0;
    for (const e of edges) if (time >= e.birth) bornE++;
    return { nodes: bornN, synapses: bornE, nodesTotal: nodes.length, synapsesTotal: edges.length };
  }

  // --------------------------------------------------------------- drawing
  const BUCKETS = 6;
  const bucketPaths: Path2D[] = [];

  function draw() {
    const t = time;
    ctx!.clearRect(0, 0, W, H);
    const wide = W >= 900;

    // After the intro, the network steps back behind the copy.
    const settle = introDone ? easeOut(clamp01((t - T_DONE) / T_SETTLE)) : 0;
    const textMask = (x: number) =>
      wide ? 1 - settle * (1 - (0.28 + 0.72 * smoothstep(0.26, 0.6, x / W))) : 1 - settle * 0.5;

    // edges, batched by alpha
    for (let b = 0; b < BUCKETS; b++) bucketPaths[b] = new Path2D();
    const active: { e: Edge; a: number }[] = [];
    for (const e of edges) {
      const g = clamp01((t - e.birth) / T_EDGE_GROW);
      if (g <= 0) continue;
      const A = nodes[e.a];
      const B = nodes[e.b];
      const gx = A.px + (B.px - A.px) * easeOut(g);
      const gy = A.py + (B.py - A.py) * easeOut(g);
      const mask = textMask((A.px + B.px) / 2);
      const act = Math.max(A.act, B.act);
      if (act > 0.08) active.push({ e, a: act * mask });
      const alpha = (0.07 + 0.11 * (1 - settle)) * mask;
      const bucket = Math.min(BUCKETS - 1, Math.floor((alpha / 0.18) * BUCKETS));
      bucketPaths[bucket].moveTo(A.px, A.py);
      bucketPaths[bucket].lineTo(gx, gy);
    }
    ctx!.lineWidth = 0.7;
    for (let b = 0; b < BUCKETS; b++) {
      const alpha = ((b + 0.5) / BUCKETS) * 0.18;
      ctx!.strokeStyle = `rgba(${C_LINE[0]},${C_LINE[1]},${C_LINE[2]},${alpha.toFixed(3)})`;
      ctx!.stroke(bucketPaths[b]);
    }

    // activated synapses glow
    ctx!.globalCompositeOperation = "lighter";
    ctx!.lineWidth = 1;
    for (const { e, a } of active) {
      const A = nodes[e.a];
      const B = nodes[e.b];
      ctx!.strokeStyle = `rgba(${C_VIOLET[0]},${C_VIOLET[1]},${C_VIOLET[2]},${(a * 0.38).toFixed(3)})`;
      ctx!.beginPath();
      ctx!.moveTo(A.px, A.py);
      ctx!.lineTo(B.px, B.py);
      ctx!.stroke();
    }

    // pulses
    for (const p of pulses) {
      const e = edges[p.edge];
      const from = nodes[p.from];
      const to = nodes[e.a === p.from ? e.b : e.a];
      const x = from.px + (to.px - from.px) * p.t;
      const y = from.py + (to.py - from.py) * p.t;
      const m = textMask(x);
      ctx!.fillStyle = `rgba(${C_CYAN[0]},${C_CYAN[1]},${C_CYAN[2]},${(0.18 * m).toFixed(3)})`;
      ctx!.beginPath();
      ctx!.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = `rgba(230,250,255,${(0.9 * m).toFixed(3)})`;
      ctx!.beginPath();
      ctx!.arc(x, y, 1.3, 0, Math.PI * 2);
      ctx!.fill();
    }

    // nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const born = clamp01((t - n.birth) / 380);
      if (born <= 0) continue;
      const m = textMask(n.px);
      const r = n.r * (0.4 + 0.6 * easeOut(born));
      if (n.act > 0.04) {
        const c = i % 3 === 0 ? C_VIOLET : C_CYAN;
        ctx!.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${(n.act * 0.22 * m).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(n.px, n.py, r + 7 * n.act, 0, Math.PI * 2);
        ctx!.fill();
      }
      const base = (0.42 + 0.28 * (1 - settle)) * m * born;
      const lum = Math.min(1, base + n.act * 0.6 * m);
      ctx!.fillStyle = `rgba(226,230,240,${lum.toFixed(3)})`;
      ctx!.beginPath();
      ctx!.arc(n.px, n.py, r, 0, Math.PI * 2);
      ctx!.fill();
    }
    ctx!.globalCompositeOperation = "source-over";
  }

  // ------------------------------------------------------------------ loop
  function frame(now: number) {
    if (!running) return;
    const dt = lastFrame ? Math.min(48, now - lastFrame) : 16;
    lastFrame = now;
    step(dt);
    draw();
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reducedMotion || !onScreen || document.hidden) return;
    running = true;
    lastFrame = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  // ---------------------------------------------------------------- events
  const io = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    },
    { threshold: 0 },
  );
  io.observe(canvas);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVisibility);

  const onPointerMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = pointer.y >= 0 && pointer.y <= rect.height;
  };
  const onPointerLeave = () => (pointer.active = false);
  if (!reducedMotion) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
  }

  let resizeTimer = 0;
  let lastW = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const w = canvas.getBoundingClientRect().width;
      // ignore height-only changes from mobile URL bars
      if (Math.abs(w - lastW) < 2 && nodes.length) return;
      lastW = w;
      if (!introDone) skip();
      build();
      draw();
    }, 180);
  };
  window.addEventListener("resize", onResize);

  function skip() {
    if (introDone) return;
    time = T_DONE - 1;
    pulses = [];
    for (const n of nodes) {
      n.act = 0;
      n.lastFire = T_SIGNAL; // already "fired": no flash on skip
    }
    step(1);
    if (!running) draw();
  }

  // ---------------------------------------------------------------- boot
  build();
  lastW = W;
  if (reducedMotion) {
    draw();
    if (!introDone) {
      introDone = true;
      opts.onIntroDone?.();
    }
  } else {
    if (introDone) nextSpontaneous = time + 300;
    else opts.onPhase?.("nodes");
    draw();
    start();
  }

  return {
    skip,
    stats,
    destroy() {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
    },
  };
}
