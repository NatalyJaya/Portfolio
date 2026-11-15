"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import { createCableRig, type CableRig, type CableSpec } from "./cables";
import { getBrainLayers, type BrainLayers } from "./layers";

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

// Framing for the drop: a low, close hero shot. The camera sits below the chin
// looking up, so the head towers over the frame, the chest runs off the bottom
// and the cables converge overhead.
// Swung ~35° round to the side the face is turned from, for a three-quarter profile.
const CAMERA: [number, number, number] = [0.81, -0.32, 1.16];
const LOOK_AT: [number, number, number] = [0, 0.2, 0];
const FOV = 40;
/** On tall, narrow screens the camera backs off so the shoulders still fit. */
const cameraBackOff = (aspect: number) => (aspect >= 0.7 ? 1 : Math.min(1.85, 0.7 / aspect));

/** The bust is ~1 unit tall and centred on the origin; this is above the frame. */
const START_Y = 2.1;
const START: [number, number, number] = [0, START_Y, 0];
const FALL_S = 0.8;

/** Where the cables hang from: above the frame, and above the bust's start pose. */
const CEILING = 2.9;
const BLACK = "#0c0d10";
const RED = "#7d171c";
// Restrained: a teal trace on two cables and one dim red, not neon.
const GLOW_CYAN = "#2f9aa3";
const GLOW_RED = "#8a1f24";

/**
 * Anchors were measured on the mesh: the first six are the cut ends of the
 * cable stubs already sprouting from the skull (radius ≈ 0.006), so these
 * continue them; the last two plug into the shoulders. Head cables carry the
 * weight (near taut); shoulder cables are heavier and hang a little loose.
 */
