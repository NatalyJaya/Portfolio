import * as THREE from "three";

/**
 * Procedural cables the cyborg hangs from. Each one is a Verlet rope pinned to
 * a fixed point above the frame and to an anchor on the bust, skinned as a
 * tube. Plain three.js, no React: the scene mounts `group` and calls `update`
 * once per frame.
 */

export type CableSpec = {
  /** Where it plugs into the bust, in the model's own space. */
  anchor: readonly [number, number, number];
  /** Fixed point it hangs from, above the top of the frame. */
  ceiling: readonly [number, number, number];
  radius: number;
  color: string;
  /**
   * Extra length at rest, as a fraction. 0 is a taut, load-bearing cable; it
   * takes very little to show (0.5 % over a 2-unit run bows ~0.07 sideways).
   */
  slack: number;
  /** Axis of the plug in model space: the cable leaves along it. Defaults to straight up. */
  exit?: readonly [number, number, number];
  /** Plugged into the brain's cap rather than the body, so it follows the cap when it lifts. */
  onCap?: boolean;
  /** A dim pulse of this colour travels down the cable into the bust. */
  glow?: string;
};

export type CableRig = {
  group: THREE.Group;
  /** Lay every cable straight again on the next update (used on replay). */
  reset(): void;
  /**
   * A cable's length goes through three regimes:
   *  - falling (`caught` 0): it pays out behind the bust, a touch loose;
   *  - caught (`caught` 1): fixed length, so the rebound slackens it and it ripples;
   *  - settled (`settled` 1): the bust's weight keeps it at its rest slack, so
   *    the idle sway can't make it go limp.
   *
   * @param anchorMatrix model space → the space `group` lives in
   * @param capMatrix model space → same, for the cables plugged into the brain's cap
   */
  update(
    dt: number,
    time: number,
    anchorMatrix: THREE.Matrix4,
    capMatrix: THREE.Matrix4,
    caught: number,
    settled: number,
  ): void;
  dispose(): void;
};

const POINTS = 40; // rope particles
const RINGS = 64; // tube cross-sections
const SIDES = 6;
const ITERATIONS = 14;
const BEND = 0.3; // resistance to folding: a rubber cable arcs, a bare rope kinks
const STEP = 1 / 120; // fixed simulation step, so it behaves the same at any frame rate
const MAX_STEPS = 6; // per frame; a long stall drops time instead of spiralling
const GRAVITY = -7;
const DAMPING = 0.99; // velocity kept per step
const WIND = 0.35; // gentle lateral drift so slack cables never sit dead still
const PAYOUT_SLACK = 0.02;

const COS = Array.from({ length: SIDES }, (_, j) => Math.cos((j / SIDES) * Math.PI * 2));
const SIN = Array.from({ length: SIDES }, (_, j) => Math.sin((j / SIDES) * Math.PI * 2));

// Scratch vectors, shared: nothing here is re-entrant.
const _p = new THREE.Vector3();
const _t = new THREE.Vector3();
const _tPrev = new THREE.Vector3();
const _n = new THREE.Vector3();
const _b = new THREE.Vector3();
const _axis = new THREE.Vector3();

class Cable {
  readonly mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
  private readonly pts: THREE.Vector3[] = [];
  private readonly prev: THREE.Vector3[] = [];
  private readonly curve: THREE.CatmullRomCurve3;
  private readonly samples = new Float32Array((RINGS + 1) * 3);
  private readonly position: THREE.BufferAttribute;
  private readonly normal: THREE.BufferAttribute;
  private readonly top: THREE.Vector3;
  private readonly anchor: THREE.Vector3;
  private readonly bottom = new THREE.Vector3();
  private readonly exit: THREE.Vector3;
  private readonly exitDir = new THREE.Vector3();
  private readonly restLength: number;
  private readonly slack: number;
  private readonly radius: number;
  private readonly phase: number;
  readonly onCap: boolean;

