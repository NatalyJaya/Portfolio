/**
 * FIG 0 — "Plugged in". A Canvas 2D scene for the Hero.
 *
 * An anime illustration of a cyborg girl (public/figures/fig0-plugged.webp)
 * with live layers drawn on top:
 *  - a subtle neural mesh, masked to her hair, whose signals run forward
 *    (perception → cognition → action: teal → white → red);
 *  - cables leaving the gold connectors on her back, through three junction
 *    boxes and out of the frame, carrying those signals;
 *  - breathing, a slow sway, hair that moves towards the tips, connector
 *    glints and an occasional magenta glitch.
 *
 * Everything is laid out in a 1440 × 820 design space and mapped to the
 * canvas: right-aligned on wide screens, centred behind the copy on narrow ones.
 *
 * At load the image is processed once: the blue backdrop behind her face is
 * turned black, the floor is cut, the skin is warmed a little, and a hair mask
 * is built for the mesh and the hair sway.
 */

export type PluggedHandle = {
  /** 0 = last frame of the loader's dive, 1 = settled. */
  setEntrance: (e: number) => void;
  /** 0 = plugged in, 1 = unplugged (driven by scroll). */
  setUnplug: (s: number) => void;
  destroy: () => void;
};

type Opts = { canvas: HTMLCanvasElement; src: string; reducedMotion: boolean; monoFont: string };
type Pt = [number, number];

const TAU = Math.PI * 2;
const DW = 1440;
const DH = 820;
const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const sstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stage colours: perception (teal) → cognition (white) → action (red).
const STG: [number, number, number][] = [
  [111, 221, 230],
  [236, 238, 242],
  [232, 72, 78],
];
function stgRGB(st: number) {
  st = clamp(st);
  const k = st < 0.5 ? 0 : 1;
  const u = st < 0.5 ? st * 2 : (st - 0.5) * 2;
  const a = STG[k];
  const b = STG[k + 1];
  return `${Math.round(lerp(a[0], b[0], u))},${Math.round(lerp(a[1], b[1], u))},${Math.round(lerp(a[2], b[2], u))}`;
}
const stg = (st: number, a: number) => `rgba(${stgRGB(st)},${a})`;
const JP = '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif';

/* ------------------------------------------------------------------ net */
type NNode = { x: number; y: number; st: number; act: number; term: number; adj: Edge[]; last: number };
type Edge = { a: number; b: number; act: number };
type Pulse = { e: Edge; from: number; u: number; sp: number };

function createNet(pts: [number, number, number][], k: number, maxD: number, seed: number) {
  const rnd = mulberry(seed);
  const seen = new Set<number>();
  const edges: Edge[] = [];
  const pulses: Pulse[] = [];
  let next = 0.4;
  let time = 0;
  const nodes: NNode[] = pts.map((p) => ({ x: p[0], y: p[1], st: p[2], act: 0, term: 0, adj: [], last: -9 }));
  let inputs = nodes.flatMap((n, i) => (n.st < 0.18 ? [i] : []));
  if (!inputs.length) inputs = nodes.map((_, i) => i);
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter((o) => o.j !== i && o.d < maxD)
      .sort((p, q) => p.d - q.d)
      .slice(0, k)
      .forEach((o) => {
        const key = i < o.j ? i * 4096 + o.j : o.j * 4096 + i;
        if (seen.has(key)) return;
        seen.add(key);
        const e = { a: i, b: o.j, act: 0 };
        edges.push(e);
        a.adj.push(e);
        nodes[o.j].adj.push(e);
      });
  });
  function fire(i: number, big: boolean) {
    const n = nodes[i];
    if (!n || time - n.last < 0.8) return;
    n.last = time;
    n.act = 1;
    const fw = n.adj.filter((e) => nodes[e.a === i ? e.b : e.a].st > n.st + 0.012);
    if (!fw.length) {
      n.term = 1;
      return;
    }
    const picks = Math.min(fw.length, big ? 3 : 2);
    for (let q = 0; q < picks && pulses.length < 46; q++) {
      const e = fw.splice(Math.floor(rnd() * fw.length), 1)[0];
      pulses.push({ e, from: i, u: 0, sp: 0.7 + rnd() * 0.6 });
    }
  }
  function step(dt: number, rate: number) {
    time += dt;
    next -= dt;
    if (next <= 0) {
      fire(inputs[Math.floor(rnd() * inputs.length)], true);
      next = rate * (0.5 + rnd());
    }
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.u += p.sp * dt;
      if (p.u >= 1) {
        pulses.splice(i, 1);
        const to = p.e.a === p.from ? p.e.b : p.e.a;
        if (rnd() < 0.8) fire(to, false);
        else nodes[to].act = Math.max(nodes[to].act, 0.6);
      }
    }
    const dec = Math.exp(-dt / 0.42);
    const dt2 = Math.exp(-dt / 0.9);
    for (const n of nodes) {
      n.act *= dec;
      n.term *= dt2;
    }
    for (const e of edges) e.act = Math.max(nodes[e.a].act, nodes[e.b].act);
  }
  return { nodes, edges, pulses, step };
}
type Net = ReturnType<typeof createNet>;

