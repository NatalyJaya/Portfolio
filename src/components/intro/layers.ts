import * as THREE from "three";

/**
 * The cyborg is one fused, single-material mesh, so its "brain" can't move as
 * modelled. This cuts the dark dome on top of the skull out of that mesh at
 * load time — a top cap (which carries the cable stubs) and four side plates —
 * and puts a small lit core underneath for the plates to reveal.
 *
 * The cut reuses the mesh's vertex buffers: every part is just another index
 * list over the same attributes, so it costs no extra geometry memory.
 */

/** Dome centre and radius in the model's root space, measured on the mesh. */
const CENTER = new THREE.Vector3(-0.01, 0.29, 0.13);
const RADIUS = 0.14;
const RIM_Y = 0.315; // below this the dome meets the skull; leave it alone
const CAP_ANGLE = (50 * Math.PI) / 180; // polar angle of the cap's edge
const PETALS = 4;

const CYAN = "#6fdde6";
const RED = "#c2353b";

export type BrainLayers = {
  /**
   * @param open 0 closed … 1 fully open
   * @param time seconds, for the idle motion of the core
   * @param assembled 0 dark silhouette … 1 fully built (cables, then muscle, then plates)
   */
  update(open: number, time: number, assembled: number): void;
  /** Root-space transform of the cap this frame: cables plugged into it follow it. */
  capMatrix: THREE.Matrix4;
};

type Part = { group: THREE.Group; pivot: THREE.Vector3; dir: THREE.Vector3; axis: THREE.Vector3 };

const cache = new WeakMap<THREE.Object3D, BrainLayers>();
const NONE: BrainLayers = { update() {}, capMatrix: new THREE.Matrix4() };
/** One model, one intro: the assembly progress is shared by the body and the plates cut from it. */
const assembledUniform = { value: 1 };

/**
 * "Assembling": the single texture is sorted by colour into three layers —
 * dark cables and mechanisms, red muscle, white plates — and each one is
 * switched on in turn by a line of light sweeping up the bust. Until a layer
 * is reached it stays a near-black silhouette.
 */
function addAssembly(material: THREE.MeshStandardMaterial, assembled: { value: number }) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uAssembled = assembled;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vHeight;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvHeight = position.y;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vHeight;\nuniform float uAssembled;")
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        float asmLum = dot(diffuseColor.rgb, vec3(0.333));
        float asmWhite = smoothstep(0.42, 0.58, asmLum);
        float asmRed = smoothstep(0.06, 0.18, diffuseColor.r - max(diffuseColor.g, diffuseColor.b)) * (1.0 - asmWhite);
        float asmStage = asmWhite * 2.0 + asmRed;
        float asmLocal = clamp(uAssembled * 3.0 - asmStage, 0.0, 1.0);
        float asmFront = mix(-0.62, 0.62, asmLocal);
        float asmShown = max(step(1.0, asmLocal), smoothstep(asmFront, asmFront - 0.04, vHeight));
        float asmEdge = smoothstep(0.045, 0.0, abs(vHeight - asmFront)) * step(0.001, asmLocal) * step(asmLocal, 0.999);
        diffuseColor.rgb *= mix(0.05, 1.0, asmShown);`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        totalEmissiveRadiance += mix(vec3(0.16, 0.55, 0.6), vec3(0.55, 0.1, 0.12), asmRed) * asmEdge * 0.8;`,
      );
  };
  material.customProgramCacheKey = () => "cyborg-assembly";
  material.needsUpdate = true;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Luminance of the base-colour texture at a UV, or null if it can't be read. */