const CABLES: CableSpec[] = [
  { anchor: [0.247, 0.487, -0.293], ceiling: [0.36, CEILING, -0.45], radius: 0.007, color: BLACK, slack: 0 },
  { anchor: [0.295, 0.482, -0.262], ceiling: [0.56, CEILING, -0.3], radius: 0.0055, color: RED, slack: 0.0006, glow: GLOW_RED },
  { anchor: [0.179, 0.476, 0.023], ceiling: [0.22, CEILING, 0.05], radius: 0.006, color: BLACK, slack: 0, onCap: true, glow: GLOW_CYAN },
  { anchor: [0.104, 0.483, 0.057], ceiling: [0.05, CEILING, 0.14], radius: 0.007, color: BLACK, slack: 0, onCap: true },
  { anchor: [-0.01, 0.488, 0.059], ceiling: [-0.12, CEILING, 0], radius: 0.007, color: BLACK, slack: 0, onCap: true, glow: GLOW_CYAN },
  { anchor: [-0.088, 0.445, 0.033], ceiling: [-0.34, CEILING, -0.1], radius: 0.006, color: RED, slack: 0.0006, onCap: true },
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

// The exit: the camera rises over the forehead and dives into the open brain.
const BRAIN: [number, number, number] = [-0.01, 0.3, 0.13];
const DIVE_ARC = 0.32;
const DIVE_FOV = 58;
const _from = new THREE.Vector3(...CAMERA);
const _to = new THREE.Vector3(...BRAIN);
const _lookFrom = new THREE.Vector3(...LOOK_AT);
const _look = new THREE.Vector3();
const _lookAtTuple = LOOK_AT;

type SequenceProps = {
  debug: boolean;
  /** The page is ready: leave as soon as the bust has finished assembling. */
  exit: boolean;
  /** The visitor asked to skip: run what is left of the sequence at speed. */
  fast: boolean;
  /** The dive into the head starts. */
  onExitStart?: () => void;
  /** The camera is entering the brain: time to reveal the page underneath. */
  onHandOff?: () => void;
  onDone?: () => void;
};

const _anchor = new THREE.Matrix4();
const _cap = new THREE.Matrix4();

/**
 * The opening beat: the bust drops in from above, the cables catch it, it
 * bounces and settles into a slow sway. One GSAP timeline drives it; later
 * beats (assembly, zoom) extend the same timeline.
 *
 *   world  — camera-shake offset (the cables' ceiling points shake with it)
 *     fall — driven by the timeline
 *       idle — hanging sway, added on top
 */
function Sequence({ debug, exit, fast, onExitStart, onHandOff, onDone }: SequenceProps) {
  const { scene } = useGLTF(CYBORG_URL);
  const world = useRef<THREE.Group>(null);
  const fall = useRef<THREE.Group>(null);
  const idle = useRef<THREE.Group>(null);
  const rig = useRef<CableRig | null>(null);
  const brain = useRef<BrainLayers | null>(null);
  /**
   * Driven by the timeline, read by the frame loop. `caught`: the cables hold
   * the bust; `settled`: it hangs at rest (idle sway on, cables kept in tension).
   */
  const anim = useRef({ caught: 0, settled: 0, shake: 0, open: 0, built: 0, dive: 0, speed: 1, time: 0 });
  const main = useRef<gsap.core.Timeline | null>(null);
  const leaving = useRef<gsap.core.Timeline | null>(null);
  const dived = useRef(false);
  /** What the owner wants, mirrored into refs so the frame loop can read it. */
  const want = useRef({ exit, fast, onExitStart, onHandOff, onDone });
  useEffect(() => {
    want.current = { exit, fast, onExitStart, onHandOff, onDone };
  }, [exit, fast, onExitStart, onHandOff, onDone]);

  useEffect(() => {
    const w = world.current;
    const f = fall.current;
    if (!w || !f) return;
    const a = anim.current;

    // Cuts the brain dome into movable plates (once per loaded model).
    brain.current = getBrainLayers(scene);

    const cables = createCableRig(CABLES);
    w.add(cables.group);
    rig.current = cables;

    const tl = gsap.timeline();
    tl.set(f.position, { y: START_Y }, 0)
      .set(f.rotation, { x: -0.45, y: 0.55, z: 0.2 }, 0)
      .set(a, { caught: 0, settled: 0, shake: 0, open: 0, built: 0, dive: 0 }, 0)
      // Free fall, overshooting the rest pose: the cables stretch before they hold.
      .to(f.position, { y: -0.1, duration: FALL_S, ease: "power1.in" }, 0.3)
      .to(f.rotation, { x: 0.06, y: 0.05, z: -0.05, duration: FALL_S, ease: "power1.in" }, 0.3)
      .addLabel("catch")
      .set(a, { caught: 1, shake: 1 }, "catch")
      .to(a, { shake: 0, duration: 0.45, ease: "power2.out" }, "catch")
      .to(f.position, { y: 0, duration: 1.7, ease: "elastic.out(1, 0.3)" }, "catch")
      .to(f.rotation, { x: 0, y: 0, z: 0, duration: 2, ease: "elastic.out(1, 0.35)" }, "catch")
      .to(a, { settled: 1, duration: 1.5, ease: "sine.inOut" }, "catch+=0.8")
      // Assembling: it lands as a dark silhouette, then cables, muscle and plates switch on in turn.
      .to(a, { built: 1, duration: 3, ease: "none" }, "catch+=0.5")
      // Working: the brain's plates open and close for as long as the page loads.
      .add(
        gsap
          .timeline({ repeat: -1, yoyo: true, repeatDelay: 0.8 })
          .fromTo(a, { open: 0 }, { open: 1, duration: 1.8, ease: "none", immediateRender: false }),
        "catch+=3.6",
      );

    main.current = tl;

    // Debug only: R replays the drop, S toggles slow motion, Z dives into the head.
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "r") {
        leaving.current?.kill();
        leaving.current = null;
        want.current = { ...want.current, exit: false };
        cables.reset();
        tl.restart();
      } else if (key === "z") {
        want.current = { ...want.current, exit: true };
      } else if (key === "s") {
        a.speed = a.speed === 1 ? 0.15 : 1;
        tl.timeScale(a.speed);
      }
    };
    if (debug) window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      tl.kill();
      leaving.current?.kill();
      leaving.current = null;
      main.current = null;
      w.remove(cables.group);
      cables.dispose();
      rig.current = null;
    };
  }, [debug, scene]);

  useFrame((state, delta) => {
    const w = world.current;
    const f = fall.current;
    const i = idle.current;
    const cables = rig.current;
    const layers = brain.current;
    if (!w || !f || !i || !cables || !layers) return;
    const a = anim.current;
    const dt = Math.min(delta, 0.05) * a.speed;
    a.time += dt;
    const t = a.time;

    // Leave once asked to and fully assembled; a skip just gets there faster.
    const tl = main.current;
    if (tl && !leaving.current) {
      if (want.current.fast && a.built < 1) tl.timeScale(4);
      if (want.current.exit && a.built >= 1) {
        tl.pause();
        const pace = want.current.fast ? 0.6 : 1;
        leaving.current = gsap
          .timeline({ onComplete: () => want.current.onDone?.() })
          .call(() => want.current.onExitStart?.(), [], 0)
          .to(a, { open: 1, duration: 0.5 * pace, ease: "power2.out" }, 0)
          .to(a, { dive: 1, duration: 1.5 * pace, ease: "power2.in" }, 0.15 * pace)
          .call(() => want.current.onHandOff?.(), [], 1.05 * pace);
      }
    }
    if (a.dive > 0) {
      dived.current = true;
      const camera = state.camera as THREE.PerspectiveCamera;
      camera.position.lerpVectors(_from, _to, a.dive);
      camera.position.y += Math.sin(a.dive * Math.PI) * DIVE_ARC;
      camera.lookAt(_look.lerpVectors(_lookFrom, _to, Math.min(1, a.dive * 1.6)));
      camera.fov = FOV + (DIVE_FOV - FOV) * a.dive;
      camera.updateProjectionMatrix();
    } else if (dived.current) {
      // Replayed after a dive: put the camera back.
      dived.current = false;
      const camera = state.camera as THREE.PerspectiveCamera;
      camera.position.copy(_from);
      camera.lookAt(_lookFrom);
      camera.fov = FOV;
      camera.updateProjectionMatrix();
    }

    i.rotation.z = Math.sin(t * 0.8) * 0.014 * a.settled;
    i.rotation.x = Math.sin(t * 0.6 + 1.3) * 0.009 * a.settled;
    i.position.y = Math.sin(t * 1.1) * 0.006 * a.settled;

    w.position.set(Math.sin(t * 97) * 0.012 * a.shake, Math.sin(t * 71 + 1.7) * 0.018 * a.shake, 0);

    f.updateMatrix();
    i.updateMatrix();
    layers.update(a.open, t, a.built);
    _anchor.multiplyMatrices(f.matrix, i.matrix);
    cables.update(dt, t, _anchor, _cap.multiplyMatrices(_anchor, layers.capMatrix), a.caught, a.settled);
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

/** Keeps the opening shot framed for the current viewport shape. */
function Framing() {
  const camera = useThree((state) => state.camera);
  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height));
  useEffect(() => {
    const k = cameraBackOff(aspect);
    const moved = camera.position.distanceTo(_from) > 1e-3;
    _from.set(CAMERA[0] * k, CAMERA[1], CAMERA[2] * k);
    if (moved) return; // mid-dive, or the orbit camera has been dragged: leave it
    camera.position.copy(_from);
    camera.lookAt(..._lookAtTuple);
  }, [camera, aspect]);
  return null;
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
  /** Orbit camera plus replay (R), slow-motion (S) and dive (Z) keys. Off in the real intro. */
  debug?: boolean;
} & Partial<Omit<SequenceProps, "debug">>;

export default function CyborgScene({ debug = false, exit = false, fast = false, ...callbacks }: CyborgSceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: CAMERA, fov: FOV, near: 0.01, far: 50 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ camera }) => camera.lookAt(...LOOK_AT)}
    >
      <color attach="background" args={["#07080b"]} />
      <Framing />
      <Suspense fallback={null}>
        <Sequence debug={debug} exit={exit} fast={fast} {...callbacks} />
        <Studio />
      </Suspense>
      <directionalLight position={[2, 3, 4]} intensity={0.8} />
      {debug && <OrbitControls makeDefault enablePan={false} target={LOOK_AT} minDistance={0.3} maxDistance={8} />}
    </Canvas>
  );
}