function drawNet(c: CanvasRenderingContext2D, net: Net, r: number) {
  c.lineCap = "round";
  c.beginPath();
  for (const e of net.edges) {
    const a = net.nodes[e.a];
    const b = net.nodes[e.b];
    c.moveTo(a.x, a.y);
    c.lineTo(b.x, b.y);
  }
  c.strokeStyle = "rgba(236,238,242,.2)";
  c.lineWidth = 0.9;
  c.stroke();
  for (const e of net.edges) {
    if (e.act < 0.08) continue;
    const a = net.nodes[e.a];
    const b = net.nodes[e.b];
    c.beginPath();
    c.moveTo(a.x, a.y);
    c.lineTo(b.x, b.y);
    c.strokeStyle = stg((a.st + b.st) / 2, Math.min(0.95, e.act * 1.05));
    c.lineWidth = 1.7;
    c.stroke();
  }
  for (const p of net.pulses) {
    const a = net.nodes[p.from];
    const b = net.nodes[p.e.a === p.from ? p.e.b : p.e.a];
    const x = lerp(a.x, b.x, p.u);
    const y = lerp(a.y, b.y, p.u);
    c.beginPath();
    c.arc(x, y, r * 2.3, 0, TAU);
    c.fillStyle = stg(a.st, 0.26);
    c.fill();
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fillStyle = stg(a.st, 1);
    c.fill();
  }
  for (const n of net.nodes) {
    const lit = n.act > 0.1;
    c.beginPath();
    c.arc(n.x, n.y, r + 1.4, 0, TAU);
    c.fillStyle = "#020304";
    c.fill();
    c.beginPath();
    c.arc(n.x, n.y, r, 0, TAU);
    c.fillStyle = lit ? stg(n.st, 0.55 + 0.45 * n.act) : "#0b0e1a";
    c.fill();
    c.strokeStyle = lit ? "#fff" : "rgba(236,238,242,.4)";
    c.lineWidth = 1;
    c.stroke();
  }
}

/* ------------------------------------------------------------------ geometry */
const polyLen = (pts: Pt[]) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
function polyAt(pts: Pt[], d: number): Pt {
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d <= l || i === pts.length - 1) {
      const u = l ? clamp(d / l) : 0;
      return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)];
    }
    d -= l;
  }
  return pts[pts.length - 1];
}
function strokePts(c: CanvasRenderingContext2D, pts: Pt[], col: string, w: number) {
  c.beginPath();
  pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  c.strokeStyle = col;
  c.lineWidth = w;
  c.stroke();
}
function glow(c: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, a: number) {
  const n = 5;
  c.save();
  c.globalCompositeOperation = "lighter";
  for (let i = 0; i < n; i++) {
    c.fillStyle = `rgba(${col},${a * 0.2})`;
    c.beginPath();
    c.arc(x, y, r * (1 - (i / n) * 0.85), 0, TAU);
    c.fill();
  }
  c.restore();
}

