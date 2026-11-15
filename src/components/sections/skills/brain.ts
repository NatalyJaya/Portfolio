/**
 * Procedural brain used by the skills connectome.
 *
 * Two hemispheres shaped like a real side profile (round frontal lobe, lower
 * occipital, hanging temporal lobes) and a brainstem. Instead of
 * a triangle mesh, the surface is drawn as its folds: the zero iso-lines of a
 * meandering "gyri" field, traced with marching squares over a (θ, φ) grid.
 * That labyrinth of wavy grooves is what makes it read as a brain.
 *
 * Model space while building: x = right, y = up, z = front. The result is
 * centred, scaled to a unit radius and flipped to screen space (y down).
 */

export type V3 = { x: number; y: number; z: number };

const fib = (n: number): V3[] =>
  Array.from({ length: n }, (_, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    return { x: Math.cos(theta) * Math.sin(phi), y: Math.cos(phi), z: Math.sin(theta) * Math.sin(phi) };
  });

/** Meandering gyri field (domain-warped sum of sines). Its zero set looks like brain folds. */
function gyri(x: number, y: number, z: number) {
  const wx = x + 0.12 * Math.sin(5.1 * y + 1.3) + 0.08 * Math.sin(7.3 * z);
  const wy = y + 0.12 * Math.sin(4.7 * z + 0.7) + 0.08 * Math.sin(6.1 * x);
  const wz = z + 0.12 * Math.sin(5.3 * x + 2.1) + 0.08 * Math.sin(6.7 * y);
  const k = 10.5;
  return (
    Math.sin(k * (0.8 * wx + 0.6 * wy)) +
    Math.sin(k * (-0.3 * wy + 0.95 * wz) + 1.7) +
    Math.sin(k * (0.6 * wx - 0.5 * wy + 0.62 * wz) + 0.4)
  );
}

type Sample = { p: V3; v: number };

/** Smoothstep from e0 to e1 (works with e0 > e1 too). */
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** One hemisphere. `d` is a unit direction, `h` the side (+1 right, -1 left). */
function cortex(d: V3, h: 1 | -1, folds = 1): Sample {
  const inward = d.x * h < 0;
  const back = Math.max(0, -d.z);

  let x = d.x * (inward ? 0.25 : 0.43);
  // top arches down towards the back; underside rises towards the back
  const under = 1 - 0.38 * smooth(-0.05, -0.4, d.z) - 0.22 * smooth(0.3, 0.65, d.z);
  let y = d.y < 0 ? d.y * 0.36 * under : d.y * 0.56 * (1 - 0.2 * back);
  let z = d.z * (d.z > 0 ? 0.86 : 0.84);

  // temporal lobe: hangs down and forward under the front half
  const tb = inward ? 0 : Math.exp(-((d.z - 0.2) ** 2 / 0.1 + (d.y + 0.55) ** 2 / 0.08));
  y -= 0.21 * tb;
  x += h * 0.05 * tb;
  z += 0.03 * tb;

  // major sulci: lateral fissure above the temporal lobe, central sulcus over the top
  const lateral = !inward && d.z > -0.4 ? Math.exp(-((d.y - (-0.2 + 0.3 * d.z)) ** 2) / 0.0025) : 0;
  const central = Math.exp(-((d.z - 0.02 + 0.22 * d.y) ** 2) / 0.0018) * Math.max(0, d.y);
  const g = gyri(x * 2.6 + h * 0.7, y * 2.6, z * 2.6) - 3.2 * lateral - 2.4 * central;

  const r = 1 + folds * (0.028 * Math.tanh(1.4 * g) - 0.05 * lateral - 0.025 * central);
  return { p: { x: x * r + h * 0.27, y: y * r, z: z * r }, v: g };
}

/**
 * Trace the zero iso-line of `fn` over a latitude/longitude grid with
 * marching squares. Returns 3D segment endpoints.
 */
function isoLines(fn: (d: V3) => Sample, nLat: number, nLon: number, out: { pts: V3[]; segs: [number, number][] }): Shell {
  const grid: Sample[][] = [];
  for (let i = 0; i <= nLat; i++) {
    const th = (i / nLat) * Math.PI;
    const row: Sample[] = [];
    for (let j = 0; j < nLon; j++) {
      const ph = (j / nLon) * Math.PI * 2;
      row.push(fn({ x: Math.sin(th) * Math.cos(ph), y: Math.cos(th), z: Math.sin(th) * Math.sin(ph) }));
    }
    grid.push(row);
  }
  const lerp = (a: Sample, b: Sample): V3 => {
    const t = a.v / (a.v - b.v);
    return { x: a.p.x + (b.p.x - a.p.x) * t, y: a.p.y + (b.p.y - a.p.y) * t, z: a.p.z + (b.p.z - a.p.z) * t };
  };
  for (let i = 0; i < nLat; i++) {
    for (let j = 0; j < nLon; j++) {
      const c = [grid[i][j], grid[i][(j + 1) % nLon], grid[i + 1][(j + 1) % nLon], grid[i + 1][j]];
      const hits: V3[] = [];
      for (let e = 0; e < 4; e++) {
        const a = c[e];
        const b = c[(e + 1) % 4];
        if (a.v < 0 !== b.v < 0) hits.push(lerp(a, b));
      }
      for (let k = 0; k + 1 < hits.length; k += 2) {
        out.pts.push(hits[k], hits[k + 1]);
        out.segs.push([out.pts.length - 2, out.pts.length - 1]);
      }
    }
  }

  // coarse copy of the surface with normals, for the live silhouette
  const step = 2;
  const pts: V3[] = [];
  const normals: V3[] = [];
  const lat = Math.floor(nLat / step);
  const lon = Math.floor(nLon / step);
  const at = (i: number, j: number) => grid[Math.max(0, Math.min(nLat, i))][((j % nLon) + nLon) % nLon].p;
  for (let i = 0; i <= lat; i++) {
    for (let j = 0; j < lon; j++) {
      const gi = i * step;
      const gj = j * step;
      const du = sub(at(gi, gj + 1), at(gi, gj - 1));
      const dv = sub(at(gi + 1, gj), at(gi - 1, gj));
      let n = cross(dv, du);
      const len = Math.hypot(n.x, n.y, n.z) || 1;
      n = { x: n.x / len, y: n.y / len, z: n.z / len };
      pts.push(at(gi, gj));
      normals.push(n);
    }
  }
  return { pts, normals, lat, lon };
}