function luminanceSampler(texture: THREE.Texture | null): ((u: number, v: number) => number) | null {
  const image = texture?.image as CanvasImageSource | undefined;
  if (!image || typeof document === "undefined") return null;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  try {
    ctx.drawImage(image, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    return (u, v) => {
      const x = Math.min(size - 1, Math.max(0, Math.floor(u * size)));
      const y = Math.min(size - 1, Math.max(0, Math.floor(v * size)));
      const o = (y * size + x) * 4;
      return (data[o] + data[o + 1] + data[o + 2]) / 3;
    };
  } catch {
    return null;
  }
}

/** The lit machinery under the plates: a dark core, a faint circuit cage, two rings. */
function createCore() {
  const group = new THREE.Group();
  group.position.copy(CENTER);

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(RADIUS * 0.74, 32, 20),
    new THREE.MeshStandardMaterial({ color: "#101216", roughness: 0.38, metalness: 0.85 }),
  );
  const cageMaterial = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.2, toneMapped: false });
  const cage = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(RADIUS * 0.76, 2)),
    cageMaterial,
  );
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: "#23262c",
    roughness: 0.3,
    metalness: 0.9,
    emissive: CYAN,
    emissiveIntensity: 0.1,
  });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(RADIUS * 0.84, 0.004, 8, 64), ringMaterial);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(RADIUS * 0.8, 0.003, 8, 64), ringMaterial);
  ringA.rotation.x = Math.PI / 2;
  ringB.rotation.set(Math.PI / 2.6, 0.5, 0);
  const emberMaterial = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.5, toneMapped: false });
  const ember = new THREE.Mesh(new THREE.SphereGeometry(0.006, 12, 8), emberMaterial);
  ember.position.set(0.02, RADIUS * 0.75, 0.03);

  group.add(shell, cage, ringA, ringB, ember);
  return { group, cage, cageMaterial, ringA, ringB, ringMaterial, emberMaterial };
}