/* ------------------------------------------------------------------ scene */
// Where the illustration sits in design space, and its scale.
const DX = 700;
const DY = -4;
const SC = 0.96;
// Hair box (image px) for the mesh and the hair sway.
const HB = { x: 150, y: 40, w: 340, h: 430 };
// Gold connectors in the illustration (image px) and the way each cable leaves.
const PORTS: { p: Pt; d: Pt; jack: boolean }[] = [
  { p: [546, 278], d: [0.2, -1], jack: false },
  { p: [574, 291], d: [0.9, -0.4], jack: false },
  { p: [605, 312], d: [1, -0.25], jack: false },
  { p: [536, 380], d: [0.7, 0.7], jack: true },
  { p: [642, 331], d: [1, 0.1], jack: false },
  { p: [650, 420], d: [1, 0.3], jack: true },
];
const CABLE_COLS = ["#e9edf2", "#2f9aa3", "#c2353b", "#d9b43c", "#2f9aa3", "#e9edf2"];
const EXITS: Pt[] = [
  [1260, -30],
  [1370, -30],
  [1450, 160],
  [1450, 520],
  [1450, 330],
  [1450, 720],
];
const JUNC: Pt[] = [
  [1352, 170],
  [1404, 380],
  [1372, 610],
];
const ROUTE = [0, 0, 1, 2, 1, 2];
const INK = "#050608";