const sub = (a: V3, b: V3): V3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const cross = (a: V3, b: V3): V3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });

/** A closed surface on a (lat, lon) grid, used to draw its outline from any angle. */
export type Shell = { pts: V3[]; normals: V3[]; lat: number; lon: number };

export type Brain = {
  /** Line endpoints (screen-space unit model). */
  points: V3[];
  /** Line segments as point index pairs. */
  segs: [number, number][];
  /** Surfaces whose silhouette is traced each frame. */
  shells: Shell[];
  /** Evenly spread cortex spots for labels, slightly above the surface. */
  spots: V3[];
  /** Region centres, same space as `spots`. */
  regions: { frontal: V3; parietal: V3; temporal: V3[]; occipital: V3 };
};

export function buildBrain(spotCount: number): Brain {
  const lines = { pts: [] as V3[], segs: [] as [number, number][] };
  const shells: Shell[] = [];
  for (const h of [1, -1] as const) shells.push(isoLines((d) => cortex(d, h), 110, 220, lines));

  const cortexCount = lines.pts.length;

  // brainstem: a few tapering vertical strands and rings
  for (let a = 0; a < 7; a++) {
    for (let i = 0; i < 6; i++) {
      const p = (t: number): V3 => {
        const r = 0.085 - 0.025 * t;
        const ang = (a / 7) * Math.PI * 2;
        return { x: Math.cos(ang) * r, y: -0.22 - 0.4 * t, z: -0.18 - 0.1 * t + Math.sin(ang) * r };
      };
      lines.pts.push(p(i / 6), p((i + 1) / 6));
      lines.segs.push([lines.pts.length - 2, lines.pts.length - 1]);
    }
  }

  // labels sit on a smoothed cortex so they don't sink into grooves
  const perSide = Math.ceil((spotCount * 1.5) / 2);
  const rawSpots = ([1, -1] as const).flatMap((h) =>
    fib(perSide)
      .filter((d) => d.y > -0.6)
      .map((d) => cortex(d, h, 0).p),
  );
  const rawRegions = {
    frontal: { x: 0, y: 0.2, z: 0.9 },
    parietal: { x: 0, y: 0.6, z: -0.25 },
    temporal: [
      { x: 0.7, y: -0.35, z: 0.2 },
      { x: -0.7, y: -0.35, z: 0.2 },
    ],
    occipital: { x: 0, y: 0.05, z: -0.85 },
  };

  // centre on the hemispheres (the stem just hangs below), scale to fit
  // everything, flip y for screen space
  const all = lines.pts;
  const cortexPts = all.slice(0, cortexCount);
  const mid = (k: keyof V3) => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const p of cortexPts) {
      lo = Math.min(lo, p[k]);
      hi = Math.max(hi, p[k]);
    }
    return (lo + hi) / 2;
  };
  const c = { x: mid("x"), y: mid("y"), z: mid("z") };
  let maxR = 0;
  for (const p of all) maxR = Math.max(maxR, Math.hypot(p.x - c.x, p.y - c.y, p.z - c.z));
  const scale = 1 / maxR;
  const tf = (p: V3, lift = 1): V3 => ({
    x: (p.x - c.x) * scale * lift,
    y: -(p.y - c.y) * scale * lift,
    z: (p.z - c.z) * scale * lift,
  });

  return {
    points: lines.pts.map((p) => tf(p)),
    segs: lines.segs,
    // normals only rotate/flip; positions get the same transform as the lines
    shells: shells.map((sh) => ({
      ...sh,
      pts: sh.pts.map((p) => tf(p)),
      normals: sh.normals.map((n) => ({ x: n.x, y: -n.y, z: n.z })),
    })),
    spots: rawSpots.map((p) => tf(p, 1.04)),
    regions: {
      frontal: tf(rawRegions.frontal),
      parietal: tf(rawRegions.parietal),
      temporal: rawRegions.temporal.map((p) => tf(p)),
      occipital: tf(rawRegions.occipital),
    },
  };
}