function build(scene: THREE.Object3D): BrainLayers {
  let source: THREE.Mesh | null = null;
  scene.traverse((o) => {
    if (!source && (o as THREE.Mesh).isMesh) source = o as THREE.Mesh;
  });
  const mesh = source as THREE.Mesh | null;
  const index = mesh?.geometry.index;
  const material = mesh?.material as THREE.MeshStandardMaterial | undefined;
  if (!mesh || !index || !material || Array.isArray(material)) return NONE;
  const lum = luminanceSampler(material.map);
  if (!lum) return NONE;

  const geometry = mesh.geometry;
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  if (!uv) return NONE;

  // Mesh space → root space (the glTF node carries a rotation).
  scene.updateWorldMatrix(true, true);
  const toRoot = new THREE.Matrix4().copy(scene.matrixWorld).invert().multiply(mesh.matrixWorld);

  // Sort every triangle: -1 stays on the body, 0 is the cap, 1…PETALS the side plates.
  const src = index.array;
  const buckets: number[][] = Array.from({ length: PETALS + 2 }, () => []);
  const c = new THREE.Vector3();
  const p = new THREE.Vector3();
  for (let t = 0; t < src.length; t += 3) {
    c.set(0, 0, 0);
    for (let k = 0; k < 3; k++) c.add(p.fromBufferAttribute(pos, src[t + k]));
    c.multiplyScalar(1 / 3).applyMatrix4(toRoot);
    const dx = c.x - CENTER.x;
    const dy = c.y - CENTER.y;
    const dz = c.z - CENTER.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    let bucket = 0; // body
    const dark = lum(uv.getX(src[t]), uv.getY(src[t])) < 150; // not a white skull plate
    if (dark && c.y > RIM_Y && dist < RADIUS + 0.13) {
      const stub = dist > RADIUS + 0.02; // cable stubs sprouting from the dome
      if (stub) {
        if (dy > 0.07) bucket = 1; // they all ride on the cap
      } else if (dist > RADIUS - 0.05) {
        const polar = Math.acos(dy / dist);
        if (polar < CAP_ANGLE) bucket = 1;
        else {
          const azimuth = Math.atan2(dz, dx) + Math.PI; // 0…2π
          bucket = 2 + Math.min(PETALS - 1, Math.floor((azimuth / (Math.PI * 2)) * PETALS));
        }
      }
    }
    buckets[bucket].push(src[t], src[t + 1], src[t + 2]);
  }
  if (buckets[1].length === 0) return NONE;

  const partGeometry = (indices: number[]) => {
    const g = new THREE.BufferGeometry();
    for (const name of Object.keys(geometry.attributes)) g.setAttribute(name, geometry.attributes[name]);
    g.setIndex(indices);
    g.boundingSphere = geometry.boundingSphere?.clone() ?? null;
    g.boundingBox = geometry.boundingBox?.clone() ?? null;
    return g;
  };

  mesh.geometry = partGeometry(buckets[0]);

  // Lifted plates show their inside faces.
  addAssembly(material, assembledUniform);
  const plateMaterial = material.clone();
  plateMaterial.side = THREE.DoubleSide;
  addAssembly(plateMaterial, assembledUniform);

  const root = new THREE.Group();
  const parts: Part[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= PETALS; i++) {
    const indices = buckets[i + 1];
    if (indices.length === 0) continue;
    const dir = new THREE.Vector3(0, 1, 0);
    const pivot = CENTER.clone();
    if (i > 0) {
      const azimuth = ((i - 0.5) / PETALS) * Math.PI * 2 - Math.PI;
      dir.set(Math.cos(azimuth), 0, Math.sin(azimuth));
      pivot.addScaledVector(dir, RADIUS * 0.95).setY(RIM_Y); // hinge on the rim
    }
    const group = new THREE.Group();
    group.position.copy(pivot);
    const plate = new THREE.Mesh(partGeometry(indices), plateMaterial);
    plate.matrixAutoUpdate = false;
    plate.matrix.makeTranslation(-pivot.x, -pivot.y, -pivot.z).multiply(toRoot);
    group.add(plate);
    root.add(group);
    parts.push({ group, pivot, dir, axis: new THREE.Vector3().crossVectors(up, dir).normalize() });
  }

  const core = createCore();
  root.add(core.group);
  scene.add(root);

  const capMatrix = new THREE.Matrix4();
  const back = new THREE.Matrix4();
  const cap = parts[0];

  return {
    capMatrix,
    update(open, time, assembled) {
      assembledUniform.value = assembled;
      const e = ease(clamp01(open));
      // Cap: lifts and twists, like a lid unscrewing.
      cap.group.position.copy(cap.pivot);
      cap.group.position.y += 0.05 * e;
      cap.group.rotation.y = 0.45 * e;
      cap.group.updateMatrix();
      capMatrix.copy(cap.group.matrix).multiply(back.makeTranslation(-cap.pivot.x, -cap.pivot.y, -cap.pivot.z));

      // Side plates: slide out and hinge open one after another.
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        const ei = ease(clamp01(open * 1.5 - 0.12 * i));
        part.group.position.copy(part.pivot).addScaledVector(part.dir, 0.028 * ei);
        part.group.quaternion.setFromAxisAngle(part.axis, 0.3 * ei);
      }

      // Core: always faintly alive, brighter as it is exposed.
      const pulse = 0.5 + 0.5 * Math.sin(time * 2.1);
      core.cageMaterial.opacity = 0.12 + e * (0.35 + 0.2 * pulse);
      core.ringMaterial.emissiveIntensity = 0.08 + e * 0.5;
      core.emberMaterial.opacity = 0.25 + 0.5 * e * (0.5 + 0.5 * Math.sin(time * 0.9 + 1));
      core.cage.rotation.y = time * 0.15;
      core.ringA.rotation.z = time * 0.6;
      core.ringB.rotation.z = -time * 0.4;
    },
  };
}

/** Cuts the brain dome out of the loaded model (once per model) and returns its controls. */
export function getBrainLayers(scene: THREE.Object3D): BrainLayers {
  let layers = cache.get(scene);
  if (!layers) {
    layers = build(scene);
    cache.set(scene, layers);
  }
  return layers;
}