export function createPlugged(opts: Opts): PluggedHandle {
  const { canvas, reducedMotion } = opts;
  const ctx = canvas.getContext("2d");
  const noop: PluggedHandle = { setEntrance: () => {}, setUnplug: () => {}, destroy: () => {} };
  if (!ctx) return noop;

  const rnd = mulberry(91);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const mono = opts.monoFont || "ui-monospace, monospace";
  let W = 1;
  let H = 1;
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let entrance = 1;
  let unplug = 0;
  let time = reducedMotion ? 4 : 0;
  let raf = 0;
  let running = false;
  let onScreen = true;
  let last = 0;
  let destroyed = false;

  let art: HTMLCanvasElement | null = null;
  let hairMask: HTMLCanvasElement | null = null;
  let hairLayer: HTMLCanvasElement | null = null;
  const meshCanvas = document.createElement("canvas");
  meshCanvas.width = HB.w;
  meshCanvas.height = HB.h;
  const mctx = meshCanvas.getContext("2d");

  // The mesh: nodes over the skull; the face side is the input.
  const mesh = (() => {
    const r = mulberry(17);
    const pts: Pt[] = [];
    while (pts.length < 46) {
      let best: Pt = [0, 0];
      let bd = -1;
      for (let q = 0; q < 12; q++) {
        const a = r() * TAU;
        const rr = Math.sqrt(r());
        const cd: Pt = [318 + Math.cos(a) * rr * 150, 178 + Math.sin(a) * rr * 120];
        let md = 1e9;
        for (const p of pts) md = Math.min(md, Math.hypot(p[0] - cd[0], p[1] - cd[1]));
        if (md > bd) {
          bd = md;
          best = cd;
        }
      }
      pts.push(best);
    }
    return createNet(
      pts.map((p) => [p[0], p[1], (p[0] - 168) / 300] as [number, number, number]),
      3,
      70,
      5,
    );
  })();
  const cables = PORTS.map((pt, k) => ({ pt, col: CABLE_COLS[k], exit: EXITS[k], j: ROUTE[k], ph: rnd() * 6, w: 6 + rnd() * 3 }));
  const pulses: { k: number; d: number }[] = [];
  let nextPulse = 0.4;
  let glitch = 0;
  let gl: number[][] = [];
  let body = new DOMMatrix();
  const pivot: Pt = [DX + 420 * SC, DY + 858 * SC];
  const D = (p: Pt): Pt => {
    const q = body.transformPoint(new DOMPoint(DX + p[0] * SC, DY + p[1] * SC));
    return [q.x, q.y];
  };

  /* ---- load and prepare the illustration ---- */
  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    if (destroyed) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const g = cv.getContext("2d", { willReadFrequently: true });
    if (!g) return;
    g.drawImage(img, 0, 0);
    const data = g.getImageData(0, 0, w, h);
    const p = data.data;
    const mk = document.createElement("canvas");
    mk.width = HB.w;
    mk.height = HB.h;
    const mg = mk.getContext("2d");
    if (!mg) return;
    const md = mg.createImageData(HB.w, HB.h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const k = (y * w + x) * 4;
        const r = p[k];
        const gg = p[k + 1];
        const b = p[k + 2];
        // blue backdrop behind the face → black
        if (x > 150 && x < 345 && y > 200 && y < 480 && b > 100 && gg > 50 && gg > r + 14) p[k] = p[k + 1] = p[k + 2] = 0;
        // floor out
        if (y > 858) p[k + 3] = 0;
        // skin a little darker
        if (b > 0.5 * r && r > gg && gg > b && r > 120 && r - b > 25) {
          p[k] = r * 0.84;
          p[k + 1] = gg * 0.73;
          p[k + 2] = b * 0.66;
        }
        // hair mask
        if (x >= HB.x && x < HB.x + HB.w && y >= HB.y && y < HB.y + HB.h) {
          const mx = Math.max(r, gg, b);
          const hair = mx > 14 && mx < 130 && b >= r && (r + gg + b) / 3 < 80;
          md.data[((y - HB.y) * HB.w + (x - HB.x)) * 4 + 3] = hair ? 255 : 0;
        }
      }
    }
    g.putImageData(data, 0, 0);
    mg.putImageData(md, 0, 0);
    const hl = document.createElement("canvas");
    hl.width = HB.w;
    hl.height = HB.h;
    const hg = hl.getContext("2d");
    if (hg) {
      hg.drawImage(cv, -HB.x, -HB.y);
      hg.globalCompositeOperation = "destination-in";
      hg.drawImage(mk, 0, 0);
    }
    art = cv;
    hairMask = mk;
    hairLayer = hl;
    if (reducedMotion || !running) draw(0);
  };
  img.src = opts.src;

  /* ---- layout ---- */
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    if (W >= 1024) {
      // wide: fill the Hero, figure on the right of the copy
      scale = Math.max(W / DW, H / DH);
      tx = W - DW * scale;
      ty = H - DH * scale;
    } else {
      // narrow: smaller, at the top, so the copy below stays readable
      scale = (H * 0.6) / DH;
      tx = W * 0.55 - 1080 * scale;
      ty = 0;
    }
    if (reducedMotion || !running) draw(0);
  }

  /* ---- frame ---- */
  function draw(dt: number) {
    if (!ctx) return;
    const t = time;
    const e = entrance;
    const vis = sstep(0.3, 0.9, e);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // the hand-off: the camera pulls back from the loader's dive
    const zoom = 1 + 1.15 * Math.pow(1 - ease(e / 0.92), 2);
    const ax = 1060;
    const ay = 360;
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    ctx.translate(ax, ay);
    ctx.scale(zoom, zoom);
    ctx.translate(-ax, -ay);

    glow(ctx, 1010, 300, 300, "47,154,163", 0.1);
    if (!art || !hairLayer || !hairMask || !mctx) return;

    // breathing and a slow sway, pivoting on where she sits
    body = new DOMMatrix()
      .translate(pivot[0], pivot[1])
      .rotate(Math.sin(t * 0.55) * 0.35)
      .scale(1, 1 + Math.sin(t * 1.15) * 0.007)
      .translate(-pivot[0], -pivot[1]);

    ctx.save();
    ctx.globalAlpha = sstep(0.15, 0.7, e);
    ctx.transform(body.a, body.b, body.c, body.d, body.e, body.f);
    ctx.drawImage(art, DX, DY, art.width * SC, art.height * SC);
    // the hair sways a little more towards the tips
    for (let yy = 0; yy < HB.h; yy += 4) {
      const f = clamp((yy - 110) / 300);
      if (f <= 0) continue;
      const off = Math.sin(t * 1.3 + yy * 0.018) * 2.4 * f;
      ctx.drawImage(hairLayer, 0, yy, HB.w, 4, DX + HB.x * SC + off, DY + (HB.y + yy) * SC, HB.w * SC, 4 * SC + 0.6);
    }
    ctx.restore();
    // soften the left edge of the illustration into the page
    const fade = ctx.createLinearGradient(DX, 0, DX + 120, 0);
    fade.addColorStop(0, "rgba(7,8,11,1)");
    fade.addColorStop(1, "rgba(7,8,11,0)");
    ctx.fillStyle = fade;
    ctx.fillRect(DX - 2, -10, 122, DH + 20);
    // …and the bottom, where the floor was cut (visible on narrow screens)
    const fadeB = ctx.createLinearGradient(0, DY + 700 * SC, 0, DY + 860 * SC);
    fadeB.addColorStop(0, "rgba(7,8,11,0)");
    fadeB.addColorStop(1, "rgba(7,8,11,1)");
    ctx.fillStyle = fadeB;
    ctx.fillRect(DX - 2, DY + 700 * SC, DW - DX + 40, 160 * SC + 2);

    // the mesh, only on the hair
    if (dt) mesh.step(dt, 0.9);
    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.globalCompositeOperation = "source-over";
    mctx.clearRect(0, 0, HB.w, HB.h);
    mctx.translate(-HB.x, -HB.y);
    drawNet(mctx, mesh, 1.65);
    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.globalCompositeOperation = "destination-in";
    mctx.drawImage(hairMask, 0, 0);
    ctx.save();
    ctx.globalAlpha = 0.85 * vis;
    ctx.transform(body.a, body.b, body.c, body.d, body.e, body.f);
    ctx.drawImage(meshCanvas, DX + HB.x * SC, DY + HB.y * SC, HB.w * SC, HB.h * SC);
    ctx.restore();

    // glints on the gold connectors
    PORTS.forEach((pt, k) => {
      const g3 = Math.sin(t * 1.7 + k * 1.3);
      if (g3 < 0.93) return;
      const q = D(pt.p);
      const a3 = (g3 - 0.93) / 0.07;
      const r3 = 9 * a3;
      ctx.save();
      ctx.globalAlpha = a3;
      ctx.fillStyle = "#fff8dc";
      ctx.beginPath();
      ctx.moveTo(q[0], q[1] - r3);
      ctx.lineTo(q[0] + 2, q[1] - 2);
      ctx.lineTo(q[0] + r3, q[1]);
      ctx.lineTo(q[0] + 2, q[1] + 2);
      ctx.lineTo(q[0], q[1] + r3);
      ctx.lineTo(q[0] - 2, q[1] + 2);
      ctx.lineTo(q[0] - r3, q[1]);
      ctx.lineTo(q[0] - 2, q[1] - 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // cables: connector → junction → out of frame
    const J: Pt[] = JUNC.map((j, k) => [j[0], j[1] + Math.sin(t * 0.6 + k) * 4]);
    const paths = cables.map((cb) => {
      const s0 = D(cb.pt.p);
      const dl = Math.hypot(cb.pt.d[0], cb.pt.d[1]);
      const dir: Pt = [cb.pt.d[0] / dl, cb.pt.d[1] / dl];
      const out = unplug * 70;
      const s1: Pt = [s0[0] + dir[0] * out, s0[1] + dir[1] * out];
      const jl = cb.pt.jack ? 52 : 6;
      const j0: Pt = [s1[0] + dir[0] * jl, s1[1] + dir[1] * jl];
      const jk = J[cb.j];
      const sw = Math.sin(t * 0.7 + cb.ph) * 9;
      const c1: Pt = [j0[0] + dir[0] * 90, j0[1] + dir[1] * 90];
      const pts: Pt[] = [];
      for (let q = 0; q <= 16; q++) {
        const u = q / 16;
        const a = 1 - u;
        pts.push([a * a * j0[0] + 2 * a * u * c1[0] + u * u * jk[0], a * a * j0[1] + 2 * a * u * c1[1] + u * u * jk[1] + Math.sin(u * Math.PI) * sw]);
      }
      for (let q = 1; q <= 12; q++) {
        const u = q / 12;
        pts.push([lerp(jk[0], cb.exit[0], u), lerp(jk[1], cb.exit[1], u) + Math.sin(u * Math.PI) * (26 + sw * 0.6)]);
      }
      return { s1, dir, pts };
    });
    ctx.save();
    ctx.globalAlpha = vis;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    paths.forEach((pp, k) => {
      const cb = cables[k];
      strokePts(ctx, pp.pts, INK, cb.w + 3);
      strokePts(ctx, pp.pts, cb.col, cb.w);
      ctx.save();
      ctx.translate(-cb.w * 0.2, -cb.w * 0.25);
      strokePts(ctx, pp.pts, "rgba(255,255,255,.3)", Math.max(1, cb.w * 0.22));
      ctx.restore();
      if (cb.pt.jack) {
        const len = 52;
        const hw = 9;
        ctx.save();
        ctx.translate(pp.s1[0], pp.s1[1]);
        ctx.rotate(Math.atan2(pp.dir[1], pp.dir[0]));
        ctx.fillStyle = INK;
        ctx.fillRect(-2, -hw - 2, len + 4, hw * 2 + 4);
        ctx.fillStyle = "#c9a54a";
        ctx.fillRect(0, -hw, len, hw * 2);
        ctx.fillStyle = "#8a6d24";
        ctx.fillRect(0, 2, len, hw - 2);
        ctx.fillStyle = "rgba(0,0,0,.4)";
        for (let g2 = 0; g2 < 5; g2++) ctx.fillRect(len * 0.35 + g2 * 6, -hw, 2.4, hw * 2);
        ctx.fillStyle = "rgba(255,250,220,.55)";
        ctx.fillRect(0, -hw, len, 3);
        ctx.restore();
      }
    });
    J.forEach(([x, y], k) => {
      ctx.fillStyle = INK;
      ctx.fillRect(x - 26, y - 20, 52, 40);
      ctx.fillStyle = "#1b1f27";
      ctx.fillRect(x - 23, y - 17, 46, 34);
      ctx.fillStyle = Math.sin(t * 3 + k) > 0 ? stg(0.5 + k * 0.25, 1) : "#333a46";
      ctx.fillRect(x - 15, y - 9, 8, 8);
      ctx.font = `500 10px ${mono}`;
      ctx.fillStyle = "#cfd6de";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(`J${k + 1}`, x + 1, y + 5);
    });
    // signals out of the head, through the junctions, out of the frame
    if (dt) {
      nextPulse -= dt;
      if (nextPulse <= 0 && e > 0.5 && unplug < 0.6) {
        nextPulse = 0.42;
        pulses.push({ k: Math.floor(rnd() * cables.length), d: 0 });
      }
    }
    for (let i = pulses.length - 1; i >= 0; i--) {
      const pu = pulses[i];
      const pts = paths[pu.k].pts;
      const len = polyLen(pts);
      pu.d += 420 * dt;
      if (pu.d > len) {
        pulses.splice(i, 1);
        continue;
      }
      const q = polyAt(pts, pu.d);
      const sc = 0.4 + (0.6 * pu.d) / len;
      ctx.beginPath();
      ctx.arc(q[0], q[1], 9, 0, TAU);
      ctx.fillStyle = stg(sc, 0.32);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(q[0], q[1], 4.2, 0, TAU);
      ctx.fillStyle = stg(sc, 1);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    // labels: 電脳 (dennō, cyberbrain) on the mesh, 接続中 (setsuzoku-chū, connecting) on the cables
    const hp = D([250, 150]);
    ctx.beginPath();
    ctx.moveTo(hp[0], hp[1]);
    ctx.lineTo(hp[0] - 50, hp[1] - 40);
    ctx.lineTo(hp[0] - 70, hp[1] - 40);
    ctx.strokeStyle = "rgba(220,228,236,.7)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hp[0], hp[1], 3, 0, TAU);
    ctx.fillStyle = stg(0, 1);
    ctx.fill();
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    ctx.font = `800 18px ${JP}`;
    ctx.fillStyle = "#eef2f6";
    ctx.fillText("電脳", hp[0] - 76, hp[1] - 36);
    ctx.font = `400 10px ${mono}`;
    ctx.fillStyle = "#9aa6b3";
    ctx.fillText("CYBERBRAIN · 46 NODES", hp[0] - 76, hp[1] - 20);
    ctx.font = `800 15px ${JP}`;
    ctx.fillStyle = "#eef2f6";
    ctx.fillText("接続中", 1404, 104);
    ctx.font = `400 10px ${mono}`;
    ctx.fillStyle = "#9aa6b3";
    ctx.fillText(unplug > 0.6 ? "DISCONNECTED" : "CONNECTING · 6 / 6", 1350, 103);
    ctx.restore();

    // an occasional magenta glitch
    if (dt) {
      glitch -= dt;
      if (glitch < -2.8 && e > 0.7) {
        glitch = 0.16;
        gl = [0, 1, 2].map(() => [880 + rnd() * 400, 80 + rnd() * 600, 80 + rnd() * 220, 2 + rnd() * 5]);
      }
    }
    if (glitch > 0)
      for (const g of gl) {
        ctx.fillStyle = "rgba(255,62,165,.75)";
        ctx.fillRect(g[0], g[1], g[2], g[3]);
        ctx.fillStyle = "rgba(111,221,230,.5)";
        ctx.fillRect(g[0] + 8, g[1] + g[3] + 2, g[2] * 0.6, 2);
      }

    // the last frame of the dive: dark with a teal core, fading as the camera pulls back
    const fa = 1 - sstep(0, 0.55, e);
    if (fa > 0.003) {
      ctx.globalAlpha = fa;
      const v = ctx.createRadialGradient(ax, ay, 30, ax, ay, 900);
      v.addColorStop(0, "rgba(7,8,11,0)");
      v.addColorStop(0.12, "rgba(7,8,11,.86)");
      v.addColorStop(1, "#07080b");
      ctx.fillStyle = v;
      ctx.fillRect(-200, -200, DW + 400, DH + 400);
      ctx.globalCompositeOperation = "lighter";
      const core = ctx.createRadialGradient(ax, ay, 0, ax, ay, 260 * (1 + 2.5 * (1 - fa)));
      core.addColorStop(0, "rgba(111,221,230,.5)");
      core.addColorStop(0.35, "rgba(47,154,163,.26)");
      core.addColorStop(1, "rgba(47,154,163,0)");
      ctx.fillStyle = core;
      ctx.fillRect(-200, -200, DW + 400, DH + 400);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }
  }

  /* ---- loop ---- */
  function frame(now: number) {
    if (!running) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    time += dt;
    draw(dt);
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running || reducedMotion || !onScreen || document.hidden || destroyed) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

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
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  start();

  return {
    setEntrance(v) {
      entrance = clamp(v);
      if (reducedMotion || !running) draw(0);
    },
    setUnplug(v) {
      unplug = clamp(v);
      if (reducedMotion) draw(0);
    },
    destroy() {
      destroyed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}
