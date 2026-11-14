"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";

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

/** Single fused mesh, ~1 unit tall and centred on the origin, facing +Z. */
function Cyborg() {
  const { scene } = useGLTF(CYBORG_URL);
  return <primitive object={scene} />;
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
  /** Free orbit camera for inspecting the model. Off in the real intro. */
  debug?: boolean;
};

export default function CyborgScene({ debug = false }: CyborgSceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 2.4], fov: 35, near: 0.01, far: 50 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#07080b"]} />
      <Suspense fallback={null}>
        <Cyborg />
        <Studio />
      </Suspense>
      <directionalLight position={[2, 3, 4]} intensity={0.8} />
      {debug && <OrbitControls makeDefault enablePan={false} minDistance={0.3} maxDistance={6} />}
    </Canvas>
  );
}