  constructor(spec: CableSpec, material: THREE.Material, index: number) {
    this.top = new THREE.Vector3(...spec.ceiling);
    this.anchor = new THREE.Vector3(...spec.anchor);
    this.exit = new THREE.Vector3(...(spec.exit ?? [0, 1, 0]));
    this.restLength = this.top.distanceTo(this.anchor) * (1 + spec.slack);
    this.slack = spec.slack;
    this.radius = spec.radius;
    this.onCap = spec.onCap ?? false;
    this.phase = index * 2.399; // golden angle: no two cables drift in sync

    for (let i = 0; i < POINTS; i++) {
      this.pts.push(new THREE.Vector3());
      this.prev.push(new THREE.Vector3());
    }
    // The curve keeps a reference to `pts`, so it follows the simulation.
    this.curve = new THREE.CatmullRomCurve3(this.pts, false, "centripetal");

    const vertices = (RINGS + 1) * SIDES;
    this.position = new THREE.BufferAttribute(new Float32Array(vertices * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.normal = new THREE.BufferAttribute(new Float32Array(vertices * 3), 3).setUsage(THREE.DynamicDrawUsage);
    const index16 = new Uint16Array(RINGS * SIDES * 6);
    let k = 0;
    for (let i = 0; i < RINGS; i++) {
      for (let j = 0; j < SIDES; j++) {
        const a = i * SIDES + j;
        const b = i * SIDES + ((j + 1) % SIDES);
        const c = a + SIDES;
        const d = b + SIDES;
        index16[k++] = a;
        index16[k++] = b;
        index16[k++] = c;
        index16[k++] = b;
        index16[k++] = d;
        index16[k++] = c;
      }
    }
    // u runs 0 (ceiling) → 1 (plug): the glow shader travels along it.
    const along = new Float32Array(vertices * 2);
    for (let i = 0; i <= RINGS; i++) for (let j = 0; j < SIDES; j++) along[(i * SIDES + j) * 2] = i / RINGS;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("uv", new THREE.BufferAttribute(along, 2));
    geometry.setAttribute("position", this.position);
    geometry.setAttribute("normal", this.normal);
    geometry.setIndex(new THREE.BufferAttribute(index16, 1));
    // The geometry is rewritten every frame, so give the renderer fixed bounds
    // (it only needs a centre for depth sorting) instead of letting it measure
    // whatever the buffer holds on the first frame.
    geometry.boundingSphere = new THREE.Sphere(this.top.clone().lerp(this.anchor, 0.5), this.restLength);

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.frustumCulled = false;
  }

  /** Move the lower end to wherever the bust's anchor is this frame. */
  place(anchorMatrix: THREE.Matrix4) {
    this.bottom.copy(this.anchor).applyMatrix4(anchorMatrix);
    this.exitDir.copy(this.exit).transformDirection(anchorMatrix);
  }

  /** Straight line between the two ends, at rest. */
  lay() {
    for (let i = 0; i < POINTS; i++) {
      this.pts[i].lerpVectors(this.top, this.bottom, i / (POINTS - 1));
      this.prev[i].copy(this.pts[i]);
    }
  }

  step(time: number, caught: number, settled: number) {
    const { pts, prev, top, bottom } = this;
    const last = POINTS - 1;
    const distance = top.distanceTo(bottom);
    const held = THREE.MathUtils.lerp(distance * (1 + PAYOUT_SLACK), this.restLength, caught);
    const length = THREE.MathUtils.lerp(held, distance * (1 + this.slack), settled);
    const segment = length / last;

    const h2 = STEP * STEP;
    const ax = Math.sin(time * 0.9 + this.phase) * WIND * h2;
    const ay = GRAVITY * h2;
    const az = Math.cos(time * 0.7 + this.phase * 1.3) * WIND * h2;
    for (let i = 1; i < last - 1; i++) {
      const p = pts[i];
      const q = prev[i];
      const vx = (p.x - q.x) * DAMPING;
      const vy = (p.y - q.y) * DAMPING;
      const vz = (p.z - q.z) * DAMPING;
      q.copy(p);
      p.x += vx + ax;
      p.y += vy + ay;
      p.z += vz + az;
    }

    // Pinned: the ceiling end, the plug, and the particle just above the plug,
    // which holds the cable on the plug's axis so it can't hook in from below.
    pts[0].copy(top);
    pts[last].copy(bottom);
    pts[last - 1].copy(bottom).addScaledVector(this.exitDir, segment);
    const pinned = (i: number) => i === 0 || i >= last - 1;

    for (let k = 0; k < ITERATIONS; k++) {
      // Length: neighbours stay one segment apart.
      for (let i = 0; i < last - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
        const f = (len - segment) / len;
        // A pinned particle doesn't move; its neighbour takes the whole correction.
        const wa = pinned(i) ? 0 : pinned(i + 1) ? 1 : 0.5;
        const wb = pinned(i + 1) ? 0 : pinned(i) ? 1 : 0.5;
        a.x += dx * f * wa;
        a.y += dy * f * wa;
        a.z += dz * f * wa;
        b.x -= dx * f * wb;
        b.y -= dy * f * wb;
        b.z -= dz * f * wb;
      }
      // Bending: particles two apart are pushed back out when the cable folds.
      for (let i = 0; i < last - 1; i++) {
        if (pinned(i) && pinned(i + 2)) continue;
        const a = pts[i];
        const c = pts[i + 2];
        const dx = c.x - a.x;
        const dy = c.y - a.y;
        const dz = c.z - a.z;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
        if (len >= segment * 2) continue;
        const f = ((len - segment * 2) / len) * BEND;
        const wa = pinned(i) ? 0 : pinned(i + 2) ? 1 : 0.5;
        const wc = pinned(i + 2) ? 0 : pinned(i) ? 1 : 0.5;
        a.x += dx * f * wa;
        a.y += dy * f * wa;
        a.z += dz * f * wa;
        c.x -= dx * f * wc;
        c.y -= dy * f * wc;
        c.z -= dz * f * wc;
      }
    }
  }

  /** Re-skin the tube along the rope, carrying the frame along it without twist. */
  rebuild() {
    const s = this.samples;
    for (let i = 0; i <= RINGS; i++) {
      this.curve.getPoint(i / RINGS, _p);
      s[i * 3] = _p.x;
      s[i * 3 + 1] = _p.y;
      s[i * 3 + 2] = _p.z;
    }

    const pos = this.position.array as Float32Array;
    const nor = this.normal.array as Float32Array;
    const r = this.radius;
    for (let i = 0; i <= RINGS; i++) {
      const a = Math.max(i - 1, 0) * 3;
      const b = Math.min(i + 1, RINGS) * 3;
      _t.set(s[b] - s[a], s[b + 1] - s[a + 1], s[b + 2] - s[a + 2]).normalize();

      if (i === 0) {
        _n.set(1, 0, 0);
        if (Math.abs(_t.x) > 0.9) _n.set(0, 0, 1);
        _n.crossVectors(_t, _n).normalize();
      } else {
        _axis.crossVectors(_tPrev, _t);
        const sin = _axis.length();
        if (sin > 1e-6) {
          _axis.multiplyScalar(1 / sin);
          _n.applyAxisAngle(_axis, Math.atan2(sin, _tPrev.dot(_t)));
        }
      }
      _b.crossVectors(_t, _n);
      _tPrev.copy(_t);

      for (let j = 0; j < SIDES; j++) {
        const nx = COS[j] * _n.x + SIN[j] * _b.x;
        const ny = COS[j] * _n.y + SIN[j] * _b.y;
        const nz = COS[j] * _n.z + SIN[j] * _b.z;
        const o = (i * SIDES + j) * 3;
        nor[o] = nx;
        nor[o + 1] = ny;
        nor[o + 2] = nz;
        pos[o] = s[i * 3] + nx * r;
        pos[o + 1] = s[i * 3 + 1] + ny * r;
        pos[o + 2] = s[i * 3 + 2] + nz * r;
      }
    }
    this.position.needsUpdate = true;
    this.normal.needsUpdate = true;
  }
}

/** Cable material with a soft band of light running down it, towards the plug. */
function glowMaterial(spec: CableSpec, index: number, clock: { value: number }) {
  const material = new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.42, metalness: 0.15 });
  const glow = { value: new THREE.Color(spec.glow) };
  const offset = (index * 0.37) % 1;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = clock;
    shader.uniforms.uGlow = glow;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vAlong;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvAlong = uv.x;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vAlong;\nuniform float uTime;\nuniform vec3 uGlow;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float band = fract(vAlong * 2.0 - uTime * 0.22 + ${offset.toFixed(3)});
        float pulse = smoothstep(0.0, 0.05, band) * smoothstep(0.2, 0.05, band);
        totalEmissiveRadiance += uGlow * (0.04 + pulse * 0.55);`,
      );
  };
  return material;
}

export function createCableRig(specs: readonly CableSpec[]): CableRig {
  const group = new THREE.Group();
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const glowing: THREE.Material[] = [];
  const clock = { value: 0 };
  const cables = specs.map((spec, i) => {
    let material = materials.get(spec.color);
    if (spec.glow) {
      material = glowMaterial(spec, i, clock);
      glowing.push(material);
    } else if (!material) {
      material = new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.42, metalness: 0.15 });
      materials.set(spec.color, material);
    }
    const cable = new Cable(spec, material, i);
    group.add(cable.mesh);
    return cable;
  });

  let fresh = true;
  let pending = 0;

  return {
    group,
    reset() {
      fresh = true;
    },
    update(dt, time, anchorMatrix, capMatrix, caught, settled) {
      clock.value = time;
      for (const cable of cables) cable.place(cable.onCap ? capMatrix : anchorMatrix);
      if (fresh) {
        for (const cable of cables) cable.lay();
        fresh = false;
        pending = 0;
      }
      pending = Math.min(pending + dt, STEP * MAX_STEPS);
      while (pending >= STEP) {
        for (const cable of cables) cable.step(time, caught, settled);
        pending -= STEP;
      }
      for (const cable of cables) cable.rebuild();
    },
    dispose() {
      for (const cable of cables) cable.mesh.geometry.dispose();
      for (const material of materials.values()) material.dispose();
      for (const material of glowing) material.dispose();
      group.clear();
    },
  };
}
