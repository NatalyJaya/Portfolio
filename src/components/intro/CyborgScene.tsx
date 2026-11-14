"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import { createCableRig, type CableRig, type CableSpec } from "./cables";

/**
 * The site is a static export served under a basePath on GitHub Pages
 * (see next.config.mjs), so every public asset URL has to carry it.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const CYBORG_URL = `${BASE}/models/cyborg.glb`;

// Self-hosted Draco decoder (public/draco) instead of drei's default CDN.
useGLTF.setDecoderPath(`${BASE}/draco/`);
// Start fetching as soon as this chunk loads — the model is ~1 MB.
if (typeof window !== "undefined") useGLTF.preload(CYBORG_URL);

// Framing for the drop: pulled back and looking slightly up, so the bust sits
// in the lower two thirds and the cables have room to run out of the top.
const CAMERA: [number, number, number] = [0, -0.1, 3.3];
const LOOK_AT: [number, number, number] = [0, 0.15, 0];

/** The bust is ~1 unit tall and centred on the origin; this is above the frame. */
const START_Y = 2.1;
const START: [number, number, number] = [0, START_Y, 0];
const FALL_S = 0.8;

/** Where the cables hang from: above the frame, and above the bust's start pose. */
const CEILING = 2.9;
const BLACK = "#0c0d10";
const RED = "#7d171c";

/**
 * Anchors were measured on the mesh: the first six are the cut ends of the
 * cable stubs already sprouting from the skull (radius ≈ 0.006), so these
 * continue them; the last two plug into the shoulders. Head cables carry the
 * weight (near taut); shoulder cables are heavier and hang a little loose.
 */
const CABLES: CableSpec[] = [
  { anchor: [0.247, 0.487, -0.293], ceiling: [0.36, CEILING, -0.45], radius: 0.007, color: BLACK, slack: 0 },
  { anchor: [0.295, 0.482, -0.262], ceiling: [0.56, CEILING, -0.3], radius: 0.0055, color: RED, slack: 0.0006 },
  { anchor: [0.179, 0.476, 0.023], ceiling: [0.22, CEILING, 0.05], radius: 0.006, color: BLACK, slack: 0 },
  { anchor: [0.104, 0.483, 0.057], ceiling: [0.05, CEILING, 0.14], radius: 0.007, color: BLACK, slack: 0 },
  { anchor: [-0.01, 0.488, 0.059], ceiling: [-0.12, CEILING, 0], radius: 0.007, color: BLACK, slack: 0 },
  { anchor: [-0.088, 0.445, 0.033], ceiling: [-0.34, CEILING, -0.1], radius: 0.006, color: RED, slack: 0.0006 },
  {
    anchor: [0.331, -0.05, -0.081],
    ceiling: [0.78, CEILING, -0.2],
    radius: 0.011,
    color: BLACK,
    slack: 0.012,
    exit: [0.55, 0.8, -0.1],
  },
  {
    anchor: [-0.331, -0.135, -0.096],
    ceiling: [-0.72, CEILING, -0.2],
    radius: 0.011,
    color: BLACK,
    slack: 0.012,
    exit: [-0.55, 0.8, -0.1],
  },
];

const _anchor = new THREE.Matrix4();

/**
 * The opening beat: the bust drops in from above, the cables catch it, it
 * bounces and settles into a slow sway. One GSAP timeline drives it; later
 * beats (assembly, zoom) extend the same timeline.
 *
 *   world  — camera-shake offset (the cables' ceiling points shake with it)
 *     fall — driven by the timeline
 *       idle — hanging sway, added on top
 */
function Sequence({ debug }: { debug: boolean }) {
  const { scene } = useGLTF(CYBORG_URL);
  const world = useRef<THREE.Group>(null);
  const fall = useRef<THREE.Group>(null);
  const idle = useRef<THREE.Group>(null);
  const rig = useRef<CableRig | null>(null);
  /**
   * Driven by the timeline, read by the frame loop. `caught`: the cables hold
   * the bust; `settled`: it hangs at rest (idle sway on, cables kept in tension).
   */
  const anim = useRef({ caught: 0, settled: 0, shake: 0, speed: 1, time: 0 });

  useEffect(() => {
    const w = world.current;
    const f = fall.current;
    if (!w || !f) return;
    const a = anim.current;

    const cables = createCableRig(CABLES);
    w.add(cables.group);
    rig.current = cables;

    const tl = gsap.timeline();
    tl.set(f.position, { y: START_Y }, 0)
      .set(f.rotation, { x: -0.45, y: 0.55, z: 0.2 }, 0)
      .set(a, { caught: 0, settled: 0, shake: 0 }, 0)
      // Free fall, overshooting the rest pose: the cables stretch before they hold.
      .to(f.position, { y: -0.1, duration: FALL_S, ease: "power1.in" }, 0.3)
      .to(f.rotation, { x: 0.06, y: 0.05, z: -0.05, duration: FALL_S, ease: "power1.in" }, 0.3)
      .addLabel("catch")
      .set(a, { caught: 1, shake: 1 }, "catch")
      .to(a, { shake: 0, duration: 0.45, ease: "power2.out" }, "catch")
      .to(f.position, { y: 0, duration: 1.7, ease: "elastic.out(1, 0.3)" }, "catch")
      .to(f.rotation, { x: 0, y: 0, z: 0, duration: 2, ease: "elastic.out(1, 0.35)" }, "catch")
      .to(a, { settled: 1, duration: 1.5, ease: "sine.inOut" }, "catch+=0.8");

    // Debug only: R replays the drop, S toggles slow motion.
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "r") {
        cables.reset();
        tl.restart();
      } else if (key === "s") {
        a.speed = a.speed === 1 ? 0.15 : 1;
        tl.timeScale(a.speed);
      }
    };
    if (debug) window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      tl.kill();
      w.remove(cables.group);
      cables.dispose();
      rig.current = null;
    };
  }, [debug]);

  useFrame((_, delta) => {
    const w = world.current;
    const f = fall.current;
    const i = idle.current;
    const cables = rig.current;
    if (!w || !f || !i || !cables) return;
    const a = anim.current;
    const dt = Math.min(delta, 0.05) * a.speed;
    a.time += dt;
    const t = a.time;

    i.rotation.z = Math.sin(t * 0.8) * 0.014 * a.settled;
    i.rotation.x = Math.sin(t * 0.6 + 1.3) * 0.009 * a.settled;
    i.position.y = Math.sin(t * 1.1) * 0.006 * a.settled;

    w.position.set(Math.sin(t * 97) * 0.012 * a.shake, Math.sin(t * 71 + 1.7) * 0.018 * a.shake, 0);

    f.updateMatrix();
    i.updateMatrix();
    cables.update(dt, t, _anchor.multiplyMatrices(f.matrix, i.matrix), a.caught, a.settled);
  });

  return (
    <group ref={world}>
      <group ref={fall} position={START}>
        <group ref={idle}>
          {/* Single fused mesh, facing +Z. */}
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}

/**
 * Procedural studio lighting: the model is PBR (metal/roughness), so it needs
 * something to reflect. Lightformers avoid downloading an HDRI.
 */
function Studio() {
  return (
    <Environment resolution={256}>
      <Lightformer form="rect" intensity={3} position={[0, 3, 3]} scale={[7, 2, 1]} />
      <Lightformer form="rect" intensity={1.2} position={[-4, 0.5, 1]} rotation-y={Math.PI / 2} scale={[4, 3, 1]} />
      {/* Cyan kicker from behind-right, matching the site's accent. */}
      <Lightformer form="rect" color="#6fdde6" intensity={5} position={[4, 0.5, -3]} rotation-y={-Math.PI / 3} scale={[3, 5, 1]} />
      <Lightformer form="circle" color="#ff4d4d" intensity={1.5} position={[-3, -2, -3]} scale={2} />
    </Environment>
  );
}

type CyborgSceneProps = {
  /** Orbit camera plus replay (R) and slow-motion (S) keys. Off in the real intro. */
  debug?: boolean;
};

export default function CyborgScene({ debug = false }: CyborgSceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: CAMERA, fov: 35, near: 0.01, far: 50 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ camera }) => camera.lookAt(...LOOK_AT)}
    >
      <color attach="background" args={["#07080b"]} />
      <Suspense fallback={null}>
        <Sequence debug={debug} />
        <Studio />
      </Suspense>
      <directionalLight position={[2, 3, 4]} intensity={0.8} />
      {debug && <OrbitControls makeDefault enablePan={false} target={LOOK_AT} minDistance={0.3} maxDistance={8} />}
    </Canvas>
  );
}
